import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { strings } from '../../string';
import { DatePicker } from "antd";
import axios from 'axios';
// import 'react-datepicker/dist/react-datepicker.css';
import '../CommonCss/LeaveAppl.css'

function HireChecklist() {
    const [formData, setFormData] = useState(
        {
            name: '',
            employeeid: '',
            designation: '',
            department: '',
            employeeName: '',
            employeeDataInfoSheet: '',
            employeeCheckAcquiredPassed: '',
            employeeAppointmentLetterSign: '',
            employeePayrollBenifits: '',
            employeePersonalFile: '',
            employeeStateNewHireReporting: '',
            employeeHandbookSign: '',
            employeePolicyDocumentReviewedSign: '',
            employeeEmployeeBenifitsEnrollmentFormSign: '',
            employeeWorkSpaceSetup: '',
            employeeLoginsAndComputerApplicationAcess: '',
            employeemeetGreet: '',
            employeeOrientationShedule: '',
            employeeNewHireTreaningShedule: '',

        }
    );
    const handleInputChange = (e) => {
        const { name, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : e.target.value;

        setFormData({
            ...formData,
            [name]: newValue,
        });
    };

    const handleCheckboxDoubleClick = (checkboxName) => {
        setFormData(prevState => ({
            ...prevState,
            [checkboxName]: false // Clear the checkbox value
        }));
    };

    const { id } = useParams();

    const fetchEmployeeDetails = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${id}`);
            const employee = response.data;
            setFormData({
                ...formData,
                name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
                id: employee.id,
                department: employee.department,
                designation: employee.designation
            });
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };

    useEffect(() => {
        fetchEmployeeDetails();
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`http://${strings.localhost}/HiringChecklist/${id}`, formData)
            .then(response => {
                alert('Hiring Details added successfully');
            })
            .catch(error => {
                console.error("Error:", error);
                alert('Failed to save data. Please try again.');
            });
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <h2 style={{ fontSize: "18px" }}>New Hire Checklist</h2>
                    <div className="form-row">
                        <div className="row">
                            <div>
                                <label htmlFor="employeeName">Employee Name: </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="id">Employee Id: </label>
                                <input
                                    type="text"
                                    id="id"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <label htmlFor="designation">Employee Designation: </label>
                                <input
                                    type="text"
                                    id="designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="department">Employee Department: </label>
                                <input
                                    type="text"
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="check-form-container" style={{ marginTop: "5px" }}>
                        <div className="check-form">
                            <h2>New Employee Information</h2>
                            <div className="cinput-row">
                                <div className="label-box">
                                    <label>Employee Data Information Sheet Collection:</label>
                                </div>
                                <div className="checkbox-box">
                                    <input
                                        type="checkbox"
                                        id="employeeDataInfoSheet"
                                        name="employeeDataInfoSheet"
                                        checked={formData.employeeDataInfoSheet}
                                        onChange={handleInputChange}
                                        onDoubleClick={() => handleCheckboxDoubleClick('employeeDataInfoSheet')}
                                    />
                                </div>
                            </div>
                            <div className="cinput-row">
                                <div className="label-box">
                                    <label>Background Check Acquired & Passed:</label>
                                </div>
                                <div className="checkbox-box">
                                    <input
                                        type="checkbox"
                                        id="employeeCheckAcquiredPassed"
                                        name="employeeCheckAcquiredPassed"
                                        checked={formData.employeeCheckAcquiredPassed}
                                        onChange={handleInputChange}
                                        onDoubleClick={() => handleCheckboxDoubleClick('employeeCheckAcquiredPassed')}
                                    />
                                </div>
                            </div>
                            <div className="cinput-row">
                                <div className="label-box">
                                    <label>Appointment Letter Signed:</label>
                                </div>
                                <div className="checkbox-box">
                                    <input
                                        type="checkbox"
                                        id="employeeAppointmentLetterSign"
                                        name="employeeAppointmentLetterSign"
                                        checked={formData.employeeAppointmentLetterSign}
                                        onChange={handleInputChange}
                                        onDoubleClick={() => handleCheckboxDoubleClick('employeeAppointmentLetterSign')}
                                    />
                                </div>
                            </div>
                            <div className="cinput-row">
                                <div className="label-box">
                                    <label>Employee Agreement Signed:</label>
                                </div>
                                <div className="checkbox-box">
                                    <input
                                        type="checkbox"
                                        id="checkbox4"
                                        name="checkbox4"
                                        checked={formData.checkbox4 || false}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="cinput-row">
                                <div className="label-box">
                                    <label>Employee Information Entered into Payroll & Benefits System:</label>
                                </div>
                                <div className="checkbox-box">
                                    <input
                                        type="checkbox"
                                        id="employeePayrollBenifits"
                                        name="employeePayrollBenifits"
                                        checked={formData.employeePayrollBenifits}
                                        onChange={handleInputChange}
                                        onDoubleClick={() => handleCheckboxDoubleClick('employeePayrollBenifits')}
                                    />
                                </div>
                            </div>
                            <div className="cinput-row">
                                <div className="label-box">
                                    <label>HR Personnel Final Created:</label>
                                </div>
                                <div className="checkbox-box">
                                    <input
                                        type="checkbox"
                                        id="employeePersonalFile"
                                        name="employeePersonalFile"
                                        checked={formData.employeePersonalFile}
                                        onChange={handleInputChange}
                                        onDoubleClick={() => handleCheckboxDoubleClick('employeePersonalFile')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="check-form-container2">
                        <div className="check-form-container">
                            <div className="check-form">
                                <h2>New Employee HR Personnel File Documentation</h2>
                                <div className="cinput-row">
                                    <div className="label-box">
                                        <label>State New Hire Reporting Complete:</label>
                                    </div>
                                    <div className="checkbox-box">
                                        <input
                                            type="checkbox"
                                            id="employeeStateNewHireReporting"
                                            name="employeeStateNewHireReporting"
                                            checked={formData.employeeStateNewHireReporting}
                                            onChange={handleInputChange}
                                            onDoubleClick={() => handleCheckboxDoubleClick('employeeStateNewHireReporting')}
                                        />
                                    </div>
                                </div>
                                <div className="cinput-row">
                                    <div className="label-box">
                                        <label>Employee Handbook Signed:</label>
                                    </div>
                                    <div className="checkbox-box">
                                        <input
                                            type="checkbox"
                                            id="employeeHandbookSign"
                                            name="employeeHandbookSign"
                                            checked={formData.employeeHandbookSign}
                                            onChange={handleInputChange}
                                            onDoubleClick={() => handleCheckboxDoubleClick('employeeHandbookSign')}
                                        />
                                    </div>
                                </div>
                                <div className="cinput-row">
                                    <div className="label-box">
                                        <label>Policy Documents Reviewed & Signed (NDA, Non-Compete):</label>
                                    </div>
                                    <div className="checkbox-box">
                                        <input
                                            type="checkbox"
                                            id="employeePolicyDocumentReviewedSign"
                                            name="employeePolicyDocumentReviewedSign"
                                            checked={formData.employeePolicyDocumentReviewedSign}
                                            onChange={handleInputChange}
                                            onDoubleClick={() => handleCheckboxDoubleClick('employeePolicyDocumentReviewedSign')}
                                        />
                                    </div>
                                </div>
                                <div className="cinput-row">
                                    <div className="label-box">
                                        <label>Employee Benefits Enrollment Form Signed:</label>
                                    </div>
                                    <div className="checkbox-box">
                                        <input
                                            type="checkbox"
                                            id="employeeEmployeeBenifitsEnrollmentFormSign"
                                            name="employeeEmployeeBenifitsEnrollmentFormSign"
                                            checked={formData.employeeEmployeeBenifitsEnrollmentFormSign}
                                            onChange={handleInputChange}
                                            onDoubleClick={() => handleCheckboxDoubleClick('employeeEmployeeBenifitsEnrollmentFormSign')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="check-form-container3">
                        <div className="check-form-container">
                            <div className="check-form">
                                <h2>New Employee Pre-Onboarding</h2>
                                <div className="cinput-row">
                                    <div className="label-box">
                                        <label>Workspace Set-Up:</label>
                                    </div>
                                    <div className="checkbox-box">
                                        <input
                                            type="checkbox"
                                            id="employeeWorkSpaceSetup"
                                            name="employeeWorkSpaceSetup"
                                            checked={formData.employeeWorkSpaceSetup}
                                            onChange={handleInputChange}
                                            onDoubleClick={() => handleCheckboxDoubleClick('employeeWorkSpaceSetup')}
                                        />
                                    </div>
                                </div>
                                <div className="cinput-row">
                                    <div className="label-box">
                                        <label>Timecard and/or Entry Card Prepared (Biometric):</label>
                                    </div>
                                    <div className="checkbox-box">
                                        <input
                                            type="checkbox"
                                            id="employeeTimeCardAndEntryCard"
                                            name="employeeTimeCardAndEntryCard"
                                            checked={formData.employeeTimeCardAndEntryCard}
                                            onChange={handleInputChange}
                                            onDoubleClick={() => handleCheckboxDoubleClick('employeeTimeCardAndEntryCard')}
                                        />
                                    </div>
                                </div>
                                <div className="cinput-row">
                                    <div className="label-box">
                                        <label>Logins For Computer, Software, Applications, Acquired (Emails):</label>
                                    </div>
                                    <div className="checkbox-box">
                                        <input
                                            type="checkbox"
                                            id="employeeLoginsAndComputerApplicationAcess"
                                            name="employeeLoginsAndComputerApplicationAcess"
                                            checked={formData.employeeLoginsAndComputerApplicationAcess}
                                            onChange={handleInputChange}
                                            onDoubleClick={() => handleCheckboxDoubleClick('employeeLoginsAndComputerApplicationAcess')}
                                        />
                                    </div>
                                </div>
                                <div className="cinput-row">
                                    <div className="label-box">
                                        <label>Meet and Greets With Manager, Supervisor, Co-Workers Scheduled:</label>
                                    </div>
                                    <div className="checkbox-box">
                                        <input
                                            type="checkbox"
                                            id="employeemeetGreet"
                                            name="employeemeetGreet"
                                            checked={formData.employeemeetGreet}
                                            onChange={handleInputChange}
                                            onDoubleClick={() => handleCheckboxDoubleClick('employeemeetGreet')}
                                        />
                                    </div>
                                </div>
                                <div className="cinput-row">
                                    <div className="label-box">
                                        <label>Orientation Scheduled:</label>
                                    </div>
                                    <div className="checkbox-box">
                                        <input
                                            type="checkbox"
                                            id="employeeOrientationShedule"
                                            name="employeeOrientationShedule"
                                            checked={formData.employeeOrientationShedule}
                                            onChange={handleInputChange}
                                            onDoubleClick={() => handleCheckboxDoubleClick('employeeOrientationShedule')}
                                        />
                                    </div>
                                </div>
                                <div className="cinput-row">
                                    <div className="label-box">
                                        <label>New Hire Training Scheduled:</label>
                                    </div>
                                    <div className="checkbox-box">
                                        <input
                                            type="checkbox"
                                            id="employeeNewHireTreaningShedule"
                                            name="employeeNewHireTreaningShedule"
                                            checked={formData.employeeNewHireTreaningShedule}
                                            onChange={handleInputChange}
                                            onDoubleClick={() => handleCheckboxDoubleClick('employeeNewHireTreaningShedule')}
                                        />
                                    </div>
                                </div>
                                <div className="button-container" style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button type="submit" className='btn' style={{ marginRight: "10px" }}>Submit</button>
                                    <Link to={`/OnBordingPortal`}>
                                        <button type="button" className='btn'>Next</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default HireChecklist;