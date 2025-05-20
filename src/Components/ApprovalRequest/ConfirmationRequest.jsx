import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { strings } from "../../string";
import { showToast } from "../../Api.jsx";
import axios from "axios";

const ConfirmationRequest = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [action, setAction] = useState(null);
    const [reason, setReason] = useState("");
    const [extendMonths, setExtendMonths] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [apiLoading, setApiLoading] = useState(false);
    const firstName = localStorage.getItem("firstName");
    const employeeId = localStorage.getItem("employeeId");
    const companyId = localStorage.getItem("companyId");

    const [approveNote, setApproveNote] = useState("");
    const [terminateNote, setTerminateNote] = useState("");
    const [extendNote, setExtendNote] = useState("");


    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch(
                    `http://${strings.localhost}/api/confirmation/pending/responsible/${employeeId}`
                );

                if (!res.ok) throw new Error("Failed to fetch data");
                const data = await res.json();

                if (data?.length > 0) {
                    setEmployees(data);
                    setError("");
                } else {
                    setEmployees([]);
                    setError("No active confirmations.");
                }
            } catch (err) {
                setEmployees([]);
                setError("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [employeeId]);

    const getFullName = (employee) => {
        const { firstName, middleName, lastName } = employee?.employee || {};
        return `${firstName || ""} ${middleName || ""} ${lastName || ""}`.trim();
    };

    const handleNameClick = (employee) => {
        setSelectedEmployee(employee);
        setAction(null);
    };

    const handleActionClick = (type) => setAction(type);

    const closePopup = () => {
        setSelectedEmployee(null);
        setAction(null);
        setReason("");
        setExtendMonths(1);
    };
    const handleConfirm = async () => {
        setApiLoading(true);
        try {
            const confirmApi = axios.post(
                `http://${strings.localhost}/api/confirmationAction/confirm/${selectedEmployee.id}`,
                {
                    note: approveNote,
                    actionTakenBy: `${firstName} (${employeeId})`,
                }
            );

            const saveApi = axios.post(
                `http://${strings.localhost}/api/confirmationLetter/save`,
                null,
                {
                    params: {
                        employeeId: selectedEmployee.employee?.id,
                        createdById: employeeId,
                        companyId: localStorage.getItem("companyId"),
                    },
                }
            );

            await Promise.all([confirmApi, saveApi]);

            showToast(`Employee ${getFullName(selectedEmployee)} has been approved.`, "success");
            closePopup();
        } catch (err) {
            const backendError =
                err.response?.data?.details || err.response?.data?.error || "Error approving confirmation.";
            showToast(backendError, "error");
        } finally {
            setApiLoading(false);
        }
    };


    const handleReject = async () => {
        setApiLoading(true);
        try {
            const res = await axios.post(
                `http://${strings.localhost}/api/confirmationAction/terminate/${selectedEmployee.id}`,
                {
                    note: terminateNote,
                    actionTakenBy: `${firstName} (${employeeId})`,
                }
            );
            showToast(`Employee ${getFullName(selectedEmployee)} has been terminated.`, 'success');
            // setTimeout(() => {
            closePopup();
            // }, 2000);
        } catch (err) {
            showToast("Error terminating confirmation.", 'error');
        } finally {
            setApiLoading(false);
        }
    };

    const handleExtend = async () => {
        setApiLoading(true);
        try {
            const res = await axios.post(
                `http://${strings.localhost}/api/confirmationAction/extendProbation/${selectedEmployee.id}?newTotalMonths=${extendMonths}`,
                {
                    note: extendNote,
                    actionTakenBy: `${firstName} (${employeeId})`,
                }
            );
            showToast(`Employee ${getFullName(selectedEmployee)}'s probation has been extended.`, 'success');
            // setTimeout(() => {
            closePopup();
            // }, 2000);
        } catch (err) {
            showToast("Error extending probation.", 'error');
        } finally {
            setApiLoading(false);
        }
    };

    const ActionDropdown = ({ employee }) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <button type="button" onClick={() => handleNameClick(employee)}>
                    View
                </button>
            </div>
        </div>
    );

    return (
        <div className="coreContainer">
            {loading ? (
                <p>Loading...</p>
            ) : employees.length === 0 ? (
                <p>{error}</p>
            ) : (
                <table className="Attendance-table">
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>Designation</th>
                            <th>Department</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp, index) => (
                            <tr key={emp.id}>
                                <td>{index + 1}</td>
                                <td>{emp.employee?.employeeId}</td>
                                <td
                                    style={{ cursor: "pointer", color: "blue" }}
                                    onClick={() => handleNameClick(emp)}
                                >
                                    {getFullName(emp)}
                                </td>
                                <td>{emp.employee?.designation}</td>
                                <td>{emp.employee?.department}</td>
                                <td><ActionDropdown employee={emp} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* ========== Popup View ========== */}
            {selectedEmployee && (
                <div className="add-popup">
                    <div className="popup-fields">
                        <h3 className="centerText">Employee Details</h3>
                        <button className="close-button" onClick={closePopup}>X</button>
                    </div>
                    <p><strong>Date: </strong>{selectedEmployee.date}</p>
                    <p><strong>Name:</strong> {getFullName(selectedEmployee)} ({selectedEmployee.employee?.employeeId})</p>
                    <p><strong>Designation: </strong>{selectedEmployee.employee?.designation}</p>
                    <p><strong>Department:</strong> {selectedEmployee.employee?.department}</p>
                    <p><strong>Joining Date: </strong>{selectedEmployee.employee?.joiningDate}</p>
                    <div className="form-controls">
                        <button className="btn" onClick={() => handleActionClick("extend")}>Extend</button>
                        <button className="btn" onClick={() => handleActionClick("approve")}>Approve</button>
                        <button className="outline-btn" onClick={() => handleActionClick("terminate")}>Terminate</button>
                    </div>
                </div>
            )}

            {/* ========== Approve Popup ========== */}
            {action === "approve" && (
                <div className="add-popup">
                    <div className="popup-fields">
                        <div className="centerText">
                            <h3 style={{ textAlign: 'center' }}>Confirmation</h3>
                            <button className="close-button" onClick={closePopup}>X</button>
                        </div>
                        <p>Are you sure you want to approve {getFullName(selectedEmployee)}?</p>
                        <div>
                            <span className="required-marker">*</span>

                            <label>Note:</label>
                            <textarea
                                rows="3"
                                value={approveNote}
                                required
                                onChange={(e) => setApproveNote(e.target.value)}
                                placeholder="Write a note here..."
                            />
                        </div>
                        <div className="btnContainer">
                            {apiLoading && <div className="loading-spinner"></div>}
                            <button className="btn" onClick={handleConfirm} disabled={apiLoading}>
                                {apiLoading ? "Processing..." : "Yes"}
                            </button>
                            <button className="outline-btn" onClick={() => setAction(null)}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== Reject Popup ========== */}
            {action === "terminate" && (
                <div className="add-popup">
                    <div className="popup-fields">
                        <h2 className="centerText">Termination</h2>
                        <button className="close-button" onClick={closePopup}>X</button>
                    </div>
                    <p>Are you sure you want to terminate {getFullName(selectedEmployee)}?</p>
                    <div>
                        <span className="required-marker">*</span>

                        <label>Note:</label>
                        <textarea
                            rows="3"
                            required
                            value={terminateNote}
                            onChange={(e) => setTerminateNote(e.target.value)}
                            placeholder="Write a note here..."
                        />
                    </div>
                    <div className="btnContainer">
                        {apiLoading && <div className="loading-spinner"></div>}
                        <button className="btn" onClick={handleReject} disabled={apiLoading}>
                            {apiLoading ? "Processing..." : "Yes"}
                        </button>
                        <button className="outline-btn" onClick={() => setAction(null)}>No</button>
                    </div>
                </div>
            )}

            {/* ========== Extend Popup ========== */}
            {action === "extend" && (
                <div className="add-popup">
                    <div className="popup-fields">
                        <h2 className="centerText">Extend Request</h2>
                        <button className="close-button" onClick={closePopup}>X</button>
                    </div>
                    <p><strong>Name:</strong> {getFullName(selectedEmployee)}</p>
                    <p><strong>ID:</strong> {selectedEmployee.employee?.employeeId}</p>
                    <div>
                        <label>Updated total probation months:</label>
                        <select

                            value={extendMonths}
                            onChange={(e) => setExtendMonths(e.target.value)}
                        >
                            <option value="">Select Months</option>
                            {[...Array(24)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1} {i + 1 === 1 ? 'month' : 'months'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <span className="required-marker">*</span>

                        <label>Note:</label>
                        <textarea
                            rows="3"
                            value={extendNote}
                            required
                            onChange={(e) => setExtendNote(e.target.value)}
                            placeholder="Write a note here..."
                        />
                    </div>
                    <div className="btnContainer">
                        {apiLoading && <div className="loading-spinner"></div>}
                        <button className="btn" onClick={handleExtend} disabled={apiLoading}>
                            {apiLoading ? "Processing..." : "Submit"}
                        </button>
                        <button className="outline-btn" onClick={() => setAction(null)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfirmationRequest;
