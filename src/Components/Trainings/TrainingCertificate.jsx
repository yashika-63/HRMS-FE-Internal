import React from "react";
import '../CommonCss/AddEmp.css';
import '../CommonCss/Main.css';
import { useCompanyLogo } from "../../Api.jsx";

const TrainingCertificate = ({ data, onClose }) => {
    if (!data) return null;
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const employeeName = `${firstName || ""} ${lastName || ''}`;
    const companyId = localStorage.getItem("companyId");
    const logo = useCompanyLogo(companyId);

    return (
        <div className="certificate-overlay">
            <div className="certificate-container">
                <button className="close-btn" onClick={onClose}> X</button>
                <div className="certificate-border">
                    <div className="certificate-header">
                        <div className="certificate-logo">
                             <img className='HRMSNew'   src={logo}  alt="Pristine Logo" width={120} height={30} />
                        </div>
                        <h1>Certificate of Completion</h1>
                        <p>This is to certify that</p>
                    </div>

                    <div className="certificate-body">
                        <h2>{employeeName}</h2>
                        <p>has successfully completed the training program</p>
                        <h3>"{data.title}"</h3>

                        <div className="certificate-details">
                            <p>Certificate ID: {data.certificateId}</p>
                            <p>Training ID: {data.trainingId}</p>
                            <p>Date of Completion: {data.completionDate}</p>
                            {data.issuedDate && <p>Issued Date: {data.issuedDate}</p>}
                            {data.validUntil && <p>Valid Until: {data.validUntil}</p>}
                            {data.instructorName && <p>Instructor: {data.instructorName}</p>}
                            {data.duration && <p>Duration: {data.duration}</p>}
                            {data.department && <p>Department: {data.department}</p>}
                        </div>
                    </div>
                </div>

                <div className="certificate-actions">
                    <button className="btn" onClick={() => window.print()}>Print Certificate</button>
                    <button className="outline-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default TrainingCertificate;