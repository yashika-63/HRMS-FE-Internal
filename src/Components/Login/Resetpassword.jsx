import React, { useState , useEffect } from 'react';
import axios from 'axios';
import { faEnvelope, faShieldAlt, faKey, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { strings } from '../../string';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { showToast } from '../../Api.jsx';

const Resetpassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [passwordValid, setPasswordValid] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0); // Track remaining time for the OTP countdown
  const [toastId, setToastId] = useState(null); 
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasDigit: false,
    hasLowercase: false,
    hasUppercase: false,
    hasSpecialChar: false,
  });
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const navigate = useNavigate();

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value);
  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    validatePassword(password);
  };
  const handleConfirmpasswordChange = (e) => setConfirmPassword(e.target.value);

  // const sendOtp = async () => {
  //   if (!email) {
  //     toast.warn('Email is required');
  //     return;
  //   }

  //   setIsOtpLoading(true);

  //   try {
  //     const response = await axios.post(`http://${strings.localhost}/api/v1/user/send-otp`, { email });
  //     toast.success(response.data.message || 'OTP sent successfully.');
  //     setIsOtpSent(true);
  //     const otpExpiryTimestamp = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
  //     setOtpExpiry(otpExpiryTimestamp);
  //     setRemainingTime(5 * 60); // Set remaining time in seconds (5 minutes)
  // // Show the countdown toast
  // const id = toast.error('OTP expires in: 05:00', { autoClose: false });
  // setToastId(id); // Save the toast ID for updating

  //   } catch (error) {
  //     toast.error(error.response ? error.response.data.message : 'Error sending OTP. Please try again.');
  //   } finally {
  //     setIsOtpLoading(false);
  //   }
  // };

  const validatePassword = (password) => {
    const newCriteria = {
      minLength: password.length >= 8,
      hasDigit: /\d/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordCriteria(newCriteria);
    setPasswordValid(
      newCriteria.minLength &&
      newCriteria.hasDigit &&
      newCriteria.hasLowercase &&
      newCriteria.hasUppercase &&
      newCriteria.hasSpecialChar
    );
  };

  const updatePassword = async () => {
    if (!email || !otp || !newPassword || !confirmPassword) {
      showToast('All fields are required.','warn');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.','warn');
      return;
    }

    if (!passwordValid) {
      showToast('Password must meet the required criteria.','warn');
      return;
    }
    if (Date.now() > otpExpiry) {
      showToast('OTP has expired. Please request a new one.','warn');
      setIsOtpSent(false);
      return;
    }

    try {
      const response = await axios.put(`http://${strings.localhost}/api/v1/user/update-password-by-otps`, {
        email,
        otp,
        newPassword,
      });
      showToast(response.data.message || 'Password updated successfully.','success');
      setTimeout(() => {
        navigate('/Login');
      }, 3000);
    } catch (error) {
      showToast(error.response ? error.response.data.message : 'Error updating password.','error');
    }
  };

  const handleBackClick = () => {
    navigate('/Login');
  };
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const sendOtp = async () => {
    if (!email) {
      showToast('Email is required','warn');
      return;
    }
  
    setIsOtpLoading(true);
  
    try {
      const response = await axios.post(`http://${strings.localhost}/api/v1/user/send-otp`, { email });
      showToast(response.data.message || 'OTP sent successfully.','success');
  
      setIsOtpSent(true);
      const otpExpiryTimestamp = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
      setOtpExpiry(otpExpiryTimestamp);
      setRemainingTime(5 * 60); // Set remaining time in seconds (5 minutes)
  
      // Show the countdown toast
      const id = toast.info('OTP expires in: 05:00', { autoClose: false });
      setToastId(id); // Save the toast ID for updating
  
    } catch (error) {
      showToast(error.response ? error.response.data.message : 'Error sending OTP. Please try again.','error');
    } finally {
      setIsOtpLoading(false);
    }
  };
  
  // Update the countdown in the toast every second
  useEffect(() => {
    if (remainingTime > 0 && isOtpSent) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
  
            // OTP expired, show error toast and refresh the page
            toast.update(toastId, {
              render: `OTP expired.`,
              type: 'error', // Change type to error when expired
              autoClose: 2000, // Auto close after 2 seconds
            });
            setTimeout(() => {
              window.location.reload(); // Refresh the page after 1 second
            }, 1000);
            return 0;
          }
  
          // Update the existing toast with new countdown
          toast.update(toastId, {
            render: `OTP expires in: ${formatTime(prevTime - 1)}`,
            type: 'info',  // Use string 'info' directly instead of toast.TYPE.INFO
            autoClose: false,
          });
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime, isOtpSent, toastId]);
  
  
  return (
    <div className='logincontainer'>
      <div className="form-container">
        <div className="whitetitle">Reset Password</div>
        <form>
          <div className="input-group">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              type="email" placeholder="Enter your email" value={email} onChange={handleEmailChange} disabled={isOtpSent} />
          </div>

          {!isOtpSent && (
            <div>
              <button type="button" className="btn" onClick={sendOtp} disabled={isOtpLoading}  >
                {isOtpLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
              <button type="button" className="btn" onClick={handleBackClick}> Back </button>
            </div>
          )}

          {isOtpSent && (
            <div className="input-group">
              <FontAwesomeIcon icon={faKey} className="input-icon" />
              <input type="otp" placeholder="Enter OTP" value={otp} onChange={handleOtpChange} />
            </div>
          )}

          {otp && (
            <div className="input-group">
              <FontAwesomeIcon icon={faShieldAlt} className="input-icon" />
              <input type="password" placeholder="Enter new password" value={newPassword} onChange={handleNewPasswordChange} />
            </div>
          )}

          {otp && (
            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={handleConfirmpasswordChange} />
            </div>
          )}

          {isOtpSent && !passwordValid && newPassword && (
            <div className="password-validation-message">
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
          <div className='pop-up'>
            {remainingTime > 0 ? (
              <p>OTP expires in: {formatTime(remainingTime)}</p>
            ) : (
              <p></p>
            )}
          </div>


          {isOtpSent && (
            <div className="input-group">
              <button className="btn" type="button" onClick={updatePassword}>
                Update Password
              </button>
              <button type="button" className="btn" onClick={handleBackClick}>
                Back
              </button>
            </div>
          )}
        </form>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Resetpassword;
