import React, { useState, useEffect } from "react";
import '../../CommonCss/organizationalGoal.css';
import '../../../string';
import EmployeeLevelGoal from "./EmployeeLevelGoal";
import EmployeeLevelKPI from "./EmployeeLevelKPI";
import { faBullseye, faChartPie, faTachographDigital } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const EmployeeSetup = () => {

    const [activeSection, setActiveSection] = useState('Employee Level Goal');


    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="coreContainer">
            <div className="form-title">Employee Level Goal & KPI Setting </div>
            <div className='addform'>
                <button type="button" className={activeSection === 'Employee Level Goal' ? 'active' : ''} onClick={() => handleButtonClick('Employee Level Goal')}>
                    <FontAwesomeIcon className="icon" icon={faBullseye} />
                    Employee Level Goal
                </button>
                <button type="button" className={activeSection === 'Employee Level KPI' ? 'active' : ''} onClick={() => handleButtonClick('Employee Level KPI')}>
                    <FontAwesomeIcon className="icon" icon={faChartPie} />
                    Employee Level KPI
                </button>

            </div>

            {activeSection === 'Employee Level KPI' && <EmployeeLevelKPI />}
            {activeSection === 'Employee Level Goal' && <EmployeeLevelGoal />}


        </div>
    );
};

export default EmployeeSetup;
































