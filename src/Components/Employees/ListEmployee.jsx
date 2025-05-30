import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faDollarSign  , faEllipsisV, faRegistered, faUserTie,faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import { FaSearch } from 'react-icons/fa';
import TextField from '@mui/material/TextField';
import { strings } from '../../string';
import '../CommonCss/LeaveAppl.css'
import {  toast } from 'react-toastify';
 import { showToast } from '../../Api.jsx';

const ListEmp = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [projects, setProjects] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const companyId = localStorage.getItem("companyId");
 
    const [selectedEmployee, setSelectedEmployee] = useState({
        employeeId: '',
        employeeName: '',
        projectName: '',
        projectId: ''
    });
 
    const fetchAllEmployees = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/byCompany/${companyId}`);
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };
 
    useEffect(() => {
        fetchAllEmployees();
    }, []);
 
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
                employeeName: `${employeeData.firstName} ${employeeData.middleName} ${employeeData.lastName}`,
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
            showToast('Project assigned successfully.','success');
            setShowAddPopup(false);
        } catch (error) {
            console.error('Error assigning project:', error);
            showToast('Error assigning project. Please try again.','error');
        }
    };
 
    const handleDelete = (employeeId) => {
        setEmployeeToDelete(employeeId);
        setShowConfirmation(true);
    };
 
    const deleteEmployeeById = async (employeeId) => {
        try {
            if (employeeId) {
                await axios.delete(`http://${strings.localhost}/employees/deleteEmployeeById/${employeeId}`);
                fetchAllEmployees();
                setEmployeeToDelete(null);
                setShowConfirmation(false);
                showToast('Employee deleted successfully.','success');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            showToast('Error deleting employee. Please try again later.','error');
        }
    };
 
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
                    <Link to={`/UpdateEmp/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faEdit} /> Update</button>
                    </Link>
                </div>
                {/* <li>
                    <button type='button' onClick={() => handleDelete(id)}> <FontAwesomeIcon className='ml-2' icon={faTrashAlt} /> Delete </button>
                </li> */}
                <div>
                    <Link to={`/EmployeeOverview/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faUserTie} /> Overview</button>
                    </Link>
                </div>
                <div>
                    <Link to={`/ViewCTC/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faDollarSign} /> CTC</button>
                    </Link>
                </div>
                <div>
                    <Link to={`/Payslip/${id}`}>
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faFileInvoiceDollar} /> Payslip </button>
                    </Link>
                </div>
            </div>
        </div>
    );
 
    const handleEmployeeNameDoubleClick = (employeeId) => {
        navigate(`/EmployeeOverview/${employeeId}`);
    };
 
 
    // const handlePageChange = (newPage) => {
    //     if (newPage >= 0 && newPage < totalPages) {
    //         setCurrentPage(newPage);
    //     }
    // };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default behavior
            // Optionally handle any specific logic for Enter key here, if needed
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
    return (
        <div className='coreContainer'>
            <div className='middleline-btn'>
                <div className='search-bar'>
                    <input
                        placeholder='Search...'
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        onKeyPress={handleKeyPress}
                    />
                    <FaSearch
                        className='search-icon'
                        onClick={handleSearch}
                        type='button'
                    />
                </div>
            </div>
 
            {/* Loading and Error Messages */}
            {loading && <p>Loading...</p>}
            {error && <p className='error-message'>{error}</p>}
 
            {/* Employee List */}
            <table className='interview-table'>
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
                        ? searchResults.map((employee , index) => (
                            <tr key={employee.id}>
                                <td>{index+1}</td>
                                <td>{employee.employeeId}</td>
                                <td
                                    onClick={() => handleEmployeeNameDoubleClick(employee.id)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    {`${employee.firstName} ${employee.middleName} ${employee.lastName}`}
                                </td>
 
                                <td>{employee.joiningDate}</td>
                                <td>{employee.department}</td>
                                <td>{employee.designation}</td>
                                <td>{editDropdownMenu(employee.id)}</td>
                            </tr>
                        ))
                        : employees.map((employee , index) => (
                            <tr key={employee.id}>
                                <td>{index+1}</td>
                                <td>{employee.employeeId}</td>
                                <td
                                    onClick={() => handleEmployeeNameDoubleClick(employee.id)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    {`${employee.firstName} ${employee.middleName} ${employee.lastName}`}
                                </td>
 
                                <td>{employee.joiningDate}</td>
                                <td>{employee.department}</td>
                                <td>{employee.designation}</td>
                                <td>{editDropdownMenu(employee.id)}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
 
            {/* Pagination Controls */}
            {/* <div className='form-controls'>
                <button
                    className='btn'
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    aria-label='Previous Page'
                >
                    &lt;
                </button>
                <span> {currentPage + 1} of {totalPages}</span>
                <button
                    className='btn'
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    aria-label='Next Page'
                >
                    &gt;
                </button>
            </div> */}
 
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
                                    name='name' id='empName' value={selectedEmployee.employeeName} readOnly />
                            </div>
                        </div>
                        <div className='input-row'>
                            <div>
                                <label htmlFor='projectId'>Project ID:</label>
                                <input type='text' name='projectId' id='projectId' value={selectedEmployee.projectId} onChange={handleProjectIdChange} />
                            </div>
                            <div>
                                <label htmlFor='projectName'>Project Name:</label>
                                <input type='text' name='projectName' id='projectName' value={selectedEmployee.projectName} onChange={handleProjectNameChange} />
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
                        <button type='button' className='btn' onClick={() => deleteEmployeeById(employeeToDelete)}>Yes</button>
                        <button type='button' className='btn' onClick={() => setShowConfirmation(false)}>No</button>
                    </div>
                </div>
            )}
           <div className='form-controls'>
            <button type="button" onClick={exportToExcel} className="btn">  Export to Excel </button>
            </div>
        </div>
    );
};
 
export default ListEmp;