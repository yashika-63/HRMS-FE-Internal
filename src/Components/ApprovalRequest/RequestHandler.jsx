import React, { useState, useEffect } from "react";
import LeaveApprovalRequest from "./LeaveApprovalRequest";
import ExpenseApprovalRequest from "./ExpenseApprovalRequest";
import FeedbackApprovalrequest from "./FeedbackApprovalRequest";
import AppraisalApprovalRequest from "./AppraisalApprovalRequest";
import TrainingApprovalRequest from "./TrainingApprovalRequest";
import TimesheetApprovalRequest from "./TimesheetApprovalRequest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
<<<<<<< HEAD
import { faBookOpen, faBullhorn, faCalendarCheck, faCheckToSlot, faPeopleArrowsLeftRight, faReceipt, faStar, faStopwatch, faTree, faUserTimes } from "@fortawesome/free-solid-svg-icons";
import ConfirmationRequest from "./ConfirmationRequest";
=======
import { faBookOpen, faBullhorn, faCalendarCheck, faCheckToSlot, faPager, faPeopleGroup, faReceipt, faStar, faStopwatch, faTree, faUserTimes } from "@fortawesome/free-solid-svg-icons";
import ConfirmationRequest from "./ConfirmationRequest";
import MrfApprovalRequest from "./MrfApprovalRequest";
>>>>>>> 8a5f66f (merging code)



const Requesthandler = () => {

    const [activeSection, setActiveSection] = useState('Employee Leaves');


    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="coreContainer">
            <div className="form-title">Approval requests </div>

<<<<<<< HEAD
            <div>
                <div className='addform'>
                    <button type="button" className={activeSection === 'Employee Leaves' ? 'active' : ''} onClick={() => handleButtonClick('Employee Leaves')}>
                        <FontAwesomeIcon className="icon" icon={faCalendarCheck} />
                         Leaves
                    </button>
                    <button type="button" className={activeSection === 'Expenses' ? 'active' : ''} onClick={() => handleButtonClick('Expenses')}>
                        <FontAwesomeIcon className="icon" icon={faReceipt} />
                        Expenses 
=======

            <div className='layout'>
                <div className="verticalForm">
                    <button type="button" className={activeSection === 'Employee Leaves' ? 'active' : ''} onClick={() => handleButtonClick('Employee Leaves')}>
                        <FontAwesomeIcon className="icon" icon={faCalendarCheck} />
                        Leaves
                    </button>
                    <button type="button" className={activeSection === 'Expenses' ? 'active' : ''} onClick={() => handleButtonClick('Expenses')}>
                        <FontAwesomeIcon className="icon" icon={faReceipt} />
                        Expenses
>>>>>>> 8a5f66f (merging code)
                    </button>
                    <button type="button" className={activeSection === 'Feedback' ? 'active' : ''} onClick={() => handleButtonClick('Feedback')}>
                        <FontAwesomeIcon className="icon" icon={faBullhorn} />
                        Feedback
                    </button>
                    <button type="button" className={activeSection === 'Appraisal' ? 'active' : ''} onClick={() => handleButtonClick('Appraisal')}>
                        <FontAwesomeIcon className="icon" icon={faStar} />
<<<<<<< HEAD
                        Appraisal 
=======
                        Appraisal
>>>>>>> 8a5f66f (merging code)
                    </button>

                    <button type="button" className={activeSection === 'Training' ? 'active' : ''} onClick={() => handleButtonClick('Training')}>
                        <FontAwesomeIcon className="icon" icon={faBookOpen} />
<<<<<<< HEAD
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
                    <button type="button" className={activeSection === 'Transfer' ? 'active' : ''} onClick={() => handleButtonClick('Transfer')}>
                        <FontAwesomeIcon className="icon" icon={faPeopleArrowsLeftRight} />
                        Transfer 
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
            {activeSection === 'Transfer' && <ConfirmationRequest />}



=======
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
                    <button type="button" className={activeSection === 'MrfApprovalRequest' ? 'active' : ''} onClick={() => handleButtonClick('MrfApprovalRequest')}>
                        <FontAwesomeIcon className="icon" icon={faPeopleGroup} />
                       MRF 
                    </button>
                </div>


                <div className="Companycontent">
                    {activeSection === 'Employee Leaves' && <LeaveApprovalRequest />}
                    {activeSection === 'Expenses' && <ExpenseApprovalRequest />}
                    {activeSection === 'Feedback' && <FeedbackApprovalrequest />}
                    {activeSection === 'Appraisal' && <AppraisalApprovalRequest />}
                    {activeSection === 'Training' && <TrainingApprovalRequest />}
                    {activeSection === 'Timesheet' && <TimesheetApprovalRequest />}
                    {activeSection === 'Confirmation' && <ConfirmationRequest />}
                    {activeSection === 'MrfApprovalRequest' && <MrfApprovalRequest />}
                </div>
            </div>
>>>>>>> 8a5f66f (merging code)
        </div>
    );
};

export default Requesthandler;
































