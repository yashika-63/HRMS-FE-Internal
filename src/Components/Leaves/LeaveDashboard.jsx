import { faArrowRight, faEdit, faEllipsisV, faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { strings } from '../../string';
import '../CommonCss/LeaveAppl.css';
import '../CommonCss/style.css';
import LeaveApplication from './LeaveApplication';
import UpdateLeave from './UpdateLeave';
import ViewLeave from './ViewLeave';
import { showToast } from '../../Api.jsx';

const LeaveDashboard = () => {
    const [Leaves, setLeaves] = useState([]);
    const [dates, setDates] = useState([null, null]);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const calendarRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [showPopup, setShowPopup] = useState(false); // State for Update Leave Popup
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveBalance, setLeaveBalance] = useState({});
    const [employeeConfig, setEmployeeConfig] = useState();
    const { id } = useParams();
    const [isFromLocalStorage, setIsFromLocalStorage] = useState(false);
    const employeeId = id || localStorage.getItem("employeeId");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [selectedLeaveId, setSelectedLeaveId] = useState(null);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [showViewModal, setShowViewModal] = useState(null);
    const [data, setData] = useState([]);
    const [showPDF, setShowPDF] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");
    const [noPolicyAvailable, setNoPolicyAvailable] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        id: '',
        designation: '',
        department: '',
        employeeName: '',
        totalLeaves: 22,
        usedLeaves: '',
        RemainingLeaves: '',
        paidleaves: '',
        sickLeaves: '',
        approved: '',
        Rejected: '',
        vacationLeaves: '',
        leaveStatus: '',
        leavetype: '',
        leaveRequests: [],
        employeeId: ''
    });

    useEffect(() => {
        axios.get(`http://${strings.localhost}/api/leaveApplications/latest/${employeeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, [token, employeeId]);

    useEffect(() => {
        fetchEmployeeDetails();
    }, [employeeId]);

    useEffect(() => {
        const localEmployeeId = localStorage.getItem('employeeId');
        const employeeIdToUse = id || localEmployeeId;
        if (employeeIdToUse) {
            fetchEmployeeDetails(employeeIdToUse);
            // fetchLeaveBalance(employeeIdToUse);
            setIsFromLocalStorage(!!localEmployeeId && !id);
        }
    }, [id]);

    const fetchEmployeeDetails = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`);
            const employee = response.data;
            setFormData(prevFormData => ({
                ...prevFormData,
                name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
                id: employee.id,
                department: employee.department,
                designation: employee.designation,
                employeeName: employee.name,
                employeeId: employee.employeeId
            }));
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };

    useEffect(() => {
        const fetchAllLeaveData = async () => {
            try {
                // 1. Fetch base leave balance
                const [leaveRes1, leaveRes2] = await Promise.all([
                    axios.get(`http://${strings.localhost}/api/leaveApplications/leaveCounts?companyId=${companyId}&employeeId=${employeeId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get(`http://${strings.localhost}/api/leaveApplications/leaveCountsByStatusAndType?companyId=${companyId}&employeeId=${employeeId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const combinedData = {
                    approved: leaveRes1.data.approved,
                    approvedPaid: leaveRes2.data.approvedPaid,
                    approvedUnpaid: leaveRes2.data.approvedUnpaid,
                    rejected: leaveRes1.data.rejected,
                };

                // Update form and leave balance
                setLeaveBalance(prev => ({
                    ...prev,
                    totalLeaves: 22,
                    usedLeaves: combinedData.approved,
                    approvedPaid: combinedData.approvedPaid,
                    approvedUnpaid: combinedData.approvedUnpaid,
                    approved: combinedData.approved,
                    rejected: combinedData.rejected,
                }));

                setFormData(prevFormData => ({
                    ...prevFormData,
                    usedLeaves: combinedData.approved,
                    approvedPaid: combinedData.approvedPaid,
                    approvedUnpaid: combinedData.approvedUnpaid,
                    approved: combinedData.approved,
                    rejected: combinedData.rejected,
                }));

                // 2. Fetch config
                const configRes = await axios.get(`http://${strings.localhost}/api/employee-config/employee/${employeeId}`);
                const config = configRes.data[0];
                setEmployeeConfig(config);

                // 3. Then fetch leave buckets
                const fullData = config.confirmationStatus ? 1 : 0;
                const bucketsRes = await axios.get(`http://${strings.localhost}/api/leave-buckets/leave-buckets`, {
                    params: {
                        companyID: companyId,
                        employeeType: config.employeeType,
                        status: 1,
                        fullData: fullData
                    }
                });

                setLeaveBalance(prev => ({
                    ...prev,
                    additionalLeaveData: bucketsRes.data
                }));
            } catch (error) {
                console.error('Error fetching leave data:', error);
            }
        };

        if (employeeId && token && companyId) {
            fetchAllLeaveData();
        }
    }, [employeeId, token, companyId]);


    const handleDateChange = async (dates) => {
        setDates(dates);
        setCalendarOpen(false);
        if (dates[0] && dates[1]) {
            try {
                const fromDate = dates[0].toISOString().split('T')[0];
                const toDate = dates[1].toISOString().split('T')[0];

                const response = await axios.get(`http://${strings.localhost}/api/leaveApplications/GetLeaveApplicationsBetweenDates/${companyId}/${employeeId}`, {
                    params: {
                        fromDate: fromDate,
                        toDate: toDate
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    const handleDeleteRequest = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                showToast("Authorization token is missing. Please log in again.",'warn');
                return;
            }
            await axios.delete(`http://${strings.localhost}/api/leaveApplications/${selectedLeaveId}/${companyId}/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setLeaveRequests(prevRequests => prevRequests.filter(request => request.id !== selectedLeaveId));

            showToast('Leave request deleted successfully.', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error deleting leave request:', error);
        } finally {
            setShowDeleteConfirmation(false);
        }
    };

    const addLeaveRequest = (newRequest) => {
        setLeaveRequests(prevRequests => [...prevRequests, newRequest]);
    };

    const handleClickOutside = (event) => {
        if (calendarRef.current && !calendarRef.current.contains(event.target)) {
            setCalendarOpen(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const requestDeleteConfirmation = (leaveId, requestId) => {
        setSelectedLeaveId(leaveId);
        setSelectedRequestId(requestId);
        setShowDeleteConfirmation(true);
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    useEffect(() => {
        const fetchLeaves = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`http://${strings.localhost}/api/leaveApplications/company/${companyId}/employee/${employeeId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (response.data && Array.isArray(response.data)) {
                    setLeaves(response.data);
                } else {
                    console.error('Invalid data structure or empty response for leaves');
                }
            } catch (error) {
                console.error('Error fetching leave applications:', error);
            }
        };

        fetchLeaves();
    }, [companyId, employeeId]);

    const CircularProgress = ({ totalLeaves, usedLeaves }) => {
        const radius = 50;
        const stroke = 5;
        const normalizedRadius = radius - stroke * 2;
        const circumference = normalizedRadius * 2 * Math.PI;
        const strokeDashoffset = circumference - (usedLeaves / totalLeaves) * circumference;
        return (
            <svg height={radius * 2} width={radius * 2} className="circular-progress">
                <circle
                    stroke="black"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="#BDC5F1"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    style={{ strokeDasharray: circumference, strokeDashoffset }}
                />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="20px" fill="black">
                    {`${usedLeaves}/${totalLeaves}`}
                </text>
            </svg>
        );
    };

    const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
        <input type="text" value={value} onClick={onClick} ref={ref} readOnly className="date-input" />
    ));

    const handleEditClick = (id) => {
        setSelectedLeaveId(id);
        setShowUpdateModal(true);
    };

    const handleViewClick = (id) => {
        setSelectedLeaveId(id);
        setShowViewModal(true);
    };

    const handleClearDates = () => {
        setDates([null, null]);
        setCalendarOpen(false);
        window.location.reload();

    };

    const handleViewPolicies = async () => {
        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/company-document/view/activenew`,
                {
                    params: {
                        companyId,
                        documentIdentityKey: 'LeavePolicy'
                    },
                    responseType: 'blob'
                }
            );
            if (!response.data || response.data.size === 0) {
                setNoPolicyAvailable(true);
                setShowPDF(true);
                return;
            }

            const fileBlob = new Blob([response.data], { type: 'application/pdf' });
            const fileUrl = URL.createObjectURL(fileBlob);
            setPdfUrl(fileUrl);
            setNoPolicyAvailable(false);
            setShowPDF(true);
        } catch (error) {
            console.error('Failed to load Leave Policy document:', error);
            setNoPolicyAvailable(true);
            setShowPDF(true);
        }
    };

    const handleClosePDF = () => {
        setShowPDF(false);
        setPdfUrl("");
    };

    const editDropdownMenu = (id, requestStatus) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                {isFromLocalStorage ? (
                    <>
                        <div>
                            <button
                                onClick={() => handleEditClick(id)}
                                disabled={requestStatus === 'APPROVED'}
                                style={requestStatus === 'APPROVED' ? { cursor: 'not-allowed' } : {}}
                            >
                                <FontAwesomeIcon className="ml-2" icon={faEdit} /> Edit
                            </button>
                        </div>

                        <div>
                            <button type='button' onClick={() => requestDeleteConfirmation(id)}>
                                <FontAwesomeIcon className='ml-2' icon={faTrashAlt} /> Delete
                            </button>
                        </div>
                    </>
                ) : null}
                <div>
                    <button type='button' onClick={() => handleViewClick(id)}>
                        <FontAwesomeIcon className='ml-2' icon={faEye} /> View
                    </button>
                </div>
            </div>
        </div>
    );
    const statusStyle = (status) => {
        switch (status) {
            case 'REJECTED':
                return { color: 'red' };
            case 'APPROVED':
                return { color: 'green' };
            case 'PENDING':
                return { color: 'blue' };
            default:
                return { color: 'black' };
        }
    };
    return (
        <div className='coreContainer'>
            <div className="input-row">
                <div>
                    <label htmlFor="name">Employee Name:</label>
                    <input type="text" className='readonly' id="name" name="name" value={formData.name} onChange={handleInputChange} readOnly />
                </div>
                <div>
                    <label htmlFor="id">Employee ID:</label>
                    <input type="text" className='readonly' id="id" name="id" value={formData.employeeId} onChange={handleInputChange} readOnly />
                </div>
                <div >
                    <label htmlFor="designation">Employee Designation:</label>
                    <input type="text" className='readonly' id="designation" name="designation" value={formData.designation} onChange={handleInputChange} readOnly />
                </div>
                <div>
                    <label htmlFor="department">Employee Department:</label>
                    <input type="text" className='readonly' id="department" name="department" value={formData.department} onChange={handleInputChange} readOnly />
                </div>
            </div>
            <div className="content-container">
                <aside className='dashboard-form'>
                    <div className='header-container'>
                        <div className='header'>
                            Leave Summary
                        </div>
                        <div className='date-range-picker'>
                            <div className='date-input-wrapper'>
                                <input placeholder="Select date range" readOnly className='date-input'
                                    value={`${dates[0] ? dates[0].toLocaleDateString() : ''} - ${dates[1] ? dates[1].toLocaleDateString() : ''}`}
                                    onClick={() => setCalendarOpen(!calendarOpen)}
                                />
                                <FaCalendarAlt
                                    className='calendar-icon'
                                    onClick={() => setCalendarOpen(!calendarOpen)}
                                />
                                {dates[0] || dates[1] ? (
                                    <button className="outline-btn" onClick={handleClearDates}>Clear</button>
                                ) : null}
                                {calendarOpen && (
                                    <div ref={calendarRef} className='calendar-popup'>
                                        <DatePicker selected={dates[0]} onChange={handleDateChange} startDate={dates[0]} endDate={dates[1]} selectsRange inline customInput={<CustomInput />} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='containerbtn'>
                            <button className='btn' type='button' onClick={() => setShowModal(true)}>Apply Leave</button>
                        </div>
                    </div>
                    <div>
<<<<<<< HEAD
                        <table className='Attendance-table'>
=======
                        <table className='interview-table'>
>>>>>>> 8a5f66f (merging code)
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Employee Name</th>
                                    <th>Request Type</th>
                                    <th>From Date</th>
                                    <th>To Date</th>
                                    <th>Request Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{data.length - index}</td>
                                            <td>{item.name}</td>
                                            <td>{item.leaveType}</td>
                                            <td>{item.fromDate}</td>
                                            <td>{item.toDate}</td>
                                            <td style={statusStyle(item.requestStatus)}>{item.requestStatus}</td>
                                            <td>{editDropdownMenu(item.id, item.requestStatus)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8">No leave requests available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </aside>
                <aside >
                    <aside className="leave-balance-section" >
                        <h2 className='header1'>Leave Balance</h2>
                        <div className="total-leaves-container">
                            <CircularProgress totalLeaves={formData.totalLeaves} usedLeaves={formData.usedLeaves} />
                            <span className="total-leaves-label"> Leaves Remaining</span>
                        </div>
                        <hr />
                        <div className="card-row">
                            <div className="card">
                                <label htmlFor="approved">Approved</label>
                                <input type="text" id="approved" name="approved" className='readonly' value={formData.approved} onChange={handleInputChange} readOnly />
                            </div>
                            <div className="card">
                                <label htmlFor="rejected">Rejected</label>
                                <input type="text" id="rejected" name="rejected" className='readonly' value={formData.rejected} onChange={handleInputChange} readOnly />
                            </div>
                            <div className="card">
                                <label htmlFor="casualLeave">Casual</label>
                                <input type="text" id="casualLeave" name="casualLeave" className='readonly' value={leaveBalance.additionalLeaveData?.[0]?.casualLeave ?? 0} readOnly />
                            </div>
                        </div>


                        <div className="card-row">
                            <div className="card">
                                <label htmlFor="sickLeave">Sick</label>
                                <input type="text" id="sickLeave" name="sickLeave" className='readonly' value={leaveBalance.additionalLeaveData?.[0]?.sickLeave ?? 0} readOnly />
                            </div>
                            <div className="card">
                                <label htmlFor="paidLeaves">Paid</label>
                                <input type="text" id="paidLeaves" name="paidLeaves" className='readonly' value={leaveBalance.additionalLeaveData?.[0]?.paid ?? 0} readOnly />
                            </div>
                            <div className="card">
                                <label htmlFor="unPaidLeaves">UnPaid</label>
                                <input type="text" id="unPaidLeaves" name="unPaidLeaves" className='readonly' value={leaveBalance.additionalLeaveData?.[0]?.unPaid ?? 0} readOnly />
                            </div>
                        </div>

                    </aside>
                    <aside className="leave-balance-section">
                        <h2 className="header1"> Links </h2>
                        <div className="coloumn">
                            <button className="card leave-policies-button" onClick={handleViewPolicies}>
                                <span className="leave-policies-label">Leave Policy</span>
                                <FontAwesomeIcon icon={faArrowRight} className="leave-policies-icon" />
                            </button>
                        </div>
                    </aside>

                </aside>
            </div>
            {showPDF && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Leave Policy Document</h3>
                            <button className="close-button" onClick={handleClosePDF}>X</button>
                        </div>
                        {noPolicyAvailable ? (
                            <div className='no-data'>
                                No active leave policy uploaded.
                            </div>
                        ) : (
                            <iframe
                                src={pdfUrl}
                                width="100%"
                                height="600px"
                                title="Leave Policies"
                                frameBorder="0"
                            />
                        )}
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="leavemodal-content">
                        <button className="close-button" onClick={() => setShowModal(false)}>X</button>
                        <LeaveApplication employeeData={formData} onSubmit={(newRequest) => {
                            addLeaveRequest(newRequest);
                            setShowModal(false);
                        }} />
                    </div>
                </div>
            )}
            {showUpdateModal && (
                <div className="modal-overlay">
                    <div className="leavemodal-content">
                        <button className="close-button" onClick={() => setShowUpdateModal(false)}>X</button>
                        <UpdateLeave
                            selectedLeaveId={selectedLeaveId}
                            employeeData={formData}
                            onSubmit={(updatedRequest) => {
                                addLeaveRequest(updatedRequest);
                                setShowUpdateModal(false);
                            }}
                            onClose={() => setShowUpdateModal(false)}
                        />
                    </div>
                </div>
            )}
            {showViewModal && (
                <ViewLeave
                    selectedLeaveId={selectedLeaveId}
                    employeeData={formData}
                    visible={showViewModal}
                    onClose={() => setShowViewModal(false)}
                />
            )}
            {showDeleteConfirmation && (
                <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to delete this leave request?</p>
                    <div className='btnContainer'>
                        <button className='btn' onClick={handleDeleteRequest}>Yes</button>
                        <button className='outline-btn' onClick={() => setShowDeleteConfirmation(false)}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
}
export default LeaveDashboard;
