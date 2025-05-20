import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../../Api.jsx';
import { strings } from '../../string.jsx';
const PersonalDetails = ({ ticketDetails, nextStep, prevStep, ticket, ticketId }) => {

    const [personalDetails, setPersonalDetails] = useState(ticketDetails?.preRegistration || {});
    const preRegistrationId = localStorage.getItem("Id");
    const [isUpdate, setIsUpdate] = useState(false);
    const [countries, setCountries] = useState([]);
    const [permanentStates, setPermanentStates] = useState([]);
    const [permanentCities, setPermanentCities] = useState([]);
    const [currentStates, setCurrentStates] = useState([]);
    const [currentCities, setCurrentCities] = useState([]);
    const preLoginToken = localStorage.getItem("PreLoginToken");
    const [formData, setFormData] = useState({
        employeeId: '',
        firstName: '',
        middleName: '',
        lastName: '',
        motherName: '',
        contactNo: '',
        emailId: '',
        maritalStatus: '',
        gender: '',
        nationality: '',
        dateOfBirth: '',
        age: '',
        panNo: '',
        adhaarNo: '',
        alternateContactNo: '',
        emergencyContactNumber: '',
        alternateEmail: '',
        totalExperience: '',

        currentHouseNo: '',
        currentStreet: '',
        currentPostelcode: '',
        currentCountry: '',
        currentState: '',
        currentCity: '',


        permanentHouseNo: '',
        permanentStreet: '',
        permanentPostelcode: '',
        permanentCountry: '',
        permanentState: '',
        permanentCity: '',

        isPermanentSameAsCurrent: false,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/employeedata/get-by-prereg?preRegistrationId=${preRegistrationId}&preLoginToken=${preLoginToken}`);
                if (response.data) {
                    setFormData(response.data);
                    setIsUpdate(true);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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
    const fetchValueByKey = async (keyvalue) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/master/GetDataByKey/${keyvalue}`);
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
        const selectedCountryId = Number(event.target.value);
        const selectedOption = countries.find(country => country.id === selectedCountryId);
        if (!selectedOption) return;

        if (type === 'permanent') {
            setFormData((prev) => ({
                ...prev,
                permanentCountry: selectedOption.countryName, // save name
                permanentState: '',
                permanentCity: '',
            }));
            setPermanentStates([]);
            setPermanentCities([]);
        } else {
            setFormData((prev) => ({
                ...prev,
                currentCountry: selectedOption.countryName, // save name
                currentState: '',
                currentCity: '',
            }));
            setCurrentStates([]);
            setCurrentCities([]);
        }

        fetchStates(selectedCountryId, type);
    };

    const handleStateChange = (event, type) => {
        const selectedStateId = Number(event.target.value);
        const stateList = type === 'permanent' ? permanentStates : currentStates;
        const selectedState = stateList.find(state => state.id === selectedStateId);
        if (!selectedState) return;

        if (type === 'permanent') {
            setFormData((prev) => ({
                ...prev,
                permanentState: selectedState.stateName, // save name instead of ID
                permanentCity: '', // clear city on state change
            }));
            setPermanentCities([]);
        } else {
            setFormData((prev) => ({
                ...prev,
                currentState: selectedState.stateName, // save name instead of ID
                currentCity: '',
            }));
            setCurrentCities([]);
        }

        fetchCities(selectedStateId, type);
    };



    const handleCityChange = (event, type) => {
        const selectedCityId = Number(event.target.value);
        const cityList = type === 'permanent' ? permanentCities : currentCities;
        const selectedCity = cityList.find(city => city.id === selectedCityId);
        if (!selectedCity) return;

        if (type === 'permanent') {
            setFormData((prev) => ({
                ...prev,
                permanentCity: selectedCity.cityName, // save city name instead of ID
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                currentCity: selectedCity.cityName, // save city name instead of ID
            }));
        }
    };


    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const maritalstatus = await fetchDataByKey('maritalstatus');
                const gender = await fetchDataByKey('gender');
                const nationality = await fetchValueByKey('nationality');

                setDropdownData({
                    maritalstatus,
                    gender,
                    nationality,
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
                console.log('Response:', error.response.data);
            }
        };

        fetchDropdownData();
    }, []);

    const [dropdownData, setDropdownData] = useState({
        maritalstatus: [],
        gender: [],
        nationality: []
    });
    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;

        let updatedValue = type === 'checkbox' ? checked : value;

        // Update the form data
        setFormData((prev) => ({
            ...prev,
            [name]: updatedValue,
        }));

        // Run validation on the field immediately
        const errorMessage = validateField(name, updatedValue);
        setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
        }));

        // Special handling for dateOfBirth to also calculate age
        if (name === 'dateOfBirth') {
            const age = calculateAge(value);
            setFormData((prev) => ({
                ...prev,
                age: age,
            }));
        }

        // Handle checkbox for "isPermanentSameAsCurrent"
        if (name === 'isPermanentSameAsCurrent') {
            if (checked) {
                setFormData((prev) => ({
                    ...prev,
                    permanentHouseNo: prev.currentHouseNo,
                    permanentStreet: prev.currentStreet,
                    permanentPostelcode: prev.currentPostelcode,
                    permanentCountry: prev.currentCountry,
                    permanentState: prev.currentState,
                    permanentCity: prev.currentCity,
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    permanentHouseNo: '',
                    permanentStreet: '',
                    permanentPostelcode: '',
                    permanentCountry: '',
                    permanentState: '',
                    permanentCity: '',
                }));
            }
        }
    };



    const validateField = (name, value) => {
        const nameRegex = /^[A-Z][a-zA-Z]*$/;
        const mobileRegex = /^[0-9]{10}$/;
        const postalCodeRegex = /^[0-9]{6}$/;
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        const aadhaarRegex = /^[0-9]{12}$/;
        const experienceRegex = /^[0-9]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        switch (name) {
            case 'firstName':
            case 'lastName':
            case 'motherName':
                if (!nameRegex.test(value)) return 'Must start with a capital letter and contain only alphabets.';
                break;
            case 'contactNo':
            case 'alternateContactNo':
            case 'emergencyContactNumber':
                if (!mobileRegex.test(value)) return 'Must be 10 digits.';
                break;
            case 'currentPostelcode':
            case 'permanentPostelcode':
                if (!postalCodeRegex.test(value)) return 'Must be 6 digits.';
                break;
            case 'panNo':
                if (!panRegex.test(value)) return 'Invalid PAN Number.';
                break;
            case 'adhaarNo':
                if (!aadhaarRegex.test(value)) return 'Must be 12 digits.';
                break;
            case 'totalExperience':
                if (!experienceRegex.test(value)) return 'Must be numeric.';
                break;
            case 'emailId':
            case 'alternateEmail':
                if (value && !emailRegex.test(value)) return 'Invalid email format.';
                break;
            case 'dateOfBirth':
                const today = new Date();
                const dob = new Date(value);
                const age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                const dayDiff = today.getDate() - dob.getDate();
                if (
                    age < 18 ||
                    (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
                ) {
                    return 'Age must be 18 or older.';
                }
                break;
            default:
                return '';
        }

        return '';
    };


    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const value = formData[key];
            if (['alternateMobileNumber', 'emergencyContactNumber', 'alternateEmail', 'totalExperience'].includes(key)) {
                return;
            }
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                Object.keys(value).forEach((subKey) => {
                    const error = validateField(`${key}.${subKey}`, value[subKey]);
                    if (error) newErrors[`${key}.${subKey}`] = error;
                });
            } else {
                const error = validateField(key, value);
                if (error) newErrors[key] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1;
        }
        return age;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        try {
            const { id: verificationTicketId } = ticketDetails || {};
            const apiUrl = isUpdate
                ? `http://${strings.localhost}/api/employeedata/update/${formData.id}` // Update API
                : `http://${strings.localhost}/api/employeedata/save?preRegistrationId=${preRegistrationId}&verificationTicketId=${verificationTicketId}&preLoginToken=${preLoginToken}`; // Save API

            const method = isUpdate ? 'put' : 'post';
            const response = await axios[method](apiUrl, formData);

            if (response.status === 200) {
                const message = response.data || (isUpdate ? 'Data updated successfully!' : 'Data saved successfully!');
                showToast(message, 'success');

                nextStep(); // Only move to the next step if it's a new save
            }
        } catch (error) {
            console.error("Submit Error:", error);
            showToast(error.response?.data?.message || "Something went wrong", 'error');
        }
    };

    return (
        <div className='coreContainer' style={{ marginTop: '50px' }}>
            <form onSubmit={handleSubmit} >
                <h3 className='underlineText'>Personal Details</h3>
                <div className='input-row'>

                    <div>
                        <span className="required-marker">*</span>
                        <label>First Name </label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        {errors.firstName && <span className="error">{errors.firstName}</span>}
                    </div>
                    <div>
                        <span className="required-marker">*</span>
                        <label>Middle Name</label>
                        <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} />
                        {errors.middleName && <span className="error">{errors.middleName}</span>}

                    </div>
                    <div>
                        <span className="required-marker">*</span>
                        <label>Last Name </label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        {errors.lastName && <span className="error">{errors.lastName}</span>}
                    </div>
                    <div>
                        <label>Mother's Name</label>
                        <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} />
                        {errors.motherName && <span className="error">{errors.motherName}</span>}
                    </div>
                </div>
                <div className='input-row'>

                    <div>
                        <span className="required-marker">*</span>
                        <label>Mobile Number </label>
                        <input type="text" name="contactNo" value={formData.contactNo} onChange={handleChange} required />
                        {errors.contactNo && <span className="error">{errors.contactNo}</span>}
                    </div>
                    <div>
                        <span className="required-marker">*</span>
                        <label>Email ID</label>
                        <input
                            type="email"
                            name="emailId"
                            value={formData.emailId}
                            onChange={handleChange}
                            required
                        />
                        {errors.emailId && (
                            <span className="error">{errors.emailId}</span>
                        )}
                    </div>
                    <div>
                        <span className="required-marker">*</span>
                        <label>PAN Number </label>
                        <input type="text" name="panNo" value={formData.panNo} onChange={handleChange} required />
                        {errors.panNo && <span className="error">{errors.panNo}</span>}
                    </div>
                    <div>
                        <span className="required-marker">*</span>
                        <label>Date of Birth </label>
                        <input className='selectIM' type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                        {errors.dateOfBirth && <span className="error">{errors.dateOfBirth}</span>}
                    </div>
                    <div>
                        <span className="required-marker">*</span>
                        <label>Age </label>
                        <input type="text" name="age" value={formData.age} onChange={handleChange} readOnly />
                        {errors.age && <span className="error">{errors.age}</span>}
                    </div>
                </div>
                <div className='input-row'>
                    <div>
                        <span className="required-marker">*</span>
                        <label>Marital Status</label>
                        <select name="maritalStatus" className='selectIM' value={formData.maritalStatus} onChange={handleChange} required>
                            <option value="" disabled hidden>Select</option>
                            {dropdownData.maritalstatus && dropdownData.maritalstatus.length > 0 ? (
                                dropdownData.maritalstatus.map((option) => (
                                    <option key={option.masterId} value={option.data}>
                                        {option.data}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Marital Status Not available</option>
                            )}
                        </select>
                        {errors.maritalStatus && <span className="error">{errors.maritalStatus}</span>}
                    </div>
                    <div>
                        <span className="required-marker">*</span>
                        <label>Gender </label>
                        <select name="gender" className='selectIM' value={formData.gender} onChange={handleChange} required>
                            <option value="" disabled hidden>Select</option>
                            {dropdownData.gender?.length > 0 ? (
                                dropdownData.gender.map((option) => (
                                    <option key={option.masterId} value={option.data}>
                                        {option.data}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Gender Not available</option>
                            )}
                        </select>
                        {errors.gender && <span className="error">{errors.gender}</span>}
                    </div>

                    <div>
                        <span className="required-marker">*</span>
                        <label>Nationality </label>
                        <select name="nationality" className='selectIM' value={formData.nationality} onChange={handleChange} required>
                            <option value="" disabled hidden>Select</option>
                            {dropdownData.nationality?.length > 0 ? (
                                dropdownData.nationality.map((option) => (
                                    <option key={option.masterId} value={option.data}>
                                        {option.data}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Nationality Not available</option>
                            )}
                        </select>
                        {errors.nationality && <span className="error">{errors.nationality}</span>}
                    </div>

                    <div>
                        <span className="required-marker">*</span>
                        <label>Aadhaar Number </label>
                        <input type="text" name="adhaarNo" value={formData.adhaarNo} onChange={handleChange} required />
                        {errors.adhaarNo && <span className="error">{errors.adhaarNo}</span>}
                    </div>

                </div>
                <div className='input-row'>

                    <div>
                        <label>Alternate Mobile Number</label>
                        <input type="text" name="alternateContactNo" value={formData.alternateContactNo} onChange={handleChange} />
                        {errors.alternateContactNo && <span className="error">{errors.alternateContactNo}</span>}
                    </div>
                    <div>
                        <label>Emergency Contact Number</label>
                        <input type="text" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} />
                        {errors.emergencyContactNumber && <span className="error">{errors.emergencyContactNumber}</span>}
                    </div>
                    <div>
                        <label>Alternate Email ID</label>
                        <input
                            type="email"
                            name="alternateEmail"
                            value={formData.alternateEmail}
                            onChange={handleChange}
                        />
                        {errors.alternateEmail && (
                            <span className="error">{errors.alternateEmail}</span>
                        )}
                    </div>


                    <div>
                        <label>Total Experience (years) </label>
                        <input type="text" name="totalExperience" value={formData.totalExperience} onChange={handleChange} />
                        {errors.totalExperience && <span className="error">{errors.totalExperience}</span>}
                    </div>
                </div>
                <div>
                    <h3 className='underlineText'>Permanent Address</h3>
                    <br />
                    <div className='input-row'>
                        <div>
                            <label>House Number & Complex</label>
                            <input type="text" name="permanentHouseNo" value={formData.permanentHouseNo} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>Street</label>
                            <input type="text" name="permanentStreet" value={formData.permanentStreet} onChange={handleChange} required />
                        </div>
                        <div>
                            <label>Postal Code</label>
                            <input type="text" name="permanentPostelcode" value={formData.permanentPostelcode} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className='input-row'>
                        <div>
                            <label>Country</label>
                            <select
                                value={countries.find(c => c.countryName === formData.permanentCountry)?.id || ''}

                                onChange={(event) => handleCountryChange(event, 'permanent')}
                                className='selectIM'
                            >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                    <option key={country.id} value={country.id}>
                                        {country.countryName}
                                    </option>
                                ))}
                            </select>

                        </div>
                        <div>
                            <label>State</label>
                            <select
                                value={permanentStates.find(s => s.stateName === formData.permanentState)?.id || ''}

                                onChange={(event) => handleStateChange(event, 'permanent')}
                                disabled={!formData.permanentCountry}
                                className='selectIM'
                            >
                                <option value="">Select State</option>
                                {permanentStates.map((state) => (
                                    <option key={state.id} value={state.id}>
                                        {state.stateName}
                                    </option>
                                ))}
                            </select>


                        </div>
                        <div>
                            <label>City</label>
                            <select
                                value={permanentCities.find(city => city.cityName === formData.permanentCity)?.id || ''}

                                onChange={(event) => handleCityChange(event, 'permanent')}
                                disabled={!formData.permanentCountry}
                                className='selectIM'
                            >
                                <option value="" disabled>Select City</option>
                                {permanentCities.map(city => (
                                    <option key={city.id} value={city.id}>
                                        {city.cityName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                {/* <div>
                    <label>
                        <input type="checkbox" name="isPermanentSameAsCurrent" checked={formData.isPermanentSameAsCurrent} onChange={handleChange} />
                        <strong>Permanent Address is Same as Current</strong>
                    </label>
                </div> */}
                {!formData.isPermanentSameAsCurrent && (
                    <div>
                        <br />
                        <h3 className='underlineText'>Current Address</h3>
                        <br />
                        <div className='input-row'>
                            <div>
                                <label>House Number & Complex</label>
                                <input type="text" name="currentHouseNo" value={formData.currentHouseNo} onChange={handleChange} required />
                            </div>
                            <div>
                                <label>Street</label>
                                <input type="text" name="currentStreet" value={formData.currentStreet} onChange={handleChange} required />
                            </div>
                            <div>
                                <label>Postal Code</label>
                                <input type="text" name="currentPostelcode" value={formData.currentPostelcode} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className='input-row'>
                            <div>
                                <label>Country</label>
                                <select
                                    value={countries.find(c => c.countryName === formData.currentCountry)?.id || ''}

                                    onChange={(event) => handleCountryChange(event, 'current')}
                                    className='selectIM'
                                >
                                    <option value="" disabled>Select Country</option>
                                    {countries.map(country => (
                                        <option key={country.id} value={country.id}>
                                            {country.countryName}
                                        </option>
                                    ))}
                                </select>

                            </div>
                            <div>
                                <label>State</label>
                                <select
                                    value={currentStates.find(s => s.stateName === formData.currentState)?.id || ''}

                                    onChange={(event) => handleStateChange(event, 'current')}
                                    disabled={!formData.currentCountry}
                                    className='selectIM'
                                >
                                    <option value="" disabled>Select State</option>
                                    {currentStates.map(state => (
                                        <option key={state.id} value={state.id}>
                                            {state.stateName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>City</label>
                                <select
                                    value={currentCities.find(city => city.cityName === formData.currentCity)?.id || ''}

                                    onChange={(event) => handleCityChange(event, 'current')}
                                    disabled={!formData.currentCountry}
                                    className='selectIM'
                                >
                                    <option value="" disabled>Select city</option>
                                    {currentCities.map(city => (
                                        <option key={city.id} value={city.id}>
                                            {city.cityName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                <div className='btnContainer'>
                    <button className='btn' type="submit">{isUpdate ? 'Update' : 'Save'} & Next</button>
                </div>
            </form>
        </div>
    );
};

export default PersonalDetails;
