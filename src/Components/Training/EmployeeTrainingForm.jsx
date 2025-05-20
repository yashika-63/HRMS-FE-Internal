import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../string';
import { fetchDataByKey, showToast } from '../../Api.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faChalkboardTeacher, faLaptop, faCheckCircle } from '@fortawesome/free-solid-svg-icons'; // Import the check circle icon
import '../CommonCss/Training.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeTrainingForm = () => {
    const [selectedTrainings, setSelectedTrainings] = useState([]);
    const [loading, setLoading] = useState(false);
    const employeeId = localStorage.getItem('employeeId');
    const [formData, setFormData] = useState({
        reportingManager: { id: '', firstName: '', middleName: '', lastName: '' }
    });

    const [dropdownData, setDropdownData] = useState({
        employeeTraining: []
    });

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const Training = await fetchDataByKey('employeeTraining');
                setDropdownData({
                    employeeTraining: Training
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        const fetchReportingManager = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/employee-config/employee/${employeeId}`);
                const reportingManagerId = response.data[0]?.reportingManager?.id;
                setFormData(prevData => ({
                    ...prevData,
                    reportingManager: {
                        id: reportingManagerId,
                        firstName: response.data[0]?.reportingManager.firstName,
                        middleName: response.data[0]?.reportingManager.middleName,
                        lastName: response.data[0]?.reportingManager.lastName
                    }
                }));
            } catch (error) {
                console.error('Error fetching reporting manager:', error);
            }
        };

        if (employeeId) {
            fetchReportingManager();
        }
    }, [employeeId]);

    // Toggle card selection: Add or remove from selected list
    const handleCardSelect = (training) => {
        if (selectedTrainings.includes(training)) {
            // Remove the training from the selected list
            setSelectedTrainings((prevTrainings) => prevTrainings.filter(t => t !== training));
        } else {
            // Add the training to the selected list
            setSelectedTrainings((prevTrainings) => [...prevTrainings, training]);
        }
    };

    // Map training types to Font Awesome icons
    const getTrainingIcon = (training) => {
        switch (training) {
            case 'Leadership Training':
                return faChalkboardTeacher;
            case 'Tech Skills':
                return faLaptop;
            case 'Project Management':
                return faBook;
            default:
                return faBook; // Fallback icon
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        if (selectedTrainings.length === 0) {
            showToast('Please select at least one training.', 'warn');
            setLoading(false);
            return;
        }

        const payload = selectedTrainings.map(training => ({
            training,
            reportingmanagerId: formData.reportingManager.id
        }));

        try {
            const response = await axios.post(`http://${strings.localhost}/api/training/save/${employeeId}`, payload);
            if (response.data) {
                showToast('Saved successfully', 'success');
            } else {
                showToast(response.data, 'error');
            }
            setSelectedTrainings([]);
        } catch (error) {
            console.error('Error saving training data:', error);
            showToast('Error while saving training list', 'error');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className='employeeTrainingform'>
            {/* <div className='form-title'>Schedule Your Trainings</div> */}
            <div className='middleline-btn'>
                <div className='year-select'>
                    <span className="required-marker">*</span>
                    <label htmlFor="reportingManager">Reporting Manager</label>
                    <input
                        type="text"
                        id="reportingManager"
                        name="reportingManager"
                        value={`${formData.reportingManager.firstName || ''} ${formData.reportingManager.middleName || ''} ${formData.reportingManager.lastName || ''}`}
                        readOnly
                        required
                        className='readonly'
                    />
                </div>
            </div>

            <div className="trainnigcard-container">
                {/* <h4 className='underlineText' style={{textAlign:'center'}}>Available Trainings</h4> */}
                <div className="trainnigcards-wrapper">
                    {dropdownData.employeeTraining && dropdownData.employeeTraining.length > 0 ? (
                        dropdownData.employeeTraining.map(option => (
                            <div
                                key={option.masterId}
                                className={`training-trainnigcard ${selectedTrainings.includes(option.data) ? 'selected' : ''}`}
                                onClick={() => handleCardSelect(option.data)}
                            >
                                <div className="trainnigcard-icon">
                                    <FontAwesomeIcon icon={getTrainingIcon(option.data)} size="2x" />
                                </div>
                                <div className="trainnigcard-content">
                                    <h5>{option.data}</h5>
                                    {/* <p>{`Description: ${option.description || 'No description available.'}`}</p> */}
                                </div>
                                {selectedTrainings.includes(option.data) && (
                                    <div className="check-icon">
                                        <FontAwesomeIcon icon={faCheckCircle} size="2x" />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No trainings available.</p>
                    )}
                </div>
            </div>
            {dropdownData.employeeTraining.length > 0 && (
                <div className='form-controls'>
                    <button type="button" className='btn' onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmployeeTrainingForm;
