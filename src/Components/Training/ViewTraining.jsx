import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { showToast } from '../../Api.jsx';
import { strings } from '../../string';

const ViewTraining = () => {
    const [trainings, setTrainings] = useState([]);
    const [updatedTrainings, setUpdatedTrainings] = useState([]);  // Track updated progress
    const currentYear = new Date().getFullYear();
    const employeeId = localStorage.getItem('employeeId');

    const fetchTrainings = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/training/by-employee/${employeeId}/year/${currentYear}`);
            const updatedTrainings = response.data.map(training => ({
                ...training,
                progress: training.percentageComplete ?? 0 // Use percentageComplete from API for progress
            }));
            setTrainings(updatedTrainings);
            setUpdatedTrainings(updatedTrainings);  // Initialize updated trainings
        } catch (error) {
            console.error('Error fetching trainings:', error);
        }
    };

    useEffect(() => {
        fetchTrainings();
    }, []);

    // Function to handle user clicks on progress bar
    const handleProgressClick = (e, trainingId) => {
        const bar = e.currentTarget;
        const clickPosition = e.clientX - bar.getBoundingClientRect().left;
        const barWidth = bar.clientWidth;
        let newProgress = Math.round((clickPosition / barWidth) * 100);

        // Ensure progress stays between 0% and 100%
        newProgress = Math.max(0, Math.min(newProgress, 100));

        // If progress is between 95 and 100, set it to 100%
        if (newProgress >= 95) newProgress = 100;

        // Determine manager approval based on progress percentage
        const status = newProgress >= 95;

        // Update the UI state with the new progress
        setUpdatedTrainings(prevTrainings =>
            prevTrainings.map(training =>
                training.id === trainingId ? { ...training, progress: newProgress, status } : training
            )
        );
    };

    // Function to handle updating the progress data
    const handleUpdateClick = async () => {
        try {
            // Filter out trainings that have not been modified (where progress hasn't changed)
            const modifiedTrainings = updatedTrainings.filter(training => {
                const originalTraining = trainings.find(t => t.id === training.id);
                return originalTraining.progress !== training.progress; 
            });
    
            // If no progress has been updated, show a toast and return early
            if (modifiedTrainings.length === 0) {
                showToast("No changes detected.", 'info');
                return;
            }

            for (let training of modifiedTrainings) {
                await axios.put(`http://${strings.localhost}/api/training/update/${training.id}`, {
                    // status: training.progress >= 95, 
                    percentageComplete: training.progress  
                });
            }

            showToast("Updated Successfully", 'success');
            fetchTrainings();
            console.log('Only modified progress updates sent successfully!');
        } catch (error) {
            console.error('Error updating progress:', error);
            showToast("Error while updating", 'error');
        }
    };

    return (
        <div className="coreContainer">
            {/* <div className="form-title">Employee Trainings</div> */}

            {updatedTrainings.length === 0 ? (
                <div className="error-message">No trainings available.</div>
            ) : (
                <div className="trainings-list">
                    {updatedTrainings.map(training => (
                        <div key={training.id} className="training-item">
                            <div className="training-left">
                                <p><strong>Training:</strong> {training.training}</p>
                                <p><strong>Issued Date:</strong> {training.date}</p>
                                <p><strong>Assigned To:</strong> {`${training.employee.firstName} ${training.employee.middleName} ${training.employee.lastName}`}</p>
                            </div>

                            <div className="training-right">
                                <p className="manager-approval">
                                    <strong>Manager Approval:</strong>
                                    {training.managerApproval ? ' Approved' : ' Not Approved'}
                                </p>
                                <div
                                    className={`progress-container ${!training.managerApproval ? 'disabled' : ''}`}  
                                    onClick={(e) => training.managerApproval && handleProgressClick(e, training.id)} 
                                >
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${training.progress}%` }}
                                        >
                                            {training.progress < 100 ? (
                                                <>
                                                    <span className="progress-plane">🎓</span>
                                                    <span className="progress-label">{training.progress}%</span>
                                                </>
                                            ) : (
                                                <span className="progress-complete">✔️</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className='form-controls'>
                <button 
                    type='button' 
                    className="btn" 
                    onClick={handleUpdateClick} 
                    disabled={updatedTrainings.length === 0}  
                >
                    Update Progress
                </button>
            </div>
        </div>
    );
};

export default ViewTraining;
