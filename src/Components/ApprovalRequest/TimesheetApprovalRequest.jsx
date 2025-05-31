import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../../string";
import { showToast } from "../../Api.jsx";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TimesheetApprovalRequest = () => {
    const [timesheets, setTimesheets] = useState([]);
    const [selectedTimesheet, setSelectedTimesheet] = useState(null);
    const [expandedDays, setExpandedDays] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);  // New state for confirmation dialog
    const [actionToConfirm, setActionToConfirm] = useState(null);  // Store the action (approve or reject)
    const reportingManagerId = localStorage.getItem('employeeId');

    useEffect(() => {
        fetchTimesheets();
    }, []);

    const fetchTimesheets = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/timesheetmain/timesheets/pending/1`);
            setTimesheets(response.data);
        } catch (error) {
            console.error("Error fetching timesheets:", error);
        }
    };

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-');
    };

    const handleShowDetails = (timesheet) => {
        setSelectedTimesheet(timesheet);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTimesheet(null);
    };

    const toggleDayDetails = (dayId) => {
        setExpandedDays(prevState => ({
            ...prevState,
            [dayId]: !prevState[dayId]
        }));
    };

    const handleApprove = async () => {
        if (!selectedTimesheet) {
            console.error("No timesheet selected for approval.");
            return;
        }

        try {
            const response = await axios.put(`http://${strings.localhost}/api/timesheetmain/timesheets/approveOrReject/${selectedTimesheet.id}?approved=true&rejected=false`);
            showToast("Timesheet approved successfully.", 'success');
            handleCloseModal();
            fetchTimesheets();
        } catch (error) {
            console.error("Error approving timesheet:", error);
            showToast("Failed to approve timesheet. Please try again.", 'error');
        }
    };

    const handleReject = async () => {
        if (!selectedTimesheet) {
            showToast("No timesheet selected for approval.", 'warn');
            return;
        }

        try {
            const response = await axios.put(`http://${strings.localhost}/api/timesheetmain/timesheets/approveOrReject/${selectedTimesheet.id}?approved=false&rejected=true`);
            showToast("Timesheet rejected successfully", 'success');
            handleCloseModal();
            fetchTimesheets();
        } catch (error) {
            console.error("Error rejecting timesheet:", error);
            showToast("Failed to reject timesheet. Please try again.", 'error');
        }
    };

    const handleApproveWithConfirmation = () => {
        setActionToConfirm('approve');
        setShowModal(false);
        setShowConfirmationDialog(true);
    };

    const handleRejectWithConfirmation = () => {
        setActionToConfirm('reject');
        setShowModal(false);
        setShowConfirmationDialog(true);
    };

    const handleConfirmAction = () => {
        if (actionToConfirm === 'approve') {
            handleApprove();
        } else if (actionToConfirm === 'reject') {
            handleReject();
        }
        setShowConfirmationDialog(false);
    };

    const handleCancelAction = () => {
        setShowConfirmationDialog(false);
    };

    const editdropdownTimesheet = (timesheet) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">

                <div>
                    <button type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleShowDetails(timesheet);
                        }}> View </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className='coreContainer'>
            <table className='interview-table'>
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Employee Id</th>
                        <th>Employee Name</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Send For Approval On </th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {timesheets.length > 0 ? (
                        timesheets.map((timesheet, index) => (
                            <tr key={timesheet.id} onClick={() => handleShowDetails(timesheet)} style={{ cursor: "pointer" }}>
                                <td>{index + 1}</td>
                                <td  style={{ cursor: 'pointer', color: 'blue' }}>{timesheet.employee?.employeeId}</td>
                                <td>{timesheet.employee?.firstName || "N/A"}</td>
                               
                                <td>{formatDate(timesheet.fromDate)}</td>
                                <td>{formatDate(timesheet.toDate)}</td>
                                {/* <td>{timesheet.requestStatus || "Pending"}</td> */}
                                <td>{timesheet.dateSendForApproval || "N/A"}</td>
                                <td>{editdropdownTimesheet(timesheet)}</td>
                                {/* <td>
                                    <button type="button" className="textbutton" onClick={(e) => { e.stopPropagation(); handleShowDetails(timesheet); }}>
                                        Show Details
                                    </button>
                                </td> */}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="no-data1">No pending timesheets found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {showModal && selectedTimesheet && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h3>Timesheet Details</h3>
                        <table className="Attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Total Time</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedTimesheet.timesheetDays && selectedTimesheet.timesheetDays.length > 0 ? (
                                    selectedTimesheet.timesheetDays.map((day) => (
                                        <React.Fragment key={day.id}>
                                            <tr onClick={() => toggleDayDetails(day.id)} style={{ cursor: "pointer" }}>
                                                <td>{formatDate(day.date)}</td>
                                                <td>{day.dayStartTime}</td>
                                                <td>{day.dayEndTime}</td>
                                                <td>{day.totalTime}</td>
                                                <td>
                                                    <button className="textbutton" onClick={(e) => { e.stopPropagation(); toggleDayDetails(day.id); }}>
                                                        {expandedDays[day.id] ? "Hide Details" : "Show Details"}
                                                    </button>
                                                </td>
                                            </tr>

                                            {expandedDays[day.id] && day.timesheetDayDetails && day.timesheetDayDetails.length > 0 && (
                                                <tr className="details-row">
                                                    <td colSpan="5">
                                                        <table className="nested-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Task Name</th>
                                                                    <th>Hours Spent</th>
                                                                    <th>Description</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {day.timesheetDayDetails.map((detail) => (
                                                                    <tr key={detail.id}>
                                                                        <td>{detail.taskName}</td>
                                                                        <td>{detail.hoursSpent}</td>
                                                                        <td>{detail.taskDescription}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">No timesheet details available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className='form-controls'>
                            <button className='btn' type='button' onClick={handleApproveWithConfirmation}>Approve</button>
                            <button className='outline-btn' type='button' onClick={handleRejectWithConfirmation}>Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmationDialog && (
                <div className="add-popup">
                    <div>
                        <h3 style={{ textAlign: 'center' }}>Are you sure?</h3>
                        <p style={{ textAlign: 'center' }}>Do you want to {actionToConfirm} this timesheet?</p>
                        <div className="btnContainer">
                            <button type="button" className="btn" onClick={handleConfirmAction}>Yes</button>
                            <button type="button" className="outline-btn" onClick={handleCancelAction}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimesheetApprovalRequest;
