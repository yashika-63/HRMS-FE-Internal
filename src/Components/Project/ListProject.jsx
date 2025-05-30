import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faUserPlus, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { faUserTie, faTasks } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import moment from 'moment';
import { FaSearch } from 'react-icons/fa';
import { strings } from '../../string';
import '../CommonCss/ListProject.css';
import '../CommonCss/Main.css';
import { toast } from 'react-toastify';
import { showToast } from '../../Api.jsx';

const ListProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState({
        employeeId: '',
        projectName: '',
        projectId: '',
        employeeFirstName: '',
        employeeLastName: '',
        firstName: ''
    });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchAllProjects();
    }, []);

    const fetchAllProjects = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // Define headers
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}` // Add the token here
                }
            };

            const response = await axios.get(`http://${strings.localhost}/project/getAllProjects`, config);
            setProjects(response.data.content);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Error fetching projects');
        } finally {
            setLoading(false);
        }
    };


    const fetchEmployeeById = async (employeeId) => {
        try {
            if (employeeId.trim() !== '') {
                const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`);
                const employeeData = response.data;
                setSelectedEmployee((prevEmployee) => ({
                    ...prevEmployee,
                    employeeId: employeeData.id,
                    employeeFirstName: employeeData.firstName,
                    employeeLastName: employeeData.employeeLastName
                }));
            } else {
                setSelectedEmployee((prevEmployee) => ({
                    ...prevEmployee,
                    employeeId: '',
                    employeeFirstName: '',
                }));
            }
        } catch (error) {
            console.error('Error fetching employee data:', error);
            setError('Error fetching employee data.');
        }
    };
    const fetchEmployeeDetails = async (employeeId) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`);
            const employee = response.data;

            // Update form data with fetched employee details
            setSelectedEmployee({
                ...selectedEmployee,
                name: `${employee.firstName} ${employee.middleName || ''} ${employee.lastName}`,
                id: employee.id,
                department: employee.department,
                designation: employee.designation,
                employeeName: `${employee.firstName} ${employee.lastName}`, // Assuming you want full name here
            });

        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };
    const handleEmployeeSelect = async (event) => {
        const { value } = event.target;

        setSelectedEmployee((prevEmployee) => ({
            ...prevEmployee,
            employeeId: value,
        }));

        if (value.trim() !== '') {
            try {
                // Call the API to get the employee details based on the provided ID
                const response = await axios.get(`http://${strings.localhost}/employees/${value}?companyId=${companyId}`);
                const employee = response.data; // Assume the response contains the employee object

                // Update the selected employee state with the fetched data
                setSelectedEmployee((prevEmployee) => ({
                    ...prevEmployee,
                    employeeFirstName: employee.firstName, // Assuming firstName is part of the response
                    // Update any other employee fields you need here
                }));

                setError(null);
            } catch (error) {
                console.error('Error fetching employee details:', error);
                setError('Employee not found.');
                // Optionally reset employee name if not found
                setSelectedEmployee((prevEmployee) => ({
                    ...prevEmployee,
                    employeeFirstName: '', // Resetting employee name if not found
                }));
            }
        } else {
            setSelectedEmployee((prevEmployee) => ({
                ...prevEmployee,
                employeeFirstName: '', // Reset employee name if input is empty
            }));
            setError(null);
        }
    };

    const companyId = localStorage.getItem('companyId');
    const fetchEmployeeIdByNames = async (text) => {
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

    const fetchEmployeeIdByName = async (firstName) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/FindEmployeeByName/${firstName}`);
            const employeeData = response.data.find(emp => emp.firstName.toLowerCase() === firstName.toLowerCase());
            if (employeeData) {
                setSelectedEmployee((prevEmployee) => ({
                    ...prevEmployee,
                    employeeId: employeeData.id,
                    employeeFirstName: employeeData.firstName,
                }));
                setError(null);
            } else {
                setError('Employee not found');
                setSelectedEmployee((prevEmployee) => ({
                    ...prevEmployee,
                    employeeId: '',
                }));
            }
        } catch (error) {
            console.error('Error fetching employee ID:', error);
            setError('Error fetching employee data.');
        }
    };

    const handleEmployeeNameChange = async (event) => {
        const { value } = event.target;

        setSelectedEmployee((prevEmployee) => ({
            ...prevEmployee,
            employeeFirstName: value,
        }));

        if (value.trim() !== '') {
            try {
                // Call the search API
                const response = await axios.get(`http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${value.trim()}`);
                setSearchResults(response.data);
                setError(null);
            } catch (error) {
                console.error('Error searching employee:', error);
                setError('Error searching for employees.');
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
            setError(null);
        }
    };


    const searchProjects = async (query) => {
        try {
            const token = localStorage.getItem('token');
            const companyId = localStorage.getItem('companyId');

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };


            // Make the API request to the new endpoint
            const newApiResponse = await axios.get(
                `http://${strings.localhost}/project/search?companyId=${companyId}&searchTerm=${query}`,
                config // Add headers if needed
            );

            const newApiResults = newApiResponse.data || [];

            // Update state with the search results
            setSearchResults(newApiResults);
        } catch (error) {
            setError('No Match Found');
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
            await searchProjects(query.trim());
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
            await searchProjects(searchQuery.trim());
        }
    };

    const handleUpdate = async (projectId, projectName) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(
                `http://${strings.localhost}/project/getProjectById/${projectId}`,
                config
            );

            const projectData = response.data;

            setSelectedEmployee({
                projectId: projectData.projectId,
                projectName: projectData.projectName,
                employeeId: ''
            });

            setShowAddPopup(true);
        } catch (error) {
            console.error('Error fetching project data:', error);
        }
    };


    const handleEmployeeIdChange = (event) => {
        const { value } = event.target;
        setSelectedEmployee((prevEmployee) => ({
            ...prevEmployee,
            employeeId: value,
        }));
        if (value.trim() !== '') {
            fetchEmployeeById(value.trim());
        } else {
            setSelectedEmployee((prevEmployee) => ({
                ...prevEmployee,
                employeeFirstName: '',
            }));
            setError(null);
        }
    };

    const handleDelete = (projectId) => {
        setProjectToDelete(projectId);
        setShowConfirmation(true);
    };

    const deleteProjectById = async (projectId) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}` // Add the token here
                }
            };
            await axios.delete(
                `http://${strings.localhost}/project/removeAllEmployeesAndDeleteProject/${projectId}`,
                config
            );

            fetchAllProjects(); // Refresh the project list
            setProjectToDelete(null);
            setShowConfirmation(false);
            showToast('Project deleted successfully.', 'success');
        } catch (error) {
            console.error('Error deleting project:', error);
            showToast('Error deleting project. Please try again.', 'error');
        }
    };

    const handleAssign = (projectId) => {
        handleUpdate(projectId);
    };

    const handleMenuClick = (projectId) => {
        setActiveMenu(activeMenu === projectId ? null : projectId);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setActiveMenu(null);
        }
    };

    const handleUpdate1 = async () => {
        try {
            const { employeeId, projectId, projectName } = selectedEmployee;
            const token = localStorage.getItem('token');
            // const config = {
            //     headers: {
            //         'Authorization': `Bearer ${token}`, // Add the token here
            //         'Content-Type': 'application/json' // Specify content type
            //     }
            // };
            await axios.post(
                `http://${strings.localhost}/api/assign-project/${employeeId}/${projectId}`,
                {
                    projectId: selectedEmployee.projectId,
                    projectName: selectedEmployee.projectName,
                    employeeId: selectedEmployee.employeeId,
                }
                // config // Pass the headers here
            );

            showToast('Project assigned successfully.', 'success');
            setShowAddPopup(false);
        } catch (error) {
            console.error('Error assigning project:', error);
            showToast('Error assigning project. Please try again.', 'error');
        }
    };
    const handleSelectEmployee = (employee, projectId) => {

        setSelectedEmployee({
            employeeId: employee.id,
            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName,
            projectId: selectedEmployee.projectId,
            projectName: selectedEmployee.projectName
        });
        setSearchResults([]); // Clear the search results
    };
    const options = searchResults.map((employee) => ({
        value: employee.id, // The ID of the employee
        label: employee.firstName // The name of the employee
    }));

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const formatDate = (date) => {
        return date ? moment(date).format('DD-MM-YYYY') : '';
    };

    const handleEmployeeNameSingleClick = (projectId) => {
        navigate(`/ProjectOverview/${projectId}`);
    };

    const editDropdownMenu = (projectId) => (
        <div className="dropdown">
            <button type='button' className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <Link to={`/update/${projectId}`}>
                        <button type='button' ><FontAwesomeIcon className='ml-2' icon={faEdit} /> Update</button>
                    </Link>
                </div>
                <div>
                    <button type='button' onClick={() => handleAssign(projectId)}> <FontAwesomeIcon className='ml-2' icon={faUserPlus} />Assign</button>
                </div>
                <div>
                    <button type='button' onClick={() => handleDelete(projectId)}> <FontAwesomeIcon className='ml-2' icon={faTrashAlt} />Delete </button>
                </div>
                <div>
                    <Link to={`/ProjectOverview/${projectId}`} >
                        <button type='button'><FontAwesomeIcon className='ml-2' icon={faUserTie} />  Overview</button>
                    </Link>
                </div>
            </div>
        </div>
    );
    const exportToExcel = () => {
        try {
            setLoading(true);
            if (projects.length === 0) {
                setError('No Project data to export.');
                setLoading(false);
                return;
            }

            // Define fields to exclude
            const fieldsToExclude = ['educations', 'companyRegistration', 'generateProjects'];

            // Get the headers dynamically from the first employee object and exclude unwanted fields
            const headers = Object.keys(projects[0]).filter(key => !fieldsToExclude.includes(key));

            // Create the CSV content by adding headers first
            let csvContent = headers.join(",") + "\n";

            // Loop through each employee and create a row for CSV
            projects.forEach(project => {
                const row = headers.map(header => {
                    // For each header (field), extract the corresponding value in employee
                    return `"${project[header] || ''}"`; // Wrap value in quotes in case it contains commas
                }).join(","); // Join the fields into a single string (row)
                csvContent += row + "\n"; // Add the row to the CSV content
            });

            // Create a Blob object from the CSV content
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            // Create a download link and simulate a click to download the file
            const link = document.createElement('a');
            const fileName = 'Project_list.csv'; // Desired file name
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
                        type='search-input-field'
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
                    <FaSearch
                        className='search-icon'
                        onClick={handleSearch}
                    />
                </div>
                <div>
                    <a href='/Project'>
                        <button type='button' className='btn'>Add New</button>
                    </a>
                </div>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p className='error-message'>{error}</p>}
            <table className='interview-table'>
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Project Id</th>
                        <th>Client Name</th>
                        <th>Project Name</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Current Phase</th>
                        <th style={{ width: "5%" }}>Actions</th>
                    </tr>
                </thead>
                <tbody style={{ width: "75%" }}>
                    {(searchResults.length > 0 ? searchResults : projects).length > 0 ? (
                        (searchResults.length > 0 ? searchResults : projects).map((project, index) => (
                            <tr key={project.projectId}>
                                <td>{index + 1}</td>
                                <td>{project.proId}</td>
                                <td>{project.clientName}</td>
                                <td
                                    onClick={() => handleEmployeeNameSingleClick(project.projectId)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    {project.projectName}
                                </td>
                                <td>{formatDate(project.startDate || project.StartDate)}</td>
                                <td>{formatDate(project.endDate)}</td>
                                <td>{project.currentPhase}</td>
                                <td>
                                    {editDropdownMenu(project.projectId)}
                                    {showConfirmation && (
                                        <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
                                            <p>Are you sure you want to delete this project?</p>
                                            <div className='btnContainer'>
                                                <button type='button' className='btn' onClick={() => deleteProjectById(projectToDelete)}>Yes</button>
                                                <button type='button' className='btn' onClick={() => setShowConfirmation(false)}>No</button>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '10px' }}>
                                No project data available.
                            </td>
                        </tr>
                    )}
                </tbody>

            </table>
            {showAddPopup && (
                <div className='add-popup'>
                    <div className='popup-content'>
                        <div className='close-btn' onClick={() => setShowAddPopup(false)}>  ×</div>
                        <div className='popup-fields'>
                            <div className='input-row'>
                                <div>
                                    <label htmlFor='empId'>Employee Id:</label>
                                    <input type='text' name='id' id='empId' value={selectedEmployee.employeeId} onChange={handleEmployeeSelect} />
                                </div>
                                <div>
                                    <label htmlFor='empName'>Employee Name:</label>
                                    <input type='text' name='name' id='empName' value={selectedEmployee.employeeFirstName} onChange={handleEmployeeNameChange} required
                                    />
                                    {error && <div className="toast"><span style={{ color: 'red' }}>{error}</span></div>}
                                    {searchResults.length > 0 && (
                                        <ul className="dropdown2">
                                            {searchResults.map((employee) => (
                                                <li
                                                    key={employee.id}
                                                    onClick={() => handleSelectEmployee(employee)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {`${employee.firstName} ${employee.lastName} `}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className='input-row'>
                                <div>
                                    <label htmlFor='projectName' style={{ marginBottom: '15px' }}>Project Name:</label>
                                    <input className='readonly' type='text' id='projectName' name='projectName' value={selectedEmployee.projectName} readOnly />
                                </div>
                                <div>
                                    <label htmlFor='projectId' style={{ marginBottom: '15px' }}>Project ID:</label>
                                    <input className='readonly' type='text' id='projectId' name='projectId' value={selectedEmployee.projectId} readOnly />
                                </div>
                            </div>
                        </div>
                        <div className='popup-buttons'>
                            <div className='btnContainer'>
                                <button type='button' className='btn' onClick={handleUpdate1}> Assign  </button>
                                <button type='button' className='outline-btn' onClick={() => setShowAddPopup(false)}>  Cancel </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className='form-controls'>
                <button type="button" onClick={exportToExcel} className="btn">  Export to Excel </button>
            </div>
        </div>
    );
};

export default ListProject;
