import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faEye, faCheckCircle, faBuilding, faSitemap, faCalendarAlt, faVenus, faMars, faBirthdayCake, faFlag } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../Api.jsx';
import { strings } from '../../string';
import '../CommonCss/organizationalGoal.css';
import CreateJobDescription from '../Recruitment/CreateJobDescription.jsx';

const Team = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);
    const [ViewRequestPopup, setViewRequestPopup] = useState(false);
    const [viewRequestData, setViewRequestData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [responsiblePerson, setResponsiblePerson] = useState(null);
    const [hrPerson, setHrPerson] = useState(null);
    const [searchResultsResponsible, setSearchResultsResponsible] = useState([]);
    const [searchResultsHR, setSearchResultsHR] = useState([]);
    const [error, setError] = useState(null);
    const [responsibleInput, setResponsibleInput] = useState('');
    const [hrInput, setHrInput] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [viewType, setViewType] = useState('card');
    const employeeId = localStorage.getItem('employeeId');
    const companyId = localStorage.getItem('companyId');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://${strings.localhost}/api/employee-config/by-reporting-manager/${employeeId}`)
            .then(response => {
                setEmployees(response.data);
            })
            .catch(error => {
                showToast('There was an error fetching the employees.', 'error');
            });
    }, []);

    const handleEmployeeSearch = async (value, type) => {
        if (value.trim() !== '') {
            try {
                const response = await axios.get(`http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${value.trim()}`);
                if (type === 'responsible') {
                    setSearchResultsResponsible(response.data);
                } else if (type === 'hr') {
                    setSearchResultsHR(response.data);
                }
                setError(null);
            } catch (error) {
                setError('Error searching for employees.');
                if (type === 'responsible') {
                    setSearchResultsResponsible([]);
                } else if (type === 'hr') {
                    setSearchResultsHR([]);
                }
            }
        } else {
            if (type === 'responsible') {
                setSearchResultsResponsible([]);
            } else if (type === 'hr') {
                setSearchResultsHR([]);
            }
            setError(null);
        }
    };

    const handleSelectEmployee = (employee, type) => {
        if (type === 'responsible') {
            setResponsiblePerson(employee);
            setResponsibleInput(`${employee.firstName} ${employee.lastName}`);
            setSearchResultsResponsible([]);
        } else if (type === 'hr') {
            setHrPerson(employee);
            setHrInput(`${employee.firstName} ${employee.lastName}`);
            setSearchResultsHR([]);
        }
    };

    const saveDetails = async () => {
        if (selectedEmployee && responsiblePerson && hrPerson) {
            setLoading(true);
            const companyId = localStorage.getItem('companyId');
            const requestbody = {
                status: true
            };

            try {
                await axios.post(
                    `http://${strings.localhost}/api/confirmation/save?employeeId=${selectedEmployee.id}&responsiblePersonId=${responsiblePerson.id}&hrId=${hrPerson.id}&companyId=${companyId}`,
                    requestbody
                );

                showToast("Saved successfully", "success");
                setIsConfirmationPopupOpen(false);
            } catch (error) {
                const errorMessage =
                    error.response?.data?.details ||
                    error.response?.data ||
                    error.message ||
                    "Error while saving";

                showToast(errorMessage, "error");
            } finally {
                setLoading(false);
            }
        } else {
            showToast("Please select all fields", "error");
        }
    };



    const openViewPopup = (employee) => {
        setSelectedEmployee(employee);
        setIsViewPopupOpen(true);
    };

    const openConfirmationPopup = (employee) => {
        setSelectedEmployee(employee);
        setIsConfirmationPopupOpen(true);
    };

    const closeViewPopup = () => {
        setIsViewPopupOpen(false);
        setSelectedEmployee(null);
    };

    const closeConfirmationPopup = () => {
        setIsConfirmationPopupOpen(false);
        setSelectedEmployee(null);
        setResponsiblePerson(null);
        setHrPerson(null);
        setResponsibleInput('');
        setHrInput('');
        setSearchResultsResponsible([]);
        setSearchResultsHR([]);
    };
    const handleOpenPopup = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleViewRequestPopup = async () => {
        setViewRequestPopup(true);
        setIsLoading(true);

        try {
            const response = await axios.get(`http://${strings.localhost}/api/jobdescription/getByCompanyAndEmployee/${companyId}/${employeeId}`);
            setViewRequestData(response.data || []);
        } catch (error) {
            console.error("Failed to fetch job descriptions:", error);
            showToast("Failed to load request data.", "error");
        } finally {
            setIsLoading(false);
        }
    };


    const handleCloseViewRequestPopup = () => {
        setViewRequestPopup(false);
    };

    const getColorForInitial = (initial) => {
        const colors = [
            '#5b6fdd', '#e57373', '#81c784', '#64b5f6', '#ffd54f',
            '#ba68c8', '#4db6ac', '#ff8a65', '#7986cb', '#f06292',
            '#4dd0e1', '#aed581', '#ffb74d', '#a1887f', '#9575cd'
        ];

        const normalizedValue = (initial.toUpperCase().charCodeAt(0) - 65) % colors.length;
        return colors[Math.abs(normalizedValue)];
    };

    const editDropdownMenu = (employee) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button onClick={() => openViewPopup(employee)}>
                        <FontAwesomeIcon className="ml-2" icon={faEye} />  View
                    </button>
                </div>
                <div>
                    <button onClick={() => openConfirmationPopup(employee)}>
                        <FontAwesomeIcon className="ml-2" icon={faCheckCircle} /> Confirmation
                    </button>
                </div>
            </div>
        </div>
    );
    const handleToggleChange = () => {
        setViewType(prev => (prev === 'card' ? 'table' : 'card'));
    };

    return (
        <div className='coreContainer'>
            <div className='form-title'>Team Members</div>
         
            <div className="toggle">
                <label className="switch">
                    <input type="checkbox" checked={viewType === 'table'} onChange={handleToggleChange} />
                    <span className="slider"></span>
                </label>
                <span className="view-label">{viewType === 'table' ? 'Table View' : 'Card View'}</span>
            </div>
            {viewType === 'card' ? (
                <div className="card-grid">
                    {employees.length > 0 ? (
                        employees.map(employee => (
                            <div key={employee.employee.id} className="team-card">
                                <div className="card-header">
                                    <div
                                        className="avatar"
                                        style={{ backgroundColor: getColorForInitial(employee.employee.firstName[0]) }}
                                    >
                                        {employee.employee.firstName[0]}
                                    </div>
                                    <div className="card-header-info">
                                        <h4>{`${employee.employee.firstName} ${employee.employee.lastName}`}</h4>
                                        <p>{employee.employee.designation}</p>
                                    </div>
                                    <div className='top-header'>
                                        {editDropdownMenu(employee.employee)}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <p>Department: {employee.employee.department}</p>
                                    <p>Division: {employee.employee.division}</p>
                                    <p>Joining Date: {employee.employee.joiningDate}</p>
                                    <p>Gender: {employee.employee.gender}</p>
                                    <p>Age: {employee.employee.age}</p>
                                    <p>Nationality: {employee.employee.nationality}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="errorMessage">No team members found.</div>
                    )}
                </div>
            ) : (
                <div className="table-view">
                    <table className="interview-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Designation</th>
                                <th>Department</th>
                                <th>Division</th>
                                <th>Joining Date</th>
                                <th>Gender</th>
                                <th>Age</th>
                                <th>Nationality</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length > 0 ? (
                                employees.map(employee => (
                                    <tr key={employee.employee.id}>
                                        <td>{`${employee.employee.firstName} ${employee.employee.lastName}`}</td>
                                        <td>{employee.employee.designation}</td>
                                        <td>{employee.employee.department}</td>
                                        <td>{employee.employee.division}</td>
                                        <td>{employee.employee.joiningDate}</td>
                                        <td>{employee.employee.gender}</td>
                                        <td>{employee.employee.age}</td>
                                        <td>{employee.employee.nationality}</td>
                                        <td>{editDropdownMenu(employee.employee)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9">No team members found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {isViewPopupOpen && selectedEmployee && (
                <div className="add-popup">
                    <div className="popup-content">
                        <div className='underlineText'>Employee Details</div>
                        <div className="popup-tiles">
                            <div onClick={() => navigate(`/EmployeeSetup/${selectedEmployee.id}`)} className="popup-tile">
                                <h5>Employee Setup</h5>
                            </div>
                            <div onClick={() => navigate(`/ManagerView/${selectedEmployee.id}`)} className="popup-tile">
                                <h5>Goal & KPI view</h5>
                            </div>
                            <div onClick={() => navigate(`/FeedbackSetup/${selectedEmployee.id}`)} className="popup-tile">
                                <h5>Feedback</h5>
                            </div>
                            <div onClick={() => navigate(`/EmployeePerformance/${selectedEmployee.id}`)} className="popup-tile">
                                <h5>Employee Performance</h5>
                            </div>
                        </div>
                        <div className='form-controls'>
                            <button type='button' className='outline-btn' onClick={closeViewPopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {isConfirmationPopupOpen && selectedEmployee && (
                <div className="add-popup">
                    <div>
                        <div className="centerText">Employee Confirmation</div>
                        <div className="confirmationDetailsGrid">
                            <div className="confirmationcolumn">
                                <div className="confirmationdetail-item">
                                    <FontAwesomeIcon icon={faBuilding} className="confirmationdetail-icon" />
                                    <label>Department:</label>
                                    <span>{selectedEmployee.department}</span>
                                </div>
                                <div className="confirmationdetail-item">
                                    <FontAwesomeIcon icon={faSitemap} className="confirmationdetail-icon" />
                                    <label>Division:</label>
                                    <span>{selectedEmployee.division}</span>
                                </div>
                                <div className="confirmationdetail-item">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="confirmationdetail-icon" />
                                    <label>Joining Date:</label>
                                    <span>{selectedEmployee.joiningDate}</span>
                                </div>
                            </div>
                            <div className="confirmationcolumn">
                                <div className="confirmationdetail-item">
                                    <FontAwesomeIcon icon={selectedEmployee.gender === 'Male' ? faMars : faVenus} className="confirmationdetail-icon" />
                                    <label>Gender:</label>
                                    <span>{selectedEmployee.gender}</span>
                                </div>
                                <div className="confirmationdetail-item">
                                    <FontAwesomeIcon icon={faBirthdayCake} className="confirmationdetail-icon" />
                                    <label>Age:</label>
                                    <span>{selectedEmployee.age}</span>
                                </div>
                                <div className="confirmationdetail-item">
                                    <FontAwesomeIcon icon={faFlag} className="confirmationdetail-icon" />
                                    <label>Nationality:</label>
                                    <span>{selectedEmployee.nationality}</span>
                                </div>
                            </div>
                        </div>

                        {/* <hr /> */}

                        <div>
                            <span className="required-marker">*</span>
                            <label htmlFor="responsiblePerson">Responsible Person:</label>
                            <div className='input-row'>
                                <input
                                    type="text"
                                    id="responsiblePerson"
                                    name='responsiblePerson'
                                    value={responsibleInput}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setResponsibleInput(value);
                                        setResponsiblePerson(null); // optional: clear selected
                                        handleEmployeeSearch(value, 'responsible');
                                    }}
                                />
                            </div>
                            {error && <div className="toast"><span style={{ color: 'red' }}>{error}</span></div>}
                            {searchResultsResponsible.length > 0 && (
                                <ul className="dropdown1">
                                    {searchResultsResponsible.map((employee) => (
                                        <li key={employee.id} onClick={() => handleSelectEmployee(employee, 'responsible')}>
                                            {`${employee.firstName} ${employee.lastName}`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <span className="required-marker">*</span>
                            <label htmlFor="hrPerson">HR Person:</label>
                            <div>

                                <input
                                    type="text"
                                    id="hrPerson"
                                    value={hrInput}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setHrInput(value);
                                        setHrPerson(null);
                                        handleEmployeeSearch(value, 'hr');
                                    }}
                                />
                            </div>
                            {error && <div className="toast"><span style={{ color: 'red' }}>{error}</span></div>}
                            {searchResultsHR.length > 0 && (
                                <ul className="dropdown1">
                                    {searchResultsHR.map((employee) => (
                                        <li key={employee.id} onClick={() => handleSelectEmployee(employee, 'hr')}>
                                            {`${employee.firstName} ${employee.lastName}`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="btnContainer">
                            <button
                                type="button"
                                className="btn"
                                onClick={saveDetails}
                                disabled={loading}
                            >
                                {loading && <div className="loading-spinner"></div>}
                                {loading ? "Saving..." : "Save"}
                            </button>

                            <button type="button" className="outline-btn" onClick={closeConfirmationPopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}
          

        </div>
    );
};

export default Team;