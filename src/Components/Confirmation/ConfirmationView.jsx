import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../CommonCss/Confirmation.css';
import axios from 'axios';
import jsPDF from 'jspdf';
import { showToast, useCompanyLogo } from '../../Api.jsx';
import { strings } from '../../string.jsx';

const ConfirmationView = () => {
    const [showAcceptPopup, setShowAcceptPopup] = useState(false);
    const [showRejectPopup, setShowRejectPopup] = useState(false);
    const [templateData, setTemplateData] = useState(null);
    const [confirmationData, setConfirmationData] = useState(null);
    const [employeeData, setEmployeeData] = useState(null); // State to hold employee data
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const companyId = localStorage.getItem("companyId");
    const logo = useCompanyLogo(companyId);
    const { id: employeeId } = useParams();
    const currentDate = new Date().toLocaleDateString();


    const handlePrint = () => {
        window.print();
    };

    const fetchemployeeId = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`);
            setEmployeeData(response.data); // Store employee data in state
        } catch (error) {
            console.error('Error fetching employee by ID:', error);
        }
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
        if (employeeId) fetchemployeeId(); // Fetch employee data by ID
    }, [companyId, employeeId]);

    const shouldShowButtons = confirmationData?.employeeAction === false;

    // Fetched employee's first name
    const firstName = employeeData?.firstName || ''; 
    const lastName = employeeData?.lastName || '';

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
                                    <p>Dear , <br/> Mr/Ms  {firstName ? `${firstName} ${lastName},` : 'Employee,'}</p>
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
                            <button className="btn" onClick={handlePrint}>Print</button>
                            <button className="btn" onClick={handleDownload}>Download PDF</button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="add-popup">
                    <p className='no-data'>No confirmation letter found for this employee.</p>
                </div>
            )}
        </div>
    );
};

export default ConfirmationView;
