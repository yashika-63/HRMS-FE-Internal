import React from 'react';

const ExitInterviewStep = ({
    formData,
    setFormData,
    handleBasicInfoChange,
    handleDateChange,
    setCurrentStep,
    handleSubmit,    
    currentStep,
    viewMode = false
}) => {

    return (
        <div className="off-form-step">
            
            <div className="exit-interview-section">
                <div className="input-row">
                    <div>
                    <span className="required-marker">*</span>
                        <label htmlFor="interviewDate">Interview Date:</label>
                        <input
                            type="date"
                            id="interviewDate"
                            name="interviewDate"
                            className="selectIM"
                            value={formData.exitInterview.interviewDate || ''}
                            min={new Date().toISOString().split('T')[0]}
                            readOnly={viewMode}
                            onChange={(e) => handleDateChange(e, 'interviewDate')}
                        />
                    </div>

                    <div>
                    <span className="required-marker">*</span>
                        <label htmlFor="lengthOfService">Years of Service:</label>
                        <input
                            type="number"
                            id="lengthOfService"
                            name="lengthOfService"
                            className="selectIM"
                            value={formData.exitInterview.lengthOfService || ''}
                            onChange={(e) => handleBasicInfoChange(e)}
                            readOnly={viewMode}
                            step="0.1"
                            min="0"
                        />
                    </div>

                    <div className="reason-section">
                        <div className="input-row">
                            <div>
                            <span className="required-marker">*</span>
                                <label htmlFor="leavingReason">Primary Reason:</label>
                                <select
                                    id="leavingReason"
                                    name="leavingReason"
                                    className="selectIM"
                                    value={formData.exitInterview?.leavingReason || ''}
                                    readOnly={viewMode}
                                    onChange={(e) => handleBasicInfoChange(e)}
                                >
                                    <option value="">Select a reason</option>
                                    <option value="Resignation">Resignation</option>
                                    <option value="Laid Off">Laid Off</option>
                                    <option value="Retirement">Retirement</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {formData.exitInterview?.leavingReason === "Other" && (
                                <div>
                                    <label htmlFor="otherReason">Specify Reason:</label>
                                    <input
                                        type="text"
                                        id="otherReason"
                                        name="otherReason"
                                        className="off-form-input"
                                        value={formData.exitInterview?.otherReason || ''}
                                        readOnly={viewMode}
                                        onChange={(e) => handleBasicInfoChange(e)}
                                    />
                                </div>
                            )}
                        </div>

                        {formData.exitInterview?.leavingReason === "Resignation" && (
                            <div className="resignation-reasons">
                                <label>Resignation Reasons (select all that apply):</label>
                                <div className="reason-checkboxes">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="resignationReasons"
                                            value="Took another position"
                                            checked={formData.exitInterview?.resignationReasons?.includes("Took another position")}
                                            onChange={(e) => handleBasicInfoChange(e)}
                                            readOnly={viewMode}
                                        /> Took another position
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="resignationReasons"
                                            value="Home/family needs"
                                            checked={formData.exitInterview?.resignationReasons?.includes("Home/family needs")}
                                            onChange={(e) => handleBasicInfoChange(e)}
                                            readOnly={viewMode}
                                        /> Home/family needs
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="resignationReasons"
                                            value="Health"
                                            checked={formData.exitInterview?.resignationReasons?.includes("Health")}
                                            onChange={(e) => handleBasicInfoChange(e)}
                                            readOnly={viewMode}
                                        /> Health
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="resignationReasons"
                                            value="Other"
                                            checked={formData.exitInterview?.resignationReasons?.includes("Other")}
                                            onChange={(e) => handleBasicInfoChange(e)}
                                            readOnly={viewMode}
                                        /> Other:
                                        {formData.exitInterview?.resignationReasons?.includes("Other") && (
                                            <input
                                                type="text"
                                                name="resignationOtherReason"
                                                className="off-form-input"
                                                value={formData.exitInterview?.resignationOtherReason || ''}
                                                onChange={(e) => handleBasicInfoChange(e)}
                                            />
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}

                        {formData.exitInterview?.leavingReason === "Laid Off" && (
                            <div className="laidoff-reasons">
                                <label>Laid Off Reasons (select all that apply):</label>
                                <div className="reason-checkboxes">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="laidOffReasons"
                                            value="Poor performance"
                                            checked={formData.exitInterview?.laidOffReasons?.includes("Poor performance")}
                                            onChange={(e) => handleBasicInfoChange(e)}
                                        /> Poor performance
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="laidOffReasons"
                                            value="Violation of Company Policy"
                                            checked={formData.exitInterview?.laidOffReasons?.includes("Violation of Company Policy")}
                                            onChange={(e) => handleBasicInfoChange(e)}
                                        /> Violation of Company Policy
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="laidOffReasons"
                                            value="Other"
                                            checked={formData.exitInterview?.laidOffReasons?.includes("Other")}
                                            onChange={(e) => handleBasicInfoChange(e)}
                                        /> Other:
                                        {formData.exitInterview?.laidOffReasons?.includes("Other") && (
                                            <input
                                                type="text"
                                                name="laidOffOtherReason"
                                                className="off-form-input"
                                                value={formData.exitInterview?.laidOffOtherReason || ''}
                                                onChange={(e) => handleBasicInfoChange(e)}
                                            />
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="input-row">
                    <div>
                    <span className="required-marker">*</span>
                        <label htmlFor="employeeTitle">Employee Designation:</label>
                        <input
                            type="text"
                            id="employeeTitle"
                            name="employeeTitle"
                            className="off-form-input"
                            value={formData.exitInterview?.employeeTitle || ''}
                            onChange={(e) => handleBasicInfoChange(e)}
                        />
                    </div>
                    <div>
                    <span className="required-marker">*</span>
                        <label htmlFor="supervisorName">Supervisor Name:</label>
                        <input
                            type="text"
                            id="supervisorName"
                            name="supervisorName"
                            className="off-form-input"
                            value={formData.exitInterview?.supervisorName || ''}
                            onChange={(e) => handleBasicInfoChange(e)}
                        />
                    </div>
                    <div>
                    <span className="required-marker">*</span>
                        <label htmlFor="supervisorTitle">Supervisor Designation:</label>
                        <input
                            type="text"
                            id="supervisorTitle"
                            name="supervisorTitle"
                            className="off-form-input"
                            value={formData.exitInterview?.supervisorTitle || ''}
                            onChange={(e) => handleBasicInfoChange(e)}
                        />
                    </div>
                </div>
            </div>

            <div className="form-controls">
                {!viewMode && (
                    <>
                        <button type="button" className='outline-btn' onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
                        <button type="submit" className='btn' onClick={handleSubmit}>Submit</button>
                    </>
                )}
                {viewMode && (
                    <button type="button" className='outline-btn' onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
                    
                )}

            </div>
        </div>
    );
};

export default ExitInterviewStep;