import React, { useEffect, useState, useRef } from 'react';
import { FaBars, FaUserAlt, FaChartBar, FaUpload, FaClock, FaFolderOpen, FaTasks, FaCalendarDay, FaComments, FaReceipt, FaChartLine, FaUserCircle, FaTimes, FaBullseye, FaRegCalendarCheck, FaUserCheck, FaClipboardList, FaDollarSign, FaCcAmazonPay, FaPlayCircle, FaUserFriends, FaGraduationCap, FaChalkboardTeacher, FaSearch, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { strings } from '../string';
import './CommonCss/Sidebar.css';

const Sidebar = ({ children, toggleTheme, isDarkTheme }) => {
    const [isOpen, setIsOpen] = useState(false);

    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const [role, setRole] = useState(null);
    const [employeeId, setEmployeeId] = useState(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [employeeData, setEmployeeData] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
    const [pendingExpenseCount, setPendingExpenseCount] = useState(0);
    const [pendingAllRequest, setPendingAllRequest] = useState(0);
    const [pendingExpenseRequest, setPendingExpenseRequest] = useState(0);
    const [combinedRequestCount, setCombinedRequestCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);
    const navigate = useNavigate();
    const firstName = localStorage.getItem("firstName");
    const companyId = localStorage.getItem("companyId");
    const employeeid = localStorage.getItem("employeeId");
    const division = localStorage.getItem("division");
    const department = localStorage.getItem("department");
    const companyRole = localStorage.getItem("companyRole");
    const modalRef = useRef(null);
    const location = useLocation();

    const toggleShowMore = () => {
        setIsExpanded(!isExpanded);
        setItemsPerPage(isExpanded ? 12 : menuItem.length);
    };

    const fetchEmployeeDetails = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeid}`);
            const employee = response.data;
            setEmployeeData({
                name: `${employee.firstName} ${employee.lastName}`,
                department: employee.department,
                designation: employee.designation,
                employeeId: employee.employeeId,
                contactNo: employee.contactNo,
                email: employee.email,
                gender: employee.gender,
                industry: employee.industry
            });
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };
    const fetchProfilePhoto = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://${strings.localhost}/api/DocumentProfile/view/active?employeeId=${employeeid}`, {
                responseType: 'blob',
            });
            const reader = new FileReader();
            reader.onloadend = function () {
                const base64data = reader.result;
                setPhoto(base64data);
                localStorage.setItem("profilePhoto", base64data);
            };
            reader.readAsDataURL(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile photo:', error);
            setLoading(false);
        }
    };
    useEffect(() => {
        const cachedPhoto = localStorage.getItem("profilePhoto");
        if (cachedPhoto) {
            setPhoto(cachedPhoto);
        }
    }, []);


    useEffect(() => {
        const userRole = localStorage.getItem("Role");
        setRole(userRole);
        const storedEmployeeId = localStorage.getItem("employeeId");
        setEmployeeId(storedEmployeeId);

    }, []);
    useEffect(() => {
        if (employeeid) {
            fetchProfilePhoto();
        }
    }, [employeeid]);

    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            setProfileModalOpen(false);
        }
    };
    // const handleClickOutsideSidebar = (e) => {
    //     if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
    //         setIsOpen(false);
    //     }
    // };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // useEffect(() => {
    //     document.addEventListener('mousedown', handleClickOutsideSidebar);
    //         return () => {
    //         document.removeEventListener('mousedown', handleClickOutsideSidebar);
    //     };
    // }, []);


    const handleLogout = () => {
        localStorage.clear();
        navigate('/Login', { replace: true });
        window.location.reload();
    };

    const toggleSubMenu = (name) => {
        setActiveSubMenu(activeSubMenu === name ? null : name);
    };

    // Fetch counts for pending leave, expense, and all requests
    useEffect(() => {
        const fetchPendingLeaveCount = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/leaveApplications/pending/count/${companyId}/${employeeid}`);
                if (response.data) {
                    setPendingLeaveCount(response.data);
                }
            } catch (error) {
                console.error('Error fetching pending leave count:', error);
            }
        };
        fetchPendingLeaveCount();
    }, [employeeId, companyId]);

    useEffect(() => {
        const fetchPendingExpenseCount = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/expense/pending/count/${companyId}/${employeeid}`);
                if (response.data) {
                    setPendingExpenseCount(response.data);
                }
            } catch (error) {
                console.error('Error fetching pending expense count:', error);
            }
        };
        fetchPendingExpenseCount();
    }, [employeeId, companyId]);

    useEffect(() => {
        const fetchPendingAllRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                const api1 = `http://${strings.localhost}/api/leaveApplications/GetPendingRequestCount/${companyId}/${division}/${department}/${companyRole}`;
                const api2 = `http://${strings.localhost}/api/expense/GetPendingRequestCount/${companyId}/${division}/${department}/${companyRole}`;

                const [response1, response2] = await Promise.all([
                    axios.get(api1, { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get(api2, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const pendingAll = response1.data || 0;
                const pendingExpense = response2.data || 0;
                setPendingAllRequest(pendingAll);
                setPendingExpenseRequest(pendingExpense);
                setCombinedRequestCount(pendingAll + pendingExpense);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchPendingAllRequests();
    }, [companyId, division, department, companyRole]);

    // Handle profile icon click
    const handleProfileIconClick = () => {
        fetchEmployeeDetails();
        fetchProfilePhoto();
        setProfileModalOpen(!profileModalOpen);

    };

    const handleFileSelection = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setShowModal(true);
        }
    };
    const handleFileUpload = async () => {
        if (!selectedFile) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await axios.post(`http://${strings.localhost}/api/DocumentProfile/${employeeid}/uploadNew`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const reader = new FileReader();
            reader.onloadend = function () {
                const base64data = reader.result;
                setPhoto(base64data);
                localStorage.setItem("profilePhoto", base64data);
            };
            reader.readAsDataURL(selectedFile);

            setShowModal(false);
            setLoading(false);
        } catch (error) {
            console.error('Error uploading image:', error);
            setLoading(false);
        }
    };

    // Handle cancel (discard file)
    const handleCancelUpload = () => {
        setShowModal(false);
        setSelectedFile(null);
    };
    const isSubItemActive = (subItemPath) => useNavigate.pathname === subItemPath;

    {/* <img src="SidebarImages/ORG DATA.png" alt="Organizational Data" style={{ width: '18px', height: '18px' }} */ }

    const menuItem = [
        {

<<<<<<< HEAD
            icon: <img src="/SidebarImages/ORG DATA.png" alt="Organizational Data" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/ORG DATA.png" alt="Organizational Data" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: "/AddEmp",
            name: "Organizational Data",
            roles: ["ADMIN", "SUPERADMIN"],
            subItems: [
                { path: "/AddEmp", name: "Employee Data" },
                { path: "/Project", name: "Project Data" }

            ]
        },

        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/timesheet.png" alt="Timesheet" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/timesheet.png" alt="Timesheet" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: "/TimeSheetSetup",
            name: "Timesheet",
            roles: ["ADMIN", "USER", "SUPERADMIN"],
            subItems: [
                { path: "/TimeSheetSetup", name: "Time-Sheet", roles: ["ADMIN", "USER", "SUPERADMIN"] },
                { path: "/AdminViewTimesheet", name: "View Timesheet", roles: ["ADMIN", "SUPERADMIN"] }

            ]
        },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/company config.png" alt="Company Configuration" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/company config.png" alt="Company Configuration" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: "/CompanyConfiguration",
            name: "Company Configuration",
            roles: ["ADMIN", "SUPERADMIN"]
        },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/master data.png" alt="Master Data" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/master data.png" alt="Master Data" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: "/Masterpage",
            name: "Master Data",
            roles: ["ADMIN", "SUPERADMIN"]
        },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/workflow.png" alt="Workflow" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/workflow.png" alt="Workflow" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: "/CreateWorkflow",
            name: "Workflow",
            roles: ["ADMIN", "SUPERADMIN"]
        },
        // { icon: <FaClock />, path: "/TimeSheetDashboard", name: "Time-Sheet", roles: ["ADMIN", "USER"] },
        // { icon: <FaTable />, path: `/AdminViewTimesheet`, name: "View Timesheet", roles: ["ADMIN"] },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/leave dashboard.png" alt="Leave Dashboard" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/leave dashboard.png" alt="Leave Dashboard" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: "/LeaveDashboard",
            name: "Leave Dashboard",
            roles: ["ADMIN", "USER", "SUPERADMIN"],
            badge: pendingLeaveCount > 0 ? pendingLeaveCount : null
        },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/Req approval.png" alt="Approval Request" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/Req approval.png" alt="Approval Request" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: "/RequestHandler",
            name: "Approval Request",
            roles: ["ADMIN", "USER", "SUPERADMIN"],
            badge: combinedRequestCount > 0 ? combinedRequestCount : null
        },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/expense managment.png" alt="Expense Managment" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/expense managment.png" alt="Expense Managment" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: "/ExpenseMan",
            name: "Expense management ",
            roles: ["ADMIN", "USER", "SUPERADMIN"],
            badge: pendingExpenseCount > 0 ? pendingExpenseCount : null
        },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/enrollment.png" alt="Enrollment" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/enrollment.png" alt="Enrollment" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: `/EnrollmentDashboard`,
            name: "Enrollment", roles: ["ADMIN", "SUPERADMIN"]
        },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/work hour.png" alt="Attendance" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/work hour.png" alt="Attendance" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: `/Attendance`,
            name: "Working Hours",
            roles: ["ADMIN", "SUPERADMIN"]
        },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/payroll.png" alt="Payroll Data" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/payroll.png" alt="Payroll Data" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: "/PayrollTransactionScreen",
            name: "Payroll Transactions",
            roles: ["ADMIN", "SUPERADMIN"],
            subItems: [
                { path: "/PayrollTransactionScreen", name: "Payroll Transactions" },
                { path: "/ProcessedPayRollTransection", name: "Processed Payrolls" },
                { path: "/PayrollDashboard", name: "Payroll Dashboard" }


            ]
        },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/MY TEAM.png" alt="My team" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/MY TEAM.png" alt="My team" className='sidebar-icon'/>,
>>>>>>> 8a5f66f (merging code)
            path: "/Team",
            name: "My Team",
            roles: ["ADMIN", "USER", "SUPERADMIN"],
            subItems: [
<<<<<<< HEAD
                { path: "/ModerateRating", name: "Ratings Adjustment" }
=======
                { path: "/ModerateRating", name: "Ratings Adjustment" },
                { path: "/MrfFormList", name: "ManPower Request" }
>>>>>>> 8a5f66f (merging code)

            ]
        },
        // { icon: <FaUserFriends />, path: `/Team`, name: "My Team", roles: ["ADMIN"] },
        // { icon: <FaChalkboardTeacher/>, path: `/TrainningSetup`, name: "Training Module", roles: ["ADMIN"] },

        {
<<<<<<< HEAD

            icon: <img src="/SidebarImages/preRegistration.png" alt="PreOnoarding" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/preRegistration.png" alt="PreOnoarding" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: "/Preregistration",
            name: "Pre-Onboarding",
            roles: ["ADMIN", "SUPERADMIN"],
            subItems: [
                { path: "/Preregistration", name: "Pre-Onboarding" },
                { path: "/ticketsView", name: "Tickets" },
                { path: "/ListOfCandidates", name: 'Candidates List' }

            ]
        },
        // {
        //     icon: <img src="/SidebarImages/preRegistration.png" alt="PreOnoarding" style={{ width: '15px', height: '15px' }} />,
        //     path: `/Preregistration`,
        //     name: "PreRegistration",
        //     roles: ["ADMIN", "SUPERADMIN"]
        // },

        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/recruitment.png" alt="Recruitment" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/recruitment.png" alt="Recruitment" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: `/Jd`,
            name: "Recruitment",
            roles: ["ADMIN", "SUPERADMIN"]
        },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/tickets.png" alt="Confirmation" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/tickets.png" alt="Confirmation" className='sidebar-icon'/>,
>>>>>>> 8a5f66f (merging code)
            path: `/AllActiveConfirmation`,
            name: "Confirmation List",
            roles: ["ADMIN", "SUPERADMIN"]
        },
        {

<<<<<<< HEAD
            icon: <img src="/SidebarImages/trainning.png" alt="Trainings" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/trainning.png" alt="Trainings" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: "/AllTrainings",
            name: "Trainings",
            roles: ["ADMIN", "SUPERADMIN"],
            subItems: [
                { path: "/TrainingHR", name: "Training List" }
            ]
        },
        {

<<<<<<< HEAD
            icon: <img src="/SidebarImages/Induction.png" alt="Induction" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/Induction.png" alt="Induction" className='sidebar-icon'/>,
>>>>>>> 8a5f66f (merging code)
            path: "/InductionList",
            name: "Induction",
            roles: ["ADMIN", "SUPERADMIN"],
            subItems: [
                { path: "/InductionHR", name: "Induction List" }
            ]
        },
<<<<<<< HEAD
         {
            icon: <img src="/SidebarImages/employee dashboard.png" alt="transfer" style={{ width: '15px', height: '15px' }} />,
            path: `/TransferList`,
            name: "Transfer",
            roles: ["ADMIN", "USER", "SUPERADMIN"]
        },
        {
            icon: <img src="/SidebarImages/employee dashboard.png" alt="employee dashboard" style={{ width: '15px', height: '15px' }} />,
=======
        {
            icon: <img src="/SidebarImages/employee dashboard.png" alt="reports" className='sidebar-icon' />,
            path: `/ReportsFilters`,
            name: "Reports",
            roles: ["ADMIN", "USER", "SUPERADMIN"]
        },
        {
            icon: <img src="/SidebarImages/employee dashboard.png" alt="employee dashboard" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: `/EmployeeDashboard`,
            name: "Employee Dashboard",
            roles: ["ADMIN", "USER", "SUPERADMIN"]
        },
        {
<<<<<<< HEAD
            icon: <img src="/SidebarImages/employee dashboard.png" alt="employee dashboard" style={{ width: '15px', height: '15px' }} />,
=======
            icon: <img src="/SidebarImages/employee dashboard.png" alt="employee dashboard" className='sidebar-icon' />,
>>>>>>> 8a5f66f (merging code)
            path: `/OffBoarding`,
            name: "OffBoarding",
            roles: ["ADMIN", "USER", "SUPERADMIN"]
        },
<<<<<<< HEAD
        {
            icon: <img src="/SidebarImages/employee dashboard.png" alt="reports" style={{ width: '15px', height: '15px' }} />,
            path: `/Reports`,
            name: "Reports",
            roles: ["ADMIN", "USER", "SUPERADMIN"]
        },
=======
>>>>>>> 8a5f66f (merging code)
    ];
    const isItemActive = (item) => {
        if (useNavigate.pathname === item.path) return true;
        if (item.subItems && item.subItems.some(subItem => isSubItemActive(subItem.path))) return true;
        return false;
    };
    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };
    const filteredMenuItems = menuItem.filter(item => {
        const itemNameMatch = item.name.toLowerCase().includes(searchTerm);
        const subItemsMatch = item.subItems?.some(subItem =>
            subItem.name.toLowerCase().includes(searchTerm)
        );
        return itemNameMatch || subItemsMatch;
    });


    return (
        <>

            <nav className='navbar'>
                <div className="navbar-container">
                    <div className="bars menu">
                        <img className='HRMSNew' src={isOpen ? "/LoginLong.png" : "/Pristine-logo.png"} alt="Pristine Logo" height={30} onClick={toggleSidebar} />
                        {/* <FaBars onClick={() => setIsOpen(!isOpen)} /> */}
                    </div>
                    <div className="projectList">
                        <div className="projectcontainer underline"> Welcome {firstName}</div>

                    </div>
                    <div className="profile-icon" onClick={handleProfileIconClick}>
                        {photo ? (
                            <img
                                src={photo}
                                alt="Profile"
                                className="profile-img"
                                style={{ cursor: 'pointer', width: '30px' }}
                                onClick={() => document.getElementById('file-upload').click()}
                            />
                        ) : (
                            <FaUserCircle size={30} />
                        )}
                    </div>



                    {/* Profile Icon */}
                    {/* <div className="input-row">
                        <button onClick={toggleTheme}>
                            <input
                                type="checkbox"
                                checked={isDarkTheme}
                                onChange={toggleTheme}
                                aria-label={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                            />
                            {isDarkTheme ? 'Dark Mode' : 'Light Mode'}
                        </button>
                    </div> */}
                </div>
            </nav>
            {profileModalOpen && (
                <div className="profile-modal" ref={modalRef}>
                    <div className="profile-header" style={{ position: 'relative' }}>
                        <h2>Profile</h2>
                        <FaTimes
                            size={20}
                            onClick={() => setProfileModalOpen(false)}
                            style={{ cursor: 'pointer', color: 'black', position: 'absolute', top: '10px', right: '10px' }}
                        />
                    </div>

                    {employeeData ? (
                        <div className="profile-details">
                            <div className="profile-photo">
                                {loading ? (
                                    <div className="loading-spinner"></div>
                                ) : (
                                    photo ? (
                                        <img
                                            src={photo}
                                            alt="Profile"
                                            className="profile-img"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => document.getElementById('file-upload').click()}
                                        />
                                    ) : (
                                        <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                                            <FaUserCircle
                                                size={50}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => document.getElementById('file-upload').click()}
                                                aria-placeholder="Add photo"
                                            />
                                            <p style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>Add profile picture</p>
                                        </div>
                                    )
                                )}
                                {/* File Input */}
                                <input
                                    id="file-upload"
                                    type="file"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileSelection}
                                />
                            </div>

                            <p><strong>Employee ID:</strong> {employeeData.employeeId}</p>
                            <p><strong>Name:</strong> {employeeData.name}</p>
                            <p><strong>Department:</strong> {employeeData.department}</p>
                            <p><strong>Designation:</strong> {employeeData.designation}</p>
                            <p><strong>Contact:</strong> {employeeData.contactNo}</p>
                            <p><strong>Email:</strong> {employeeData.email}</p>
                            <p><strong>Gender:</strong> {employeeData.gender}</p>
                            <div
                                className="underlineText"
                                style={{ marginLeft: '130px', cursor: 'pointer', color: 'red', marginTop: '20px' }}
                                onClick={handleLogout}
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '8px' }} />
                                <strong>LOGOUT</strong>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p>Loading...</p>
                            <div
                                className="underlineText"
                                style={{ marginLeft: '130px', cursor: 'pointer', color: 'red', marginTop: '20px' }}
                                onClick={handleLogout}
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '8px' }} />
                                <strong>LOGOUT</strong>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="add-popup">
                    <div>
                        <p style={{ textAlign: 'center' }}>Do you want to upload this image?</p>
                        <div className="btnContainer">
                            <button type='button' className='btn' onClick={handleFileUpload}>Upload</button>
                            <button type='button' className='outline-btn' onClick={handleCancelUpload}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="navcontainer">

                <div className="sidebar" role="navigation" aria-label="Main Sidebar" style={{ width: isOpen ? "220px" : "50px" }}>
                    <div className="sidebar-content">
                        {/* <div className='sidebar-more'>
                        <button className="show-more-btn" onClick={toggleShowMore}>
                            {isExpanded ? "Show Less" : "Show More"}
                        </button>
                    </div> */}
                        {/* <div className="search-container" style={{ padding: '10px' }}>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={handleSearch}
                            style={{ width: '100%', padding: '5px', borderRadius: '5px' }}
                        />
                        <FaSearch size={20} style={{ position: 'absolute', right: '10px',top:"100px" , color:'black' , fontSize:'10px' }} />
                    </div> */}
                        {filteredMenuItems.map((item, index) => {
                            const isItemAccessible = item.roles.includes(role);
                            const isItemActive = location.pathname === item.path;
                            return (
                                <div key={index}>
                                    <NavLink
                                        to={isItemAccessible ? item.path : "#"}
                                        className={`link ${isItemActive ? "active" : ""}`}
                                        onClick={() => {
                                            if (isItemAccessible && item.subItems) {
                                                toggleSubMenu(item.name);
                                            }
                                        }}
                                        style={{ cursor: isItemAccessible ? 'pointer' : 'not-allowed', opacity: isItemAccessible ? 1 : 0.3 }}
                                        title={!isItemAccessible ? "Access Denied" : ""}
                                    >
                                        <div className="icon" title={!isOpen ? item.name : ''}>{item.icon}</div>

                                        <div style={{ display: isOpen ? "block" : "none" }} className="link_text">
                                            {item.name}
                                        </div>
                                        {item.badge && <span className="badge">{item.badge}</span>}
                                        {item.subItems && (
                                            <span style={{ marginLeft: 'auto', display: isOpen ? 'block' : 'none', fontSize: "10px" }}>
                                                {activeSubMenu === item.name ? '▲' : '▼'}
                                            </span>
                                        )}
                                    </NavLink>

                                    {item.subItems && activeSubMenu === item.name && (
                                        <ul className="sub-menu" style={{ display: isOpen ? 'block' : 'none' }}>
                                            {item.subItems.map((subItem, subIndex) => {
                                                const isSubItemCurrentlyActive = isSubItemActive(subItem.path);
                                                return (
                                                    <li key={subIndex} className="sub-item">
                                                        <NavLink
                                                            to={subItem.path}
                                                            className={`link ${isSubItemCurrentlyActive ? "active" : ""}`}
                                                        >
                                                            <span className="dot"></span> {subItem.name}
                                                        </NavLink>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>

                            );

                        })}
                    </div>
                </div>

                <main style={{ marginLeft: isOpen ? "20%" : "5%", marginTop: "5%" }}>{children}</main>
            </div>
        </>
    );
};
export default Sidebar;

