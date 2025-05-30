import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import { strings } from '../../string';

const TrainingList = ({ companyId, dropdownData, dropdownDepartment, handleAddNew, editDropdownMenu }) => {
    const [trainings, setTrainings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ region: '', department: '' });

    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        description: '',
        heading: '',
        regionId: '',
        departmentId: '',
        page: 0,
        size: 10,
        sortBy: 'id',
        direction: 'asc'
    });

    useEffect(() => {
        fetchTrainings();
    }, []);

    useEffect(() => {
        fetchFilteredTrainings();
    }, [filters]);

    const fetchTrainings = async () => {
        try {
            setIsLoading(true);
            const companyIdNum = Number(companyId);
            if (isNaN(companyIdNum)) throw new Error("Invalid companyId");

            const response = await axios.get(
                `http://${strings.localhost}/api/training/active/${companyIdNum}`,
                { headers: { 'Content-Type': 'application/json' } }
            );

            const transformedData = (response.data.content || []).map(item => ({
                id: item.id,
                heading: item.heading || 'No Heading',
                type: item.type === 1 ? "Mandatory" : "Non-Mandatory",
                region: item.region || 'No Region',
                regionId: item.regionId,
                department: item.department,
                date: item.date || item.created_at || new Date().toISOString(),
                status: item.status === 1,
                description: item.description || '',
                question: item.questions || [],
                documents: item.documents || []
            }));

            setTrainings(transformedData);
        } catch (error) {
            console.error('Fetch Error:', error);
            setTrainings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFilteredTrainings = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                ...filters,
                companyId: companyId
            });

            const response = await axios.get(
                `http://${strings.localhost}/api/training/search?${params.toString()}`
            );

            const transformedData = response.data.content.map(item => ({
                id: item.id,
                heading: item.heading || 'No Heading',
                type: item.type === 1 ? "Mandatory" : "Non-Mandatory",
                region: item.region || 'No Region',
                department: item.department || 'No Department',
                date: item.date || item.created_at || new Date().toISOString(),
                status: item.status === 1,
                description: item.description || '',
                question: item.questions || [],
                documents: item.documents || []
            }));

            setTrainings(transformedData);
            setPagination({
                totalItems: response.data.totalElements,
                totalPages: response.data.totalPages,
                currentPage: response.data.number
            });
        } catch (error) {
            console.error('Filter Error:', error);
            setTrainings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchInputChange = (e) => {
        setFilters(prev => ({ ...prev, heading: e.target.value, page: 0 }));
    };

    const handleYearChange = (e) => {
        setFilters(prev => ({ ...prev, year: e.target.value, page: 0 }));
    };

    const handleRegionChange = (e) => {
        const selected = dropdownData.region.find(r => r.data === e.target.value);
        setFilters(prev => ({
            ...prev,
            regionId: selected ? selected.masterId : '',
            page: 0
        }));
        setFormData(prev => ({ ...prev, region: e.target.value }));
    };

    const handleDepartmentChange = (e) => {
        const selected = dropdownDepartment.department.find(r => r.data === e.target.value);
        setFilters(prev => ({
            ...prev,
            departmentId: selected ? selected.masterId : '',
            page: 0
        }));
        setFormData(prev => ({ ...prev, department: e.target.value }));
    };

    const generateYearRange = () => {
        const currentYear = new Date().getFullYear();
        return [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
    };

    return (
        <>
            <div className="filters">
                <div className="search-bar">
                    <input
                        placeholder="Search by heading or ID..."
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
                    {dropdownData.region.length > 0 ? (
                        dropdownData.region.map(option => (
                            <option key={option.masterId} value={option.data}>
                                {option.data}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>No Regions Available</option>
                    )}
                </select>

                <select value={formData.department} onChange={handleDepartmentChange}>
                    <option value="">Departments</option>
                    {dropdownDepartment.department.length > 0 ? (
                        dropdownDepartment.department.map(option => (
                            <option key={option.masterId} value={option.data}>
                                {option.data}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>No Departments Available</option>
                    )}
                </select>

                <button type="button" className="btn" onClick={handleAddNew}>
                    Add New
                </button>
            </div>

            <h3 className="underlineText">List of all active Trainings</h3>

            <div className="table-wrapper">
                <table className="interview-table">
                    <thead>
                        <tr>
                            <th>Heading</th>
                            <th>Type</th>
                            <th>Region</th>
                            <th>Created Date</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th style={{ width: "5%" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7">Loading...</td>
                            </tr>
                        ) : trainings.length > 0 ? (
                            trainings.map(training => (
                                <tr key={training.id}>
                                    <td>{training.heading}</td>
                                    <td>{training.type}</td>
                                    <td>{training.region}</td>
                                    <td>{new Date(training.date).toLocaleDateString()}</td>
                                    <td>{training.department}</td>
                                    <td>
                                        <span className={`training-badge ${training.status ? 'active' : 'inactive'}`}>
                                            {training.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{editDropdownMenu(training)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-results">
                                    No trainings found matching your criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default TrainingList;
