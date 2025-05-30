<<<<<<< HEAD
=======
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { strings } from '../../string';
// import { fetchDataByKey, showToast } from '../../Api.jsx';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBook, faChalkboardTeacher, faLaptop, faCheckCircle } from '@fortawesome/free-solid-svg-icons'; // Import the check circle icon
// import '../CommonCss/Training.css';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const EmployeeTrainingForm = () => {
//     const [selectedTrainings, setSelectedTrainings] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const employeeId = localStorage.getItem('employeeId');
//     const [formData, setFormData] = useState({
//         reportingManager: { id: '', firstName: '', middleName: '', lastName: '' }
//     });

//     const [dropdownData, setDropdownData] = useState({
//         employeeTraining: []
//     });

//     useEffect(() => {
//         const fetchDropdownData = async () => {
//             try {
//                 const Training = await fetchDataByKey('employeeTraining');
//                 setDropdownData({
//                     employeeTraining: Training
//                 });
//             } catch (error) {
//                 console.error('Error fetching dropdown data:', error);
//             }
//         };
//         fetchDropdownData();
//     }, []);

//     useEffect(() => {
//         const fetchReportingManager = async () => {
//             try {
//                 const response = await axios.get(`http://${strings.localhost}/api/employee-config/employee/${employeeId}`);
//                 const reportingManagerId = response.data[0]?.reportingManager?.id;
//                 setFormData(prevData => ({
//                     ...prevData,
//                     reportingManager: {
//                         id: reportingManagerId,
//                         firstName: response.data[0]?.reportingManager.firstName,
//                         middleName: response.data[0]?.reportingManager.middleName,
//                         lastName: response.data[0]?.reportingManager.lastName
//                     }
//                 }));
//             } catch (error) {
//                 console.error('Error fetching reporting manager:', error);
//             }
//         };

//         if (employeeId) {
//             fetchReportingManager();
//         }
//     }, [employeeId]);

//     // Toggle card selection: Add or remove from selected list
//     const handleCardSelect = (training) => {
//         if (selectedTrainings.includes(training)) {
//             // Remove the training from the selected list
//             setSelectedTrainings((prevTrainings) => prevTrainings.filter(t => t !== training));
//         } else {
//             // Add the training to the selected list
//             setSelectedTrainings((prevTrainings) => [...prevTrainings, training]);
//         }
//     };

//     // Map training types to Font Awesome icons
//     const getTrainingIcon = (training) => {
//         switch (training) {
//             case 'Leadership Training':
//                 return faChalkboardTeacher;
//             case 'Tech Skills':
//                 return faLaptop;
//             case 'Project Management':
//                 return faBook;
//             default:
//                 return faBook; // Fallback icon
//         }
//     };

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         setLoading(true);
//         if (selectedTrainings.length === 0) {
//             showToast('Please select at least one training.', 'warn');
//             setLoading(false);
//             return;
//         }

//         const payload = selectedTrainings.map(training => ({
//             training,
//             reportingmanagerId: formData.reportingManager.id
//         }));

//         try {
//             const response = await axios.post(`http://${strings.localhost}/api/training/save/${employeeId}`, payload);
//             if (response.data) {
//                 showToast('Saved successfully', 'success');
//             } else {
//                 showToast(response.data, 'error');
//             }
//             setSelectedTrainings([]);
//         } catch (error) {
//             console.error('Error saving training data:', error);
//             showToast('Error while saving training list', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };


//     return (
//         <div className='employeeTrainingform'>
//             {/* <div className='form-title'>Schedule Your Trainings</div> */}
//             <div className='middleline-btn'>
//                 <div className='year-select'>
//                     <span className="required-marker">*</span>
//                     <label htmlFor="reportingManager">Reporting Manager</label>
//                     <input
//                         type="text"
//                         id="reportingManager"
//                         name="reportingManager"
//                         value={`${formData.reportingManager.firstName || ''} ${formData.reportingManager.middleName || ''} ${formData.reportingManager.lastName || ''}`}
//                         readOnly
//                         required
//                         className='readonly'
//                     />
//                 </div>
//             </div>

//             <div className="trainnigcard-container">
//                 {/* <h4 className='underlineText' style={{textAlign:'center'}}>Available Trainings</h4> */}
//                 <div className="trainnigcards-wrapper">
//                     {dropdownData.employeeTraining && dropdownData.employeeTraining.length > 0 ? (
//                         dropdownData.employeeTraining.map(option => (
//                             <div
//                                 key={option.masterId}
//                                 className={`training-trainnigcard ${selectedTrainings.includes(option.data) ? 'selected' : ''}`}
//                                 onClick={() => handleCardSelect(option.data)}
//                             >
//                                 <div className="trainnigcard-icon">
//                                     <FontAwesomeIcon icon={getTrainingIcon(option.data)} size="2x" />
//                                 </div>
//                                 <div className="trainnigcard-content">
//                                     <h5>{option.data}</h5>
//                                     {/* <p>{`Description: ${option.description || 'No description available.'}`}</p> */}
//                                 </div>
//                                 {selectedTrainings.includes(option.data) && (
//                                     <div className="check-icon">
//                                         <FontAwesomeIcon icon={faCheckCircle} size="2x" />
//                                     </div>
//                                 )}
//                             </div>
//                         ))
//                     ) : (
//                         <p>No trainings available.</p>
//                     )}
//                 </div>
//             </div>
//             {dropdownData.employeeTraining.length > 0 && (
//                 <div className='form-controls'>
//                     <button type="button" className='btn' onClick={handleSubmit} disabled={loading}>
//                         {loading ? 'Saving...' : 'Save'}
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default EmployeeTrainingForm;
































>>>>>>> 8a5f66f (merging code)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../string';
import { fetchDataByKey, showToast } from '../../Api.jsx';
<<<<<<< HEAD
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faChalkboardTeacher, faLaptop, faCheckCircle } from '@fortawesome/free-solid-svg-icons'; // Import the check circle icon
import '../CommonCss/Training.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeTrainingForm = () => {
    const [selectedTrainings, setSelectedTrainings] = useState([]);
=======
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../CommonCss/Training.css';

const EmployeeTrainingForm = () => {
    const [selectedTraining, setSelectedTraining] = useState('');
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
>>>>>>> 8a5f66f (merging code)
    const [loading, setLoading] = useState(false);
    const employeeId = localStorage.getItem('employeeId');
    const [formData, setFormData] = useState({
        reportingManager: { id: '', firstName: '', middleName: '', lastName: '' }
    });

    const [dropdownData, setDropdownData] = useState({
        employeeTraining: []
    });

<<<<<<< HEAD
=======
    // Fetch available trainings from the API
>>>>>>> 8a5f66f (merging code)
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

<<<<<<< HEAD
=======
    // Fetch reporting manager info
>>>>>>> 8a5f66f (merging code)
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

<<<<<<< HEAD
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
=======
    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        // Validation check: ensure all fields are filled
        if (!selectedTraining || !time || !date || !reason) {
            showToast('Please fill all the fields.', 'warn');
>>>>>>> 8a5f66f (merging code)
            setLoading(false);
            return;
        }

<<<<<<< HEAD
        const payload = selectedTrainings.map(training => ({
            training,
            reportingmanagerId: formData.reportingManager.id
        }));
=======
        const payload = {
            training: selectedTraining,
            time,
            date,
            reason,
            reportingmanagerId: formData.reportingManager.id
        };
>>>>>>> 8a5f66f (merging code)

        try {
            const response = await axios.post(`http://${strings.localhost}/api/training/save/${employeeId}`, payload);
            if (response.data) {
                showToast('Saved successfully', 'success');
<<<<<<< HEAD
            } else {
                showToast(response.data, 'error');
            }
            setSelectedTrainings([]);
        } catch (error) {
            console.error('Error saving training data:', error);
            showToast('Error while saving training list', 'error');
=======
                // Reset form after saving
                setSelectedTraining('');
                setTime('');
                setDate('');
                setReason('');
            } else {
                showToast(response.data, 'error');
            }
        } catch (error) {
            console.error('Error saving training data:', error);
            showToast('Error while saving training data', 'error');
>>>>>>> 8a5f66f (merging code)
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD

    return (
        <div className='employeeTrainingform'>
            {/* <div className='form-title'>Schedule Your Trainings</div> */}
            <div className='middleline-btn'>
                <div className='year-select'>
=======
    return (
        <div className="employeeTrainingform">
            <div className="middleline-btn">
                <div className="year-select">
>>>>>>> 8a5f66f (merging code)
                    <span className="required-marker">*</span>
                    <label htmlFor="reportingManager">Reporting Manager</label>
                    <input
                        type="text"
                        id="reportingManager"
                        name="reportingManager"
                        value={`${formData.reportingManager.firstName || ''} ${formData.reportingManager.middleName || ''} ${formData.reportingManager.lastName || ''}`}
                        readOnly
                        required
<<<<<<< HEAD
                        className='readonly'
=======
                        className="readonly"
>>>>>>> 8a5f66f (merging code)
                    />
                </div>
            </div>

<<<<<<< HEAD
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
=======
            <form onSubmit={handleSubmit}>
                <div>
                    <div className='input-row'>
                        <div>
                            <label htmlFor="training">Select Training</label>
                            <select
                                className='selectIM'
                                id="training"
                                value={selectedTraining}
                                onChange={(e) => setSelectedTraining(e.target.value)}
                                required
                            >
                                <option value="">Select a training</option>
                                {dropdownData.employeeTraining.map((option) => (
                                    <option key={option.masterId} value={option.data}>
                                        {option.data}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="time">Time</label>
                            <input
                                className='selectIM'
                                type="time"
                                id="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="date">Date</label>
                            <input
                                className='selectIM'
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="reason">Reason</label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-controls">
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </form>
>>>>>>> 8a5f66f (merging code)
        </div>
    );
};

export default EmployeeTrainingForm;
