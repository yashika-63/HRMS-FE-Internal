
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CommonCss/AddEmp.css'
import { strings } from '../../string';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from '../../Api.jsx';
import '../CommonCss/Main.css';

const EducationDetails = ({ ticketDetails, nextStep, prevStep }) => {
    const [educations, setEducations] = useState([
        {
            id: '',
            institute: '',
            university: '',
            typeOfStudy: '',
            yearOfAddmisstion: '',
            yearOfPassing: '',
            score: '',
            scoreType: 'CGPA'
        }
    ]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [educationToRemoveIndex, setEducationToRemoveIndex] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [dirtyFlags, setDirtyFlags] = useState([]);
    const preLoginToken = localStorage.getItem("PreLoginToken");
    const [dropdownData, setDropdownData] = useState({
        typeOfStudy: []
    });
    const [errorMessages, setErrorMessages] = useState({
        yearOfPassingError: '',
        scoreError: '',
        formError: ''
    });

    const fetchDataByKey = async (keyvalue) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/master1/GetDataByKey/${keyvalue}`);
            if (response.data && Array.isArray(response.data)) {
                return response.data.map(item => ({
                    masterId: item.masterId,
                    data: item.data || ''
                }));
            }
            console.error(`Invalid data structure or empty response for ${keyvalue}`);
            return [];
        } catch (error) {
            console.error(`Error fetching data for ${keyvalue}:`, error);
            throw error;
        }
    };
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const typeOfStudy = await fetchDataByKey('typeOfStudy');
                setDropdownData({
                    typeOfStudy: typeOfStudy
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
        fetchEducationDetails();
    }, []);

    const fetchEducationDetails = async () => {
        try {
            const { id: verificationTicketId } = ticketDetails;
            const response = await axios.get(`http://${strings.localhost}/api/education/getByVerificationAndToken?verificationId=${verificationTicketId}&preLoginToken=${preLoginToken}`);
            if (response.data && response.data.length > 0) {
                setEducations(response.data);
                setDirtyFlags(Array(response.data.length).fill(false));
                setIsUpdate(true);
            } else {

                setEducations([{
                    institute: '',
                    university: '',
                    typeOfStudy: '',
                    yearOfAddmisstion: '',
                    yearOfPassing: '',
                    score: '',
                    scoreType: 'CGPA'
                }]);
                setDirtyFlags([false])
                setIsUpdate(false);
            }
        } catch (error) {
            console.error('Error fetching education details:', error);
            showToast('Failed to fetch education details.', 'error');
        }
    };

    const handleChange = (e, index) => {
        const { name, value } = e.target;
        const newEducations = [...educations];
        let errorMessage = '';
        if (name === 'score') {
            const scoreType = newEducations[index].scoreType;
            const cleanedValue = value.replace('', '').trim(); // Remove '%' and trim whitespace
            if (scoreType === 'CGPA') {
                errorMessage = validateCGPA(cleanedValue);
                newEducations[index].score = errorMessage ? '' : cleanedValue;
            } else if (scoreType === 'Percentage') {
                errorMessage = validatePercentage(cleanedValue);
                newEducations[index].score = errorMessage ? '' : `${cleanedValue}`;
            }
            setErrorMessages(prevErrors => ({
                ...prevErrors,
                scoreError: errorMessage
            }));

        } else {
            newEducations[index][name] = value;
        }

        if (name === 'yearOfPassing' || name === 'yearOfAddmisstion') {
            if (!validateYearOfPassing(index)) {
                const yearError = 'Year of Passing cannot be before Year of Admission.';
                setErrorMessages(prevErrors => ({
                    ...prevErrors,
                    yearOfPassingError: yearError
                }));
                newEducations[index]['yearOfPassing'] = '';

            } else {
                setErrorMessages(prevErrors => ({
                    ...prevErrors,
                    yearOfPassingError: ''
                }));
            }
        }

        setEducations(newEducations);
        if (isUpdate) {
            const updatedDirtyFlags = [...dirtyFlags];
            updatedDirtyFlags[index] = true;
            setDirtyFlags(updatedDirtyFlags);
        }
        setIsDirty(true);
    };

    const validateYearOfPassing = (index) => {
        const education = educations[index];
        if (education.yearOfPassing && education.yearOfAddmisstion) {
            return education.yearOfPassing >= education.yearOfAddmisstion;
        }
        return true;
    };

    const handleAddEducation = () => {
        let isValid = true;
        const lastEntry = educations[educations.length - 1];
        if (!lastEntry.institute || !lastEntry.university || !lastEntry.typeOfStudy || !lastEntry.yearOfAddmisstion || !lastEntry.yearOfPassing || !lastEntry.score) {
            isValid = false;
        }
        if (isValid) {
            setEducations(prevEducations => [
                ...prevEducations,
                {
                    institute: '',
                    university: '',
                    typeOfStudy: '',
                    yearOfAddmisstion: '',
                    yearOfPassing: '',
                    score: '',
                    scoreType: 'CGPA'
                }
            ]);
        } else {
            showToast('Please fill all required fields in the current education entry before adding more.', 'warn');
        }
    };

    const handleDelete = (index) => {
        setShowConfirmation(true);
        setEducationToRemoveIndex(index);
    };

    const handleRemoveEducation = (index) => {
        const newEducations = [...educations];
        newEducations.splice(index, 1);
        setEducations(newEducations);
    };

    const isEducationValid = (index) => {
        const education = educations[index];
        return education && education.institute && education.university && education.typeOfStudy &&
            education.yearOfAddmisstion && education.yearOfPassing;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Filter NEW records (no ID)
        const newEducations = educations.filter(edu =>
            !edu.id &&
            edu.institute &&
            edu.university &&
            edu.typeOfStudy &&
            edu.yearOfAddmisstion &&
            edu.yearOfPassing &&
            edu.score
        );

        // Filter UPDATED existing records (have ID and are dirty)
        const updatedEducations = educations.filter((edu, idx) =>
            edu.id &&
            dirtyFlags[idx] &&
            edu.institute &&
            edu.university &&
            edu.typeOfStudy &&
            edu.yearOfAddmisstion &&
            edu.yearOfPassing &&
            edu.score
        );

        if (newEducations.length === 0 && updatedEducations.length === 0) {
            showToast('No changes to save.', 'info');
            return;
        }

        try {
            // Save new entries (POST)
            if (newEducations.length > 0) {
                const { id: verificationTicketId } = ticketDetails;
                await axios.post(
                    `http://${strings.localhost}/api/education/saveByTokenAndTicket?preLoginToken=${preLoginToken}&verificationId=${verificationTicketId}`,
                    newEducations
                );
                showToast('New education records saved successfully.', 'success');
            }

            // Update changed entries (PUT each individually)
            for (let edu of updatedEducations) {
                await axios.put(
                    `http://${strings.localhost}/api/education/partial-update/${edu.id}`,
                    edu
                );
            }

            if (updatedEducations.length > 0) {
                showToast('Updated existing education records.', 'success');
            }

            nextStep();

        } catch (error) {
            console.error('Error saving/updating education records:', error);
            showToast('An error occurred while saving data.', 'error');
        }
    };



    const validateCGPA = (value) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 10) {
            return 'CGPA should be between 0 and 10.';
        }
        return '';
    };

    const validatePercentage = (value) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
            return 'Percentage should be between 0% and 100%.';
        }
        return '';
    };

    const handleScoreTypeChange = (e, index) => {
        const { value } = e.target;
        const newEducations = [...educations];
        const currentScore = newEducations[index].score;

        if (value === 'Percentage' && !currentScore.endsWith('%')) {
            newEducations[index].score = currentScore ? `${currentScore.replace('%', '')}` : '';
        } else if (value === 'CGPA' && currentScore.endsWith('%')) {
            newEducations[index].score = currentScore.replace('%', '');
        }
        newEducations[index].scoreType = value;
        setEducations(newEducations);
        setErrorMessages(prevErrors => ({
            ...prevErrors,
            scoreError: ''
        }));
    };
    const handleUpdateSingleRecord = async (index) => {
        const educationToUpdate = educations[index];
        // Optional: Validate data before sending
        if (!isEducationValid(index)) {
            showToast('Please fill in all required fields before updating.', 'warn');
            return;
        }
        try {
            const response = await axios.put(
                `http://${strings.localhost}/api/education/partial-update/${educationToUpdate.id}`,
                educationToUpdate,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            const message = response?.data?.message || 'Updated successfully.';
            showToast(message.split('successfully')[0] + 'successfully', 'success');
            const newDirtyFlags = [...dirtyFlags];
            newDirtyFlags[index] = false;
            setDirtyFlags(newDirtyFlags);

        } catch (error) {
            console.error('Error updating single record:', error);
            showToast('Failed to update record.', 'error');
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit} className="coreContainer">
                <div>
                    <h4 className='underlineText'>Educational Information</h4>
                    {educations.map((education, index) => (
                        <div key={index}>
                            {index === educations.length - 1 && (
                                <button
                                    type="button"
                                    className="circle-button add-more-btn"
                                    onClick={() => handleAddEducation('educations')}
                                >
                                    Add More
                                </button>
                            )}
                            <div className='input-row'>
                                <div className="input-wrapper">
                                    <span className="required-marker">*</span>
                                    <label htmlFor="institute">Institute</label>
                                    <input
                                        type="text"
                                        id="institute"
                                        name="institute"
                                        value={education.institute}
                                        onChange={(e) => handleChange(e, index)}
                                        required
                                    />
                                </div>
                                <div className="input-wrapper">
                                    <span className="required-marker">*</span>
                                    <label htmlFor="university">University</label>
                                    <input
                                        type="text"
                                        id="university"
                                        name="university"
                                        value={education.university}
                                        onChange={(e) => handleChange(e, index)}
                                        required
                                    />
                                </div>
                                <div className="input-wrapper">
                                    <span className="required-marker">*</span>
                                    <label htmlFor="typeOfStudy">Select Degree</label>
                                    <select
                                        className='selectIM'
                                        id="typeOfStudy"
                                        name="typeOfStudy"
                                        value={education.typeOfStudy}
                                        onChange={(e) => handleChange(e, index)}
                                        required
                                    >
                                        <option value="" disabled hidden></option>
                                        {dropdownData.typeOfStudy && dropdownData.typeOfStudy.length > 0 ? (
                                            dropdownData.typeOfStudy.map(option => (
                                                <option key={option.masterId} value={option.data}>
                                                    {option.data}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Degree Not available</option>
                                        )}
                                    </select>
                                </div>
                                <div className="input-wrapper">
                                    <span className="required-marker">*</span>
                                    <label htmlFor="branch">Field</label>
                                    <input
                                        type="text"
                                        id="branch"
                                        name="branch"
                                        value={education.branch}
                                        onChange={(e) => handleChange(e, index)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='input-row'>
                                <div className="input-wrapper">
                                    <span className="required-marker">*</span>
                                    <label htmlFor="yearOfAddmisstion">Year of Admission</label>
                                    <select
                                        className='selectIM'
                                        id="yearOfAddmisstion"
                                        name='yearOfAddmisstion'
                                        value={education.yearOfAddmisstion}
                                        onChange={(e) => handleChange(e, index)}
                                        required
                                    >
                                        <option value="" disabled hidden></option>
                                        {Array.from({ length: 51 }, (_, i) => {
                                            const year = new Date().getFullYear() - i;
                                            return (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="input-wrapper">
                                    <span className="required-marker">*</span>
                                    <label htmlFor="yearOfPassing">Year of Passing</label>
                                    <select
                                        className='selectIM'
                                        id='yearOfPassing'
                                        name='yearOfPassing'
                                        value={education.yearOfPassing}
                                        onChange={(e) => handleChange(e, index)}
                                        required
                                    >
                                        <option value="" disabled hidden></option>
                                        {Array.from({ length: 53 }, (_, i) => {
                                            const year = new Date().getFullYear() - 50 + i;
                                            return (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {errorMessages.yearOfPassingError && (
                                        <div className="error-message">{errorMessages.yearOfPassingError}</div>
                                    )}
                                </div>
                                <div className='input-wrapper' style={{ marginTop: '1.5%', height: '96%' }}>
                                    <div>
                                        <span className="required-marker">*</span>
                                        <label htmlFor="scoreType">Score</label>
                                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', outline: 'none' }}>
                                            <select
                                                className='selectIM'
                                                id="scoreType"
                                                name="scoreType"
                                                value={education.scoreType}
                                                onChange={(e) => handleScoreTypeChange(e, index)}
                                                style={{
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    fontSize: 'inherit',
                                                    paddingRight: '10px',
                                                    paddingLeft: '10px',
                                                    width: '100px',
                                                    flexGrow: 1,
                                                    margin: '0'
                                                }}
                                                required
                                            >
                                                <option value="CGPA">CGPA</option>
                                                <option value="Percentage">Percentage</option>
                                            </select>
                                            <input
                                                name="score"
                                                value={education.score}
                                                onChange={(e) => handleChange(e, index)}
                                                required
                                                placeholder={education.scoreType === 'Percentage' ? 'Enter Percentage' : 'Enter CGPA (0-10)'}
                                                style={{
                                                    border: 'none',
                                                    fontSize: 'inherit',
                                                    paddingLeft: '10px',
                                                    flexGrow: 2,
                                                    outline: 'none'
                                                }}
                                            />
                                            {education.scoreType === 'Percentage' && <span style={{ paddingRight: '10px' }}></span>}
                                        </div>
                                        {errorMessages.scoreError && (
                                            <div className="error-message">{errorMessages.scoreError}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {index > 0 && (
                                <button
                                    type="button" className="circle-button red-btn"
                                    onClick={() => handleDelete(index)}
                                > Remove </button>
                            )}
                            {isUpdate && education.id && (
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => handleUpdateSingleRecord(index)}
                                    disabled={!dirtyFlags[index]}>
                                    Update
                                </button>
                            )}
                        </div>
                    ))}
                    {showConfirmation && (
                        <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
                            <p>Are you sure you want to delete this data?</p>
                            <div className='btnContainer'>
                                <button type='button' className='btn'
                                    onClick={() => {
                                        handleRemoveEducation(educationToRemoveIndex);
                                        setShowConfirmation(false);
                                    }} > Yes </button>
                                <button type='button' className='btn' onClick={() => setShowConfirmation(false)} > No </button>
                            </div>
                        </div>
                    )}
                    <div className='btnContainer'>
                        {educations.some(edu => !edu.id) && (
                            <div className='btnContainer'>
                                <button type="submit" className="btn">
                                    Save & Next
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </form>
        </>
    );
};

export default EducationDetails;
