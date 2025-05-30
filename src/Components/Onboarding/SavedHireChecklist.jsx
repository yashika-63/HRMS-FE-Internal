
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { strings } from '../../string';
import axios from 'axios';
import './LeaveAppl.css';

function HireChecklist() {
    const [formData, setFormData] = useState({
        name: '',
        id:'',
        employeeid: '',
        designation: '',
        department: '',
        employeeName: '',
        employeeDataInfoSheet: false,
        employeeCheckAcquiredPassed: false,
        employeeAppointmentLetterSign: false,
        employeePayrollBenifits: false,
        employeePersonalFile: false,
        employeeStateNewHireReporting: false,
        employeeHandbookSign: false,
        employeePolicyDocumentReviewedSign: false,
        employeeEmployeeBenifitsEnrollmentFormSign: false,
        employeeWorkSpaceSetup: false,
        employeeLoginsAndComputerApplicationAcess: false,
        employeemeetGreet: false,
        employeeOrientationShedule: false,
        employeeNewHireTreaningShedule: false,
    });

    const { id } = useParams();
    const fetchEmployeeDetails = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${id}`);
            const employee = response.data; // Assuming the response is an object containing employee details
            // Update the form data with the employee's name
            // console.log(response.data);
            setFormData({
                ...formData, name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
                id: employee.id,
                department: employee.department,
                designation: employee.designation

            });
        }
        catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };
    useEffect(() => {
        fetchEmployeeDetails();
    }, [id]); // Fetch employee details when the id parameter changes
 

    const fetchhireEmployeeDetails = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/HiringChecklist/employee/${id}/hiring-checklist`);
            const checklistData = response.data; // Assuming response.data contains checklist data

            // Update formData state based on checklistData
            setFormData({
                ...formData,
                employeeDataInfoSheet: checklistData.employeeDataInfoSheet || false,
                employeeCheckAcquiredPassed: checklistData.employeeCheckAcquiredPassed || false,
                employeeAppointmentLetterSign: checklistData.employeeAppointmentLetterSign || false,
                employeePayrollBenifits: checklistData.employeePayrollBenifits || false,
                employeePersonalFile: checklistData.employeePersonalFile || false,
                employeeStateNewHireReporting: checklistData.employeeStateNewHireReporting || false,
                employeeHandbookSign: checklistData.employeeHandbookSign || false,
                employeePolicyDocumentReviewedSign: checklistData.employeePolicyDocumentReviewedSign || false,
                employeeEmployeeBenifitsEnrollmentFormSign: checklistData.employeeEmployeeBenifitsEnrollmentFormSign || false,
                employeeWorkSpaceSetup: checklistData.employeeWorkSpaceSetup || false,
                employeeLoginsAndComputerApplicationAcess: checklistData.employeeLoginsAndComputerApplicationAcess || false,
                employeemeetGreet: checklistData.employeemeetGreet || false,
                employeeOrientationShedule: checklistData.employeeOrientationShedule || false,
                employeeNewHireTreaningShedule: checklistData.employeeNewHireTreaningShedule || false,
            });
        } catch (error) {
            console.error('Error fetching checklist data:', error);
        }
    };
    useEffect(() => {
        fetchhireEmployeeDetails();
    }, [id]);
    
    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData({
            ...formData,
            [name]: newValue,
        });
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const response = await axios.post(`http://${strings.localhost}/HiringChecklist/${id}`, formData);
    //         console.log(response.data);
    //         alert('Hiring Details added successfully');
    //     } catch (error) {
    //         console.error('Error:', error);
    //         alert('Failed to save data. Please try again.');
    //     }
    // };

    const handleCheckboxDoubleClick = (checkboxName) => {
        setFormData({
            ...formData,
            [checkboxName]: false,
        });
    };

    return (
        <div>
            <form>
                <div>
                    <h2 style={{ marginLeft: '30px', marginBottom: '30px', marginTop: '90px', fontSize: '30px' }}>New Hire Checklist</h2>
                    <div>
                        <div className="input-row">
                            <div className="row">
                                <div>
                                    <label htmlFor="employeeName">Employee Name: </label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label htmlFor="id">Employee Id: </label>
                                    <input type="text" id="id" name="id" value={formData.id} onChange={handleInputChange} required />
                                </div>
                                <div>
                                    <label htmlFor="designation">Employee Designation: </label>
                                    <input type="text" id="designation" name="designation" value={formData.designation} onChange={handleInputChange} required />
                                </div>
                                <div>
                                    <label htmlFor="department">Employee Department: </label>
                                    <input type="text" id="department" name="department" value={formData.department} onChange={handleInputChange} required />
                                </div>
                            </div>
                        </div>
                        <div className="check-form-container2" style={{marginBottom: "10px"}}>
                            <div className="check-form-container">
                                <div className="check-form">
                                    <h2>New Employee Information</h2>
                                    <div className="cinput-row">
                                        <div className="label-box">
                                            <label>Employee Data Information Sheet Collection:</label>
                                        </div>
                                        <div className="checkbox-box" style={{marginBottom: "20px"}}>
                                            <input
                                                type="checkbox"
                                                id="employeeDataInfoSheet"
                                                name="employeeDataInfoSheet"
                                                checked={formData.employeeDataInfoSheet}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="cinput-row">
                                        <div className="label-box">
                                            <label>Background Check Acquired & Passed:</label>
                                        </div>
                                        <div className="checkbox-box" style={{marginBottom: "20px"}}>
                                            <input
                                                type="checkbox"
                                                id="employeeCheckAcquiredPassed"
                                                name="employeeCheckAcquiredPassed"
                                                checked={formData.employeeCheckAcquiredPassed}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="cinput-row">
                                        <div className="label-box">
                                            <label>Appointment Letter Signed:</label>
                                        </div>
                                        <div className="checkbox-box" style={{marginBottom: "20px"}}>
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
                                    {/* <div className="cinput-row">
                                            <div className="label-box">
                                                <label>Appointment Letter Signed:</label>
                                            </div>

                                            <div className="checkbox-box">
                                                <input
                                                    type="checkbox"
                                                    value="true"
                                                    id="employeeAppointmentLetterSign"
                                                    name="employeeAppointmentLetterSign"
                                                    checked={formData.employeeAppointmentLetterSign || false}
                                                    onChange={handleInputChange}
                                                    onDoubleClick={() => handleCheckboxDoubleClick('employeeAppointmentLetterSign')}

                                                />
                                            </div>
                                        </div> */}
                                    <div className="cinput-row">
                                        <div className="label-box">
                                            <label>Employee Agreement Signed:</label>
                                        </div>

                                        <div className="checkbox-box"style={{marginBottom: "20px"}}>
                                            <input
                                                type="checkbox"
                                                value="true"
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

                                        <div className="checkbox-box" style={{marginBottom: "20px"}}>
                                            <input
                                                type="checkbox"
                                                value="true"
                                                id="employeePayrollBenifits"
                                                name="employeePayrollBenifits"
                                                checked={formData.employeePayrollBenifits || false}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="cinput-row">
                                        <div className="label-box">
                                            <label>HR Personnel Final Created:</label>
                                        </div>

                                        <div className="checkbox-box" style={{marginBottom: "20px"}}>
                                            <input
                                                type="checkbox"
                                                value="true"
                                                id="employeePersonalFile"
                                                name="employeePersonalFile"
                                                checked={formData.employeePersonalFile || false}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </div>
                        <div className="check-form-container2" style={{marginTop: "5px"}}  >
                            <div className="check-form-container">
                                <div className="check-form">
                                    <h2>New Employee HR Personeel File Documentation</h2>
                                    <form >
                                        <div className="cinput-row">
                                            <div className="label-box">
                                                <label>State New Hire Reporting Complete:</label>
                                            </div>

                                            <div className="checkbox-box">
                                                <input
                                                    type="checkbox"
                                                    value="true"
                                                    id="employeeStateNewHireReporting"
                                                    name="employeeStateNewHireReporting"
                                                    checked={formData.employeeStateNewHireReporting || false}
                                                    onChange={handleInputChange}
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
                                                    value="true"
                                                    id="employeeHandbookSign"
                                                    name="employeeHandbookSign"
                                                    checked={formData.employeeHandbookSign || false}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="cinput-row">
                                            <div className="label-box">
                                                <label>Policy Documents Reviewed & Signed (NDA , Non-Comepte):</label>
                                            </div>

                                            <div className="checkbox-box">
                                                <input
                                                    type="checkbox"
                                                    value="true"
                                                    id="employeePolicyDocumentReviewedSign"
                                                    name="employeePolicyDocumentReviewedSign"
                                                    checked={formData.employeePolicyDocumentReviewedSign || false}
                                                    onChange={handleInputChange}
                                                    onDoubleClick={() => handleCheckboxDoubleClick('employeePolicyDocumentReviewedSign')}

                                                />
                                            </div>
                                        </div>
                                        <div className="cinput-row">
                                            <div className="label-box">
                                                <label>Employee Benefits Enrollment Formed Signed:</label>
                                            </div>

                                            <div className="checkbox-box">
                                                <input
                                                    type="checkbox"
                                                    value="true"
                                                    id="employeeEmployeeBenifitsEnrollmentFormSign"
                                                    name="employeeEmployeeBenifitsEnrollmentFormSign"
                                                    checked={formData.employeeEmployeeBenifitsEnrollmentFormSign || false}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                    </form>


                                </div>
                            </div>
                        </div>
                        <div className="check-form-container3">
                            <div className="check-form-container">
                                <div className="check-form">
                                    <h2>New Employee Pre-Onboarding</h2>
                                    <form >
                                        <div className="cinput-row">
                                            <div className="label-box">
                                                <label>Workspace Set-Up:</label>
                                            </div>

                                            <div className="checkbox-box">
                                                <input
                                                    type="checkbox"
                                                    value="true"
                                                    id="employeeWorkSpaceSetup"
                                                    name="employeeWorkSpaceSetup"
                                                    checked={formData.employeeWorkSpaceSetup || false}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="cinput-row">
                                            <div className="label-box">
                                                <label>timecard and/or Entry Card Prepared (Biometric):</label>
                                            </div>

                                            <div className="checkbox-box">
                                                <input
                                                    type="checkbox"
                                                    value="true"
                                                    id="employeeTimeCardAndEntryCard"
                                                    name="employeeTimeCardAndEntryCard"
                                                    checked={formData.employeeTimeCardAndEntryCard || false}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="cinput-row">
                                            <div className="label-box">
                                                <label>Logins For Computer, Software, Applications, Acquired(Emails):</label>
                                            </div>

                                            <div className="checkbox-box">
                                                <input
                                                    type="checkbox"
                                                    value="true"
                                                    id="employeeLoginsAndComputerApplicationAcess"
                                                    name="employeeLoginsAndComputerApplicationAcess"
                                                    checked={formData.employeeLoginsAndComputerApplicationAcess || false}
                                                    onChange={handleInputChange}
                                                    onDoubleClick={() => handleCheckboxDoubleClick('employeeLoginsAndComputerApplicationAcess')}

                                                />
                                            </div>
                                        </div>
                                        <div className="cinput-row">
                                            <div className="label-box">
                                                <label>Meet and Greets With Manager,Supervisor,Co-Workers Scheduled:</label>
                                            </div>

                                            <div className="checkbox-box">
                                                <input
                                                    type="checkbox"
                                                    value="true"
                                                    id="employeemeetGreet"
                                                    name="employeemeetGreet"
                                                    checked={formData.employeemeetGreet || false}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="cinput-row">
                                            <div className="label-box">
                                                <label>orientation Scheduled:</label>
                                            </div>

                                            <div className="checkbox-box">
                                                <input
                                                    type="checkbox"
                                                    value="true"
                                                    id="employeeOrientationShedule"
                                                    name="employeeOrientationShedule"
                                                    checked={formData.employeeOrientationShedule || false}
                                                    onChange={handleInputChange}
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
                                                    value="true"
                                                    id="employeeNewHireTreaningShedule"
                                                    name="employeeNewHireTreaningShedule"
                                                    checked={formData.employeeNewHireTreaningShedule || false}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="button-container" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn" type="submit" style={{ marginRight: '10px' }}>
                                Submit
                            </button>
                            <Link to={`/OnBordingPortal`}>
                                <button className="btn">Next</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default HireChecklist;
