import React, { useState, useEffect } from 'react';
import { fetchDataByKey } from '../../../Api.jsx';
import axios from 'axios';
import { strings } from '../../../string';
import { showToast } from '../../../Api.jsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 
const ResignationForm = ({ hrDetails }) => {
 
    const companyId = localStorage.getItem("companyId");
    const employeeId = localStorage.getItem("employeeId");
    const employeeFirstName = localStorage.getItem("firstName");
 
    const currentDate = new Date().toISOString().split('T')[0];
 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dropdownDepartment, setDropdownDepartment] = useState({ department: [] });
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [isSending, setIsSending] = useState(false);
 
    const [selectedHR, setSelectedHR] = useState({
        id: hrDetails?.id || '',
        employeeId: hrDetails?.employeeId || '',
        employeeFirstName: hrDetails?.firstName || '',
        employeeLastName: hrDetails?.lastName || '',
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
        status: true,
        companyId: companyId,
        employeeId: selectedHR?.id || '',
        hrId: hrDetails?.id || employeeId,
        hrName: hrDetails?.firstName ? `${hrDetails.firstName} ${hrDetails.lastName || ''}` : '',
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
            hrName: hrDetails?.firstName ? `${hrDetails.firstName} ${hrDetails.lastName || ''}` : ''
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
 
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("handleSubmit called");
 
        if (!selectedHR?.id || !selectedManager?.id) {
            setError('Please select both an HR representative and a manager');
            return;
        }
        setShowConfirmPopup(true);
    };
 
    const handleSend = async () => {
        setIsSending(true);
        setError(null);
        setSuccess(null);
 
        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/offboarding/save/${companyId}/${employeeId}/${selectedManager.id}/${selectedHR.id}`,
                formData
            );
 
            if (response.status === 200 || response.status === 201) {
                setSuccess('Resignation submitted successfully!');
                setFormData(prev => ({
                    ...prev,
                    department: '',
                    lastWorkingDate: '',
                    reason: '',
                    other: ''
                }));
                setSelectedManager({
                    id: '',
                    employeeId: '',
                    employeeFirstName: '',
                    employeeLastName: '',
                });
                setShowConfirmPopup(false);
            } else {
                throw new Error('Failed to submit resignation');
            }
        } catch (error) {
            console.error('Error submitting resignation:', error);
            if (error.response && error.response.data?.details === "Employee Has Applied") {
                toast.error("Employee has already resigned");
            } else {
                setError('Error submitting resignation. Please try again.');
            }
        } finally {
            setIsSending(false);
        }
    };
 
    const handleCancelSend = () => {
        setShowConfirmPopup(false);
    };
 
    const renderSearchResults = (results, handleSelect) => {
        if (results.length === 0) return null;
 
        return (
            <ul className="dropdown2">
                {results.map((employee) => (
                    <li
                        key={employee.id}
                        onClick={() => handleSelect(employee)}
                    >
                        {`${employee.firstName} ${employee.lastName || ''} (${employee.employeeId})`}
                    </li>
                ))}
            </ul>
        );
    };
 
    return (
        <div className="box-container personal-info-box">
            <h2 className="underlineText">Resignation Form</h2>
 
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}
 
            <div className="resignation-form">
                <div className="form-section">
 
                    <div className="input-row">
                        <div>
                            <label>Application Date:</label>
                            <input type="text" value={formData.date} readOnly className="uneditable-field" />
                        </div>
 
                        <div>
                            <label>Employee ID:</label>
                            <input
                                type="text"
                                name='hrId'
                                value={formData.hrId}
                                readOnly
                                onChange={handleInputChange}
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
                </div>
 
                <div className="input-row">
                    <div>
                        <label htmlFor='hrName'>HR Representative:</label>
                        <input
                            type="text"
                            name='hrName'
                            id='hrName'
                            value={selectedHR.employeeFirstName}
                            onChange={handleHRNameChange}
                            required
                        />
                        {renderSearchResults(searchResults, (employee) =>
                            handleSelectEmployee(employee, setSelectedHR, setSearchResults))
                        }
                    </div>
 
                    <div>
                        <label htmlFor='reportingManagerName'>Reporting Manager:</label>
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
 
                    <div className="form-group">
                        <label htmlFor="department">Department:</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleDepartmentChange}
                            className="selectIM"
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
                                <option value="" disabled>Loading departments...</option>
                            )}
                        </select>
                    </div>
                </div>
 
                <div className="input-row">
                    <div>
                        <label htmlFor="lastWorkingDate">Last Working Date:</label>
                        <input
                            type="date"
                            name="lastWorkingDate"
                            id="lastWorkingDate"
                            value={formData.lastWorkingDate}
                            onChange={handleInputChange}
                            className="selectIM"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
 
                    <div>
                        <label htmlFor="reason">Reason for Resignation:</label>
                        <select
                            name="reason"
                            id="reason"
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
                    </div>
                </div>
                <div>
                    <label htmlFor="other">Additional Details (if any):</label>
                    <textarea
                        name="other"
                        id="other"
                        value={formData.other}
                        onChange={handleInputChange}
                        className="form-control"
                        rows="3"
                        placeholder="Please provide additional details if you selected 'Other' as reason"
                    />
                </div>
 
                <div className="btnContainer">
                    <button type="button" className="btn" onClick={(e) => {
                        console.log("Button clicked");
                        handleSubmit(e);
                    }}>
                        Submit Resignation
                    </button>
                </div>
            </div>
            {showConfirmPopup && (
                <div className="confirm-popup">
                    <div className="popup-content">
                        <h3>Do you really want to send this to the employee?</h3>
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
    );
};
 
export default ResignationForm;