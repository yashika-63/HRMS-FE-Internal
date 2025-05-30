import React, { useEffect } from 'react';

const HandoverStep = ({
    formData,
    setFormData,
    error,
    currentStep,
    searchResults,
    setCurrentStep,
    handleNextStep,
    handleHandoverChange,
    handleHandoverEmployeeSelect,
    handleHandoverEmployeeNameChange,
    handleSelectHandoverEmployee,
    viewMode = false,
    isAssigning,
}) => {
    useEffect(() => {
        if (formData.handovers.length === 0) {
            setFormData(prev => ({
                ...prev,
                handovers: [{
                    title: '',
                    description: '',
                    employee: {
                        id: '',
                        employeeId: '',
                        employeeFirstName: '',
                        employeeLastName: ''
                    }
                }]
            }));
        }
    }, [formData.handovers.length, setFormData]);

    const addHandover = () => {
        setFormData(prev => ({
            ...prev,
            handovers: [
                ...prev.handovers,
                {
                    title: '',
                    responsiblePerson: '',
                    responsiblePersonId: '',
                    description: '',
                    employee: {
                        id: '',
                        employeeId: '',
                        employeeFirstName: '',
                        employeeLastName: ''
                    }
                }
            ]
        }));
    };

    const removeHandover = (index) => {
        if (formData.handovers.length <= 1) return;
        const updatedHandovers = formData.handovers.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, handovers: updatedHandovers }));
    };

    return (
        <div className="modal-body">
            {formData.handovers.map((handover, handoverIndex) => (
                <div key={handoverIndex} className="handover-group">
                    <div className="input-row">
                        <div>
                        <span className="required-marker">*</span>
                            <label htmlFor={`handoverTitle-${handoverIndex}`} className="off-form-label">Title:</label>
                            <input
                                type="text"
                                id={`handoverTitle-${handoverIndex}`}
                                name="title"
                                className="off-form-input"
                                value={handover.title || ''}
                                onChange={(e) => handleHandoverChange(handoverIndex, e)}
                                readOnly={viewMode}
                                required
                            />
                        </div>
                    </div>

                    <div className='input-row'>
                        <div>
                        <span className="required-marker">*</span>
                            <label htmlFor={`responsiblePersonId-${handoverIndex}`}>Responsible Person ID:</label>
                            <input
                                type='text'
                                name='employeeId'
                                id={`responsiblePersonId-${handoverIndex}`}
                                value={handover.employee.employeeId}
                                className='readonly'
                                onChange={(e) => handleHandoverEmployeeSelect(handoverIndex, e)}
                                readOnly
                                title="Please enter responsible person name"
                            />
                        </div>
                        <div>
                        <span className="required-marker">*</span>
                            <label htmlFor={`responsiblePersonName-${handoverIndex}`}>Responsible Person Name:</label>
                            <input
                                type='text'
                                name='employeeFirstName'
                                id={`responsiblePersonName-${handoverIndex}`}
                                value={handover.employee.employeeFirstName}
                                onChange={(e) => handleHandoverEmployeeNameChange(handoverIndex, e)}
                                readOnly={viewMode}
                                required
                            />
                            {error && <div className="error-message">{error}</div>}
                            {searchResults[handoverIndex] && searchResults[handoverIndex].length > 0 && (
                                <ul className="dropdown2">
                                    {searchResults[handoverIndex].map((employee) => (
                                        <li
                                            key={employee.id}
                                            onClick={() => handleSelectHandoverEmployee(handoverIndex, employee)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {`${employee.firstName} ${employee.lastName || ''} (${employee.employeeId})`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div>
                    <span className="required-marker">*</span>
                        <label htmlFor={`handoverDescription-${handoverIndex}`} className="off-form-label">Description:</label>
                        <textarea
                            id={`handoverDescription-${handoverIndex}`}
                            name="description"
                            className="off-form-input off-form-textarea"
                            value={handover.description || ''}
                            onChange={(e) => handleHandoverChange(handoverIndex, e)}
                            readOnly={viewMode}
                            rows="4"
                        />
                    </div>

                    {handoverIndex > 0 && (
                            <button
                                type="button"
                                className="outline-btn"
                                onClick={() => removeHandover(handoverIndex)}
                            >
                                Remove Handover
                            </button>
                        )}
                </div>
            ))}
            <div className='form-controls'>
                <button
                    type="button"
                    onClick={addHandover}
                    className='btn'
                    style={{ marginTop: '10px' }}
                >
                    Add New Handover
                </button>
            </div>
            {!viewMode && (
                <div className="form-controls">
                    <button type="button" className='btn' onClick={handleNextStep}>
                        {isAssigning ? (
                            <>
                                <div className="loading-spinner"></div>
                                Saving...
                            </>
                        ) : (
                            'Next'
                        )}
                    </button>
                    <button type="button" className='outline-btn' onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
                </div>
            )}
            {viewMode && (
                <div className="form-controls">
                    <button type="button" className='btn' onClick={() => setCurrentStep(currentStep + 1)}>Next</button>
                    <button type="button" className='outline-btn' onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
                </div>
            )}
        </div>
    );
};

export default HandoverStep;