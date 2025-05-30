import React, { useState } from "react";
import '../CommonCss/EnrollDashboard.css';
import '../../string';
import EmployeeConfigScreen from "./EmployeeLevelConfiguration";
import EmployeeDetails from "./EmpoyeeConfig";

const EmployeeConfiguration = () => {

    const [activeSection, setActiveSection] = useState('Employee day-off Configuration');

    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="coreContainer">
            {/* <div className="form-title">
                <div>Employee Configuration</div>
            </div> */}

            <div className="addform">
            <button type="button" className={`active-section-item ${activeSection === 'Employee Configuration' ? 'active' : ''}`} onClick={() => handleButtonClick('Employee Configuration')}>Employee  Configuration</button>                <button type="button" className={`active-section-item ${activeSection === 'Employee day-off Configuration' ? 'active' : ''}`} onClick={() => handleButtonClick('Employee day-off Configuration')}>Employee Day-Off Configuration</button>
           
                {/* <button type="button" className={`active-section-item ${activeSection === 'Company Day Off' ? 'active' : ''}`} onClick={() => handleButtonClick('Company Day Off')}>Company Day-off Configuration</button> */}
            </div>


            {/* {activeSection === 'Attributes' && <CtcAttributes />} */}
            {activeSection === 'Employee Configuration' && <EmployeeDetails />}
            {activeSection === 'Employee day-off Configuration' && <EmployeeConfigScreen />}
            

        </div>
    );
};

export default EmployeeConfiguration;

