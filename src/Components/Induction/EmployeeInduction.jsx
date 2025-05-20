
import { useState, useEffect } from 'react';
import '../CommonCss/AddEmp.css';
import '../CommonCss/Main.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FaEye, FaCheck } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import '../CommonCss/EmployeeInduction 1.css';
import { strings } from '../../string';
import { showToast } from '../../Api.jsx';
import axios from 'axios';
import '../Training/TrainingSetup.css';
function EmployeeInduction() {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [inductions, setInductions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mediaContent, setMediaContent] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewType, setPreviewType] = useState('');
    const [previewFilename, setPreviewFilename] = useState('');
    const { id: employeeId } = useParams();
    const [documents, setDocuments] = useState([]);
        const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedInduction, setSelectedInduction] = useState(null);
    const [showInductionModal, setShowInductionModal] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);
    const [activeTab, setActiveTab] = useState('content');
    const [showPopup, setShowPopup] = useState(false);

    const statusCounts = inductions.reduce((acc, induction) => {
        const status = induction.status.toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, { completed: 0, pending: 0, expired: 0 });

    useEffect(() => {
        const fetchAssignedInductions = async () => {
            try {
                const response = await fetch(
                    `http://${strings.localhost}/api/assign-inductions/assignments/employee/${employeeId}`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch assigned inductions');
                }
                const data = await response.json();
                console.log("API Response:", data);

                const transformedData = data.map(item => ({
                    id: item.id,
                    inductionId: item.inductionId || (item.induction ? item.induction.id : null),
                    title: item.induction?.heading || 'No Title',
                    description: item.induction?.description || 'No Description',
                    status: item.completionStatus ? "Completed" :
                        item.expiryStatus ? "Expired" : "Pending",
                    assignDate: item.assignDate || null
                }));

                console.log("Transformed Data:", transformedData);
                setInductions(transformedData);
            } catch (err) {
                showToast(err.message || 'Failed to fetch assigned inductions', 'error');
                setError(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedInductions();
    }, [employeeId]);

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleOpenInduction = async (induction, action = 'view') => {
        if (!induction.inductionId) {
            setError("No induction ID available for this item");
            return;
        }

        setSelectedInduction(induction);
        setOpenMenuId(null);
        setLoading(true);

        try {
            const contentResponse = await fetch(
                `http://${strings.localhost}/documents/view/Inductions/${induction.inductionId}`
            );
            if (!contentResponse.ok) {
                setMediaContent([]);
            } else {
                const mediaData = await contentResponse.json();
                setMediaContent(mediaData);
            }

            const questionsResponse = await fetch(
                `http://${strings.localhost}/api/inductionsACK/inductionID/${induction.inductionId}`
            );
            let questionsData = [];
            if (questionsResponse.ok) {
                questionsData = await questionsResponse.json();
            }
            setQuestions(questionsData);
            const initialAnswers = {};
            questionsData.forEach(question => {
                initialAnswers[question.id] = question.termAndCondition ? false : '';
            });
            setAnswers(initialAnswers);
            setAcknowledged(false);
            setTermsAccepted(false);
            setShowInductionModal(true);
        } catch (err) {
            showToast(err.message || 'Something went wrong', 'error');
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (induction) => {
        handleOpenInduction(induction, 'view');
    };

    const handleViewDocument = async (documentId, documentName) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/documents/view/${documentId}`, {
                responseType: 'blob',
            });

            const contentType = response.headers['content-type'];
            const fileUrl = URL.createObjectURL(response.data);
            const extension = contentType.split('/').pop();
            const filename = `${documentName}`;
            setPreviewFilename(filename);

            if (contentType.includes('pdf')) {
                setPreviewType('pdf');
            } else if (contentType.includes('image')) {
                setPreviewType('image');
            } else {
                setPreviewType('unsupported');
            }

            setPreviewDocument(fileUrl);
            setShowPreviewModal(true);
        } catch (error) {
            console.error('Error fetching document preview:', error);
            showToast('Failed to load document preview.', 'error');
        }
    };

    const handleSubmit = async () => {
        if (!acknowledged) return;
        setIsSubmitting(true);
        try {
            const inductionAcks = questions.map(question => {
                const answer = answers[question.id] || "Not Answered";
                return {
                    note: answer,
                    termsAndCondition: question.termAndCondition ? answers[question.id] === true : false,
                    inductionAck: {
                        id: question.id
                    }
                };
            });
            const apiUrl = `http://${strings.localhost}/api/results/save?employeeId=${employeeId}&inductionId=${selectedInduction.inductionId}&assignInductionId=${selectedInduction.id}`;
            const response = await fetch(
                apiUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(inductionAcks)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to save induction result');
            }
            const updatedInductions = inductions.map(item =>
                item.id === selectedInduction.id ? { ...item, status: "Completed" } : item
            );
            setInductions(updatedInductions);
            setShowPopup(false);
            setSelectedInduction(null);
        } catch (err) {
            console.error('Error saving induction result:', err);
            setError('Failed to save acknowledgment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleTermsChange = (questionId, isChecked) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: isChecked
        }));
        setTermsAccepted(isChecked);
    };

    const handleDownload = async (documentId, documentName) => {
        try {
            const response = await fetch(`http://${strings.localhost}/documents/view/${documentId}`);
            if (!response.ok) {
                throw new Error('Failed to download document');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = documentName || 'document';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error downloading document:', err);
            setError('Failed to download document. Please try again.');
        }
    };

    if (loading) {
        return <div className="coreContainer">Loading inductions...</div>;
    }


    const renderDropdown = (induction) => (
        <div className="dropdown">
            <button
                type="button"
                className="dots-button"
                aria-label="Toggle menu"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(induction.id);
                }}
            >
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>

            {openMenuId === induction.id && (
                <div className="dropdown-content show">
                    {induction.status !== "Expired" && (
                        <button
                            className="dropdown-item"
                            onClick={() => handleView(induction)}
                        >
                            <FaEye /> Acknowledge
                        </button>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="coreContainer">
            <h1 className="form-title">Induction Overview</h1>
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

            {inductions.length === 0 ? (
                <p className='no-data'>No inductions assigned to you.</p>
            ) : (
                <div className="training-grid">
                    {inductions.map(induction => (
                        <div key={induction.id} className={`induction-card ${induction.status.toLowerCase()}`}>
                            <h3 className="card-header">{induction.title}</h3>
                            <div className='top-header'>
                                {renderDropdown(induction)}
                            </div>
                            <p className="card-description">{induction.description}</p>
                            <div className="card-footer">
                                {induction.assignedDate && (
                                    <p className="assigned-date">
                                        Assigned: {new Date(induction.assignedDate).toLocaleDateString()}
                                    </p>
                                )}

                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showInductionModal && selectedInduction && (
                <div className="modal-overlayi">
                    <div className="induction-modal">
                        <button className="close-btn" onClick={() => {
                            setSelectedInduction(null);
                            setMediaContent([]);
                            setShowInductionModal(false);
                        }}>×</button>

                        <h2 className='centerText'>{selectedInduction.title}</h2>

                        <div className="modal-contenti">
                            <p>{selectedInduction.description}</p>
                            <hr />
                            {loading ? (
                                <p>Loading media...</p>
                            ) : mediaContent.length > 0 ? (
                                <div className="media-container">
                                    {mediaContent.map((item, index) => {
                                        if (item.type === "image") {
                                            return (
                                                <img
                                                    key={index}
                                                    src={item.url}
                                                    alt={`Induction content ${index}`}
                                                    className="media-item"
                                                />
                                            );
                                        } else if (item.type === "video") {
                                            return (
                                                <video key={index} controls className="media-item">
                                                    <source src={item.url} type={`video/${item.url.split('.').pop()}`} />
                                                    Your browser does not support the video tag.
                                                </video>
                                            );
                                        } else {
                                            return (
                                                <div key={index} className="input-row">
                                                    <div>
                                                        <p><strong>{index + 1}. {item.fileName}</strong></p>
                                                    </div>
                                                    <div>
                                                        <button type='button' className='preview-btn' onClick={() => handleViewDocument(item.documentId, item.fileName)}>Preview</button>
                                                    </div>
                                                    <div>
                                                        <button
                                                            onClick={() => handleDownload(item.documentId, item.fileName)}
                                                            className="outline-btn"
                                                        >
                                                            Download Document
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            ) : (
                                <p className='no-data'>No documents available for this induction.</p>
                            )}

                            <hr />

                            {questions.length > 0 ? (
                                <div className="questions-section">
                                    <h4>Please answer the following questions:</h4>
                                    {questions.map((question, index) => (
                                        <div key={question.id} className="question-item">
                                            <span className="required-marker">*</span>
                                            <label>{index + 1}. {question.question}</label>
                                            {question.termAndCondition ? (
                                                <div className="terms-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        id={`terms-${question.id}`}
                                                        checked={answers[question.id] || false}
                                                        onChange={(e) => handleTermsChange(question.id, e.target.checked)}
                                                    />
                                                    <label htmlFor={`terms-${question.id}`}>
                                                        I accept the terms and conditions
                                                    </label>
                                                </div>
                                            ) : (
                                                <textarea
                                                    value={answers[question.id] || ''}
                                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                    placeholder="Your answer..."
                                                    rows={3}
                                                    required={!question.termAndCondition}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No questions found for this induction.</p>
                            )}

                            <div className="acknowledge-check">
                                <input
                                    type="checkbox"
                                    id="acknowledgeCheckbox"
                                    checked={acknowledged}
                                    onChange={(e) => setAcknowledged(e.target.checked)}
                                />
                                <label htmlFor="acknowledgeCheckbox">
                                    I confirm that I have read and understood this induction material
                                </label>
                            </div>

                            <div className="btnContainer">
                                <button
                                    className="btn"
                                    onClick={handleSubmit}
                                    disabled={!acknowledged ||
                                        (questions.length > 0 && questions.some(q =>
                                            !q.termAndCondition &&
                                            (!answers[q.id] || answers[q.id].trim() === '')
                                        ))}
                                >
                                    {isSubmitting ? (
                                        <div className="loading-spinner"></div>
                                    ) : (
                                        `Submit Acknowledgment`
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {showPreviewModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setShowPreviewModal(false)}>X</button>
                        <h3>Preview: {previewFilename}</h3>

                        {previewType === 'pdf' && (
                            <iframe src={previewDocument} title="PDF Preview" width="100%" height="500px"></iframe>
                        )}

                        {previewType === 'image' && (
                            <img src={previewDocument} alt="Preview" />
                        )}

                        {previewType === 'unsupported' && (
                            <div>
                                <p>Preview not available for this file type.</p>
                            </div>
                        )}

                        <div className="modal-footer">
                            <a href={previewDocument} download={previewFilename} className="btn">
                                Download File
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


export default EmployeeInduction;
