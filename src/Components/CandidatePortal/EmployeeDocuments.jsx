import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { strings } from '../../string';
import { showToast } from '../../Api.jsx';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const EmployeeDocuments = ({ ticketDetails, onFinishStep }) => {
    const [existingDocuments, setExistingDocuments] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [uploadedLabels, setUploadedLabels] = useState([]);
    const [uniqueLabels, setUniqueLabels] = useState([]);
    const [otherLabel, setOtherLabel] = useState('');
    const companyId = localStorage.getItem('companyId');
    const preRegistrationId = localStorage.getItem('Id');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewType, setPreviewType] = useState('');
    const [previewFilename, setPreviewFilename] = useState('');

    useEffect(() => {
        const fetchCompanyDocuments = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/company-documents/active/${companyId}`);
                const docs = response.data;
                const labels = [...new Set(docs.map(doc => doc.label))];
                setExistingDocuments(docs);
                setUniqueLabels(labels);
            } catch (error) {
                console.error("Error fetching company documents:", error);
            }
        };

        fetchCompanyDocuments();
    }, [companyId]);

    const handleFileChange = (label, file) => {
        setUploadedFiles(prev => ({ ...prev, [label]: file }));
    };

    const handleSaveSingleDocument = async (label) => {
        const file = uploadedFiles[label];
        if (!file) {
            showToast(`Please upload a file for the document: ${label}`, 'info');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('label', label);

            const { id: verificationTicketId } = ticketDetails;

            await axios.post(
                `http://${strings.localhost}/api/employeeVerificationDocument/${verificationTicketId}/${preRegistrationId}/uploadEmployeeVerificationDocument`,
                formData
            );

            showToast(`File for "${label}" uploaded successfully.`, 'success');

            // Avoid duplicates in uploadedLabels
            setUploadedLabels(prev =>
                prev.includes(label) ? prev : [...prev, label]
            );
        } catch (error) {
            console.error(`Error uploading file for ${label}:`, error);
            showToast(`Failed to upload file for "${label}". Please try again.`, 'error');
        }
    };

    // Add custom document to the list of unique labels
    const handleAddOtherDocument = () => {
        if (!otherLabel || uploadedLabels.includes(otherLabel)) {
            showToast('Please provide a unique name for the custom document.', 'info');
            return;
        }

        setUniqueLabels(prev => [...prev, otherLabel]);
        setOtherLabel('');
    };

    const handleViewUploadedDocument = async (label) => {
        const file = uploadedFiles[label];

        if (!file) {
            showToast("File not available for preview", "error");
            return;
        }

        const fileUrl = URL.createObjectURL(file);
        const extension = file.name.split('.').pop().toLowerCase();

        const fileType = extension === 'pdf'
            ? 'pdf'
            : ['jpg', 'jpeg', 'png'].includes(extension)
                ? 'image'
                : 'unsupported';

        setPreviewFilename(file.name);
        setPreviewType(fileType);
        setPreviewUrl(fileUrl);
        setShowPreviewModal(true);
    };


    // Confirm button should only be enabled when all required documents have a ✅
    const allSaved = uniqueLabels.length > 0 && uniqueLabels.every(label => uploadedLabels.includes(label));

    return (
        <div>
            {uniqueLabels.length > 0 && (
                <div>
                    <div className='underlineText'>Upload Required Documents</div>
                    <ul>
                        {uniqueLabels.map((label, idx) => {
                            const isUploaded = uploadedLabels.includes(label);

                            return (
                                <li key={idx} className="document-row">
                                    <span className="document-label">
                                        {`${idx + 1}. ${label}`}{" "}
                                        {isUploaded && (
                                            <>
                                                <span className="verified-text">✅ Uploaded</span>
                                                <button
                                                    className="outline-btn"
                                                    style={{ marginLeft: '10px' }}
                                                    onClick={() => handleViewUploadedDocument(label)}
                                                >
                                                    View Preview
                                                </button>
                                            </>
                                        )}

                                    </span>

                                    {!isUploaded && (
                                        <>
                                            <input
                                                type="file"
                                                className="document-input"
                                                onChange={(e) => handleFileChange(label, e.target.files[0])}
                                            />
                                            <button
                                                type="button"
                                                className="upload-btn"
                                                onClick={() => handleSaveSingleDocument(label)}
                                            >
                                                <FontAwesomeIcon icon={faUpload} />
                                                Upload
                                            </button>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                </div>
            )}

            <div>
                <input
                    type="text"
                    value={otherLabel}
                    onChange={(e) => setOtherLabel(e.target.value)}
                    placeholder="Enter document name"
                    className="document-input"
                />
                <button
                    type="button"
                    className="btn"
                    onClick={handleAddOtherDocument}

                >
                    Other Document
                </button>
            </div>

            <button
                className="btn"
                type="button"
                disabled={!allSaved}
                style={{
                    backgroundColor: allSaved ? '#74b9ff' : '#b2bec3', // light blue when enabled
                    cursor: allSaved ? 'pointer' : 'not-allowed',
                    marginTop: '20px'
                }}
                onClick={onFinishStep}
            >
                Confirm
            </button>

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

export default EmployeeDocuments;
