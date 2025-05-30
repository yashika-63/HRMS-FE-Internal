import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faUserPlus, faEllipsisV, faRegistered, faUserTie, faClock, faCalendarDay, faCheckSquare, faCalendarAlt, faLaptop, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { FaSearch } from 'react-icons/fa';
import TextField from '@mui/material/TextField';
import { strings } from '../../string';
import '../CommonCss/ListProject.css'
import { showToast } from '../../Api.jsx';
// import * as XLSX from "xlsx";

import 'react-toastify/dist/ReactToastify.css';
import AssetCreation from '../Asset/AssetCreation.jsx';

const ActiveEmp = () => {

    const [selectedEmployee, setSelectedEmployee] = useState({
        employeeId: '',
        employeeName: '',
        projectName: '',
        projectId: ''
    });
    const [employees, setEmployees] = useState([]);
    const [showAssetPopup, setShowAssetPopup] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const companyId = localStorage.getItem("companyId");

    const fetchAllEmployees = async (page = 0, size = 10) => {
        try {

            setLoading(true);
            const response = await axios.get(`http://${strings.localhost}/employees/employees/active?companyId=${companyId}&page=${page}&size=${size}`, {

            });
            setEmployees(response.data.content);
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
    }, [currentPage, pageSize]);

    const fetchProjectById = async (projectId) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/getProjectById/${projectId}`);
            setSelectedEmployee(prevEmployee => ({
                ...prevEmployee,
                projectName: response.data.projectName,
            }));
        } catch (error) {
            console.error('Error fetching project data:', error);
            setError('Error fetching project data');
        }
    };

    const fetchProjectByName = async (projectName) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/searchProjectsByProjectName/${projectName}`);
            if (response.data.length > 0) {
                const firstProject = response.data[0];
                setSelectedEmployee(prevEmployee => ({
                    ...prevEmployee,
                    projectId: firstProject.projectId,
                }));
            } else {
                setSelectedEmployee(prevEmployee => ({
                    ...prevEmployee,
                    projectId: '',
                }));
            }
        } catch (error) {
            console.error('Error fetching project data:', error);
            setError('Error fetching project data');
        }
    };

    const handleProjectIdChange = (event) => {
        const { value } = event.target;
        setSelectedEmployee(prevEmployee => ({
            ...prevEmployee,
            projectId: value,
        }));
        if (value.trim() !== '') {
            fetchProjectById(value.trim());
        } else {
            setSelectedEmployee(prevEmployee => ({
                ...prevEmployee,
                projectName: '',
            }));
            setError(null);
        }
    };

    const handleProjectNameChange = async (event) => {
        const { value } = event.target;
        setSelectedEmployee(prevEmployee => ({
            ...prevEmployee,
            projectName: value,
        }));
        try {
            if (value.trim() !== '') {
                await fetchProjectByName(value.trim());
            } else {
                setSelectedEmployee(prevEmployee => ({
                    ...prevEmployee,
                    projectId: '',
                }));
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching project data:', error);
            setError('Error fetching project data. Please try again.');
        }
    };

    const searchEmployeeText = async (text) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${text}`);
            setSearchResults(response.data); // Store all matching employees
            setError(null);
        } catch (error) {
            console.error('Error fetching employee data:', error);
            setError('Error fetching employee data.');
            setSearchResults([]); // Clear previous results on error
        }
    };

    const searchEmployees = async (query) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/FindEmployeeByName/${query}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching employees:', error);
            setError('Error searching employees');
        }
    };

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
            setSearchResults([]);
        }
    }, 500), []);

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
        setError(null);
        debounceFetchSearchResults(event.target.value);
    };

    const handleSearch = async () => {
        if (searchQuery.trim() !== '') {
            await searchEmployeeText(searchQuery.trim());
        }
    };

    const handleUpdate = async (id) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${id}`);
            const employeeData = response.data;

            setSelectedEmployee({
                employeeId: employeeData.id,
                employeeName: `${employeeData.firstName} ${employeeData.middleName} ${employeeData.lastName} `,
                projectName: '',
                projectId: '',
            });

            setShowAddPopup(true);
        } catch (error) {
            console.error('Error fetching employee data:', error);
        }
    };

    const handleAssign = (id) => {
        handleUpdate(id);
    };

    const handleAssignProject = async () => {
        try {
            const { employeeId, projectId, projectName } = selectedEmployee;
            await axios.post(`http://${strings.localhost}/api/assign-project/${employeeId}/${projectId}`, {
                projectId,
                projectName,
                employeeId
            });
            showToast('Project assigned successfully.', 'success');
            setShowAddPopup(false);
        } catch (error) {
            console.error('Error assigning project:', error);
            alert('Error assigning project. Please try again.');
        }
    };

    const handleDelete = (employeeId) => {
        setEmployeeToDelete(employeeId);
        setShowConfirmation(true);
    };
    const handleOpenAssetPopup = (id) => {
        setSelectedEmployeeId(id);
        setShowAssetPopup(true);
    };
    const deleteEmployeeById = async (employeeId) => {
        try {
            if (employeeId) {
                await axios.delete(`http://${strings.localhost}/employees/deleteEmployeeById/${employeeId}`);
                fetchAllEmployees(currentPage, pageSize);
                setEmployeeToDelete(null);
                setShowConfirmation(false);
                showToast('Employee deleted successfully.', 'successs');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            showToast('Error deleting employee. Please try again later.', 'error');
        }
    };

    const exportToExcel = () => {
        try {
            setLoading(true);
            if (employees.length === 0) {
                setError('No employees data to export.');
                setLoading(false);
                return;
            }

            // Define fields to exclude
            const fieldsToExclude = ['educations', 'companyRegistration', 'generateProjects'];

            // Get the headers dynamically from the first employee object and exclude unwanted fields
            const headers = Object.keys(employees[0]).filter(key => !fieldsToExclude.includes(key));

            // Create the CSV content by adding headers first
            let csvContent = headers.join(",") + "\n";

            // Loop through each employee and create a row for CSV
            employees.forEach(employee => {
                const row = headers.map(header => {
                    // For each header (field), extract the corresponding value in employee
                    return `"${employee[header] || ''}"`; // Wrap value in quotes in case it contains commas
                }).join(","); // Join the fields into a single string (row)
                csvContent += row + "\n"; // Add the row to the CSV content
            });

            // Create a Blob object from the CSV content
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            // Create a download link and simulate a click to download the file
            const link = document.createElement('a');
            const fileName = 'employees_list.csv'; // Desired file name
            if (navigator.msSaveBlob) { // For IE
                navigator.msSaveBlob(blob, fileName);
            } else {
                link.href = URL.createObjectURL(blob);
                link.target = '_blank';
                link.download = fileName;
                link.click();
            }

            setLoading(false); // Hide loading indicator
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            setError('Error exporting to Excel');
            setLoading(false);
        }
    };

    // const exportToExcel = () => {
    //     try {
    //         setLoading(true); // Show loading indicator

    //         if (employees.length === 0) {
    //             setError('No employees data to export.');
    //             setLoading(false);
    //             return;
    //         }

    //         // Function to flatten the data (to handle nested objects)
    //         const flattenData = (obj, prefix = '') => {
    //             let result = {};

    //             for (let key in obj) {
    //                 if (obj.hasOwnProperty(key)) {
    //                     const propName = prefix ? `${prefix}.${key}` : key;

    //                     if (typeof obj[key] === 'object' && obj[key] !== null) {
    //                         Object.assign(result, flattenData(obj[key], propName)); // Recursively flatten
    //                     } else {
    //                         result[propName] = obj[key];
    //                     }
    //                 }
    //             }
    //             return result;
    //         };

    //         // Convert array of objects into CSV format
    //         const convertToCSV = (data) => {
    //             const keys = Array.from(new Set(data.flatMap(item => Object.keys(item)))); // Get all unique keys
    //             let csvContent = keys.join(",") + "\n"; // Add headers

    //             data.forEach(item => {
    //                 const row = keys.map(key => {
    //                     return `"${item[key] || ''}"`; // Add quotes around values to handle commas
    //                 }).join(",");
    //                 csvContent += row + "\n";
    //             });

    //             return csvContent;
    //         };

    //         // Flatten employee data and then convert to CSV
    //         const flattenedEmployeeData = employees.map(employee => flattenData(employee));
    //         const employeeDataCSV = convertToCSV(flattenedEmployeeData);

    //         // Flatten companyRegistration data
    //         const companyDataCSV = convertToCSV(
    //             employees.map(employee => flattenData(employee.companyRegistration))
    //         );

    //         // Flatten generateProjects data
    //         const projectDataCSV = convertToCSV(
    //             employees.flatMap(employee => 
    //                 employee.generateProjects.map(project => flattenData(project))
    //             )
    //         );

    //         // Combine all CSVs into a single CSV file
    //         const csvContent = [
    //             `Employee Data\n${employeeDataCSV}`,
    //             `Company Registration Data\n${companyDataCSV}`,
    //             `Projects Data\n${projectDataCSV}`
    //         ].join("\n");

    //         // Create a Blob from the CSV content
    //         const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    //         // Create a download link and trigger download
    //         const link = document.createElement('a');
    //         const fileName = 'employees_and_projects.csv'; // CSV extension for proper file format

    //         if (navigator.msSaveBlob) { // For IE
    //             navigator.msSaveBlob(blob, fileName);
    //         } else {
    //             link.href = URL.createObjectURL(blob);
    //             link.target = '_blank';
    //             link.download = fileName;
    //             link.click();
    //         }

    //         setLoading(false); // Hide loading indicator
    //     } catch (error) {
    //         console.error('Error exporting to CSV:', error);
    //         setError('Error exporting to CSV');
    //         setLoading(false);
    //     }
    // };

    const editDropdownMenu = (id) => (
        <div className="dropdown">
            <button type='button' className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <Link to={`/Registration/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faRegistered} /> Register</button>
                    </Link>
                </div>
                <div>
                    <button type="button" onClick={() => handleOpenAssetPopup(id)}>
                        <FontAwesomeIcon className='ml-2' icon={faLaptop} /> Assets
                    </button>
                </div>

                <div>
                    <Link to={`/UpdateEmp/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faEdit} /> Update</button>
                    </Link>
                </div>
                {/* <li>
                    <button type='button' onClick={() => handleDelete(id)}> <FontAwesomeIcon className='ml-2' icon={faTrashAlt} /> Delete </button>
                </li> */}
                <div>
                    <Link to={`/EmployeeOverview/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faUserTie} />  Overview</button>
                    </Link>
                </div>
                <div>
                    <Link to={`/LeaveDashboard/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faCalendarDay} />  Leave Dashboard</button>
                    </Link>
                </div>
                <div>
                    <Link to={`/ConfirmationView/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faCheckSquare} />Confirmation</button>
                    </Link>
                </div>
                <div>
                    <Link to={`/EmployeeInduction/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faCalendarAlt} />  Induction</button>
                    </Link>
                </div>
                <div>
                    <Link to={`/TrainningSetup/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faCalendarDay} />  Training</button>
                    </Link>
                </div>
                <div>
                    <Link to={`/ExpeneseReport/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faMoneyBill} />  Expense Report</button>
                    </Link>
                </div>
            </div>
        </div>
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };


    return (
        <div className='coreContainer' >
            <div className='middleline-btn'>
                <div className='search-bar'>
                    <input
                        placeholder='Search...'
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
                    <FaSearch
                        className='search-icon'
                        onClick={handleSearch}
                    />
                </div>
            </div>

            {/* Loading and Error Messages */}
            {loading && <p>Loading...</p>}
            {error && <p className='error-message'>{error}</p>}

            {/* Employee List */}
            <table className='interview-table' >
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Employee Id</th>
                        <th>Name</th>
                        <th>Joining Date</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {searchResults.length > 0
                        ? searchResults.map((employee, index) => (
                            <tr key={employee.id}>
                                <td>{index + 1}</td>
                                <td>{employee.employeeId}</td>
                                <td>{`${employee.firstName} ${employee.middleName} ${employee.lastName}`}</td>
                                <td>{employee.joiningDate}</td>
                                <td>{employee.department}</td>
                                <td>{employee.designation}</td>
                                <td>{editDropdownMenu(employee.id)}</td>
                            </tr>
                        ))
                        : employees.map((employee, index) => (
                            <tr key={employee.id}>
                                <td>{index + 1}</td>
                                <td>{employee.employeeId}</td>
                                <td>{`${employee.firstName} ${employee.middleName} ${employee.lastName}`}</td>
                                <td>{employee.joiningDate}</td>
                                <td>{employee.department}</td>
                                <td>{employee.designation}</td>
                                <td>{editDropdownMenu(employee.id)}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
            {/* Pagination Controls */}
            <div className='form-controls'>
                {/* <button type='button' onClick={exportToExcel} className="btn">Export to Excel</button> */}

                <button
                    type='button'
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    aria-label='Previous Page'
                     className='pagination-btn'
                >
                   Previous
                </button>
                <span> {currentPage + 1} of {totalPages}</span>
                <button
                    type='button'
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    aria-label='Next Page'
                     className='pagination-btn'
                >
                  Next
                </button>
            </div>


            {/* Add Employee Popup */}
            {showAddPopup && (
                <div className='add-popup'>
                    <div className='close-btn' onClick={() => setShowAddPopup(false)}>
                        ×
                    </div>
                    <div className='popup-fields'>
                        <div className='input-row'>
                            <div>
                                <label htmlFor='empId'>Emp ID:</label>
                                <TextField
                                    type='TextField'
                                    required
                                    label="Read Only"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    name='id'
                                    id='empId'
                                    value={selectedEmployee.employeeId}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor='empName'>Employee Name:</label>
                                <TextField
                                    type='TextField'
                                    required
                                    label="Read Only"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    name='name'
                                    id='empName'
                                    value={selectedEmployee.employeeName}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className='input-row'>
                            <div>
                                <label htmlFor='projectId'>Project ID:</label>
                                <input
                                    type='text'
                                    name='projectId'
                                    id='projectId'
                                    value={selectedEmployee.projectId}
                                    onChange={handleProjectIdChange}
                                />
                            </div>
                            <div>
                                <label htmlFor='projectName'>Project Name:</label>
                                <input
                                    type='text'
                                    name='projectName'
                                    id='projectName'
                                    value={selectedEmployee.projectName}
                                    onChange={handleProjectNameChange}
                                />
                            </div>
                        </div>
                        <div className='btnContainer'>
                            <button className='btn' type='button' onClick={handleAssignProject}>Assign Project</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to delete this employee?</p>
                    <div className='btnContainer'>
                        <button className='btn' onClick={() => deleteEmployeeById(employeeToDelete)}>Yes</button>
                        <button className='btn' onClick={() => setShowConfirmation(false)}>No</button>
                    </div>
                </div>
            )}
            {showAssetPopup && (
                <div>
                    <AssetCreation employeeId={selectedEmployeeId}
                        handleClose={() => setShowAssetPopup(false)}
                    />
                </div>
            )}

            <div className='form-controls'>
                <button type="button" onClick={exportToExcel} className="btn">  Export to Excel </button>
            </div>
        </div>
    );
};

export default ActiveEmp;
