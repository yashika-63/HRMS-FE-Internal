import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { strings } from '../../string';
import { fetchDataByKey, showToast } from '../../Api.jsx';
import { FaFileAlt, FaFileExcel, FaFileImage, FaFilePdf, FaFileUpload, FaFileWord, FaMinus, FaPlus } from 'react-icons/fa';
import './AllInductions.css';

const UpdateInduction = ({ induction, onClose, employee }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownData, setDropdownData] = useState({ region: [] });
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [newQuestion, setNewQuestion] = useState('');
    const [viewMode, setViewMode] = useState(false);
    const [currentInductionId, setCurrentInductionId] = useState(null);
    const [newDocument, setNewDocument] = useState({ name: '', file: null });
    const [hasPendingDocument, setHasPendingDocument] = useState(false);
    const [hasPendingQuestion, setHasPendingQuestion] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewType, setPreviewType] = useState('');
    const [previewFilename, setPreviewFilename] = useState('');
    const [formData, setFormData] = useState({
        heading: '',
        type: 'Safety',
        description: '',
        region: '',
        question: [],
        documents: [],
        regionId: '',
        date: new Date().toISOString()
    });
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

    useEffect(() => {
        if (induction && induction.id) {
            setCurrentInductionId(induction.id);
        }
    }, [induction]);
    useEffect(() => {
        if (induction) {
            loadInductionData(induction);
        }
    }, [induction]);
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

        // Check file size (10MB limit)
        if (newDocument.file.size > 10 * 1024 * 1024) {
            toast.warning('File size should be less than 10MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', newDocument.file);
        formData.append('inductionId', currentInductionId);

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/documents/${currentInductionId}/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            const newDoc = response.data;
            setFormData(prev => ({
                ...prev,
                documents: [...prev.documents, {
                    id: newDoc.id,
                    name: newDocument.file.name,
                    url: newDoc.filePath || newDoc.url
                }]
            }));

            setNewDocument({ name: '', file: null });
            setHasPendingDocument(false);
            toast.success('Document uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Document upload failed: ${error.message}`);
        }
    };
    const handleSaveNext = async (e) => {
        e.preventDefault();

        try {
            if (currentStep === 1) {
                await axios.put(`http://${strings.localhost}/api/inductions/update/${currentInductionId}`, {
                    heading: formData.heading,
                    region: formData.region,
                    regionId: formData.regionId,
                    type: formData.type === 'Safety',
                    description: formData.description,
                });
                toast.success('Induction details updated');
            } else if (currentStep === 2) {
                if (!currentInductionId) throw new Error("Induction ID not set");

                const existingQuestionsRes = await axios.get(
                    `http://${strings.localhost}/api/inductionsACK/inductionID/${currentInductionId}`
                );
                const existingQuestions = existingQuestionsRes.data || [];
    
                // Filter out questions that already exist
                const newQuestions = formData.question.filter(q => {
                    const questionText = typeof q === 'string' ? q : q.question;
                    return !existingQuestions.some(eq => 
                        (typeof eq === 'string' ? eq : eq.question) === questionText
                    );
                });
    
                if (newQuestions.length > 0) {
                    const questionPromises = newQuestions.map(q =>
                        axios.post(
                            `http://${strings.localhost}/api/inductionsACK/add-to-induction/${currentInductionId}`,
                            {
                                question: typeof q === 'string' ? q : q.question,
                                inductionId: currentInductionId,
                                rating: null
                            }
                        )
                    );
    
                    await Promise.all(questionPromises);
                    toast.success(`${newQuestions.length} new questions added`);
                } else {
                    toast.info('No new questions to add');
                }
            }
    
            if (currentStep < steps.length) {
                setCurrentStep(currentStep + 1);
            } else {
                toast.success('Induction updated successfully');
                handleClosePopup();
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error(`Update failed: ${error.response?.data?.message || error.message || 'An unknown error occurred'}`);
        }
    };

    useEffect(() => {
        const fetchInductionData = async () => {
            if (!currentInductionId) return;

            try {
                const questionsRes = await axios.get(`http://${strings.localhost}/api/inductionsACK/inductionID/${currentInductionId}`);
                const questions = Array.isArray(questionsRes.data)
                    ? questionsRes.data
                    : [];

                console.log("Full questionsRes.data", questionsRes.data);
                let documentsRes = null;
                try {
                    documentsRes = await axios.get(`http://${strings.localhost}/documents/view/Inductions/${currentInductionId}`);
                } catch (docError) {
                    if (docError.response && docError.response.status === 404) {
                        toast.error('No documents found for the given employee ID: ' + currentInductionId);
                        documentsRes = { data: [] };
                    } else {
                        toast.error('Failed to load documents: ' + docError.message);
                        documentsRes = { data: [] };
                    }
                }
                console.log("documentResponse", documentsRes.data);
                const inductionRes = await axios.get(`http://${strings.localhost}/api/inductions/get/${currentInductionId}`);
                const inductionData = inductionRes.data;
                setFormData({
                    heading: inductionData.heading || '',
                    region: inductionData.region || '',
                    regionId: inductionData.regionId || '',
                    type: (inductionData.type === true || inductionData.type === 'Mandatory') ? 'Safety' : 'Orientation',

                    description: inductionData.description || '',
                    question: questions || [],
                    documents: documentsRes.data || [],
                });
                console.log("Loaded questions:", questions);
            } catch (error) {
                console.error('Error loading induction data:', error);
                toast.error('Failed to load induction data');
            }
        };
        fetchInductionData();
    }, [currentInductionId]);


    const loadInductionData = async (induction) => {

        try {
            const inductionResponse = await axios.get(
                `http://${strings.localhost}/api/inductions/get/${induction.id}`
            );
            const inductionData = inductionResponse.data;
            setFormData({
                heading: induction.heading || '',
                type: inductionData.type === true ? 'Safety' : 'Orientation',
                description: induction.description || '',
                region: induction.region || '',
                regionId: induction.regionId || '',
                date: inductionData.date || new Date().toISOString(),
            });
            setIsPopupOpen(true);

        } catch (error) {
            console.error('Error loading induction data:', error);
            toast.error('Failed to load induction for editing');
        }
    };

    const handleQuestionChange = (e) => {
        setNewQuestion(e.target.value);
        setHasPendingQuestion(e.target.value.trim() !== '');
    };

    const handleAddQuestion = async () => {
        if (newQuestion.trim()) {
            try {
                const response = await axios.post(
                    `http://${strings.localhost}/api/inductionsACK/add-to-induction/${currentInductionId}`,
                    {
                        question: newQuestion.trim(),
                        inductionId: currentInductionId,
                        rating: null
                    }
                );
    
                const newQuestionObj = response.data;
                setFormData(prev => ({
                    ...prev,
                    question: [...(prev.question || []), newQuestionObj]
                }));
                setNewQuestion('');
                setHasPendingQuestion(false);
                toast.success('Question added successfully');
            } catch (error) {
                console.error('Error adding question:', error);
                toast.error('Failed to add question');
            }
        }
    };

    const handleRemoveQuestion = async (index) => {
        const questionToRemove = formData.question[index];
        if (!questionToRemove || !questionToRemove.id) {
            // If no ID, just remove from local state
            setFormData(prev => ({
                ...prev,
                question: prev.question.filter((_, i) => i !== index)
            }));
            return;
        }
    
        try {
            await axios.delete(
                `http://${strings.localhost}/api/inductionsACK/delete/${questionToRemove.id}`
            );
            setFormData(prev => ({
                ...prev,
                question: prev.question.filter((_, i) => i !== index)
            }));
            toast.success('Question removed successfully');
        } catch (error) {
            console.error('Error removing question:', error);
            toast.error('Failed to remove question');
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
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

    const handleClosePopup = () => {
        onClose();
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

    const handleRemoveDocument = async (documentId) => {
        console.log('Attempting to delete document with ID:', documentId);
    
        if (!window.confirm('Are you sure you want to delete this document?')) return;
    
        try {
            await axios.delete(`http://${strings.localhost}/documents/delete/${documentId}`);
            setFormData(prev => ({
                ...prev,
                documents: prev.documents.filter(doc => doc.id !== documentId && doc.documentId !== documentId)
            }));
            toast.success('Document deleted successfully');
        } catch (error) {
            console.error('Failed to delete:', error);
            toast.error('Failed to delete document. Please try again.');
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

    return (
        <div className="popup-overlayin">
            <div className="induction-popup">
                <div className='popup-header' >
                    <h3>Edit Induction</h3>
                    <button type='button' onClick={handleClosePopup}>X</button>
                </div>
                <div>
                    <>
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
                                                <input type="text" id="heading" name="heading" value={formData.heading} onChange={handleInputChange} required disabled={viewMode} />
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
                                                        disabled={viewMode || isLoading}
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
                                                        disabled={viewMode}
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
                                                    disabled={viewMode}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="popup-group questions-section">
                                            <label>Induction Questions</label>
                                            <div className="questions-list">
                                                {Array.isArray(formData.question) && formData.question.length > 0 ? (
                                                    formData.question.map((question, index) => (
                                                        question && typeof question === 'object' && 'question' in question ? (
                                                            <div key={question.id || index} className="question-item">
                                                                <span><strong>{index + 1}.</strong> {question.question}</span>
                                                                <button
                                                                    type="button"
                                                                    className="remove-question-btn"
                                                                    onClick={() => handleRemoveQuestion(index)}
                                                                >
                                                                    <FaMinus />
                                                                </button>
                                                            </div>
                                                        ) : null
                                                    ))
                                                ) : (
                                                    <div>No questions added yet</div>
                                                )}


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
                                                {Array.isArray(formData.documents) && formData.documents.length > 0 ? (
                                                    formData.documents.map((doc) => {
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
                                                                    {!viewMode && (
                                                                        <button
                                                                            type="button"
                                                                            className="remove-document-btn"
                                                                            onClick={() => handleRemoveDocument(doc.documentId)}
                                                                        >
                                                                            <FaMinus />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div>No documents added yet</div>
                                                )}
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
                                                <div className='btnContainer'>
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
                                        onClick={() => setCurrentStep(currentStep - 1)} > Previous  </button>
                                )}
                                <div className="">
                                    <button type="button" className="outline-btn" onClick={handleClosePopup} > Close </button>
                                    <button type="submit" className="btn" onClick={handleSaveNext} >
                                        {currentStep === steps.length ? 'Save' : 'Update & Next'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </>
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
        </div>
    );
};

export default UpdateInduction;
