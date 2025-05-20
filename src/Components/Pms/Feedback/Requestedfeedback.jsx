import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../../string';
import { showToast } from '../../../Api.jsx';
const RequestedFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [questions, setQuestions] = useState(['']);
    const [employees, setEmployees] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [employeeSearchInput, setEmployeeSearchInput] = useState('');
    const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
    const [employeeSearchError, setEmployeeSearchError] = useState('');
    const employeeId = localStorage.getItem('employeeId');
    const companyId = localStorage.getItem('companyId');
    const [feedbackData, setFeedbackData] = useState(
        questions.map(() => ({ ratingForGoal: 0 }))
    );
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/requested-feedback/getByEmployeeIdAndYear/${employeeId}/${year}`);
                if (Array.isArray(response.data)) {
                    setFeedbacks(response.data);
                } else {
                    setFeedbacks([]);
                }
            } catch (error) {
                console.error('Error fetching feedbacks:', error);
            }
        };

        if (year && employeeId) {
            fetchFeedbacks();
        }
    }, [year, employeeId]);


    const handleShowDetails = (feedback) => {
        if (feedback) {
            setSelectedFeedback(feedback); // Ensure feedback is set correctly
            setShowDetailsModal(true);
        }
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, '']);
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index] = value;
        setQuestions(newQuestions);
    };
    const handleRatingChange = (index, rating) => {
        const updatedFeedbackData = [...feedbackData];
        updatedFeedbackData[index] = {
            ...updatedFeedbackData[index],
            ratingForGoal: rating // Update the rating for this question
        };
        setFeedbackData(updatedFeedbackData);
    };


    const handleSaveFeedback = async () => {
        const feedbackPayload = {
            feedbackDescription: selectedFeedback.feedbackDescription,
            notes: 'Add Notes Here',
            requestedToEmployeeId: selectedEmployee,
            overallRating: 0,
            feedbackDetails: questions.map(question => ({
                question,
                rating: 0
            }))
        };
        setLoading(true);
        try {
            console.log('selectedEmployee', selectedEmployee);
            await axios.post(`http://${strings.localhost}/api/requested-feedback/create/${employeeId}`, feedbackPayload);
            setShowAddModal(false);
            window.location.reload();
            showToast("Feedback Saved Successfully.", 'success');

            console.log('Feedback saved successfully');
        } catch (error) {
            console.error('Error saving feedback:', error);
            showToast('Error while saving Feedback.', 'error');
        }
        setLoading(false);
    };

    const handleSearchEmployee = async (e) => {
        const searchTerm = e.target.value; // Use e.target.value directly
        setEmployeeSearchInput(searchTerm);

        if (searchTerm) {
            try {
                const response = await axios.get(`http://${strings.localhost}/employees/search`, {
                    params: { companyId, searchTerm }, // Pass searchTerm directly
                });
                if (response.data) {
                    setEmployeeSearchResults(response.data); // Update search results with the response
                    setEmployeeSearchError(''); // Clear any error message if results are found
                }
            } catch (error) {

                console.error('Error searching for employees:', error);
                setEmployeeSearchResults([]); // Clear results if error occurs
                setEmployeeSearchError('No employees found.'); // Set error message
            }
        } else {
            setEmployeeSearchResults([]); // Reset results when search term is empty
        }
    };


    // This function handles the selection of an employee from the search results
    const handleSelectEmployee = (employee) => {
        setSelectedEmployee(employee.id);
        setEmployeeSearchInput(`${employee.firstName} ${employee.lastName}`);
        setEmployeeSearchResults([]); // Clear search results after selection
    };
    const handleYearChange = (e) => {
        setYear(e.target.value);
    };
    return (
        <div className="coreContainer">
            <div className='title'>Request For Feedback</div>
            <div className='containerbtn'>
                <div>
                    <button type='button' className='btn' onClick={() => setShowAddModal(true)}>Add Feedback</button>
                </div>
                <div style={{ marginBottom: '' }}>
                    <label htmlFor="year">Year:</label>
                    <select id="year" value={year} onChange={handleYearChange}>
                        <option value="">Select Year</option>
                        {yearOptions.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>
            <table className="Attendance-table" >
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Description</th>
                        <th>Status</th>
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
                                        <span style={{ color: 'green', fontSize: '12px' }}>Approved</span>
                                    ) : (
                                        <span style={{ color: 'orange', fontSize: '12px' }}>Pending</span>
                                    )}
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
                        <div className='centre-heading' >Feedback Details</div>
                        <div>
                            {selectedFeedback.feedbackDescription ? (
                                <>
                                    <p><strong>Feedback Description:</strong>{selectedFeedback.feedbackDescription}</p>
                                    <p><strong>Notes:</strong> {selectedFeedback.notes}</p>
                                    <div className='underlineText'>Feedback Questions</div>
                                    <ul>
                                        {selectedFeedback.feedbackDetails && selectedFeedback.feedbackDetails.length > 0 ? (
                                            selectedFeedback.feedbackDetails.map((detail, index) => (
                                                <li key={detail.id} className='feedback-container'>

                                                    <p className='feedback-que-container'>{index + 1} {detail.question}</p>

                                                    {/* Rating Indicator */}
                                                    <div className="feedback-rating-container">
                                                        <label>Rating for this question:</label>
                                                        <div className="feedback-level-indicator" style={{ position: 'relative', height: '20px', width: '100%' }}>
                                                            <div
                                                                className={`level-fill rating-${detail.rating}`}
                                                                style={{
                                                                    width: `${detail.rating === 0 ? 20 : (detail.rating / 5) * 100}%`, // For 0 rating, show some progress with red
                                                                    height: '100%',
                                                                    backgroundColor: detail.rating > 0 ? '#4CAF50' : '#FF5252', // Green for > 0, Red for 0
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0
                                                                }}
                                                            ></div>

                                                            {/* Show rating number */}
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

                                                    {/* <p><strong>Rating:</strong> {detail.rating > 0 ? detail.rating : "0"}</p> */}
                                                </li>
                                            ))
                                        ) : (
                                            <p>No feedback details available.</p>
                                        )}
                                    </ul>

                                </>
                            ) : (
                                <p>No feedback description available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}



            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowAddModal(false)}>&times;</span>
                        <h2>Add Feedback</h2>
                        <form>
                            <div>
                                <div>
                                    <label><strong>Feedback Description:</strong></label>
                                    <input
                                        type="text"
                                        value={selectedFeedback ? selectedFeedback.feedbackDescription : ''}
                                        onChange={(e) => setSelectedFeedback({
                                            ...selectedFeedback,
                                            feedbackDescription: e.target.value
                                        })}
                                        placeholder="Enter Feedback Description"
                                        required
                                    />
                                </div>
                                {/* <div>
                                    <label><strong>Notes:</strong></label>
                                    <input
                                        type="text"
                                        value={selectedFeedback ? selectedFeedback.notes : 'Add Notes Here'}
                                        onChange={(e) => setSelectedFeedback({
                                            ...selectedFeedback,
                                            notes: e.target.value
                                        })}
                                        placeholder="Enter Notes"
                                        required
                                        readOnly
                                        className='readonly'
                                    />
                                </div> */}

                            </div>

                            <div className="year-select-container" style={{ marginTop: '20px' }}>
                                <div className='year-select'>
                                    <span className="required-marker">*</span>
                                    <label htmlFor="employeeSearch">Request Employee</label>
                                    <input
                                        type="text"
                                        placeholder='Search employee..'
                                        id="employeeSearch"
                                        name="employeeSearch"
                                        value={employeeSearchInput}
                                        onChange={handleSearchEmployee}
                                        required
                                    />
                                    {employeeSearchError && (
                                        <div className="toast">
                                            <span style={{ color: 'red' }}>{employeeSearchError}</span>
                                        </div>
                                    )}
                                    {employeeSearchResults.length > 0 && (
                                        <ul className="dropdown2">
                                            {employeeSearchResults.map((employee) => (
                                                <li
                                                    key={employee.id}
                                                    onClick={() => handleSelectEmployee(employee)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {`${employee.firstName} ${employee.lastName}`}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {questions.map((question, index) => (
                                <div className="feedback-container" key={index} >
                                    <div className='feedback-que-container'>
                                        <label>Question {index + 1}</label>
                                        <input
                                            type="text"
                                            value={question}
                                            onChange={(e) => handleQuestionChange(index, e.target.value)}

                                        />
                                    </div>


                                </div>
                            ))}

                            <button type="button" className='btn' onClick={handleAddQuestion}>+ Add Question</button>
                        </form>
                        <div className="modal-footer">
                            {loading && <div className="loading-spinner"></div>}
                            <button type='button' className='btn' onClick={handleSaveFeedback} disabled={loading}>{loading ? 'Saving...' : 'Save Feedback'}</button>
                            <button type='button' className='outline-btn' onClick={() => setShowAddModal(false)}>Close</button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default RequestedFeedback;
