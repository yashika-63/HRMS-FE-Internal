import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaEye, FaSearch, FaUserPlus } from 'react-icons/fa';
import EditInduction from './AddNewInduction';
import ViewInduction from './ViewInduction';
import AssignInduction from './AssignInduction';
<<<<<<< HEAD
import { toast } from 'react-toastify';
=======
import { toast } from 'react-toastify'; // assuming you want to use toast for error handling
>>>>>>> 8a5f66f (merging code)
import { strings } from '../../string';
import { fetchDataByKey } from '../../Api.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import AddNewInduction from './AddNewInduction';
import UpdateInduction from './UpdateInduction';

const InductionList = () => {
    const [inductions, setInductions] = useState([]);
    const [filters, setFilters] = useState({ heading: '', region: '', year: '', page: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [showAssignPopup, setShowAssignPopup] = useState(false);
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [selectedInduction, setSelectedInduction] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [loadingView, setLoadingView] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isEditMode, setIsEditMode] = useState(false);
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

    const fetchInductionDetails = async (inductionId) => {
        try {
            const questionsResponse = await axios.get(`http://${strings.localhost}/api/inductionsACK/inductionID/${inductionId}`);
            const documentsResponse = await axios.get(`http://${strings.localhost}/documents/Inducton/${inductionId}`);
            return {
                questions: questionsResponse.data || [],
                documents: documentsResponse.data || []
            };
        } catch (error) {
            console.error('Error fetching induction details:', error);
            toast.error('Failed to load induction details!');
            throw error;
        }
    };

    const handleSearchInputChange = (event) => {
        setFilters(prev => ({
            ...prev,
            heading: event.target.value,
            page: 0
        }));
    };



    const handleAssignClick = (induction) => {
        setSelectedInduction(induction);
        setShowAssignPopup(true);
    };
    const handleViewClick = async (induction) => {
        setSelectedInduction(induction);
        setShowViewPopup(true);
    };
    const handleClosePopups = () => {
        setShowEditPopup(false);
        setShowUpdatePopup(false);
        setShowViewPopup(false);
        setShowAssignPopup(false);
        setSelectedInduction(null);

    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchInductions();
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

    const handleAddNew = () => {
        setShowEditPopup(true);
        setCurrentStep(1);
        setIsEditMode(false);

        setFormData({
            heading: '',
            type: '',
            description: '',
            region: '',
            question: [],
            documents: [],
            date: new Date().toISOString()
        });
    };

    const handleUpdateClick = async (induction) => {
        setSelectedInduction(induction);
        setShowUpdatePopup(true);
    };


    const editDropdownMenu = (induction) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <button className="dropdown-item" onClick={() => handleUpdateClick(induction)}>
                    <FaEdit style={{ marginRight: '8px' }} /> Update
                </button>
                <button className="dropdown-item" onClick={() => handleAssignClick(induction)}>
                    <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '8px' }} /> Assign
                </button>
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
            <h3 className='title'>List of all active inductions</h3>
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

                <button type='button' className='btn' onClick={handleAddNew}>Add New</button>
            </div>

            <table className='interview-table'>
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Heading</th>
                        <th>Region</th>
                        <th>Created Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {inductions.length > 0 ? inductions.map((induction, index) => (
                        <tr key={induction.id}>
                            <td>{index + 1}</td>
                            <td>{induction.heading || 'N/A'}</td>
                            <td>{induction.region || 'N/A'}</td>
                            <td>{new Date(induction.date).toLocaleDateString()}</td>
                            <td>
                                <span className={`status-confirmationBadge ${induction.status ? 'confirmed' : 'terminated'}`}>
                                    {induction.status ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td>
                                {editDropdownMenu(induction)}
                            </td>
                        </tr>
                    )) : <tr><td className='no-data' colSpan="5">No inductions found.</td></tr>}
                </tbody>
            </table>

            {/* Show popups based on user actions */}
            {showEditPopup && (
                <AddNewInduction
                    induction={selectedInduction}
                    onClose={handleClosePopups}
                    loading={loadingEdit}
                />
            )}
            {showViewPopup && (
                <ViewInduction
                    induction={selectedInduction}
                    onClose={handleClosePopups}
                    loading={loadingView}
                />
            )}
            {showAssignPopup && (
                <AssignInduction
                    induction={selectedInduction}
                    employee={setSelectedEmployee}
                    onClose={handleClosePopups}
                />
            )}
            {showUpdatePopup && (
                <UpdateInduction
                    induction={selectedInduction}
                    employee={setSelectedEmployee}
                    onClose={handleClosePopups}
                />
            )}
            <PaginationControls />
        </div>
    );
};

export default InductionList;
