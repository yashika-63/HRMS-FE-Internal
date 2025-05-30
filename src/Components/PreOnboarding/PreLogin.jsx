import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { showToast } from "../../Api.jsx";
import { useNavigate } from 'react-router-dom';
import { strings } from "../../string.jsx";
const PreLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com)$/;
    return regex.test(email);
  };

  const handleSave = async () => {
    let hasError = false;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password cannot be empty.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    const token = password;
    const apiUrl = `http://${strings.localhost}/api/preregistration/login?email=${email}&preLoginToken=${token}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.preLoginToken) {
        localStorage.setItem('PreLoginToken', response.data.preLoginToken);
        localStorage.setItem('Id', response.data.id);
        if (response.data.company && response.data.company.id) {
          localStorage.setItem('companyId', response.data.company.id);
          localStorage.setItem('companyName', response.data.company.companyName);
          localStorage.setItem('companyType', response.data.company.companyType);
        }

        if (response.data.firstName && response.data.lastName) {
          const name = `${response.data.firstName} ${response.data.lastName}`;
          localStorage.setItem('name', name);

        }

        if (response.data.email) {
          localStorage.setItem('email', response.data.email);
        }

        alert("Login successful.");
        navigate("/CandidatePortal");
      } else {
        const errorMessage = response.data?.details || response.data?.message || 'Invalid login credentials.';
        console.log("error",response.data.message);
        showToast(errorMessage , 'error');
      }
    } catch (error) {
      console.error("Error during API call:", error);
      const apiErrorMessage = error?.response?.data?.details  || error?.response?.data?.message  || "Failed to login. Please try again.";
      showToast(apiErrorMessage, 'error');
      setEmailError(apiErrorMessage);
    }

  };

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    if (!validateEmail(inputEmail)) {
      setEmailError("Invalid email format.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    if (!inputPassword) {
      setPasswordError("Password cannot be empty.");
    } else {
      setPasswordError("");
    }
  };

  return (
    <div className="coreContainer">
      <div className="logincontainer">
        <div className="form-container">
          <div className="login-container">
            <div className="logo">
              <img src="/LoginLong.png" alt="Pristine Logo" style={{ width: '90%' }} />
            </div>
          </div>
          <form onSubmit={handleSave}>
            <div className="input-group">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                placeholder='Enter Email'
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>

            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                placeholder='Enter Password'
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            {emailError && <p className="error-message">{emailError}</p>}

            {passwordError && <p className="error-message">{passwordError}</p>}
            <button type="button" className="loginbutton" onClick={handleSave}>Save</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreLogin;
