import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { strings } from '../../string';
import { showToast } from '../../Api.jsx';
const FeedbackApprovalrequest = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const employeeId = localStorage.getItem("employeeId");




    const fetchFeedbacks = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/requested-feedback/getByStatusAndEmployee/true/${employeeId}`);
            if (Array.isArray(response.data)) {
                setFeedbacks(response.data);
            } else {
                setFeedbacks([]);
            }
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [employeeId]);

    const handleApproveFeedback = async () => {
        if (selectedFeedback && selectedFeedback.id) {
            setLoading(true);
            try {
                const payload = {
                    feedbackDescription: selectedFeedback.feedbackDescription || '',
                    notes: selectedFeedback.notes || '',
                    requestedToEmployeeId: selectedFeedback.requestedToEmployeeId,
                    overallRating: selectedFeedback.overallRating || 0,
                    feedbackDetails: selectedFeedback.feedbackDetails.map(detail => ({
                        question: detail.question,
                        rating: detail.rating || 0
                    }))
                };
                const response = await axios.put(
                    `http://${strings.localhost}/api/requested-feedback/update/${selectedFeedback.id}`,
                    payload
                );

                if (response.data) {
                    showToast('Approved Successfully.', 'success');
                    setShowDetailsModal(false);

                }
            } catch (error) {
                console.error('Error approving feedback:', error);
                showToast('Error while approving.', 'error');
            }
            finally {
                setLoading(false);
            }
        }
    };


    const handleShowDetails = (feedback) => {
        if (feedback) {
            setSelectedFeedback(feedback);
            setShowDetailsModal(true);
        }
    };
    const handleViewClick2 = (feedback) => {
        setSelectedFeedback(feedback);
        setShowDetailsModal(true);
    };

    const handleRatingChange = (index, event) => {
        const rect = event.target.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const width = rect.width;
        const clickedRating = Math.ceil((clickX / width) * 5);
        const newRating = selectedFeedback.feedbackDetails[index].rating === clickedRating ? 0 : clickedRating;
        updateQuestionRating(index, newRating);
    };

    const updateQuestionRating = (index, newRating) => {
        const updatedFeedback = { ...selectedFeedback };
        updatedFeedback.feedbackDetails[index].rating = newRating;
        setSelectedFeedback(updatedFeedback);
    };


    const handleOverallRatingChange = (n) => {
        const newRating = selectedFeedback.overallRating === n ? 0 : n;
        updateOverallRating(newRating);
    };

    const updateOverallRating = (newRating) => {
        setSelectedFeedback({
            ...selectedFeedback,
            overallRating: newRating
        });
    };

    const editdropdownfeedback = (feedback) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button
                        type='button'
                        onClick={() => handleViewClick2(feedback)}
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="coreContainer">

            {loading && <div className="loading-spinner"></div>}
            <table className="interview-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(feedbacks) && feedbacks.length > 0 ? (
                        feedbacks.map((feedback, index) => (
                            <tr key={feedback.id} onClick={() => handleShowDetails(feedback)}>
                                <td>{index + 1}</td>
                                <td>{feedback.feedbackDescription}</td>

                                <td>
                                    {feedback.approval ? (
                                        <span style={{ color: 'green', fontSize: '14px' }}>Approve</span>
                                    ) : (
                                        <span style={{ color: 'blue', fontSize: '14px' }}>Pending</span>
                                    )}
                                </td>
                                <td>
                                    {editdropdownfeedback(feedback)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2">No feedbacks available.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {showDetailsModal && selectedFeedback && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowDetailsModal(false)}>&times;</span>
                        <div className="centre-heading">Feedback Details</div>
                        <div>
                            {selectedFeedback.feedbackDescription ? (
                                <>
                                    <p style={{ textAlign: 'center' }}><strong>Overall Rating</strong></p>
                                    <div className="star-rating-container">
                                        {[1, 2, 3, 4, 5].map((starIndex) => (
                                            <span
                                                key={starIndex}
                                                className={`star ${starIndex <= selectedFeedback.overallRating ? 'filled' : ''}`}
                                                onClick={() => handleOverallRatingChange(starIndex)}
                                            >
                                                &#9733;
                                            </span>
                                        ))}
                                    </div>
                                    <p><strong>Feedback Description:</strong>{selectedFeedback.feedbackDescription}</p>
                                    <div>
                                        <label><strong>Notes:</strong></label>
                                        <input

                                            type="text"
                                            value={selectedFeedback ? selectedFeedback.notes : ''}
                                            onChange={(e) => setSelectedFeedback({
                                                ...selectedFeedback,
                                                notes: e.target.value
                                            })}
                                            placeholder="Enter Notes"
                                            required
                                        />
                                    </div>

                                    {/* <p><strong>Notes:</strong> {selectedFeedback.notes}</p> */}
                                    <div className='underlineText' style={{ textAlign: 'center' }}>Feedback Questions</div>
                                    <ul>
                                        {selectedFeedback.feedbackDetails && selectedFeedback.feedbackDetails.length > 0 ? (
                                            selectedFeedback.feedbackDetails.map((detail, index) => (
                                                <li key={detail.id} className="feedback-container">
                                                    <p className="feedback-que-container">{index + 1}) {detail.question}</p>
                                                    <div className="feedback-rating-container">
                                                        <label>Rating for this question:</label>
                                                        <div
                                                            className="feedback-level-indicator"
                                                            style={{ position: 'relative', height: '20px', width: '100%' }}
                                                            onClick={(e) => handleRatingChange(index, e)}
                                                        >
                                                            <div
                                                                className={`level-fill rating-${detail.rating}`}
                                                                style={{
                                                                    width: `${detail.rating === 0 ? 10 : (detail.rating / 5) * 100}%`,
                                                                    height: '100%',
                                                                    backgroundColor: detail.rating > 0 ? '#4CAF50' : '#FF5252',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0
                                                                }}
                                                            ></div>
                                                            <div
                                                                className="level-text"
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '50%',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, -50%)',
                                                                    fontWeight: 'bold',
                                                                    color: '#FFF'
                                                                }}
                                                            >
                                                                {detail.rating > 0 ? detail.rating : "0"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <p>No feedback details available.</p>
                                        )}
                                    </ul>
                                    <div className='btnContainer'>
                                        <button type='button' onClick={handleApproveFeedback} className='btn' disabled={loading}> {loading ? 'Approving...' : 'Approve Feedback'} </button>
                                    </div>
                                </>
                            ) : (
                                <p>No feedback description available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackApprovalrequest;
