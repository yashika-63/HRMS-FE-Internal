import React, { useState, useEffect } from 'react';
import { fetchDataByKey } from '../../../Api.jsx';
import axios from 'axios';
import { strings } from '../../../string';
import { showToast } from '../../../Api.jsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
<<<<<<< HEAD
 
const ResignationForm = ({ hrDetails }) => {
 
    const companyId = localStorage.getItem("companyId");
    const employeeId = localStorage.getItem("employeeId");
    const employeeFirstName = localStorage.getItem("firstName");
 
    const currentDate = new Date().toISOString().split('T')[0];
 
=======

const ResignationForm = ({ hrDetails }) => {

    const companyId = localStorage.getItem("companyId");
    const employeeId = localStorage.getItem("employeeId");
    const employeeFirstName = localStorage.getItem("firstName");

    const currentDate = new Date().toISOString().split('T')[0];

>>>>>>> 8a5f66f (merging code)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dropdownDepartment, setDropdownDepartment] = useState({ department: [] });
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [isSending, setIsSending] = useState(false);
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
    const [selectedHR, setSelectedHR] = useState({
        id: hrDetails?.id || '',
        employeeId: hrDetails?.employeeId || '',
        employeeFirstName: hrDetails?.firstName || '',
        employeeLastName: hrDetails?.lastName || '',
    });
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
    const [selectedManager, setSelectedManager] = useState({
        id: '',
        employeeId: '',
        employeeFirstName: '',
        employeeLastName: '',
    });
<<<<<<< HEAD
 
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsManager, setSearchResultsManager] = useState([]);
 
=======

    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsManager, setSearchResultsManager] = useState([]);

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
    const handleEmployeeSearch = async (searchTerm, setResults) => {
        if (searchTerm.trim() === '') {
            setResults([]);
            return;
        }
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
    const handleHRNameChange = (event) => {
        const { value } = event.target;
        setSelectedHR(prev => ({ ...prev, employeeFirstName: value }));
        handleEmployeeSearch(value, setSearchResults);
    };
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
    const handleManagerNameChange = (event) => {
        const { value } = event.target;
        setSelectedManager(prev => ({ ...prev, employeeFirstName: value }));
        handleEmployeeSearch(value, setSearchResultsManager);
    };
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
    const handleSelectEmployee = (employee, setEmployee, setResults) => {
        setEmployee({
            id: employee.id,
            employeeId: employee.employeeId,
            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName || '',
        });
        setResults([]);
    };
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("handleSubmit called");
 
=======

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("handleSubmit called");

>>>>>>> 8a5f66f (merging code)
        if (!selectedHR?.id || !selectedManager?.id) {
            setError('Please select both an HR representative and a manager');
            return;
        }
        setShowConfirmPopup(true);
    };
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
    const handleSend = async () => {
        setIsSending(true);
        setError(null);
        setSuccess(null);
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/offboarding/save/${companyId}/${employeeId}/${selectedManager.id}/${selectedHR.id}`,
                formData
            );
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
    const handleCancelSend = () => {
        setShowConfirmPopup(false);
    };
 
    const renderSearchResults = (results, handleSelect) => {
        if (results.length === 0) return null;
 
=======

    const handleCancelSend = () => {
        setShowConfirmPopup(false);
    };

    const renderSearchResults = (results, handleSelect) => {
        if (results.length === 0) return null;

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
    return (
        <div className="box-container personal-info-box">
            <h2 className="underlineText">Resignation Form</h2>
 
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}
 
            <div className="resignation-form">
                <div className="form-section">
 
=======

    return (
        <div className="box-container personal-info-box">
            <h2 className="underlineText">Resignation Form</h2>

            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="resignation-form">
                <div className="form-section">

>>>>>>> 8a5f66f (merging code)
                    <div className="input-row">
                        <div>
                            <label>Application Date:</label>
                            <input type="text" value={formData.date} readOnly className="uneditable-field" />
                        </div>
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
                <div className="input-row">
                    <div>
                        <label htmlFor='hrName'>HR Representative:</label>
                        <input
                            type="text"
                            name='hrName'
                            id='hrName'
<<<<<<< HEAD
=======
                            className="selectIM"
>>>>>>> 8a5f66f (merging code)
                            value={selectedHR.employeeFirstName}
                            onChange={handleHRNameChange}
                            required
                        />
                        {renderSearchResults(searchResults, (employee) =>
                            handleSelectEmployee(employee, setSelectedHR, setSearchResults))
                        }
                    </div>
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
                    <div>
                        <label htmlFor='reportingManagerName'>Reporting Manager:</label>
                        <input
                            type="text"
                            name='reportingManagerName'
                            id='reportingManagerName'
<<<<<<< HEAD
=======
                            className="selectIM"
>>>>>>> 8a5f66f (merging code)
                            value={selectedManager.employeeFirstName}
                            onChange={handleManagerNameChange}
                        />
                        {renderSearchResults(searchResultsManager, (employee) =>
                            handleSelectEmployee(employee, setSelectedManager, setSearchResultsManager)
                        )}
                    </div>
<<<<<<< HEAD
 
                    <div className="form-group">
                        <label htmlFor="department">Department:</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleDepartmentChange}
                            className="selectIM"
=======

                    <div>
                        <label htmlFor="department">Department:</label>
                        <select
                            name="department"
                            className="selectIM"
                            value={formData.department}
                            onChange={handleDepartmentChange}
>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
                    <div>
                        <label htmlFor="reason">Reason for Resignation:</label>
                        <select
                            name="reason"
                            id="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
<<<<<<< HEAD
=======

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
 
=======

>>>>>>> 8a5f66f (merging code)
export default ResignationForm;