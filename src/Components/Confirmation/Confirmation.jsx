import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../CommonCss/Confirmation.css';
import axios from 'axios';
import jsPDF from 'jspdf';
import { showToast, useCompanyLogo } from '../../Api.jsx';
import { strings } from '../../string.jsx';

const ConfirmationLetter = () => {
    const [showAcceptPopup, setShowAcceptPopup] = useState(false);
    const [showRejectPopup, setShowRejectPopup] = useState(false);
    const [templateData, setTemplateData] = useState(null);
    const [confirmationData, setConfirmationData] = useState(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const companyId = localStorage.getItem("companyId");
    const logo = useCompanyLogo(companyId);
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const { id: employeeId } = useParams();
    const currentDate = new Date().toLocaleDateString();

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            await axios.put(`http://${strings.localhost}/api/confirmationLetter/acceptConfirmationLetter/${confirmationData?.id}`);
            showToast("Appointment confirmed successfully.", "success");
            setShowAcceptPopup(false);
        } catch (err) {
            const error = err.response?.data?.message || "Failed to confirm.";
            showToast(error, "error");
        } finally {
            setIsAccepting(false);
        }
    };

    const handleReject = async () => {
        setIsRejecting(true);
        try {
            await axios.put(`http://${strings.localhost}/api/confirmationLetter/rejectConfirmationLetter/${confirmationData?.id}`);
            showToast("Appointment rejected.", "success");
            setShowRejectPopup(false);
        } catch (err) {
            const error = err.response?.data?.message || "Failed to reject.";
            showToast(error, "error");
        } finally {
            setIsRejecting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };



    const handleDownload = () => {
        const doc = new jsPDF('p', 'mm', 'a4');  // Specify A4 paper size (portrait mode)

        const content = document.querySelector('.confirmcontainer');

        // Use html() to render HTML content and format it well
        doc.html(content, {
            callback: function (doc) {
                // After rendering, save the PDF file
                doc.save('ConfirmationLetter.pdf');
            },
            margin: [10, 10, 10, 10],  // Adjust margins (top, left, bottom, right)
            autoPaging: true,           // Allow content to auto page if it exceeds one page
            html2canvas: { scale: 2 },  // Increase quality for rendering
            x: 10,                      // Adjust the start X position
            y: 10,                      // Adjust the start Y position
            width: 190,                 // Control width to fit content (A4 is 210mm wide)
            windowWidth: 800            // Set this to the window width for accurate rendering
        });
    };



    useEffect(() => {
        const fetchTemplateData = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/letter-template/active?companyId=${companyId}&templateIdentityKey=ConfirmationLetter`);                setTemplateData(response.data);
            } catch (err) {
                console.error("Failed to fetch template", err);
            }
        };

        const fetchConfirmationData = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/confirmationLetter/getByEmployeeId/${employeeId}`);
                setConfirmationData(response.data);
            } catch (err) {
                const error = err.response?.data?.details || "Failed to fetch confirmation letter data.";
                showToast(error, "error");
            }
        };

        if (companyId) fetchTemplateData();
        if (employeeId) fetchConfirmationData();
    }, [companyId, employeeId]);

    const shouldShowButtons = confirmationData?.employeeAction === false;

    // const getSalutation = () => {
    //     const gender = confirmationData?.employee?.gender?.toLowerCase() || "";
    //     const maritalStatus = confirmationData?.employee?.maritalStatus?.toLowerCase() || "";

    //     if (gender === "male") {
    //         return "Mr.";
    //     }

    //     if (gender === "female") {
    //         if (["unmarried", "single", "single mother"].includes(maritalStatus)) {
    //             return "Ms.";
    //         } else if (maritalStatus === "married") {
    //             return "Mrs.";
    //         }
    //     }

    //     return "Mr./Ms.";
    // };


    return (
        <div className="coreContainer">
            {confirmationData ? (
                <>
                    <div className='confirmcontainer'>

                        <header className="payslip-header">
                            <img className='HRMSNew' src={logo} alt="Company Logo" width={120} height={30} />
                        </header>

                        <h1 className='centerText'>Confirmation Letter</h1>
                        {templateData ? (
                            <>
                                <section className="date">
                                    <p><strong>Date:</strong> {confirmationData?.date || currentDate}</p>
                                </section>

                                <section className="address">
                                    <p>{templateData.company?.companyName || "Company Name"}</p>
                                    <p>{templateData.company?.companyAddress}</p>
                                    <p>{`${templateData.company?.city || ''} ${templateData.company?.state || ''} ${templateData.company?.postalCode || ''}`}</p>
                                </section>

                                <section className="subject">
                                    <p>{templateData.subject}</p>
                                </section>

                                <section className="salutation">
                                    <p>Dear , <br/> Mr/Ms {`${firstName} ${lastName} ,`}</p>
                                </section>

                                <section className="body">
                                    <p>{templateData.body}</p>
                                </section>

                                <section className="signature">
                                    <p>Best regards,</p>
                                    <p>HR Team</p>
                                    <p>{templateData.company?.companyName || "Company Name"}</p>
                                </section>
                            </>
                        ) : (
                            <p>Loading template...</p>
                        )}
                        <div className="form-controls">
                            {shouldShowButtons && (
                                <>
                                    <button className="btn" onClick={() => setShowAcceptPopup(true)}>Accept</button>
                                    <button className="btn" onClick={() => setShowRejectPopup(true)}>Reject</button>
                                </>
                            )}
                            <button className="btn" onClick={handlePrint}>Print</button>
                        </div>
                    </div>

                </>
            ) : (
                <div className="add-popup">
                    <p className='no-data'>No confirmation letter found for this employee.</p>
                </div>
            )}





            {/* Accept Popup */}
            {showAcceptPopup && (
                <div className="add-popup">
                    <div className="popup-fields">
                        <h4 style={{textAlign:'center'}}>Are you sure you want to accept the appointment?</h4>
                        <div className='btnContainer'>
                            {isAccepting && <div className="loading-spinner"></div>}
                            <button className="btn" onClick={handleAccept} disabled={isAccepting}>
                                {isAccepting ? "Accepting..." : "Yes"}
                            </button>
                            <button className="outline-btn" onClick={() => setShowAcceptPopup(false)} disabled={isAccepting}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Popup */}
            {showRejectPopup && (
                <div className="add-popup">
                    <div className="popup-fields">
                        <h4 style={{textAlign:'center'}}>Are you sure you want to reject the appointment?</h4>
                        <div className='btnContainer'>
                            {isRejecting && <div className="loading-spinner"></div>}
                            <button className="btn" onClick={handleReject} disabled={isRejecting}>
                                {isRejecting ? "Rejecting..." : "Yes"}
                            </button>
                            <button className="outline-btn" onClick={() => setShowRejectPopup(false)} disabled={isRejecting}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default ConfirmationLetter;
