import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Registration.css';
import { strings } from '../../string';
import { useNavigate } from 'react-router-dom';
import {  toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from '../../Api.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faKey } from '@fortawesome/free-solid-svg-icons';

const Registration = () => {
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    division: '',
    department: '',
    module: '',
    companyId: '',
    accountId: '',
    designation: '',
    companyRole: '',
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasDigit: false,
    hasLowercase: false,
    hasUppercase: false,
    hasSpecialChar: false,
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showValidationMessage, setShowValidationMessage] = useState(false); // Flag to show validation message

  const { id } = useParams();
  const accountId = localStorage.getItem("accountId");
  const companyId = localStorage.getItem("companyId");
  const companyRole = localStorage.getItem("companyRole");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Password validation logic
    if (name === 'password') {
      const newCriteria = {
        minLength: value.length >= 8,
        hasDigit: /\d/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasUppercase: /[A-Z]/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      };
      setPasswordCriteria(newCriteria);
      
      // Show validation message if the password field is not empty and some criteria are not met
      setShowValidationMessage(value.length > 0 && !Object.values(newCriteria).every(Boolean));
    }
  };

  const handleCopy = (e) => {
    e.preventDefault();
    showToast('Copying is not allowed.','warn');
  };

  const handlePaste = (e) => {
    e.preventDefault();
    showToast('Pasting is not allowed.','warn');
  };

  const handleCut = (e) => {
    e.preventDefault();
    showToast('cut paste is not allowed.','warn');
  };

  const fetchEmployeeDetails = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${id}`);
      const employee = response.data;
      setFormData({
        ...formData,
        employeeId: employee.id,
        department: employee.department,
        firstName: employee.firstName,
        middleName: employee.middleName,
        lastName: employee.lastName,
        email: employee.email,
        division: employee.division,
        companyRole: employee.designation,
        companyId,
        accountId,
      });
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password and confirm password validation
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match.','error'); 
      return;
    }

    // Password validation check
    if (
      !passwordCriteria.minLength ||
      !passwordCriteria.hasDigit ||
      !passwordCriteria.hasLowercase ||
      !passwordCriteria.hasUppercase ||
      !passwordCriteria.hasSpecialChar
    ) {
      showToast('Password does not meet the required criteria.','warn'); 
      return;
    }

    if (!formData.role || !formData.email || !formData.password) {
      showToast('Please fill in all required fields.','warn'); 
      return;
    }

    try {
      const response = await axios.post(`http://${strings.localhost}/api/v1/auth/register`, formData);
      setSuccessMessage('Registration successful!');
      showToast('Registration successful','success'); 
    } catch (error) {
      console.error('Error:', error);

      if (error.response && error.response.data && error.response.data.details) {
        const errorMessage = error.response.data.details || 'An error occurred. Please try again.';
        toast.error(errorMessage);
      } else {
        showToast('An unexpected error occurred. Please try again.','error'); 
      }
    }
  };

  return (
    <div className="Regcontainer">
      <h2 className="title">Register User</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email:</label>
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" style={{marginTop:'5px'}} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly
            />
        </div>

        <div className="input-group">
          <label>Password:</label>
         
            <FontAwesomeIcon icon={faLock} className="input-icon"style={{marginTop:'5px'}} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              onCopy={handleCopy}
              onPaste={handlePaste}
              onCut={handleCut} />
     
        </div>

        <div className="input-group">
          <label>Confirm Password:</label>
          <div>
            <FontAwesomeIcon icon={faKey} className="input-icon" style={{marginTop:'5px'}}/>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              onCopy={handleCopy}
              onPaste={handlePaste}
              onCut={handleCut}
            />
          </div>
        </div>

        {/* Show password validation only if the password doesn't meet criteria */}
     

        <div className="input-group">
          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="" selected disabled hidden>
              Select role
            </option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {showValidationMessage && formData.password && (
          <div className="password-validation-message" style={{width:'100%'}}>
            <p>Password must meet the following criteria:</p>
            <ul>
              <li style={{ color: passwordCriteria.minLength ? 'green' : 'red' }}>
                {passwordCriteria.minLength ? '✔' : '❌'} Minimum 8 characters
              </li>
              <li style={{ color: passwordCriteria.hasDigit ? 'green' : 'red' }}>
                {passwordCriteria.hasDigit ? '✔' : '❌'} At least one digit
              </li>
              <li style={{ color: passwordCriteria.hasLowercase ? 'green' : 'red' }}>
                {passwordCriteria.hasLowercase ? '✔' : '❌'} At least one lowercase letter
              </li>
              <li style={{ color: passwordCriteria.hasUppercase ? 'green' : 'red' }}>
                {passwordCriteria.hasUppercase ? '✔' : '❌'} At least one uppercase letter
              </li>
              <li style={{ color: passwordCriteria.hasSpecialChar ? 'green' : 'red' }}>
                {passwordCriteria.hasSpecialChar ? '✔' : '❌'} At least one special character
              </li>
            </ul>
          </div>
        )}
        <div className="btnContainer">
          <button type="submit" className="btn">
            Register
          </button>
          <button className="outline-btn" type="button" onClick={() => navigate('/ListEmp')}>
            Back
          </button>
        </div>
      </form>

 <ToastContainer/>
    </div>
  );
};

export default Registration;
