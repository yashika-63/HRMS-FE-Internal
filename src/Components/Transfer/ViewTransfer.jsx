import React from 'react';
import { FaUser, FaExchangeAlt, FaCalendarAlt, FaFileAlt, FaUserTie } from 'react-icons/fa';
import './ViewTransfer.css';

const ViewTransfer = ({ transfer, onClose }) => {
    if (!transfer) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Transfer Details</h2>
                    <button className="button-close" onClick={onClose}>×</button>
                </div>

                <div className="view-modal-content">
                    <div className="detail-section">
                        <h3 className="underlineText">Employee Information</h3>
                        <div className="detail-transfer-grid">
                            <div className="detail-item">
                                <label>Employee ID:</label>
                                <span>{transfer.employeeId || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Employee Name:</label>
                                <span>{transfer.employeeName || '-'}</span>
                            </div>
                            <div className="detail-transfer-grid">
                                <div className="detail-item">
                                    <label>Transfer Date:</label>
                                    <span>{transfer.transferDate || '-'}</span>
                                </div>
                            </div>
                            <div className="detail-transfer-grid">
                                <div className="detail-item">
                                    <label>Responsible Person Name:</label>
                                    <span>{transfer.responsiblePerson || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3 className="underlineText">Transfer Details</h3>
                        <div className="">
                            <div className="transfer-direction">
                                <div className="transfer-from">
                                    <h3 className="underlineText">From</h3>
                                    <div className="inline-detail-item">
                                        <label>Department:</label>
                                        <span>{transfer.fromDepartment || '-'}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                        <label>Region:</label>
                                        <span>{transfer.fromRegion || '-'}</span>
                                    </div>
                                </div>
                                <div>
                                    <FaExchangeAlt />
                                </div>
                                <div className="transfer-to">
                                    <h3 className="underlineText">To</h3>
                                    <div className="inline-detail-item">
                                        <label>Department:</label>
                                        <span>{transfer.toDepartment || '-'}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                        <label>Region:</label>
                                        <span>{transfer.toRegion || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3 className="underlineText">Additional Information</h3>
                        <div className="detail-item">
                            <label>Reason for Transfer:</label>
                            <span>{transfer.reason || '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="form-controls" style={{ justifyContent: 'center' }}>
                    <button type="button" className="outline-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ label, value }) => (
    <div className="detail-item">
        <label>{label}:</label>
        <span>{value || '-'}</span>
    </div>
);

export default ViewTransfer;