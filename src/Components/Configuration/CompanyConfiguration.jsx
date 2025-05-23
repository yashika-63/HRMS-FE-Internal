import React, { useState } from "react";
import '../CommonCss/EnrollDashboard.css';
import '../../string';
import CompanylevelConfiguration from './CompanyLevelConfiguration';
import CompanyDayOff from "./CompanyDayOff";
import CtcGenration from "../CTC/CtcGenration";
import CtcAttributes from "../CTC/CtcAttributes";
import OrganizationalGoal from "../Pms/OrganizationSetup/OrganizationalGoal";
import OrganizationalKPI from "../Pms/OrganizationSetup/OrganizationalKPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBucket, faBullseye, faCalendarDay, faCalendarXmark, faClipboardList, faCogs, faFileAlt, faFileCircleCheck, faGear, faMoneyCheck, faTachometerAlt } from "@fortawesome/free-solid-svg-icons";
import CompanyConfig from "./CompanyConfig";
import TemplateCreation from "../Templates/TemplateCreation";
import CompanyDocument from "../CompanySetting/CompanyDocument";
import LeaveBucketCreation from "../Leaves/LeaveBucketCreation";
import CompanySettings from "../CompanySetting/CompanySettings";

const CompanyConfiguration = () => {
    const [activeSection, setActiveSection] = useState('company holiday'); // Default active section is 'Attributes'

    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="coreContainer">
            {/* <div className="form-title">
                Company Configuration
            </div> */}

            <div className="layout">
                {/* Sidebar */}
                <div className='verticalForm'>
                    <button type="button" className={activeSection === 'company holiday' ? 'active' : ''} onClick={() => handleButtonClick('company holiday')}>
                        <FontAwesomeIcon className="icon" icon={faCalendarDay} />
                        Company Holiday
                    </button>
                    <button type="button" className={activeSection === 'Company Day Off' ? 'active' : ''} onClick={() => handleButtonClick('Company Day Off')}>
                        <FontAwesomeIcon className="icon" icon={faCalendarXmark} />
                        Company Day-Off
                    </button>
                    <button type="button" className={activeSection === 'CTC Attributes' ? 'active' : ''} onClick={() => handleButtonClick('CTC Attributes')}>
                        <FontAwesomeIcon className="icon" icon={faClipboardList} />
                        CTC Attributes
                    </button>
                    <button type="button" className={activeSection === 'CTC Genration' ? 'active' : ''} onClick={() => handleButtonClick('CTC Genration')}>
                        <FontAwesomeIcon className="icon" icon={faMoneyCheck} />
                        CTC Genration
                    </button>
                    <button type="button" className={activeSection === 'Goal Management' ? 'active' : ''} onClick={() => handleButtonClick('Goal Management')}>
                        <FontAwesomeIcon className="icon" icon={faBullseye} />
                        Goal Management
                    </button>
                    <button type="button" className={activeSection === 'KPI Management' ? 'active' : ''} onClick={() => handleButtonClick('KPI Management')}>
                        <FontAwesomeIcon className="icon" icon={faTachometerAlt} />
                        KPI Management
                    </button>
                    <button type="button" className={activeSection === 'Company prefrences' ? 'active' : ''} onClick={() => handleButtonClick('Company prefrences')}>
                        <FontAwesomeIcon className="icon" icon={faCogs} />
                        Company Prefrences
                    </button>
                    <button type="button" className={activeSection === 'Company Documents' ? 'active' : ''} onClick={() => handleButtonClick('Company Documents')}>
                        <FontAwesomeIcon className="icon" icon={faFileCircleCheck} />
                        Company Documents
                    </button>
                    <button type="button" className={activeSection === 'Company Templates' ? 'active' : ''} onClick={() => handleButtonClick('Company Templates')}>
                        <FontAwesomeIcon className="icon" icon={faFileAlt} />
                        Company Templates
                    </button>
                    <button type="button" className={activeSection === 'Leave Bucket' ? 'active' : ''} onClick={() => handleButtonClick('Leave Bucket')}>
                        <FontAwesomeIcon className="icon" icon={faBucket} />
                        Leave Bucket
                    </button>
                    <button type="button" className={activeSection === 'Company Settings' ? 'active' : ''} onClick={() => handleButtonClick('Company Settings')}>
                        <FontAwesomeIcon className="icon" icon={faGear} />
                        Company Settings
                    </button>
                </div>

                {/* Content Area */}
                <div className="Companycontent">
                    {activeSection === 'CTC Genration' && <CtcGenration />}
                    {activeSection === 'CTC Attributes' && <CtcAttributes />}
                    {activeSection === 'company holiday' && <CompanylevelConfiguration />}
                    {activeSection === 'Company Day Off' && <CompanyDayOff />}
                    {activeSection === 'Goal Management' && <OrganizationalGoal />}
                    {activeSection === 'KPI Management' && <OrganizationalKPI />}
                    {activeSection === 'Company prefrences' && <CompanyConfig />}
                    {activeSection === 'Company Documents' && <CompanyDocument/>}
                    {activeSection === 'Company Templates' && <TemplateCreation/>}
                    {activeSection === 'Leave Bucket' && <LeaveBucketCreation/>}
                    {activeSection === 'Company Settings' && <CompanySettings/>}
                </div>
            </div>
        </div>
    );
};

export default CompanyConfiguration;
