import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../CommonCss/AppraisalForm .css';
import { strings } from '../../../string';
import { showToast } from '../../../Api.jsx';

const AppraisalForm = () => {
    const [goals, setGoals] = useState([]);
    const [kpis, setKpis] = useState([]);
    const [goalFeedbacks, setGoalFeedbacks] = useState([]);
    const [kpiFeedbacks, setKpiFeedbacks] = useState([]);
    const [updatedGoals, setUpdatedGoals] = useState([]);
    const [updatedKpis, setUpdatedKpis] = useState([]);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [employeeRatingStatusGoal, setEmployeeRatingStatusGoal] = useState();
    const [employeeRatingStatusKpi, setEmployeeRatingStatusKpi] = useState();
    const [employeeRatingStatus, setEmployeeRatingStatus] = useState();
    const [loading, setLoading] = useState(false);
    const isGoalPending = employeeRatingStatusGoal?.some(status => status === false);
    const isKpiPending = employeeRatingStatusKpi?.some(status => status === false);

    const [otpIsverified, setIsOtpVerified] = useState(false);
    const currentYear = new Date().getFullYear();
    const employeeId = localStorage.getItem('employeeId');

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/appraisal/goals/byEmployee/${employeeId}`);
                // Ensure every goal has a 'note' property
                const goalsWithNotes = response.data.map(goal => ({
                    ...goal,
                    note: goal.note || ''  // Initialize note if it's undefined
                }));
                setGoals(goalsWithNotes);
                setEmployeeRatingStatusGoal(goalsWithNotes.map(goal => goal.employeeRatingStatus));
            } catch (error) {
                console.error('Error fetching goals:', error);
            }
        };
        const fetchKpis = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/appraisal/kpis/byEmployee/${employeeId}`);
                setKpis(response.data);
                setEmployeeRatingStatusKpi(response.data.map(kpi => kpi.employeeRatingStatus));
            } catch (error) {
                console.error('Error fetching KPIs:', error);
            }
        };

        const fetchGoalFeedbacks = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/goalSetting/getByEmployeeAndYearDetailForReview?employeeId=${employeeId}&year=${currentYear}`);
                setGoalFeedbacks(response.data);
            } catch (error) {
                console.error('Error fetching goal feedbacks:', error);
            }
        };

        const fetchKpiFeedbacks = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/kpi/getByEmployeeAndYearDetailForReview?employeeId=${employeeId}&year=${currentYear}`);
                setKpiFeedbacks(response.data);
            } catch (error) {
                console.error('Error fetching KPI feedbacks:', error);
            }
        };

        fetchGoals();
        fetchKpis();
        fetchGoalFeedbacks();
        fetchKpiFeedbacks();

    }, []);


    // Get feedbacks for either goals or KPIs
    const getFeedbacksForItem = (itemId, type) => {
        let feedbackData = [];
        if (type === 'goal') {
            feedbackData = goalFeedbacks.filter(feedback => feedback.id === itemId);
        } else if (type === 'kpi') {
            feedbackData = kpiFeedbacks.filter(feedback => feedback.id === itemId);
        }
        return feedbackData;
    };

    // Update Goal Rating
    const handleGoalRatingChange = (goalId, newRating) => {
        setGoals(goals.map(goal =>
            goal.id === goalId ? {
                ...goal,
                employeeSelfRating: newRating
            } : goal
        ));

        // Track updated goal
        const updatedGoal = { id: goalId, employeeSelfRating: newRating };
        setUpdatedGoals(prevState => {
            const updated = [...prevState];
            const existingGoal = updated.find(goal => goal.id === goalId);
            if (existingGoal) {
                existingGoal.employeeSelfRating = newRating;
            } else {
                updated.push(updatedGoal);
            }
            return updated;
        });
    };

    // Update KPI Rating
    const handleKpiRatingChange = (kpiId, newRating) => {
        setKpis(kpis.map(kpi =>
            kpi.id === kpiId ? {
                ...kpi,
                employeeSelfRating: newRating
            } : kpi
        ));

        // Track updated KPI
        const updatedKpi = { id: kpiId, employeeSelfRating: newRating };
        setUpdatedKpis(prevState => {
            const updated = [...prevState];
            const existingKpi = updated.find(kpi => kpi.id === kpiId);
            if (existingKpi) {
                existingKpi.employeeSelfRating = newRating;
            } else {
                updated.push(updatedKpi);
            }
            return updated;
        });
    };

    const handleUpdate = async () => {
        const updatedData = updatedGoals;
        const notesToSave = [];

        // Log the updated goals array to verify the changes
        console.log("Updated Goals Data:", updatedData);

        // Filter out the goals with updated notes and prepare data for saving
        const goalsToUpdate = updatedData.map(goal => {
            // If the goal has a rating change, we will include it for the update call
            if (goal.employeeSelfRating !== undefined || goal.selfOrManagerNote !== undefined) {
                // Create a new goal object without the note field to pass to the updateMultiple API
                const { note, ...goalDataForUpdate } = goal;  // Exclude the 'note'
                return goalDataForUpdate;
            }
            return null;
        }).filter(goal => goal !== null); // Remove any null values

        // Filter out the goals with updated notes and prepare data for saving
        updatedData.forEach(goal => {
            if (goal.note !== undefined && goal.note.trim() !== '') {
                console.log('Note found for goal:', goal.id, 'Note:', goal.note);
                notesToSave.push({
                    note: goal.note,
                    selfOrManagerNote: false,  // Set selfOrManagerNote as false for saving
                    appraisalGoal: { id: goal.id }
                });
            } else {
                console.log('No note for goal:', goal.id);
            }
        });

        console.log('Goals to update:', goalsToUpdate);
        console.log('Notes to save:', notesToSave);

        if (goalsToUpdate.length > 0 || notesToSave.length > 0) {
            try {
                const apiCalls = [];

                // If there are goals to update (ratings), send the updateMultiple API call
                if (goalsToUpdate.length > 0) {
                    console.log('Sending updated goals data to updateMultiple:', goalsToUpdate);
                    const updateGoalsPromise = axios.put(`http://${strings.localhost}/api/appraisalGoal/updateMultiple`, goalsToUpdate);
                    apiCalls.push(updateGoalsPromise);
                } else {
                    console.log('No goals to update.');
                }

                // If there are notes to save, send the saveMultipleGoals API call
                if (notesToSave.length > 0) {
                    console.log('Sending notes to the saveMultipleGoals API:', notesToSave);
                    const saveNotesPromise = axios.post(`http://${strings.localhost}/api/appraisal-goal-notes/saveMultipleGoals`, notesToSave);
                    apiCalls.push(saveNotesPromise);
                } else {
                    console.log('No notes to save. Skipping the saveMultipleGoals API call.');
                }

                const responses = await Promise.all(apiCalls);
                if (responses.every(response => response.status === 200)) {
                    console.log('Both API calls succeeded');
                    showToast('Goals ratings and notes updated successfully.', 'success');
                    setUpdatedGoals([]);  // Clear the updated goals
                } else {
                    console.log('One or both API calls failed:', responses);
                    showToast('Failed to update ratings and/or notes', 'error');
                }
            } catch (error) {
                console.error('Error updating appraisal ratings or saving notes:', error);
                showToast('Failed to update ratings and/or notes', 'error');
            }
        } else {
            console.log('No updated goals or notes detected');
            showToast('No changes detected', 'warn');
        }
    };
    const handleUpdateKpi = async () => {
        const updatedData = updatedKpis;
        const kpiNotesToSave = [];

        // Log the updated Kpis array to verify the changes
        console.log("Updated KPIs Data:", updatedData);

        // Filter out the kpis with updated notes and prepare data for saving
        const kpisToUpdate = updatedData.map(kpi => {
            // If the KPI has a rating change, we will include it for the update call
            if (kpi.employeeSelfRating !== undefined) {
                // Create a new KPI object without the note field to pass to the updateMultiplekpis API
                const { note, ...kpiDataForUpdate } = kpi;  // Exclude the 'note'
                return kpiDataForUpdate;
            }
            return null;
        }).filter(kpi => kpi !== null); // Remove any null values

        // Filter out the kpis with updated notes and prepare data for saving
        updatedData.forEach(kpi => {
            if (kpi.note && kpi.note.trim() !== '') {
                console.log('Note found for kpi:', kpi.id, 'Note:', kpi.note);
                kpiNotesToSave.push({
                    note: kpi.note,
                    selfOrManagerNote: false,  // Set selfOrManagerNote as false for saving
                    appraisalKpi: { id: kpi.id }
                });
            } else {
                console.log('No note for kpi:', kpi.id);
            }
        });

        console.log('Kpis to update:', kpisToUpdate);
        console.log('KPI Notes to save:', kpiNotesToSave);

        if (kpisToUpdate.length > 0 || kpiNotesToSave.length > 0) {
            try {
                const apiCalls = [];

                // If there are kpis to update (ratings), send the updateMultiplekpis API call
                if (kpisToUpdate.length > 0) {
                    console.log('Sending updated kpis data to updateMultiplekpis:', kpisToUpdate);
                    const updateKpisPromise = axios.put(`http://${strings.localhost}/api/appraisalGoal/updateMultiplekpis`, kpisToUpdate);
                    apiCalls.push(updateKpisPromise);
                } else {
                    console.log('No kpis to update.');
                }

                // If there are KPI notes to save, send the saveMultipleKpiNotes API call
                if (kpiNotesToSave.length > 0) {
                    console.log('Sending KPI notes to the saveMultipleKpiNotes API:', kpiNotesToSave);
                    const saveNotesPromise = axios.post(`http://${strings.localhost}/api/appraisal-kpi-notes/saveMultipleKpiNotes`, kpiNotesToSave);
                    apiCalls.push(saveNotesPromise);
                } else {
                    console.log('No notes to save. Skipping the saveMultipleKpiNotes API call.');
                }

                const responses = await Promise.all(apiCalls);
                if (responses.every(response => response.status === 200)) {
                    console.log('Both API calls succeeded');
                    showToast('KPI ratings and notes updated successfully.', 'success');
                    setUpdatedKpis([]);  // Clear the updated kpis
                } else {
                    console.log('One or both API calls failed:', responses);
                    showToast('Failed to update ratings and/or notes', 'error');
                }
            } catch (error) {
                console.error('Error updating appraisal ratings or saving notes:', error);
                showToast('Failed to update ratings and/or notes', 'error');
            }
        } else {
            console.log('No updated kpis or notes detected');
            showToast('No changes detected', 'warn');
        }
    };

    const handleSendForApproval = async () => {


        setIsSendingOtp(true);
        try {
            const response = await axios.post(`http://${strings.localhost}/api/appraisal/${employeeId}`);
            if (response.status === 200) {
                setOtpSent(true); // OTP sent successfully, show OTP input
                showToast('OTP sent successfully.', 'success');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            showToast('Failed to send OTP', 'error');
        }
        finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        setIsOtpVerified(false);
        try {
            const response = await axios.post(`http://${strings.localhost}/api/appraisal/verifyOtpAndUpdate/${employeeId}?otp=${otp}`);
            if (response.status === 200) {
                showToast('OTP verified and status updated', 'success');
                setOtpSent(false);
                setOtp("");
                setEmployeeRatingStatus(false);
                setIsOtpVerified(true);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            showToast('OTP verification failed', 'error');

        }
        finally {
            setLoading(false);
        }
    };
    const handleclose = async () => {
        setOtpSent(false);
    }
    const showSaveRatingsButtonForGoals = employeeRatingStatusGoal?.some(status => status === false);
    const showSaveRatingsButtonForKpis = employeeRatingStatusKpi?.some(status => status === false);

    const handleNoteChange = (id, type, newNote) => {
        if (type === 'goal') {
            setGoals(goals.map(goal =>
                goal.id === id ? { ...goal, note: newNote } : goal
            ));

            // Track the updated goal for notes
            const updatedGoal = { id, note: newNote };
            setUpdatedGoals(prevState => {
                const updated = [...prevState];
                const existingGoal = updated.find(goal => goal.id === id);
                if (existingGoal) {
                    existingGoal.note = newNote;
                } else {
                    updated.push(updatedGoal);
                }
                return updated;
            });
        } else if (type === 'kpi') {
            setKpis(kpis.map(kpi =>
                kpi.id === id ? { ...kpi, note: newNote } : kpi
            ));
            const updatedKpi = { id, note: newNote };
            setUpdatedKpis(prevState => {
                const updated = [...prevState];
                const existingKpi = updated.find(kpi => kpi.id === id);
                if (existingKpi) {
                    existingKpi.note = newNote;
                } else {
                    updated.push(updatedKpi);
                }
                return updated;
            });
        }
    };
    return (
        <div className="coreContainer">

            <div className='form-title'>Appraisal Form</div>
            <table className="Goal-table">
                <thead>
                    <tr>
                        <th>Sr. No</th>
                        <th>Goals/KPI</th>
                        <th>Employee Rating</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>

                    <tr>
                        <td colSpan={6} style={{ fontWeight: 'bold' }}>
                            Employee Ratings Against Goals
                        </td>
                    </tr>
                    {goals.map((goal, index) => {
                        const goalFeedbacks = getFeedbacksForItem(goal.employeeGoalSetting.id, 'goal');
                        return (
                            <tr key={goal.id} className='goal-container'>
                                <td style={{ width: '5%' }}>{index + 1}</td>
                                <td style={{ position: 'relative' }}>
                                    <ol>
                                        <li>{goal.employeeGoalSetting.goal}</li>
                                    </ol>
                                    {goalFeedbacks.length > 0 ? (
                                        goalFeedbacks[0].feedbacks.map((feedback, feedbackIndex) => (
                                            <ul key={`feedback-${goal.employeeGoalSetting.id}-${feedbackIndex}`}>
                                                <ul>
                                                    {`${feedbackIndex + 1 === 1 ? 'i)' : feedbackIndex + 1 === 2 ? 'ii)' : feedbackIndex + 1 === 3 ? 'iii)' : feedbackIndex + 1 + ')'} feedback - ${feedback.note}`}
                                                    {feedback.rating}
                                                </ul>
                                            </ul>
                                        ))
                                    ) : (
                                        <ul>No feedback</ul>
                                    )}
                                    <div className='rating-text'>
                                        Suggested Rating: {goalFeedbacks.length > 0 ? goalFeedbacks[0].averageRating : 'N/A'}
                                    </div>
                                </td>


                                <td className="star-coloumn">
                                    <div className="star-rating">
                                        {[1, 2, 3, 4, 5].map((starIndex) => (
                                            <span
                                                key={starIndex}
                                                className={`star ${starIndex <= goal.employeeSelfRating ? 'filled' : ''}`}
                                                onClick={() => handleGoalRatingChange(goal.id, starIndex)}
                                            >
                                                &#9733;
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <textarea
                                        type="text"
                                        value={goal.note || ''}
                                        onChange={(e) => handleNoteChange(goal.id, 'goal', e.target.value)}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                    <div colSpan={4} className='form-controls'>
                        <div>
                            <button type='button' onClick={handleUpdate} className="btn">
                                Save Rating
                            </button>
                        </div>

                    </div>
                    <tr>
                        <td colSpan={6} style={{ fontWeight: 'bold' }}>
                            Employee Ratings Against KPIs
                        </td>
                    </tr>

                    {kpis.map((kpi, index) => {
                        const kpiFeedbacksForItem = getFeedbacksForItem(kpi.employeeKpiSetting.id, 'kpi');
                        return (
                            <tr key={kpi.id} className='goal-container'>
                                <td>{goals.length + index + 1}</td>
                                <td style={{ position: 'relative' }}>
                                    <ol>
                                        <li>{kpi.employeeKpiSetting.kpi}</li>
                                    </ol>
                                    {kpiFeedbacksForItem.length > 0 ? (
                                        kpiFeedbacksForItem[0].feedbacks.map((feedback, feedbackIndex) => (
                                            <ul key={`feedback-${kpi.employeeKpiSetting.id}-${feedbackIndex}`}>
                                                <ul>
                                                    {`${feedbackIndex + 1 === 1 ? 'i)' : feedbackIndex + 1 === 2 ? 'ii)' : feedbackIndex + 1 === 3 ? 'iii)' : feedbackIndex + 1 + ')'} feedback - ${feedback.note}`}
                                                    {feedback.rating}
                                                </ul>
                                            </ul>
                                        ))
                                    ) : (
                                        <ul>No feedback</ul>
                                    )}

                                    <div className='rating-text'>
                                        Suggested Rating: {kpiFeedbacksForItem.length > 0 ? kpiFeedbacksForItem[0].averageRating : 'N/A'}
                                    </div>
                                </td>

                                <td className="star-coloumn">
                                    <div className='star-rating'>
                                        {[1, 2, 3, 4, 5].map((starIndex) => (
                                            <span
                                                key={starIndex}
                                                className={`star ${starIndex <= kpi.employeeSelfRating ? 'filled' : ''}`}
                                                onClick={() => handleKpiRatingChange(kpi.id, starIndex)}
                                            >
                                                &#9733;
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={kpi.note || ''}
                                        onChange={(e) => handleNoteChange(kpi.id, 'kpi', e.target.value)}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {loading && <div className="loading-spinner"></div>}
            {otpSent && (

                <div className="add-popup">
                    <h3 className='underlineText' style={{ fontSize: 'center' }}>Enter OTP</h3>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required

                    />
                    <button type='button' className='btn' onClick={handleVerifyOtp} disabled={loading}> {loading ? 'Verifying OTP...' : 'Verify OTP'}</button>
                    <button type='button' className='outline-btn' onClick={handleclose}>cancel</button>
                </div>
            )}
            <div>
                <div>
                    <button type='button' onClick={handleUpdateKpi} className="btn">
                        Save Ratings
                    </button>
                </div>
                <div className="form-controls">
                    {(showSaveRatingsButtonForGoals || showSaveRatingsButtonForKpis) ? (


                        <button
                            type='button'
                            onClick={handleSendForApproval}
                            className="btn"
                            disabled={isSendingOtp}
                        >
                            {isSendingOtp ? 'Sending OTP...' : 'Send for Approval'}
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default AppraisalForm;

































































// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const AppraisalForm = () => {
//     const [goals, setGoals] = useState([]);
//     const [kpis, setKpis] = useState([]);
//     const [goalFeedbacks, setGoalFeedbacks] = useState([]);
//     const [kpiFeedbacks, setKpiFeedbacks] = useState([]);

//     useEffect(() => {
//         const fetchGoals = async () => {
//             try {
//                 const response = await axios.get('http://localhost:5557/api/appraisal/goals/byEmployee/2');
//                 setGoals(response.data);
//                 console.log('Goals:', response.data);
//             } catch (error) {
//                 console.error('Error fetching goals:', error);
//             }
//         };

//         const fetchKpis = async () => {
//             try {
//                 const response = await axios.get('http://localhost:5557/api/appraisal/kpis/byEmployee/2');
//                 setKpis(response.data);
//                 console.log('KPIs:', response.data);
//             } catch (error) {
//                 console.error('Error fetching KPIs:', error);
//             }
//         };

//         const fetchGoalFeedbacks = async () => {
//             try {
//                 const response = await axios.get('http://localhost:5557/api/goalSetting/getByEmployeeAndYearDetailForReview?employeeId=2&year=2025');
//                 setGoalFeedbacks(response.data);
//                 console.log('Goal Feedbacks:', response.data);
//             } catch (error) {
//                 console.error('Error fetching goal feedbacks:', error);
//             }
//         };

//         const fetchKpiFeedbacks = async () => {
//             try {
//                 const response = await axios.get('http://localhost:5557/api/kpisetting/getByEmployeeAndYearDetailForReview?employeeId=2&year=2025');
//                 setKpiFeedbacks(response.data);
//                 console.log('KPI Feedbacks:', response.data);
//             } catch (error) {
//                 console.error('Error fetching KPI feedbacks:', error);
//             }
//         };

//         fetchGoals();
//         fetchKpis();
//         fetchGoalFeedbacks();
//         fetchKpiFeedbacks();
//     }, []);

//     const getFeedbacksForItem = (itemId, type) => {
//         let feedbackData = [];
//         if (type === 'goal') {
//             feedbackData = goalFeedbacks.filter(feedback =>
//                 feedback.id === itemId
//             );
//         } else if (type === 'kpi') {
//             feedbackData = kpiFeedbacks.filter(feedback =>
//                 feedback.id === itemId
//             );
//         }
//         return feedbackData;
//     };

//     return (
//         <div className="coreContainer">
//             <h1>Appraisal Form</h1>

//             {/* Goal Section */}
//             <div className="form-section">
//                 {goals.map((goal, index) => {
//                     const goalFeedbacks = getFeedbacksForItem(goal.employeeGoalSetting.id, 'goal');

//                     return (
//                         <div className="form-row" key={goal.employeeGoalSetting.id}>
//                             <label>{index + 1}. Goal:</label>
//                             <div>
//                                 <strong>{goal.employeeGoalSetting.goal}</strong>
//                                 <div className="feedback-container">
//                                     {goalFeedbacks.length > 0 ? (
//                                         goalFeedbacks[0].feedbacks.map((feedback, feedbackIndex) => {
//                                             return (
//                                                 <div className="feedback" key={feedbackIndex}>
//                                                     <i>{feedbackIndex + 1 === 1 ? 'i)' : feedbackIndex + 1 === 2 ? 'ii)' : 'iii)'}</i>
//                                                     <p>{feedback.note}</p>
//                                                     <span className="rating">Rating: {feedback.rating}</span>
//                                                     <div className="date">{feedback.date}</div>
//                                                 </div>
//                                             );
//                                         })
//                                     ) : (
//                                         <div className="no-feedback">No feedback</div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* KPI Section */}
//             <div className="form-section">
//                 {kpis.map((kpi, index) => {
//                     const kpiFeedbacksForItem = getFeedbacksForItem(kpi.employeeKpiSetting.id, 'kpi');

//                     return (
//                         <div className="form-row" key={kpi.employeeKpiSetting.id}>
//                             <label>{goals.length + index + 1}. KPI:</label>
//                             <div>
//                                 <strong>{kpi.employeeKpiSetting.kpi}</strong>
//                                 <div className="feedback-container">
//                                     {kpiFeedbacksForItem.length > 0 ? (
//                                         kpiFeedbacksForItem[0].feedbacks.map((feedback, feedbackIndex) => (
//                                             <div className="feedback" key={feedbackIndex}>
//                                                 <i>i)</i>
//                                                 <p>{feedback.note}</p>
//                                                 <span className="rating">Rating: {feedback.rating}</span>
//                                                 <div className="date">{feedback.date}</div>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <div className="no-feedback">No feedback</div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// export default AppraisalForm;
