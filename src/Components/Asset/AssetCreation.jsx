import React, { useState, useEffect } from 'react';
import { fetchDataByKey, showToast } from '../../Api.jsx';
import axios from 'axios';
import { strings } from '../../string.jsx';

const AssetCreation = ({ employeeId, handleClose, onClose }) => {
    const [dropdownData, setDropdownData] = useState({ AssetLabels: [] });
    const [selectedLabels, setSelectedLabels] = useState(['']);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [existingLabels, setExistingLabels] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [responseId, setResponseId] = useState(null);

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


    const fetchExistingLabels = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/asset/getWithDetailsByEmployee/${employeeId}`);
            if (response.data && response.data.length > 0) {
                setExistingLabels(response.data[0].details);
                setResponseId(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching existing labels:', error);
        }
    };
    useEffect(() => {
        fetchExistingLabels();
    }, [employeeId]);

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
            const message = response?.data || 'Save successfully.';
            showToast(message, 'success');
            await fetchExistingLabels();
            setShowConfirmPopup(true);
            setIsCreating(false);
            onClose();
        } catch (error) {
            showToast('Error saving asset labels:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSend = async () => {
        // if (!responseId) return;

        setIsSending(true);
        try {
            const sendResponse = await axios.put(
                `http://${strings.localhost}/api/asset/send-to-employee/${responseId}`
            );
            showToast('successfully sent to employee.', 'success');
            setShowConfirmPopup(false);
            // onClose();
               handleClose();
        } catch (error) {
            showToast('Error sending asset to employee:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleCancelSend = () => {
        setShowConfirmPopup(false);
    };
    const shouldShowSendButton = existingLabels.some(
        (asset) => asset.assetManagement?.sentForEmployeeAction === false
    );


    return (
        <div className="add-popup">
            <div className='popup-fields'>
                <h3 className='centerText'>Asset List</h3>
                <button className="close-button" onClick={handleClose}>X</button>
                {!isCreating && (
                    <div className='form-controls'>
                        <button className="btn" onClick={() => setIsCreating(true)}>Create</button>
                    </div>
                )}
                {existingLabels.length > 0 ? (
                    <ul>
                        {existingLabels.map((label, index) => (
                            <li key={index}>{label.lable}</li>
                        ))}
                    </ul>
                ) : (
                    <p className='no-data'>No assets for this employee</p>
                )}


                {isCreating && (
                    <>
                        {selectedLabels.map((label, index) => (
                            <div key={index}>
                                <span className="required-marker">*</span>
                                <label className='asset'>Asset Label</label>
                                <div className="asset-row">
                                    <select

                                        name={`${index}`}
                                        value={label}
                                        onChange={(e) => handleLabelChange(index, e.target.value)}
                                        required
                                    >
                                        <option value="" disabled hidden>
                                            Select
                                        </option>
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
                                            <option value="" disabled>
                                                Not available
                                            </option>
                                        )}
                                    </select>
                                    <div className="asset-buttons">
                                        {index === selectedLabels.length - 1 && (
                                            <button type="button" className="outline-btn" onClick={addNewDropdown}>
                                                +
                                            </button>

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
                            </div>
                        ))}
                        <div className="btnContainer">
                            <button type="button" className='btn' onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button className='outline-btn' type="button" onClick={handleClose}>
                                Cancel
                            </button>
                        </div>
                    </>
                )}
                {shouldShowSendButton && (
                    <div className="form-controls">
                        <button type='button' className="btn" onClick={() => setShowConfirmPopup(true)}>
                            Send to Employee
                        </button>
                    </div>
                )}

                {showConfirmPopup && (
                    <div className="add-popup">
                        <div className="popup-content">
                            <h3>Are you sure you want to send this  request to the employee?</h3>
                            <div className="btnContainer">
                                <button type='button' className='btn' onClick={handleSend} disabled={isSending}>
                                    {isSending ? 'Sending...' : 'Send'}
                                </button>
                                <button type='button' className='outline-btn' onClick={handleCancelSend}>
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

export default AssetCreation;
