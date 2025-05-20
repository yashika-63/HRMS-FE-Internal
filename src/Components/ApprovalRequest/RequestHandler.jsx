import React, { useState, useEffect } from "react";
import LeaveApprovalRequest from "./LeaveApprovalRequest";
import ExpenseApprovalRequest from "./ExpenseApprovalRequest";
import FeedbackApprovalrequest from "./FeedbackApprovalRequest";
import AppraisalApprovalRequest from "./AppraisalApprovalRequest";
import TrainingApprovalRequest from "./TrainingApprovalRequest";
import TimesheetApprovalRequest from "./TimesheetApprovalRequest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faBullhorn, faCalendarCheck, faCheckToSlot, faReceipt, faStar, faStopwatch, faTree, faUserTimes } from "@fortawesome/free-solid-svg-icons";
import ConfirmationRequest from "./ConfirmationRequest";



const Requesthandler = () => {

    const [activeSection, setActiveSection] = useState('Employee Leaves');


    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="coreContainer">
            <div className="form-title">Approval requests </div>

            <div>
                <div className='addform'>
                    <button type="button" className={activeSection === 'Employee Leaves' ? 'active' : ''} onClick={() => handleButtonClick('Employee Leaves')}>
                        <FontAwesomeIcon className="icon" icon={faCalendarCheck} />
                         Leaves
                    </button>
                    <button type="button" className={activeSection === 'Expenses' ? 'active' : ''} onClick={() => handleButtonClick('Expenses')}>
                        <FontAwesomeIcon className="icon" icon={faReceipt} />
                        Expenses 
                    </button>
                    <button type="button" className={activeSection === 'Feedback' ? 'active' : ''} onClick={() => handleButtonClick('Feedback')}>
                        <FontAwesomeIcon className="icon" icon={faBullhorn} />
                        Feedback
                    </button>
                    <button type="button" className={activeSection === 'Appraisal' ? 'active' : ''} onClick={() => handleButtonClick('Appraisal')}>
                        <FontAwesomeIcon className="icon" icon={faStar} />
                        Appraisal 
                    </button>

                    <button type="button" className={activeSection === 'Training' ? 'active' : ''} onClick={() => handleButtonClick('Training')}>
                        <FontAwesomeIcon className="icon" icon={faBookOpen} />
                        Training 
                    </button>
                    <button type="button" className={activeSection === 'Timesheet' ? 'active' : ''} onClick={() => handleButtonClick('Timesheet')}>
                        <FontAwesomeIcon className="icon" icon={faStopwatch} />
                        Timesheet 
                    </button>
                    <button type="button" className={activeSection === 'Confirmation' ? 'active' : ''} onClick={() => handleButtonClick('Confirmation')}>
                        <FontAwesomeIcon className="icon" icon={faCheckToSlot} />
                        Confirmation 
                    </button>
                </div>
            </div>

            {activeSection === 'Employee Leaves' && <LeaveApprovalRequest />}
            {activeSection === 'Expenses' && <ExpenseApprovalRequest />}
            {activeSection === 'Feedback' && <FeedbackApprovalrequest />}
            {activeSection === 'Appraisal' && <AppraisalApprovalRequest />}
            {activeSection === 'Training' && <TrainingApprovalRequest />}
            {activeSection === 'Timesheet' && <TimesheetApprovalRequest />}
            {activeSection === 'Confirmation' && <ConfirmationRequest />}



        </div>
    );
};

export default Requesthandler;
































