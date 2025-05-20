import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import Offer from "./Offer";
import { strings } from "../../string";
import { showToast } from "../../Api.jsx";
import CandidatedetailsView from "../Ticketgenration/CandidatedetailsView.jsx";
import ViewOfferHR from "./ViewOfferHR.jsx";

const ListOfCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const companyId = localStorage.getItem("companyId");
    const [page, setPage] = useState(0);
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());
    const [totalPages, setTotalPages] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [employeeToNotify, setEmployeeToNotify] = useState(null);
    const [isSendingTicket, setIsSendingTicket] = useState(false);
    const [selectedPreRegistrationId, setSelectedPreRegistrationId] = useState(null);
    const [showCandidateDetails, setShowCandidateDetails] = useState(false);
    const [isFromActionTaken, setIsFromActionTaken] = useState(false);
    const [completeVerificationStatus, setCompleteVerificationStatus] = useState(false);
    const [showGenrateConfirmation, setShowGenrateConfirmation] = useState(false);
    const employeeId = localStorage.getItem("employeeId");
    const [showViewOfferPopup, setShowViewOfferPopup] = useState(false);
    const pastYears = 5;
    const futureYears = 3;

    const fetchCandidates = async () => {
        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/preregistration/by-company-month-year`,
                {
                    params: {
                        companyId,
                        month,
                        year,
                        page,
                        size: 10,
                    },
                }
            );
            setCandidates(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [month, year, page]);


    const confirmSendTicket = () => {
        if (!selectedPreRegistrationId) return;
        setIsSendingTicket(true);

        axios
            .put(`http://${strings.localhost}/api/verification/notify/${selectedPreRegistrationId}`)
            .then(() => {
                showToast("Ticket sent successfully", 'success');
                fetchCandidates();
            })
            .catch((error) => {
                console.error("Error sending ticket:", error);
                const message = error?.response?.data || "Please try again later.";
                showToast(`Failed to send ticket: ${message}`, 'error');
            })
            .finally(() => {
                setIsSendingTicket(false);
                setShowConfirmModal(false);
                setEmployeeToNotify(null);
            });
    };

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
                showToast("Ticket generated successfully.", 'success');
            } else {
                showToast(response.data || "Failed to generate ticket.", 'error');
            }

            setShowGenrateConfirmation(false);
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

    const handleMonthChange = (e) => {
        setMonth(Number(e.target.value));
        setPage(0);
    };

    const handleYearChange = (e) => {
        setYear(Number(e.target.value));
        setPage(0);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleViewClick = (candidate) => {
        setSelectedEmployee(candidate);
        setShowPopup(true);
    };

    const handleOfferView = (candidate) => {
        setSelectedEmployee(candidate);
   setShowViewOfferPopup(true);
    }
    const handleViewDetails = (candidate) => {
        setEmployeeToNotify(candidate);
        setSelectedPreRegistrationId(candidate?.id);
        setShowConfirmModal(true);
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setEmployeeToNotify(null);
        setSelectedPreRegistrationId(null);
    };

    const handlegenrateTicket = (candidate) => {
        setEmployeeToNotify(candidate);
        setSelectedPreRegistrationId(candidate?.id);
        setShowGenrateConfirmation(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedEmployee(null);
    };

    const closeOfferPopup = () => {
        setShowViewOfferPopup(false);
        setSelectedEmployee(null);
    }
    const handleCandidateDetails = (candidate) => {
        console.log("Selected candidate:", candidate);
        setSelectedEmployee(candidate);
        setShowCandidateDetails(true);
        setIsFromActionTaken(true);
    };

    const editDropdown = (candidate) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button type="button" onClick={() => handleViewClick(candidate)}>
                        Create Offer
                    </button>
                </div>
                <div>
                    <button type="button" onClick={() => handleOfferView(candidate)}>
                        View offers
                    </button>
                </div>
                <div>
                    <button type="button" onClick={() => handleCandidateDetails(candidate)}>
                        View Details
                    </button>
                </div>
                <div>
                    <button type='button' onClick={() => handlegenrateTicket(candidate)}>
                        Genrate  Ticket
                    </button>
                </div>
                <div>
                    <button type='button' onClick={() => handleViewDetails(candidate)}>
                        Send Ticket
                    </button>
                </div>
            </div>
        </div>
    );

    const getInitials = (firstName, lastName) => {
        if (!firstName || !lastName) return '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getInitialsColorSet = (index) => {
        const colorSets = [
            ['#0057A3', '#FBB03B'],
            ['#FF66B2', '#00BFFF'],
            ['#FF6347', '#4682B4'],
            ['#32CD32', '#FFD700'],
            ['#FF1493', '#00FA9A'],
            ['#8A2BE2', '#00FFFF'],
            ['#FF4500', '#2E8B57'],
            ['#D2691E', '#8B0000'],
            ['#9932CC', '#FF8C00'],
            ['#A52A2A', '#20B2AA'],
        ];
        return colorSets[index % colorSets.length];
    };


    return (
        <div className="coreContainer">
            <h1 className="title">Candidate List</h1>
            <div className="middleline-btn">
                <div>
                    <label>
                        Month:
                        <select value={month} onChange={handleMonthChange}>
                            {[...Array(12)].map((_, index) => {
                                const monthNumber = index + 1;
                                const monthName = new Date(0, index).toLocaleString('default', { month: 'long' }); // "January", "February", etc.
                                return (
                                    <option key={monthNumber} value={monthNumber}>
                                        {monthName}
                                    </option>
                                );
                            })}
                        </select>
                    </label>
                </div>

                <div>
                    <label>
                        Year:
                        <select value={year} onChange={handleYearChange}>
                            {Array.from({ length: pastYears + futureYears + 1 }, (_, i) => {
                                const year = new Date().getFullYear() - pastYears + i;
                                return (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                );
                            })}
                        </select>
                    </label>
                </div>
            </div>
            <table className="interview-table">
                <thead>
                    <tr>

                        <th>ID</th>
                        <th>Employee Name</th>
                        <th>Date</th>
                        <th>Created By</th>
                        <th>Action</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.length > 0 ? (
                        candidates.map((candidate, index) => {
                            const [color1, color2] = getInitialsColorSet(index);
                            return (
                                <tr key={candidate.id}>
                                    <td> {index + 1} </td>
                                    <td>{`${candidate.firstName} ${candidate.middleName} ${candidate.lastName}`}</td>
                                    <td>{candidate.date}</td>
                                    <td>{`${candidate.assignByFirstName} ${candidate.assignByLastName}`}</td>
                                    <td>{editDropdown(candidate)}</td>
                                    <td>
                                        <span className={`status-badge1 ${candidate.status ? 'active' : 'inactive'}`}>
                                            {candidate.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td><div className="initials-container">
                                        <div
                                            className="initial-circle"
                                            style={{ backgroundColor: color1 }}
                                            title={`${candidate.firstName} ${candidate.lastName}`}
                                        >
                                            {getInitials(candidate.firstName, candidate.lastName)}
                                        </div>
                                        <div
                                            className="initial-circle"
                                            style={{ backgroundColor: color2 }}
                                            title={`${candidate.assignByFirstName} ${candidate.assignByLastName}`}
                                        >
                                            {getInitials(candidate.assignByFirstName, candidate.assignByLastName)}
                                        </div>
                                    </div></td>

                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="6" className="no-data">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="form-controls">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    type="button"
                    className='pagination-btn'
                >
                    Previous
                </button>
                <span>
                    {page + 1} of {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page + 1 >= totalPages}
                    type="button"
                    className='pagination-btn'
                >
                    Next
                </button>
            </div>
            {showConfirmModal && employeeToNotify && (
                <div className="add-popup">
                    <div>
                        <button className="close-button" onClick={closeConfirmModal}>&times;</button>
                        <h5 className="centerText">Confirm Send Ticket</h5>
                        <p style={{ textAlign: 'center' }}>
                            Are you sure you want to send a ticket to <strong>{employeeToNotify.firstName} {employeeToNotify.lastName}</strong>?
                        </p>
                        <div className="btnContainer">
                            <button type="button" className="btn" onClick={confirmSendTicket} disabled={isSendingTicket}>
                                {isSendingTicket ? <div className="loading-spinner" /> : null}
                                {isSendingTicket ? "Sending..." : "Yes"}
                            </button>
                            <button type="button" className="outline-btn" onClick={closeConfirmModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showPopup && (
                <div className="modal-overlay">
                    <div className="offermodal-content">
                        <Offer
                            selectedEmployee={selectedEmployee}
                            offerData={selectedEmployee?.offerData}
                            open={showPopup}
                            onClose={closePopup}
                        />
                    </div>
                </div>
            )}
            {showViewOfferPopup && (
                <div className="modal-overlay">
                    <div className="offermodal-content">
                        <ViewOfferHR
                            selectedEmployee={selectedEmployee}
                            offerData={selectedEmployee?.offerData}
                            open={showViewOfferPopup}
                            onClose={closeOfferPopup}
                        />
                    </div>
                </div>
            )}
            {showGenrateConfirmation && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to Genrate Ticket?</p>
                    <div className="btnContainer">
                        <button className="btn" onClick={handleGenerateTicket}> Yes </button>
                        <button className="outline-btn" onClick={() => setShowGenrateConfirmation(false)}> No </button>
                    </div>
                </div>
            )}
            {showCandidateDetails && selectedEmployee && (
                <CandidatedetailsView
                    preRegistrationId={selectedEmployee.id}
                    preLoginToken={selectedEmployee.preLoginToken}
                    verificationTicketId={selectedEmployee.id}
                    onClose={() => setShowCandidateDetails(false)}
                    onVerificationStatusChange={setCompleteVerificationStatus}
                // fromActionTaken={isFromActionTaken}
                />
            )}

        </div>
    );
};

export default ListOfCandidates;
