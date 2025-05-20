import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { strings } from '../../string';
import { FaFileAlt, FaFileExcel, FaFileImage, FaFilePdf, FaFileUpload, FaFileWord, FaMinus, FaPlus, FaTimes } from 'react-icons/fa';
import { fetchDataByKey, showToast } from '../../Api.jsx';

const AddNewInduction = ({ induction, onClose }) => {
    const [formData, setFormData] = useState({ ...induction, question: [], documents: [], });
    const [isLoading, setIsLoading] = useState(false);
    const [inductions, setInductions] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [dropdownData, setDropdownData] = useState({ region: [] });
    const [currentStep, setCurrentStep] = useState(1);
    const [newQuestion, setNewQuestion] = useState('');
    const [newDocument, setNewDocument] = useState({ name: '', file: null });
    const [hasPendingDocument, setHasPendingDocument] = useState(false);
    const [hasPendingQuestion, setHasPendingQuestion] = useState(false);
    const companyId = localStorage.getItem('companyId');
    const employeeId = localStorage.getItem("employeeId");
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewType, setPreviewType] = useState('');
    const [previewFilename, setPreviewFilename] = useState('');
    const [currentInductionId, setCurrentInductionId] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);


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
        toast.info('Loading induction for editing...');

        try {
            const inductionResponse = await axios.get(
                `http://${strings.localhost}/api/inductions/get/${induction.id}`
            );
            const inductionData = inductionResponse.data;
            setFormData({
                heading: induction.heading || '',
                type: induction.type === 'Mandatory' ? 'Safety' : 'Orientation',
                description: induction.description || '',
                region: induction.region || '',
                regionId: induction.regionId || '',
                date: inductionData.date || new Date().toISOString(),
            });

            toast.success('Induction data loaded successfully');
        } catch (error) {
            console.error('Error loading induction data:', error);
            toast.error('Failed to load induction for editing');
        }
    };

    // Handle input change
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewDocument({ ...newDocument, file });
            setHasPendingDocument(true);
        }
    };

    const handleAddDocument = async () => {
        if (!newDocument.file) {
            toast.error('Please select a file to upload');
            return;
        }

        if (newDocument.file.size > 10 * 1024 * 1024) {
            toast.warning('File size should be less than 10MB');
            return;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('file', newDocument.file);
        uploadFormData.append('inductionId', currentInductionId);

        try {
            await axios.post(
                `http://${strings.localhost}/documents/${currentInductionId}/upload`,
                uploadFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            // Refresh document list from server
            await fetchDocumentsForInduction(currentInductionId);

            setNewDocument({ name: '', file: null });
            setHasPendingDocument(false);
            toast.success('Document uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Document upload failed: ${error.message}`);
        }
    };



    // Handle close popup
    const handleClosePopup = () => {
        onClose(); // Close the popup when user clicks "Close"
    };




    const handleSaveBasicInfo = async () => {
        try {
            const payload = {
                heading: formData.heading,
                type: formData.type === 'Safety' ? 1 : 0,
                description: formData.description,
                region: formData.region,
                regionId: formData.regionId,
                status: 1,
                companyId,
                createdByEmployeeId: employeeId,
                createdAt: formData.date || new Date().toISOString(),
            };

            const response = await axios.post(
                `http://${strings.localhost}/api/inductions/save/${companyId}/${employeeId}`,
                payload
            );

            if (!response.data.id) {
                throw new Error("No induction ID returned from server");
            }

            setCurrentInductionId(response.data.id);
            await fetchDocumentsForInduction(response.data.id);
            toast.success('Induction created successfully!');
            setCurrentStep(2);
        } catch (error) {
            console.error('Error saving induction:', error);
            toast.error(`Failed to save induction: ${error.message}`);
        }
    };

    const handleSaveQuestions = async () => {
        try {
            if (!currentInductionId) throw new Error("Induction ID not set");

            const questionPromises = formData.question.map(q =>
                axios.post(
                    `http://${strings.localhost}/api/inductionsACK/add-to-induction/${currentInductionId}`,
                    { question: q, inductionId: currentInductionId, rating: null }
                )
            );

            await Promise.all(questionPromises);
            toast.success('Questions saved successfully!');
            setCurrentStep(3);
        } catch (error) {
            console.error('Error saving questions:', error);
            toast.error('Failed to save questions');
        }
    };



    const handleSaveNext = async () => {
        if (hasPendingDocument) {
            toast.error('Please upload the selected document before proceeding');
            return;
        }

        if (hasPendingQuestion) {
            toast.error('Please add the typed question before proceeding');
            return;
        }

        if (currentStep === 1) {
            const { heading, type, description, region } = formData;

            if (!heading.trim() || !type || !description || !region) {
                toast.warn('Please fill all required fields');
                return;
            }

            await handleSaveBasicInfo();
        } else if (currentStep === 2) {
            await handleSaveQuestions();
        } else {
            toast.success('Induction setup completed!');
            window.location.reload();
            onClose();
        }
    };


    const handleRemoveQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            question: prev.question.filter((_, i) => i !== index)
        }));
    };

    const handleQuestionChange = (e) => {
        setNewQuestion(e.target.value);
        setHasPendingQuestion(e.target.value.trim() !== '');
    };

    const handleAddQuestion = () => {
        if (newQuestion.trim()) {
            setFormData(prev => ({
                ...prev,
                question: [...prev.question, newQuestion.trim()]
            }));
            setNewQuestion('');
            setHasPendingQuestion(false);
        }
    };


    const getFileIcon = (type) => {
        if (!type) return <FaFileAlt className="file-icon" />;

        const typeStr = String(type || '');
        const extension = typeStr.includes('.')
            ? typeStr.split('.').pop().toLowerCase()
            : typeStr.toLowerCase();

        switch (extension) {
            case 'pdf': return <FaFilePdf className="file-icon" />;
            case 'doc':
            case 'docx': return <FaFileWord className="file-icon" />;
            case 'xls':
            case 'xlsx': return <FaFileExcel className="file-icon" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return <FaFileImage className="file-icon" />;
            default: return <FaFileAlt className="file-icon" />;
        }
    };

    const fetchDocumentsForInduction = async () => {
        if (!currentInductionId) return;

        try {
            const response = await axios.get(`http://${strings.localhost}/documents/view/Inductions/${currentInductionId}`);
            const docs = response.data;

            if (!Array.isArray(docs)) {
                toast.error("Unexpected document response format");
                return;
            }

            setFormData(prev => ({
                ...prev,
                documents: docs.map(doc => ({
                    id: doc.id,
                    name: doc.name || doc.fileName,
                    fileName: doc.fileName,
                    url: doc.filePath || doc.url
                }))
            }));
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast.error("Failed to load induction documents");
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
                responseType: 'blob',
            });

            const fileBlob = new Blob([response.data]);
            const fileUrl = URL.createObjectURL(fileBlob);

            const extension = fileName.split('.').pop().toLowerCase();
            const fileType = extension === 'pdf'
                ? 'pdf'
                : ['jpg', 'jpeg', 'png'].includes(extension)
                    ? 'image'
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
    const handleRemoveDocument = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await axios.delete(`http://${strings.localhost}/documents/delete/${documentId}`);
            setFormData(prev => ({
                ...prev,
                documents: prev.documents.filter(doc => doc.id !== documentId)
            }));
            toast.success('Document deleted successfully');
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document. Please try again.');
        }
    };
    const steps = [
        {
            title: "Basic Information",
            fields: [
                { name: "heading", label: "Heading", type: "text", required: true },
                { name: "type", label: "Type", type: "text", required: true },
                { name: "description", label: "Description", type: "text", required: true },
                {
                    name: "region",
                    label: "Region",
                    type: "select",
                    options: ["North", "South", "East", "West"],
                    required: true
                }
            ]
        },
        {
            title: "Induction Details",
            fields: []
        },
        {
            title: "Documents",
            fields: []
        }
    ];
    return (
        <div className="popup-overlayin">

            <div className="induction-popup">
                <div >
                    <div className='popup-header' >
                        <h3>Add New Induction</h3>
                        <button className="close-btn" onClick={handleClosePopup}></button>
                    </div>

                    <div className="step-indicator1">
                        <div
                            className={`steps ${currentStep > 1 ? 'completed' : 'active'}`}
                            onClick={() => setCurrentStep(1)}
                        >
                            {currentStep > 1 ? '✅' : '1'}
                        </div>
                        <div className="steps-line"></div>
                        <div
                            className={`steps ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}
                            onClick={() => setCurrentStep(2)}
                        >
                            {currentStep > 2 ? '✅' : '2'}
                        </div>
                        <div className="steps-line"></div>
                        <div
                            className={`steps ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}
                            onClick={() => setCurrentStep(3)}
                        >
                            {currentStep > 3 ? '✅' : '3'}
                        </div>
                    </div>

                    <div className="popup-contentin">
                        <form>
                            <div>
                                {currentStep === 1 && (
                                    <div>
                                        <div style={{ marginBottom: "10px" }}>
                                            <span className="required-marker">*</span>
                                            <label htmlFor="heading">Heading</label>
                                            <input type="text" id="heading" name="heading" value={formData.heading} onChange={handleInputChange} required />
                                        </div>

                                        <div className="input-row">
                                            <div>
                                                <span className="required-marker">*</span>
                                                <label htmlFor="region">Region</label>
                                                <select
                                                    name="region"
                                                    value={formData.region}
                                                    className='selectIM'
                                                    onChange={(e) => {
                                                        const selectedRegion = dropdownData.region.find(
                                                            r => r.data === e.target.value
                                                        );
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            region: e.target.value,
                                                            regionId: selectedRegion ? selectedRegion.masterId : ''
                                                        }));
                                                    }}
                                                    required
                                                    disabled={isLoading}
                                                >
                                                    <option value="">Select Region</option>
                                                    {dropdownData.region && dropdownData.region.length > 0 ? (
                                                        dropdownData.region.map(option => (
                                                            <option key={option.masterId} value={option.data}>
                                                                {option.data}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled>Induction Region Not available</option>
                                                    )}
                                                </select>
                                            </div>

                                            <div>
                                                <span className="required-marker">*</span>
                                                <label htmlFor="type">Type</label>
                                                <select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={handleInputChange}
                                                    className='selectIM'
                                                    required

                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="Safety">Mandatory</option>
                                                    <option value="Orientation">Non Mandatory</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: "10px" }}>
                                            <span className="required-marker">*</span>
                                            <label htmlFor="description">Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows={3}
                                                required

                                            />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div>
                                        <label>Induction Questions</label>
                                        <div className='question-container'>
                                            {formData.question.map((question, index) => (
                                                <div key={index} className="question-item">
                                                    <span>{question}</span>
                                                    <button
                                                        type="button"
                                                        className="remove-question-btn"
                                                        onClick={() => handleRemoveQuestion(index)}
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="add-question-container">
                                            <input
                                                type="text"
                                                value={newQuestion}
                                                onChange={handleQuestionChange}
                                            />
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={handleAddQuestion}
                                            >
                                                <FaPlus /> Add Question
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="popup-group documents-section">
                                        <label>Documents</label>
                                        <div className="documents-list">
                                            {formData.documents.map((doc) => {
                                                // Safely get the file name and extension
                                                const fileName = doc.name || doc.fileName || '';
                                                const fileExt = fileName.includes('.')
                                                    ? fileName.split('.').pop().toLowerCase()
                                                    : '';

                                                return (
                                                    <div key={doc.id || fileName} className="input-row">
                                                        <div className="document-info">
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

                                                            <button
                                                                type="button"
                                                                className="remove-document-btn"
                                                                onClick={() => handleRemoveDocument(doc.documentId)}
                                                            >
                                                                <FaMinus />
                                                            </button>

                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="add-document-container">
                                            <div className="file-upload-wrapper">
                                                <label className="file-upload-btn">
                                                    <FaFileUpload className="upload-icon" />
                                                    <span>{newDocument.file ? newDocument.file.name : 'Choose File'}</span>
                                                    <input
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    onClick={handleAddDocument}
                                                    disabled={!newDocument.file}
                                                >
                                                    <FaPlus /> Upload Document
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                        <div className="btnContainer">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                >
                                    Previous
                                </button>
                            )}
                            <div className="">
                                <button
                                    type="button"
                                    className="outline-btn"
                                    onClick={handleClosePopup}
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    className="btn"
                                    onClick={handleSaveNext}
                                >
                                    {currentStep === steps.length ? 'Save' : 'Save & Next'}
                                </button>
                            </div>
                        </div>
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

export default AddNewInduction;
