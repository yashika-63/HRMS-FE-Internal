import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../string';
import { useCompanyLogo } from '../../Api.jsx';

const TemplateDetails = ({ selectedTemplate, setShowDetailsPopup, setShowUpdatepopup }) => {

    const currentDate = new Date().toLocaleDateString();
    const companyId = localStorage.getItem('companyId');
    const logo = useCompanyLogo(companyId);



    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="offerLetterContainer">
                    <button
                        type="button"
                        onClick={() => setShowDetailsPopup(false)}
                        className="close-button"
                    >
                        X
                    </button>
                    <div className="payslip-header">
                        <img
                            className="HRMSNew"
                            src={logo}
                            alt="Company Logo"
                            width={120}
                            height={30}
                        />
                    </div>

                    <h1 className="centerText">{selectedTemplate.templateIdentityKey}</h1>

                    <div className="date">
                        <p>Date: {selectedTemplate.date}</p>
                    </div>

                    <div className="address">
                        <p>{selectedTemplate?.company?.companyName || "Company Name"}</p>
                        <p>{selectedTemplate?.company?.companyAddress ||'Company Address'}</p>
                        <p>{`${selectedTemplate?.company?.city || 'City'}, ${selectedTemplate?.company?.state || 'State'}, ${selectedTemplate?.company?.postalCode || 'PostalCode'}`}</p>
                    </div>

                    <div className="subject">
                        <p><strong>Subject:</strong> {selectedTemplate.subject}</p>
                    </div>

                    <div className="salutation">
                        <p>Dear Candidate,</p>
                    </div>

                    <div className="body">
                        <p>{selectedTemplate.body}</p>
                    </div>

                    <div className="signature">
                        <p>Best regards,</p>
                        <p>HR Team</p>
                        <p>{selectedTemplate?.company?.companyName}</p>
                    </div>

                    <div className="btnContainer">
                        {/* <button type="button" className="btn" onClick={handlePrint}>Print</button> */}
                        <button type="button" className="outline-btn" onClick={() => setShowDetailsPopup(false)}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateDetails;
