import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarAlt,
    faChalkboardTeacher
} from "@fortawesome/free-solid-svg-icons";
import EmployeeTrainingForm from "../Training/EmployeeTrainingForm";
import ViewTraining from "../Training/ViewTraining";
import TrainingOverview from "./TrainingOverview";


const TrainningSetup = () => {
    const [activeSection, setActiveSection] = useState('Scheduled Your Trainnings');
    const employeeId = localStorage.getItem("employeeId");

    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="coreContainer">
            <div className="form-title">Employee Trainings </div>

            <div className="addform">
                <button
                    type="button"
                    className={`active-section-item ${activeSection === 'Scheduled Your Trainnings' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('Scheduled Your Trainnings')}
                >
                    <FontAwesomeIcon className="icon" icon={faCalendarAlt} />
                    Scheduled Your Trainnings
                </button>
                <button
                    type="button"
                    className={`active-section-item ${activeSection === 'Trainning Status' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('Trainning Status')}
                >
                    <FontAwesomeIcon className="icon" icon={faChalkboardTeacher} />
                    Trainning Status
                </button>
                <button
                    type="button"
                    className={`active-section-item ${activeSection === 'Training Overview' ? 'active' : ''}`}
                    onClick={() => handleButtonClick('Training Overview')}
                >
                    <FontAwesomeIcon className="icon" icon={faChalkboardTeacher} />
                    Training Overview
                </button>
            </div>

            {activeSection === 'Scheduled Your Trainnings' && <EmployeeTrainingForm/>}
            {activeSection === 'Trainning Status' && <ViewTraining />}
            {activeSection === 'Training Overview' && <TrainingOverview employeeId={employeeId} />}
        </div>
    );
};

export default TrainningSetup;