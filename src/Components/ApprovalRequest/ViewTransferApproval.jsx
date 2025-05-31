import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ViewTransferApproval.css';
import { strings } from '../../string';
import { showToast } from '../../Api.jsx';

const ViewTransferApproval = ({ transferId, onClose, onApproveComplete, onRejectComplete, isWorkflowTransfer }) => {
    const companyId = localStorage.getItem('companyId');
    const division = localStorage.getItem('division');
    const department = localStorage.getItem('department');
    const companyRole = localStorage.getItem('companyRole');
    const employeeId = localStorage.getItem('employeeId');

    const [transferDetails, setTransferDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState(null);
    const [workflowOptions, setWorkflowOptions] = useState([]);
    const [workflowConfig, setWorkflowConfig] = useState(null);
    const [selectedWorkflowDetails, setSelectedWorkflowDetails] = useState(null);
    const [currentWorkflowStep, setCurrentWorkflowStep] = useState(0);
    const [popupData, setPopupData] = useState({
        date: new Date().toISOString().split('T')[0],
        note: '',
        email: ''
    });
    const [formData, setFormData] = useState({
        id: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    useEffect(() => {
        const fetchWorkflowIds = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/workflow/names/${companyId}`);
                setWorkflowOptions(response.data);
            } catch (error) {
                console.error('Error fetching workflow Name', error);
            }
        };
        fetchWorkflowIds();
    }, [companyId]);

    useEffect(() => {
        const fetchWorkflowDetails = async () => {
            if (formData.id) {
                try {
                    const response = await axios.get(`http://${strings.localhost}/api/workflow/getWorkflowById/${formData.id}`);
                    setSelectedWorkflowDetails(response.data);

                    // Find the current step based on employee's current department/role
                    const currentStep = response.data.workflowDetails.find(step =>
                        step.workflowFromDepartment === transferDetails.fromDepartment &&
                        step.workflowPreviousRole === transferDetails.employee?.jobTitle
                    );

                    if (currentStep) {
                        const stepIndex = response.data.workflowDetails.indexOf(currentStep);
                        setCurrentWorkflowStep(stepIndex);
                    }
                } catch (err) {
                    console.error('Error fetching workflow details:', err);
                }
            }
        };

        fetchWorkflowDetails();
    }, [formData.id, transferDetails]);

    useEffect(() => {
        const fetchTransferDetails = async () => {
            try {
                const [transferResponse, configResponse] = await Promise.all([
                    axios.get(`http://${strings.localhost}/api/Transfer-request/get-by-transfer/${transferId}`),
                    axios.get(`http://${strings.localhost}/api/workflow-configuration/by-company/${companyId}`)
                ]);

                setTransferDetails(transferResponse.data);
                const transferConfig = configResponse.data.find(config => config.moduleName === 'TRANSFER');
                setWorkflowConfig(transferConfig);

                setPopupData(prev => ({
                    ...prev,
                    email: transferResponse.data.employee?.email || '',
                    employeeName: transferResponse.data.employeeName ||
                        `${transferResponse.data.employee?.firstName || ''} ${transferResponse.data.employee?.lastName || ''}`.trim()
                }));

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchTransferDetails();
    }, [transferId]);

    const handleApproveClick = () => {
        setPopupType('approve');
        setShowPopup(true);
    };

    const handleRejectClick = () => {
        setPopupType('reject');
        setShowPopup(true);
    };

    const handleConfirmAction = async () => {
        try {
            const notesPayload = {
                employeeID: transferDetails.employee?.employeeId || '',
                name: popupData.employeeName || `${transferDetails.employee?.firstName || ''} ${transferDetails.employee?.lastName || ''}`.trim(),
                action: popupType === 'approve',
                mail: popupData.email || transferDetails.employee?.email || '',
                note: popupData.note,
                workflowId: formData.id
            };

            if (isWorkflowTransfer) {
                if (popupType === 'approve') {
                    // Get the current workflow step details
                    const workflowStep = selectedWorkflowDetails?.workflowDetails[currentWorkflowStep];

                    await axios.put(
                        `http://${strings.localhost}/api/transfer-approval/update-workflow?transferApprovalId=${transferId}&workflowMainId=${formData.id}&workflowDivision=${workflowStep.workflowToDivision}&workflowDepartment=${workflowStep?.workflowToDepartment}&workflowRole=${workflowStep?.workflowNextRole}`,
                        {
                            notes: popupData.note,
                            workflowMainId: formData.id,
                            division: workflowStep?.workflowToDivision || division,
                            department: workflowStep?.workflowToDepartment || department,
                            companyRole: workflowStep?.workflowNextRole || companyRole
                        }
                    );
                } else {
                    await axios.put(
                        `http://${strings.localhost}/api/transfer-approval/decline/${transferId}`,
                        {
                            notes: popupData.note
                        }
                    );
                }
            } else {
                await axios.post(
                    `http://${strings.localhost}/api/transfer-approval/saveapproval/${transferId}?workflowMainId=${formData.id}`,
                    {
                        notes: popupData.note,
                        aproveStatus: popupType === 'approve',
                        reportingManagerId: employeeId
                    }
                );
            }

            await axios.post(
                `http://${strings.localhost}/api/transfer-status/save/${transferId}`,
                notesPayload
            );

            showToast(`Transfer ${popupType === 'approve' ? 'approved' : 'rejected'} successfully!`, 'success');

            if (popupType === 'approve') {
                onApproveComplete();
            } else {
                onRejectComplete();
            }

            setShowPopup(false);
        } catch (err) {
            console.error('Error processing transfer:', err);
            showToast('Failed to process transfer', 'error');
        }
    };

    if (loading) return <div className="transfer-loading">Loading transfer details...</div>;
    if (error) return <div className="transfer-error">Error: {error}</div>;
    if (!transferDetails) return <div className="transfer-not-found">No transfer details found</div>;

    const shouldShowDropdown = workflowConfig?.moduleName === 'TRANSFER' && workflowConfig.status === true;

    return (
        <div className="transfer-approval-container">
            <h2>Transfer Request Details</h2>

            <div className="transfer-details-section">
                <h3>Basic Information</h3>
                <div className="detail-row">
                    <span className="detail-label">Transfer ID:</span>
                    <span className="detail-value">{transferDetails.id || 'N/A'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Employee Name:</span>
                    <span className="detail-value">
                        {transferDetails.employeeName ||
                            `${transferDetails.employee?.firstName || ''} ${transferDetails.employee?.lastName || ''}`.trim() || 'N/A'}
                    </span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Employee Email:</span>
                    <span className="detail-value">{transferDetails.employee?.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Request Date:</span>
                    <span className="detail-value">{transferDetails.transferDate || 'N/A'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{transferDetails.currentReportingActionTaken || 'N/A'}</span>
                </div>
            </div>

            <div className='input-row'>
                <div className="transfer-details-section">
                    <h3>From</h3>
                    <div className="detail-row">
                        <span className="detail-label">Department:</span>
                        <span className="detail-value">{transferDetails.fromDepartment || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Region:</span>
                        <span className="detail-value">{transferDetails.fromRegion || 'N/A'}</span>
                    </div>
                </div>

                <div className="transfer-details-section">
                    <h3>To</h3>
                    <div className="detail-row">
                        <span className="detail-label">Department:</span>
                        <span className="detail-value">{transferDetails.toDepartment || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Region:</span>
                        <span className="detail-value">{transferDetails.toRegion || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="transfer-details-section">
                <h3>Additional Information</h3>
                <div className="detail-row">
                    <span className="detail-label">Requested By:</span>
                    <span className="detail-value">{transferDetails.requestedBy || 'N/A'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Approved By:</span>
                    <span className="detail-value">{transferDetails.approvedBy || 'N/A'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Reason:</span>
                    <span className="detail-value">{transferDetails.reason || 'N/A'}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value">{transferDetails.notes || 'N/A'}</span>
                </div>
            </div>

            <div className="form-controls">
                <button className="outline-btn" onClick={onClose}>Close</button>
                <button className="outline-btn" onClick={handleRejectClick}>Reject</button>
                <button className="btn" onClick={handleApproveClick}>Approve</button>
            </div>

            {showPopup && (
                <div className="add-popup">
                    <div className="popup-content">
                        <h3>{popupType === 'approve' ? 'Approve Request' : 'Reject Request'}</h3>

                        <label htmlFor="name">Employee Name</label>
                        <input
                            type="text"
                            id="name"
                            value={popupData.employeeName ||
                                `${transferDetails.employee?.firstName || ''} ${transferDetails.employee?.lastName || ''}`.trim()}
                            readOnly
                        />

                        <label htmlFor="date">Date</label>
                        <input
                            type="text"
                            id="date"
                            value={popupData.date}
                            onChange={(e) => setPopupData({ ...popupData, date: e.target.value })}
                        />

                        <label htmlFor="note">Note</label>
                        <input
                            type="text"
                            id="note"
                            value={popupData.note}
                            onChange={(e) => setPopupData({ ...popupData, note: e.target.value })}
                        />

                        <label htmlFor="email">Email ID</label>
                        <input
                            type="email"
                            id="email"
                            value={popupData.email || transferDetails.employee?.email || ''}
                            onChange={(e) => setPopupData({ ...popupData, email: e.target.value })}
                        />

                        {shouldShowDropdown && (
                            <div>
                                <span className="required-marker">*</span>
                                <label htmlFor='workflowId'>Workflow ID:</label>
                                <select className='selectIM' name='id' value={formData.id} onChange={handleInputChange} required>
                                    <option value=''></option>
                                    {workflowOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.workflowName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-control">
                            {shouldShowDropdown && !formData.id && (
                                <div className="error-message">Please select a workflow ID</div>
                            )}

                            <button
                                type='button'
                                className='btn'
                                onClick={handleConfirmAction}
                                disabled={shouldShowDropdown && !formData.id}
                            >
                                {popupType === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
                            </button>
                            <button
                                type='button'
                                className='outline-btn'
                                onClick={() => setShowPopup(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewTransferApproval;