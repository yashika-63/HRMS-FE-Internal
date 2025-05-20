import React, { useState, useEffect } from 'react';
import TemplateForm from './TemplateForm'; // Import TemplateForm
import TemplateDetails from './TemplateDetails'; // Import TemplateDetails
import axios from 'axios';
import '../CommonCss/template.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faEdit, faEllipsisV, faEye, faFileLines } from '@fortawesome/free-solid-svg-icons';
import { showToast } from '../../Api.jsx';
import { strings } from '../../string.jsx';

const TemplateCreation = () => {

    const [showPopup, setShowPopup] = useState(false);
    const [showDetailsPopup, setShowDetailsPopup] = useState(false);
    const [showUpdatePopup, setshowUpdatePopup] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [status, setStatus] = useState(true);
    const companyId = localStorage.getItem('companyId');
    const [templates, setTemplates] = useState([]);


    const fetchTemplates = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/letter-template/by-company-and-status?companyId=${companyId}&status=${status}`);
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [companyId, status]);

    const handleTemplateClick = (template) => {
        setSelectedTemplate(template);
        setShowDetailsPopup(true);
    };

    const handleUpdate = (template) => {
        setSelectedTemplate(template);
        setshowUpdatePopup(true);
    };

    const handleInactiveButtonClick = (template) => {
        setSelectedTemplate(template);
        setShowConfirmation(true);
    };
    const handleCreateTemplate = () => {
        setSelectedTemplate(null);
        setshowUpdatePopup(false);
        setShowPopup(true);
    };
    const handleStatusChange = (e) => {
        setStatus(e.target.value === 'active');
    };
    const editDropdown = (template) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button type="button" onClick={() => handleTemplateClick(template)}>
                       <FontAwesomeIcon icon={faEye}/> View
                    </button>
                </div>
                <div>
                    <button type="button" onClick={() => handleInactiveButtonClick(template)}>
                     <FontAwesomeIcon icon={faBan}/>   Inactive
                    </button>
                </div>
                <div>
                    <button type="button" onClick={() => handleUpdate(template)}>
                      <FontAwesomeIcon icon={faEdit}/>    Update</button>
                </div>
            </div>
        </div>
    );

    const handleInactive = async () => {
        try {
            await axios.put(`http://${strings.localhost}/api/letter-template/updateStatus/${selectedTemplate.id}?status=false`);
            showToast("Template marked as inactive successfully.");
            setShowConfirmation(false);
            fetchTemplates();
        } catch (error) {
            console.error("Error marking template as inactive:", error);
            showToast("Failed to mark template as inactive.");
        }
    };

    return (
        <div className="coreContainer">
            <div className='middleline-btn'>
                <div>
                    <select value={status ? 'active' : 'inactive'} onChange={handleStatusChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div>
                    <button type="button" className="btn" onClick={handleCreateTemplate}>Create Template</button>
                </div>
            </div>

            {showPopup && (
                <TemplateForm
                    setShowPopup={setShowPopup}
                    selectedTemplate={selectedTemplate}
                    setshowUpdatePopup={setshowUpdatePopup}
                    showUpdatePopup={false}
                    fetchTemplates={fetchTemplates}
                />
            )}

            {showUpdatePopup && selectedTemplate && (
                <TemplateForm
                    setShowPopup={setShowPopup}
                    selectedTemplate={selectedTemplate}
                    setshowUpdatePopup={setshowUpdatePopup}
                    showUpdatePopup={true}
                />
            )}

            <div className="template-cards">
                {/* <h2 className="title">Available Templates</h2> */}
                <div className="templatecard-container">
                    {templates.length > 0 ? (
                        templates.map((template) => (
                            <div className="templatecard" key={template.id}>
                                <div className="top-header">
                                    {editDropdown(template)}
                                </div>
                                <div className="file-icon">
                                    <FontAwesomeIcon icon={faFileLines} />
                                </div>
                                <h3 className="centerText">{template.subject}</h3>
                                <div className="company-info">
                                    <strong>Company:</strong> {template.company.companyName}<br />
                                    <strong>Type:</strong> {template.company.companyType}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No templates available</p>
                    )}
                </div>
            </div>

            {showDetailsPopup && selectedTemplate && (
                <TemplateDetails selectedTemplate={selectedTemplate} setShowDetailsPopup={setShowDetailsPopup} />
            )}

            {showConfirmation && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to mark the {selectedTemplate.templateIdentityKey} template as inactive?</p>
                    <div className="btnContainer">
                        <button className="btn" onClick={handleInactive}>Yes</button>
                        <button className="outline-btn" onClick={() => setShowConfirmation(false)}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateCreation;
