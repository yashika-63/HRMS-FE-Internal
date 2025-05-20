import React, { useState, useEffect } from "react";
import '../../CommonCss/organizationalGoal.css';
import '../../../string';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ViewAppraisal from "../Appraisal.jsx/ViewAppraisal";
import EmployeeGoalAnalytic from './EmployeeGoalAnalytic';
import EmployeeKpiAnalytic from "./EmployeeKpiAnalytic";
import EmployeeAppraisalDashboard from "./EmployeeAppraisalDashboard";
import { faAppleWhole, faBullseye, faChartLine, faChartPie, faDashboard, faDiagramNext, faDiagramProject, faDiagramSuccessor, faFileAlt, faSurprise, faTachometer, faTachometerAlt, faTachometerAltAverage, faTachometerFast, faTrademark } from "@fortawesome/free-solid-svg-icons";


const EmployeePerformance = () => {

    const [activeSection, setActiveSection] = useState('Appresial Form');


    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="coreContainer">
            <div className="form-title">Employee Dashboard</div>
            <div className='addform'>
                <button type="button" className={activeSection === 'Appresial Form' ? 'active' : ''} onClick={() => handleButtonClick('Appresial Form')}>
                    <FontAwesomeIcon className="icon" icon={faFileAlt} />
                    Appresial Form
                </button>
                <button type="button" className={activeSection === 'Employee Goal' ? 'active' : ''} onClick={() => handleButtonClick('Employee Goal')}>
                    <FontAwesomeIcon className="icon" icon={faBullseye} />
                    Employee Goal
                </button>
                <button type="button" className={activeSection === 'Employee KPI' ? 'active' : ''} onClick={() => handleButtonClick('Employee KPI')}>
                    <FontAwesomeIcon className="icon" icon={faChartPie} />
                    Employee KPI
                </button>
                <button type="button" className={activeSection === 'Appraisal Dashboard' ? 'active' : ''} onClick={() => handleButtonClick('Appraisal Dashboard')}>
                    <FontAwesomeIcon className="icon" icon={faChartLine} />
                    Appraisal Dashboard
                </button>

            </div>

            {activeSection === 'Appresial Form' && <ViewAppraisal />}
            {activeSection === 'Employee Goal' && <EmployeeGoalAnalytic />}
            {activeSection === 'Employee KPI' && <EmployeeKpiAnalytic />}
            {activeSection === 'Appraisal Dashboard' && <EmployeeAppraisalDashboard />}


        </div>
    );
};

export default EmployeePerformance;
































