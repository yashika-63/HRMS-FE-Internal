import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchDataByKey, showToast } from '../../Api.jsx';
import { strings } from '../../string.jsx';

const TemplateForm = ({ setShowPopup, selectedTemplate, setshowUpdatePopup, showUpdatePopup ,fetchTemplates  }) => {
    const companyId = localStorage.getItem('companyId');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        subject: '',
        body: '',
        templateIdentityKey: '',
    });
    const [dropdownData, setDropdownData] = useState({
        Letter: [],
    });

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const Letter = await fetchDataByKey('Letter');
                setDropdownData({ Letter });
                if (selectedTemplate) {
                    setFormData({
                        subject: selectedTemplate.subject || '',
                        body: selectedTemplate.body || '',
                        templateIdentityKey: selectedTemplate.templateIdentityKey || '',
                    });
                } else {
                    // Reset formData for creating a new template
                    setFormData({
                        subject: '',
                        body: '',
                        templateIdentityKey: '',
                    });
                }
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };

        fetchDropdownData();
    }, [selectedTemplate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setError('');
    };
    const validateForm = () => {
        const { subject, body, templateIdentityKey } = formData;
        if (!subject || !body || !templateIdentityKey) {
            setError('All fields are required');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        const { subject, body, templateIdentityKey } = formData;
        const payload = { templateIdentityKey, subject, body };

        try {
            const response = await axios.post(`http://${strings.localhost}/api/letter-template/save/${companyId}`, payload);
            console.log('Template saved successfully:', response.data);
            showToast("Template Created Successfully.", 'success');
            setShowPopup(false);
            fetchTemplates();
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    const handleUpdateTemplate = async () => {
        const { subject, body, templateIdentityKey } = formData;
        const payload = { templateIdentityKey, subject, body };

        try {
            const response = await axios.put(`http://l${strings.localhost}/api/letter-template/update/${selectedTemplate.id}`, payload);
            console.log('Template updated successfully:', response.data);
            showToast("Template Updated Successfully.", 'success');
            setshowUpdatePopup(false); 
        } catch (error) {
            console.error('Error updating template:', error);
        }
    };

    return (
        <div>
            <div className="add-popup">
                <div className="popup-content">
                    <h2 className="centerText">{showUpdatePopup ? 'Update Template' : 'Create Template'}</h2>
                    <div>
                        <label>Subject</label>
                        <input
                            type="text"
                            name='subject'
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Body</label>
                        <textarea
                            name="body"
                            value={formData.body}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Letter Type</label>
                        <select
                            name="templateIdentityKey"
                            value={formData.templateIdentityKey}
                            onChange={handleChange}
                            required
                            disabled={showUpdatePopup}
                            style={{ cursor: showUpdatePopup ? 'not-allowed' : 'auto' }}
                        >
                            <option value="" disabled hidden>Select</option>
                            {dropdownData.Letter.length > 0 ? (
                                dropdownData.Letter.map((option) => (
                                    <option key={option.masterId} value={option.data}>
                                        {option.data}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>
                                    Not available
                                </option>
                            )}
                        </select>
                    </div>
                    <div className="btnContainer">
                        <button type="button" className="btn" onClick={showUpdatePopup ? handleUpdateTemplate : handleSave}>
                            {showUpdatePopup ? 'Update' : 'Save'}
                        </button>
                        {!showUpdatePopup && (
                            <button type="button" className="outline-btn" onClick={() => setShowPopup(false)}>
                                Cancel
                            </button>
                        )}
                        {showUpdatePopup && (
                            <button type="button" className="outline-btn" onClick={() => setshowUpdatePopup(false)}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateForm;
