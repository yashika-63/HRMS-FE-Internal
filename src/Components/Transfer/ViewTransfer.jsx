import React, { useState, useEffect } from 'react';
import { FaUser, FaExchangeAlt, FaCalendarAlt, FaFileAlt, FaUserTie } from 'react-icons/fa';
import axios from 'axios';
import './ViewTransfer.css';
import { strings } from '../../string';

const ViewTransfer = ({ transferId, onClose }) => {
    const [transfer, setTransfer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransferData = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/Transfer-request/get-by-transfer/${transferId}`);
                setTransfer(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Error fetching transfer data:', err);
            }
        };

        if (transferId) {
            fetchTransferData();
        }
    }, [transferId]);

    if (loading) return <div className="modal-overlay">Loading...</div>;
    if (error) return <div className="modal-overlay">Error: {error}</div>;
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
                                <span>{transfer.employee?.employeeId || '-'}</span>
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
                                    <label>Reporting Person Name:</label>
                                    <span>{transfer.reportingManagerName || '-'}</span>
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
                                        <strong>Department: </strong>
                                        <span>{transfer.fromDepartment || '-'}</span>
                                    </div>
                                    <br />
                                    <div className="inline-detail-item">
                                        <strong>Region: </strong>
                                        <span>{transfer.fromRegion || '-'}</span>
                                    </div>
                                </div>
                                <div>
                                    <FaExchangeAlt />
                                </div>
                                <div className="transfer-to">
                                    <h3 className="underlineText">To</h3>
                                    <div className="inline-detail-item">
                                        <strong>Department: </strong>
                                        <span>{transfer.toDepartment || '-'}</span>
                                    </div>
                                    <br />
                                    <div className="inline-detail-item">
                                        <strong>Region: </strong>
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

                <div className="btnContainer">
                    <button type="button" className="outline-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewTransfer;