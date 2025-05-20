
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../CommonCss/AddEmp.css'
import { strings } from '../../string';
import 'react-toastify/dist/ReactToastify.css';
import { fetchDataByKey , showToast } from '../../Api.jsx';
import '../CommonCss/Main.css';
import { toast } from 'react-toastify';

const EducationForm = () => {
  const [educations, setEducations] = useState([
    {
      id: '',
      institute: '',
      university: '',
      typeOfStudy: '',
      yearOfAddmisstion: '',
      yearOfPassing: '',
      score: '', // Unified score field
      scoreType: 'CGPA' // Default score type
    }
  ]);
  const { employeeId, id } = useParams(); // Retrieve employeeId from route parameters
  const navigate = useNavigate();
  const [dropdownError, setDropdownError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [educationToRemoveIndex, setEducationToRemoveIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [dropdownData, setDropdownData] = useState({
    typeOfStudy: []
  });
  
  const [errorMessages, setErrorMessages] = useState({
    yearOfPassingError: '',
    scoreError: '',
    formError: ''
  });

 
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
  }, []);

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

    // Handle year validation
    if (name === 'yearOfPassing' || name === 'yearOfAddmisstion') {
      if (!validateYearOfPassing(index)) {
        const yearError = 'Year of Passing cannot be before Year of Admission.';
        setErrorMessages(prevErrors => ({
          ...prevErrors,
          yearOfPassingError: yearError
        }));
        newEducations[index]['yearOfPassing'] = ''; // Clear yearOfPassing if invalid

        // Show toast immediately for year validation error

      } else {
        setErrorMessages(prevErrors => ({
          ...prevErrors,
          yearOfPassingError: ''
        }));
      }
    }

    setEducations(newEducations);
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
  
    // Check if the last education entry is valid
    const lastEntry = educations[educations.length - 1];
    
    // Check if any required fields are empty
    if (!lastEntry.institute || !lastEntry.university || !lastEntry.typeOfStudy || !lastEntry.yearOfAddmisstion || !lastEntry.yearOfPassing || !lastEntry.score) {
      isValid = false;
    }
  
    // If valid, add new education entry; otherwise, show warning message
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
          scoreType: 'CGPA' // Default score type for new entries
        }
      ]);
    } else {
      showToast('Please fill all required fields in the current education entry before adding more.','warn');
    }
  };
  

  // Function to trigger confirmation dialog
  const handleDelete = (index) => {
    setShowConfirmation(true);
    setEducationToRemoveIndex(index);  // Store the index of the employee to remove
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
    setLoading(true);

    const validEducations = educations.filter(education =>
      education.institute &&
      education.university &&
      education.typeOfStudy &&
      education.yearOfAddmisstion &&
      education.yearOfPassing &&
      education.score
    );
    if (validEducations.length === 0) {
      showToast('Please fill in all the required education details.','warn');
      return;
    }
    try {
      const response = await axios.post(`http://${strings.localhost}/education/saveForEmployee?employeeId=${id}`, validEducations, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Update state with response IDs if applicable
      const updatedEducations = validEducations.map((edu, index) => ({
        ...edu,
        id: response.data[index].id // Assuming response data includes IDs
      }));

      setEducations(updatedEducations);
      showToast('Education data saved successfully.','success');
      setTimeout(() => {
        navigate(`/EmployeeHistory/${id}`);
          }, 2000);
     
    } catch (error) {
      console.error('Error saving education data:', error);
      showToast(`Failed to save education data! ${error.message}`,'error');
    } finally {
      setLoading(false);
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

    // Check if the value is a valid number and is within the range of 0 to 100
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
      newEducations[index].score = currentScore ? `${currentScore.replace('%', '')}` : ''; // Append '%' if switching to Percentage
    } else if (value === 'CGPA' && currentScore.endsWith('%')) {
      newEducations[index].score = currentScore.replace('%', ''); // Remove '%' if switching to CGPA
    }

    newEducations[index].scoreType = value;
    setEducations(newEducations);
    setErrorMessages(prevErrors => ({
      ...prevErrors,
      scoreError: ''
    }));
  };
  const handleNext = () => {
    if (isDirty) {
      toast.warn('Please submit the form before navigating away.', {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      // If there are no unsaved changes, navigate to the next page
      setErrorMessages({}); // Reset error messages if needed
      navigate(`/EmployeeHistory/${id}`);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="coreContainer">
        <div className="box-container educational-info-box">
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
            </div>
          ))}
          {showConfirmation && (
            <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
              <p>Are you sure you want to delete this data?</p>
              <div className='btnContainer'>
                <button type='button' className='btn'
                  onClick={() => {
                    handleRemoveEducation(educationToRemoveIndex); // Remove the education
                    setShowConfirmation(false); // Hide confirmation dialog
                  }} > Yes </button>
                <button type='button' className='btn' onClick={() => setShowConfirmation(false)} > No </button>
              </div>
            </div>
          )}
          <div className='btnContainer'>
          
            <button type="button" className='outline-btn' onClick={() => navigate(`/AddEmp/${id}`)}> Previous</button>
            <button className='btn' type='submit'>Save Education</button>
            <button type="button" className='outline-btn' onClick={handleNext}> Next   </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default EducationForm;
