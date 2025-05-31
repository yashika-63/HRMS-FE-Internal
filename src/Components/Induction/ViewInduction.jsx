import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { strings } from '../../string';
import { FaBuilding, FaCalendarAlt, FaFileAlt, FaGlobe, FaIdCard, FaList, FaMinus, FaTasks, FaUser } from 'react-icons/fa';
import { fetchDataByKey, showToast } from '../../Api.jsx';

const ViewInduction = ({ induction, onClose }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [dropdownData, setDropdownData] = useState({ region: [] });
    const [acknowledgements, setAcknowledgements] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewType, setPreviewType] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewFilename, setPreviewFilename] = useState('');
    const [formData, setFormData] = useState({
        heading: '',
        type: '',
        description: '',
        region: '',
        question: [],
        documents: [],
        regionId: '',
        date: new Date().toISOString()
    });


    // Fetch induction details when component loads
    useEffect(() => {
        if (induction) {
            loadInductionData(induction);
        }
    }, [induction]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const regions = await fetchDataByKey('region');
                setDropdownData({
                    region: regions
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);

    const loadInductionData = async (induction) => {
        setIsEditMode(true);

        try {
            // Fetch induction data
            let inductionData = null;
            try {
                const inductionRes = await axios.get(`http://${strings.localhost}/api/inductions/get/${induction.id}`);
                inductionData = inductionRes.data;
                setFormData(prev => ({
                    ...prev,
                    heading: inductionData.heading || '',
                    type: inductionData.type,
                    description: inductionData.description || '',
                    region: inductionData.region || '',
                    regionId: inductionData.regionId || '',
                    date: inductionData.date || new Date().toISOString(),
                }));
            } catch (err) {
                console.error("Error fetching induction data:", err);
            }

            // Fetch acknowledgements (questions)
            try {
                const ackRes = await axios.get(`http://${strings.localhost}/api/inductionsACK/inductionID/${induction.id}`);
                const questions = ackRes.data || [];
                setFormData(prev => ({ ...prev, question: questions }));
                setAcknowledgements(questions);
            } catch (err) {
                console.error("Error fetching acknowledgements:", err);
            }

            // Fetch documents
            try {
                const docRes = await axios.get(`http://${strings.localhost}/documents/view/Inductions/${induction.id}`);
                const docs = docRes.data || [];
                setFormData(prev => ({ ...prev, documents: docs }));
                setDocuments(docs);
            } catch (err) {
                console.error("Error fetching documents:", err);
            }

        } catch (error) {
            console.error('Unexpected error loading induction data:', error);
        }
    };


    const handleViewDocument = async (id, doc) => {
        const fileName = doc.fileName || "document";

        if (!id || id === '') {
            showToast("No document ID available for preview", "error");
            return;
        }

        try {
            const response = await axios.get(`http://${strings.localhost}/documents/view/${id}`, {
                responseType: 'blob', // important for binary data
            });

            // Determine the file type by extension
            const extension = fileName.split('.').pop().toLowerCase();

            let mimeType = '';
            if (extension === 'pdf') mimeType = 'application/pdf';
            else if (['jpg', 'jpeg'].includes(extension)) mimeType = 'image/jpeg';
            else if (extension === 'png') mimeType = 'image/png';
            else if (extension === 'gif') mimeType = 'image/gif';
            else mimeType = 'application/octet-stream'; // fallback

            const fileBlob = new Blob([response.data], { type: mimeType });
            const fileUrl = URL.createObjectURL(fileBlob);

            const fileType = ['jpg', 'jpeg', 'png', 'gif'].includes(extension)
                ? 'image'
                : extension === 'pdf'
                    ? 'pdf'
                    : 'unsupported';

            setPreviewType(fileType);
            setPreviewUrl(fileUrl);
            setPreviewFilename(fileName);
            setShowPreviewModal(true);
        } catch (error) {
            console.error("Error fetching document:", error);
            showToast("Failed to load document preview", "error");
        }
    };

    // Handle close popup
    const handleClosePopup = () => {
        onClose(); // Close the popup when user clicks "Close"
    };
    const getFileIcon = (ext) => {
        switch (ext) {
            case 'pdf': return <FaFileAlt />;
            case 'doc':
            case 'docx': return <FaFileAlt />;
            default: return <FaFileAlt />;
        }
    };
    return (
        <div className="modal-overlay">
            <div className="modal-content1">
                <div className='form-controls'>
                    <button type='button' className='close-btn' onClick={handleClosePopup}> X</button>
                </div>
                <h3 className='centerText'>View Induction</h3>
                <div className="popup-contentin">
                    <div className="view-mode-container">
                        <div className="view-mode-section">
                            <h4><FaUser /> Basic Information</h4>
                            <div className="view-mode-fields">
                                <div className="view-mode-field">
                                    <label><FaUser className="icon" />Heading</label>
                                    <div className="view-mode-value">{induction.heading}</div>
                                </div>
                                <div className="view-mode-field">
                                    <label><FaIdCard className="icon" />Type</label>
                                    <div className="view-mode-value">
                                        {formData.type ? 'Mandatory' : 'Non-Mandatory'}
                                    </div>

                                </div>
                                <div className="view-mode-field">
                                    <label><FaList className="icon" /> Description</label>
                                    <div className="view-mode-value">{induction.description}</div>
                                </div>
                                <div className="view-mode-field">
                                    <label><FaGlobe className="icon" />Region</label>
                                    <div className="view-mode-value">{induction.region || "-"}</div>
                                </div>
                            </div>
                        </div>

                        <div className="view-mode-section">
                            <h4><FaCalendarAlt /> Induction Details</h4>
                            <div className="view-mode-fields">
                                <div className="view-mode-field full-width">
                                    <div className="view-mode-value">

                                        {formData.question && formData.question.length > 0 ? (
                                            <ul className="questions-list-view">
                                                {formData.question.map((q, index) => (
                                                    <li key={q.id || index}>{q.question}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            'No questions added'
                                        )}

                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="view-mode-section">
                            <h4><FaBuilding /> Documents</h4>
                            <div>
                                <div className="">
                                    <div>
                                        {formData.documents && formData.documents.length > 0 ? (
                                            <ul className="documents-list-view">
                                                {formData.documents.map((doc, index) => {
                                                    const filePath = doc.filePath || '';
                                                    const fileName = filePath.split('\\').pop() || 'document';
                                                    const fileExt = fileName.split('.').pop() || '';

                                                    return (
                                                        <div key={doc.id || fileName} className='input-row'>
                                                            <div className="document-info">
                                                                <span className="document-number">{index + 1}.</span>
                                                                {getFileIcon(fileExt)}
                                                                <span>{fileName}</span>
                                                            </div>
                                                            <div className="document-actions">
                                                                <a
                                                                    href="#"
                                                                    className="preview-btn"
                                                                    onClick={() => {
                                                                        handleViewDocument(doc.documentId, doc);
                                                                    }}
                                                                >
                                                                    Preview
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            'No documents added'
                                        )}


                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-controls">
                        <button
                            type="button"
                            className="outline-btn"
                            onClick={handleClosePopup}
                        >
                            Close
                        </button>
                    </div>
                </div>

            </div>
            {showPreviewModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setShowPreviewModal(false)}>X</button>
                        <h3>Preview: {previewFilename}</h3>

                        {previewType === 'pdf' && (
                            <iframe src={previewUrl} title="PDF Preview" width="100%" height="500px" />
                        )}
                        {previewType === 'image' && (
                            <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '500px' }} />
                        )}
                        {previewType === 'unsupported' && (
                            <p>Preview not available for this file type.</p>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <a href={previewUrl} download={previewFilename} className="btn">
                                Download File
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewInduction;
