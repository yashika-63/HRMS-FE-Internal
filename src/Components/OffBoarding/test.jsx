import React, { useState, useEffect } from 'react';
import { fetchDataByKey } from '../../Api.jsx';
import axios from 'axios';
import { strings } from '../../string';

const ResignationForm = ({ 
    isOpen, 
    onClose, 
    companyId, 
    employeeId, 
    employeeFirstName,
    hrDetails 
}) => {
    const currentDate = new Date().toISOString().split('T')[0];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dropdownDepartment, setDropdownDepartment] = useState({ department: [] });

    const [selectedHR, setSelectedHR] = useState({
        id: '',
        employeeId: '',
        employeeFirstName: '',
        employeeLastName: '',
    });

    const [selectedManager, setSelectedManager] = useState({
        id: '',
        employeeId: '',
        employeeFirstName: '',
        employeeLastName: '',
    });

    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsManager, setSearchResultsManager] = useState([]);

    const [formData, setFormData] = useState({
        applied: true,
        completionStatus: false,
        date: currentDate,
        department: '',
        deptId: '',
        lastWorkingDate: '',
        name: employeeFirstName,
        other: '',
        reason: '',
        status: false,
        companyId: companyId,
        employeeId: selectedHR?.id || '',
        hrId: hrDetails?.id || employeeId,
        hrName: hrDetails?.name || '',
        reportingManagerId: selectedManager?.id || '',
        reportingManagerName: selectedManager?.name || ''
    });

    useEffect(() => {
        const fetchDropdownDepartment = async () => {
            try {
                setIsLoading(true);
                const departments = await fetchDataByKey('department');
                setDropdownDepartment({ department: departments });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDropdownDepartment();
    }, []);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            employeeId: selectedHR?.id || '',
            reportingManagerId: selectedManager?.id || '',
            reportingManagerName: selectedManager?.employeeFirstName 
                ? `${selectedManager.employeeFirstName} ${selectedManager.employeeLastName || ''}`
                : '',
            hrId: hrDetails?.id || employeeId,
            hrName: hrDetails?.name || ''
        }));
    }, [selectedHR, selectedManager, employeeId, hrDetails]);

    const handleEmployeeSearch = async (searchTerm, setResults) => {
        if (searchTerm.trim() === '') {
            setResults([]);
            return;
        }

        try {
            const response = await axios.get(
                `http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${searchTerm.trim()}`
            );
            setResults(response.data);
            setError(null);
        } catch (error) {
            console.error('Error searching employees:', error);
            setError('Error searching employees');
            setResults([]);
        }
    };

    const handleHRNameChange = (event) => {
        const { value } = event.target;
        setSelectedHR(prev => ({ ...prev, employeeFirstName: value }));
        handleEmployeeSearch(value, setSearchResults);
    };

    const handleManagerNameChange = (event) => {
        const { value } = event.target;
        setSelectedManager(prev => ({ ...prev, employeeFirstName: value }));
        handleEmployeeSearch(value, setSearchResultsManager);
    };

    const handleSelectEmployee = (employee, setEmployee, setResults) => {
        setEmployee({
            id: employee.id,
            employeeId: employee.employeeId,
            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName || '',
        });
        setResults([]);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDepartmentChange = (e) => {
        const selectedDepartment = dropdownDepartment.department.find(
            r => r.data === e.target.value
        );
        setFormData(prev => ({
            ...prev,
            department: e.target.value,
            deptId: selectedDepartment ? selectedDepartment.masterId : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!selectedHR?.id || !selectedManager?.id) {
            setError('Please select both an employee and a manager');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/offboarding/save/${companyId}/${employeeId}/${selectedManager.id}/${selectedHR.id}`,
                formData
            );

            if (response.status === 200 || response.status === 201) {
                alert('Resignation submitted successfully!');
                onClose();
            } else {
                throw new Error('Failed to submit resignation');
            }
        } catch (error) {
            console.error('Error submitting resignation:', error);
            setError('Error submitting resignation. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSearchResults = (results, handleSelect) => {
        if (results.length === 0) return null;
        
        return (
            <ul className="dropdown2">
                {results.map((employee) => (
                    <li
                        key={employee.id}
                        onClick={() => handleSelect(employee)}
                        style={{ cursor: 'pointer' }}
                    >
                        {`${employee.firstName} ${employee.lastName} (${employee.employeeId})`}
                    </li>
                ))}
            </ul>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <div className='form-title'>Resignation Form</div>
                    <button className="button-close" onClick={onClose}>×</button>
                </div>

                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className='input-row'>
                        <div>
                            <label>Application Date:</label>
                            <input
                                type="text"
                                value={formData.date}
                                readOnly
                                className="uneditable-field"
                            />
                        </div>

                        <div>
                            <label>Employee ID:</label>
                            <input
                                type="text"
                                name='hrId'
                                value={formData.hrId}
                                onChange={handleInputChange}
                                readOnly
                            />
                        </div>

                        <div>
                            <label>Employee Name:</label>
                            <input
                                type="text"
                                value={formData.name}
                                readOnly
                                className="uneditable-field"
                            />
                        </div>
                    </div>

                    <div className='input-row'>
                        <div>
                            <label htmlFor='hrName'>HR Name:</label>
                            <input
                                type="text"
                                name='hrName'
                                id='hrName'
                                value={selectedHR.employeeFirstName}
                                onChange={handleHRNameChange}
                            />
                            {renderSearchResults(searchResults, (employee) => 
                                handleSelectEmployee(employee, setSelectedHR, setSearchResults)
                            )}
                        </div>

                        <div>
                            <label htmlFor='reportingManagerName'>Reporting Manager Name:</label>
                            <input
                                type="text"
                                name='reportingManagerName'
                                id='reportingManagerName'
                                value={selectedManager.employeeFirstName}
                                onChange={handleManagerNameChange}
                            />
                            {renderSearchResults(searchResultsManager, (employee) => 
                                handleSelectEmployee(employee, setSelectedManager, setSearchResultsManager)
                            )}
                        </div>

                        <div>
                            <label htmlFor="department">Department:</label>
                            <select
                                name="department"
                                value={formData.department}
                                className="selectIM"
                                onChange={handleDepartmentChange}
                                required
                                disabled={isLoading}
                            >
                                <option value="">Select Department</option>
                                {dropdownDepartment.department?.length > 0 ? (
                                    dropdownDepartment.department.map(option => (
                                        <option key={option.masterId} value={option.data}>
                                            {option.data}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Department Not available</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className='input-row'>
                        <div>
                            <label>
                                Last Working Date:
                                <input
                                    type="date"
                                    name="lastWorkingDate"
                                    value={formData.lastWorkingDate}
                                    onChange={handleInputChange}
                                    className='selectIM'
                                    required
                                />
                            </label>
                        </div>

                        <div>
                            <label>
                                Reason:
                                <select
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a reason</option>
                                    <option value="Personal">Personal</option>
                                    <option value="Career Growth">Career Growth</option>
                                    <option value="Better Opportunity">Better Opportunity</option>
                                    <option value="Health">Health</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label>
                            Other:
                            <textarea
                                name="other"
                                value={formData.other}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-controls">
                        <button
                            type="button"
                            className='outline-btn'
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className='btn'
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResignationForm;