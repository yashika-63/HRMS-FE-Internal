import React, { useState } from 'react';
import axios from 'axios';
import { showToast } from '../../Api.jsx';
import { strings } from '../../string.jsx';

const ConfirmationPopup = ({ onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const preRegId = localStorage.getItem("Id");

    const sendForVerification = async () => {
        try {
            await axios.put(`http://${strings.localhost}/api/verification/ticket/sendForVerification/${preRegId}`);
            showToast("Ticket sent for verification!", 'success');
            onClose(); 
            window.location.reload();
        } catch (error) {
            const message = error?.response?.data?.details || "Something went wrong while sending for verification.";
            showToast(message, "error");
        }
    };

    const handleYesClick = async () => {
        setIsLoading(true);
        await sendForVerification(); 
        setIsLoading(false);
    };

    return (
        <div className='add-popup'>
            <h3 className='centerText'>Confirmation</h3>
            <p style={{ textAlign: 'center' }}>Are you sure you want to send for verification?</p>

            <div className='btnContainer'>
                <button
                    type='button'
                    onClick={handleYesClick}
                    disabled={isLoading}
                    className='btn'
                >
                    {isLoading && <span className="loading-spinner" />} 
                    {isLoading ? 'Sending...' : 'Yes'}
                </button>

                <button
                    type='button'
                    onClick={onClose}
                    disabled={isLoading}
                    className='outline-btn'
                >
                    No
                </button>
            </div>

            {/* Spinner animation */}
           
        </div>
    );
};

export default ConfirmationPopup;
