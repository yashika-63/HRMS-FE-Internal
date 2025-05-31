import { useState, useEffect } from 'react';
import '../../CommonCss/AddEmp.css';
import '../../CommonCss/Main.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FaEye, FaCheck, FaPlus, FaTimes, FaFileUpload } from 'react-icons/fa';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { showToast } from '../../../Api.jsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { strings } from '../../../string.jsx';

function EmployeeHandover() {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [handovers, setHandovers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id: employeeId } = useParams();

    const [expandedView, setExpandedView] = useState(false);
    const [documentSections, setDocumentSections] = useState([{ files: [], uploading: false }]);
    const [noteSections, setNoteSections] = useState([{ id: Date.now(), text: '' }]);
    const [uploadError, setUploadError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [hasPendingDocument, setHasPendingDocument] = useState(false);

    const statusCounts = handovers.reduce((acc, handover) => {
        const status = handover.status.toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, { completed: 0, pending: 0, expired: 0 });

    useEffect(() => {
        const fetchAssignedHandovers = async () => {
            try {
                const response = await fetch(
                    `http://${strings.localhost}/api/knowledgeTransfer/target?employeeToId=${employeeId}  `
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch assigned handovers');
                }
                const data = await response.json();

                const transformedData = data.map(item => ({
                    id: item.id,
                    handoverId: item.handoverId || (item.handover ? item.handover.id : null),
                    title: item.title || 'No Title',
                    date:item.date || "No Date",
                    description: item.description || 'No Description',
                    status: item.completionStatus ? "Completed" :
                        item.expiryStatus ? "Expired" : "Pending",
                    assignDate: item.assignDate || null
                }));

                setHandovers(transformedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedHandovers();
    }, [employeeId]);

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const [selectedHandover, setSelectedHandover] = useState(null);
    const [showDetailsPopup, setShowDetailsPopup] = useState(false);
    const [newDocument, setNewDocument] = useState({ name: '', filePath: null });
    const [uploadedDocuments, setUploadedDocuments] = useState([]);

    const handleView = async (handover) => {
        setSelectedHandover(handover);
        setOpenMenuId(null);
        setShowDetailsPopup(true);
        setExpandedView(false);
        setDocumentSections([{ files: [], uploading: false }]);
        setNoteSections([{ text: '' }]);
        setSuccessMessage(null);
        setUploadError(null);

        try {
            const response = await fetch(
                `http://${strings.localhost}/api/KnowledgeDocument/DocumentTraining/${handover.id}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch documents');
            }
            const documents = await response.json();
            setUploadedDocuments(documents);
        } catch (err) {
            console.error('Error fetching documents:', err);
            setUploadedDocuments([]);
        }
    };

    const handleDocumentChange = (e, sectionIndex) => {
        const updatedSections = [...documentSections];
        updatedSections[sectionIndex].files = [...e.target.files];
        setDocumentSections(updatedSections);
    };

    const handleNoteChange = (e, sectionIndex) => {
        const updatedSections = [...noteSections];
        updatedSections[sectionIndex].text = e.target.value;
        setNoteSections(updatedSections);
    };

    const addDocumentSection = () => {
        setDocumentSections([...documentSections, { files: [], uploading: false }]);
    };

    const removeDocumentSection = (index) => {
        if (documentSections.length > 1) {
            const updatedSections = [...documentSections];
            updatedSections.splice(index, 1);
            setDocumentSections(updatedSections);
        }
    };

    const addNoteSection = () => {
        setNoteSections([...noteSections, { id: Date.now(), text: '' }]);
    };

    const removeNoteSection = (index) => {
        if (noteSections.length > 1) {
            const updatedSections = [...noteSections];
            updatedSections.splice(index, 1);
            setNoteSections(updatedSections);
        }
    };

    const uploadDocument = async (sectionIndex) => {
        const section = documentSections[sectionIndex];
        if (section.files.length === 0) return;

        const updatedSections = [...documentSections];
        updatedSections[sectionIndex].uploading = true;
        setDocumentSections(updatedSections);
        setUploadError(null);

        try {
            for (const file of section.files) {
                const formData = new FormData();
                formData.append('file', file); // Use the actual file object here

                const response = await fetch(
                    `http://${strings.localhost}/api/KnowledgeDocument/${selectedHandover.id}/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to upload document');
                }
            }
            updatedSections[sectionIndex].files = [];
            setDocumentSections(updatedSections);
            setSuccessMessage('Documents uploaded successfully!');
        } catch (err) {
            setUploadError(err.message);
        } finally {
            updatedSections[sectionIndex].uploading = false;
            setDocumentSections(updatedSections);
        }
    };

    const saveNote = async (sectionIndex) => {
        const section = noteSections[sectionIndex];
        if (!section.text.trim()) return;

        const updatedSections = [...noteSections];
        setNoteSections(updatedSections);
        setUploadError(null);

        try {
            const response = await fetch(
                `http://${strings.localhost}/api/kt-notes/save?knowledgeTransferId=${selectedHandover.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        notes: section.text,
                        createdBy: employeeId
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to save note');
            }
            if (sectionIndex > 0) {
                updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], text: '' };
            } else {
                updatedSections[sectionIndex] = { ...updatedSections[sectionIndex] };
            }

            setNoteSections(updatedSections);
            toast.success('Note saved successfully!');
            setTimeout(() => setSuccessMessage(null), 2000);
        } catch (err) {
            updatedSections[sectionIndex] = { ...updatedSections[sectionIndex] };
            setNoteSections(updatedSections);
            setUploadError(err.message);
        }
    };

    const handleAcknowledge = async () => {
        if (expandedView) {
            for (let i = 0; i < documentSections.length; i++) {
                if (documentSections[i].files.length > 0) {
                    await uploadDocument(i);
                }
            }
            try {
                const completeResponse = await fetch(
                    `http://${strings.localhost}/api/knowledgeTransfer/complete?recordId=${selectedHandover.id}&employeeToId=${employeeId}`,
                    {
                        method: 'PUT',
                    }
                );
                if (!completeResponse.ok) {
                    throw new Error('Failed to mark as completed');
                }
                toast.success('Handover acknowledged and completed successfully!');
                setHandovers(handovers.map(h =>
                    h.id === selectedHandover.id ? { ...h, status: "Completed" } : h
                ));
                setTimeout(() => {
                    setShowDetailsPopup(false);
                    setExpandedView(false);
                }, 2000);
            } catch (err) {
                setUploadError(err.message);
            }
        } else {
            setExpandedView(true);
        }
    };

    const handleAddDocument = async () => {
        if (!newDocument.filePath) {
            toast.error('Please select a file to upload');
            return;
        }
        if (newDocument.filePath.size > 10 * 1024 * 1024) {
            toast.warning('File size should be less than 10MB');
            return;
        }
        const formData = new FormData();
        formData.append('file', newDocument.filePath);

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/KnowledgeDocument/${selectedHandover.id}/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            const newDoc = response.data;
            const docsResponse = await fetch(
                `http://${strings.localhost}/api/KnowledgeDocument/by-handover/${selectedHandover.id}`
            );
            if (docsResponse.ok) {
                const documents = await docsResponse.json();
                setUploadedDocuments(documents);
            }

            setNewDocument({ name: '', filePath: null });
            setHasPendingDocument(false);
            toast.success('Document uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Document upload failed: ${error.message}`);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewDocument({ ...newDocument, filePath: file });
            setHasPendingDocument(true);
        }
    };

    if (loading) {
        return <div className="coreContainer">Loading handovers...</div>;
    }

    if (error) {
        return <div className="coreContainer">Error: {error}</div>;
    }
    const renderDropdown = (handover) => (
        <div className="dropdown">
            <button
                type="button"
                className="dots-button"
                aria-label="Toggle menu"
                onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(handover.id);
                }}
            >
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className={`dropdown-content ${openMenuId === handover.id ? 'show' : ''}`}>
                <button
                    className="dropdown-item"
                    onClick={() => handleView(handover)}
                >
                    <FaEye /> View Details
                </button>
            </div>
        </div>
    );

    return (
        <div className="coreContainer">
            <div>
                <div className="status-indicators">
                    <div className="status-item">
                        <div className="status-dot complet"></div>
                        <span>Completed: {statusCounts.completed || 0}</span>
                    </div>
                    <div className="status-item">
                        <div className="status-dot pending"></div>
                        <span>Pending: {statusCounts.pending || 0}</span>
                    </div>
                    <div className="status-item">
                        <div className="status-dot expired"></div>
                        <span>Expired: {statusCounts.expired || 0}</span>
                    </div>
                </div>
            </div>

            {handovers.length === 0 ? (
                <p className='no-data1'>No handovers assigned to you.</p>
            ) : (
                <div className="training-grid">
                    {handovers.map(handover => (
                        <div key={handover.id} className={`induction-card ${handover.status.toLowerCase()}`}>
                            <div className="card-header">
                                <div className='top-header'>
                                    {renderDropdown(handover)}
                                </div>
                                <h3 className="card-title">{handover.title}</h3>

                            </div>
                            <p className="card-description">{handover.description}</p>
                            <div className="card-footer">
                                {handover.assignDate && (
                                    <p className="assigned-date">
                                        Assigned: {new Date(handover.assignDate).toLocaleDateString()}
                                    </p>
                                )}
                                {/* <span className={`status-css ${handover.status.toLowerCase()}`}>
                                    {handover.status}
                                </span> */}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDetailsPopup && selectedHandover && (
                <div className="modal-overlay">
                    <div className={`induction-modal ${expandedView ? 'expanded' : ''}`}>
                        <button className="close-btn" onClick={() => {
                            setShowDetailsPopup(false);
                            setSelectedHandover(null);
                            setExpandedView(false);
                        }}>×</button>

                        <h2>{selectedHandover.title}</h2>
                        <p><strong>Description:</strong> {selectedHandover.description}</p>
                        {selectedHandover.assignDate && (
                            <p><strong>Assigned Date:</strong> {new Date(selectedHandover.assignDate).toLocaleDateString()}</p>
                        )}

                        {expandedView && (
                            <div className="acknowledge-form">
                                <div className="form-section">
                                    <h3>Notes</h3>
                                    {noteSections.map((section, index) => (
                                        <div key={`note-${section.id}`} className="form-group note-group">
                                            <label htmlFor={`notes-${section.id}`}>Notes:</label>
                                            <textarea
                                                id={`notes-${section.id}`}
                                                value={section.text}
                                                onChange={(e) => handleNoteChange(e, index)}
                                                placeholder="Add any notes about this handover..."
                                            />
                                            <div className="section-buttons">
                                                <button
                                                    type="button"
                                                    className="outline-btn"
                                                    onClick={() => saveNote(index)}
                                                    disabled={!section.text.trim()}
                                                >
                                                    Save Note
                                                </button>
                                                {noteSections.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="remove"
                                                        onClick={() => removeNoteSection(index)}
                                                    >
                                                        <FaTimes /> Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-btn"
                                        onClick={addNoteSection}
                                    >
                                        <FaPlus /> Add More Notes
                                    </button>
                                </div>

                                <div className="form-section">
                                    <h3>Documents</h3>
                                    {documentSections.map((section, index) => (
                                        <div className="add-document-container">
                                            <div className="file-upload-wrapper">
                                                <label className="file-upload-btn">
                                                    <FaFileUpload className="upload-icon" />
                                                    <span>{newDocument.filePath ? newDocument.filePath.name : 'Choose File'}</span>
                                                    <input
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            </div>
                                            <div className='btnContainer'>
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    onClick={handleAddDocument}
                                                    disabled={!newDocument.filePath}
                                                >
                                                    <FaPlus /> Upload Document
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-btn"
                                        onClick={addDocumentSection}
                                    >
                                        <FaPlus /> Add More Documents
                                    </button>
                                </div>

                                {uploadedDocuments.length > 0 && (
                                    <div className="document-list">
                                        <h4>Uploaded Documents:</h4>
                                        <ul>
                                            {uploadedDocuments.map((doc, index) => (
                                                <li key={index}>
                                                    <a
                                                        href={doc.url || doc.filePath}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {doc.name || doc.fileName || `Document ${index + 1}`}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}


                            </div>
                        )}

                        {successMessage && (
                            <div className="success-message">
                                {successMessage}
                            </div>
                        )}

                        {uploadError && (
                            <div className="error-message">
                                Error: {uploadError}
                            </div>
                        )}

                        <div className='btnContainer'>
                            <button
                                className={`btn ${selectedHandover.status === "Completed" ? "handovercompleted" : ""}`}
                                disabled={selectedHandover.status === "Completed" ||
                                    documentSections.some(s => s.uploading) ||
                                    noteSections.some(s => s.saving)}
                                onClick={handleAcknowledge}
                            >
                                {selectedHandover.status === "Completed" ? "Already Acknowledged" :
                                    expandedView ? "Complete Acknowledgment" : "Acknowledge This Handover"}
                            </button>
                            <button
                                className="outline-btn"
                                onClick={() => {
                                    setShowDetailsPopup(false);
                                    setExpandedView(false);
                                }}
                                disabled={documentSections.some(s => s.uploading) ||
                                    noteSections.some(s => s.saving)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployeeHandover;