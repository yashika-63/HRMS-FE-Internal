import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { strings } from '../../string';
import moment from 'moment';
import { toast } from 'react-toastify';
import ViewDocuments from '../Documents/ViewDocuments';
import { showToast } from '../../Api.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBank, faBook, faFileAlt, faHistory, faInfo, faTicket } from '@fortawesome/free-solid-svg-icons';
const UpdateEmp = () => {

  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    middleName: '',
    motherName: '',
    gender: '',
    nationality: '',
    contactNo: '',
    contactNoCountryCode: '',
    alternateContactNoCountryCode: '',
    email: '',
    designation: '',
    companyRole: '',
    alternateContactNo: '',
    panNo: '',
    adhaarNo: '',
    department: '',
    joiningDate: '',
    completionDate: '',
    technologies: '',
    industry: '',
    role: '',
    officeLocation: '',
    exitDate: null,
    dateOfBirth: '',
    experience: '',
    presence: '',
    resign: '',
    priorId: '',
    employeeType: '',
    division: '',
    maritalStatus: '',
    educationalDetails: [{}],
    employeeDetails: [{}],
    currentAddress: {
      currentHouseNo: '',
      currentStreet: '',
      currentCity: '',
      currentState: '',
      currentPostelcode: '',
      currentCountry: '',
    },
    permanentAddress: {
      permanentHouseNo: '',
      permanentStreet: '',
      permanentCity: '',
      permanentState: '',
      permanentPostelcode: '',
      permanentCountry: ''
    }
  });
  const updatedRegisterData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    middleName: formData.middleName,
    email: formData.email,
    companyRole: formData.designation,
    department: formData.department,
    division: formData.division,
  };

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
  const [employeeDetails, setEmployeeDetails] = useState([
    {
      id: '',
      companyName: '',
      jobRole: '',
      responsibilities: '',
      startDate: '',
      endDate: '',
      latestCtc: '',
      currency: '',
      jobDuration: '',
      supervisorContact: '',
      reasonOfLeaving: '',
      achievements: '',
      employeementType: '',
      location: '',
      industry: '',
      companySize: '',
      Documents: '',
      BackgroundVerification: '',
      enddesignation: '',
      startdesignation: '',
      latestMonthGross: '',
    }
  ]);
  const [bankDetails, setBankDetails] = useState([
    {
      bankName: '',
      bankBranch: '',
      accountHolderName: '',
      accountNumber: '',
      bankCode: '',
      branchCode: '',
      branchAdress: '',
      accountType: '',
      accountifscCode: '',
      linkedContactNo: '',
      linkedEmail: ''
    }
  ]);
  const { id } = useParams();
  const [alternateContactNoError, setAlternateContactNoError] = useState('');
  const [alternateEmailError, SetAlternateEmailError] = useState('');
  const [updateId, setUpdateId] = useState(null); // Store the ID for updating
  const [updateEmpId, setEmpId] = useState(null);
  const [selectedEducationId, setSelectedEducationId] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [dateErrors, setDateErrors] = useState({});
  const [experienceError, setExperienceError] = useState('');
  const [panNoError, setPanNoError] = useState('');
  const [adhaarNoError, setAdhaarNoError] = useState('');
  const [mobnoError, setMobnoError] = useState('');
  const [countries, setCountries] = useState([]);
  const [permanentStates, setPermanentStates] = useState([]);
  const [permanentCities, setPermanentCities] = useState([]);
  const [currentStates, setCurrentStates] = useState([]);
  const [currentCities, setCurrentCities] = useState([]);
  const [openSection, setOpenSection] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [educationToRemoveIndex, setEducationToRemoveIndex] = useState(null);
  const [employeeToRemoveIndex, setEmployeeToRemoveIndex] = useState(null);
  const [dropdownError, setDropdownError] = useState('');
  const [joiningDateError, setJoiningDateError] = useState('');
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const [permanentPostcodeError, setPermanentPostcodeError] = useState("");
  const [currentPostcodeError, setCurrentPostcodeError] = useState("");
  const navigate = useNavigate();


  const [dropdownData, setDropdownData] = useState({
    gender: [],
    employeestatus: [],
    resign: [],
    employeetype: [],
    designation: [],
    department: [],
    nationality: [],
    typeOfStudy: [],
    maritalstatus: [],
    coun_code: [],
    division: [],
    technologies: []
  });

  const handledateChange = (date, dateString) => {
    setFormData({ ...formData, actualStartDate: dateString });
    setFormData({ ...formData, expectedEndDate: dateString });
    setFormData({ ...formData, startDate: dateString });
    setFormData({ ...formData, endDate: dateString });
  };

  useEffect(() => {
    fetchemployeeId();
    fetchEducationById();
    fetchDropdownData();
    fetchBankDetails();
    fetchHistoryById();
  }, [id]);

  const fetchemployeeId = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
    }
  };

  const fetchEducationById = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/education/getByEmployeeId/${id}`);
      if (Array.isArray(response.data)) {
        // Add isSaved property to each education record
        const updatedEducations = response.data.map(education => ({
          ...education,
          isSaved: true  // Mark existing records as saved
        }));
        setEducations(updatedEducations);  // Store all education records with their IDs
      } else {
        console.warn('Unexpected data format');
        setEducations([]);  // Clear the list if data format is unexpected
      }
    } catch (error) {
      console.error('Error fetching educational details:', error);
      setEducations([]);  // Handle errors by clearing the list
    }
  };
  const handleSelectEducation = (id) => {
    setSelectedEducationId(id);
  };

  const fetchHistoryById = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/employeement-history/getByEmployeeId/${id}`);
      if (Array.isArray(response.data)) {
        // Map over the response data to include isSaved property
        const updatedDetails = response.data.map(detail => ({
          ...detail,
          isSaved: true // Set isSaved to true for fetched records
        }));
        setEmployeeDetails(updatedDetails); // Store all employment records with their IDs
      } else {
        console.warn('Unexpected data format');
        setEmployeeDetails([]); // Clear the list if data format is unexpected
      }
    } catch (error) {
      console.error('Error fetching employment details:', error);
      setEmployeeDetails([]); // Handle errors by clearing the list
    }
  };


  const handleHistory = (index, e, fieldType) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };

    if (name === 'latestCtc' || name === 'latestMonthGross') {
      if (!/^\d+(\.\d+)?$/.test(value)) {
        newErrors[name] = `${name.replace(/([A-Z])/g, ' $1')} must be a positive number`;
      } else {
        delete newErrors[name];
      }
    }

    if (fieldType === 'employeeDetails') {
      const newEmployeeDetails = [...employeeDetails];
      newEmployeeDetails[index][name] = value;
      setEmployeeDetails(newEmployeeDetails);
    }

    setErrors(newErrors);
  };

  const handledate = (date, name, index, fieldType) => {
    if (!date) return;

    const formattedDateForSave = convertToDisplayFormat(date);

    if (fieldType === 'employeeDetails') {
      const newEmployeeDetails = [...employeeDetails];
      newEmployeeDetails[index][name] = formattedDateForSave;

      if ((name === 'startDate' || name === 'endDate')) {
        const startDate = new Date(convertToDateInputFormat(newEmployeeDetails[index].startDate));
        const endDate = new Date(convertToDateInputFormat(newEmployeeDetails[index].endDate));

        // Validate end date
        if (name === 'endDate') {
          // Check if end date is before start date
          if (startDate && endDate && startDate > endDate) {
            showToast('End date cannot be before start date', 'warn');
            newEmployeeDetails[index][name] = '';
          }

          const today = new Date();
          if (endDate > today) {
            showToast('End date cannot be a future date', 'warn');
            newEmployeeDetails[index][name] = '';
          }
        }
        if (newEmployeeDetails[index].startDate && newEmployeeDetails[index].endDate) {
          newEmployeeDetails[index].jobDuration = calculateJobDuration(
            newEmployeeDetails[index].startDate,
            newEmployeeDetails[index].endDate
          );
        }
      }

      setEmployeeDetails(newEmployeeDetails);
    }
  };

  const convertToDateInputFormat = (date) => {
    if (!date) return ''; // Return empty string if date is null or undefined
    const parts = date.split('-');
    if (parts.length !== 3) return ''; // Return empty string if format is not correct
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`; // Convert "dd-mm-yyyy" to "yyyy-mm-dd"
  };


  const convertToDisplayFormat = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;  // Convert "yyyy-mm-dd" to "dd-mm-yyyy"
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };


  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`); // Convert to "yyyy-mm-dd" format for Date object
  };

  const calculateJobDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '';

    // Parse the dates correctly
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth() + (years * 12);

    return `${Math.floor(months / 12)} years ${months % 12} months`;
  };


  // const handleHistorySubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     if (id) {
  //       // const educationToUpdate = educations.find(edu => edu.id === id);
  //       if (employeeDetails) {
  //         const token = localStorage.getItem("token");
  //         const response = await axios.put(`http://${strings.localhost}/api/employeement-history/update/${id}`, employeeDetails, {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             'Authorization': `Bearer ${token}`
  //           }

  //         });

  //         // setSelectedEducationId(id);
  //         console.log(response.data);

  //         alert('Education updated successfully!');
  //         navigate(`/BankDetails/${id}`);

  //         fetchHistoryById(); // Refresh the education records
  //       } else {
  //         alert('Selected education record not found.');
  //       }
  //     } else {
  //       alert('ID is missing. Cannot update Education.');
  //     }
  //   } catch (error) {
  //     console.error("Error updating Employee Education:", error);
  //     alert('Failed to update education. Please try again.');
  //   }
  // };

  const handleUpdateEntry = async (index) => {
    const detail = employeeDetails[index];
    const token = localStorage.getItem("token");

    try {
      // Perform the PUT request to update the specific employment history entry
      const response = await axios.put(
        `http://${strings.localhost}/api/employeement-history/update/${detail.id}`,
        detail,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Log the response and show success message
      console.log(response.data);
      showToast('Employment history updated successfully.', 'success');

      // Optionally fetch updated history
      fetchHistoryById();

    } catch (error) {
      console.error('Error updating employment data:', error);
      showToast('Failed to update employment data.', 'error');
    }
  };


  const fetchDropdownData = () => {
    const dropdownKeys = [
      'gender',
      'employeestatus',
      'resign',
      'employeetype',
      'designation',
      'department',
      'typeOfStudy',
      'maritalstatus',
      'AccountType',
      'CompanySize',
      'industry',
      'division',
      'technologies'
    ];

    dropdownKeys.forEach(key => {
      axios.get(`http://${strings.localhost}/api/master1/GetDataByKey/${key}`)
        .then(response => {
          if (response.data && Array.isArray(response.data)) {
            setDropdownData(prevData => ({
              ...prevData,
              [key]: response.data
            }));
            setDropdownError('');
          } else {
            setDropdownError(`Invalid data structure or empty response for ${key}`);
          }
        })
        .catch(error => {
          setDropdownError(`Error fetching data for ${key}`);
        });
    });
  };
  const fetchValueByKey = (keyvalue, content) => {
    axios.get(`http://${strings.localhost}/api/master/GetDataByKey/${keyvalue}`)
      .then(response => {
        // Ensure response.data is defined and not null
        if (response.data && Array.isArray(response.data)) {
          const dropdownContent = response.data.map(item => ({
            masterId: item.masterId,
            data: item.data || ''  // Handle null or undefined values gracefully
          }));

          // console.log("Dropdown Content:", dropdownContent);

          setDropdownData(prevData => ({
            ...prevData,
            [content]: dropdownContent
          }));

          setDropdownError('');
        } else {
          console.error(`Invalid data structure or empty response for ${keyvalue}`);
          setDropdownError(`Invalid data structure or empty response for ${keyvalue}`);
        }
      })
      .catch(error => {
        console.error(`Error fetching data for ${keyvalue}:`, error);
        setDropdownError(`Error fetching data for ${keyvalue}`);
      });
  };
  useEffect(() => {
    fetchValueByKey('nationality', 'nationality', 'hrmsmaster');
    fetchValueByKey('coun_code', 'coun_code', 'hrmsmaster');


  }, []);


  const handleAddEducation = () => {
    setEducations([
      ...educations,
      {
        institute: '',
        university: '',
        typeOfStudy: '',
        yearOfAdmission: '',
        yearOfPassing: '',
        score: '',
        scoreType: 'CGPA',
        isSaved: false
      }
    ]);
  };
  const handleTechnologiesChange = (selectedOptions) => {
    const selectedValues = Array.isArray(selectedOptions)
      ? selectedOptions.map(option => option.value)
      : [];
    setFormData({ ...formData, technologies: selectedValues });
  };

  const handleRemoveEducation = (index) => {
    setEducations(prevEducations => prevEducations.filter((_, i) => i !== index));
  };

  const handleDelete = (index) => {
    setShowConfirmation(true);
    setEducationToRemoveIndex(index);  // Store the index of the employee to remove
  };

  const handleDelete1 = (index) => {
    setShowConfirmation(true);
    setEmployeeToRemoveIndex(index); // Store the index of the employee to remove
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData) {
      setFormData(prevState => {
        const updatedState = { ...prevState, [name]: value };
        return updatedState;
      });
    } else {
      console.error(`Invalid field name: ${name}`);
    }
  };

  const handleScoreTypeChange = (e, index) => {
    const { value } = e.target;
    const newEducations = [...educations];
    const currentScore = newEducations[index].score;
    const scoreString = typeof currentScore === 'string' ? currentScore : '';

    // Update score format based on score type
    if (value === 'Percentage' && !scoreString.endsWith('%')) {
      newEducations[index].score = scoreString ? `${scoreString.replace('%', '')}%` : '';
    } else if (value === 'CGPA' && scoreString.endsWith('%')) {
      newEducations[index].score = scoreString.replace('%', '');
    }

    newEducations[index].scoreType = value;
    setEducations(newEducations);
    setErrorMessages(prevErrors => ({
      ...prevErrors,
      scoreError: ''
    }));
  };


  const handleEducation = (e, index) => {
    const { name, value } = e.target;
    const newEducations = [...educations];

    // Handle score input and validation
    if (name === 'score') {
      const numericValue = parseFloat(value);

      if (educations[index].scoreType === 'Percentage') {
        // Validate Percentage
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
          setErrorMessages(prevErrors => ({
            ...prevErrors,
            scoreError: 'Percentage must be a number between 0 and 100.'
          }));
          newEducations[index][name] = ''; // Clear score if invalid
        } else {
          setErrorMessages(prevErrors => ({
            ...prevErrors,
            scoreError: ''
          }));
          newEducations[index][name] = value; // Update score
        }
      } else if (educations[index].scoreType === 'CGPA') {
        // Validate CGPA
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 10) {
          setErrorMessages(prevErrors => ({
            ...prevErrors,
            scoreError: 'CGPA must be a number between 0 and 10.'
          }));
          newEducations[index][name] = ''; // Clear score if invalid
        } else {
          setErrorMessages(prevErrors => ({
            ...prevErrors,
            scoreError: ''
          }));
          newEducations[index][name] = value; // Update score
        }
      }
    } else {
      newEducations[index][name] = value; // Update other fields
    }

    // Handle year validation
    if (name === 'yearOfPassing' || name === 'yearOfAdmission') {
      if (!validateYearOfPassing(index)) {
        setErrorMessages(prevErrors => ({
          ...prevErrors,
          yearOfPassingError: 'Year of Passing cannot be before Year of Admission.'
        }));
        newEducations[index]['yearOfPassing'] = ''; // Clear yearOfPassing if invalid
      } else {
        setErrorMessages(prevErrors => ({
          ...prevErrors,
          yearOfPassingError: ''
        }));
      }
    }

    setEducations(newEducations); // Update educations state
  };


  const validateYearOfPassing = (index) => {
    const education = educations[index];
    if (education.yearOfPassing && education.yearOfAddmisstion) {
      return education.yearOfPassing >= education.yearOfAddmisstion;
    }
    return true;
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com)$/;
    return regex.test(email);
  };
  const validatePostalCode = (name, value) => {
    const regex = /^\d{6}$/; // Indian PIN code format
    if (!regex.test(value)) {
      if (name === 'permanentPostelcode') {
        setPermanentPostcodeError('Please enter a valid Indian PIN code (6 digits)');
      } else if (name === 'currentPostelcode') {
        setCurrentPostcodeError('Please enter a valid Indian PIN code (6 digits)');
      }
    } else {
      if (name === 'permanentPostelcode') {
        setPermanentPostcodeError('');
      } else if (name === 'currentPostelcode') {
        setCurrentPostcodeError('');
      }
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update the formData state
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (name === 'firstName' || name === 'middleName' || name === 'lastName' || name === 'motherName') {
      // Check if the input contains non-alphabetic characters
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: 'Only alphabetic characters are allowed.'
        }));
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: '' // Clear error if valid
        }));
      }
    }
    // Call validation functions based on the field name
    if (name === 'email') {
      if (!validateEmail(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }

    // Validate other fields
    if (name === 'experience') validateExperience(value);
    if (name === 'contactNo') validatemobno(value);
    if (name === 'panNo') validatePanNo(value);
    if (name === 'adhaarNo') validateAdhaarNo(value);
    if (name === 'alternateContactNo') validateAlternateContactNo(value);
    if (name === 'permanentPostelcode' || name === 'currentPostelcode') {
      validatePostalCode(name, value);
    }
    if (name === 'alternateEmail') {
      if (!validateEmail(value)) {
        SetAlternateEmailError('Please enter a valid alternate email address');
      } else {
        SetAlternateEmailError('');
      }
    }
  };


  const validateAlternateContactNo = (value) => {
    setAlternateContactNoError(!isNaN(value) && Number(value) >= 0 ? '' : 'Only positive numbers are allowed');
  };

  const validateAlternateEmail = (value) => {
    // Define the regex within the function
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com)$/;

    setEmailError(emailRegex.test(value) ? '' : 'Enter a valid email address.');
  };



  const validateExperience = (value) => {
    setExperienceError(!isNaN(value) ? '' : 'Only numbers are allowed');
  };

  const validatemobno = (value) => {
    // Check if the value is a number and not negative
    if (!isNaN(value) && Number(value) >= 0) {
      setMobnoError('');
    } else {
      setMobnoError('Only positive numbers are allowed');
    }
  };
  const validatePanNo = (value) => {
    if (value.trim() === '') {
      setPanNoError('');
    } else {
      const panRegex = /^[A-Z]{3}[ABCFGHLJPTF]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/;
      if (panRegex.test(value)) {
        setPanNoError('');
      } else {
        setPanNoError('Enter a valid PAN Number. Example: ABCDE1234F');
      }
    }
  };



  const validateAdhaarNo = (value) => {
    if (value.trim() === '') {
      setAdhaarNoError('');
    } else {
      const adhaarRegex = /^[0-9]{12}$/;
      if (adhaarRegex.test(value)) {
        setAdhaarNoError('');
      } else {
        setAdhaarNoError('Enter a valid Aadhar Number. It should be a 12-digit number.');
      }
    }
  };


  // const handleDateChange = (e, name) => {
  //   const { value } = e.target;
  //   // No formatting needed for input type="date"
  //   setFormData(prevFormData => ({
  //     ...prevFormData,
  //     [name]: value, // Store the date as 'YYYY-MM-DD'
  //   }));
  // };
  const handleDateChange = (event, name) => {
    const dateValue = event.target.value; // Get date string from input
    const formattedDate = dateValue ? moment(dateValue).format('DD-MM-YYYY') : '';

    if (name === 'dateOfBirth') {
      const age = calculateAge(dateValue);
      setFormData(prevData => ({
        ...prevData,
        [name]: formattedDate,
        age: age.toString()
      }));
    } else if (name === 'joiningDate') {
      // Ensure joining date is not before 2024
      if (moment(dateValue).year() < 2024) {
        setJoiningDateError("Joining date cannot be before the year 2024.");
        return; // Stop the function if the date is invalid
      } else {
        setJoiningDateError(''); // Clear error if date is valid
      }
      setFormData(prevData => ({
        ...prevData,
        [name]: formattedDate
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: formattedDate // Update other date fields in formData
      }));
    }
    setDateErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const formatDateForInput = (date) => {
    return date ? moment(date).format('YYYY-MM-DD') : ''; // Convert to 'YYYY-MM-DD' format
  };



  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (emailError) {
  //     alert('Please correct the Email before submitting.');
  //     return; // Exit if there are validation errors
  //   }
  //   try {
  //     await axios.put(`http://${strings.localhost}/employees/EmployeeUpdateById/${formData.id}`, formData);
  //     alert('Employee data updated successfully!');
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert('Failed to update employee data. Please try again.');
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are any pending errors before submitting
    if (
      emailError ||
      joiningDateError ||
      ageError ||
      errorMessages.scoreError ||
      errorMessages.yearOfPassingError ||
      errors.firstName ||
      errors.middleName ||
      errors.lastName ||
      errors.motherName ||
      experienceError ||
      mobnoError ||
      panNoError ||
      adhaarNoError ||
      alternateContactNoError ||
      alternateEmailError ||
      permanentPostcodeError ||
      currentPostcodeError
    ) {
      showToast('Please correct all errors before submitting.', 'warn');
      return; // Exit the function if there are errors
    }

    try {
      // Execute both API calls concurrently if no errors
      await Promise.all([
        axios.put(`http://${strings.localhost}/employees/EmployeeUpdateById/${formData.id}`, formData),
        axios.put(`http://${strings.localhost}/api/v1/user/update-by-employee/${formData.id}`, updatedRegisterData)
      ]);

      showToast('Employee data and registration updated successfully.', 'success');
    } catch (error) {
      console.error("Error:", error);
      showToast('User not registered.', 'error');
    }
  };


  // const handleupdate = async (updateEducationId, educationData) => {
  //   try {
  //     await axios.put(`http://${strings.localhost}/education/updateForEmployee/${updateEducationId}`, educationData, {
  //       headers: { 'Content-Type': 'application/json' }
  //     });
  //     alert('Education data updated successfully!');
  //   } catch (error) {
  //     console.error('Error:', error);
  //     alert('Failed to update education data!');
  //   }
  // };
  const handleupdate = async (id, updatedEducation) => {
    try {
      if (id) {
        const response = await axios.put(`http://${strings.localhost}/education/update/${id}`, updatedEducation, {
          headers: { 'Content-Type': 'application/json' }
        });

        showToast('Education updated successfully.', 'success');
        fetchEducationById(); // Refresh the education records
      } else {
        showToast('ID is missing. Cannot update Education.', 'error');
      }
    } catch (error) {
      console.error("Error updating Employee Education:", error);
      showToast('Failed to update education. Please try again.', 'error');
    }
  };




  const handleBothUpdates = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
      await handleupdate(formData.id, educations);
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to update data. Please try again.', 'error');
    }
  };
  const fetchCountries = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/location`);
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
      showToast(error.response?.data?.message || 'Failed to fetch countries.', 'error');
    }
  };

  const fetchStates = async (countryId, type) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/location/countries/${countryId}/states`);
      if (type === 'permanent') {
        setPermanentStates(response.data);
      } else {
        setCurrentStates(response.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      showToast(error.response?.data?.message || 'Failed to fetch states.', 'error');
    }
  };

  const fetchCities = async (stateId, type) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/states/${stateId}/cities`);
      if (type === 'permanent') {
        setPermanentCities(response.data);
      } else {
        setCurrentCities(response.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      showToast(error.response?.data?.message || 'Failed to fetch cities.', 'error');
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleCountryChange = (event, type) => {
    const selectedOption = countries.find(country => country.id === Number(event.target.value));
    if (type === 'permanent') {
      setFormData({ ...formData, permanentCountry: selectedOption.countryName, permanentState: '', permanentCity: '' });
      setPermanentStates([]);
      setPermanentCities([]);
      fetchStates(selectedOption.id, type);
    } else {
      setFormData({ ...formData, currentCountry: selectedOption.countryName, currentState: '', currentCity: '' });
      setCurrentStates([]);
      setCurrentCities([]);
      fetchStates(selectedOption.id, type);
    }
  };

  const handleStateChange = (event, type) => {
    const selectedOption = type === 'permanent' ? permanentStates.find(state => state.id === Number(event.target.value)) : currentStates.find(state => state.id === Number(event.target.value));
    if (type === 'permanent') {
      setFormData({ ...formData, permanentState: selectedOption.stateName, permanentCity: '' });
      setPermanentCities([]);
      fetchCities(selectedOption.id, type);
    } else {
      setFormData({ ...formData, currentState: selectedOption.stateName, currentCity: '' });
      setCurrentCities([]);
      fetchCities(selectedOption.id, type);
    }
  };

  const handleCityChange = (event, type) => {
    const selectedOption = type === 'permanent' ? permanentCities.find(city => city.id === Number(event.target.value)) : currentCities.find(city => city.id === Number(event.target.value));
    if (type === 'permanent') {
      setFormData({ ...formData, permanentCity: selectedOption.cityName });
    } else {
      setFormData({ ...formData, currentCity: selectedOption.cityName });
    }
  };
  const handleButtonClick = (pageName) => {
    setActivePage(pageName);
    setActiveSection(1);
  };
  const [activeSection, setActiveSection] = useState(1);
  const [activePage, setActivePage] = useState('Personal Information');
  const [additionalFields, setAdditionalFields] = useState({
    coursesAndCertificates: [
      {
        CourseName: '',
        InstituteName: '',
        startDate: '',
        endDate: '',
        CourseMode: '',
        CourseType: '',
        Certificates: '',
        currentlyWorking: false
      }
    ]
  });

  const [errors, setErrors] = useState({
    linkedContactNo: '',
    linkedEmail: ''
  });
  const handleBankDetails = (e) => {
    const { name, value } = e.target;

    // Update state for the input field first
    setBankDetails((prevDetails) => ({ ...prevDetails, [name]: value }));

    // Handle validation for contact number
    if (name === 'linkedContactNo') {
      if (value === '' || /^\d{0,10}$/.test(value)) {
        if (value.length === 10 || value === '') {
          setErrors((prevErrors) => ({
            ...prevErrors,
            linkedContactNo: ''
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            linkedContactNo: 'Contact number must be exactly 10 digits long.'
          }));
        }
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          linkedContactNo: 'Contact number must be numeric and up to 10 digits long.'
        }));
      }
    }

    // Handle validation for email
    if (name === 'linkedEmail') {
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+com$/;
      if (value === '' || emailRegex.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          linkedEmail: ''
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          linkedEmail: 'Please enter a valid email address that ends with .com.'
        }));
      }
    }

    if (name === 'accountifscCode') {
      const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/; // Standard IFSC format
      if (!ifscPattern.test(value)) {
        setErrors(prevErrors => ({
          ...prevErrors,
          accountifscCode: 'Invalid IFSC code format. Example: ABCD0123456'
        }));
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          accountifscCode: '' // Clear error if valid
        }));
      }
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';

    const dateOfBirthDate = new Date(dateOfBirth);
    const today = new Date();

    // Check for valid date input
    if (isNaN(dateOfBirthDate.getTime())) return 'Invalid date';

    let age = today.getFullYear() - dateOfBirthDate.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirthDate.getDate())) {
      age--;
    }

    if (age <= 18) {
      return 'Invalid age';
    }

    return age.toString();
  };
  const handleBankDetailsUpdate = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://${strings.localhost}/BankDetails/${id}`, bankDetails);
        showToast('Bank Details updated successfully.', 'success');
      } else {
        showToast('ID is missing. Cannot update Bank Details.', 'error');
      }
    } catch (error) {
      console.error("Error updating Bank Details:", error);
      showToast('Failed to update Bank Details. Please try again.', 'error');
    }
  };

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/BankDetails/getByEmployeeId?employeeId=${id}`);
      if (response.data && response.data.length > 0) {
        const latestBankDetail = response.data[response.data.length - 1];
        setBankDetails(latestBankDetail);
        setUpdateId(latestBankDetail.id); // Store the ID for updates
      } else {
        // If no bank details found, reset to an empty object
        setBankDetails({});
      }
    } catch (error) {
      console.error('Error fetching Bank Details:', error);
    }
  };

  const [errorMessages, setErrorMessages] = useState({
    yearOfPassingError: '',
    formError: ''
  });
  const isEducationValid = (index) => {
    const education = educations[index];
    return (
      education.institute &&
      education.university &&
      education.typeOfStudy &&
      education.yearOfAddmisstion &&
      education.yearOfPassing &&
      education.score &&
      validateYearOfPassing(index)
    );
  };
  const handleSubmitEducation = async () => {
    try {
      const response = await axios.post(`http://${strings.localhost}/education/saveForEmployee?employeeId=${id}`, educations, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      showToast('Education data updated successfully.', 'success');
      setEducations([{
        institute: '',
        university: '',
        typeOfStudy: '',
        yearOfAddmisstion: '',
        yearOfPassing: '',
        score: '',
        scoreType: 'CGPA'
      }]);
    } catch (error) {
      console.error('Error saving education data:', error);
      showToast('Failed to save education data.', 'error');
    }
  };
  const handleSubmitHistory = async () => {
    let isValid = true;
    const newErrors = {};

    // Validate each entry in employeeDetails
    for (const [index, detail] of employeeDetails.entries()) {
      if (detail.latestMonthGross && detail.latestCtc && parseFloat(detail.latestMonthGross) >= parseFloat(detail.latestCtc)) {
        isValid = false;
        newErrors[`detail${index}GrossCTC`] = 'Monthly Gross must be less than CTC.';
      }
      // Additional validations can go here
    }

    // if (!isValid) {
    //   setErrors(newErrors);
    //   alert('Please correct the errors before saving.');
    //   return;
    // }

    try {
      const response = await axios.post(`http://${strings.localhost}/api/employeement-history/saveForEmployee?employeeId=${id}`, employeeDetails, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      showToast('Employment history updated successfully.', 'success');
    } catch (error) {
      console.error('Error saving employment data:', error);
      showToast('Failed to save employment data.', 'error');
    }
  };

  const handleAddEntry = () => {
    setEmployeeDetails([
      ...employeeDetails,
      {
        companyName: '',
        jobRole: '',
        responsibilities: '',
        startDate: '',
        endDate: '',
        latestCtc: '',
        latestMonthGross: '',
        supervisorContact: '',
        achievements: '',
        employeeType: '',
        location: '',
        industry: '',
        companySize: '',
        reasonOfLeaving: '',
        isSaved: false, // New entries are not saved yet
      }
    ]);
  };

  const removeEntry = (index) => {
    const updatedDetails = [...employeeDetails];
    updatedDetails.splice(index, 1);
    setEmployeeDetails(updatedDetails);
    setShowConfirmation(false);
  };

  const handleSubmitBankDetails = async (e) => {
    e.preventDefault();


    // Wrap bankDetails in an array
    const dataToSend = [bankDetails];

    if (
      errors.linkedContactNo ||
      errors.linkedEmail ||
      errors.accountifscCode

    ) {
      showToast('Please correct all errors before submitting.', 'warn');
      return;
    }
    try {
      const response = await axios.post(
        `http://${strings.localhost}/BankDetails/saveForEmployee?employeeId=${id}`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      showToast('Bank details updated successfully.', 'success');
    } catch (error) {
      console.error('Error saving bank details:', error);
      showToast('Failed to save bank details.', 'error');
    }
  };

  const CustomInput = (props) => {
    return (
      <input
        type='text'
        style={{
          border: 'none',
          borderBlock: 'none',
          outline: 'none',
          alignContent: 'center',
          marginBottom: '10px'
        }}
        {...props}
      />
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='form1' >
        {/* Personal Information */}
        <div className='form-section'>
          <div className='form-title'>Update Employee Data</div>

          <div className='addform'>
            <button type="button" className={activePage === 'Personal Information' ? 'active' : ''} onClick={() => handleButtonClick('Personal Information')}>
              <FontAwesomeIcon className="icon" icon={faInfo} />
              Personal Information
            </button>
            <button type="button" className={activePage === 'Educational Information' ? 'active' : ''} onClick={() => handleButtonClick('Educational Information')}>
              <FontAwesomeIcon className="icon" icon={faBook} />
              Educational Information
            </button>
            <button type="button" className={activePage === 'Employee History' ? 'active' : ''} onClick={() => handleButtonClick('Employee History')}>
              <FontAwesomeIcon className="icon" icon={faHistory} />
              Employee History
            </button>
            <button type="button" className={activePage === 'Bank Details' ? 'active' : ''} onClick={() => handleButtonClick('Bank Details')}>
              <FontAwesomeIcon className="icon" icon={faBank} />
              Bank Details
            </button>
            <button type="button" className={activePage === 'ViewDocuments' ? 'active' : ''} onClick={() => handleButtonClick('ViewDocuments')}>
              <FontAwesomeIcon className="icon" icon={faFileAlt} />
              Documents
            </button>
          </div>
          {activePage === 'Personal Information' &&
            (
              <div className='page-content'>
                <div className="box-container personal-info-box">



                  <h4 className="underlineText" onClick={() => toggleSection('personal')} >
                    Personal Information
                  </h4>

                  <div className="input-row">
                    <div>
                      <label htmlFor="id">ID: </label>
                      <input type="text" id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleInputChange} />
                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="firstName">First Name</label>
                      <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                      {errors.firstName && <span style={{ color: 'red' }}>{errors.firstName}</span>}

                    </div>
                    <div>
                      <label htmlFor="middleName"> Middle Name</label>
                      <input type="text" id="middleName" name="middleName" value={formData.middleName} onChange={handleInputChange} />
                      {errors.middleName && <span style={{ color: 'red' }}>{errors.middleName}</span>}

                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="lastName">Last Name </label>
                      <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                      {errors.lastName && <span style={{ color: 'red' }}>{errors.lastName}</span>}

                    </div>

                  </div>
                  <div className="input-row">
                    <div>
                      <label htmlFor="motherName">Mother's Name</label>
                      <input type="text" id="motherName" name="motherName" value={formData.motherName} onChange={handleInputChange} />
                      {errors.motherName && <span style={{ color: 'red' }}>{errors.motherName}</span>}

                    </div>
                    <div style={{ marginTop: '1.5%', height: '96%' }}>
                      <div style={{ position: 'relative', height: '49%' }}>
                        <span className="required-marker">*</span>
                        <label htmlFor="contactNo">Mobile Number</label>

                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', height: '100%', outline: 'none' }}>

                          <select
                            className='text'
                            id="contactNoCountryCode"
                            name="contactNoCountryCode"
                            value={formData.contactNoCountryCode}
                            onChange={handleInputChange}
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
                            <option value="" >{formData.contactNoCountryCode}</option>                            {dropdownData.coun_code && dropdownData.coun_code.length > 0 ? (
                              dropdownData.coun_code.map(option => (
                                <option key={option.id} value={option.data}>
                                  {option.data}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>Country code Not available</option>
                            )}
                          </select>
                          <input
                            type="text"
                            id="contactNo"
                            name="contactNo"
                            value={formData.contactNo}
                            maxLength={10}
                            onChange={handleInputChange}
                            style={{
                              border: 'none',
                              fontSize: 'inherit',
                              paddingLeft: '10px',
                              flexGrow: 2,
                              outline: 'none'
                            }}
                            required
                          />
                        </div>
                        {mobnoError && <div style={{ color: 'red' }}>{mobnoError}</div>}
                      </div>
                    </div>

                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="email">Email Id </label>
                      <input type="text" id="email" name="email" onChange={handleInputChange} value={formData.email} required />
                      {emailError && (
                        <span style={{ color: 'red' }}>{emailError}</span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="nationality">Select nationality</label>
                      <select
                        className='selectIM'
                        id="nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled hidden> </option>
                        {dropdownData.nationality && dropdownData.nationality.length > 0 ? (
                          dropdownData.nationality.map(option => (
                            <option key={option.id} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>nationality Not available</option>
                        )}
                      </select>
                    </div>


                  </div>

                  <div className="input-row">

                    <div>
                      <label htmlFor="gender">Select Gender</label>
                      <select
                        className='selectIM'
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}

                      >
                        <option value="" disabled hidden>Select Gender</option>
                        {dropdownData.gender && dropdownData.gender.length > 0 ? (
                          dropdownData.gender.map(option => (
                            <option key={option.masterId} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Genders Not available</option>
                        )}
                      </select>
                    </div>


                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="department">Department</label>
                      <select
                        className='selectIM'
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled hidden>Select Department</option>
                        {dropdownData.department && dropdownData.department.length > 0 ? (
                          dropdownData.department.map(option => (
                            <option key={option.masterId} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Departments Not available</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="designation">Designation</label>
                      <select
                        className='selectIM'
                        id="designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled hidden>Select Designation</option>
                        {dropdownData.designation && dropdownData.designation.length > 0 ? (
                          dropdownData.designation.map(option => (
                            <option key={option.masterId} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Designation Not available</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="totalExp">Total Experience (years)</label>
                      <input type="text" id="experience" name="experience" value={formData.experience} onChange={handleInputChange} />
                      {experienceError && <div style={{ color: 'red' }}>{experienceError}</div>}
                    </div>

                  </div>
                  <div className="input-row">
                    <div>
                      <label htmlFor="panNo">PAN Number </label>
                      <input type="text" id="panNo" name="panNo" value={formData.panNo} onChange={handleInputChange} maxLength={10} />
                      {panNoError && <div style={{ color: 'red' }}>{panNoError}</div>}
                    </div>
                    <div>
                      <label htmlFor="adhaarNo">Aadhar Number </label>
                      <input type="text" id="adhaarNo" name="adhaarNo" value={formData.adhaarNo} onChange={handleInputChange} maxLength={12} />
                      {adhaarNoError && <div style={{ color: 'red' }}>{adhaarNoError}</div>}
                    </div>


                    <div style={{ marginTop: '1.5%', height: '96%' }}>
                      <div style={{ height: '49%' }}>
                        <label htmlFor="contactNo"> Alternate Mobile Number</label>

                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', height: '100%', outline: 'none' }}>

                          <select
                            className='text'
                            id="alternateContactNoCountryCode"
                            name="alternateContactNoCountryCode"
                            value={formData.alternateContactNoCountryCode}
                            onChange={handleInputChange}
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

                          >
                            <option value="" >{formData.alternateContactNoCountryCode}</option>
                            {dropdownData.coun_code && dropdownData.coun_code.length > 0 ? (
                              dropdownData.coun_code.map(option => (
                                <option key={option.id} value={option.data}>
                                  {option.data}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>Country code Not available</option>
                            )}
                          </select>
                          <input
                            type="text"
                            id="alternateContactNo"
                            name="alternateContactNo"
                            value={formData.alternateContactNo}
                            maxLength={10}
                            onChange={handleInputChange}
                            style={{
                              border: 'none',
                              fontSize: 'inherit',
                              paddingLeft: '10px',
                              flexGrow: 2,
                              outline: 'none'
                            }}
                            required
                          />
                        </div>
                        {alternateContactNoError && <div style={{ color: 'red' }}>{alternateContactNoError}</div>}
                      </div>
                    </div>


                    <div>
                      <label htmlFor="alternateEmail">Alternate Email Id</label>
                      <input
                        type="text"
                        id="alternateEmail"
                        name="alternateEmail"
                        className="alternateEmail"
                        value={formData.alternateEmail}
                        onChange={handleInputChange}
                      />
                      {alternateEmailError && (
                        <div style={{ color: 'red' }}>{alternateEmailError}</div>
                      )}
                    </div>



                  </div>
                  <div className="input-row">
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="joiningDate">Joining  Date</label>
                      <input
                        type='date'
                        className="datePicker"
                        id="joiningDate"
                        name="joiningDate"
                        value={formData.joiningDate ? moment(formData.joiningDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : ''}
                        onChange={(event) => handleDateChange(event, 'joiningDate')}
                        required
                      />
                      {joiningDateError && <span style={{ color: 'red' }}>{joiningDateError}</span>}

                    </div>

                    <div>
                      <label htmlFor="PriorId">Prior Employee ID </label>
                      <input type="text" id="priorId" name="priorId" className="priorId" value={formData.priorId} onChange={handleInputChange} />
                    </div>

                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="dateOfBirth">Date Of Birth</label>
                      <input
                        type='date'
                        className="datePicker"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth ? moment(formData.dateOfBirth, 'DD-MM-YYYY').format('YYYY-MM-DD') : ''}
                        onChange={(event) => handleDateChange(event, 'dateOfBirth')}
                        required
                      />

                    </div>
                    <div>
                      <label htmlFor="age" > Age</label>
                      <input type="text" id="age" name="age" className="age" value={formData.age} onChange={handleInputChange} readOnly />
                    </div>
                  </div>
                  <div className='input-row'>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="maritalStatus"> Marital Status</label>
                      <select
                        className='selectIM'
                        id="maritalStatus"
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled hidden>Select Marital Status</option>

                        {dropdownData.maritalstatus && dropdownData.maritalstatus.length > 0 ? (

                          dropdownData.maritalstatus.map(option => (
                            <option key={option.masterId} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled> marital Status  Not available</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="employeeType"> Employee Type</label>
                      <select
                        className='selectIM'
                        id="employeeType"
                        name="employeeType"
                        value={formData.employeeType}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled hidden>Select Employee Type</option>

                        {dropdownData.employeetype && dropdownData.employeetype.length > 0 ? (

                          dropdownData.employeetype.map(option => (
                            <option key={option.masterId} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled> Emloyee Type Not available</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="employeestatus">Select Employee Status</label>
                      <select
                        className='selectIM'
                        id="presence"
                        name="presence"
                        value={formData.presence}
                        onChange={handleChange}

                      >
                        <option value="" disabled hidden>Select Employee Status</option>
                        {dropdownData.employeestatus && dropdownData.employeestatus.length > 0 ? (
                          dropdownData.employeestatus.map(option => (
                            <option key={option.masterId} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Status Not available</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="division">Division</label>
                      <select
                        className='selectIM'
                        id="division"
                        name="division"
                        value={formData.division}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled hidden>Select division</option>

                        {dropdownData.division && dropdownData.division.length > 0 ? (

                          dropdownData.division.map(option => (
                            <option key={option.masterId} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled> Emloyee division Not available</option>
                        )}
                      </select>
                    </div>


                  </div>
                  {/* <div className='input-row'>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="completionDate">Completion  Date</label>
                      <input
                        type='date'
                        className="datePicker"
                        id="completionDate"
                        name="completionDate"
                        value={formData.completionDate ? moment(formData.completionDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : ''}
                        onChange={(event) => handleDateChange(event, 'completionDate')}
                        required
                      />
                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="industry"> Industry :</label>
                      <select className='selectIM' id="industry" name="industry" value={formData.industry} onChange={handleChange} >
                        <option value="" selected disabled hidden></option>
                        {dropdownData.industry && dropdownData.industry.length > 0 ? (
                          dropdownData.industry.map(option => (
                            <option key={option.masterId} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Industries Not available</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="officeLocation"> Office Location</label>
                      <select className='selectIM' id="officeLocation" name="officeLocation" value={formData.officeLocation} onChange={handleChange} >
                        <option value="" selected disabled hidden></option>
                        {dropdownData.division && dropdownData.division.length > 0 ? (
                          dropdownData.division.map(option => (
                            <option key={option.masterId} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Industries Not available</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="role">Role</label>
                      <input type="text" id="role" name="role" value={formData.role} onChange={handleInputChange} />

                    </div>


                  </div>
                  <div className='input-row'>
                    <div>
                      <label>Technologies</label>
                      <CreatableSelect
                        isMulti
                        options={dropdownData.technologies.map(tech => ({
                          value: tech.data,
                          label: tech.data,
                        }))}
                        onChange={handleTechnologiesChange}
                        value={(Array.isArray(formData.technologies) ? formData.technologies : []).map(tech => ({
                          value: tech,
                          label: tech,
                        }))}
                        components={{ Input: CustomInput }} // Use custom input component

                        styles={{
                          control: (base) => ({
                            ...base,
                            width: '100%', // Adjust to your layout
                            height: 'auto'
                          }),
                          mtext: (base) => ({
                            ...base,
                            alignContent: 'centre'
                          }),
                          indicatorSeparator: (base) => ({
                            ...base,
                            height: '20px', // Set your desired height
                            margin: '10 10px', // Optional: adjust margins
                          }),
                          indicatorsContainer: (base) => ({
                            ...base,
                            display: 'flex',
                            alignItems: 'center', // Center vertically
                            marginBottom: '25px'
                          }),
                        }}
                      />
                    </div>
                  </div> */}

                </div>



                {/* Address Information */}
                <div className="box-container address-info-box">
                  <h4 className="text-left" onClick={() => toggleSection('Address Information')} style={{ textDecoration: 'underline', marginBottom: '20px' }}>
                    Address Information
                  </h4>
                  {/* {openSection === 'Address Information' && ( */}
                  <>


                    <div className="form-header-h4">
                      <h4 className="text-left" style={{ textDecoration: 'underline', marginBottom: '20px' }}>Permanent Address</h4>
                    </div>
                    <div className="input-row">
                      <div>
                        <label htmlFor="permanentHouseNo">House Number & Complex </label>
                        <input type="text" id="permanentHouseNo" name="permanentHouseNo" value={formData.permanentHouseNo} onChange={handleInputChange} />

                      </div>
                      <div>
                        <label htmlFor="permanentStreet">Street </label>
                        <input type="text" id="permanentStreet" name="permanentStreet" value={formData.permanentStreet} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label htmlFor="permanentPostelcode">Postal Code </label>
                        <input type="text" id="permanentPostelcode" name="permanentPostelcode" value={formData.permanentPostelcode} onChange={handleInputChange} maxLength={6} />
                        {permanentPostcodeError && <span style={{ color: 'red' }}>{permanentPostcodeError}</span>}

                      </div>
                    </div>
                    <div className="input-row">

                      <div>
                        <span className="required-marker">*</span>
                        <label htmlFor="country">Country</label>

                        <select
                          placeholder={formData.permanentCountry}
                          value={formData.permanentCountry}
                          onChange={(event) => handleCountryChange(event, 'permanent')}
                          style={{ fontSize: '14px' }}
                        >

                          <option value="" >{formData.permanentCountry}</option>

                          {countries.map(country => (
                            <option key={country.id} value={country.id}>
                              {country.countryName}

                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="required-marker">*</span>
                        <label htmlFor="state">State</label>
                        <select
                          value={permanentStates.find(state => state.stateName === formData.permanentState)?.id || ''}
                          onChange={(event) => handleStateChange(event, 'permanent')}
                          placeholder={formData.permanentCountry}
                          // disabled={!formData.permanentCountry}
                          style={{ fontSize: '14px' }}
                        >
                          <option value="" >{formData.permanentState} </option>
                          {permanentStates.map(state => (
                            <option key={state.id} value={state.id}>
                              {state.stateName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="required-marker">*</span>
                        <label htmlFor="city">City</label>
                        <select
                          value={permanentCities.find(city => city.cityName === formData.permanentCity)?.id || ''}
                          onChange={(event) => handleCityChange(event, 'permanent')}
                          disabled={!formData.permanentCountry}
                          style={{ fontSize: '14px' }}
                        >
                          <option value="" >{formData.permanentCity} </option>
                          {permanentCities.map(city => (
                            <option key={city.id} value={city.id}>
                              {city.cityName}

                            </option>
                          ))}
                        </select>
                      </div>
                    </div>


                    <div className="form-header-h4">
                      <h4 className="text-left" style={{ textDecoration: 'underline', marginBottom: '20px', marginTop: '20px' }}>Current Address</h4>
                    </div>
                    <div className="input-row">
                      <div>
                        <label htmlFor="currentHouseNo">House Number </label>
                        <input type="text" id="currentHouseNo" name="currentHouseNo" value={formData.currentHouseNo} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label htmlFor="currentStreet">Street</label>
                        <input type="text" id="currentStreet" name="currentStreet" value={formData.currentStreet} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label htmlFor="currentPostelcode">Postal Code </label>
                        <input type="text" id="currentPostelcode" name="currentPostelcode" value={formData.currentPostelcode} onChange={handleInputChange} maxLength={6} />
                        {currentPostcodeError && <span style={{ color: 'red' }}>{currentPostcodeError}</span>}

                      </div>
                    </div>
                    <div className="input-row">
                      <div>
                        <span className="required-marker">*</span>
                        <label htmlFor="country">Country</label>

                        <select
                          value={formData.countryName}
                          onChange={(event) => handleCountryChange(event, 'current')}
                          style={{ fontSize: '14px' }}

                        >
                          <option value="" >{formData.currentCountry}</option>
                          {countries.map(country => (
                            <option key={country.id} value={country.id}>
                              {country.countryName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span className="required-marker">*</span>
                        <label htmlFor="state">State</label>
                        <select
                          value={currentStates.find(state => state.stateName === formData.currentState)?.id || ''}
                          onChange={(event) => handleStateChange(event, 'current')}
                          disabled={!formData.currentCountry}
                          style={{ fontSize: '14px' }}
                        >
                          <option value="" >{formData.currentState}</option>
                          {currentStates.map(state => (
                            <option key={state.id} value={state.id}>
                              {state.stateName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span className="required-marker">*</span>
                        <label htmlFor="city">City</label>
                        <select
                          value={currentCities.find(city => city.cityName === formData.currentCity)?.id || ''}
                          onChange={(event) => handleCityChange(event, 'current')}
                          style={{ fontSize: '14px' }}
                        >
                          <option value="" >{formData.currentCity}</option>
                          {currentCities.map(city => (
                            <option key={city.id} value={city.id}>
                              {city.cityName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className='form-controls'>
                      <button className='outline-btn' type="button" onClick={() => window.location.href = '/ActiveEmployees'}>Back</button>

                      <button className='btn' type="submit" onClick={handleSubmit}>Update</button>

                    </div>
                  </>
                  {/* )} */}
                </div>

              </div>
            )}
        </div>
        {activePage === 'Educational Information' && (
          <div className="box-container personal-info-box">
            <form >
              {educations.map((education, index) => (
                <div key={education.id}>
                  <h4
                    className="underlineText"
                    onClick={() => toggleSection('Educational Information')}

                  >
                    Educational Information
                  </h4>
                  <div className='input-row'>
                    <div>
                      <span className="required-marker">*</span>
                      <label>Institute</label>
                      <input
                        type="text"
                        name="institute"
                        value={education.institute}
                        onChange={(e) => handleEducation(e, index)}
                        required
                      />
                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label>University</label>
                      <input
                        type="text"
                        name="university"
                        value={education.university}
                        onChange={(e) => handleEducation(e, index)}
                        required
                      />
                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="typeOfStudy">Select Degree</label>
                      <select
                        className='selectIM'
                        id="typeOfStudy"
                        name="typeOfStudy"
                        value={education.typeOfStudy}
                        onChange={(e) => handleEducation(e, index)}
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
                      <label>Branch</label>
                      <input
                        type="text"
                        name="branch"
                        value={education.branch}
                        onChange={(e) => handleEducation(e, index)}
                        required
                      />
                    </div>
                  </div>
                  <div className='input-row'>
                    <div className="input-wrapper">
                      <span className="required-marker">*</span>
                      <label>Year of Admission</label>
                      <select
                        className="selectIM"
                        name='yearOfAddmisstion'
                        value={education.yearOfAddmisstion}
                        onChange={(e) => handleEducation(e, index)}
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
                    <div style={{ position: 'relative' }}>
                      <span className="required-marker">*</span>
                      <label htmlFor='yearOfPassing'>Year of Passing </label>
                      <select
                        className="selectIM"
                        id='yearOfPassing'
                        name='yearOfPassing'
                        value={education.yearOfPassing}
                        onChange={(e) => handleEducation(e, index)}
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
                      {errorMessages.yearOfPassingError && <div className="error">{errorMessages.yearOfPassingError}</div>}
                    </div>
                    <div className='input-wrapper' style={{ marginTop: '1.5%', height: '96%' }}>
                      <div style={{ position: 'relative', height: '49%' }}>
                        <span className="required-marker">*</span>
                        <label htmlFor={`scoreType`}>Score</label>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', height: '100%', outline: 'none' }}>
                          <select
                            className='text'
                            id={`scoreType`}
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
                            type="text"
                            name="score"
                            value={education.score}
                            onChange={(e) => handleEducation(e, index)}
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
                          {education.scoreType === 'Percentage' && <span style={{ paddingRight: '10px' }}>%</span>}
                        </div>
                        {errorMessages.scoreError && <div className="error" style={{ color: 'red' }}>{errorMessages.scoreError}</div>}
                      </div>
                    </div>
                  </div>

                  <div className='form-controls'>
                    <button type="button" className='circle-button red-btn' onClick={() => handleDelete(index)}>Remove</button>

                    {education.isSaved ? (
                      <button type="button" className='btn' onClick={() => handleupdate(education.id, education)}>Update</button>
                    ) : (
                      <button type="button" className='btn' onClick={handleSubmitEducation}>Save</button>
                    )}

                  </div>

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
                      }}
                    > Yes</button>
                    <button type='button' className='btn'
                      onClick={() => setShowConfirmation(false)} // Hide confirmation dialog
                    > No </button>
                  </div>
                </div>
              )}
              <div className='btnContainer'>
                <button type="button" className='btn' onClick={handleAddEducation}>Add New</button>
              </div>
            </form>
          </div>
        )}
        {activePage === 'Employee History' && (
          <div>

            <form>
              <div className="box-container employee-details-box">
                {employeeDetails.map((detail, index) => (
                  <div key={index}>
                    <h4 className="underlineText" onClick={() => toggleSection('Employee History')} >
                      Employee History
                    </h4>
                    <div className="input-row">
                      <div className="input-wrapper">
                        <span className="required-marker">*</span>
                        <label>Company Name</label>
                        <input type="text" name="companyName" value={detail.companyName} onChange={(e) => handleHistory(index, e, 'employeeDetails')} required />
                      </div>
                      <div className="input-wrapper">
                        <span className="required-marker">*</span>
                        <label>Job Role</label>
                        <input type="text" name="jobRole" value={detail.jobRole} onChange={(e) => handleHistory(index, e, 'employeeDetails')} required />
                      </div>
                      <div className="input-wrapper">
                        <label>Responsibilities</label>
                        <input type="text" name="responsibilities" value={detail.responsibilities} onChange={(e) => handleHistory(index, e, 'employeeDetails')} />
                      </div>
                    </div>
                    <div className='input-row'>
                      <div className='input-wrapper'>
                        <span className="required-marker">*</span>
                        <label htmlFor="startDate">Start Date </label>
                        <input
                          type='date'
                          className="datePicker"
                          id="startDate"
                          name="startDate"
                          value={detail.startDate ? convertToDateInputFormat(detail.startDate) : ''}
                          onChange={(e) => handledate(e.target.value, "startDate", index, "employeeDetails")}
                        />
                      </div>
                      <div className='input-wrapper'>
                        <span className="required-marker">*</span>
                        <label htmlFor="endDate">End Date </label>
                        <input
                          type='date'
                          className="datePicker"
                          id="endDate"
                          name="endDate"
                          required
                          value={detail.endDate ? convertToDateInputFormat(detail.endDate) : ''}
                          onChange={(e) => handledate(e.target.value, "endDate", index, "employeeDetails")}
                        />
                        {errors.dateRange && <p className="error">{errors.dateRange}</p>}
                      </div>
                      <div className="input-wrapper">
                        <label>Job Duration</label>
                        <input type="text" name="jobDuration" value={detail.jobDuration} readOnly />
                      </div>
                    </div>
                    <div className='input-row'>
                      <div className="input-wrapper">
                        <span className="required-marker">*</span>
                        <label>Latest CTC (In Lakhs)</label>
                        <input type="text" name="latestCtc" value={detail.latestCtc} onChange={(e) => handleHistory(index, e, 'employeeDetails')} required />
                        {errors.latestCtc && <p className="error">{errors.latestCtc}</p>}
                      </div>
                      <div className="input-wrapper">
                        <label>Latest Monthly Gross</label>
                        <input type="text" name="latestMonthGross" value={detail.latestMonthGross} onChange={(e) => handleHistory(index, e, 'employeeDetails')} />
                        {errors.latestMonthGross && <p className="error">{errors.latestMonthGross}</p>}
                      </div>
                      <div className="input-wrapper">
                        <label>Supervisor Contact</label>
                        <input type="text" name="supervisorContact" value={detail.supervisorContact} onChange={(e) => handleHistory(index, e, 'employeeDetails')} />
                      </div>
                    </div>
                    <div className='input-row'>
                      <div className="input-wrapper">
                        <label>Achievements</label>
                        <input type="text" name="achievements" value={detail.achievements} onChange={(e) => handleHistory(index, e, 'employeeDetails')} />
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                        <label htmlFor="employeeType">Employee Type</label>
                        <select
                          className='selectIM'
                          id="employeementType"
                          name="employeementType"
                          value={detail.employeementType}
                          onChange={(e) => handleHistory(index, e, 'employeeDetails')} required
                        >
                          <option value="" disabled hidden></option>
                          {dropdownData.employeetype && dropdownData.employeetype.length > 0 ? (
                            dropdownData.employeetype.map(option => (
                              <option key={option.masterId} value={option.data}>
                                {option.data}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Employee Type Not available</option>
                          )}
                        </select>
                      </div>
                      <div className="input-wrapper">
                        <label>Location</label>
                        <input type="text" name="location" value={detail.location} onChange={(e) => handleHistory(index, e, 'employeeDetails')} />
                      </div>
                    </div>
                    <div className='input-row'>
                      <div style={{ position: 'relative' }}>
                        <span className="required-marker">*</span>
                        <label htmlFor="industry">Industry:</label>
                        <select className='selectIM' id="industry" required name="industry" value={detail.industry} onChange={(e) => handleHistory(index, e, 'employeeDetails')} >
                          <option value="" disabled hidden></option>
                          {dropdownData.industry && dropdownData.industry.length > 0 ? (
                            dropdownData.industry.map(option => (
                              <option key={option.masterId} value={option.data}>
                                {option.data}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Industries Not available</option>
                          )}
                        </select>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span className="required-marker">*</span>
                        <label htmlFor="companySize">Company Size</label>
                        <select className='selectIM' id="companySize" required name="companySize" value={detail.companySize} onChange={(e) => handleHistory(index, e, 'employeeDetails')} >
                          <option value="" disabled hidden></option>
                          {dropdownData.CompanySize && dropdownData.CompanySize.length > 0 ? (
                            dropdownData.CompanySize.map(option => (
                              <option key={option.masterId} value={option.data}>
                                {option.data}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Not available</option>
                          )}
                        </select>
                      </div>
                      <div className="input-wrapper">
                        <label>Reason for Leaving</label>
                        <input type="text" name="reasonOfLeaving" value={detail.reasonOfLeaving} onChange={(e) => handleHistory(index, e, 'employeeDetails')} />
                      </div>
                    </div>
                    <div className='form-controls'>
                      <button type="button" className="circle-button red-btn" onClick={() => handleDelete1(index)}>Remove</button>
                      {detail.isSaved ? (
                        <button type="button" onClick={() => handleUpdateEntry(index)} className='btn'>Update</button>
                      ) : (
                        <button type="button" onClick={handleSubmitHistory} className='btn'>Save</button>
                      )}
                      {/* Remove Button */}
                    </div>
                    {/* <div className='btnContainer'>
                      <button type="button" className='btn' onClick={handleAddEntry}>Add New Entry</button>
                    </div> */}
                  </div>

                ))}
                {showConfirmation && (
                  <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to delete this data?</p>
                    <div className='btnContainer'>
                      <button type='button' className='btn'
                        onClick={() => {
                          removeEntry('employeeDetails', employeeToRemoveIndex); // Remove the employee
                          setShowConfirmation(false); // Hide confirmation dialog
                        }}
                      > Yes </button>
                      <button type='button' className='btn' onClick={() => setShowConfirmation(false)} >No</button>

                    </div>
                  </div>
                )}
                <div className='btnContainer'>
                  <button type="button" className='btn' onClick={handleAddEntry}>Add New Entry</button>
                </div>
              </div>
              {/* Add New Entry Button */}

            </form>
          </div>
        )}

        {activePage === 'Bank Details' && (
          <div>
            <form autoComplete="off" onSubmit={handleSubmitBankDetails}>
              <div className='box-container educational-info-box'>
                <h4 className="underlineText" onClick={() => toggleSection('Bank Details')}>
                  Bank Details
                </h4>

                {Object.keys(bankDetails).length > 0 ? (
                  <>
                    <div className='input-row'>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Bank Name</label>
                        <input type="text" name="bankName" value={bankDetails.bankName} onChange={handleBankDetails} required />
                      </div>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Bank Branch</label>
                        <input type="text" name="branch" value={bankDetails.branch} onChange={handleBankDetails} required />
                      </div>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Account Holder Name</label>
                        <input type="text" name="accountHolderName" value={bankDetails.accountHolderName} onChange={handleBankDetails} required />
                      </div>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Account Number</label>
                        <input type="text" name="accountNumber" value={bankDetails.accountNumber} onChange={handleBankDetails} maxLength={20} required />
                      </div>
                    </div>
                    <div className='input-row'>
                      <div>
                        <span className="required-marker">*</span>
                        <label>IFSC Code</label>
                        <input type="text" name="accountifscCode" value={bankDetails.accountifscCode} onChange={handleBankDetails} required />
                        {errors.accountifscCode && <span style={{ color: 'red' }} >{errors.accountifscCode}</span>}

                      </div>
                      <div>
                        <label>Branch Code</label>
                        <input type="text" name="branchCode" value={bankDetails.branchCode} onChange={handleBankDetails} />
                      </div>
                      <div>
                        <label>Bank Address</label>
                        <input type="text" name="branchAdress" value={bankDetails.branchAdress} onChange={handleBankDetails} autoComplete="off" />
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                        <label htmlFor="accountType">Account Type</label>
                        <select className='selectIM' id="accountType" name="accountType" value={bankDetails.accountType} onChange={handleBankDetails}>
                          <option value="" disabled hidden></option>
                          {dropdownData.AccountType && dropdownData.AccountType.length > 0 ? (
                            dropdownData.AccountType.map(option => (
                              <option key={option.masterId} value={option.data}>
                                {option.data}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Account Types Not available</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className='input-row'>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Linked Contact Number</label>
                        <input type="text" name="linkedContactNo" value={bankDetails.linkedContactNo} onChange={handleBankDetails} maxLength={10} autoComplete="off" />
                        {errors.linkedContactNo && <span className="error">{errors.linkedContactNo}</span>}
                      </div>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Linked Email</label>
                        <input type="text" name="linkedEmail" value={bankDetails.linkedEmail} onChange={handleBankDetails} autoComplete="off" />
                        {errors.linkedEmail && <span className="error">{errors.linkedEmail}</span>}
                      </div>
                    </div>
                    <div className='form-controls'>
                      <button className='btn' onClick={handleSubmitBankDetails}>Save</button>
                    </div>
                  </>
                ) : (
                  <div>
                    <p style={{ fontWeight: 'bold', color: 'red' }}>No bank details found. Please add your bank details</p>
                    <br />
                    <div className='input-row'>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Bank Name</label>
                        <input type="text" name="bankName" onChange={handleBankDetails} required />
                      </div>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Bank Branch</label>
                        <input type="text" name="branch" onChange={handleBankDetails} required />
                      </div>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Account Holder Name</label>
                        <input type="text" name="accountHolderName" onChange={handleBankDetails} required />
                      </div>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Account Number</label>
                        <input type="text" name="accountNumber" onChange={handleBankDetails} required />
                      </div>
                    </div>
                    <div className='input-row'>
                      <div>
                        <span className="required-marker">*</span>
                        <label>IFSC Code</label>
                        <input type="text" name="accountifscCode" onChange={handleBankDetails} required />
                      </div>
                      <div>
                        <label>Branch Code</label>
                        <input type="text" name="branchCode" onChange={handleBankDetails} />
                      </div>
                      <div>
                        <label>Bank Address</label>
                        <input type="text" name="branchAdress" onChange={handleBankDetails} autoComplete="off" />
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                        <label htmlFor="accountType">Account Type</label>
                        <select className='selectIM' id="accountType" name="accountType" onChange={handleBankDetails} required>
                          <option value="" disabled hidden></option>
                          {dropdownData.AccountType && dropdownData.AccountType.length > 0 ? (
                            dropdownData.AccountType.map(option => (
                              <option key={option.masterId} value={option.data}>
                                {option.data}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Account Types Not available</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className='input-row'>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Linked Contact Number</label>
                        <input type="text" name="linkedContactNo" onChange={handleBankDetails} maxLength={10} autoComplete="off" required />
                        {errors.contactNumber && <span className="error">{errors.contactNumber}</span>}
                      </div>
                      <div>
                        <span className="required-marker">*</span>
                        <label>Linked Email</label>
                        <input type="text" name="linkedEmail" onChange={handleBankDetails} autoComplete="off" required />
                        {errors.email && <span className="error">{errors.email}</span>}
                      </div>
                    </div>
                    <div className='form-controls'>
                      <button className='btn' type="submit" onClick={handleBankDetailsUpdate}>Update</button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
        {activePage === 'ViewDocuments' && (
          <div className='page-content'>

            <ViewDocuments />

          </div>
        )}

        <div className='btnContainer'>

        </div>
      </form>

    </>
  );
};

export default UpdateEmp;
