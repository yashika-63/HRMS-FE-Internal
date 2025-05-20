import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import 'react-datepicker/dist/react-datepicker.css';
import '../CommonCss/Main.css';
import '../CommonCss/AddEmp.css';
import '../CommonCss/style.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { strings } from '../../string';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';
import EducationForm from './EducationForm';
import ActiveEmp from '../Employees/ActiveEmployees';
import ListEmp from '../Employees/ListEmployee';
import AssignEmp from '../Employees/AssignEmployee';
import EmployeeHistory from '../Employees/EmployeeHistory';
import BankDetails from '../Employees/BankDetails';
import Documents from '../Documents/Documents';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faHome, faPlus, faTasks, faUser, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { showToast } from '../../Api.jsx';
import Assets from './Assets.jsx';

const AddEmp = (isOpen) => {
  const [formData, setFormData] = useState({

    id: '',
    firstName: '',
    lastName: '',
    middleName: '',
    motherName: '',
    gender: '',
    nationality: '',
    contactNo: '',
    contactNoCountryCode: "+91",
    email: '',
    dateOfBirth: '',
    age: '',
    alternateContactNo: '',
    alternateContactNoCountryCode: "+91",
    alternateEmail: '',
    maritalStatus: '',
    designation: '',
    panNo: '',
    adhaarNo: '',
    department: '',
    experience: '',
    joiningDate: '',
    presence: '',
    priorId: '',
    employeeType: '',
    division: '',
    educationalDetails: [{}],
    employeeDetails: [{}],
    coursesAndCertificates: [{}],
    permanentHouseNo: '',
    permanentStreet: '',
    permanentCity: '',
    permanentState: '',
    permanentPostelcode: '',
    permanentCountry: '',
    currentHouseNo: '',
    currentStreet: '',
    currentCity: '',
    currentState: '',
    currentPostelcode: '',
    currentCountry: ''

  });


  const handledateChange = (date, dateString) => {
    setFormData({ ...formData, abscondDate: dateString });
    setFormData({ ...formData, joiningDate: dateString });
    setFormData({ ...formData, exitDate: dateString });
  };
  const handleClearAll = () => {
    const confirmClear = window.confirm('Are you sure you want to clear all fields?');
    if (confirmClear) {
      setFormData({
        id: '',
        firstName: '',
        lastName: '',
        middleName: '',
        motherName: '',
        gender: '',
        nationality: '',
        contactNo: '',
        contactNoCountryCode: '',
        email: '',
        dateOfBirth: '',
        age: '',
        alternateContactNo: '',
        alternateContactNoCountryCode: '',
        alternateEmail: '',
        maritalStatus: '',
        designation: '',
        panNo: '',
        adhaarNo: '',
        department: '',
        experience: '',
        joiningDate: '',
        presence: '',
        priorId: '',
        employeeType: '',
        division: '',
        educationalDetails: [{}],
        employeeDetails: [{}],
        coursesAndCertificates: [{}],
        permanentHouseNo: '',
        permanentStreet: '',
        permanentCity: '',
        permanentState: '',
        permanentPostelcode: '',
        permanentCountry: '',
        currentHouseNo: '',
        currentStreet: '',
        currentCity: '',
        currentState: '',
        currentPostelcode: '',
        currentCountry: ''
      });
      setSelectedDate(null);
    }
    setIsDirty(false);
  };

  const handleNext = () => {
    if (isDirty) {
      toast.warn('Please submit the form before navigating away.', {
        position: "top-right",
        autoClose: 3000,
      });
    } else {

      navigate(`/EducationForm/${id}`);
    }
  };

  const [ageError, setAgeError] = useState('');
  const [permanentStates, setPermanentStates] = useState([]);
  const [permanentCities, setPermanentCities] = useState([]);
  const [currentStates, setCurrentStates] = useState([]);
  const [currentCities, setCurrentCities] = useState([]);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showEmploymentForm, setShowEmploymentForm] = useState(false); // State to show/hide employment form
  const [activePage, setActivePage] = useState('Add Employee'); // State to track active page
  const [activeSection, setActiveSection] = useState(1); // State to track active section
  const [countries, setCountries] = useState([]);
  const [alternateContactNoError, setAlternateContactNoError] = useState('');
  const [alternateEmailError, setAlternateEmailError] = useState('');
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateErrors, setDateErrors] = useState('');
  const [experienceError, setExperienceError] = useState('');
  const [panNoError, setPanNoError] = useState('');
  const [adhaarNoError, setAdhaarNoError] = useState('');
  const [mobnoError, setmobnoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // To track if form is filled
  const navigate = useNavigate();
  const [dropdownError, setDropdownError] = useState('');
  const [permanentPostcodeError, setPermanentPostcodeError] = useState("");
  const [currentPostcodeError, setCurrentPostcodeError] = useState("");
  const [errors, setErrors] = useState({
    firstName: '',
    middleName: '',
    lastName: '',

  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'email') {
      if (!validateEmail(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
    if (name === 'permanentPostelcode' || name === 'currentPostelcode') {
      validatePostalCode(name, value);
    }
    if (name === 'firstName' || name === 'middleName' || name === 'lastName' || name === 'motherName') {
      // Check if the input contains non-alphabetic characters (allow spaces)
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: 'Only alphabetic characters are allowed.'
        }));
      }
      // Check if the first letter is uppercase
      else if (value && value[0] !== value[0].toUpperCase()) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: 'The first letter should be capitalized.'
        }));
      } else {
        // Clear the error if all conditions are met
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: ''
        }));
      }
    }

    if (name === 'experience') validateExperience(value);
    if (name === 'contactNo') validatemobno(value);
    if (name === 'panNo') validatePanNo(value);
    if (name === 'adhaarNo') validateAdhaarNo(value);
    if (name === 'alternateContactNo') validateAlternateContactNo(value);
    if (name === 'alternateEmail') {
      if (!validateEmail(value)) {
        setAlternateEmailError('Please enter a valid alternate email address');
      } else {
        setAlternateEmailError('');
      }
    }
  };
  const validateAlternateContactNo = (value) => {
    setAlternateContactNoError(!isNaN(value) && Number(value) >= 0 ? '' : 'Only positive numbers are allowed in mobile number');
  };

  const validateAlternateEmail = (value) => {
    if (!validateEmail(value)) {
      setAlternateEmailError('Enter a valid alternate email address.');
    } else {
      setAlternateEmailError('');
    }
  };
  const validateExperience = (value) => {
    if (!isNaN(value)) {
      setExperienceError('');
    } else {
      setExperienceError('Only numbers are allowed');
    }
  };
  const validatemobno = (value) => {
    // Check if the value is a number and not negative
    if (!isNaN(value) && Number(value) >= 0) {
      setmobnoError('');
    } else {
      setmobnoError('Only positive numbers are allowed');
    }
  };
  const validatePanNo = (value) => {
    if (value.trim() === '') {
      setPanNoError('');
    } else {
      const panRegex = /^[A-Za-z]{3}[ABCFGHLJPTF]{1}[A-Za-z]{1}[0-9]{4}[A-Za-z]{1}$/;
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


  const handleDateChange = (event, name) => {
    const dateValue = event.target.value; // Get date string from input
    const currentDate = moment().format('YYYY-MM-DD');
    const formattedDate = dateValue ? moment(dateValue).format('DD-MM-YYYY') : '';

    // Handle future date checks separately for dateOfBirth and joiningDate
    if (dateValue > currentDate) {
      if (name === 'dateOfBirth') {
        showToast("Date of Birth cannot be a future date.", "error");
        setFormData(prevData => ({
          ...prevData,
          [name]: '', // Reset date of birth
        }));
        return;
      } else if (name === 'joiningDate') {
        showToast("Joining Date cannot be a future date.", "error");
        setFormData(prevData => ({
          ...prevData,
          [name]: '', // Reset joining date
        }));
        return;
      }
    }

    // Update formData based on the field name
    if (name === 'dateOfBirth') {
      const age = calculateAge(dateValue); // Calculate age based on date of birth
      setFormData(prevData => ({
        ...prevData,
        [name]: formattedDate,
        age: age.toString() // Add calculated age to formData
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: formattedDate // Update date field in formData
      }));
    }

    // Update errors state if necessary
    setDateErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  // Calculate age function
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

    // Reject negative or too low age
    if (age <= 0) {
      setAgeError('Invalid age');
      return '';
    } else if (age <= 18 || age > 115) {
      setAgeError('Age must be between 18 to 115');
    } else {
      setAgeError(''); // Clear the error if age is valid
    }

    return age.toString();
  };




  const [additionalFields, setAdditionalFields] = useState({
    educationalDetails: [{}],
    employeeDetails: [{}],
    coursesAndCertificates: [{}],
  });

  const handleAddFields = (section, index) => {
    return (e) => {
      e.preventDefault();
      setAdditionalFields({
        ...additionalFields,
        [section]: [...additionalFields[section], {}]
      });
    };
  };

  const handleRemoveFields = (section, index) => {
    return (e) => {
      e.preventDefault();
      const updatedFields = [...additionalFields[section]];
      updatedFields.splice(index, 1);
      setAdditionalFields({
        ...additionalFields,
        [section]: updatedFields
      });
    };
  };
  const isPermanentAddressFilled = () => {
    return (
      formData.permanentHouseNo &&
      formData.permanentStreet &&
      formData.permanentCity &&
      formData.permanentState &&
      formData.permanentPostelcode &&
      formData.permanentCountry
    );
  };
  const isCheckboxDisabled = !isPermanentAddressFilled();

  const handleCheckboxChange = (e) => {
    if (e.target.checked) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        currentHouseNo: prevFormData.permanentHouseNo,
        currentStreet: prevFormData.permanentStreet,
        currentCity: prevFormData.permanentCity,
        currentState: prevFormData.permanentState,
        currentPostelcode: prevFormData.permanentPostelcode,
        currentCountry: prevFormData.permanentCountry
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        currentHouseNo: '',
        currentStreet: '',
        currentCity: '',
        currentState: '',
        currentPostelcode: '',
        currentCountry: ''
      }));
    }
  };
  const { id } = useParams();
  const companyId = localStorage.getItem("companyId")

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast.error(error, {
          autoClose: 5000, // Toast will close automatically after 5 seconds
          closeButton: true, // Show close button
          onClose: () => { }
        });
      });
      return; // Prevent form submission
    }

    setLoading(true); // Set loading to true before the API call

    axios.post(`http://${strings.localhost}/employees/save-and-mail/${companyId}`, formData)
      .then(response => {
        const id = response.data.id;  // Assuming the response contains the employee ID
        setTimeout(() => {
          alert('Employee added successfully');
          navigate(`/EducationForm/${id}`);  // Pass employeeId as route parameter
        }, 1000); // Delay the alert by 1 second (1000 milliseconds)
      })
      .catch(error => {
        console.error("Error:", error);
        // Check if the error response has data with backend validation messages
        if (error.response && error.response.data) {
          const errorMessage = error.response.data || 'An error occurred. Please try again.';
          toast.error(errorMessage, {
            autoClose: 5000, // Toast will close automatically after 5 seconds
            closeButton: true // Show close button
          });
        } else {
          toast.error('An unexpected error occurred. Please try again.', {
            autoClose: 5000,
            closeButton: true
          });
        }
      })
      .finally(() => {
        setLoading(false); // Reset loading state after the request
        setIsDirty(false);
      });
  };

  const validateForm = () => {
    const errors = [];

    // Check each error state and add relevant messages
    if (errors.firstName) errors.push(errors.firstName);
    if (errors.middleName) errors.push(errors.middleName);
    if (errors.lastName) errors.push(errors.lastName);
    if (emailError) errors.push(emailError);
    if (ageError) errors.push(ageError);
    if (alternateContactNoError) errors.push(alternateContactNoError);
    if (alternateEmailError) errors.push(alternateEmailError);
    if (panNoError) errors.push(panNoError);
    if (adhaarNoError) errors.push(adhaarNoError);
    if (mobnoError) errors.push(mobnoError);
    if (permanentPostcodeError) errors.push(permanentPostcodeError);
    if (currentPostcodeError) errors.push(currentPostcodeError);

    // Add checks for other fields as necessary

    return errors;
  };


  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com)$/;
    return regex.test(email);
  };
  const [dropdownData, setDropdownData] = useState({
    gender: [],
    employeestatus: [],
    resign: [],
    employeetype: [],
    designation: [],
    department: [],
    nationality: [],
    maritalstatus: [],
    coun_code: [],
    division: []
  });
  useEffect(() => {
    fetchDataByKey('gender', 'gender');
    fetchDataByKey('employeestatus', 'employeestatus');
    fetchDataByKey('resign', 'resign');
    fetchDataByKey('employeetype', 'employeetype');
    fetchDataByKey('designation', 'designation');
    fetchDataByKey('department', 'department');
    fetchValueByKey('nationality', 'nationality', 'hrmsmaster');
    fetchDataByKey('maritalstatus', 'maritalstatus');
    fetchValueByKey('coun_code', 'coun_code', 'hrmsmaster');
    fetchDataByKey('division', 'division');
  }, []);

  const fetchDataByKey = (keyvalue, content) => {
    axios.get(`http://${strings.localhost}/api/master1/GetDataByKey/${keyvalue}`)
      .then(response => {
        // Ensure response.data is defined and not null
        if (response.data && Array.isArray(response.data)) {
          const dropdownContent = response.data.map(item => ({
            masterId: item.masterId,
            data: item.data || ''
          }));

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

  const fetchValueByKey = (keyvalue, content) => {
    axios.get(`http://${strings.localhost}/api/master/GetDataByKey/${keyvalue}`)
      .then(response => {
        if (response.data && Array.isArray(response.data)) {
          const dropdownContent = response.data.map(item => ({
            masterId: item.masterId,
            data: item.data || ''  // Handle null or undefined values gracefully
          }));

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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsDirty(true);
  };
  const fetchCountries = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/location`);
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch countries.');
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
      toast.error(error.response?.data?.message || 'Failed to fetch states.');
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
      toast.error(error.response?.data?.message || 'Failed to fetch cities.');
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

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        const message = 'You have unsaved changes. Do you really want to leave?';
        event.returnValue = message; // For modern browsers
        return message; // For older browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleSectionClick = (sectionNumber) => {
    if (isDirty) {
      toast.warn('Please submit the form before navigating away.', {
        position: "top-right",
        autoClose: 3000,

      });
      return;
    }
    setActiveSection(sectionNumber);
    if (sectionNumber === 2) {
      setShowEducationForm(true);
      setShowEmploymentForm(false);
    } else if (sectionNumber === 3) {
      setShowEducationForm(false);
      setShowEmploymentForm(true);
    } else {
      setShowEducationForm(false);
      setShowEmploymentForm(false);
    }
  };

  const handleButtonClick = (pageName) => {
    setActivePage(pageName);
    setActiveSection(1);
  };
  // const fetchOptions = async (searchText) => {
  //   setIsLoading(true);
  //   try {
  //     const response = await axios.get(`http://${strings.localhost}/api/master1/SearchSpecificMasterData/designation`, {
  //       params: { searchText }
  //     });

  //     if (response.status === 200) {  // Check if the response status is OK
  //       const data = response.data;

  //       if (Array.isArray(data)) {
  //         const mappedData = data.map(item => ({
  //           value: item.designation,
  //           label: item.data || ''
  //         }));

  //         setOptions(mappedData);
  //       } else {
  //         console.warn("Unexpected response format:", data);
  //       }
  //     } else {
  //       console.warn("Non-200 status code received:", response.status);
  //     }
  //   } catch (error) {
  //     if (error.response) {
  //       // Server responded with a status other than 2xx
  //       console.error("Error response data:", error.response.data);
  //       console.error("Error response status:", error.response.status);
  //     } else if (error.request) {
  //       console.error("No response received:", error.request);
  //     } else {
  //       console.error("Error setting up request:", error.message);
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  return (
    <>
      {loading && <div className="loading-spinner"></div>}

      <form className="coreContainer" onSubmit={handleSubmit} >

        <div className="form-title"> Employee Data</div>
        <div>
          <div className='addform'>
            <button type="button" className={activePage === 'Add Employee' ? 'active' : ''} onClick={() => handleButtonClick('Add Employee')}>
              <FontAwesomeIcon className="icon" icon={faPlus} />
              Add Employee
            </button>
            <button type="button" className={activePage === 'ActiveEmp' ? 'active' : ''} onClick={() => handleButtonClick('ActiveEmp')}>
              <FontAwesomeIcon className="icon" icon={faUserTie} />
              Active Employee List
            </button>
            <button type="button" className={activePage === 'Employee List' ? 'active' : ''} onClick={() => handleButtonClick('Employee List')}>
              <FontAwesomeIcon className="icon" icon={faUser} />
              Employee List
            </button>
            <button type="button" className={activePage === 'Assign Project' ? 'active' : ''} onClick={() => handleButtonClick('Assign Project')}>
              <FontAwesomeIcon className="icon" icon={faTasks} />
              Assign Project
            </button>
          </div>
        </div>

        {/* <div className='addform'>
            <button type="button" onClick={() => handleButtonClick('Add Employee')}>Add Employee</button>
            <button type="button" onClick={() => handleButtonClick('Onboarding')}>Onboarding</button>
            <button type="button" onClick={() => handleButtonClick('Employee List')}>Employee List</button>
            <button type="button" onClick={() => handleButtonClick('Assign Project')}>Assign Project</button>
            <button type="button" onClick={() => handleButtonClick('Offboarding')}>Offboarding</button>
          </div> */}

        <div className='page-content'>
          {/* Render content based on active page */}
          {activePage === 'Add Employee' &&
            (

              <div>
                <div className='addform2'>
                  <button type="button" className={activeSection === 1 ? 'active' : ''} onClick={() => handleSectionClick(1)}>1. Personal Information</button>
                  <button type="button" className={activeSection === 2 ? 'active' : ''} onClick={() => handleSectionClick(2)}>2. Educational Information</button>
                  <button type="button" className={activeSection === 3 ? 'active' : ''} onClick={() => handleSectionClick(3)}>3. Employment History</button>
                  <button type="button" className={activeSection === 4 ? 'active' : ''} onClick={() => handleSectionClick(4)}>4. Bank Details </button>
                  <button type="button" className={activeSection === 5 ? 'active' : ''} onClick={() => handleSectionClick(5)}>5. Documents </button>
                  <button type="button" className={activeSection === 6 ? 'active' : ''} onClick={() => handleSectionClick(6)}>6. Assets </button>

                </div>
                <div className="section-content">
                  <div className={`form-section ${activeSection === 1 ? '' : 'hidden'}`}>

                    <div className="box-container personal-info-box">

                      <h4 className='underlineText'>Personal Information</h4>


                      <div className="input-row">
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="employeeId">Employee ID </label>
                          <input type="text" id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleInputChange} required />
                        </div>
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="firstName">First Name </label>
                          <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                          {errors.firstName && <span style={{ color: 'red' }}>{errors.firstName}</span>}

                        </div>
                        <div>
                          <label htmlFor="middleName"> Middle Name </label>
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
                          <div>
                            <span className="required-marker">*</span>
                            <label htmlFor="contactNo" >Mobile Number</label>

                            <div className='mobileDropdown'>

                              <select

                                id="contactNoCountryCode"
                                name="contactNoCountryCode"
                                value={formData.contactNoCountryCode}
                                onChange={handleInputChange}
                                className='mobiledp'
                                required
                              >
                                <option value="+91" selected style={{ fontWeight: 'bold' }}>
                                  +91
                                </option>
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
                        {/* <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                            <label htmlFor="mob">Mobile Number </label>
                            <input type="text" id="contactNo" name="contactNo" className="contactNo" value={formData.contactNo} onChange={handleInputChange} maxLength={10} required />
                            {mobnoError && <div style={{ color: 'red' }}>{mobnoError}</div>}

                          </div> */}
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="email">Email Id </label>
                          <input type="text" id="email" name="email" onChange={handleInputChange} value={formData.email} required />
                          {emailError && (
                            <span style={{ color: 'red' }}>{emailError}</span>
                          )}
                        </div>
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
                            <option value="" selected disabled hidden> </option>

                            {/* Check if dropdownData.projectstatus exists and is not empty */}
                            {dropdownData.maritalstatus && dropdownData.maritalstatus.length > 0 ? (

                              // If dropdownData.projectstatus is not empty, map over its contents
                              dropdownData.maritalstatus.map(option => (
                                <option key={option.masterId} value={option.data}>
                                  {option.data}
                                </option>
                              ))
                            ) : (
                              // If dropdownData.projectstatus is empty, display a placeholder option
                              <option value="" disabled>Marital Status Not available</option>
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="input-row">
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="gender"> Gender</label>
                          <select
                            className='selectIM'
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                          >
                            <option value="" selected disabled hidden> </option>

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
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                          <label htmlFor="nationality"> Nationality</label>
                          <select
                            className='selectIM'
                            id="nationality"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            required
                          >
                            <option value="" selected disabled hidden> </option>

                            {/* Check if dropdownData.projectstatus exists and is not empty */}
                            {dropdownData.nationality && dropdownData.nationality.length > 0 ? (

                              // If dropdownData.projectstatus is not empty, map over its contents
                              dropdownData.nationality.map(option => (
                                <option key={option.id} value={option.data}>
                                  {option.data}
                                </option>
                              ))
                            ) : (
                              // If dropdownData.projectstatus is empty, display a placeholder option
                              <option value="" disabled>nationality Not available</option>
                            )}
                          </select>
                        </div>

                        {/* <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                            <label htmlFor="nationality">Nationality: </label>
                            <input  type="text" id="nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} />
                          </div> */}
                        {/* <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                <label htmlFor="designation">Designation: </label>
                <input placeholder='Enter Designation' type="A-text" id="designation" name="designation" value={formData.designation} onChange={handleInputChange} required />
              </div> */}

                        {/* <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                            <label htmlFor="designation">Designation:</label>
                            <Select
                              id="designation"
                              name="designation"
                              options={options}
                              value={options.find(option => option.value === formData.designation)}
                              onChange={handleSelectChange}
                              onInputChange={handledataChange}
                              placeholder="Select a designation"
                              isClearable
                              isLoading={isLoading}
                              noOptionsMessage={() => isLoading ? 'Loading...' : 'No options'}
                            />
                          </div> */}
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="designation">Designation</label>
                          <select
                            className='selectIM'
                            id="designation"
                            name="designation"
                            value={dropdownData.designation.find(option => option.value === formData.designation)}
                            onChange={handleChange}
                            required
                          >
                            <option value="" selected disabled hidden> </option>

                            {/* Check if dropdownData.projectstatus exists and is not empty */}
                            {dropdownData.designation && dropdownData.designation.length > 0 ? (

                              // If dropdownData.projectstatus is not empty, map over its contents
                              dropdownData.designation.map(option => (
                                <option key={option.masterId} value={option.data}>
                                  {option.data}
                                </option>
                              ))
                            ) : (
                              // If dropdownData.projectstatus is empty, display a placeholder option
                              <option value="" disabled>Designation Not available</option>
                            )}
                          </select>
                        </div>
                        {/* <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                <label htmlFor="department">Department: </label>
                <input placeholder='Enter  Department' type="A-text" id="department" name="department" value={formData.department} onChange={handleInputChange} required />
              </div> */}
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
                            <option value="" selected disabled hidden> </option>

                            {/* Check if dropdownData.projectstatus exists and is not empty */}
                            {dropdownData.department && dropdownData.department.length > 0 ? (

                              // If dropdownData.projectstatus is not empty, map over its contents
                              dropdownData.department.map(option => (
                                <option key={option.masterId} value={option.data}>
                                  {option.data}
                                </option>
                              ))
                            ) : (
                              // If dropdownData.projectstatus is empty, display a placeholder option
                              <option value="" disabled>Departments Not available</option>
                            )}
                          </select>
                        </div>



                      </div>
                      <div className="input-row">
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
                          <label htmlFor="age"> Age </label>
                          <input
                            type="text"
                            id="age"
                            name="age"
                            className="readonly"
                            value={formData.age}
                            onChange={handleInputChange}
                            readOnly
                          />
                          {ageError && <span className='error messages' >{ageError}</span>}
                        </div>

                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="panNo">PAN Number </label>
                          <input type="text" id="panNo" name="panNo" value={formData.panNo} onChange={handleInputChange} required />
                          {panNoError && <div style={{ color: 'red' }}>{panNoError}</div>}
                        </div>
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="adhaarNo">Aadhaar Number </label>
                          <input type="text" id="adhaarNo" name="adhaarNo" value={formData.adhaarNo} onChange={handleInputChange} maxLength={12} required />

                          {adhaarNoError && <div style={{ color: 'red' }}>{adhaarNoError}</div>}
                        </div>
                        {/* <div>
                <label htmlFor="absconddate">Abscond  Date: </label>
                <DatePicker className="datePicker" id="abscondDate" name="abscondDate" value={formData.abscondDate ? moment(formData.abscondDate) : null} onChange={(date) => handleDateChange(date, "abscondDate")} />
                {dateErrors.abscondDate && <div style={{ color: 'red' }}>{dateErrors.abscondDate}</div>}

              </div> */}


                        {/* <div>
                <label htmlFor="exitDate">Exit Date: </label>
                <DatePicker className="datePicker" id="exitDate" name="exitDate" value={formData.exitDate ? moment(formData.exitDate) : null} onChange={(date) => handleDateChange(date, "exitDate")} />
                {dateErrors.exitDate && <div style={{ color: 'red' }}>{dateErrors.exitDate}</div>}

              </div> */}


                      </div>
                      <div className='input-row'>
                        <div style={{ marginTop: '1.5%', height: '96%' }}>
                          <div>

                            <label htmlFor="contactNo"> Alternate Mobile Number</label>

                            <div className='mobileDropdown'>

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
                                <option value="" selected >+91</option>
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
                              />
                            </div>
                            {alternateContactNoError && <div className="error-message">{alternateContactNoError}</div>}
                          </div>
                        </div>
                        {/* <div>
                            <label htmlFor="alternateContactNo">Alternate Mobile Number:</label>
                            <input
                              type="text"
                              id="alternateContactNo"
                              name="alternateContactNo"
                              className="alternateContactNo"
                              value={formData.alternateContactNo}
                              onChange={handleInputChange}
                            />
                            {alternateContactNoError && <div className="error">{alternateContactNoError}</div>}
                          </div> */}


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
                        <div>
                          <label htmlFor="totalExp">Total Experience (years) </label>
                          <input type="text" id="experience" name="experience" value={formData.experience} onChange={handleInputChange} />
                          {experienceError && <div style={{ color: 'red' }}>{experienceError}</div>}

                        </div>
                        <div>
                          <label htmlFor="PriorId">Prior Employee ID</label>
                          <input type="text" id="priorId" name="priorId" className="priorId" value={formData.priorId} onChange={handleInputChange} />
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

                        </div>

                        {/* <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                            <label htmlFor="presence"> Employee Status</label>
                            <select
                              className='selectIM'
                              id="presence"
                              name="presence"
                              value={formData.presence}
                              onChange={handleChange}
                              required
                            >
                              <option value="" selected disabled hidden> </option>

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
                          </div> */}
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="presence">Employee Status</label>
                          <select
                            className='selectIM'
                            id="presence"
                            name="presence"
                            value={formData.presence}
                            onChange={handleChange}
                            required
                          >
                            <option value="" selected disabled hidden></option>
                            <option value="true" >Active</option>
                            <option value="false" >Inactive</option>


                          </select>
                        </div>

                        {/* <div>
                <label htmlFor="employeeType"> Employee Type: </label>
                <input placeholder="Enter Employee Type  " type="text" id="employeeType" name="employeeType" className="employeeType" value={formData.employeeType} onChange={handleInputChange} />
              </div> */}
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
                            <option value="" selected disabled hidden></option>

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
                          <label htmlFor="division">Division</label>
                          <select
                            className='selectIM'
                            id="division"
                            name="division"
                            value={formData.division}
                            onChange={handleChange}
                            required
                          >
                            <option value="" selected disabled hidden> </option>

                            {/* Check if dropdownData.projectstatus exists and is not empty */}
                            {dropdownData.division && dropdownData.division.length > 0 ? (

                              // If dropdownData.projectstatus is not empty, map over its contents
                              dropdownData.division.map(option => (
                                <option key={option.masterId} value={option.data}>
                                  {option.data}
                                </option>
                              ))
                            ) : (
                              // If dropdownData.projectstatus is empty, display a placeholder option
                              <option value="" disabled>Division  Not available</option>
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


                        </div> */}
                    </div>
                    <div className="box-container address-info-box">
                      <h4 className="text-left" style={{ textDecoration: 'underline', marginBottom: '20px', fontSize: "16px" }}>Address Information</h4>

                      <div className="form-header-h4">
                        <h4 className="text-left" style={{ textDecoration: 'underline', marginBottom: '20px' }}>Permanent Address</h4>
                      </div>
                      <div className="input-row">
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="permanentHouseNo">House Number & Complex</label>
                          {/* <input placeholder='Enter House House' type="A-text" id="permanentHouseNo" name="permanentHouseNo" value={formData.permanentHouseNo} onChange={handleInputChange} /> */}
                          <input type="text" id="permanentHouseNo" name="permanentHouseNo" value={formData.permanentHouseNo} onChange={handleInputChange} required />

                        </div>
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="permanentStreet">Street </label>
                          <input type="text" id="permanentStreet" name="permanentStreet" value={formData.permanentStreet} onChange={handleInputChange} required />
                        </div>
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="permanentPostelcode">Postal Code</label>
                          <input
                            type="text"
                            id="permanentPostelcode"
                            name="permanentPostelcode"
                            value={formData.permanentPostelcode}
                            onChange={handleInputChange}
                            required
                            maxLength={6}
                          />
                          {permanentPostcodeError && <span style={{ color: 'red' }}>{permanentPostcodeError}</span>}
                        </div>


                      </div>
                      <div className="input-row">
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="country">Country</label>
                          <select
                            value={formData.countryName}
                            onChange={(event) => handleCountryChange(event, 'permanent')}
                            required
                            className='selectIM'
                          >
                            <option value="" ></option>
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
                            disabled={!formData.permanentCountry}
                            required
                            className='selectIM'
                          >
                            <option value="" disabled> </option>
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
                          <select required
                            value={permanentCities.find(city => city.cityName === formData.permanentCity)?.id || ''}
                            onChange={(event) => handleCityChange(event, 'permanent')}
                            disabled={!formData.permanentState}
                            className='selectIM'
                          >
                            <option value="" disabled> </option>
                            {permanentCities.map(city => (
                              <option key={city.id} value={city.id}>
                                {city.cityName}
                              </option>
                            ))}
                          </select>
                        </div>

                      </div>


                      {/* {validationErrors.subIndustry && <p className="error-message">{validationErrors.subIndustry}</p>} */}
                      {/* <div>
            <label>
              Permanent Address is Same as Current
              <input className='input-checkbox' type="checkbox" onChange={handleCheckboxChange} />
            </label>
          </div> */}
                      <label style={{ fontWeight: 'lighter', display: 'flex', alignItems: 'center', marginBottom: '3%', marginTop: '3%' }}>
                        Permanent Address is Same as Current
                        <input
                          className='input-checkbox'
                          type="checkbox"
                          onChange={handleCheckboxChange}
                          disabled={isCheckboxDisabled}  // Set the disabled property based on the condition
                          style={{ transform: 'scale(1.4)', marginLeft: '15px' }}   // Adjusting the size and spacing of the checkbox
                        />
                      </label>



                      <div className="form-header-h4">
                        <h4 className="text-left" style={{ textDecoration: 'underline', marginBottom: '20px', marginTop: '20px' }}>Current Address</h4>
                      </div>

                      <div className="input-row">
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="currentHouseNo">House Number & Complex </label>
                          <input type="text" id="currentHouseNo" name="currentHouseNo" value={formData.currentHouseNo} onChange={handleInputChange} required />
                        </div>
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="currentStreet">Street </label>
                          <input type="text" id="currentStreet" name="currentStreet" value={formData.currentStreet} onChange={handleInputChange} required />
                        </div>
                        <div>
                          <span className="required-marker">*</span>
                          <label htmlFor="currentPostelcode">Postal Code</label>
                          <input
                            type="text"
                            id="currentPostelcode"
                            name="currentPostelcode"
                            value={formData.currentPostelcode}
                            onChange={handleInputChange}
                            required
                            maxLength={6}
                          />
                          {currentPostcodeError && <span style={{ color: 'red' }}>{currentPostcodeError}</span>}
                        </div>
                      </div>
                      <div className="input-row">



                        <div className="input-row">
                          <div>
                            <span className="required-marker">*</span>
                            <label htmlFor="country">Country</label>

                            <select
                              value={formData.countryName}
                              onChange={(event) => handleCountryChange(event, 'current')}
                              readOnly
                              className='selectIM'
                            >
                              <option value="" >{formData.permanentCountry}</option>
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
                              className='selectIM'
                            >
                              <option value="" > {formData.permanentState}</option>
                              {currentStates.map(state => (
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
                              value={currentCities.find(city => city.cityName === formData.currentCity)?.id || ''}
                              onChange={(event) => handleCityChange(event, 'current')}
                              disabled={!formData.currentCountry}
                              className='selectIM'
                            >
                              <option value="" > {formData.permanentCity}</option>
                              {currentCities.map(city => (
                                <option key={city.id} value={city.id}>
                                  {city.cityName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className='btnContainer'>

                        <button className='outline-btn' onClick={handleClearAll} type="button">Clear All</button>
                        <button type="submit" disabled={loading} className='btn'>
                          {loading ? 'Adding...' : 'Add Employee'}
                        </button>
                        {/* <button className='btn' onSubmit={handleSubmit}>Confirm </button> */}

                        {!showEducationForm && (
                          <button className='outline-btn' type="button" onClick={handleNext}>Next</button>

                        )}



                      </div>
                    </div>
                  </div>
                  <div className={`form-section ${activeSection === 2 ? '' : 'hidden'}`}>
                    <EducationForm />
                  </div>
                  <div className={`form-section ${activeSection === 3 ? '' : 'hidden'}`}>
                    <EmployeeHistory />
                  </div>
                  <div className={`form-section ${activeSection === 4 ? '' : 'hidden'}`}>
                    < BankDetails />
                  </div>
                  <div className={`form-section ${activeSection === 5 ? '' : 'hidden'}`}>
                    < Documents />
                  </div>
                  <div className={`form-section ${activeSection === 6 ? '' : 'hidden'}`}>
                    < Assets />
                  </div>
                </div>
              </div>
            )}
        </div>

        {activePage === 'ActiveEmp' && (
          <div>
            <ActiveEmp />
          </div>
        )}

        {activePage === 'Employee List' && (
          <div>
            <ListEmp />
          </div>
        )}

        {activePage === 'Assign Project' && (
          <div>
            <AssignEmp />
          </div>
        )}




        {/* Add educationalDetails and courses & certificates here  */}

        {/* <Link to="/Project">
            <button className='btn1' type="submit">Next</button>
          </Link> */}
        {/* <button className='btn1' type="button" onClick={handleEditModeToggle}>
            {editMode ? 'Cancel Edit' : 'Modify'}
          </button> */}
        {/* onClick={handleSubmit} */}
        {/* <button className='btn' type="submit" onSubmit={handleSubmit} >Confirm & Next</button> */}
        {/* <Link to={`/Educationform`}></Link> */}
        {/* <div>
            {!showEmploymentForm && (
              <button className='btn' type="button" onClick={() => handleSectionClick(3)}>Next</button>
            )}
          </div> */}
        {/* </Link> */}
        {/* <button className='btn1' type="submit">Generate Employee Id</button> */}

      </form>
    </>
  );
};

export default AddEmp;










































// const [countryOptions, setCountryOptions] = useState([]);

// useEffect(() => {
//   fetchData("country");
// }, []);

// const fetchData = async (key) => {
//   try {
//     const response = await fetch(`http://52.66.137.154:5557/GetDataByKey/${key}`);
//     const data = await response.json();
//     setCountryOptions(data);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// };


// const [currentAddress, setCurrentAddress] = useState({
//   currentHouseNo: '',
//   currentStreet: '',
//   currentCity: '',
//   currentState: '',
//   currentPostelcode: '',
//   currentCountry: ''
// });

// const [permanentAddress, setPermanentAddress] = useState({
//   permanentHouseNo: '',
//   permanentStreet: '',
//   permanentCity: '',
//   permanentState: '',
//   permanentPostelcode: '',
//   permanentCountry: ''
// });

// Current address state


// // Function to handle checkbox change
// const handleCheckboxChange = (e) => {
//   const { checked } = e.target;
//   if (checked) {
//     // If checked, set permanent address same as current address
//     setCurrentAddress(permanentAddress);
//   } else {
//     // If unchecked, clear current address
//     setCurrentAddress({
//       permanentHouseNo: '',
//       permanentStreet: '',
//       permanentCity: '',
//       permanentState: '',
//       permanentPostelcode: '',
//       PermanentCountry: ''
//     });
//   }
// };


// const handleCurrentAddressChange = (e) => {
//   const { name, value } = e.target;
//   const updatedAddress = { ...currentAddress, [name]: value };
//   setCurrentAddress(updatedAddress);
//   setFormData({ ...formData, currentAddress: updatedAddress });
// };

// const handlePermanentAddressChange = (e) => {
//   const { name, value } = e.target;
//   const updatedAddress = { ...permanentAddress, [name]: value };
//   setPermanentAddress(updatedAddress);
//   setFormData({ ...formData, permanentAddress: updatedAddress });
// };
// const handlePermanentAddressChange = (e) => {
//   const { name, value } = e.target;
//   setPermanentAddress({
//     ...permanentAddress,
//     [name]: value
//   });
// };
// const handleCurrentAddressChange = (e) => {
//   const { name, value } = e.target;
//   setCurrentAddress({
//     ...currentAddress,
//     [name]: value
//   });
// };
// const fetchemployeeId = async () => {
//   try {
//     const response = await Axios.get(`http://52.66.137.154:5557/getemployeeById/${id}`);
//     setFormData(response.data);
//   } catch (error) {
//     console.error('Error fetching employee by ID:', error);
//   }
// };
// const handleCurrentAddressChange = (e) => {
//   const { name, value } = e.target;
//   setCurrentAddress({
//     ...currentAddress,
//     [name]: value
//   });
// };
// const handlePermanentAddressChange = (e) => {
//   const { name, value } = e.target;
//   setPermanentAddress({
//     ...permanentAddress,
//     [name]: value
//   });
// };
// const [currencies, setCurrencies] = useState([]);

// useEffect(() => {
//   fetchCurrencies();

//   fetch('https://restcountries.com/v3/all')
//     .then(response => response.json())
//     .then(data => {
//       const nationalities = data.map(country => country.name.common);
//       setNationalities(nationalities);
//     })
//     .catch(error => console.error('Error fetching nationalities:', error));
// }, []);

// const fetchCurrencies = async () => {
//   try {
//     const response = await fetch('https://open.er-api.com/v6/latest');
//     if (!response.ok) {
//       throw new Error('Failed to fetch currencies');
//     }
//     const data = await response.json();
//     const currencyList = Object.keys(data.rates);
//     setCurrencies(currencyList);
//   } catch (error) {
//     console.error('Error fetching currencies:', error);
//   }
// };
// const dropdownKeys = ['country', 'city', 'language', /* Add other key values here */];
// const [dropdownData, setDropdownData] = useState({});

// const [selectedKey, setSelectedKey] = useState('');
// const fetchDataByKey = async (key) => {
//   try {
//     const response = await axios.get(`http://52.66.137.154:5557/GetDataByKey/${key}`);
//     setDropdownData(response.data);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// };

// const fetchDataByKey = async (key) => {
//   // Replace 'keyva,lue' with the actual key value you want to fetch
//   const keyvalue = "nationality";
//   axios.get(`http://52.66.137.154:5557/GetDataByKey/nationality`)
//     .then(response => {
//       this.setState({
//         searchData: response.data,
//         error: null
//       });
//     })
//     .catch(error => {
//       this.setState({
//         searchData: [],
//         error: error.message
//       });
//     });
// }

// const fetchDataByKey2 = async (key) => {
//   // Replace 'keyva,lue' with the actual key value you want to fetch
//   const keyvalue = " ";
//   axios.get(`http://52.66.137.154:5557/GetDataByKey/`)
//     .then(response => {
//       this.setState({
//         searchData: response.data,
//         error: null
//       });
//     })
//     .catch(error => {
//       this.setState({
//         searchData: [],
//         error: error.message
//       });
//     });
// }
//   render() {
//     const { searchData, error } = this.state;

//     return (
//         <div>
//         {error && <div>Error: {error}</div>}
//         <h1>Search Data</h1>
//         <select>
//           {searchData.map(item => (
//             <option key={item.masterId}>{item.data}</option>
//           ))}
//         </select>
//       </div>

//     );
//   }
// }



// useEffect(() => {
//   if (selectedKey) {
//     fetchDataByKey(selectedKey);
//   }
// }, [selectedKey]);

// const handleDateChange = (date, name) => {
//   setFormData({
//     ...formData,
//     [name]: date,
//   });
// };
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     console.log("Form Data: ", formData);

//     // Validate form data
//     if (isFormDataValid(formData)) {
//       const response1 = await Axios.post('http://52.66.137.154:5557/employees/add', formData);
//       if (response1.status === 200) {
//         alert('Employee added successfully');
//         // Clear the form data after successful submission
//         setFormData(initialFormData);
//       } else {
//         console.error(formData+'Failed to add employee');
//       }
//     } else {
//       console.error('Form data is not valid');
//     }
//   } catch (error) {
//     console.error('Error adding employee:', error);
//   }
// };

// // Function to check if form data is valid
// const isFormDataValid = (formData) => {
//   // Example: Check if firstName is not empty
//   if (!formData.firstName || formData.firstName.trim() === '') {
//     return false;
//   }

//   // Add similar checks for other required fields

//   return true;
// };

// // Initial form data
// const initialFormData = {
//   id: '',
//   firstName: '',
//   lastName: '',
//   // Add other fields with initial values
// };

// const handleSubmit = (e) => {
//   e.preventDefault();
//   axios.post(`http://${strings.localhost}/employees/add`, formData)
//     .then(response => {
//       console.log(formData);
//       alert('Employee added successfully');
//     })
//     .catch(error => {
//       console.error("Error:", error);
//       alert('Failed to add employee. Please check console for details.');
//     });
// };