import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { strings } from '../../string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import '../CommonCss/Training.css';

const ManagerViewOfTraining = () => {
    const [trainings, setTrainings] = useState([]);
    const [updatedTrainings, setUpdatedTrainings] = useState([]);
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

    return (
        <div className="coreContainer">
            <div className='training-grid-container'>
                {trainings.map(training => (
                    <div key={training.id} className="trainingviewcard-grid">
                        <div className='trainingviewcard'>
                            <div className="trainingviewcard-header">
                                <FontAwesomeIcon icon={faBook} className="trainingviewcard-icon" />

                            </div>
                            <div className="trainingviewcard-body">
                                <p><strong>Training:</strong> {training.training}</p>
                                <p><strong>Issued Date:</strong> {training.date}</p>
                                <p><strong>Assigned To:</strong> {`${training.employee.firstName} ${training.employee.middleName} ${training.employee.lastName}`}</p>
                                <p> <strong>Manager Approval:</strong>
                                    {training.managerApproval ? ' Approved' : ' Not Approved'}
                                </p>
                                <p className={training.percentageComplete >= 95 && training.percentageComplete <= 100 ? 'approved' : ''}>
                                    <strong>percentageComplete :</strong> {training.percentageComplete}
                                </p>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagerViewOfTraining;