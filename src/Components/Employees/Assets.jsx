import React, { useState, useEffect } from 'react';
import { fetchDataByKey, showToast } from '../../Api.jsx';
import axios from 'axios';
import { strings } from '../../string.jsx';
import { useParams } from 'react-router-dom';

const Assets = () => {
    const [dropdownData, setDropdownData] = useState({ AssetLabels: [] });
    const [selectedLabels, setSelectedLabels] = useState(['']);
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [responseId, setResponseId] = useState(null);
    const { id: employeeId } = useParams();

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const AssetLabels = await fetchDataByKey('AssetLabels');
                setDropdownData({ AssetLabels });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };

        fetchDropdownData();
    }, []);

    const handleLabelChange = (index, value) => {
        const updatedLabels = [...selectedLabels];
        updatedLabels[index] = value;
        setSelectedLabels(updatedLabels);
    };

    const addNewDropdown = () => {
        setSelectedLabels([...selectedLabels, '']);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = selectedLabels
                .filter(label => label)
                .map(label => ({ lable: label }));

            const response = await axios.post(
                `http://${strings.localhost}/api/asset/save/${employeeId}`,
                payload
            );
            showToast('Save successful:', response.data);
            setResponseId(response.data.responseId);
            setShowConfirmPopup(true);
        } catch (error) {
            showToast('Error saving asset labels:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendToEmployee = async () => {
        if (!responseId) return;

        setIsSending(true);
        try {
            const sendResponse = await axios.post(
                `http://${strings.localhost}/api/asset/send-to-employee/${responseId}`
            );
            showToast('Sent to employee:', sendResponse.data);
            setShowConfirmPopup(false);
        } catch (error) {
            showToast('Error sending asset to employee:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleCancelSend = () => {
        setShowConfirmPopup(false);
    };

    return (
        <div className="coreContainer">
            <div className='box-container educational-info-box'>
            <h4 className='underlineText'> Asset Details</h4>
                {selectedLabels.map((label, index) => (
               <div key={index} className="asset-row">
               <span className="required-marker">*</span>
               <label htmlFor={`asset-${index}`}>Asset Label</label>
               <select
                   id={`asset-${index}`}
                   name={`${index}`}
                   value={label}
                   onChange={(e) => handleLabelChange(index, e.target.value)}
                   required
                   className="asset-select"
               >
                   <option value="" disabled hidden>Select</option>
                   {dropdownData.AssetLabels.length > 0 ? (
                       dropdownData.AssetLabels.map((option) => (
                           <option
                               key={option.masterId}
                               value={option.data}
                               disabled={selectedLabels.includes(option.data) && label !== option.data}
                           >
                               {option.data}
                           </option>
                       ))
                   ) : (
                       <option value="" disabled>Not available</option>
                   )}
               </select>
               <div className="asset-buttons">
                   {index === selectedLabels.length - 1 && (
                       <button type="button" className="outline-btn" onClick={addNewDropdown}>+</button>
                   )}
                   {selectedLabels.length > 1 && (
                       <button
                           type="button"
                           className="remove-button outline-btn"
                           onClick={() => {
                               const updatedLabels = selectedLabels.filter((_, i) => i !== index);
                               setSelectedLabels(updatedLabels);
                           }}
                       >−</button>
                   )}
               </div>
           </div>
           
                ))}
                <div className="btnContainer">
                    <button type="button" className="btn" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
                {showConfirmPopup && (
                    <div className="confirm-popup">
                        <div className="popup-content">
                            <h3>Do you really want to send this to the employee?</h3>
                            <div className="popup-buttons">
                                <button onClick={handleSendToEmployee} disabled={isSending}>
                                    {isSending ? 'Sending...' : 'Yes, Send'}
                                </button>
                                <button onClick={handleCancelSend}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Assets;
