import React, { useState } from 'react';
import moment from 'moment';

const BasicInfoStep = ({
    formData,
    setFormData,
    selectedEmployee,
    selectedManager,
    dropdownData,
    setShowOtherReason,
    handleDateChange,
    handleBasicInfoChange,
    handleEmployeeSelect,
    handleEmployeeNameChange,
    handleSelectEmployee,
    handleManagerNameChange,
    handleSelectManager,
    employeeError,
    managerError,
    employeeSearchResults,
    managerSearchResults,
    onClose,
    handleNextStep,
    isReadOnly,
    viewMode,
    isAssigning,
}) => {
    if (isReadOnly) {
        return (
            <div className="step-content">
                <h3>Basic Information</h3>
                <div className="read-only-info">
                    <div className="form-group">
                        <label>Employee Name:</label>
                        <p>{formData.basicInfo.name}</p>
                    </div>
                    <div className="form-group">
                        <label>Department:</label>
                        <p>{formData.basicInfo.department}</p>
                    </div>
                    <div className="form-group">
                        <label>Last Working Date:</label>
                        <p>{formData.basicInfo.lastDate}</p>
                    </div>
                    <div className="form-group">
                        <label>Reason:</label>
                        <p>{formData.basicInfo.reason}</p>
                    </div>
                    {formData.basicInfo.other && (
                        <div className="form-group">
                            <label>Other Reason:</label>
                            <p>{formData.basicInfo.other}</p>
                        </div>
                    )}
                    {/* <div className="button-group">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleNextStep}
                        >
                            Proceed to Handover
                        </button>
                    </div> */}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="modal-body">
                <div className='input-row'>
                    <div>
                        <span className="required-marker">*</span>
                        <label htmlFor='empId'>Employee ID:</label>
                        <input
                            type='text'
                            name='employeeId'
                            id='empId'
                            className='readonly'
                            value={selectedEmployee.employeeId}
                            onChange={handleEmployeeSelect}
                            readOnly
                            title="Please enter employee name"
                        />
                    </div>
                    <div>
                        <span className="required-marker">*</span>
                        <label htmlFor='empName'>Employee Name:</label>
                        <input
                            type='text'
                            name='name'
                            id='empName'
                            className='selectIM'
                            value={selectedEmployee.employeeFirstName}
                            onChange={handleEmployeeNameChange}
                            readOnly={viewMode}
                            required
                        />
                        {employeeError && <div className="error-message">{employeeError}</div>}
                        {employeeSearchResults.length > 0 && (
                            <ul className="dropdown2">
                                {employeeSearchResults.map((employee) => (
                                    <li
                                        key={employee.id}
                                        onClick={() => handleSelectEmployee(employee)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {`${employee.firstName} ${employee.lastName || ''} (${employee.employeeId})`}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <span className="required-marker">*</span>
                        <label htmlFor='reportingManagerName'>Reporting Manager Name:</label>
                        <input
                            type='text'
                            name='reportingManagerName'
                            id='reportingManagerName'
                            value={selectedManager.employeeFirstName}
                            onChange={handleManagerNameChange}
                            readOnly={viewMode}
                            required
                        />
                        {managerError && <div className="error-message">{managerError}</div>}
                        {managerSearchResults.length > 0 && (
                            <ul className="dropdown2">
                                {managerSearchResults.map((employee) => (
                                    <li
                                        key={employee.id}
                                        onClick={() => handleSelectManager(employee)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {`${employee.firstName} ${employee.lastName || ''} (${employee.employeeId})`}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className='input-row'>
                    <div>
                        <span className="required-marker">*</span>
                        <label htmlFor='department'>Department</label>
                        {viewMode ? (
                            <input
                                type='text'
                                value={formData.basicInfo.department}
                                readOnly={viewMode}
                                className='selectIM'
                            />
                        ) : (
                            <select
                                name='department'
                                id='department'
                                value={formData.basicInfo.department}
                                className='selectIM'
                                onChange={(e) => {
                                    const selectedDepartment = dropdownData?.department?.find(
                                        r => r.data === e.target.value
                                    );
                                    setFormData(prev => ({
                                        ...prev,
                                        basicInfo: {
                                            ...prev.basicInfo,
                                            department: e.target.value,
                                            deptId: selectedDepartment ? selectedDepartment.masterId : ''
                                        }
                                    }));
                                }}
                                required
                            >
                                <option value="">Select Department</option>
                                {dropdownData?.department?.map(option => (
                                    <option key={option.masterId} value={option.data}>
                                        {option.data}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <span className="required-marker">*</span>
                        <label htmlFor='lastWorkingDate'>Last Working Date</label>
                        <input
                            type='date'
                            className="selectIM"
                            id="lastWorkingDate"
                            name="lastDate"
                            value={formData.basicInfo.lastDate}
                            onChange={(event) => handleDateChange(event, 'lastDate')}
                            readOnly={viewMode}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div>
                    <span className="required-marker">*</span>
                        <label htmlFor='reason'>Reason for leaving:</label>
                        {viewMode ? (
                            <input
                                type='text'
                                value={formData.basicInfo.reason}
                                readOnly={viewMode}
                                className='selectIM'
                            />
                        ) : (
                            <div> 
                                <select
                                    name='reason'
                                    id='reason'
                                    value={formData.basicInfo.reason}
                                    className='selectIM'
                                    onChange={(e) => {
                                        const selectedReason = dropdownData?.reason?.find(
                                            r => r.data === e.target.value
                                        );
                                        setShowOtherReason(e.target.value === "other");
                                        setFormData(prev => ({
                                            ...prev,
                                            basicInfo: {
                                                ...prev.basicInfo,
                                                reason: e.target.value,
                                                reasonId: selectedReason ? selectedReason.masterId : '',
                                                customReason: e.target.value === "other" ? prev.basicInfo.customReason : ""
                                            }
                                        }));
                                    }}
                                    required
                                >
                                    <option value="">Select Reason</option>
                                    {dropdownData?.reason?.map(option => (
                                        <option key={option.masterId} value={option.data}>
                                            {option.data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {formData.basicInfo.reason === "other" && (
                    <div>
                        <label htmlFor="customReason">Please specify reason for leaving:</label>
                        <textarea
                            id="customReason"
                            name="customReason"
                            className="off-form-input off-form-textarea"
                            value={formData.basicInfo.customReason || ""}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    basicInfo: {
                                        ...prev.basicInfo,
                                        customReason: e.target.value
                                    }
                                }));
                            }}
                            required={formData.basicInfo.reason === "other"}
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="other">Other:</label>
                    <textarea
                        id="other"
                        name="other"
                        className="off-form-input off-form-textarea"
                        value={formData.basicInfo.other}
                        onChange={handleBasicInfoChange}
                        readOnly={viewMode}
                    />
                </div>

                <div className="form-controls">
                    <button type="button" className="btn" onClick={handleNextStep}>
                        {isAssigning ? (
                            <>
                                <div className="loading-spinner"></div>
                                Saving...
                            </>
                        ) : (
                            'Next'
                        )}
                    </button>
                    <button type="button" className="outline-btn" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoStep;