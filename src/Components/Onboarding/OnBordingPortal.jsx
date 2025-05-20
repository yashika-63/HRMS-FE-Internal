import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import '../CommonCss/OnBoardingPortal.css'
import { FaSearch } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes, faFileAlt, faTrashAlt, faEye, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { strings } from '../../string';
const OnBoarding = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [employees, setEmployees] = useState([]);
    const { id } = useParams(); // Get the employee ID from the URL parameters
    const [showFormsPopup, setShowFormsPopup] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); // State to store the selected employee ID
    const [searchQuery, setSearchQuery] = useState('');

    // Function to fetch all employees
    const fetchAllEmployees = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/getAllEmployees`);
            setEmployees(response.data);

        } catch (error) {
            console.error('Error fetching employees:', error);
        }

    };
    // Fetch all employees on component mount
    useEffect(() => {
        fetchAllEmployees();
    }, []);

    // Function to get the name of the employee by ID
    const getEmployeeFirstNameById = (employeeId) => {
        const employee = employees.find(employee => employee.id === employeeId);
        if (employee) {
            const { firstName, middleName, lastName } = employee;
            return `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`;
        }
        return '';
    };
    

    // const handleSearchInputChange = (event) => {
    //     setSearchQuery(event.target.value);
    // };
    // const handleSearch = async () => {
    //     if (searchQuery.trim() !== '') {
    //         await searchEmployees(searchQuery.trim());
    //     }
    // };
    // Function to handle forms button click
    const handleFormsButtonClick = (employeeId) => {
        setSelectedEmployeeId(employeeId); // Set the selected employee ID
        setShowFormsPopup(true);
    };

    // Function to handle close popup
    const handleClosePopup = () => {
        setShowFormsPopup(false);
    };
    // const deleteEmployeeById = async (employeeId) => {
    //     try {
    //         const response = await axios.delete(`http://52.66.137.154:5557/employees/deleteEmployeeById/${employeeId}`);
    //         console.log('Employee deleted:', response.data);
    //         // Refresh employees after delete
    //         fetchAllEmployees();
    //     } catch (error) {
    //         console.error('Error deleting employee by ID:', error);
    //     }
    // };

    const deleteEmployeeById = async (employeeId) => {
        try {
            if (employeeId) {
                const response = await axios.delete(`http://${strings.localhost}/employees/deleteEmployeeById/${employeeId}`);
                fetchAllEmployees();
                setEmployeeToDelete(null);
                setShowConfirmation(false);
                alert('Employee deleted successfully.');

            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Error deleting employee. Please try again later.');

        }
    };

    const handleDelete = (employeeId) => {
        setEmployeeToDelete(employeeId);
        setShowConfirmation(true);
    };

    const editDropdownMenu = (id) => (
        <div  className="dropdown">
            <button type='button' className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <ul className="dropdown-content">
                <li>
                    <button type='button' onClick={() => handleFormsButtonClick(id)}> <FontAwesomeIcon className='ml-2' icon={faFileAlt} />Forms</button>
                </li>
                <li>
                    <Link to={`/View/${id}`} >
                        <button type='button' className='view-btn' > <FontAwesomeIcon icon={faEye} /> View</button>
                    </Link>                </li>
                <li>
                    <button type='button' className="delete-button" onClick={() => handleDelete(id)}> <FontAwesomeIcon className='ml-2' icon={faTrashAlt} />Delete </button>

                </li>
            </ul>
        </div>
    );


    return (
        <div>
            {/* <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "30px", marginTop: "40px" }}>
            <div className='search-bar'>
                    <input
                        type='search-input-field'
                        // placeholder='Search...'
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
                    <FaSearch
                        className='search-icon'
                        onClick={handleSearch}
                    />
                </div>
            </div> */}

            <table className='EP-table' style={{width: "94%"}}>
                <thead>
                    <tr>
                        <th style={{width:"15%"}}>Employee Id</th>
                        <th>Name</th>
                        <th style={{width:"15%"}}>Department</th>
                        <th style={{width:"5%"}}> Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees && employees.map(employee => (
                        <tr key={employee.id}>
                            <td>{employee.id}</td>
                            <td>{getEmployeeFirstNameById(employee.id)}</td>
                            <td>{employee.department}</td>

                            <td>
                                {editDropdownMenu(employee.id)}

                                {/* <button className='forms-btn' onClick={() => handleFormsButtonClick(employee.id)}>
                                    <FontAwesomeIcon icon={faFileAlt} /> Forms
                                </button >
                                <Link to={`/View/${employee.id}`} >
                                    <button className='view-btn' > <FontAwesomeIcon icon={faEye} /> View</button>
                                </Link>

                               
                                 <button className='delete-btn' onClick={() => handleDelete(employee.id)}>
                                    <FontAwesomeIcon icon={faTrashAlt} /> Delete
                                </button> */}
                                {showConfirmation && (
                                    <div className="add-popup" style={{ height: "180px" }}>
                                        <div>Are you sure you want to delete this employee?</div>
                                        <div className="btnContainer">
                                            <button className="btn" onClick={() => deleteEmployeeById(employeeToDelete)}>Yes</button>
                                            <button className='btn' onClick={() => setShowConfirmation(false)}>No</button>
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}

                </tbody>
            </table>

            {showFormsPopup && (
                <div className="add-popup">
                    <div className="popup-inner" >
                        <button onClick={handleClosePopup} style={{ backgroundColor: "white" }} className="EP-close-button">X</button>
                        <h2>Select Form</h2>
                        <Link to={`/ITRecruitment/${selectedEmployeeId}`} >
                            <button className='btn1'>Issue Facility</button>
                        </Link>
                        <Link to={`/ITAsset/${selectedEmployeeId}`} >
                            <button className='btn1'>Assign Asset</button>
                        </Link>
                        <Link to={`/SAPUndertaking/${selectedEmployeeId}`} >
                            <button className='btn1'>SAP Undertaking</button>
                        </Link>
                        <Link to={`/HireChecklist/${selectedEmployeeId}`} >
                            <button className='btn1'>New Hire Checklist</button>
                        </Link>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OnBoarding;







































































// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Link, useParams } from 'react-router-dom';
// import './OnBoardingPortal.css';
// import { FaSearch } from 'react-icons/fa';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTrashAlt, faEye, faEllipsisV, faFileAlt } from '@fortawesome/free-solid-svg-icons';
// import { strings } from '../string';
// import HireChecklist from './HireChecklist';
// import SAPUndertaking from './SAPUndertaking';
// import ITAsset from './ITAsset';
// import ITRecruitment from './ITRecruitment';

// const OnBoarding = () => {
//     const [showConfirmation, setShowConfirmation] = useState(false);
//     const [employeeToDelete, setEmployeeToDelete] = useState(null);
//     const [employees, setEmployees] = useState([]);
//     const { id } = useParams(); 
//     const [searchQuery, setSearchQuery] = useState('');
//     const [activeSection, setActiveSection] = useState(1); 
//     const [activePage, setActivePage] = useState('Checklist'); 
//     const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); 

//     // Function to fetch all employees
//     const fetchAllEmployees = async () => {
//         try {
//             const response = await axios.get(`http://${strings.localhost}/employees/getAllEmployees`);
//             setEmployees(response.data);
//         } catch (error) {
//             console.error('Error fetching employees:', error);
//         }
//     };

//     useEffect(() => {
//         fetchAllEmployees();
//     }, []);

//     const getEmployeeFirstNameById = (employeeId) => {
//         const employee = employees.find((employee) => employee.id === employeeId);
//         return employee ? employee.firstName : '';
//     };

//     const handleFormsButtonClick = (formName, employeeId) => {
//         setActivePage(formName);
//         setSelectedEmployeeId(employeeId);
//     };

//     const deleteEmployeeById = async (employeeId) => {
//         try {
//             if (employeeId) {
//                 const response = await axios.delete(
//                     `http://${strings.localhost}/employees/deleteEmployeeById/${employeeId}`
//                 );
//                 fetchAllEmployees();
//                 setEmployeeToDelete(null);
//                 setShowConfirmation(false);
//                 alert('Employee deleted successfully.');
//             }
//         } catch (error) {
//             console.error('Error deleting employee:', error);
//             alert('Error deleting employee. Please try again later.');
//         }
//     };

//     const handleDelete = (employeeId) => {
//         setEmployeeToDelete(employeeId);
//         setShowConfirmation(true);
//     };

//     const handleSectionClick = (sectionNumber) => {
//         setActiveSection(sectionNumber);
//     };

//     const editDropdownMenu = (id) => (
//         <div className="dropdown">
//             <button className="dots-button">
//                 <FontAwesomeIcon icon={faEllipsisV} />
//             </button>
//             <ul className="dropdown-content">
//                 <li>
//                     <button onClick={() => handleFormsButtonClick('Forms', id)}>
//                         <FontAwesomeIcon className="ml-2" icon={faFileAlt} /> Forms
//                     </button>
//                 </li>
//                 <li>
//                     <Link to={`/View/${id}`}>
//                         <button className="view-btn">
//                             {' '}
//                             <FontAwesomeIcon icon={faEye} /> View
//                         </button>
//                     </Link>
//                 </li>
//                 <li>
//                     <button className="delete-button" onClick={() => handleDelete(id)}>
//                         {' '}
//                         <FontAwesomeIcon className="ml-2" icon={faTrashAlt} /> Delete{' '}
//                     </button>
//                 </li>
//             </ul>
//         </div>
//     );

//     return (
//         <div>
//             <div className="addform2">
//                 <button className={activeSection === 1 ? 'active' : ''} onClick={() => handleSectionClick(1)}>
//                     1. Checklist
//                 </button>
//                 <button className={activeSection === 2 ? 'active' : ''} onClick={() => handleSectionClick(2)}>
//                     2. SAP Undertaking
//                 </button>
//                 <button className={activeSection === 3 ? 'active' : ''} onClick={() => handleSectionClick(3)}>
//                     3. Assign Asset
//                 </button>
//                 <button className={activeSection === 4 ? 'active' : ''} onClick={() => handleSectionClick(4)}>
//                     4. Issue Facility
//                 </button>
//             </div>

//             {activeSection === 1 && (
//                 <div className="page-content">
//                     <HireChecklist />
//                 </div>
//             )}

//             {activeSection === 2 && (
//                 <div className="page-content">
//                     <SAPUndertaking />
//                 </div>
//             )}

//             {activeSection === 3 && (
//                 <div className="page-content">
//                     <ITAsset />
//                 </div>
//             )}

//             {activeSection === 4 && (
//                 <div className="page-content">
//                     <ITRecruitment />
//                 </div>
//             )}

//             <table className="EP-table" style={{ width: '94%' }}>
//                 <thead>
//                     <tr>
//                         <th style={{ width: '15%' }}>Employee Id</th>
//                         <th>Name</th>
//                         <th style={{ width: '15%' }}>Department</th>
//                         <th style={{ width: '5%' }}> Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {employees.map((employee) => (
//                         <tr key={employee.id}>
//                             <td>{employee.id}</td>
//                             <td>{getEmployeeFirstNameById(employee.id)}</td>
//                             <td>{employee.department}</td>
//                             <td>{editDropdownMenu(employee.id)}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             {showConfirmation && (
//                 <div className="add-popup" style={{ height: '180px' }}>
//                     <div>Are you sure you want to delete this employee?</div>
//                     <div className="btnContainer">
//                         <button className="btn" onClick={() => deleteEmployeeById(employeeToDelete)}>
//                             Yes
//                         </button>
//                         <button className="btn" onClick={() => setShowConfirmation(false)}>
//                             No
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {activePage === 'Forms' && selectedEmployeeId && (
//                 <div className="page-content">
//                     <div className="popup">
//                         <div className="popup-inner">
//                             <button
//                                 onClick={() => setSelectedEmployeeId(null)}
//                                 style={{ backgroundColor: 'white' }}
//                                 className="EP-close-button"
//                             >
//                                 X
//                             </button>
//                             <h2>Select Form</h2>
//                             <Link to={`/ITRecruitment/${selectedEmployeeId}`} style={{ marginRight: '10px' }}>
//                                 <button className="btn1">Issue Facility</button>
//                             </Link>
//                             <Link to={`/ITAsset/${selectedEmployeeId}`} style={{ marginRight: '10px' }}>
//                                 <button className="btn1">Assign Asset</button>
//                             </Link>
//                             <Link to={`/SAPUndertaking/${selectedEmployeeId}`} style={{ marginRight: '10px' }}>
//                                 <button className="btn1">SAP Undertaking</button>
//                             </Link>
//                             <Link to={`/HireChecklist/${selectedEmployeeId}`} style={{ marginRight: '10px' }}>
//                                 <button className="btn1">New Hire Checklist</button>
//                             </Link>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default OnBoarding;
