import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import PersonalDetails from "./PersonalDetails";
import EducationDetails from "./EducationDetails";
import EmployeeMentHistory from "./EmployeeMentHistory";
import { strings } from "../../string";
import ConfirmationPopup from "./ConfirmationPopup";
import EmployeeDocuments from "./EmployeeDocuments";
import AllDetailsView from "./AllDetailsView";
import { showToast } from "../../Api.jsx";

const Tickets = () => {
    const [activeTickets, setActiveTickets] = useState([]);
    const [pendingTickets, setPendingTickets] = useState([]);
    const [completedTickets, setCompletedTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // Tracks the current step (1, 2, or 3)
    const [ticketDetails, setTicketDetails] = useState(null);
    const preRegId = localStorage.getItem("Id");
    const preLoginToken = localStorage.getItem("PreLoginToken");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [ticketNote, setTicketNote] = useState("");
    const [loadingNote, setLoadingNote] = useState(false);

    const toArray = (data) => Array.isArray(data) ? data : data ? [data] : [];

    useEffect(() => {
        axios
            .get(`http://${strings.localhost}/api/verification/ticket/byToken?token=${preLoginToken}&preRegId=${preRegId}`)
            .then((response) => setActiveTickets(toArray(response.data)))
            .catch((error) => console.error("Error fetching active tickets:", error));

        axios
            .get(`http://${strings.localhost}/api/verification/pendingEmployeeActions?preRegistrationId=${preRegId}&preLoginToken=${preLoginToken}`)
            .then((response) => setPendingTickets(toArray(response.data)))
            .catch((error) => console.error("Error fetching pending tickets:", error));

        axios
            .get(`http://${strings.localhost}/api/verification/completedEmployeeActions?preRegistrationId=${preRegId}&preLoginToken=${preLoginToken}`)
            .then((response) => setCompletedTickets(toArray(response.data)))
            .catch((error) => console.error("Error fetching completed tickets:", error));
    }, []);



    const handleCardClick = (ticket) => {
        setSelectedTicket(ticket);
        setTicketDetails(ticket);
        setShowModal(true);
    };

    const handleViewCardClick = (ticket) => {
        setSelectedTicket(ticket);
        setTicketDetails(ticket);
        setShowViewModal(true);
    }
    const handleVerification = (ticket) => {
        setSelectedTicket(ticket);
        setTicketDetails(ticket);
        setShowConfirmation(true);
    }
    const closeModal = () => {
        setShowModal(false);
        setCurrentStep(1);
        setSelectedTicket(null);
    };
    const closeConfirmationModal = () => {
        setShowConfirmation(false);
        setSelectedTicket(null);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedTicket(null);
    }
    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    };
    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };
    const sendForVerification = () => {
        axios

            .put(`http://${strings.localhost}/api/verification/ticket/sendForVerification/${preRegId}`)
            .then(() => {
                showToast("Ticket sent for verification!", 'success');
                closeModal();
                onClose();
            })
            .catch((error) => console.error("Error sending for verification:", error));
    };

    const editDropdown = (ticket, status) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <button type="button" onClick={() => handleCardClick(ticket)}>Add Details</button>
                {status === "Pending" && (
                    <button type="button" onClick={() => handleVerification(ticket)}>Send For Verification</button>
                )}
            </div>
        </div>
    );

    const fetchTicketNote = async () => {
        setLoadingNote(true);
     
        try {
            const response = await axios.get(`http://${strings.localhost}/api/verificationTicketNote/verificationTicketNotes/${selectedTicket.id}`);
     
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const noteText = response.data[0].note;
                setTicketNote(noteText);
                console.log("Ticket Note:", noteText);
            } else {
                setTicketNote("No note available.");
            }
        } catch (error) {
            console.error("Error fetching ticket note:", error);
            setTicketNote("Failed to load note.");
        } finally {
            setLoadingNote(false);
        }
    };


    useEffect(() => {
        if (selectedTicket && selectedTicket.id) {
            fetchTicketNote();
        }
    }, [selectedTicket]);


    const editDropdownForCompleted = (ticket) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <button type="button" onClick={() => handleViewCardClick(ticket)}>View</button>
            </div>
        </div>
    );
    const renderTickets = (tickets, status) => {
        return tickets.length > 0 ? (
            tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card">


                    <div className="ticket-right">
                        <div className="ticket-header">
                            <h4>{ticket.preRegistration?.firstName} {ticket.preRegistration?.lastName}</h4>
                            {(status === "Active" || status === "Pending") && <div className="top-header">{editDropdown(ticket, status)}</div>}
                            {(status === "Complete") && <div className="top-header">{editDropdownForCompleted(ticket)}</div>}
                        </div>
                        <div className="ticket-divider-circles"></div>
                        <div className="ticket-divider"></div>
                        <div className="ticket-details">
                            <p><strong>Date:</strong> {ticket.date || "N/A"}</p>
                            <p><strong>Company:</strong> {ticket.company?.companyName || "N/A"}</p>
                            <p><strong>Email:</strong> {ticket.preRegistration?.email}</p>
                        </div>
                    </div>

                    <div className="ticket-left ticket-status">
                        <p><strong>Status:</strong> <span className={status.toLowerCase()}>{status}</span></p>
                        <p><strong>Sent for Verification:</strong>
                            <span className={ticket.sendForVerification ? "sent" : "pending"}>
                                {ticket.sendForVerification ? "Sent" : "Pending"}
                            </span>
                        </p>
                        <p><strong>Verification:</strong>
                            <span className={ticket.verificationStatus ? "Done" : "pending"}>
                                {ticket.verificationStatus ? "Completed" : "Pending"}
                            </span>
                        </p>

                        <p><strong>Your Action:</strong>
                            <span className={ticket.employeeAction ? "Done" : "pending"}>
                                {ticket.employeeAction ? "Taken" : "Pending"}
                            </span>
                        </p>
                        <p><strong>HR Action:</strong>
                            <span className={ticket.reportingPersonAction ? "Done" : "pending"}>
                                {ticket.reportingPersonAction ? "Completed" : "Pending"}
                            </span>
                        </p>
                        <p><strong>Sent Back :</strong>
                            <span className={ticket.sentBack ? "Done" : "pending"}>
                                {ticket.sentBack ? "Sent" : "Not sent"}
                            </span>
                        </p>
                    </div>
                </div>



            ))
        ) : (
            <p className="error-message">No Tickets</p>
        );
    };



    return (
        <>
            <div className="kanban-container" style={{ marginTop: "50px" }}>
                <div className="kanban-column">
                    <h3>Active Tickets</h3>
                    {renderTickets(activeTickets, "Active")}
                </div>
                <div className="kanban-column">
                    <h3>Pending Tickets</h3>
                    {renderTickets(pendingTickets, "Pending")}
                </div>
                <div className="kanban-column">
                    <h3>Completed Tickets</h3>
                    {renderTickets(completedTickets, "Complete")}
                </div>
            </div>

            {/* Modal Popup */}
            {showModal && selectedTicket && !loadingNote && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-btn" onClick={closeModal}>X</button>

                        <div className="step-indicator1">
                            <div
                                className={`steps ${currentStep > 1 ? 'completed' : 'active'}`}
                                onClick={() => setCurrentStep(1)}
                            >
                                {currentStep > 1 ? '✅' : '1'}
                            </div>
                            <div className="steps-line"></div>
                            <div
                                className={`steps ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(2)}
                            >
                                {currentStep > 2 ? '✅' : '2'}
                            </div>
                            <div className="steps-line"></div>
                            <div
                                className={`steps ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(3)}
                            >
                                {currentStep > 3 ? '✅' : '3'}
                            </div>
                            <div className="steps-line"></div>
                            <div
                                className={`steps ${currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(4)}
                            >
                                {currentStep > 4 ? '✅' : '4'}
                            </div>

                        </div>
                        <div className="ticket-note">
                            <strong>Note:</strong>
                            <p>{ticketNote?.trim() ? ticketNote : "No notes for this ticket."}</p>
                        </div>

                        {currentStep === 1 && (
                            <PersonalDetails
                                ticketDetails={ticketDetails}
                                ticket={selectedTicket}
                                ticketId={selectedTicket.id}
                                nextStep={nextStep}
                                prevStep={prevStep}
                            />
                        )}
                        {currentStep === 2 && (
                            <EducationDetails
                                ticketDetails={ticketDetails}
                                nextStep={nextStep}
                                prevStep={prevStep}
                            />
                        )}
                        {currentStep === 3 && (
                            <EmployeeMentHistory
                                ticketDetails={ticketDetails}
                                prevStep={prevStep}
                                nextStep={nextStep}
                            />
                        )}
                        {currentStep === 4 && (
                            <EmployeeDocuments
                                ticketDetails={ticketDetails}
                                ticket={selectedTicket}
                                ticketId={selectedTicket.id}
                                onFinishStep={() => {
                                    setShowModal(false);
                                    setShowConfirmation(true);
                                }}
                            />
                        )}

                    </div>
                </div>
            )}
            {showConfirmation && (
                <ConfirmationPopup
                    ticketDetails={ticketDetails}
                    sendForVerification={sendForVerification}
                    onClose={closeConfirmationModal}
                />
            )}
            {showViewModal && selectedTicket && (
                <AllDetailsView
                    ticketDetails={ticketDetails}
                    ticket={selectedTicket}
                    verificationTicketId={selectedTicket?.id}
                    onClose={closeViewModal}
                />
            )}


        </>
    );
};

export default Tickets;
