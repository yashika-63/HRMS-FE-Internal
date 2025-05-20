import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { showToast } from "../../Api.jsx";
import axios from "axios";
import OfferLetter from "./OfferLetter.jsx";
import { strings } from "../../string.jsx";
import "../CommonCss/CandidatePortal.css";

const CandidatePortal = () => {
    const [offersAll, setOffersAll] = useState([]);
    const [offersPending, setOffersPending] = useState([]);
    const [offersActionTaken, setOffersActionTaken] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [actionType, setActionType] = useState(null);
    const selectedOfferRef = useRef(null);
    const PreLoginToken = localStorage.getItem("PreLoginToken");
    const [rejectNote, setRejectNote] = useState("");
    const [rejectEmail, setRejectEmail] = useState("");
    const preRegistrationId = localStorage.getItem("Id");
    const [selectedOfferContext, setSelectedOfferContext] = useState(null);

    const [loading, setLoading] = useState(false);
    const isPendingOffer = selectedOffer && offersPending.some(offer => offer.id === selectedOffer.id);


    const fetchAllOffers = async () => {
        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/offerGeneration/getApprovedOffers?preRegistrationId=${preRegistrationId}&preLoginToken=${PreLoginToken}`
            );
            setOffersAll(response.data);
        } catch (error) {
            showToast("Failed to fetch all offers");
        }
    };
    const fetchPendingOffers = async () => {
        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/offerGeneration/getApprovedAndSentByPreReg?preRegistrationId=${preRegistrationId}&preLoginToken=${PreLoginToken}`
            );
            setOffersPending(response.data);
        } catch (error) {
            showToast("Failed to fetch pending offers", "error");
        }
    };
    const fetchActionTakenOffers = async () => {
        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/offerGeneration/getOffersWithActionTaken?preRegistrationId=${preRegistrationId}&preLoginToken=${PreLoginToken}`
            );
            setOffersActionTaken(response.data);
        } catch (error) {
            showToast("Failed to fetch offers with action taken");
        }
    };
    useEffect(() => {
        fetchAllOffers();
        fetchPendingOffers();
        fetchActionTakenOffers();
    }, [preRegistrationId, PreLoginToken]);

    const getInitials = (firstName, lastName) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const handleCardClick = (offer) => {
        selectedOfferRef.current = offer;
    };


    const handleViewButtonClick = (offer, context) => {
        setSelectedOffer(offer);
        selectedOfferRef.current = offer;
        setSelectedOfferContext(context);
    };

    const closePopup = () => {
        setSelectedOffer(null);
    };

    const handleAction = (type) => {
        setActionType(type);
    };

    const closeActionPopup = () => {
        setActionType(null);
    };

    const handleAcceptOffer = async () => {
        if (!selectedOfferRef.current) {
            showToast("No offer selected", "error");
            return;
        }

        setLoading(true);

        const offerId = selectedOfferRef.current.id;
        const email = selectedOfferRef.current?.preRegistration?.email;


        try {
            await axios.post(`http://${strings.localhost}/api/offer-notes/save/1`, {
                note: "Accepted",
                email
            });

            await axios.get(`http://${strings.localhost}/api/offerGeneration/accept?offerId=${offerId}&token=${PreLoginToken}`);

            showToast("Offer accepted successfully", "success");
            fetchAllOffers();
            fetchPendingOffers();
            fetchActionTakenOffers();
        } catch (error) {
            console.error("Error accepting offer:", error);
            showToast("Failed to accept the offer", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRejectOffer = async () => {
        if (!selectedOfferRef.current) {
            showToast("No offer selected", "error");
            return;
        }

        const offerId = selectedOfferRef.current.id;
        const email = selectedOfferRef.current?.preRegistration?.email;

        setLoading(true);

        try {
            await axios.post(`http://${strings.localhost}/api/offer-notes/save/1`, {
                note: rejectNote,
                email
            });

            await axios.post(`http://${strings.localhost}/api/offerGeneration/reject-offer?offerId=${offerId}&token=${PreLoginToken}`);

            showToast("Offer rejected successfully", "success");
            fetchAllOffers();
            fetchPendingOffers();
            fetchActionTakenOffers();
            closeActionPopup();
        } catch (error) {
            console.error("Error rejecting offer:", error);
            showToast("Failed to reject the offer", "error");
        } finally {
            setLoading(false);
            setRejectNote("");
        }
    };


    const editDropdown = (offer, context) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button type="button" onClick={() => handleViewButtonClick(offer, context)}>
                        View
                    </button>
                </div>
            </div>
        </div>
    );



    return (
        <div className="coreContainer">
            <div className="kanban-container" style={{ marginTop: '50px' }}>
                <div className="kanban-column">
                    <h3>All Offers</h3>
                    {offersAll.length > 0 ? (
                        offersAll.map((offer) => (
                            <div key={offer.id} className="kanban-card" onClick={() => handleCardClick(offer)}>
                                <div className="initials-container">
                                    <div className="initial-circle sender">
                                        {getInitials(offer.firstName, offer.lastName)}
                                    </div>
                                    <div className="initial-circle receiver">
                                        {getInitials(offer.preRegistration.assignByFirstName, offer.preRegistration.assignByLastName)}
                                    </div>
                                </div>
                                <div className="details">
                                    <h4 className="underlineText">  {offer.firstName} {offer.lastName} </h4>
                                    <p><strong>Email: </strong>{offer?.preRegistration?.email}</p>
                                    <p><strong>Date: </strong>{offer?.preRegistration?.date}</p>
                                    <p> <strong>Company:</strong> {offer.company.companyName} </p>
                                    {/* <strong>Offer Status:</strong> */}
                                </div>
                                <div className="options-container">{editDropdown(offer, 'all')}</div>
                            </div>
                        ))
                    ) : (
                        <p className="error-message">No Active Offers </p>
                    )}

                </div>
                <div className="kanban-column">
                    <h3>Pending Offers</h3>
                    {offersPending.length > 0 ? (
                        offersPending.map((offer) => (
                            <div key={offer.id} className="kanban-card" onClick={() => handleCardClick(offer)}>
                                <div className="initials-container">
                                    <div className="initial-circle sender">
                                        {getInitials(offer.firstName, offer.lastName)}
                                    </div>
                                    <div className="initial-circle receiver">
                                        {getInitials(offer.preRegistration.assignByFirstName, offer.preRegistration.assignByLastName)}
                                    </div>
                                </div>
                                <div className="details">
                                    <h4 className="underlineText">  {offer.firstName} {offer.lastName} </h4>
                                    <p><strong>Email: </strong>{offer?.preRegistration?.email}</p>
                                    <p><strong>Date: </strong>{offer?.preRegistration?.date}</p>
                                    <p><strong>Company:</strong> {offer.company.companyName} </p>
                                    <strong>Offer Status:</strong> Pending Approval
                                </div>
                                <div className="options-container">{editDropdown(offer, 'pending')}</div>

                            </div>
                        ))
                    ) : (
                        <p className="error-message">No pending Offers </p>
                    )}
                </div>
                <div className="kanban-column">
                    <h3>Action Taken</h3>
                    {offersActionTaken.length > 0 ? (
                        offersActionTaken.map((offer) => (
                            <div key={offer.id} className="kanban-card" onClick={() => handleCardClick(offer)}>
                                <div className="initials-container">
                                    <div className="initial-circle sender">
                                        {getInitials(offer.firstName, offer.lastName)}
                                    </div>
                                    <div className="initial-circle receiver">
                                        {getInitials(offer.preRegistration.assignByFirstName, offer.preRegistration.assignByLastName)}
                                    </div>
                                </div>
                                <div className="details">
                                    <h4 className="underlineText"> {offer.firstName} {offer.lastName}</h4>

                                    <p><strong>Email: </strong>{offer?.preRegistration?.email}</p>
                                    <p><strong>Date: </strong>{offer?.preRegistration?.date}</p>
                                    <p><strong>Company:</strong> {offer.company.companyName}</p>
                                    <div>
                                        <strong>Offer Status:</strong>
                                        <span className={
                                            offer.acceptedByCandidate
                                                ? "accepted-status"
                                                : offer.rejectedByCandidate
                                                    ? "rejected-status"
                                                    : offer.actionTakenByCandidate
                                                        ? "remarked-status"
                                                        : "pending-status"
                                        }>
                                            {offer.acceptedByCandidate
                                                ? "Accepted"
                                                : offer.rejectedByCandidate
                                                    ? "Rejected"
                                                    : offer.actionTakenByCandidate
                                                        ? "Remarked"
                                                        : "Pending"}
                                        </span>
                                    </div>
                                </div>
                                <div className="options-container">{editDropdown(offer, 'taken')}</div>
                            </div>
                        ))
                    ) : (
                        <p className="error-message">No  Offers </p>
                    )}
                </div>
            </div >

            {selectedOffer && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-btn" onClick={closePopup}>X  </button>

                        <OfferLetter offer={selectedOffer} />


                        <div className="form-controls">
                            {selectedOfferContext === "pending" && (
                                <>
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            closePopup();
                                            handleAction("accept");
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? (<><span className="loading-spinner"></span> Accepting...</>) : ("Accept")}
                                    </button>
                                    <button
                                        className="outline-btn"
                                        onClick={() => {
                                            closePopup();
                                            setRejectEmail(selectedOffer?.preRegistration?.email);
                                            handleAction("reject");
                                        }}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}


                            <button className="outline-btn" type="button" onClick={closePopup}>
                                Close
                            </button>
                        </div>
                    </div>

                </div>

            )
            }
            {actionType === "accept" && selectedOfferRef.current && (
                <div className="add-popup">
                    <div>
                        <h3 className="centerText">Confirmation</h3>
                        <p>Are you sure you want to accept this offer?</p>
                        <div className="btnContainer">
                            <button
                                className="btn"
                                onClick={async () => {
                                    await handleAcceptOffer(); // Calls API with note + email
                                    closeActionPopup(); // Close popup after API call
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span> Accepting...
                                    </>
                                ) : (
                                    "Yes"
                                )}
                            </button>
                            <button className="outline-btn" onClick={closeActionPopup}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {actionType === "reject" && selectedOfferRef.current && (
                <div className="add-popup">
                    <div className="popup-content">
                        <button className="close-btn" onClick={closeActionPopup}>
                            &times;
                        </button>
                        <h3 className="centerText">Reject Offer</h3>
                        <input
                            type="text"
                            value={rejectEmail}
                            readOnly
                        />
                        <textarea
                            type="text"
                            placeholder="Enter note"
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                        />
                        <div className="btnContainer">
                            <button
                                className="btn"
                                onClick={handleRejectOffer}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span> Rejecting...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </button>
                            <button className="outline-btn" onClick={closeActionPopup}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {
                actionType === "remark" && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="close-btn" onClick={closeActionPopup}>
                                &times;
                            </button>
                            <h3>Provide Remark</h3>
                            <input
                                id="remark-reason"
                                type="text"
                                placeholder="Enter your reason here..."
                            />
                            <div className="form-controls">
                                <button
                                    className="btn"
                                    onClick={() => {
                                        const reason = document.getElementById("remark-reason").value;
                                        console.log("Remark submitted:", reason);

                                    }}
                                >
                                    Submit
                                </button>
                                <button className="outline-btn" onClick={closeActionPopup}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default CandidatePortal;
