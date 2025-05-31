import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../../string";
import { showToast } from "../../Api.jsx";

const CandidatedetailsView = ({ fromActionTaken = false, preRegistrationId,ticketId, preLoginToken, verificationTicketId, onClose, onVerificationStatusChange }) => {
    const [step, setStep] = useState(1);
    const [ticketNote, setTicketNote] = useState("");
    const [documentData, setDocumentData] = useState([]);
    const [verifiedDocuments, setVerifiedDocuments] = useState([]);
    const [personalData, setPersonalData] = useState(null);
    const [educationData, setEducationData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sendBackNotes, setSendBackNotes] = useState({});
    const [showSendBackInput, setShowSendBackInput] = useState({});
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewType, setPreviewType] = useState('');
    const [previewFilename, setPreviewFilename] = useState('');
    const [employmentData, setEmploymentData] = useState([]);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [verifiedSteps, setVerifiedSteps] = useState({ personal: false, education: [], employment: [], documentData: [] });
    const reportingPersonId = localStorage.getItem("employeeId");
    const companyId = localStorage.getItem("companyId");
    const [sendBackLoadingId, setSendBackLoadingId] = useState(null);

    const isAllVerified = verifiedSteps.personal &&
        (Array.isArray(verifiedSteps.education) && verifiedSteps.education.length === educationData.length) &&
        (Array.isArray(verifiedSteps.employment) && verifiedSteps.employment.length === employmentData.length) &&
        (Array.isArray(verifiedSteps.documentData) && verifiedSteps.documentData.length === documentData.length);


    useEffect(() => {
        if (preRegistrationId && preLoginToken && verificationTicketId) {
            // Fetch Personal Details
            axios.get(`http://${strings.localhost}/api/employeedata/get-by-prereg?preRegistrationId=${preRegistrationId}&preLoginToken=${preLoginToken}`)
                .then(res => setPersonalData(res.data))
                .catch(err => console.error("Error fetching personal details", err));

            // Fetch Education Details
            axios.get(`http://${strings.localhost}/api/education/getByVerificationAndToken?verificationId=${verificationTicketId}&preLoginToken=${preLoginToken}`)
                .then(res => setEducationData(res.data))
                .catch(err => console.error("Error fetching education details", err));

            // Fetch Employment History
            axios.get(`http://${strings.localhost}/api/employment-data/getByVerificationAndToken?verificationId=${verificationTicketId}&preLoginToken=${preLoginToken}`)
                .then(res => setEmploymentData(res.data))
                .catch(err => console.error("Error fetching employment data", err));

            // Fetch Document List
            axios.get(`http://${strings.localhost}/api/employeeVerificationDocument/view/Document/${verificationTicketId}`)
                .then(res => {
                    setDocumentData(res.data)
                })
                .catch(err => console.error("Error fetching document list", err));
            fetchTicketNote(verificationTicketId);
        }
    }, [preRegistrationId, preLoginToken, verificationTicketId]);

    useEffect(() => {
        const isReady =
            personalData &&
            educationData.length > 0 &&
            employmentData.length > 0 &&
            documentData.length > 0;

        if (isReady) {
            const areDocumentsVerified = documentData.every(doc => String(doc.verificationStatus) === "true");
            const isVerified =
                personalData.verificationStatus === true &&
                educationData.every(edu => edu.verificationStatus === true) &&
                employmentData.every(emp => emp.verificationStatus === true) &&
                areDocumentsVerified;

            onVerificationStatusChange(isVerified);
        }
    }, [personalData, educationData, employmentData, documentData]);

    const handleVerify = (type, id) => {
        let apiUrl = "";
        let payload = {};

        switch (type) {
            case "personal":
                apiUrl = `http://${strings.localhost}/api/employeedata/update-verification-status/${id}`;
                payload = { status: true };
                break;
            case "education":
                apiUrl = `http://${strings.localhost}/api/education/updateVerificationStatus/${id}?status=1`;
                break;
            case "employment":
                apiUrl = `http://${strings.localhost}/api/employment-data/updateVerificationStatus/${id}?status=true`;
                break;
            case "document":
                apiUrl = `http://${strings.localhost}/api/employeeVerificationDocument/updateVerificationStatus/${id}?status=true`;
                break;
            default:
                return;
        }

        axios.put(apiUrl, payload)
            .then(() => {
                setVerifiedSteps(prev => {
                    const updated = { ...prev };

                    if (type === "personal") {
                        updated.personal = true;
                        setTimeout(() => setStep(2), 500);
                    }

                    if (type === "education" && !updated.education.includes(id)) {
                        const newEducation = [...updated.education, id];
                        updated.education = newEducation;
                        if (newEducation.length === educationData.length) {
                            setTimeout(() => setStep(3), 500);
                        }
                    }

                    if (type === "employment" && !updated.employment.includes(id)) {
                        const newEmployment = [...updated.employment, id];
                        updated.employment = newEmployment;
                        if (newEmployment.length === employmentData.length) {
                            setTimeout(() => setStep(4), 500);
                        }
                    }
                    if (type === "document") {
                        setVerifiedDocuments(prevDocs => {
                            const updatedDocs = [...prevDocs, id];
                            setDocumentData(prev =>
                                prev.map(doc =>
                                    doc.documentId === id ? { ...doc, verificationStatus: "true" } : doc
                                )
                            );
                            return updatedDocs;
                        });
                    }
                    return updated;
                });

                showToast(`${type} verification successful`, "success");
            })
            .catch(() => {
                showToast(`Error verifying ${type}`, "error");
            });
    };


    const handleViewDocument = async (doc) => {
        const documentId = doc.documentId;
        const fileName = doc.fileName || "document";

        if (!documentId) {
            showToast("No document ID available for preview", "error");
            return;
        }

        try {
            const response = await axios.get(`http://${strings.localhost}/api/employeeVerificationDocument/view/${documentId}`, {
                responseType: 'blob',
            });

            const fileBlob = new Blob([response.data]);
            const fileUrl = URL.createObjectURL(fileBlob);

            const extension = fileName.split('.').pop().toLowerCase();
            const fileType = extension === 'pdf'
                ? 'pdf'
                : ['jpg', 'jpeg', 'png'].includes(extension)
                    ? 'image'
                    : 'unsupported';

            setPreviewType(fileType);
            setPreviewUrl(fileUrl);
            setPreviewFilename(fileName);
            setShowPreviewModal(true);
        } catch (error) {
            console.error("Error fetching document:", error);
            showToast("Failed to load document preview", "error");
        }
    };


    useEffect(() => {
        const allDocsVerified = verifiedDocuments.length === documentData.length;
        const allStepsVerified =
            verifiedSteps.personal &&
            verifiedSteps.education.length === educationData.length &&
            verifiedSteps.employment.length === employmentData.length;

        if (allDocsVerified && allStepsVerified && documentData.length > 0) {
            setShowConfirmationModal(true);
        }
    }, [verifiedDocuments, verifiedSteps, documentData.length, educationData.length, employmentData.length]);

    const handleConfirmVerification = () => {
        setLoading(true);
        try {
   
          const response = axios.put(`http://${strings.localhost}/api/verification/updateStatus?id=${ticketId}&reportingPersonId=${reportingPersonId}`);
          
            showToast("Verification confirmed successfully", "success");
            window.location.reload();
            setShowConfirmationModal(false);
            onClose();
        } catch (error) {
            showToast("Error confirming verification", "error");
            console.error("Error confirming verification", error);
        } finally {
            setLoading(false);
        }
    };
    const handleSendBack = async (id, type) => {
        const note = sendBackNotes[id];
        setSendBackLoadingId(id);
        try {
            const response = await axios.post(`http://${strings.localhost}/api/verification/send-back?ticketId=${verificationTicketId}&note=${note}`);
            console.log('response', response);
            showToast(`${type} sent back successfully`, "success");
            setShowSendBackInput(prev => ({ ...prev, [verificationTicketId]: false }));
            setSendBackNotes(prev => ({ ...prev, [verificationTicketId]: "" }));
        } catch (error) {
            console.error(`Error sending back ${type}`, error);
            showToast(`Failed to send back ${type}`, "error");
        } finally {
            setSendBackLoadingId(null);
        }
    };

    const fetchTicketNote = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/verificationTicketNote/verificationTicketNotes/${verificationTicketId}`);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const noteText = response.data[0].note; // Get note from first item
                setTicketNote(noteText);
            } else {
                setTicketNote("No note available.");
            }
        } catch (error) {
            console.error("Error fetching ticket note:", error);
            setTicketNote("Failed to load note.");
        }
    };
    const isAllDocumentsVerified = documentData.length > 0 && documentData.every(doc => String(doc.verificationStatus) === "true");

    const renderStepContent = () => {
        if (step === 5 && fromActionTaken) {
            return null;
        }
        switch (step) {
            case 1:
                return (
                    <div>
                        <h4 className="centerText">Personal Details</h4>

                        {personalData ? (
                            <>
                                <div className="step-grid">
                                    <div className="step-column">
                                        <p><strong>Name:</strong> {personalData?.firstName} {personalData?.middleName} {personalData?.lastName}</p>
                                        <p><strong>Mother's Name:</strong> {personalData?.motherName}</p>
                                        <p><strong>Gender:</strong> {personalData?.gender}</p>
                                        <p><strong>Nationality:</strong> {personalData?.nationality}</p>
                                        <p><strong>Age:</strong> {personalData?.age}</p>
                                        <p><strong>Marital Status:</strong> {personalData?.maritalStatus}</p>
                                        <p><strong>Date of Birth:</strong> {new Date(personalData?.dateOfBirth).toLocaleDateString()}</p>
                                        <p><strong>Contact Number:</strong> {personalData?.contactNoCountryCode} {personalData?.contactNo}</p>
                                        <p><strong>Alternate Contact Number:</strong> {personalData?.alternateContactNoCountryCode} {personalData?.alternateContactNo}</p>
                                        <p><strong>Email:</strong> {personalData?.preRegistration?.email}</p>
                                        <p><strong>Alternate Email:</strong> {personalData?.alternateEmail}</p>
                                        <p><strong>Experience:</strong> {personalData?.experience} years</p>
                                        <p><strong>Employee Type:</strong> {personalData?.employeeType}</p>
                                        <p><strong>PAN No:</strong> {personalData?.panNo}</p>
                                        <p><strong>Aadhaar No:</strong> {personalData?.adhaarNo}</p>
                                        <p><strong>Joining Date:</strong> {new Date(personalData?.joiningDate).toLocaleDateString()}</p>
                                    </div>

                                    <div className="step-column">
                                        <h5 className="centerText">Current Address</h5>
                                        <p><strong>House No:</strong> {personalData?.currentHouseNo}</p>
                                        <p><strong>Street:</strong> {personalData?.currentStreet}</p>
                                        <p><strong>City:</strong> {personalData?.currentCity}</p>
                                        <p><strong>State:</strong> {personalData?.currentState}</p>
                                        <p><strong>Postal Code:</strong> {personalData?.currentPostelcode}</p>
                                        <p><strong>Country:</strong> {personalData?.currentCountry}</p>
                                        <h5 className="centerText">Permanent Address</h5>
                                        <p><strong>House No:</strong> {personalData?.permanentHouseNo}</p>
                                        <p><strong>Street:</strong> {personalData?.permanentStreet}</p>
                                        <p><strong>City:</strong> {personalData?.permanentCity}</p>
                                        <p><strong>State:</strong> {personalData?.permanentState}</p>
                                        <p><strong>Postal Code:</strong> {personalData?.permanentPostelcode}</p>
                                        <p><strong>Country:</strong> {personalData?.permanentCountry}</p>
                                    </div>
                                </div>
                                <hr />
                                {String(personalData?.verificationStatus) === "true" && (
                                    <span className="verified-ribbon">Verified</span>
                                )}
                                {String(personalData?.verificationStatus) !== "true" && (
                                    <div>
                                        {showSendBackInput[personalData?.id] ? (
                                            <div>
                                                <textarea
                                                    rows="3"
                                                    placeholder="Enter reason for sending back"
                                                    value={sendBackNotes[personalData?.id] || ""}
                                                    onChange={(e) =>
                                                        setSendBackNotes(prev => ({ ...prev, [personalData?.id]: e.target.value }))
                                                    }
                                                />
                                                <div>
                                                    <button className="btn" onClick={() => handleSendBack(personalData?.id, "Personal Data")}>
                                                        {sendBackLoadingId === personalData.id ? <div className="loading-spinner"></div> : "Save Note & Send Back"}
                                                    </button>
                                                    <button
                                                        className="outline-btn"
                                                        onClick={() => setShowSendBackInput(prev => ({ ...prev, [personalData?.id]: false }))}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                                                <button className="btn" onClick={() => handleVerify("personal", personalData?.id)}>
                                                    Verify Personal Data
                                                </button>
                                                <button className="outline-btn" onClick={() => setShowSendBackInput(prev => ({ ...prev, [personalData?.id]: true }))}>
                                                    Send Back
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="no-data">
                                No personal data available.
                            </p>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h4 className="centerText">Education Details</h4>
                        {educationData.length > 0 ? (
                            educationData.map((edu, i) => (
                                <div key={i}>
                                    <div className="step-grid">
                                        <div className="step-column">
                                            <p><strong>Institute:</strong> {edu.institute || "N/A"}</p>
                                            <p><strong>University:</strong> {edu.university || "N/A"}</p>
                                            <p><strong>Type of Study:</strong> {edu.typeOfStudy || "N/A"}</p>
                                            <p><strong>Year of Admission:</strong> {edu.yearOfAddmisstion || "N/A"}</p>
                                        </div>
                                        <div className="step-column">
                                            <p><strong>Year of Passing:</strong> {edu.yearOfPassing || "N/A"}</p>
                                            <p><strong>Branch:</strong> {edu.branch || "N/A"}</p>
                                            <p><strong>Score:</strong> {edu.score || "N/A"}</p>
                                            <p><strong>Score Type:</strong> {edu.scoreType || "N/A"}</p>
                                        </div>
                                    </div>
                                    <hr />
                                    {String(edu?.verificationStatus) === "true" && (
                                        <span className="verified-ribbon">Verified</span>
                                    )}
                                    {!edu.verificationStatus && (
                                        <div style={{ marginTop: "10px" }}>
                                            {showSendBackInput[edu.id] ? (
                                                <>
                                                    <textarea
                                                        rows="3"
                                                        placeholder="Enter reason for sending back"
                                                        value={sendBackNotes[edu.id] || ""}
                                                        onChange={(e) =>
                                                            setSendBackNotes(prev => ({ ...prev, [edu.id]: e.target.value }))
                                                        }
                                                    />
                                                    <div>
                                                        <button className="btn" onClick={() => handleSendBack(edu.id, "Education Data")}>
                                                            {sendBackLoadingId === edu.id ? <div className="loading-spinner"></div> : "Save Note & Send Back"}
                                                        </button>
                                                        <button
                                                            className="outline-btn"
                                                            onClick={() => setShowSendBackInput(prev => ({ ...prev, [edu.id]: false }))}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div>
                                                    <button className="btn" onClick={() => handleVerify("education", edu.id)}>
                                                        Verify Education Data
                                                    </button>
                                                    <button
                                                        className="outline-btn"
                                                        onClick={() => setShowSendBackInput(prev => ({ ...prev, [edu.id]: true }))}
                                                    >
                                                        Send Back
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No education data found.</p>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h4 className="centerText">Employment History</h4>
                        {employmentData.length > 0 ? (
                            employmentData.map((emp, i) => (
                                <div key={i}>
                                    <div className="step-grid">
                                        <div className="step-column">
                                            <p><strong>Company Name:</strong> {emp.companyName || "N/A"}</p>
                                            <p><strong>Job Role:</strong> {emp.jobRole || "N/A"}</p>
                                            <p><strong>Responsibilities:</strong> {emp.responsibilities || "N/A"}</p>
                                            <p><strong>Start Date:</strong> {emp.startDate ? new Date(emp.startDate).toLocaleDateString() : "N/A"}</p>
                                            <p><strong>End Date:</strong> {emp.endDate ? new Date(emp.endDate).toLocaleDateString() : "N/A"}</p>
                                            <p><strong>Job Duration:</strong> {emp.jobDuration || "N/A"}</p>
                                            <p><strong>Latest CTC:</strong> {emp.latestCtc || "N/A"}</p>
                                            <p><strong>Supervisor Contact:</strong> {emp.supervisorContact || "N/A"}</p>
                                        </div>
                                        <div className="step-column">
                                            <p><strong>Reason of Leaving:</strong> {emp.reasonOfLeaving || "N/A"}</p>
                                            <p><strong>Achievements:</strong> {emp.achievements || "N/A"}</p>
                                            <p><strong>Employment Type:</strong> {emp.employeementType || "N/A"}</p>
                                            <p><strong>Location:</strong> {emp.location || "N/A"}</p>
                                            <p><strong>Industry:</strong> {emp.industry || "N/A"}</p>
                                            <p><strong>Company Size:</strong> {emp.companySize || "N/A"}</p>
                                            <p><strong>Latest Month Gross:</strong> {emp.latestMonthGross || "N/A"}</p>
                                            <p><strong>Team Size:</strong> {emp.teamSize || "N/A"}</p>
                                        </div>
                                    </div>
                                    <hr />
                                    {String(emp?.verificationStatus) === "true" && (
                                        <span className="verified-ribbon">Verified</span>
                                    )}
                                    {!emp.verificationStatus && (
                                        <div>
                                            {showSendBackInput[emp.id] ? (
                                                <>
                                                    <textarea
                                                        rows="3"
                                                        placeholder="Enter reason for sending back"
                                                        value={sendBackNotes[emp.id] || ""}
                                                        onChange={(e) =>
                                                            setSendBackNotes(prev => ({ ...prev, [emp.id]: e.target.value }))
                                                        }
                                                    />
                                                    <div>
                                                        <button className="btn" onClick={() => handleSendBack(emp.id, "Employment Data")}>
                                                            {sendBackLoadingId === emp.id ? <div className="loading-spinner"></div> : "Save Note & Send Back"}
                                                        </button>
                                                        <button
                                                            className="outline-btn"
                                                            onClick={() => setShowSendBackInput(prev => ({ ...prev, [emp.id]: false }))}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div>
                                                    <button className="btn" onClick={() => handleVerify("employment", emp.id)}>
                                                        Verify Employment Data
                                                    </button>
                                                    <button
                                                        className="outline-btn"
                                                        onClick={() => setShowSendBackInput(prev => ({ ...prev, [emp.id]: true }))}
                                                    >
                                                        Send Back
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No employment data found.</p>
                        )}
                    </div>
                );
            case 4:
                return (
                    <div>
                        <h4 className="centerText">Documents</h4>
                        {documentData.length > 0 ? (
                            documentData.map((doc, i) => (
                                <div key={i}>
                                    <div className="document-row">
                                        <p className="document-label">{i + 1}. <strong>{doc.label || "N/A"} : </strong> {doc.fileName || "N/A"}</p>
                                        <div className="document-button">
                                            <button className="outline-btn"
                                                onClick={() => handleViewDocument(doc)}>
                                                View Preview
                                            </button>
                                        </div>
                                        <div className="document-label">
                                            {doc.documentId ? (
                                                doc.verificationStatus === "true" ? (
                                                    <span className="verified-text">✅ Verified</span>
                                                ) : (
                                                    <button className="btn" onClick={() => handleVerify("document", doc.documentId)}>
                                                        Verify Document
                                                    </button>
                                                )
                                            ) : (
                                                <p className="no-data">Error: Document ID is missing.</p>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No documents found.</p>
                        )}
                        {isAllDocumentsVerified && (
                            <div className="verified-ribbon">
                                Verified
                            </div>
                        )}
                        <hr />
                        <div>
                            {!isAllDocumentsVerified && (
                                <div>
                                    {!showSendBackInput["documents"] ? (
                                        <button
                                            className="outline-btn"
                                            onClick={() => setShowSendBackInput(prev => ({ ...prev, documents: true }))}
                                        >
                                            Send Back
                                        </button>
                                    ) : (
                                        <div>
                                            <textarea
                                                rows="3"
                                                placeholder="Enter reason for sending back"
                                                value={sendBackNotes["documents"] || ""}
                                                onChange={(e) =>
                                                    setSendBackNotes(prev => ({ ...prev, documents: e.target.value }))
                                                }
                                            />
                                            <div>
                                                <button
                                                    className="btn"
                                                    onClick={() => handleSendBack(verificationTicketId, "Document Section")}
                                                >
                                                    Save Note & Send Back
                                                </button>
                                                <button
                                                    className="outline-btn"
                                                    onClick={() =>
                                                        setShowSendBackInput(prev => ({ ...prev, documents: false }))
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                );
            case 5:
                return (
                    <div>
                        <h4 className="centerText">Confirmation</h4>
                        <h4 style={{ textAlign: 'center' }}>This is the last step of confirming details</h4>
                        <p style={{ textAlign: 'center' }}>Please confirm the verification to proceed.</p>
                        {String(personalData?.verificationTicket?.verificationStatus) === "true" ? (
                            <div>
                                <span className="verified-ribbon">Verified</span>
                            </div>
                        ) : (
                            <div className="btnContainer">
                                <button className="btn" onClick={handleConfirmVerification} disabled={loading}>
                                    {loading ? (
                                        <div className="loading-spinner"></div>
                                    ) : (
                                        'Confirm'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>&times;</button>
                <div className="step-indicator1">
                    {[1, 2, 3, 4].map((s, idx) => (
                        <React.Fragment key={s}>
                            <div
                                className={`steps ${step === s ? 'active' : step > s ? 'completed' : ''}`}
                                onClick={() => setStep(s)}
                            >
                                {step > s ? '✅' : s}
                            </div>
                            {idx < 3 && <div className="steps-line"></div>}
                        </React.Fragment>
                    ))}

                    {!fromActionTaken && (
                        <>
                            <div className="steps-line"></div>
                            <div
                                className={`steps ${step === 5 ? 'active' : step > 5 ? 'completed' : ''}`}
                                onClick={() => setStep(5)}
                            >
                                {step > 5 ? '✅' : '5'}
                            </div>
                        </>
                    )}
                </div>
                <div>
                    {ticketNote && (
                        <div className="ticket-note">
                            <strong>Note:</strong>
                            <p>{ticketNote}</p>
                        </div>
                    )}
                    {renderStepContent()}
                </div>
                {step < 4 || (!fromActionTaken && step < 5) ? (
                    <button className="btn" onClick={() => setStep(step + 1)}>Next</button>
                ) : null}

                {step === 5 && !fromActionTaken && (
                    <button
                        className="btn"
                        onClick={onClose}
                        disabled={!isAllVerified}
                    >
                        Done
                    </button>
                )}

            </div>
            {showPreviewModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setShowPreviewModal(false)}>X</button>
                        <h3>Preview: {previewFilename}</h3>

                        {previewType === 'pdf' && (
                            <iframe src={previewUrl} title="PDF Preview" width="100%" height="500px" />
                        )}
                        {previewType === 'image' && (
                            <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '500px' }} />
                        )}
                        {previewType === 'unsupported' && (
                            <p>Preview not available for this file type.</p>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <a href={previewUrl} download={previewFilename} className="btn">
                                Download File
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidatedetailsView;

