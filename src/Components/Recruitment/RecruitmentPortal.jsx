import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faChalkboardTeacher, faClock, faFileAlt, faUsersViewfinder } from "@fortawesome/free-solid-svg-icons";
import CandidateRegistration from "./CandidateRegistration";
import ShortlistedCandidates from "./ShortlistedCandidates";
import InterviewedCandidate from "./InterviewedCandidate";
import Confirmedcandidate from "./Confirmedcandidate";
import ActiveCandidateList from "./ActiveCandidateList";


const RecruitmentPortal = () => {

    const [activeSection, setActiveSection] = useState('Active');

    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="coreContainer">

            <div className="addform">
                <button type="button" className={`active-section-item ${activeSection === 'Active' ? 'active' : ''}`} onClick={() => handleButtonClick('Active')}>
                    <FontAwesomeIcon className="icon" icon={faClock} />
                    Active
                </button>
                <button type="button" className={`active-section-item ${activeSection === 'Shortlisted' ? 'active' : ''}`} onClick={() => handleButtonClick('Shortlisted')}>
                    <FontAwesomeIcon className="icon" icon={faFileAlt} />
                    Shortlisted 
                </button>
                <button type="button" className={`active-section-item ${activeSection === 'Interviewd' ? 'active' : ''}`} onClick={() => handleButtonClick('Interviewd')}>
                    <FontAwesomeIcon className="icon" icon={faFileAlt} />
                    Interviewd 
                </button>
                <button type="button" className={`active-section-item ${activeSection === 'Confirmed' ? 'active' : ''}`} onClick={() => handleButtonClick('Confirmed')}>
                    <FontAwesomeIcon className="icon" icon={faFileAlt} />
                    Confirmed 
                </button>
            </div>

            {activeSection === 'Active' && <ActiveCandidateList/>}
            {activeSection === 'Shortlisted' && <ShortlistedCandidates/>}
            {activeSection === 'Interviewd' && <InterviewedCandidate/>}
            {activeSection === 'Confirmed' && <Confirmedcandidate/>}

        </div>
    );
};

export default RecruitmentPortal;