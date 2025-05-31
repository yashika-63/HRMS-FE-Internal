import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FaEye, FaCheck, FaCertificate } from "react-icons/fa";
import '../CommonCss/AddEmp.css';
import '../CommonCss/Main.css';
import TrainingCertificate from "./TrainingCertificate";
import { strings } from "../../string";
import { showToast } from "../../Api.jsx";
import axios from 'axios';

const TrainingOverview = () => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [trainings, setTrainings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mediaContent, setMediaContent] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [detailPopup, setDetailPopup] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;
    const [showCertificate, setShowCertificate] = useState(false);
    const [certificateData, setCertificateData] = useState(null);
    const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
    const employeeId = localStorage.getItem("employeeId");
    const [previewDocument, setPreviewDocument] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewType, setPreviewType] = useState('');
    const [previewFilename, setPreviewFilename] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const employeeName = `${firstName || ""} ${lastName || ''}`;
    useEffect(() => {
        const fetchAssignedTrainings = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `http://${strings.localhost}/api/assign-trainings/employee/${employeeId}?page=${currentPage}&size=${pageSize}`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch assigned trainings');
                }
                const data = await response.json();

                const transformedData = data.content.map(item => ({
                    id: item.id,
                    trainingId: item.trainingHRMS?.id,
                    title: item.trainingHRMS?.heading || 'No Title',
                    description: item.trainingHRMS?.description || 'No Description',
                    department: item.trainingHRMS?.department || 'N/A',
                    type: item.trainingHRMS?.type || 'N/A',
                    assignDate: item.assignDate,
                    status: item.completionStatus ? "Completed" : item.expiryStatus ? "Expired" : "Pending",
                    expiryStatus: item.expiryStatus
                }));
                setTrainings(transformedData);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedTrainings();
    }, [employeeId, currentPage]);

    const statusCounts = trainings.reduce((acc, training) => {
        const status = training.status.toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, { completed: 0, pending: 0, expired: 0 });

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleTrainingAction = async (training) => {
        setSelectedTraining(training);
        setLoading(true);
        setError(null);
        setQuestions([]);
        setMediaContent([]);
        setShowPopup(true);
        setActiveTab('details');

        try {
            // 1. Fetch documents/media
            const response = await fetch(
                `http://${strings.localhost}/api/documentTraining/view/Training/${training.trainingId}`
            );
            if (response.ok) {
                const mediaData = await response.json();
                setMediaContent(Array.isArray(mediaData) ? mediaData : []);
            }

            // 2. If training is completed, fetch question + answer set
            if (training.status === "Completed") {
                const resultResponse = await fetch(
                    `http://${strings.localhost}/api/resultTraining/${training.trainingId}`
                );

                if (resultResponse.ok) {
                    const resultData = await resultResponse.json();
                    if (Array.isArray(resultData)) {
                        const formattedQuestions = resultData.map(item => ({
                            id: item?.trainingAcknowledge?.id ?? item.id,
                            question: item?.trainingAcknowledge?.question ?? 'No question text',
                            termAndCondition: item?.trainingAcknowledge?.termAndCondition ?? false,
                            answer: item?.note || item?.rating || 'N/A',
                        }));

                        setQuestions(formattedQuestions);

                        const answersMap = {};
                        formattedQuestions.forEach(q => {
                            answersMap[q.id] = q.answer;
                        });
                        setAnswers(answersMap);
                    }
                }
            } else {
                // 3. If not completed, fetch questions normally
                const questionsResponse = await fetch(
                    `http://${strings.localhost}/api/acknowledges/training/${training.trainingId}`
                );

                if (questionsResponse.ok) {
                    const questionsData = await questionsResponse.json();
                    let questionsArray = [];

                    if (Array.isArray(questionsData)) {
                        questionsArray = questionsData;
                    } else if (questionsData?.content && Array.isArray(questionsData.content)) {
                        questionsArray = questionsData.content;
                    } else if (typeof questionsData === 'object' && questionsData !== null) {
                        questionsArray = [questionsData];
                    }

                    setQuestions(questionsArray);

                    const initialAnswers = {};
                    questionsArray.forEach(q => {
                        initialAnswers[q.id] = q.termAndCondition ? false : '';
                    });
                    setAnswers(initialAnswers);
                }
            }

        } catch (err) {
            console.error("Error loading training data:", err);
            setError("Failed to load training details. Please try again.");
        } finally {
            setLoading(false);
            setOpenMenuId(null);
        }
    };



    const handleSubmit = async () => {
        if (!acknowledged) return;
        setIsSubmitting(true);
        try {
            const trainingAcks = questions.map(question => {
                const answer = answers[question.id] || "Not Answered";
                return {
                    note: answer,
                    termsAndCondition: question.termAndCondition ? answers[question.id] === true : false,
                    trainingAcknowledge: {
                        id: question.id
                    }
                };
            });

            const apiUrl = `http://${strings.localhost}/api/resultTraining/save?employeeId=${employeeId}&trainingId=${selectedTraining.trainingId}&assignId=${selectedTraining.id}`;

            const response = await fetch(
                apiUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(trainingAcks)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to save training result');
            }

            const updatedTrainings = trainings.map(item =>
                item.id === selectedTraining.id ? { ...item, status: "Completed" } : item
            );
            setTrainings(updatedTrainings);
            setShowPopup(false);
            setSelectedTraining(null);

        } catch (err) {
            console.error('Error saving training result:', err);
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
            const response = await fetch(`http://${strings.localhost}/api/documentTraining/view/${documentId}`);
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

    const handleViewDocument = async (documentId, documentName) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/documentTraining/view/${documentId}`, {
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

    const handleViewCertificate = async (training) => {
        setIsGeneratingCertificate(true);
        try {
            const employeeId = localStorage.getItem("employeeId") || "1";
            const companyId = localStorage.getItem("companyId") || "1";
            const trainingId = training.trainingId || training.id;
            const resultId = training.resultId || "1";

            const currentDate = new Date();
            const formattedDate = currentDate.toISOString().split('T')[0];

            // First, try to get the existing certificate
            const checkUrl = `http://${strings.localhost}/api/certificates/training/${trainingId}/employee/${employeeId}`;
            const checkResponse = await fetch(checkUrl);

            let certificateData;

            if (checkResponse.ok) {
                // Certificate exists, use it
                certificateData = await checkResponse.json();

                // Update the applied status if not already true
                if (!certificateData.applied) {
                    const updateUrl = `http://${strings.localhost}/api/certificates/${certificateData.certification_id}/apply`;
                    await fetch(updateUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            applied: true
                        })
                    });
                }
            } else {
                // Certificate doesn't exist, generate a new one
                const apiUrl = `http://${strings.localhost}/api/certificates/generate?empId=${employeeId}&companyId=${companyId}&trainingId=${trainingId}&resultId=${resultId}`;
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        trainingId: trainingId,
                        employeeId: employeeId,
                        employeeName: localStorage.getItem("employeeName") || "Employee",
                        completionDate: formattedDate,
                        courseDescription: training.heading || training.title || "No Title",
                        applied: true
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to generate certificate');
                }
                certificateData = await response.json();
            }

            setCertificateData({
                title: training.title || training.heading || "No Title",
                employeeName: employeeName || "Employee",
                completionDate: certificateData.completionDate || new Date().toLocaleDateString(),
                trainingId: trainingId,
                certificateId: certificateData.certificationId,
            });

            setShowCertificate(true);
            setOpenMenuId(null);

        } catch (error) {
            console.error('Error handling certificate:', error);
            showToast(error.message || 'Failed to handle certificate. Please try again.', 'error');
        } finally {
            setIsGeneratingCertificate(false);
        }
    };

    return (
        <>
            {loading ? (
                <div className="coreContainer">Loading trainings...</div>
            ) : error ? (
                <div className="coreContainer">Error: {error}</div>
            ) : (
                <>
                    {trainings.length === 0 ? (
                        <p>No trainings assigned to you.</p>
                    ) : (
                        <div className="training-container-main">
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
                            <div className="training-container">
                                <div className="training-grid">
                                    {trainings.map(training => (
                                        <div key={training.id} className={`induction-card ${training.status.toLowerCase() === 'completed' ? 'completed' : training.status.toLowerCase()}`}>
                                            <div className="card-header">
                                                <h3>{training.title}</h3>
                                                <div className="top-header">
                                                    {/* <span className={`status-css ${training.status.toLowerCase() === 'completed' ? 'completed' : training.status.toLowerCase()}`}>
                                                        {training.status}
                                                    </span> */}
                                                    <div className="dropdown">
                                                        <button
                                                            type='button'
                                                            className="dots-button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleMenu(training.id);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faEllipsisV} />
                                                        </button>
                                                        <div className={`dropdown-content ${openMenuId === training.id ? 'show' : ''}`}>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => handleTrainingAction(training)}
                                                            >
                                                                <FaEye /> View Training
                                                            </button>
                                                            {training.status === "Completed" && (
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => handleViewCertificate(training)}
                                                                    disabled={isGeneratingCertificate}
                                                                >
                                                                    <FaCertificate />
                                                                    {isGeneratingCertificate ? 'Generating...' : 'Certificate'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="card-description1">{training.description}</p>
                                            <div className="card-actions">
                                                <button
                                                    className="outline-btn"
                                                    onClick={() => handleTrainingAction(training)}
                                                >
                                                    View Training
                                                </button>
                                                <button
                                                    className={`btn ${training.status === "Completed" ? "completed" : training.status === "Expired" ? "expired" : ""}`}
                                                    disabled={training.status === "Completed" || training.status === "Expired"}
                                                >
                                                    {training.status === "Completed" ? "Completed" : training.status === "Expired" ? "Expired" : "Pending"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {showPopup && selectedTraining && (
                        <div className="modal-overlayi">
                            <div className="induction-modal">
                                <button className="close-btn" onClick={() => {
                                    setSelectedTraining(null);
                                    setMediaContent([]);
                                    setShowPopup(false);
                                }}>×</button>
                                <h2 className="centerText">{selectedTraining.title}</h2>

                                <div className="modal-contenti">
                                    <p>{selectedTraining.description}</p>
                                    <hr />

                                    {loading ? (
                                        <p>Loading media and questions...</p>
                                    ) : (
                                        <>
                                            {mediaContent.length > 0 ? (
                                                <div className="media-container">
                                                    {mediaContent.map((item, index) => {
                                                        if (item.type === "image") {
                                                            return (
                                                                <img
                                                                    key={index}
                                                                    src={item.url}
                                                                    alt={`Training content ${index}`}
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
                                                                    <span><strong>{index + 1}. {item.fileName}</strong></span>
                                                                    <div>
                                                                        <button type='button' className='preview-btn' onClick={() => handleViewDocument(item.documentId, item.fileName)}>Preview </button>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDownload(item.documentId, item.fileName)}
                                                                        className="outline-btn"
                                                                    >
                                                                        Download Document
                                                                    </button>
                                                                </div>
                                                            );
                                                        }
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="no-data1">No documents available for this training.</p>
                                            )}

                                            <hr />

                                            {questions.length > 0 && (
                                                <div className="questions-section">
                                                    <h4>Please answer the following questions:</h4>
                                                    {questions.map((question, index) => (
                                                        <div key={question.id} className="question-item">
                                                            <label>{index + 1}. {question.question}</label>

                                                            {selectedTraining.status === "Completed" ? (
                                                                question.termAndCondition ? (
                                                                    <p className="readonly-answer">✅ Terms Accepted</p>
                                                                ) : (
                                                                    <textarea value={answers[question.id]} readOnly rows={3} />
                                                                )
                                                            ) : (
                                                                question.termAndCondition ? (
                                                                    <div className="terms-checkbox">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`terms-${question.id}`}
                                                                            checked={answers[question.id] || false}
                                                                            onChange={(e) =>
                                                                                handleTermsChange(question.id, e.target.checked)
                                                                            }
                                                                        />
                                                                        <label htmlFor={`terms-${question.id}`}>
                                                                            I accept the terms and conditions
                                                                        </label>
                                                                    </div>
                                                                ) : (
                                                                    <textarea
                                                                        value={answers[question.id] || ''}
                                                                        onChange={(e) =>
                                                                            handleAnswerChange(question.id, e.target.value)
                                                                        }
                                                                        placeholder="Your answer..."
                                                                        rows={3}
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                    ))}


                                                    {selectedTraining.status !== "Completed" && (
                                                        <div className="acknowledge-check">
                                                            <input
                                                                type="checkbox"
                                                                id="acknowledgeCheckbox"
                                                                checked={acknowledged}
                                                                onChange={(e) => setAcknowledged(e.target.checked)}
                                                            />
                                                            <label htmlFor="acknowledgeCheckbox">
                                                                I confirm that I have read and understood this training material
                                                            </label>
                                                        </div>
                                                    )}


                                                    <div className="modal-actions">
                                                        <button
                                                            className="outline-btn"
                                                            onClick={() => setShowPopup(false)}
                                                        >
                                                            Close
                                                        </button>
                                                        {selectedTraining.status !== "Completed" && !selectedTraining?.expiryStatus && (
                                                            <button
                                                                type="button"
                                                                className="btn"
                                                                onClick={handleSubmit}
                                                                disabled={
                                                                    !acknowledged ||
                                                                    questions.some(
                                                                        q =>
                                                                            !q.termAndCondition &&
                                                                            (!answers[q.id] || answers[q.id].trim() === '')
                                                                    )
                                                                }
                                                            >
                                                                {isSubmitting ? (
                                                                    <div className="loading-spinner"></div>
                                                                ) : (
                                                                    'Submit Acknowledgment'
                                                                )}
                                                            </button>
                                                        )}



                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pagination controls */}
                    <div className="pagination-controls">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                            disabled={currentPage === 0} type="button"
                            className='pagination-btn'
                        >
                            Previous
                        </button>

                        <span> {currentPage + 1} of {totalPages}</span>

                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage >= totalPages - 1} type="button"
                            className='pagination-btn'
                        >
                            Next
                        </button>
                    </div>

                    {showCertificate && (
                        <TrainingCertificate
                            data={certificateData}
                            onClose={() => setShowCertificate(false)}
                        />
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
                </>
            )}
        </>
    );
};

export default TrainingOverview;
