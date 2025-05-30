import React, { useState } from 'react';
import './EmployeeExitProcess.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarAlt,
    faChalkboardTeacher
} from "@fortawesome/free-solid-svg-icons";
import '../../CommonCss/AddEmp.css';
import '../../CommonCss/Main.css';
import ResignationForm from './ResignationForm';
import EmployeeHandover from './EmployeeHandover';
import ManagerView from './ManagerView';

const EmployeeExitProcess = ({ hrDetails }) => {
    const companyId = localStorage.getItem("companyId");
    const employeeId = localStorage.getItem("employeeId");
    const employeeFirstName = localStorage.getItem("firstName");
    const [activeSection, setActiveSection] = useState('Manager View');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleButtonClick = (section) => {
        setActiveSection(section);
        if (section === 'Resignation Form') {
            setIsFormOpen(true);
        } else {
            setIsFormOpen(false);
        }
    };

    return (
        <div className="coreContainer">
            <div className="form-title">Employee Exit Process</div>

            <div className="addform">
                <button
                    type="button"
                    className={`active-section-item ${activeSection === 'Manager View' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('Manager View')}
                >
                    <FontAwesomeIcon className="icon" icon={faCalendarAlt} />
                    Manager View
                </button>
                <button
                    type="button"
                    className={`active-section-item ${activeSection === 'Handover Process' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('Handover Process')}
                >
                    <FontAwesomeIcon className="icon" icon={faChalkboardTeacher} />
                    Handover Process
                </button>
                <button
                    type="button"
                    className={`active-section-item ${activeSection === 'Resignation Form' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('Resignation Form')}
                >
                    <FontAwesomeIcon className="icon" icon={faChalkboardTeacher} />
                    Resignation Form
                </button>
            </div>

            {activeSection === 'Manager View' && <ManagerView />}
            {activeSection === 'Handover Process' && <EmployeeHandover /> }
            {activeSection === 'Resignation Form' && <ResignationForm />}
    
        </div>
    );
};

export default EmployeeExitProcess;