import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../../string";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { showToast } from "../../Api.jsx";
import CandidatedetailsView from "./CandidatedetailsView.jsx";

const TicketsView = () => {
    const [isFromActionTaken, setIsFromActionTaken] = useState(false);
    const [verifiedTickets, setVerifiedTickets] = useState({});
    const [isSendingTicket, setIsSendingTicket] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const companyId = localStorage.getItem('companyId');
    const employeeId = localStorage.getItem("employeeId");
    const [completeVerificationStatus, setCompleteVerificationStatus] = useState(false);
    const [selectedPreRegistrationId, setSelectedPreRegistrationId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [employeeToNotify, setEmployeeToNotify] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showCandidateDetails, setShowCandidateDetails] = useState(false);
    const [pendingTickets, setPendingTickets] = useState([]);
    const [actionTakenTickets, setActionTakenTickets] = useState([]);
    const verifiedIcon = "/assets/Verified3.png";
    const [expandedColumns, setExpandedColumns] = useState({
        all: true,
        pending: true,
        taken: true
    });

    const toggleColumn = (columnKey) => {
        setExpandedColumns(prev => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    useEffect(() => {
        // Fetch Pending Tickets
        axios
            .get(`http://${strings.localhost}/api/verification/pendingByReportingPerson/${employeeId}`)
            .then((response) => {
                setPendingTickets(response.data);
            })
            .catch((error) => {
                console.error("Error fetching pending tickets:", error);
            });

        // Fetch Action Taken Tickets
        axios
            .get(`http://${strings.localhost}/api/verification/latest-verified/${companyId}`)
            .then((response) => {
                setActionTakenTickets(response.data);
            })
            .catch((error) => {
                console.error("Error fetching action taken tickets:", error);
            });

        // Fetch employees for kanban view
        axios
            .get(`http://${strings.localhost}/api/verification/active-by-company?companyId=${companyId}`)
            .then((response) => {
                const employeeList = response.data;
                setEmployees(employeeList);


                employeeList.forEach(async (employee) => {
                    try {
                        const preregistrationId = employee.preRegistration?.id;
                        setSelectedPreRegistrationId(preregistrationId);
                        const [personalRes, eduRes, empRes] = await Promise.all([
                            axios.get(`http://${strings.localhost}/api/employeedata/get-by-prereg?preRegistrationId=${preregistrationId}&preLoginToken=${employee.preRegistration?.preLoginToken}`),
                            axios.get(`http://${strings.localhost}/api/education/getByVerificationAndToken?verificationId=${employee.id}&preLoginToken=${employee.preRegistration?.preLoginToken}`),
                            axios.get(`http://${strings.localhost}/api/employment-data/getByVerificationAndToken?verificationId=${employee.id}&preLoginToken=${employee.preRegistration?.preLoginToken}`)
                        ]);

                        console.log("Personal Data Verification Status:", personalRes.data?.verificationStatus);
                        console.log("Education Data Verification Status:", eduRes.data.map(e => e.verificationStatus));
                        console.log("Employment Data Verification Status:", empRes.data.map(e => e.verificationStatus));

                        const isVerified =
                            personalRes.data?.verificationStatus === true &&
                            eduRes.data.every(edu => edu.verificationStatus === true) &&
                            empRes.data.every(emp => emp.verificationStatus === true);

                        console.log("Is Employee Verified:", isVerified);

                        if (isVerified) {
                            setVerifiedTickets(prev => ({
                                ...prev,
                                [employee.preRegistration?.id]: true
                            }));
                        } else {
                            setVerifiedTickets(prev => ({
                                ...prev,
                                [employee.preRegistration?.id]: false
                            }));
                        }
                    } catch (err) {
                        console.error("Error checking verification for:", employee.id, err);
                    }
                });

            })
            .catch((error) => {
                console.error("Error fetching employees:", error);
            });
    }, []);

    const handleSendTicketClick = (employee) => {
        setEmployeeToNotify(employee);
        setShowModal(true);
    };

    const handleGenrateTicketClick = (employee) => {
        setSelectedEmployee(employee);
        setShowConfirmation(true);
        setShowModal(false);
    };


    const handleViewDetails = (employee) => {
        setSelectedEmployee(employee);
        setShowModal(true);
    };

    const handleViewDetailsPending = (employee) => {
        setSelectedEmployee(employee);
        setShowCandidateDetails(true);
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setEmployeeToNotify(null);
    };
    const closeModal = () => {
        setShowModal(false);
        setEmployeeToNotify(null);
    }
    const handleGenerateTicket = async () => {
        if (!selectedPreRegistrationId) {
            showToast("No employee selected or employee ID is missing.", 'error');
            return;
        }

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/verification/create?companyId=${companyId}&reportingPersonId=${employeeId}&preRegistrationId=${selectedPreRegistrationId}`
            );

            if (response.data) {
                console.log(response.data, 'response');
                showToast(response.data || "Ticket generated successfully.", 'success');
            } else {
                showToast(response.data || "Failed to generate ticket.", 'error');
            }

            setShowConfirmation(false);
        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data || "An error occurred while generating the ticket.";
                showToast(errorMessage, 'error');
                console.error("Error response:", error.response);
            } else {
                showToast("An unknown error occurred.", 'error');
                console.error("Error generating ticket:", error);
            }
        }
    };

    const editDropdown = (employee, isActionTaken = false) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">

                <button type='button' onClick={() => handleViewDetails(employee)}>
                    Send Ticket
                </button>
                <button type='button' onClick={() => handleSendTicketClick(employee)}>
                    View
                </button>

            </div>
        </div>
    );

    const handleViewDetailsFromActionTaken = (employee) => {
        setSelectedEmployee(employee);
        setShowCandidateDetails(true);
        setIsFromActionTaken(true);
    };

    const editDropdownPending = (employee, isActionTaken = false) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                {!isActionTaken ? (
                    <button type='button' onClick={() => handleViewDetailsPending(employee)}>
                        View
                    </button>
                ) : (
                    <button type='button' onClick={() => handleViewDetailsFromActionTaken(employee)}>
                        View
                    </button>
                )}
            </div>
        </div>
    );
    const confirmSendTicket = () => {
        if (!selectedPreRegistrationId) return;
        setIsSendingTicket(true);
        axios
            .put(`http://${strings.localhost}/api/verification/notify/${selectedPreRegistrationId}`)
            .then(() => {
                showToast("Ticket sent successfully", 'success');
                window.location.reload();
            })
            .catch((error) => {
                console.error("Error sending ticket:", error);

                // Try to show a meaningful message from the server response
                if (error.response && error.response.data && error.response.data.message) {
                    showToast(`Failed to send ticket: ${error.response.data.message}`, 'error');
                } else {
                    showToast("Failed to send Ticket. Please try again later.", 'error');
                }
            })
            .finally(() => {
                setIsSendingTicket(false);
                setShowConfirmModal(false);
                setEmployeeToNotify(null);
            });
    };
    return (
        <div className="coreContainer">
            <h3 className="title">Candidate List</h3>
            <div className="kanban-container" style={{ marginTop: '50px' }}>
                <div className={`kanban-column ${!expandedColumns.all ? 'collapsed' : ''}`}>
                    <div className="column-header">
                        <h3>All Tickets</h3>
                        <div className="header-controls">
                            <span className="badge">{employees.length}</span>
                            <button className="toggle-btn" onClick={() => toggleColumn('all')}>
                                {expandedColumns.all ? "−" : "+"}
                            </button>
                        </div>
                    </div>

                    {expandedColumns.all ? (
                        employees.length > 0 ? (
                            employees.map((employee) => (
                                <div key={employee.id} className="kanban-card">
                                    <div className="details">
                                        <h4>{employee.preRegistration?.firstName} {employee.preRegistration?.lastName}</h4>
                                        <hr />
                                        <p>
                                            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: "6px", color: "#2980b9" }} />
                                            {employee.date}
                                        </p>
                                        <p>
                                            <strong>Sent to employee:</strong>{" "}
                                            <span className={employee.sentForEmployeeAction ? "status-completed" : "status-pending"}>
                                                {employee.sentForEmployeeAction ? "Completed" : "Pending"}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Employee Action:</strong>{" "}
                                            <span className={employee.employeeAction ? "status-completed" : "status-pending"}>
                                                {employee.employeeAction ? "Completed" : "Pending"}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Sent back:</strong>{" "}
                                            <span className={employee.sentBack ? "status-completed" : ""}>
                                                {employee.sentBack ? "Yes" : "No"}
                                            </span>
                                        </p>
                                        <div className="top-header">
                                            {editDropdown(employee)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="error-message">No Active Tickets</p>
                        )
                    ) : null}
                </div>

                <div className={`kanban-column ${!expandedColumns.pending ? 'collapsed' : ''}`}>
                    <div className="column-header">
                        <h3>Pending Tickets</h3>
                        <div className="header-controls">
                            <span className="badge">{pendingTickets.length}</span>
                            <button className="toggle-btn" onClick={() => toggleColumn('pending')}>
                                {expandedColumns.pending ? "−" : "+"}
                            </button>
                        </div>
                    </div>
                    {expandedColumns.pending && (
                        pendingTickets.length > 0 ? (
                            pendingTickets.map(employee => (
                                <div key={employee.id} className="kanban-card">
                                    <div className="details">
                                        <h4>{employee.preRegistration?.firstName} {employee.preRegistration?.lastName}</h4>
                                        <hr />
                                        <p>
                                            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: "6px", color: "#2980b9" }} />
                                            {employee.date}
                                        </p>
                                        <p>
                                            <strong>Sent to employee:</strong>{" "}
                                            <span className={employee.sentForEmployeeAction ? "status-completed" : "status-pending"}>
                                                {employee.sentForEmployeeAction ? "Completed" : "Pending"}
                                            </span>
                                        </p>
                                        {verifiedTickets[employee.preRegistration?.id] && (
                                            <div className="verified-section">
                                                <img src={verifiedIcon} alt="Verified" className="verified-icon" />
                                                <span className="verified-text">Verified</span>
                                            </div>
                                        )}

                                        <p>
                                            <strong>Employee Action:</strong>{" "}
                                            <span className={employee.employeeAction ? "status-completed" : "status-pending"}>
                                                {employee.employeeAction ? "Completed" : "Pending"}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Sent back:</strong>{" "}
                                            <span className={employee.sentBack ? "status-completed" : ""}>
                                                {employee.sentBack ? "Yes" : "No"}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="top-header">
                                        {editDropdownPending(employee)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="error-message">No Pending Tickets</p>
                        )
                    )}
                </div>
                <div className={`kanban-column ${!expandedColumns.taken ? 'collapsed' : ''}`}>
                    <div className="column-header">
                        <h3>Action Taken</h3>
                        <div className="header-controls">
                            <span className="badge">{actionTakenTickets.length}</span>
                            <button className="toggle-btn" onClick={() => toggleColumn('taken')}>
                                {expandedColumns.taken ? "−" : "+"}
                            </button>
                        </div>

                    </div>

                    {expandedColumns.taken && (
                        actionTakenTickets.length > 0 ? (
                            actionTakenTickets.map(employee => (
                                <div key={employee.id} className="kanban-card">
                                    <div className="details">
                                        <h4>{employee.preRegistration?.firstName} {employee.preRegistration?.lastName}</h4>
                                        <hr />
                                        <p>
                                            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: "6px", color: "#2980b9" }} />
                                            {employee.date}
                                        </p>
                                        {verifiedTickets[employee.preRegistration?.id] && (
                                            <div className="verified-section">
                                                <img src={verifiedIcon} alt="Verified" className="verified-icon" />
                                                <span className="verified-text">Verified</span>
                                            </div>
                                        )}
                                        <p>
                                            <strong>Sent to employee:</strong>{" "}
                                            <span className={employee.sentForEmployeeAction ? "status-completed" : "status-pending"}>
                                                {employee.sentForEmployeeAction ? "Completed" : "Pending"}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Employee Action:</strong>{" "}
                                            <span className={employee.employeeAction ? "status-completed" : "status-pending"}>
                                                {employee.employeeAction ? "Completed" : "Pending"}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Sent back:</strong>{" "}
                                            <span className={employee.sentBack ? "status-completed" : ""}>
                                                {employee.sentBack ? "Yes" : "No"}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="top-header">
                                        {editDropdownPending(employee, true)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="error-message">No Tickets</p>
                        )
                    )}
                </div>
            </div>
            {showModal && !employeeToNotify && selectedEmployee && (
                <div className="add-popup">
                    <div>
                        <h5 className="centerText">Send Offer</h5>
                        <button className="close-button" onClick={closeModal}>
                            &times;
                        </button>
                        <div>
                            <p><strong>Company Name:</strong> {selectedEmployee.company?.companyName}</p>
                            <p><strong>Candidate Name:</strong> {selectedEmployee.preRegistration?.firstName} {selectedEmployee.preRegistration?.lastName}</p>
                            <p><strong>Email Id:</strong> {selectedEmployee.preRegistration?.email}</p>
                            <p><strong>Ticket Generated:</strong> {selectedEmployee.preRegistration?.offerGenerated ? "Yes" : "No"}</p>
                            <p><strong>Employee Action:</strong> {selectedEmployee.employeeAction ? "Taken" : "Pending"}</p>
                            <p><strong>Date:</strong> {selectedEmployee.date}</p>
                        </div>
                        <div className="btnContainer">
                            <button type="button" className="outline-btn" onClick={closeModal}>Close</button>
                            <button
                                type="button"
                                className="btn"
                                onClick={() => {
                                    setEmployeeToNotify(selectedEmployee);
                                    setShowModal(false);
                                    setShowConfirmModal(true);
                                }}
                            >
                                Send Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showModal && employeeToNotify && (
                <div className="add-popup">
                    <div>
                        <h5 className="centerText">Candidate Details</h5>
                        <button className="close-button" onClick={closeModal}>
                            &times;
                        </button>
                        <div>
                            <p><strong>Date:</strong> {employeeToNotify.date}</p>
                            <p><strong>Company Name:</strong> {employeeToNotify.company?.companyName}</p>
                            <p><strong>Candidate Name:</strong> {employeeToNotify.preRegistration?.firstName} {employeeToNotify.preRegistration?.lastName}</p>
                            <p><strong>Email Id:</strong> {employeeToNotify.preRegistration?.email}</p>
                            <p><strong>Ticket Generated:</strong> {employeeToNotify.preRegistration?.offerGenerated ? "Yes" : "No"}</p>
                            <p><strong>Employee Action:</strong> {employeeToNotify.employeeAction ? "Taken" : "Pending"}</p>
                        </div>
                        <div className="btnContainer">
                            <button type="button" className="outline-btn" onClick={closeModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && employeeToNotify && (
                <div className="add-popup">
                    <div>
                        <button className="close-button" onClick={closeConfirmModal}>&times;</button>
                        <h5 className="centerText">Confirm Send Ticket</h5>
                        <p style={{ textAlign: 'center' }}>Are you sure you want to send an Ticket to <strong>{employeeToNotify.preRegistration?.firstName} {employeeToNotify.preRegistration?.lastName}</strong>?</p>
                        <div className="btnContainer">
                            <button type="button" className="btn" onClick={confirmSendTicket} disabled={isSendingTicket}>
                                {isSendingTicket ? (
                                    <div className="loading-spinner"></div>
                                ) : null}
                                {isSendingTicket ? "Sending..." : "Yes"}</button>
                            <button type="button" className="outline-btn" onClick={closeConfirmModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {showConfirmation && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to Genrate Ticket?</p>
                    <div className="btnContainer">
                        <button className="btn" onClick={handleGenerateTicket}> Yes </button>
                        <button className="outline-btn" onClick={() => setShowConfirmation(false)}> No </button>
                    </div>
                </div>
            )}
            {showCandidateDetails && selectedEmployee && (
                <CandidatedetailsView
                    preRegistrationId={selectedEmployee.preRegistration?.id}
                    preLoginToken={selectedEmployee.preRegistration?.preLoginToken}
                    verificationTicketId={selectedEmployee.id}
                    onClose={() => setShowCandidateDetails(false)}
                    onVerificationStatusChange={setCompleteVerificationStatus}
                    fromActionTaken={isFromActionTaken} />
            )}

        </div>
    );
};

export default TicketsView;
