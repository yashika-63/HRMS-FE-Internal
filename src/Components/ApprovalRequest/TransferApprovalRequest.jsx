import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../../string";
import { showToast } from "../../Api.jsx";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ViewTransferApproval from "./ViewTransferApproval.jsx";

const TransferApprovalRequest = () => {
    const [reportingManagerTransfers, setReportingManagerTransfers] = useState([]);
    const [workflowTransfers, setWorkflowTransfers] = useState([]);
    const [transferToView, setTransferToView] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const reportingManagerId = localStorage.getItem('employeeId');
    const companyRole = localStorage.getItem("companyRole");
    const companyId = localStorage.getItem('companyId');
    const division = localStorage.getItem('division');
    const department = localStorage.getItem('department');

    useEffect(() => {
        fetchTransfers();
    }, []);

    const fetchTransfers = async () => {
        try {
            const [managerResponse, workflowResponse] = await Promise.all([
                axios.get(`http://${strings.localhost}/api/Transfer-request/get-transfer-by-reporting/${reportingManagerId}?currentReportingActionTaken=false`),
                axios.get(`http://${strings.localhost}/api/transfer-approval/get-by-filter/${companyId}/${division}/${department}/${companyRole}`)
            ]);

            setReportingManagerTransfers(managerResponse.data || []);
            setWorkflowTransfers(workflowResponse.data || []);
        } catch (error) {
            console.error("Error fetching transfers:", error);
            showToast("Failed to fetch transfer requests", 'error');
        }
    };

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-');
    };

    const handleApproveComplete = () => {
        fetchTransfers();
        setShowViewModal(false);
    };

    const handleRejectComplete = () => {
        fetchTransfers();
        setShowViewModal(false);
    };

    const handleViewTransfer = (transfer, isWorkflowTransfer = false) => {
        setTransferToView({ ...transfer, isWorkflowTransfer });
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setTransferToView(null);
    };

    const editdropdownTransfer = (transfer, isWorkflowTransfer = false) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewTransfer(transfer, isWorkflowTransfer);
                        }}> View </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className='coreContainer'>
            <h2>Reporting Manager Transfers</h2>
            <table className='Attendance-table'>
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Employee Id</th>
                        <th>Employee Name</th>
                        <th>From Department</th>
                        <th>To Department</th>
                        <th>From Region</th>
                        <th>To Region</th>
                        <th>Transfer Date</th>
                        <th>Reason</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {reportingManagerTransfers.length > 0 ? (
                        reportingManagerTransfers.map((transfer, index) => (
                            <tr key={transfer.id} style={{ cursor: "pointer" }}>
                                <td>{index + 1}</td>
                                <td style={{ cursor: 'pointer', color: 'blue' }}>
                                    {transfer.employee?.employeeId || "N/A"}
                                </td>
                                <td>
                                    {transfer.employeeName ||
                                        `${transfer.employee?.firstName || ""} ${transfer.employee?.lastName || ""}`.trim() || "N/A"}
                                </td>
                                <td>{transfer.fromDepartment || "N/A"}</td>
                                <td>{transfer.toDepartment || "N/A"}</td>
                                <td>{transfer.fromRegion || "N/A"}</td>
                                <td>{transfer.toRegion || "N/A"}</td>
                                <td>{formatDate(transfer.transferDate)}</td>
                                <td>{transfer.reason || "N/A"}</td>
                                <td>{editdropdownTransfer(transfer, false)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="10">No pending reporting manager transfers found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <h2>Workflow Transfers</h2>
            <table className='Attendance-table'>
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Employee Id</th>
                        <th>Employee Name</th>
                        <th>From Department</th>
                        <th>To Department</th>
                        <th>From Region</th>
                        <th>To Region</th>
                        <th>Transfer Date</th>
                        <th>Reason</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {workflowTransfers.length > 0 ? (
                        workflowTransfers.map((transfer, index) => (
                            <tr key={transfer.id} style={{ cursor: "pointer" }}>
                                <td>{index + 1}</td>
                                <td style={{ cursor: 'pointer', color: 'blue' }}>
                                    {transfer.employee?.employeeId || "N/A"}
                                </td>
                                <td>
                                    {transfer.employeeName ||
                                        `${transfer.employee?.firstName || ""} ${transfer.employee?.lastName || ""}`.trim() || "N/A"}
                                </td>
                                <td>{transfer.fromDepartment || "N/A"}</td>
                                <td>{transfer.toDepartment || "N/A"}</td>
                                <td>{transfer.fromRegion || "N/A"}</td>
                                <td>{transfer.toRegion || "N/A"}</td>
                                <td>{formatDate(transfer.transferDate)}</td>
                                <td>{transfer.reason || "N/A"}</td>
                                <td>{editdropdownTransfer(transfer, true)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="10">No pending workflow transfers found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {showViewModal && transferToView && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '900px' }}>
                        <span className="close" onClick={handleCloseViewModal}>&times;</span>
                        <ViewTransferApproval
                            transferId={transferToView.id}
                            onClose={handleCloseViewModal}
                            onApproveComplete={handleApproveComplete}
                            onRejectComplete={handleRejectComplete}
                            isWorkflowTransfer={transferToView.isWorkflowTransfer}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransferApprovalRequest;