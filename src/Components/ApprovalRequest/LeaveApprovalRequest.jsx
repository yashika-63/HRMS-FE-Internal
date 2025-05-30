import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import ViewLeaveApplication from '../Leaves/ViewLeave';
import { strings } from '../../string';
import { showToast } from '../../Api.jsx';

const LeaveApprovalRequest = () => {
    const [leaveData, setLeaveData] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState(''); // 'approve' or 'reject'
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [SelectedWorkflowmainId, setSelectedWorkflowmainId] = useState(null);
    const token = localStorage.getItem("token");
    const division = localStorage.getItem("division");
    const department = localStorage.getItem("department");
    const companyRole = localStorage.getItem("companyRole");
    const companyId = localStorage.getItem("companyId");
    const firstName = localStorage.getItem("firstName");
    const employeeId = localStorage.getItem("employeeId");
    const [popupData, setPopupData] = useState({
        name: '',
        date: '',
        note: '',
        email: '',
        designation: ''
    });
    const [formData, setFormData] = useState({
        employeeName: '',
        date: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);





    // Helper functions for date formatting
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-');
    };

    const formatForBackend = (dateString) => {
        const date = new Date(dateString.split('-').reverse().join('-'));
        return date.toISOString().split('T')[0];
    };

    // Fetch leave requests on mount

    const fetchLeaves = async (projectIds) => {
        try {
            const projectIdsQuery = projectIds.map(id => `projectIds=${id}`).join('&');

            const response = await axios.get(
                `http://${strings.localhost}/api/leaveApplications/GetAllRequestList/${division}/${department}/${companyRole}?companyId=${companyId}&${projectIdsQuery}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setLeaveData(response.data);
        } catch (error) {
            console.error("Error fetching leave application data:", error);
        }
    };
    useEffect(() => {
        fetchEmployeeDetails();
<<<<<<< HEAD
    }, []); 
=======
    }, []);
>>>>>>> 8a5f66f (merging code)

    // useEffect(() => {
    //     fetchLeaves();
    // }, [token, division, department, companyRole, companyId, strings]);

    // Open the popup for approving or rejecting a leave request
    const openPopup = (type, item) => {
        const currentDate = formatDate(new Date().toISOString());
        const employeeName = item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : '';
        const employeeEmail = item.employee ? item.employee.email : '';

        setPopupData({
            name: employeeName,
            date: currentDate,
            note: '',
            email: employeeEmail,
            action: 'true',
            actionTakenBy: '',
            designation: ''
        });
        setFormData({
            employeeName,
            date: currentDate,
            email: employeeEmail
        });
        setPopupType(type);
        setSelectedRequestId(item.id);
        setSelectedEmployeeId(item.employee ? item.employee.id : '');
        setSelectedWorkflowmainId(item.workflowMain ? item.workflowMain.id : '');
        fetchEmployeeDetails(item.employeeId);
        setShowPopup(true);
    };


    const fetchEmployeeDetails = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`);
            const employee = response.data;
            setFormData(prevFormData => ({
                ...prevFormData,
                employeeName: `${employee.firstName} ${employee.middleName || ''} ${employee.lastName}`,
                date: formatDate(new Date().toISOString()),
                email: employee.email || ''
            }));
            const projectIds = employee.generateProjects.map(project => project.projectId);
            fetchLeaves(projectIds);

        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };


    const handleApprove = async () => {
        setLoading(true);
        const backendDate = formatForBackend(popupData.date);
        try {
            // Approve the leave request via two API calls
            await Promise.all([
                axios.put(
                    `http://${strings.localhost}/api/leaveApplications/updateWorkflowDetails/${selectedRequestId}/${companyId}/${SelectedWorkflowmainId}/${selectedEmployeeId}/${division}/${department}/${companyRole}`,
                    null,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                ),
                axios.post(
                    `http://${strings.localhost}/api/leaveApproval/save/${selectedRequestId}`,
                    {
                        name: popupData.name,
                        date: backendDate,
                        note: popupData.note,
                        mail: popupData.email,
                        action: 'true',
                        actionTakenBy: formData.employeeName,
                        designation: popupData.designation
                    },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                )
            ]);
            showToast('Approved Successfully.', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('There was an error approving the leave request!', error);
            showToast('Error While Approving.', 'error');

        }
        setShowPopup(false);
        setLoading(false);
    };

    const handleReject = async () => {
        setLoading(true);
        const backendDate = formatForBackend(popupData.date);
        try {
            await Promise.all([
                axios.post(
                    `http://${strings.localhost}/api/leaveApplications/decline/${selectedRequestId}/${companyId}/${selectedEmployeeId}`,
                    null,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                ),
                axios.post(
                    `http://${strings.localhost}/api/leaveApproval/save/${selectedRequestId}`,
                    {
                        name: popupData.name,
                        date: backendDate,
                        note: popupData.note,
                        mail: popupData.email,
                        action: 'false',
                        actionTakenBy: formData.employeeName,
                        designation: popupData.designation
                    },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                )
            ]);
            showToast('Rejected Successfully.', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('There was an error rejecting the leave request!', error);
            showToast('Error while rejecting.', 'error');

        }
        setShowPopup(false);
        setLoading(false);
    };
    const handleViewClick = (item) => {
        setSelectedLeave(item);
        setShowModal(true);
    };
    // Dropdown menu for actions
    const editDropdownMenu = (item) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button type='button' onClick={() => openPopup('approve', item)} disabled={loading}>
                        Approve
                    </button>
                </div>
                <div>
                    <button type='button' onClick={() => openPopup('reject', item)} disabled={loading}>
                        Reject
                    </button>
                </div>
                <div>
                    <button type='button' onClick={() => handleViewClick(item)}>
                        View
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
        <div className="coreContainer">
<<<<<<< HEAD
            <table className="Attendance-table">
=======
            <table className="interview-table">
>>>>>>> 8a5f66f (merging code)
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Employee ID</th>
                        <th>Employee Name</th>
                        <th>Leave Reason</th>
                        <th>Total Days</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Request Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
<<<<<<< HEAD
                    {leaveData.map((item , index) => (
                        <tr key={item.id}>
                            <td>{index+1}</td>
                            <td>{item.employee ? item.employee.employeeId : 'N/A'}</td>
                            <td>{item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'N/A'}</td>
                            <td>{item.reason}</td>
                            <td>{item.totalNoOfDays}</td>
                            <td>{item.fromDate}</td>
                            <td>{item.toDate}</td>
                            <td style={statusStyle(item.requestStatus)}>{item.requestStatus}</td>
                            <td>{editDropdownMenu(item)}</td>
                        </tr>
                    ))}
                </tbody>
=======
                    {leaveData.length === 0 ? (
                        <tr>
                            <td colSpan="9" className='no-data1'>
                                No leave requests available.
                            </td>
                        </tr>
                    ) : (
                        leaveData.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{item.employee ? item.employee.employeeId : 'N/A'}</td>
                                <td>{item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'N/A'}</td>
                                <td>{item.reason}</td>
                                <td>{item.totalNoOfDays}</td>
                                <td>{item.fromDate}</td>
                                <td>{item.toDate}</td>
                                <td style={statusStyle(item.requestStatus)}>{item.requestStatus}</td>
                                <td>{editDropdownMenu(item)}</td>
                            </tr>
                        ))
                    )}
                </tbody>

>>>>>>> 8a5f66f (merging code)
            </table>

            {showPopup && (
                <div className="add-popup">
                    {loading && <div className="loading-spinner"></div>}
                    <div className="popup-content">
                        <h3>{popupType === 'approve' ? 'Approve Request' : 'Reject Request'}</h3>
                        <label htmlFor="name">Employee Name</label>
<<<<<<< HEAD
                        <input type="text" id="name" value={formData.employeeName} readOnly />
=======
                        <input type="text" id="name" value={formData.employeeName} readOnly className='readonly' />
>>>>>>> 8a5f66f (merging code)
                        <label htmlFor="date">Date</label>
                        <input
                            type="text"
                            id="date"
                            value={popupData.date}
                            onChange={(e) => setPopupData({ ...popupData, date: e.target.value })}
<<<<<<< HEAD
=======
                            readOnly
                            className='readonly'
>>>>>>> 8a5f66f (merging code)
                        />
                        <label htmlFor="note">Note</label>
                        <input
                            type="text"
                            id="note"
                            value={popupData.note}
                            onChange={(e) => setPopupData({ ...popupData, note: e.target.value })}
                        />
                        <label htmlFor="email">Email ID</label>
                        <input
                            type="email"
                            id="email"
                            value={popupData.email}
                            onChange={(e) => setPopupData({ ...popupData, email: e.target.value })}
<<<<<<< HEAD
=======
                            className='readonly'
                            readOnly
>>>>>>> 8a5f66f (merging code)
                        />
                        <div className="popup-buttons">
                            {popupType === 'approve' ? (
                                <>
                                    <button type='button' className='btn' onClick={handleApprove}>{loading ? 'Approving...' : 'Approve'}</button>
                                    <button type='button' className='outline-btn' onClick={() => setShowPopup(false)}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button type='button' className='btn' onClick={handleReject}>{loading ? 'Rejecting...' : 'Reject'}</button>
                                    <button type='button' className='outline-btn' onClick={() => setShowPopup(false)}>Cancel</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showModal && (
                <ViewLeaveApplication
                    employeeData={selectedLeave}
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    selectedLeaveId={selectedLeave ? selectedLeave.id : null}
                />
            )}
        </div>
    );
};

export default LeaveApprovalRequest;
