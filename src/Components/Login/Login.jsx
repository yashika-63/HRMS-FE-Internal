import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { strings } from '../../string';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const response = await axios.post(`http://${strings.localhost}/api/v1/auth/login`, {
                email,
                password

            });

            if (response.data.token) {
                setToken(response.data.token);
                localStorage.setItem('loginTime', Date.now());
                localStorage.setItem('token', response.data.token); 
                console.log('Token set in localStorage:', localStorage.getItem('token'));
                alert("Heyy, welcome " + response.data.firstName);
                localStorage.setItem('firstName', response.data.firstName); 
                localStorage.setItem('lastName', response.data.lastName); 
                localStorage.setItem('department', response.data.department);
                localStorage.setItem('division', response.data.division);
                localStorage.setItem('companyId', response.data.companyId);
                localStorage.setItem('accountId', response.data.accountId);
                localStorage.setItem('employeeId', response.data.employeeId);
                localStorage.setItem('companyRole', response.data.companyRole);
                localStorage.setItem('Role', response.data.role);


            } else {
                setError('No token received.');
            }

        } catch (err) {
            console.error('Login error:', err);
            if (err.response && err.response.data) {
                setError(` ${err.response.data.details}`);
                // setError(` ${err.response.data.message}`);

            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
        }
    };
    const handleResetPasswordClick = () => {
        navigate('/ResetpasswordPage');  
    };
    return (
        <div className="logincontainer">

            <div className="form-container">
                <h1>Login</h1>
                <div className="login-container">
                    <div className="logo">
                    <img  src="/LoginLong.png" alt="Pristine Logo" style={{width:'90%'}}/>
                    </div>
                </div>


                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                        <input
                        placeholder='Enter Email'
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className='loginbutton'>Login</button>
                </form>
                <button type="button" className="blackbutton" onClick={handleResetPasswordClick}>
                    Forgot Password: <span className="underlineText">Click Here</span>
                </button>
            </div>
        </div>
    );
};

export default Login;



































// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './Login.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
// import { strings } from '../../string';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';

// const Login = ({ setToken }) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const navigate = useNavigate();
    
//     // Check session expiration periodically
//     useEffect(() => {
//         const checkSessionExpiration = () => {
//             const storedLoginTime = localStorage.getItem('loginTime');
//             if (!storedLoginTime) {
//                 return;
//             }
            
//             const currentTime = new Date().getTime();
//             const timeElapsedInSeconds = (currentTime - storedLoginTime) / 1000; // Convert time elapsed to seconds
    
//             if (timeElapsedInSeconds > 60 * 60) {
//                 toast.warn("Session expired. Please log in again.");
//                 // Handle session expiration logic here
//                 handleLogout();  // Automatically logout if session expired
//             } else if (timeElapsedInSeconds > 30 * 60) {
//                 toast.warn("Your session will expire in 30 minutes.");
//             }
//         };

//         // Check every 1 minute
//         const interval = setInterval(checkSessionExpiration, 60 * 1000); // 1 minute

//         // Clean up the interval on component unmount
//         return () => clearInterval(interval);
//     }, []);

//     // Check session expiration on page visibility change (when coming back after sleep)
//     useEffect(() => {
//         const handleVisibilityChange = () => {
//             if (document.visibilityState === 'visible') {
//                 // When the page becomes visible, check session expiration
//                 checkSessionExpiration();
//             }
//         };

//         document.addEventListener('visibilitychange', handleVisibilityChange);

//         // Clean up the event listener on component unmount
//         return () => {
//             document.removeEventListener('visibilitychange', handleVisibilityChange);
//         };
//     }, []);

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         setError(''); // Clear any previous errors
//         try {
//             const response = await axios.post(`http://${strings.localhost}/api/v1/auth/login`, {
//                 email,
//                 password
//             });

//             if (response.data.token) {
//                 setToken(response.data.token); // This should be a function
//                 localStorage.setItem('token', response.data.token); // Save token to localStorage
//                 localStorage.setItem('loginTime', new Date().getTime()); // Store the login time
//                 console.log('Token set in localStorage:', localStorage.getItem('token'));
//                 alert("Heyy, welcome " + response.data.firstName);

//                 // Save other necessary user data to localStorage
//                 localStorage.setItem('firstName', response.data.firstName);
//                 localStorage.setItem('department', response.data.department);
//                 localStorage.setItem('division', response.data.division);
//                 localStorage.setItem('companyId', response.data.companyId);
//                 localStorage.setItem('accountId', response.data.accountId);
//                 localStorage.setItem('employeeId', response.data.employeeId);
//                 localStorage.setItem('companyRole', response.data.companyRole);
//                 localStorage.setItem('Role', response.data.role);
//             } else {
//                 setError('No token received.');
//             }
//         } catch (err) {
//             console.error('Login error:', err);
//             if (err.response && err.response.data) {
//                 setError(` ${err.response.data.details}`);
//             } else {
//                 setError('An unexpected error occurred. Please try again later.');
//             }
//         }
//     };

//     const handleResetPasswordClick = () => {
//         navigate('/ResetpasswordPage');  // Navigate to Reset Password page
//     };

//     const handleLogout = () => {
//         // Clear the session and token when logging out
//         localStorage.removeItem('token');
//         localStorage.removeItem('loginTime');
//         navigate('/login');  // Redirect to login page after logout
//     };

//     return (
//         <div className="logincontainer">
//             <div className="form-container">
//                 <h1>Login</h1>
//                 <div className="login-container">
//                     <div className="logo">
//                         <img src="/SpectrumLogo.png" style={{ width: "70%", height: "50px", marginBottom: '20px' }} alt="Spectrum Logo" />
//                     </div>
//                 </div>
//                 {error && <p className="error">{error}</p>}
//                 <form onSubmit={handleSubmit}>
//                     <div className="input-group">
//                         <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
//                         <input
//                             type="email"
//                             id="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             required
//                         />
//                     </div>
//                     <div className="input-group">
//                         <FontAwesomeIcon icon={faLock} className="input-icon" />
//                         <input
//                             type="password"
//                             id="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <button type="submit" className='btn'>Login</button>
//                 </form>
//                 <button type="button" className='blackbutton' onClick={handleResetPasswordClick}>Reset password</button>
//             </div>
//         </div>
//     );
// };

// export default Login;
