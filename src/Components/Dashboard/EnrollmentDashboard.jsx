import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CommonCss/EnrollDashboard.css';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import '../CommonCss/Main.css';
import { strings } from '../../string';

const EnrollmentDashboard = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [employeeDetails, setEmployeeDetails] = useState({});
    const [bankDetails, setBankDetails] = useState(null);
    const [ctcStatus, setCtcStatus] = useState(null); // New state for CTC status
    const [employeeConfig, setEmployeeConfig] = useState(null); // New state for employee config
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const companyId = localStorage.getItem("companyId");
    const pageSize = 10;

    // Debounce function to limit the number of API calls
    const debounce = (func, delay) => {
        let debounceTimer;
        return function (...args) {
            const context = this;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };

    const debounceFetchSearchResults = useCallback(debounce(async (query) => {
        if (query.trim() !== '') {
            await searchEmployeeText(query.trim());
        } else {
            fetchAllEmployees(); // Reset to fetch all employees when search is cleared
        }
    }, 500), []);

    const searchEmployeeText = async (text) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${text}`);
            setFilteredEmployees(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching employee data:', error);
            setError('Error fetching employee data.');
            setFilteredEmployees([]);
        }
    };

    const fetchAllEmployees = async (page = 0, size = 10) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://${strings.localhost}/employees/employees/active?companyId=${companyId}&page=${page}&size=${size}`);
            setFilteredEmployees(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError('Error fetching employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllEmployees(currentPage, pageSize);
    }, [currentPage]);

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
        setError(null);
        debounceFetchSearchResults(event.target.value);
    };

    const togglePopup = (employeeId) => {
        setSelectedEmployeeId(employeeId);
        setIsPopupOpen(!isPopupOpen);
    };

    const fetchBankDetails = async (employeeId) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/BankDetails/getByEmployeeId?employeeId=${employeeId}`);
            if (response.data && response.data.length > 0) {
                setBankDetails(response.data[response.data.length - 1]);
            } else {
                setBankDetails(null);
            }
        } catch (error) {
            setBankDetails(null);
        }
    };

    const fetchCtcStatus = async (employeeId) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/ctcmain/byEmployee/ctcStatusTrue/${employeeId}`);
            console.log('CTC Status Response:', response.data); // Log to check the response structure

            if (response.data && response.data.ctcStatus !== undefined) {
                // Set ctcStatus to the fetched value
                setCtcStatus(response.data.ctcStatus); // ctcStatus is a boolean here
            } else {
                setCtcStatus(null);
            }
        } catch (error) {
            setCtcStatus(null);
            console.error('Error fetching CTC status:', error);
        }
    };


    const fetchEmployeeConfig = async (employeeId) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/employee-config/employee/${employeeId}`);
            if (response.data) {
                setEmployeeConfig(response.data); // Set employee config data
            } else {
                setEmployeeConfig(null);
            }
        } catch (error) {
            setEmployeeConfig(null);
        }
    };


    useEffect(() => {
        if (selectedEmployeeId) {
            fetchBankDetails(selectedEmployeeId);
            fetchCtcStatus(selectedEmployeeId);
            fetchEmployeeConfig(selectedEmployeeId);
        }
    }, [selectedEmployeeId]);
    useEffect(() => {
        console.log('Bank Details:', bankDetails);
        console.log('CTC Status:', ctcStatus);
        console.log('Employee Config:', employeeConfig);
    }, [bankDetails, ctcStatus, employeeConfig]);
    const handleNavigateToUpdateEmp = () => {
        setIsPopupOpen(false);
        navigate(`/UpdateEmp/${selectedEmployeeId}`);
    };

    const handleNavigateToDocuments = () => {
        setIsPopupOpen(false);
        navigate(`/Documents/${selectedEmployeeId}`);
    };

    const handleNavigateToCTC = () => {
        setIsPopupOpen(false);
        navigate(`/CtcGeneration/${selectedEmployeeId}`);
    };

    const handleNavigateToAttendance = () => {
        setIsPopupOpen(false);
        navigate(`/Attendance/${selectedEmployeeId}`);
    };

    const handleEmployeeConfig = () => {
        setIsPopupOpen(false);
        navigate(`/EmployeeConfig/${selectedEmployeeId}`);
    };

    const getStatusClass = (field, additionalCondition) => {
        if (field) {
            return 'enrollmentComplete'; // If data is present, return completed
        }
        return additionalCondition ? 'pending' : 'not-completed'; // Pending if additionalCondition is true, else not-completed
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };


    return (
        <div className='coreContainer' >
            {/* Tiles Section */}
            {/* <div className="tiles-row">
                <div className="tile employees-tile">
                    <FaUser className="tile-icon" />
                    <div className="tile-content">
                        <h3>Employees</h3>
                        <p>120</p>
                    </div>
                </div>
                <div className="tile departments-tile">
                    <FaBuilding className="tile-icon" />
                    <div className="tile-content">
                        <h3>Departments</h3>
                        <p>8</p>
                    </div>
                </div>
                <div className="tile projects-tile">
                    <FaProjectDiagram className="tile-icon" />
                    <div className="tile-content">
                        <h3>Projects</h3>
                        <p>15</p>
                    </div>
                </div>
                <div className="tile attendance-tile">
                    <FaClock className="tile-icon" />
                    <div className="tile-content">
                        <h3>Attendance</h3>
                        <p>95%</p>
                    </div>
                </div>
            </div> */}
            <div className='form-title'>Enrollment Dashboard</div>
            {/* Search Bar */}
            <div className="form-controls">
                <div className="search-bar">
                    <input
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
                    <FaSearch className="search-icon" />
                </div>
            </div>

            {/* Table Section */}
            <table className="interview-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Department</th>
                        <th>Joining Date</th>
                        <th>Employee Type</th>
                        <th>Division</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="8">Loading...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="8">{error}</td>
                        </tr>
                    ) : (
                        filteredEmployees.map((employee) => (
                            <tr key={employee.id}>
                                <td>{employee.id}</td>
                                <td>{`${employee.firstName} ${employee.middleName || ''} ${employee.lastName}`}</td>
                                <td>{employee.designation}</td>
                                <td>{employee.department}</td>
                                <td>{employee.joiningDate}</td>
                                <td>{employee.employeeType}</td>
                                <td>{employee.division}</td>
                                <td>
                                    <button onClick={() => togglePopup(employee.id)} className="view-button">View</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className='form-controls'>
                <button
                    type='button'
                     className='pagination-btn'
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    aria-label='Previous Page'
                >
                  Previous
                </button>
                <span> {currentPage + 1} of {totalPages}</span>
                <button
                    type='button'
                   className='pagination-btn'
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    aria-label='Next Page'
                >
                   Next
                </button>

            </div>

            {/* Popup with Process Status */}
            {isPopupOpen && selectedEmployeeId && (
                <div className="add-popup">
                    <div className="color-legend" >
                        <div className="legend-item">
                            <span className="legend-circle success"></span> <span>Process Completed</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-circle fail"></span> <span>Pending</span>
                        </div>
                    </div>
                    <div className="popup-content">
                        <button className="close-button" onClick={togglePopup}>X</button>
                        <div className="popup-tiles">
                            <button className={getStatusClass(bankDetails)} onClick={handleNavigateToUpdateEmp}>
                                Personal Information/Bank Details
                            </button>
                            <button className={getStatusClass(ctcStatus)} onClick={handleNavigateToCTC}>
                                CTC Breakdown
                            </button>
                            <button className={getStatusClass(employeeConfig)} onClick={handleEmployeeConfig}>
                                Employee Config
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnrollmentDashboard;
