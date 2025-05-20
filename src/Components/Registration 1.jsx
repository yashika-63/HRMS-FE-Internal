// import React, { useState } from "react";
// import { Link, Navigate, useNavigate } from "react-router-dom";
// import axios from "axios"; 
// import "./Login.css";
// import PropTypes from 'prop-types';

// const Registration = ({ onRegistration }) => {
//     const [firstName, setFirstName] = useState("");
//     const [lastName, setLastName] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const navigate = useNavigate();

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         if (password !== confirmPassword) {
//             alert("Passwords do not match!");
//             return;
//         }

//         const data = {
//             firstName: firstName,
//             lastName: lastName,
//             email: email,
//             password: password,
//         };

//         try {
//             const response = await axios.post("http://localhost:8080/api/v1/auth/register", data);
//             console.log("Registration successful!", response.data);
//             alert("Registration successful!");
//             onRegistration();
//             navigate("/AddEmp");
//         } catch (error) {
//             console.error("Error registering user:", error);
//             alert("Registration failed. Please try again.");
//         }
//     };

//     return (
//         <div className="grid-container">
//             <div className="grid-left"></div>

//             <div className="login-container">
//                 <div className="text-2xl font-bold">New ID Registration</div>
//                 <br />
//                 <form className="login-form" onSubmit={handleSubmit}>
//                     <div className="name-inputs">
//                         <input
//                             type="text"
//                             placeholder="First Name"
//                             required
//                             style={{ width: "45%", marginRight: "5px" }}
//                             value={firstName}
//                             onChange={(e) => setFirstName(e.target.value)}
//                         />
//                         <input
//                             type="text"
//                             placeholder="Last Name"
//                             required
//                             style={{ width: "45%", marginLeft: "5px" }}
//                             value={lastName}
//                             onChange={(e) => setLastName(e.target.value)}
//                         />
//                     </div>
//                     <input
//                         type="email"
//                         placeholder="Email ID"
//                         required
//                         style={{ width: "100%" }}
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                     />
//                     <input
//                         type="password"
//                         placeholder="Password"
//                         required
//                         style={{ width: "100%" }}
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                     />
//                     <input
//                         type="password"
//                         placeholder="Confirm Password"
//                         required
//                         style={{ width: "100%" }}
//                         value={confirmPassword}
//                         onChange={(e) => setConfirmPassword(e.target.value)}
//                     />
//                     <button type="submit">Sign Up</button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Registration;
