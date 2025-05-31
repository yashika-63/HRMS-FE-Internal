import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../../string";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FaBuilding, FaCheckCircle, FaClipboard, FaEnvelope, FaLaptop, FaList, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { showToast } from "../../Api.jsx";

const MrfApprovalRequest = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const division = localStorage.getItem("division");
    const department = localStorage.getItem("department");
    const companyRole = localStorage.getItem("companyRole");
    const companyId = localStorage.getItem("companyId");
    const firstName = localStorage.getItem("firstName");
    const employeeId = localStorage.getItem("employeeId");
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [note, setNote] = useState("");
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const todayDate = new Date().toLocaleDateString();
    useEffect(() => {
        const fetchApprovals = async () => {
            try {
                const response = await axios.get(
                    `http://${strings.localhost}/api/jobdescriptionApproval/jobDescriptionApprovals?division=${division}&department=${department}&role=${companyRole}&companyId=${companyId}&requestStatus=PENDING`,

                );
                setData(response.data || []);
            } catch (error) {
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchApprovals();
    }, [division, department, companyRole, companyId]);

    // if (loading) return <div>Loading...</div>;

    // if (!data.length) return <div>No data found.</div>;


    const handleAccept = async () => {
        setIsProcessing(true);
        try {
            await axios.put(
                `http://${strings.localhost}/api/jobdescriptionApproval/updateWorkflow/${selectedItem.jobDescription.id}/${companyId}/${employeeId}/${selectedItem.workflowMain.id}/${selectedItem.workflowDivision}/${selectedItem.workflowDepartment}/${selectedItem.workflowRole}`,
                { note }
            );
            showToast("Accepted Successfully.", 'success');
            removeItemFromList(selectedItem.jobDescription.id);
        } catch (error) {
            showToast("Failed to accept",'error');
        } finally {
            setIsProcessing(false);
            closeModals();
        }
    };

    const handleReject = async () => {
        setIsProcessing(true);
        try {
            await axios.put(
                `http://${strings.localhost}/api/jobdescriptionApproval/decline/${selectedItem.jobDescription.id}/${companyId}/${employeeId}`,
                { note }
            );
            showToast("Rejected Successfully.", 'success');
            removeItemFromList(selectedItem.jobDescription.id);
        } catch (error) {
            showToast("Reject failed. Try again.", 'error');
        } finally {
            setIsProcessing(false);
            closeModals();
        }
    };

    const removeItemFromList = (idToRemove) => {
        setData(prev => prev.filter(item => item.jobDescription.id !== idToRemove));
    };

    const closeModals = () => {
        setShowDetailModal(false);
        setIsActionModalOpen(false);
        setNote("");
    };
    const editdropdown = (item) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button
                        type='button'
                        onClick={() => {
                            setSelectedItem(item);
                            setShowDetailModal(true);
                        }}
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="coreContainer">
            <table className="interview-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Job Title</th>
                        <th>Experience</th>
                        <th>Location</th>
                        <th>No. of requirement</th>
                        <th>Mode of job</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="no-data1">No data found</td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr key={item.id || item._id}>
                                <td>{item.id || item._id}</td>
                                <td>{item.jobDescription?.jobTitle}</td>
                                <td>{item.jobDescription?.requiredExperience}</td>
                                <td>{item.jobDescription?.location}</td>
                                <td>{item.jobDescription?.noOfRequirement}</td>
                                <td>{item.jobDescription?.modeOfJob}</td>
                                <td>{editdropdown(item)}</td>
                            </tr>
                        ))
                    )}
                </tbody>

            </table>
            {showDetailModal && selectedItem && (
                <div className="modal-overlay">

                    <div className="modal-content1">
                        <h3 className="centerText">Job Description Details</h3>
                        <button className="close-btn" onClick={() => setShowDetailModal(false)}>X</button>
                        <div className="popup-contentin">
                            <div className="view-mode-container">
                                <div className="view-mode-section">
                                    <h4><FaUser /> Job Information</h4>
                                    <div className="view-mode-fields">
                                        <div className="view-mode-field">
                                            <label><FaClipboard className="icon" /> Job Title</label>
                                            <div className="view-mode-value">{selectedItem.jobDescription?.jobTitle}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaList className="icon" /> Description</label>
                                            <div className="view-mode-value">{selectedItem.jobDescription?.jobDesc}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaList className="icon" /> Skills</label>
                                            <div className="view-mode-value">{selectedItem.jobDescription?.requiredSkills}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaCheckCircle className="icon" /> Experience</label>
                                            <div className="view-mode-value">{selectedItem.jobDescription?.requiredExperience}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaLaptop className="icon" /> Mode of Job</label>
                                            <div className="view-mode-value">{selectedItem.jobDescription?.modeOfJob}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaList className="icon" /> No. of Requirements</label>
                                            <div className="view-mode-value">{selectedItem.jobDescription?.noOfRequirement}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaMapMarkerAlt className="icon" /> Location</label>
                                            <div className="view-mode-value">{selectedItem.jobDescription?.location}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="view-mode-section">
                                    <h4><FaUser /> Contact Information</h4>
                                    <div className="view-mode-fields">
                                        <div className="view-mode-field">
                                            <label><FaUser className="icon" /> Contact Person</label>
                                            <div className="view-mode-value">{selectedItem.jobDescription?.contactPerson}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaEnvelope className="icon" /> Email</label>
                                            <div className="view-mode-value">{selectedItem.jobDescription?.contactPersonEmail}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="view-mode-section">
                                    <h4><FaList /> Status & Links</h4>
                                    <div className="view-mode-fields">
                                        <div className="view-mode-field">
                                            <label><FaCheckCircle className="icon" /> Status</label>
                                            <div className="view-mode-value">{selectedItem.jobDescription?.requestStatus}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaClipboard className="icon" /> JD Link</label>
                                            <div className="view-mode-value">
                                                <a href={selectedItem.jobDescription?.jdLink} target="_blank" rel="noreferrer">View JD</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="view-mode-section">
                                    <h4><FaBuilding /> Company Information</h4>
                                    <div className="view-mode-fields">
                                        <div className="view-mode-field">
                                            <label><FaBuilding className="icon" /> Company Name</label>
                                            <div className="view-mode-value">{selectedItem.company?.companyName}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaMapMarkerAlt className="icon" /> Address</label>
                                            <div className="view-mode-value">{selectedItem.company?.companyAddress}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="btnContainer">
                                    <button onClick={() => { setActionType("accept"); setIsActionModalOpen(true); }} className="btn">Accept</button>
                                    <button onClick={() => { setActionType("reject"); setIsActionModalOpen(true); }} className="outline-btn">Reject</button>
                                    <button className="outline-btn" onClick={() => setShowDetailModal(false)}>Close</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
            {isActionModalOpen && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-content1">
                        <h3 className="centerText">{actionType === "accept" ? "Accept" : "Reject"} Job Description</h3>
                        <button className="close-btn" onClick={() => setIsActionModalOpen(false)}>X</button>
                        <div>
                            <label>Employee Name</label>
                            <input type="text" value={selectedItem.jobDescription.contactPerson} readOnly className='readonly' />
                            <label>Email</label>
                            <input type="text" value={selectedItem.jobDescription.contactPersonEmail} readOnly className='readonly' />
                            <label>Date</label>
                            <input type="text" value={todayDate} readOnly className='readonly' />
                            <label>Note</label>
                            <textarea
                                className="note-input"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={4}
                            />
                            <div className="btnContainer">
                                <button
                                    type="button"
                                    className="btn"
                                    disabled={isProcessing}
                                    onClick={actionType === "accept" ? handleAccept : handleReject}
                                >
                                    {isProcessing ? (actionType === "accept" ? "Accepting..." : "Rejecting...") : (actionType === "accept" ? "Accept" : "Reject")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MrfApprovalRequest;