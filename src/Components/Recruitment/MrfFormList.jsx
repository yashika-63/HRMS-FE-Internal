import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../string';
import CreateJobDescription from './CreateJobDescription';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FaUser, FaClipboard, FaList, FaCheckCircle, FaLaptop, FaMapMarkerAlt, FaEnvelope, FaBuilding } from 'react-icons/fa';
import { showToast } from '../../Api.jsx';

const MrfFormList = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [viewRequestData, setViewRequestData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const companyId = localStorage.getItem("companyId");
    const employeeId = localStorage.getItem("employeeId");
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);


    useEffect(() => {
        fetchJobRequests();
    }, []);

    const fetchJobRequests = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/jobdescription/getByCompanyAndEmployee/${companyId}/${employeeId}`
            );
            setViewRequestData(response.data || []);
        } catch (error) {
            console.error("Failed to fetch job descriptions:", error);
            showToast("Failed to load request data.,'error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenPopup = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        fetchJobRequests();
    };

    const handleViewClick = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
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
                        onClick={() => handleViewClick(item)}
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className='coreContainer'>


            <h2 className='form-title'>Man-Power Requests</h2>

            <div className="form-controls">
                <button className="btn" type="button" onClick={handleOpenPopup}>
                    MRF Form
                </button>
            </div>
            <div>
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <table className='interview-table'>
                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>Job Title</th>
                                <th>Created Date</th>
                                <th>Skills</th>
                                <th>Experience (Years)</th>
                                <th>Requirement Number</th>
                                <th>Request Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {viewRequestData.length === 0 ? (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center' }}>
                                        No data available.
                                    </td>
                                </tr>
                            ) : (
                                viewRequestData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.jobTitle}</td>

                                        <td>{new Date(item.date).toLocaleDateString()}</td>
                                        <td>
                                            <ul>
                                                {item.requiredSkills.split(/[,\n]/).slice(0, 6).map((skill, idx) => (
                                                    <li key={idx}>{skill.trim()}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td>{item.requiredExperience}</td>
                                        <td>{item.noOfRequirement}</td>
                                        <td>
                                            <span className={`status-confirmationBadge ${item.requestStatus === 'APPROVED' ? 'confirmed' : 'pending'}`}>
                                                {item.requestStatus === 'APPROVED' ? "APPROVED" : "PENDING"}
                                            </span>
                                        </td>
                                        <td>{editdropdown(item)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            {showPopup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <CreateJobDescription onClose={handleClosePopup} source="team" />
                    </div>
                </div>
            )}
            {showDetailModal && selectedItem && (
                <div className="modal-overlay">
                    <div className="modal-content1">
                        <h3 className="centerText">Job Description Details</h3>
                        <button className="close-btn" onClick={() => setShowDetailModal(false)}>X</button>
                        <div className="popup-contentin">
                            <div className="view-mode-container">

                                {/* Job Information Section */}
                                <div className="view-mode-section">
                                    <h4><FaUser /> Job Information</h4>
                                    <div className="view-mode-fields">
                                        <div className="view-mode-field">
                                            <label><FaClipboard className="icon" /> Job Title</label>
                                            <div className="view-mode-value">{selectedItem.jobTitle}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaList className="icon" /> Skills</label>
                                            <div className="view-mode-value">{selectedItem.requiredSkills}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaCheckCircle className="icon" /> Experience</label>
                                            <div className="view-mode-value">{selectedItem.requiredExperience}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaList className="icon" /> No. of Requirements</label>
                                            <div className="view-mode-value">{selectedItem.noOfRequirement}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaLaptop className="icon" /> Mode of Job</label>
                                            <div className="view-mode-value">{selectedItem.modeOfJob}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaMapMarkerAlt className="icon" /> Location</label>
                                            <div className="view-mode-value">{selectedItem.location}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaClipboard className="icon" /> Created Date</label>
                                            <div className="view-mode-value">{new Date(selectedItem.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information Section */}
                                <div className="view-mode-section">
                                    <h4><FaUser /> Contact Information</h4>
                                    <div className="view-mode-fields">
                                        <div className="view-mode-field">
                                            <label><FaUser className="icon" /> Contact Person</label>
                                            <div className="view-mode-value">{selectedItem.contactPerson}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaEnvelope className="icon" /> Email</label>
                                            <div className="view-mode-value">{selectedItem.contactPersonEmail}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Section */}
                                <div className="view-mode-section">
                                    <h4><FaList /> Status</h4>
                                    <div className="view-mode-fields">
                                        <div className="view-mode-field">
                                            <label><FaCheckCircle className="icon" /> Status</label>
                                            <div className="view-mode-value">{selectedItem.status ? "Active" : "Inactive"}</div>
                                        </div>
                                        <div className="view-mode-field">
                                            <label><FaCheckCircle className="icon" /> Request Status</label>
                                            <div className="view-mode-value">{selectedItem.requestStatus}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <div className="btnContainer">
                                    <button className="outline-btn" onClick={() => setShowDetailModal(false)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div>

    );
};

export default MrfFormList;
