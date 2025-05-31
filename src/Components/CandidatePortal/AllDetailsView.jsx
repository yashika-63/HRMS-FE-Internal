import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../../string";
import { showToast } from "../../Api.jsx";

const AllDetailsView = ({ verificationTicketId, onClose, onVerificationStatusChange }) => {
    const [step, setStep] = useState(1);
    const [documentData, setDocumentData] = useState([]);
    const [verifiedDocuments, setVerifiedDocuments] = useState([]); // Track verified documents
    const [personalData, setPersonalData] = useState(null);
    const [educationData, setEducationData] = useState([]);
    const [employmentData, setEmploymentData] = useState([]);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [verifiedSteps, setVerifiedSteps] = useState({ personal: false, education: [], employment: [] });
    const preLoginToken = localStorage.getItem("PreLoginToken");
    const preRegistrationId = localStorage.getItem("Id");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewFilename, setPreviewFilename] = useState("");
    const [previewType, setPreviewType] = useState("");
    const [showPreviewModal, setShowPreviewModal] = useState(false);
 const [previewDocument, setPreviewDocument] = useState(null);



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
                    console.log("Fetched Document Data:", res.data);
                    setDocumentData(res.data)
                })    // Store document list
                .catch(err => console.error("Error fetching document list", err));

        }
    }, [preRegistrationId, preLoginToken, verificationTicketId]);

    // ✅ Now the second useEffect to evaluate the verification status
    useEffect(() => {
        if (
            personalData &&
            educationData.length > 0 &&
            employmentData.length > 0
        ) {
            // Fetch documents
            axios.get(`http://${strings.localhost}/api/employeeVerificationDocument/view/Document/${verificationTicketId}`)
                .then(res => {
                    setDocumentData(res.data);  // Set the document data into state

                    // Check if all documents are verified
                    const areDocumentsVerified = res.data.every(doc => doc.verificationStatus === true);

                    // Now check if personal, education, employment, and documents are all verified
                    const isVerified =
                        personalData.verificationStatus === true &&
                        educationData.every(edu => edu.verificationStatus === true) &&
                        employmentData.every(emp => emp.verificationStatus === true) &&
                        areDocumentsVerified; // Include documents in verification check

                    // Notify parent of verification status
                    onVerificationStatusChange(isVerified);
                })
                .catch(err => {
                    console.error("Error fetching document data", err);
                    // In case of an error, handle it as needed (you could set some state for error messages)
                });
        }
    }, [personalData, educationData, employmentData, verificationTicketId]);


    const handleViewDocument = async (id) => {
        try {
            const doc = documentData.find(d => d.documentId === id);
            const response = await axios.get(`http://${strings.localhost}/api/employeeVerificationDocument/view/${id}`, {
                responseType: 'blob',
            });

            const contentType = response.headers['content-type'];
            const fileUrl = URL.createObjectURL(response.data);
            const extension = contentType.split('/').pop();
            const filename = `${doc?.fileName || 'document'}.${extension}`;

            setPreviewFilename(filename);

            if (contentType.includes('pdf')) {
                setPreviewType('pdf');
            } else if (contentType.includes('image')) {
                setPreviewType('image');
            } else {
                setPreviewType('unsupported');
            }

            setPreviewDocument(fileUrl);
            setShowPreviewModal(true);
        } catch (error) {
            console.error('Error fetching document preview:', error);
            showToast('Failed to load document preview.', 'error');
        }
    };



    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h4 className="centerText">Personal Details</h4>
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
                                <h5 className="underlineText">Current Address</h5>
                                <p><strong>House No:</strong> {personalData?.currentHouseNo}</p>
                                <p><strong>Street:</strong> {personalData?.currentStreet}</p>
                                <p><strong>City:</strong> {personalData?.currentCity}</p>
                                <p><strong>State:</strong> {personalData?.currentState}</p>
                                <p><strong>Postal Code:</strong> {personalData?.currentPostelcode}</p>
                                <p><strong>Country:</strong> {personalData?.currentCountry}</p>
                                <h5 className="underlineText">Permanent Address</h5>
                                <p><strong>House No:</strong> {personalData?.permanentHouseNo}</p>
                                <p><strong>Street:</strong> {personalData?.permanentStreet}</p>
                                <p><strong>City:</strong> {personalData?.permanentCity}</p>
                                <p><strong>State:</strong> {personalData?.permanentState}</p>
                                <p><strong>Postal Code:</strong> {personalData?.permanentPostelcode}</p>
                                <p><strong>Country:</strong> {personalData?.permanentCountry}</p>
                            </div>
                        </div>
                        <hr />
                        {personalData?.verificationStatus && (
                            <span className="verified-ribbon">Verified </span>
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
                                    {edu.verificationStatus && (
                                        <span className="verified-ribbon">Verified </span>
                                    )}

                                </div>
                            ))
                        ) : (
                            <p>No education data found.</p>
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
                                    {emp.verificationStatus && (
                                        <span className="verified-ribbon">Verified </span>

                                    )}

                                </div>
                            ))
                        ) : (
                            <p>No employment data found.</p>
                        )}

                    </div>
                );
            case 4:
                return (
                    <div>
                        <h4 className="centerText">Documents</h4>
                        {documentData.length > 0 ? (
                            documentData.map((doc, i) => (
                                <div key={i} className="document-row">
                                    <p className="document-label">{i + 1}. <strong>{doc.label}:</strong> {doc.fileName || "N/A"}</p>
                                    <div className="document-button">
                                        <button className="outline-btn" onClick={() => handleViewDocument(doc.documentId)}>
                                            View Preview
                                        </button>
                                    </div>
                                    {(doc.verificationStatus === true || doc.verificationStatus === 'true') && (
                                        <span className="verified-ribbon">Verified</span>
                                    )}
                                    <hr />
                                </div>
                            ))
                        ) : (
                            <p>No documents found.</p>
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

                {/* Step Indicator */}
                <div className="step-indicator1">
                    <div
                        className={`steps ${step > 1 ? 'completed' : 'active'}`}
                        onClick={() => setStep(1)}
                    >
                        {step > 1 ? '✅' : '1'}
                    </div>
                    <div className="steps-line"></div>
                    <div
                        className={`steps ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}
                        onClick={() => setStep(2)}
                    >
                        {step > 2 ? '✅' : '2'}
                    </div>
                    <div className="steps-line"></div>
                    <div
                        className={`steps ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}
                        onClick={() => setStep(3)}
                    >
                        {step > 3 ? '✅' : '3'}
                    </div>
                    <div className="steps-line"></div>
                    <div
                        className={`steps ${step === 4 ? 'active' : step > 4 ? 'completed' : ''}`}
                        onClick={() => setStep(4)}
                    >
                        {step > 4 ? '✅' : '4'}
                    </div>
                </div>

                {/* Step Content */}
                <div>
                    {renderStepContent()}
                </div>

                {/* Footer Navigation */}
                <div>
                    {step > 1 && <button className="outline-btn" onClick={() => setStep(step - 1)}>Back</button>}
                    {step < 4 && <button className="btn" onClick={() => setStep(step + 1)}>Next</button>}
                    {step === 4 && <button className="btn" onClick={onClose}>Done</button>}

                </div>


            </div>
            {showConfirmationModal && (
                <div className="add-popup">

                    <h4 style={{ textAlign: 'center' }}>This is the last step of confirming details</h4>
                    <p style={{ textAlign: 'center' }}>Please confirm the verification to proceed.</p>
                    <div className="btnContainer">
                        <button className="btn" onClick={() => {
                            handleConfirmVerification();
                            setShowConfirmationModal(false);
                            onClose();
                        }}>
                            Confirm
                        </button>
                        <button className="outline-btn" onClick={() => setShowConfirmationModal(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {showPreviewModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setShowPreviewModal(false)}>X</button>
                        <h3>Preview: {previewFilename}</h3>

                        {previewType === 'pdf' && (
                            <iframe src={previewDocument} title="PDF Preview" width="100%" height="500px" />
                        )}

                        {previewType === 'image' && (
                            <img src={previewDocument} alt="Preview" style={{ maxWidth: '100%', maxHeight: '500px' }} />
                        )}

                        {previewType === 'unsupported' && (
                            <div style={{ textAlign: 'center' }}>
                                <p>Preview not available for this file type.</p>
                            </div>
                        )}

                        <div className="modal-footer" style={{ textAlign: 'center', marginTop: '10px' }}>
                            <a href={previewDocument} download={previewFilename} className="btn">
                                Download File
                            </a>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AllDetailsView;
