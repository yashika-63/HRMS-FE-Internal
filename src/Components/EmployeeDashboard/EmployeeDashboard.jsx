import React from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const employeeId = localStorage.getItem("employeeId");

    const handleCardClick = (path) => {
        navigate(path);
    };

    return (
        <div className="coreContainer">
            <div className="employeedashboard-container">

                <div className="employeedashboard-card overview-employeedashboard" onClick={() => handleCardClick(`/EmployeeOverview/${employeeId}`)}>

                    <div className="employeedashboard-content">
                        <h3>Employee Overview</h3>
                        <p className="card-description">View your personal details.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/employeeoverview.png' className="employeedashboard-icon" alt="Employee Overview" />
                    </div>
                </div>

                <div className="employeedashboard-card ctc-employeedashboard" onClick={() => handleCardClick(`/EmployeeAssetForm`)}>

                    <div className="employeedashboard-content">
                        <h3>Assets</h3>
                        <p className="card-description">Submit or view your assigned assets.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/Asset.png' className="employeedashboard-icon" alt="Assets" />
                    </div>
                </div>
                <div className="employeedashboard-card timesheet-employeedashboard" onClick={() => handleCardClick(`/Timesheetdashboard`)}>

                    <div className="employeedashboard-content">
                        <h3>Timesheet</h3>
                        <p className="card-description">Fill and view your timesheet.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/timesheet.png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>


                <div className="employeedashboard-card training-employeedashboard" onClick={() => handleCardClick(`/TrainningSetup`)}>

                    <div className="employeedashboard-content">
                        <h3>Trainings</h3>
                        <p className="card-description">Access and track your training sessions.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/training.png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>

                <div className="employeedashboard-card kpi-employeedashboard" onClick={() => handleCardClick(`/EmployeeView`)}>

                    <div className="employeedashboard-content">
                        <h3>Goal & KPI View</h3>
                        <p className="card-description">Track your goals and performance.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/kpi.png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>

                <div className="employeedashboard-card feedback-employeedashboard" onClick={() => handleCardClick(`/Requestedfeedback/${employeeId}`)}>

                    <div className="employeedashboard-content">
                        <h3>Requested Feedback</h3>
                        <p className="card-description">Check feedback requests from managers.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/requestedfeedback.png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>

                <div className="employeedashboard-card appraisal-employeedashboard" onClick={() => handleCardClick(`/AppraisalForm`)}>

                    <div className="employeedashboard-content">
                        <h3>Appraisal</h3>
                        <p className="card-description">Complete and review your appraisal form.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/appraisal.png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>

                <div className="employeedashboard-card ctc-employeedashboard" onClick={() => handleCardClick(`/ViewCTC/${employeeId}`)}>

                    <div className="employeedashboard-content">
                        <h3>CTC Records</h3>
                        <p className="card-description">View your current and past CTC records.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/ctcrecords.png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>

                <div className="employeedashboard-card payslip-employeedashboard" onClick={() => handleCardClick(`/Payslip/${employeeId}`)}>

                    <div className="employeedashboard-content">
                        <h3>Payslip</h3>
                        <p className="card-description">Download payslip.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/payslipicon.png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>

                <div className="employeedashboard-card dashboard-employeedashboard" onClick={() => handleCardClick(`/EmployeePerformance/${employeeId}`)}>

                    <div className="employeedashboard-content">
                        <h3>Dashboards</h3>
                        <p className="card-description">Analyze your performance statistics.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/Dashboard.png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>

                <div className="employeedashboard-card kpi-employeedashboard" onClick={() => handleCardClick(`/InterviewCalendarView/${employeeId}`)}>

                    <div className="employeedashboard-content">
                        <h3>Calendar</h3>
                        <p className="card-description">View your Scheduled Interviews.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/Calendar.png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>
                <div className="employeedashboard-card payslip-employeedashboard" onClick={() => handleCardClick(`/Confirmation/${employeeId}`)}>

                    <div className="employeedashboard-content">
                        <h3>Confirmation Form</h3>
                        <p className="card-description">Submit your employment confirmation form.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/Confirmation.png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>
                <div className="employeedashboard-card induction-employeedashboard" onClick={() => handleCardClick(`/EmployeeInduction/${employeeId}`)}>
                   
                    <div className="employeedashboard-content">
                        <h3>Inductions</h3>
                        <p className="card-description">Complete and review your induction process.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/Induction (2).png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>
                <div className="employeedashboard-card exitprocess-employeedashboard" onClick={() => handleCardClick(`/EmployeeExitProcess/${employeeId}`)}>
                   
                    <div className="employeedashboard-content">
                        <h3>Exit Process</h3>
                        <p className="card-description">View and complete your exit process.</p>
                    </div>
                    <div className="employeedashboard-header">
                        <img src='/Images/timesheet.png' className="employeedashboard-icon" alt="Timesheet" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
