import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaEye, FaFileExcel, FaSearch, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import { strings } from '../../../string.jsx';
import { fetchDataByKey } from '../../../Api.jsx';
import ViewInduction from '../ViewInduction.jsx';

const InductionHR = () => {
    const companyId = localStorage.getItem("companyId");
    const [inductions, setInductions] = useState([]);
    const [filters, setFilters] = useState({ heading: '', region: '', year: '', page: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [selectedInduction, setSelectedInduction] = useState(null);
    const [loadingView, setLoadingView] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [formData, setFormData] = useState({
        heading: '',
        type: 'Safety',
        description: '',
        region: '',
        question: [],
        documents: [],
        regionId: '',
        date: new Date().toISOString()
    });
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 0
    });
    const [dropdownData, setDropdownData] = useState({
        region: []
    });
    const fetchInductions = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`http://${strings.localhost}/api/inductions/search`, { params: filters });
            setInductions(response.data.content);
            setPagination({
                totalItems: response.data.totalElements,
                totalPages: response.data.totalPages,
                currentPage: response.data.number
            });
        } catch (error) {
            toast.error('Failed to load inductions!');
            console.error('Error fetching inductions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/assign-inductions/company/${companyId}`);
            console.log('Assignments API response:', response.data); // Add this
            setAssignments(response.data);
        } catch (error) {
            toast.error('Failed to load induction assignments!');
            console.error('Error fetching assignments:', error);
        }
    };

    const getInductionStatus = (inductionId) => {
        try {
            const assignment = assignments.find(a =>
                a.inductionId == inductionId ||
                a.induction?.id == inductionId ||
                a.inductionID == inductionId
            );

            if (!assignment) return {
                completionStatus: { text: 'N/A' },
                expiryStatus: { text: 'N/A' }
            };

            const isCompleted = assignment.completionStatus === '0x01' ||
                assignment.completionStatus === true ||
                assignment.completed === true;

            const isExpired = assignment.expiryStatus === '0x01' ||
                assignment.expiryStatus === true ||
                assignment.expired === true;

            return {
                completionStatus: {
                    text: isCompleted ? 'Completed' : 'Pending',
                    className: isCompleted ? 'green-text' : 'orange-text'
                },
                expiryStatus: {
                    text: isExpired ? 'Expired' : 'Active',
                    className: isExpired ? 'orange-text' : 'green-text'
                }

            };
        } catch (error) {
            console.error('Error getting induction status:', error);
            return {
                completionStatus: { text: 'Error', className: 'red-text' },
                expiryStatus: { text: 'Error', className: 'red-text' }
            };
        }
    };

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const regions = await fetchDataByKey('region');
                setDropdownData({
                    region: regions
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);

    const exportToExcel = () => {
        const dataForExport = inductions.map((induction, index) => {
            const status = getInductionStatus(induction.id);
            return {
                'Sr.No': index + 1,
                'Heading': induction.heading || 'N/A',
                'Region': induction.region || 'N/A',
                'Created Date': new Date(induction.date).toLocaleDateString(),
                'Completion Status': status.completionStatus.text,
                'Expiry Status': status.expiryStatus.text,
                'Status': induction.status ? "Active" : "Inactive"
            };
        });
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inductions");
        const fileName = `Inductions_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handleSearchInputChange = (event) => {
        setFilters(prev => ({
            ...prev,
            heading: event.target.value,
            page: 0
        }));
    };

    const handleViewClick = async (induction) => {
        setSelectedInduction(induction);
        setShowViewPopup(true);
    };
    const handleClosePopups = () => {
        setShowViewPopup(false);
        setSelectedInduction(null);

    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchInductions();
            fetchAssignments();
        }, 300);
        return () => clearTimeout(debounce);
    }, [filters]);


    const generateYearRange = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 3; i > 0; i--) {
            years.push(currentYear - i);
        }
        years.push(currentYear);
        return years;
    };

    const handleYearChange = (e) => {
        setFilters(prev => ({
            ...prev,
            year: e.target.value,
            page: 0
        }));
    };

    const handleRegionChange = (e) => {
        const selectedRegion = dropdownData.region.find(
            r => r.data === e.target.value
        );

        setFilters(prev => ({
            ...prev,
            regionId: selectedRegion ? selectedRegion.masterId : '',
            page: 0
        }));

        setFormData(prev => ({
            ...prev,
            region: e.target.value,
            regionId: selectedRegion ? selectedRegion.masterId : ''
        }));
    };


    const editDropdownMenu = (induction) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <button className="dropdown-item" onClick={() => handleViewClick(induction)}>
                    <FaEye style={{ marginRight: '8px' }} /> View
                </button>
            </div>
        </div>
    );
    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const PaginationControls = () => (
        <div className="form-controls">
            <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
                className='pagination-btn'
            >
                Previous
            </button>
            <span>
                {pagination.currentPage + 1} of {pagination.totalPages}
            </span>
            <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
                className='pagination-btn'
            >
                Next
            </button>
        </div>
    );

    if (isLoading) return <div>Loading inductions...</div>;

    return (
        <div className='coreContainer'>
            <h3 className='title'>List of all  inductions</h3>
            <div className="filters">
                <div className="search-bar">
                    <input
                        placeholder="Search by heading..."
                        value={filters.heading}
                        onChange={handleSearchInputChange}
                    />
                    <FaSearch className="search-icon" />
                </div>

                <select value={filters.year} onChange={handleYearChange}>
                    <option value="">All Years</option>
                    {generateYearRange().map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <select value={formData.region} onChange={handleRegionChange}>
                    <option value="">All Regions</option>
                    {dropdownData.region && dropdownData.region.length > 0 ? (
                        dropdownData.region.map(option => (
                            <option key={option.masterId} value={option.data}>
                                {option.data}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>Induction Region Not available</option>
                    )}
                </select>

                <button
                    onClick={exportToExcel}
                    className="btn"
                    disabled={inductions.length === 0}
                >
                    <FaFileExcel style={{ marginRight: '8px' }} />
                    Export to Excel
                </button>
            </div>

            <table className='interview-table'>
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Heading</th>
                        <th>Region</th>
                        <th>Created Date</th>
                        <th>Completion Status</th>
                        <th>Expiry Status</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {inductions.length > 0 ? inductions.map((induction, index) => {
                        const status = getInductionStatus(induction.id);
                        return (
                            <tr key={induction.id}>
                                <td>{index + 1}</td>
                                <td>{induction.heading || 'N/A'}</td>
                                <td>{induction.region || 'N/A'}</td>
                                <td>{new Date(induction.date).toLocaleDateString()}</td>
                                <td>
                                    <span className={status.completionStatus.className}>
                                        {status.completionStatus.text}
                                    </span>
                                </td>
                                <td>
                                    <span className={status.expiryStatus.className}>
                                        {status.expiryStatus.text}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-confirmationBadge ${induction.status ? 'confirmed' : 'terminated'}`}>
                                        {induction.status ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td>
                                    {editDropdownMenu(induction)}
                                </td>
                            </tr>
                        );
                    }) : <tr><td className='no-data' colSpan="8">No inductions found.</td></tr>}
                </tbody>

            </table>

            {/* Show popups based on user actions */}
            {showViewPopup && (
                <ViewInduction
                    induction={selectedInduction}
                    onClose={handleClosePopups}
                    loading={loadingView}
                />
            )}
            <PaginationControls />
        </div>
    );
};

export default InductionHR;
