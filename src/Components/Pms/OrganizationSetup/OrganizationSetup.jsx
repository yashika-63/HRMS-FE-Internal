import React, { useState, useEffect } from "react";
import '../../CommonCss/organizationalGoal.css';
import '../../../string';
import OrganizationalGoal from "./OrganizationalGoal";
import OrganizationalKPI from "./OrganizationalKPI";

const OrganizationSetup = () => {

    const [activeSection, setActiveSection] = useState('Goal Management');


    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="coreContainer">
            <div className="title">Organizational Goal & KPI Setting </div>

            <div className="addform">
                {/* <button type="button" className={`active-section-item ${activeSection === 'Company Configuration' ? 'active' : ''}`} onClick={() => handleButtonClick('Company Configuration')}>Company Configuration</button> */}
                <button type="button" className={`active-section-item ${activeSection === 'Goal Management' ? 'active' : ''}`} onClick={() => handleButtonClick('Goal Management')}>Goal Management</button>
                <button type="button" className={`active-section-item ${activeSection === 'KPI Management' ? 'active' : ''}`} onClick={() => handleButtonClick('KPI Management')}>KPI Management</button>

            </div>


            {activeSection === 'Goal Management' && <OrganizationalGoal />}
            {activeSection === 'KPI Management' && <OrganizationalKPI />}


        </div>
    );
};

export default OrganizationSetup;
































