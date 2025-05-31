import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { strings } from '../../string';
import { showToast } from '../../Api.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
const AppraisalApprovalRequest = () => {
    const [data, setData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [goalFeedbacks, setGoalFeedbacks] = useState([]);
    const [kpiFeedbacks, setKpiFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [kpis, setKpis] = useState([]);
    const [goals, setGoals] = useState([]);
    const [otp, setOtp] = useState('');
    const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
    const [updatedGoals, setUpdatedGoals] = useState([]);
    const [updatedKpis, setUpdatedKpis] = useState([]);
    const currentYear = new Date().getFullYear();
    const previousyear = currentYear - 1;
    const employeeId = localStorage.getItem('employeeId');
    const [responseId, setResponseId] = useState('');

    const fetchData = async () => {
        try {
            const goalResponse = await axios.get(`http://${strings.localhost}/api/appraisal/goal/byReportingManager/${employeeId}`);
            const kpiResponse = await axios.get(`http://${strings.localhost}/api/appraisal/kpi/byReportingManager/${employeeId}`);

            // Combine the data from both the goal and KPI responses
            const combinedData = [
                ...goalResponse.data.map(goal => ({
                    ...goal,
                    type: 'goal',  // Mark the data type as 'goal'
                    employeeNote: goal.appraisalGoalNotes?.status === true ? goal.appraisalGoalNotes?.note : '',
                    managerNote: goal.appraisalGoalNotes?.status === false ? goal.appraisalGoalNotes?.note : ''
                })),
                ...kpiResponse.data.map(kpi => ({
                    ...kpi,
                    type: 'kpi',  // Mark the data type as 'kpi'
                    employeeNote: kpi.appraisalKpiNotes?.status === true ? kpi.appraisalKpiNotes?.note : '',
                    managerNote: kpi.appraisalKpiNotes?.status === false ? kpi.appraisalKpiNotes?.note : ''
                }))
            ];

            setData(combinedData);
            setIsLoading(false);

            const firstItemId = combinedData[0]?.employee?.id;
            if (firstItemId) {
                setResponseId(firstItemId);
            }
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [employeeId]);


    useEffect(() => {
        if (responseId) {
            const fetchGoalFeedbacks = async () => {
                try {
                    const response = await axios.get(`http://${strings.localhost}/api/goalSetting/getByEmployeeAndYearDetailForReview?employeeId=${responseId}&year=${currentYear}`);
                    setGoalFeedbacks(response.data);
                } catch (error) {
                    console.error('Error fetching goal feedbacks:', error);
                }
            };

            const fetchKpiFeedbacks = async () => {
                try {
                    const response = await axios.get(`http://${strings.localhost}/api/kpi/getByEmployeeAndYearDetailForReview?employeeId=${responseId}&year=${currentYear}`);
                    setKpiFeedbacks(response.data);
                } catch (error) {
                    console.error('Error fetching KPI feedbacks:', error);
                }
            };

            fetchGoalFeedbacks();
            fetchKpiFeedbacks();
        }
    }, [responseId, currentYear]); // This ensures the data is always fetched for the right employee

    const sendOtp = async () => {
        setIsLoading(true);
        try {
            console.log("Sending OTP...");  // Debugging line
            await axios.post(`http://${strings.localhost}/api/appraisal/sendOtp/${responseId}/${employeeId}`);
            showToast('Otp sent successfully', 'success');
            setShowModal(false);
            setIsOtpModalVisible(true); // This should trigger the modal to show
            console.log("OTP Modal state updated:", isOtpModalVisible);  // Debugging line
            setIsLoading(false);
        } catch (error) {
            console.error('Error sending OTP', error);
            showToast('Error while sending otp', 'error');
            setIsLoading(false);
        }
    };
    const verifyOtp = async () => {
        setIsLoading(true);
        try {
            console.log("Verifying OTP...");  // Debugging line
            await axios.post(`http://${strings.localhost}/api/appraisal/verifyOtpAndUpdateStatus/${responseId}/${employeeId}?otp=${otp}`);
            showToast("Approved Successfully.", 'success');
            setIsOtpModalVisible(false);
        } catch (error) {
            console.error('Error verifying OTP:', error);
            showToast('OTP verification failed. Please try again.', 'error');
        }
        setIsLoading(false);
    };
    const getFeedbacksForItem = (itemId, type) => {
        let feedbackData = [];
        if (type === 'goal') {
            feedbackData = goalFeedbacks.filter(feedback => feedback.id === itemId);
        } else if (type === 'kpi') {
            feedbackData = kpiFeedbacks.filter(feedback => feedback.id === itemId);
        }
        return feedbackData;
    };
    // Handle clicking on a row
    const handleRowClick = (employeeId) => {
        const selectedEmployeeData = data.filter(item => item.employee && item.employee.id === employeeId);
        setSelectedItem(selectedEmployeeData);
        setShowModal(true);
    };


    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };
    const groupedData = data.reduce((acc, item) => {
        if (item.employee && item.employee.id) {
            const employeeId = item.employee.id;
            if (!acc[employeeId]) {
                acc[employeeId] = [];
            }
            acc[employeeId].push(item);
        }
        return acc;
    }, {});
    const renderStars = (rating, handleChangeRating) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                    <span
                        key={starIndex}
                        className={`star ${starIndex <= rating ? 'filled' : ''}`}
                        onClick={() => handleChangeRating(starIndex)}
                    >
                        &#9733;
                    </span>
                ))}
            </div>
        );
    };
    const handleManagerGoalRatingChange = (goalId, ratingValue) => {
        const updatedData = selectedItem.map(item => {
            if (item.employeeGoalSetting && item.id === goalId) {
                item.employeeManagerRating = ratingValue;
            }
            return item;
        });
        const updatedGoal = { id: goalId, employeeManagerRating: ratingValue };
        setUpdatedGoals(prevState => {
            const updated = [...prevState];
            const existingGoal = updated.find(goal => goal.id === goalId);
            if (existingGoal) {
                existingGoal.employeeManagerRating = ratingValue;
            } else {
                updated.push(updatedGoal);
            }
            return updated;
        });
        setSelectedItem(updatedData);
        console.log('updateddata', updatedData);

    };

    const handleManagerKpiRatingChange = (kpiId, ratingValue) => {
        const updatedData = selectedItem.map(item => {
            if (item.employeeKpiSetting && item.id === kpiId) {
                item.employeeManagerRating = ratingValue;
            }
            return item;
        });
        const updatedKpi = { id: kpiId, employeeManagerRating: ratingValue };
        setUpdatedKpis(prevState => {
            const updated = [...prevState];
            const existingKpi = updated.find(kpi => kpi.id === kpiId);
            if (existingKpi) {
                existingKpi.employeeManagerRating = ratingValue;
            } else {
                updated.push(updatedKpi);
            }
            return updated;
        });
        setSelectedItem(updatedData);
    };

    const handleViewClick2 = (employeeId) => {
        setSelectedItem(employeeId);
        setShowModal(true);
    };

    const handleUpdate = async () => {
        const updatedData = updatedGoals;
        const notesToSave = [];

        // Log the updated goals array to verify the changes
        console.log("Updated Goals Data:", updatedData);

        // Filter out the goals with updated notes and prepare data for saving
        const goalsToUpdate = updatedData.map(goal => {
            // If the goal has a rating change, we will include it for the update call
            if (goal.employeeManagerRating !== undefined || goal.selfOrManagerNote !== undefined) {
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
                    selfOrManagerNote: true,  // Set selfOrManagerNote as false for saving
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
            if (kpi.employeeManagerRating !== undefined) {
                // Create a new KPI object without the note field to pass to the updateMultiplekpis API
                const { note, ...kpiDataForUpdate } = kpi;  // Exclude the 'note'
                return kpiDataForUpdate;
            }
            return null;
        }).filter(kpi => kpi !== null); // Remove any null values

        // Log kpis that are being updated
        console.log('Kpis to update:', kpisToUpdate);

        // Check for notes
        updatedData.forEach(kpi => {
            console.log('Checking note for KPI id:', kpi.id, 'Note:', kpi.note); // Log the note directly
            if (kpi.note && kpi.note.trim() !== '') {
                console.log('Note found for kpi:', kpi.id, 'Note:', kpi.note);
                kpiNotesToSave.push({
                    note: kpi.note,
                    selfOrManagerNote: true,  // Set selfOrManagerNote as false for saving
                    appraisalKpi: { id: kpi.id }
                });
            } else {
                console.log('No note for kpi:', kpi.id);
            }
        });

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

    const editdropdownfeedback = (employeeId) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button
                        type='button'
                        onClick={() => handleViewClick2(employeeId)}
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    )

    const handleManagerNoteChange = (employeeId, noteValue) => {
        const updatedData = selectedItem.map(item => {
            if (item.employee && item.employee.id === employeeId) {
                item.managerNote = noteValue;
            }
            return item;
        });
        setSelectedItem(updatedData);
    };
    const handleNoteChange = (id, type, newNote) => {
        if (type === 'goal') {
            setGoals(goals.map(goal =>
                goal.id === id ? { ...goal, note: newNote } : goal
            ));

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
                console.log('Updated KPIs:', updated); // Log the updated KPIs state
                return updated;
            });
        }
    };


    return (
        <div className='coreContainer'>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <table className="interview-table" striped bordered hover>
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Employee Id</th>
                            <th>Employee Name</th>
                            <th>Appraisal Year</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(groupedData).length === 0 ? (
                            <tr>
                                <td colSpan="6" className='no-data1'>
                                    No data available.
                                </td>
                            </tr>
                        ) : (
                            Object.keys(groupedData).map((employeeId, index) => {
                                const employeeItems = groupedData[employeeId];
                                const employee = employeeItems[0].employee;
                                return (
                                    <tr key={employeeId} onClick={() => handleRowClick(employee.id)}>
                                        <td>{index + 1}</td>
                                        <td>{employee.employeeId}</td>
                                        <td>{`${employee.firstName} ${employee.lastName}`}</td>
                                        <td>{employeeItems[0].appraisalYear}</td>
                                        <td>{employeeItems[0].status ? 'Active' : 'Inactive'}</td>
                                        <td>{editdropdownfeedback(employee)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>

                </table>
            )}
            {showModal && selectedItem && selectedItem.length > 0 && selectedItem[0].employee && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <div className='title'>Employee Details</div>
                        {selectedItem[0].employee ? (
                            <div>
                                <div className="employee-container">
                                    <div className="profile-circle">
                                        {selectedItem[0].employee.profilePhoto ? (
                                            <img
                                                src={selectedItem[0].employee.profilePhoto}
                                                alt="Profile"
                                                className="profile-image"
                                            />
                                        ) : (
                                            selectedItem[0].employee.firstName
                                                ? selectedItem[0].employee.firstName.charAt(0).toUpperCase()
                                                : "?"
                                        )}
                                    </div>
                                    <div className="employee-details">
                                        <div className="left-column">
                                            <div className="detail-item"><strong>Employee ID:</strong> {selectedItem[0].employee.id}</div>
                                            <div className="detail-item"><strong>Designation:</strong>{selectedItem[0].employee.designation}</div>
                                            <div className="detail-item"><strong>Division:</strong> {selectedItem[0].employee.division}</div>
                                        </div>
                                        <div className="right-column">
                                            <div className="detail-item"><strong>Employee Name:</strong> {`${selectedItem[0].employee.firstName} ${selectedItem[0].employee.middleName} ${selectedItem[0].employee.lastName}`}</div>
                                            <div className="detail-item"><strong>Department:</strong>{selectedItem[0].employee.department}</div>
                                            <div className="detail-item"><strong>Joining Date:</strong>  {selectedItem[0].employee.joiningDate}</div>
                                        </div>
                                    </div>
                                </div>
                                <table className="Goal-table">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Goal/KPI</th>
                                            <th>Employee Rating</th>
                                            <th>Employee Notes</th>
                                            <th>Manager Rating</th>
                                            <th>Manager Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan={6} style={{ fontWeight: 'bold' }}>
                                                Employee Ratings Against Goals
                                            </td>
                                        </tr>
                                        {selectedItem.filter(item => item.type === 'goal').map((goal, index) => {
                                            const goalFeedbacksForItem = getFeedbacksForItem(goal.employeeGoalSetting.id, 'goal');
                                            return (
                                                <tr key={goal.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <ol>
                                                            <li>{goal.employeeGoalSetting.goal}</li>
                                                        </ol>
                                                        {goalFeedbacksForItem.length > 0 ? (
                                                            <ol start={1}>
                                                                {goalFeedbacksForItem[0].feedbacks.map((feedback, feedbackIndex) => (
                                                                    <div key={`feedback-${goal.employeeGoalSetting.id}-${feedbackIndex}`}>
                                                                        {`${feedbackIndex + 1 === 1 ? 'i)' : feedbackIndex + 1 === 2 ? 'ii)' : feedbackIndex + 1 === 3 ? 'iii)' : `${feedbackIndex + 1})`}`}
                                                                        {` feedback - ${feedback.note} Rating: ${feedback.rating}`}
                                                                    </div>
                                                                ))}
                                                            </ol>
                                                        ) : (
                                                            <ul>No feedback</ul>
                                                        )}
                                                    </td>
                                                    <td>{goal.employeeSelfRating}</td>
                                                    <td>
                                                        {goal.employeeNote || 'No notes available'}
                                                    </td>

                                                    <td>
                                                        {renderStars(
                                                            goal.employeeManagerRating || 0,
                                                            (rating) => handleManagerGoalRatingChange(goal.id, rating)
                                                        )}
                                                    </td>
                                                    <td>
                                                        <textarea
                                                            value={goal.note}
                                                            onChange={(e) => handleNoteChange(goal.id, 'goal', e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        <button className='btn' type='button' onClick={handleUpdate}>Save</button>

                                        <tr>
                                            <td colSpan={6} style={{ fontWeight: 'bold' }}>
                                                Employee Ratings Against KPIs
                                            </td>
                                        </tr>
                                        {selectedItem.filter(item => item.type === 'kpi').map((kpi, index) => {
                                            const kpiFeedbacksForItem = getFeedbacksForItem(kpi.employeeKpiSetting.id, 'kpi');
                                            return (
                                                <tr key={kpi.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <ol>
                                                            <li>{kpi.employeeKpiSetting.kpi}</li>
                                                        </ol>
                                                        {kpiFeedbacksForItem.length > 0 ? (
                                                            <div>
                                                                {kpiFeedbacksForItem[0].feedbacks.map((feedback, feedbackIndex) => (
                                                                    <ol key={`feedback-${kpi.employeeKpiSetting.id}-${feedbackIndex}`}>
                                                                        <div>
                                                                            {feedbackIndex + 1 === 1 ? 'i)' : feedbackIndex + 1 === 2 ? 'ii)' : feedbackIndex + 1 === 3 ? 'iii)' : `${feedbackIndex + 1})`}
                                                                            {` feedback - ${feedback.note} Rating: ${feedback.rating}`}
                                                                        </div>
                                                                    </ol>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div>No feedback available</div>
                                                        )}
                                                    </td>
                                                    <td>{kpi.employeeSelfRating}</td>
                                                    <td>
                                                        {kpi.employeeNote || 'No notes available'}
                                                    </td>

                                                    <td>
                                                        {renderStars(
                                                            kpi.employeeManagerRating || 0,
                                                            (rating) => handleManagerKpiRatingChange(kpi.id, rating)
                                                        )}
                                                    </td>
                                                    <td>
                                                        <textarea
                                                            value={kpi.note}
                                                            onChange={(e) => handleNoteChange(kpi.id, 'kpi', e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                            </div>
                        ) : (
                            <p>Loading employee details...</p>
                        )}
                        <div className='form-controls'>
                            <button className='btn' type='button' onClick={handleUpdateKpi}>Save</button>

                            <button
                                onClick={sendOtp}
                                className="btn"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Approving...' : 'Approve'}
                            </button>
                            <button type='button' className='outline-btn' onClick={handleCloseModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {isOtpModalVisible && (
                <div className="add-popup">
                    <div>
                        <h3 style={{ textAlign: 'center' }}>Enter OTP</h3>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                        />
                        <div className='form-controls'>
                            <button type='button' className='btn' onClick={verifyOtp} disabled={isLoading}>{isLoading ? 'Verifing...' : 'Verify'}</button>
                            {isLoading && <div className="loading-spinner"></div>}
                            <button type='button' className='outline-btn' onClick={() => setIsOtpModalVisible(false)}>Close</button> {/* Make sure you wrap this with a function */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AppraisalApprovalRequest;
