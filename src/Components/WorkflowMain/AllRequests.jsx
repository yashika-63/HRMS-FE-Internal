
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styles from './AllRequests.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faUserPlus, faEllipsisV, faRegistered, faEye } from '@fortawesome/free-solid-svg-icons';
import '../Expense/ViewExpense';
import '../Leaves/ViewLeave';
import { strings } from '../../string';
import { showToast } from '../../Api.jsx';

const AllRequests = () => {

    const [loading, setLoading] = useState(false);
    const [leaveData, setLeaveData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const token = localStorage.getItem("token");
    const division = localStorage.getItem("division");
    const department = localStorage.getItem("department");
    const companyRole = localStorage.getItem("companyRole");
    const companyId = localStorage.getItem("companyId");
    const firstName = localStorage.getItem("firstName");
    const employeeId = localStorage.getItem("employeeId");
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [showModal1, setShowModal1] = useState(false);
    const [popupType, setPopupType] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [SelectedWorkflowmainId, setSelectedWorkflowmainId] = useState(null);

    const [popupData, setPopupData] = useState({
        name: '',
        date: '',
        note: '',
        mail: '',
        action: 'true',
        actionTakenBy: '',
        designation: ''
    });
    const [formData, setFormData] = useState({
        employeeName: '',
        date: '',
        note: '',
        email: ''
    });


    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Formats as dd-mm-yyyy
    };
    const formatForBackend = (dateString) => {
        const date = new Date(dateString.split('-').reverse().join('-')); // Convert dd-mm-yyyy to yyyy-mm-dd
        return date.toISOString().split('T')[0]; // Extract only the date part in yyyy-mm-dd format
    };

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
        setFormData(prevFormData => ({
            ...prevFormData,
            employeeName: employeeName
        }));

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
                date: formatDate(new Date().toISOString()), // Set current date if needed
                email: employee.email || '' // Include email
            }));
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPopupData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };
    const handleApprove = async () => {
        setLoading(true);
        try {
            const backendDate = formatForBackend(popupData.date); // Convert date for backend

            if (popupType === 'leaveApprove') {
                await Promise.all([
                    axios.put(`http://${strings.localhost}/api/leaveApplications/updateWorkflowDetails/${selectedRequestId}/${companyId}/${SelectedWorkflowmainId}/${selectedEmployeeId}/${division}/${department}/${companyRole}`, null, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }),
                    axios.post(`http://${strings.localhost}/api/leaveApproval/save/${selectedRequestId}`, {
                        name: popupData.name,
                        date: backendDate,
                        note: popupData.note,
                        mail: popupData.email,
                        action: 'true',
                        actionTakenBy: formData.employeeName,
                        designation: popupData.designation
                    }, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                ]);
            } else if (popupType === 'expenseApprove') {
                await Promise.all([
                    axios.put(`http://${strings.localhost}/api/expense/updateWorkflowDetails/${selectedRequestId}/${companyId}/${SelectedWorkflowmainId}/${division}/${department}/${companyRole}`, null, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }),
                    axios.post(`http://${strings.localhost}/api/ExpenseApproval/save/${selectedRequestId}`, {
                        name: popupData.name,
                        date: backendDate,
                        note: popupData.note,
                        mail: popupData.email,
                        action: true,
                        actionTakenBy: formData.employeeName,
                        designation: popupData.designation
                    }, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                ]);
            }
            showToast("Request approved successfully", 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000)

        } catch (error) {
            console.error('There was an error approving the request!', error);
            showToast("Error approving request", 'error');
        }
        setShowPopup(false);

        setLoading(false); // Set loading to false when done

    };

    const handleReject = async () => {
        setLoading(true);
        try {
            const backendDate = formatForBackend(popupData.date);
            const requests = [];

            // Common data for the rejection log
            const requestData = {
                name: popupData.name,
                date: backendDate,
                note: popupData.note,
                mail: popupData.email,
                action: 'false',
                actionTakenBy: formData.employeeName,
                designation: popupData.designation
            };

            // Add the appropriate requests based on the popupType
            if (popupType === 'leaveReject') {
                requests.push(
                    axios.post(`http://${strings.localhost}/api/leaveApplications/decline/${selectedRequestId}/${companyId}/${selectedEmployeeId}`, null, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                );
                requests.push(
                    axios.post(`http://${strings.localhost}/api/leaveApproval/save/${selectedRequestId}`, requestData, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                );
            } else if (popupType === 'expenseReject') {
                requests.push(
                    axios.post(`http://${strings.localhost}/api/expense/decline/${selectedRequestId}/${companyId}/${selectedEmployeeId}`, null, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                );
                requests.push(
                    axios.post(`http://${strings.localhost}/api/ExpenseApproval/save/${selectedRequestId}`, requestData, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                );
            }
            await Promise.all(requests);
            showToast("Request rejected successfully.", 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000)

        } catch (error) {
            console.error('There was an error rejecting the request!', error);
            showToast("Error rejecting request", 'error');
        }
        setShowPopup(false);
        setLoading(false);
    };

    useEffect(() => {
        // Fetch Leave Application Data
        axios.get(`http://${strings.localhost}/api/leaveApplications/GetAllRequest/${division}/${department}/${companyRole}?companyId=${companyId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                setLeaveData(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the leave application data!', error);
            });

        axios.get(`http://${strings.localhost}/api/expense/GetAllRequest/${division}/${department}/${companyRole}?companyId=${companyId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                setExpenseData(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the expense management data!', error);
            });
    }, [token, division, department, companyRole, companyId]);


    const handleViewClick = (item) => {
        setSelectedLeave(item);
        setShowModal(true);
    };
    const handleViewClick1 = (item) => {
        setSelectedExpense(item);
        setShowModal1(true);
    };

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/requested-feedback/getByStatusAndEmployee/true/${employeeId}`);
                if (Array.isArray(response.data)) {
                    setFeedbacks(response.data);
                } else {
                    setFeedbacks([]);
                }
            } catch (error) {
                console.error('Error fetching feedbacks:', error);
            }
        };

        if (employeeId) {
            fetchFeedbacks();
        }
    }, [employeeId]);

    const handleApproveFeedback = async () => {
        if (selectedFeedback && selectedFeedback.id) {
            try {
                const payload = {
                    feedbackDescription: selectedFeedback.feedbackDescription || '',
                    notes: selectedFeedback.notes || '',
                    requestedToEmployeeId: selectedFeedback.requestedToEmployeeId,
                    overallRating: selectedFeedback.overallRating || 0,
                    feedbackDetails: selectedFeedback.feedbackDetails.map(detail => ({
                        question: detail.question,
                        rating: detail.rating || 0
                    }))
                };
                const response = await axios.put(
                    `http://${strings.localhost}/api/requested-feedback/update/${selectedFeedback.id}`,
                    payload
                );

                if (response.status === 200) {
                    alert('Feedback approved successfully!');
                    setShowDetailsModal(false);
                    fetchFeedbacks();
                }
            } catch (error) {
                console.error('Error approving feedback:', error);
                alert('Error approving feedback.');
            }
        }
    };


    const handleShowDetails = (feedback) => {
        if (feedback) {
            setSelectedFeedback(feedback);
            setShowDetailsModal(true);
        }
    };
    const handleViewClick2 = (feedback) => {
        setSelectedFeedback(feedback);
        setShowDetailsModal(true);
    };

    const handleRatingChange = (index, event) => {
        const rect = event.target.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const width = rect.width;
        const clickedRating = Math.ceil((clickX / width) * 5);
        const newRating = selectedFeedback.feedbackDetails[index].rating === clickedRating ? 0 : clickedRating;
        updateQuestionRating(index, newRating);
    };

    const updateQuestionRating = (index, newRating) => {
        const updatedFeedback = { ...selectedFeedback };
        updatedFeedback.feedbackDetails[index].rating = newRating;
        setSelectedFeedback(updatedFeedback);
    };


    const handleOverallRatingChange = (n) => {
        const newRating = selectedFeedback.overallRating === n ? 0 : n;
        updateOverallRating(newRating);
    };

    const updateOverallRating = (newRating) => {
        setSelectedFeedback({
            ...selectedFeedback,
            overallRating: newRating
        });
    };




    const editDropdownMenu = (item) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button
                        className={styles.button}
                        onClick={() => openPopup('leaveApprove', item)}
                        disabled={loading}
                    >
                        {loading ? '...' : ''}
                        Approve
                    </button>
                </div>
                <div>
                    <button
                        className={styles.button}
                        onClick={() => openPopup('leaveReject', item)}
                        disabled={loading}
                    >
                        {loading ? '' : ''}
                        Reject
                    </button>
                </div>
                <div>
                    <button
                        type='button'
                        onClick={() => handleViewClick(item)}
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    );

    const editdropdown = (item) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button
                        className={styles.button}
                        onClick={() => openPopup('expenseApprove', item)}
                        disabled={loading}
                    >     {loading ? '' : ''}
                        Approve
                    </button>
                </div>
                <div>
                    <button
                        className={styles.button}
                        onClick={() => openPopup('expenseReject', item)}
                        disabled={loading}
                    >     {loading ? '' : ''}
                        Reject
                    </button>
                </div>
                <div>
                    <button
                        type='button'
                        onClick={() => handleViewClick1(item)}
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    );
    const editdropdownfeedback = (feedback) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button
                        type='button'
                        onClick={() => handleViewClick2(feedback)}
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    )
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
        <>

            <div className={styles.container}>
                <div className='title'>All Requests</div>

                <h4 className={styles.h2}>Leave Applications</h4>
                <table className='Attendance-table'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>leave Reason</th>
                            <th>Total days</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Workflow Division</th>
                            <th>Workflow Department</th>
                            <th>Workflow Role</th>
                            <th>Request Status</th>
                            <th style={{ width: "5%" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {leaveData.map((item) => (
                            <tr key={item.id}>
                                <td className={styles.td}>{item.id}</td>
                                <td className={styles.td}>
                                    {item.employee ? item.employee.employeeId : 'N/A'}
                                </td>
                                <td className={styles.td}>
                                    {item.employee ? item.employee.firstName + ' ' + item.employee.lastName : 'N/A'}
                                </td>
                                <td> {item.reason}</td>
                                <td> {item.totalNoOfDays}</td>
                                <td>{item.fromDate}</td>
                                <td>{item.toDate}</td>
                                <td className={styles.td}>{item.workflowDivision}</td>
                                <td className={styles.td}>{item.workflowDepartment}</td>
                                <td className={styles.td}>{item.workflowRole}</td>
                                <td style={statusStyle(item.requestStatus)}>{item.requestStatus}</td>
                                <td className={styles.td}>
                                    {editDropdownMenu(item)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <br />

                <h4 className={styles.h2}>Expense Management</h4>
                <table className='Attendance-table'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee Id</th>
                            <th>Employee Name</th>
                            <th>Expense Name</th>
                            <th>Amount</th>
                            <th>Workflow Division</th>
                            <th>Workflow Department</th>
                            <th>Workflow Role</th>
                            <th>Request Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {expenseData.map((item) => (
                            <tr key={item.id}>
                                <td className={styles.td}>{item.id}</td>
                                <td className={styles.td}>
                                    {item.employee ? item.employee.employeeId : 'N/A'}
                                </td>
                                <td className={styles.td}>
                                    {item.employee ? item.employee.firstName + ' ' + item.employee.lastName : 'N/A'}
                                </td>
                                <td className={styles.td}>{item.expensePurpose}</td>
                                <td className={styles.td}>{item.expenseAmountSpent}</td>
                                <td className={styles.td}>{item.workflowDivision}</td>
                                <td className={styles.td}>{item.workflowDepartment}</td>
                                <td className={styles.td}>{item.workflowRole}</td>
                                <td style={statusStyle(item.requestStatus)}>{item.requestStatus}</td>

                                <td className={styles.td}>
                                    {editdropdown(item)}
                                </td>
                            </tr>
                        ))}

                    </tbody>
                    {showModal && (
                        <ViewLeave
                            employeeData={selectedLeave}
                            visible={showModal}
                            onClose={() => setShowModal(false)}
                            selectedLeaveId={selectedLeave ? selectedLeave.id : null}
                        />
                    )}
                    {showModal1 && (
                        <ViewExpense
                            employeeData={selectedExpense}
                            visible={showModal1}
                            onClose={() => setShowModal1(false)}
                            selectedExpense={selectedExpense ? selectedExpense.id : null}
                        />
                    )}
                    {showPopup && (

                        <div className='add-popup'>
                            {loading && <div className="loading-spinner"></div>}
                            <div className='popup-content'>
                                <h3>{popupType === 'leaveApprove' || popupType === 'expenseApprove' ? 'Approve Request' : 'Reject Request'}</h3>
                                <label htmlFor='name'>Employee Name</label>
                                <input type='text' id='name' name='name' value={formData.employeeName} onChange={handleInputChange} readOnly />
                                <label htmlFor='date'>Date</label>
                                <input type='text' id='date' name='date' value={popupData.date} onChange={handleInputChange} />
                                <label htmlFor='note'>Note</label>
                                <input type='text' id='note' name='note' value={popupData.note} onChange={handleInputChange} />
                                <label htmlFor='email'>Email ID</label>
                                <input type='email' id='email' name='email' value={popupData.email} onChange={handleInputChange} />
                                <div className='popup-buttons'>
                                    {popupType.includes('Approve') ? (
                                        <>
                                            <button type='button' className='btn' onClick={handleApprove}>{loading ? 'Approving...' : 'Approve'}</button>
                                            <button type='button' className='outline-btn' onClick={() => setShowPopup(false)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button type='button' className='btn' onClick={handleReject}>{loading ? 'Rejecting' : 'Reject'}</button>
                                            <button type='button' className='outline-btn' onClick={() => setShowPopup(false)}>Cancel</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </table>

                <h4 className={styles.h2}>Feedback Requests</h4>
                <table className="Attendance-table">
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(feedbacks) && feedbacks.length > 0 ? (
                            feedbacks.map((feedback, index) => (
                                <tr key={feedback.id} onClick={() => handleShowDetails(feedback)}>
                                    <td>{index + 1}</td>
                                    <td>{feedback.feedbackDescription}</td>

                                    <td>
                                        {feedback.approval ? (
                                            <span style={{ color: 'green', fontSize: '14px' }}>Approve</span>
                                        ) : (
                                            <span style={{ color: 'blue', fontSize: '14px' }}>Pending</span>
                                        )}
                                    </td>
                                    <td>
                                        {editdropdownfeedback(feedback)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2">No feedbacks available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {showDetailsModal && selectedFeedback && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <span className="close" onClick={() => setShowDetailsModal(false)}>&times;</span>
                            <div className="centre-heading">Feedback Details</div>
                            <div>
                                {selectedFeedback.feedbackDescription ? (
                                    <>
                                        <p style={{ textAlign: 'center' }}><strong>Overall Rating</strong></p>
                                        <div className="star-rating-container">
                                            {[1, 2, 3, 4, 5].map((starIndex) => (
                                                <span
                                                    key={starIndex}
                                                    className={`star ${starIndex <= selectedFeedback.overallRating ? 'filled' : ''}`}
                                                    onClick={() => handleOverallRatingChange(starIndex)}
                                                >
                                                    &#9733;
                                                </span>
                                            ))}
                                        </div>
                                        <p><strong>Feedback Description:</strong>{selectedFeedback.feedbackDescription}</p>
                                        <p><strong>Notes:</strong> {selectedFeedback.notes}</p>
                                        <div className='underlineText' style={{ textAlign: 'center' }}>Feedback Questions</div>
                                        <ul>
                                            {selectedFeedback.feedbackDetails && selectedFeedback.feedbackDetails.length > 0 ? (
                                                selectedFeedback.feedbackDetails.map((detail, index) => (
                                                    <li key={detail.id} className="feedback-container">
                                                        <p className="feedback-que-container">{index + 1} {detail.question}</p>
                                                        <div className="feedback-rating-container">
                                                            <label>Rating for this question:</label>
                                                            <div
                                                                className="feedback-level-indicator"
                                                                style={{ position: 'relative', height: '20px', width: '100%' }}
                                                                onClick={(e) => handleRatingChange(index, e)}
                                                            >
                                                                <div
                                                                    className={`level-fill rating-${detail.rating}`}
                                                                    style={{
                                                                        width: `${detail.rating === 0 ? 20 : (detail.rating / 5) * 100}%`,
                                                                        height: '100%',
                                                                        backgroundColor: detail.rating > 0 ? '#4CAF50' : '#FF5252',
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0
                                                                    }}
                                                                ></div>
                                                                <div
                                                                    className="level-text"
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: '50%',
                                                                        left: '50%',
                                                                        transform: 'translate(-50%, -50%)',
                                                                        fontWeight: 'bold',
                                                                        color: '#FFF'
                                                                    }}
                                                                >
                                                                    {detail.rating > 0 ? detail.rating : "0"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <p>No feedback details available.</p>
                                            )}
                                        </ul>
                                        <div className='btnContainer'>
                                            <button type='button' onClick={handleApproveFeedback} className='btn'> Approve Feedback </button>
                                        </div>
                                    </>
                                ) : (
                                    <p>No feedback description available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
export default AllRequests;
