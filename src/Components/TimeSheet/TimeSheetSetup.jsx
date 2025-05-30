import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faChalkboardTeacher, faClock, faFileAlt, faUsersViewfinder } from "@fortawesome/free-solid-svg-icons";
import TimesheetTable from "./TimeSheet";
import TimesheetDashboard from "./TimeSheetDashboard";


const TimesheetSetup = () => {

    const [activeSection, setActiveSection] = useState('Timesheet');


    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="coreContainer">

            <div className="addform">
                <button type="button" className={`active-section-item ${activeSection === 'Timesheet' ? 'active' : ''}`} onClick={() => handleButtonClick('Timesheet')}>
                    <FontAwesomeIcon className="icon" icon={faClock} />
                    TimeSheet
                </button>
                <button type="button" className={`active-section-item ${activeSection === 'Show Timesheet' ? 'active' : ''}`} onClick={() => handleButtonClick('Show Timesheet')}>
                    <FontAwesomeIcon className="icon" icon={faFileAlt} />
                    Show Timesheet
                </button>

            </div>


            {activeSection === 'Timesheet' && <TimesheetTable/>}
            {activeSection === 'Show Timesheet' && <TimesheetDashboard/>}


        </div>
    );
};

export default TimesheetSetup;