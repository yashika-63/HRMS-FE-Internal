import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../SheduledFeedback.css";

const PmsAnalyticsScreen = () => {
//     const { id: employeeId } = useParams();
//     const [activeSection, setActiveSection] = useState("Goal Feedback"); 
//     const [formData, setFormData] = useState({
//         name: "",
//         id: "",
//         designation: "",
//         department: "",
//         employeeName: "",
//         employeeId: ""
//     });

//     const handleButtonClick = (section) => {
//         setActiveSection(section);
//     };

//     const fetchEmployeeDetails = async () => {
//         try {
//             const response = await axios.get(`http://localhost:5557/employees/EmployeeById/${employeeId}`);
//             const employee = response.data;
//             setFormData({
//                 name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
//                 id: employee.id,
//                 department: employee.department,
//                 designation: employee.designation,
//                 employeeName: employee.name,
//                 employeeId: employee.employeeId
//             });
//         } catch (error) {
//             console.error("Error fetching employee details:", error);
//         }
//     };

//     useEffect(() => {
//         fetchEmployeeDetails();
//     }, [employeeId]);

//     return (
        
//         <div className="coreContainer">
//             <div className="form-title">Feedback</div>
//             <div className="addform">
//                 <button 
//                     type="button" 
//                     className={`active-section-item ${activeSection === "Goal Feedback" ? "active" : ""}`} 
//                     onClick={() => handleButtonClick("Goal Feedback")}
//                 >
//                     Feedback On Goal
//                 </button>
//                 <button 
//                     type="button" 
//                     className={`active-section-item ${activeSection === "Kpi Feedback" ? "active" : ""}`} 
//                     onClick={() => handleButtonClick("Kpi Feedback")}
//                 >
//                     Feedback On Kpi
//                 </button>
//             </div>
// {/*            
//             <table className="ctc-details-table">
//                 <tbody>
//                     <tr><td>Employee Name</td><td>{formData.name}</td></tr>
//                     <tr><td>Department</td><td>{formData.department}</td></tr>
//                     <tr><td>Designation</td><td>{formData.designation}</td></tr>
//                 </tbody>
//             </table> */}
//    <div className="employee-container">
//     <div className="profile-circle">
//         {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
//     </div>
//     <div className="employee-details">
//         <div className="left-column">
//             <div className="detail-item"><strong>Employee Name:</strong> {formData.name}</div>
//             <div className="detail-item"><strong>Employee ID:</strong> {formData.employeeId}</div>
//             <div className="detail-item"><strong>Department:</strong> {formData.department}</div>
//         </div>
//         <div className="right-column">
//             <div className="detail-item"><strong>Designation:</strong> {formData.designation}</div>
//             <div className="detail-item"><strong>Joining Date:</strong> {formData.joiningDate}</div>
//             <div className="detail-item"><strong>Salary:</strong> {formData.salary}</div>
//         </div>
//     </div>
// </div>




//             {activeSection === "Goal Feedback" && <SheduledFeedback formData={formData} />}
//             {activeSection === "Kpi Feedback" && <SheduledFeedbackKpi formData={formData} />}

//         </div>
//     );
};

export default PmsAnalyticsScreen;
