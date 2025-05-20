import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { strings } from '../../string';
import ViewExpense from '../Expense/ViewExpense';
import { showToast } from '../../Api.jsx';

const ExpenseApprovalRequest = () => {
    const [expenseData, setExpenseData] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState('');
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [showModal1, setShowModal1] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [SelectedWorkflowmainId, setSelectedWorkflowmainId] = useState(null);

    const token = localStorage.getItem("token");
    const division = localStorage.getItem("division");
    const department = localStorage.getItem("department");
    const companyRole = localStorage.getItem("companyRole");
    const companyId = localStorage.getItem("companyId");
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

    // Fetch expense requests on mount

    const fetchExpenses = async (projectIds) => {
        try {
            const projectIdsQuery = projectIds.map(id => `projectIds=${id}`).join('&');

            const response = await axios.get(
                `http://${strings.localhost}/api/expense/GetAllRequestList/${division}/${department}/${companyRole}?companyId=${companyId}&${projectIdsQuery}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setExpenseData(response.data);
        } catch (error) {
            console.error("Error fetching expense data:", error);
        }
    };
      useEffect(() => {
            fetchEmployeeDetails();
        }, []); 
    
    // useEffect(() => {
    //     fetchExpenses();
    // }, [token, division, department, companyRole, companyId, strings]);

    // Open the popup for approving or rejecting an expense request
    const openPopup = (type, item) => {
        const currentDate = formatDate(new Date().toISOString());
        const employeeName = item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : '';
        const employeeEmail = item.employee ? item.employee.email : '';

        setPopupData({
            name: employeeName,
            date: currentDate,
            note: '',
            email: employeeEmail,
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
        fetchEmployeeDetails(); // Fetch employee details (if needed)
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
            fetchExpenses(projectIds);
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };

    const handleApprove = async () => {
        setLoading(true);
        const backendDate = formatForBackend(popupData.date);
        try {
            await Promise.all([
                axios.put(
                    `http://${strings.localhost}/api/expense/updateWorkflowDetails/${selectedRequestId}/${companyId}/${SelectedWorkflowmainId}/${division}/${department}/${companyRole}`,
                    null,
                    { headers: { Authorization: `Bearer ${token}` } }
                ),
                axios.post(
                    `http://${strings.localhost}/api/ExpenseApproval/save/${selectedRequestId}`,
                    {
                        name: popupData.name,
                        date: backendDate,
                        note: popupData.note,
                        mail: popupData.email,
                        action: true,
                        actionTakenBy: formData.employeeName,
                        designation: popupData.designation
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            ]);
            showToast('Approved Successfully.', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Error approving expense request:', error);
            showToast('Error while approving.', 'error');

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
                    `http://${strings.localhost}/api/expense/decline/${selectedRequestId}/${companyId}/${selectedEmployeeId}`,
                    null,
                    { headers: { Authorization: `Bearer ${token}` } }
                ),
                axios.post(
                    `http://${strings.localhost}/api/ExpenseApproval/save/${selectedRequestId}`,
                    {
                        name: popupData.name,
                        date: backendDate,
                        note: popupData.note,
                        mail: popupData.email,
                        action: false,
                        actionTakenBy: formData.employeeName,
                        designation: popupData.designation
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            ]);
            showToast('Rejected Successfully.', 'success');

            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Error rejecting expense request:', error);
            showToast('Error while Rejecting.', 'error');
        }
        setShowPopup(false);
        setLoading(false);
    };

    // Dropdown menu for actions
    const editDropdown = (item) => (
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
                    <button type='button' onClick={() => {
                        setSelectedExpense(item);
                        setShowModal1(true);
                    }}>
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
            <table className="Attendance-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Employee ID</th>
                        <th>Employee Name</th>
                        <th>Expense Name</th>
                        <th>Amount</th>
                        <th>Request Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {expenseData.map((item , index) => (
                        <tr key={item.id}>
                            <td>{index+1}</td>
                            <td>{item.employee ? item.employee.employeeId : 'N/A'}</td>
                            <td>{item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'N/A'}</td>
                            <td>{item.expensePurpose}</td>
                            <td>{item.expenseAmountSpent}</td>
                            <td style={statusStyle(item.requestStatus)}>{item.requestStatus}</td>
                            <td>{editDropdown(item)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showPopup && (
                <div className="add-popup">
                    {loading && <div className="loading-spinner"></div>}
                    <div className="popup-content">
                        <h3>{popupType === 'approve' ? 'Approve Request' : 'Reject Request'}</h3>
                        <label htmlFor="name">Employee Name</label>
                        <input type="text" id="name" value={formData.employeeName} readOnly />
                        <label htmlFor="date">Date</label>
                        <input
                            type="text"
                            id="date"
                            value={popupData.date}
                            onChange={(e) => setPopupData({ ...popupData, date: e.target.value })}
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

            {showModal1 && (
                <ViewExpense
                    employeeData={selectedExpense}
                    visible={showModal1}
                    onClose={() => setShowModal1(false)}
                    selectedExpense={selectedExpense ? selectedExpense.id : null}
                />
            )}
        </div>
    );
};

export default ExpenseApprovalRequest;
