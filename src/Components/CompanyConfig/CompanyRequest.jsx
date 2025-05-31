import React, { useState } from "react";
import '../CommonCss/EnrollDashboard.css';
import '../../string';
import CtcGenration from "../CTC/CtcGenration";
import CtcAttributes from "../CTC/CtcAttributes";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faDashboard, faMoneyCheck } from "@fortawesome/free-solid-svg-icons";
import CTCMaster from "./CTCMaster";


const CompanyRequest = () => {
    const [activeSection, setActiveSection] = useState('CTC Master');

    const handleButtonClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="coreContainer">

            <div className="layout">
                <div className='verticalForm'>
                    <button type="button" className={activeSection === 'CTC Master' ? 'active' : ''} onClick={() => handleButtonClick('CTC Master')}>
                        <FontAwesomeIcon className="icon" icon={faDashboard} />
                        CTC Master
                    </button>
                    <button type="button" className={activeSection === 'CTC Attributes' ? 'active' : ''} onClick={() => handleButtonClick('CTC Attributes')}>
                        <FontAwesomeIcon className="icon" icon={faClipboardList} />
                        CTC Attributes
                    </button>
                    <button type="button" className={activeSection === 'CTC Genration' ? 'active' : ''} onClick={() => handleButtonClick('CTC Genration')}>
                        <FontAwesomeIcon className="icon" icon={faMoneyCheck} />
                        CTC Genration
                    </button>

                </div>

                <div className="Companycontent">
                     {activeSection === 'CTC Master' && <CTCMaster />}
                    {activeSection === 'CTC Genration' && <CtcGenration />}
                    {activeSection === 'CTC Attributes' && <CtcAttributes />}

                </div>
            </div>
        </div>
    );
};

export default CompanyRequest;
