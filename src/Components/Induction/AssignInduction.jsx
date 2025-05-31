import React, { useState, useEffect } from 'react';
import { strings } from '../../string';
import axios from 'axios';
import { showToast } from '../../Api.jsx';

const AssignInduction = ({ induction, onClose }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [error, setError] = useState();
    const [searchResults, setSearchResults] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const companyId = localStorage.getItem("companyId");
    const [selectedEmployee, setSelectedEmployee] = useState({
        id: '',
        employeeId: '',
        inductionId: '',
        description: '',
        employeeFirstName: '',
        employeeLastName: '',
        heading: '',
        expiryDate: ""
    });

    const handleSelectEmployee = (employee) => {
        setSelectedEmployee({
            id: employee.id,
            employeeId: employee.employeeId,
            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName || '',
            inductionId: selectedEmployee.inductionId
        });
        setSearchResults([]);
    };

    useEffect(() => {
        if (induction) {
            setSelectedEmployee(prev => ({
                ...prev,
                inductionId: induction.id,
                heading: induction.heading
            }));
        }
    }, [induction]);

    const handleEmployeeSelect = async (event) => {
        const { value } = event.target;
        setSelectedEmployee(prev => ({
            ...prev,
            employeeId: value

        }));

        if (value.trim() !== '') {
            try {
                const response = await axios.get(
                    `http://localhost/employees/EmployeeById/${value}?companyId=${companyId}`
                );
                const employee = response.data;
                setSelectedEmployee(prev => ({
                    ...prev,
                    id: employee.id,
                    employeeFirstName: employee.firstName,
                    employeeLastName: employee.lastName || ''
                }));
                setError(null);
            } catch (error) {
                console.error('Error fetching employee:', error);
                setError('Employee not found');
                setSelectedEmployee(prev => ({
                    ...prev,
                    id: '',
                    employeeFirstName: '',
                    employeeLastName: ''
                }));
            }
        } else {
            setSelectedEmployee(prev => ({
                ...prev,
                id: '',
                employeeFirstName: '',
                employeeLastName: ''
            }));
            setError(null);
        }
    };
    const handleEmployeeNameChange = async (event) => {
        const { value } = event.target;
        setSelectedEmployee(prev => ({
            ...prev,
            employeeFirstName: value
        }));

        if (value.trim() !== '') {
            try {
                const response = await axios.get(
                    `http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${value.trim()}`
                );
                setSearchResults(response.data);
                setError(null);
            } catch (error) {
                console.error('Error searching employees:', error);
                setError('Error searching employees');
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
            setError(null);
        }
    };


    const handleAssignInduction = async () => {
        if (!selectedEmployee.employeeId || !selectedEmployee.expiryDate) {
            showToast('Please select both Employee and Expiry Date');
            return;
        }
        setIsAssigning(true);
        try {
            const currentDate = new Date().toISOString().split('T')[0];

            const expiryDate = new Date(selectedEmployee.expiryDate).toISOString().split('T')[0];

            await axios.post(
                `http://${strings.localhost}/api/assign-inductions/save?employeeId=${selectedEmployee.id}&inductionId=${selectedEmployee.inductionId}&assignedById=${selectedEmployee.id}&compID=${companyId}`,
                [{
                    assignedTo: selectedEmployee.id,
                    inductionId: selectedEmployee.inductionId,
                    assignedBy: employeeId,
                    companyId: companyId,
                    assignDate: currentDate,
                    expiryDate: expiryDate,
                    status: true,
                    expiryStatus: false,
                    completionStatus: false
                }]
            );
            showToast('Induction assigned successfully');
            setTimeout(() => {
                handleClosePopup();
            }, 2000)

        } catch (error) {
            console.error('Error assigning induction:', error);
            showToast('Failed to assign induction');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleExpiryDateChange = (e) => {
        const { value } = e.target;
        setSelectedEmployee(prev => ({
            ...prev,
            expiryDate: value
        }));
    };


    const handleClosePopup = () => {
        onClose();
    };
    return (
        <div className='add-popup'>
            <div className='popup-content'>
                <div className='close-btn' onClick={handleClosePopup}>×</div>
                <h3 className='centerText'>Assign Induction</h3>
                <div>
                    <div className='input-row'>
                        <div>
                            <span className="required-marker">*</span>
                            <label htmlFor='employeeId'>Employee ID:</label>
                            <input
                                type='text'
                                name='employeeId'
                                id='employeeId'
                                value={selectedEmployee.employeeId}
                                onChange={handleEmployeeSelect}
                                className='readonly'
                                readOnly
                            />
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label htmlFor='empName'>Employee Name:</label>
                            <input
                                type='text'
                                name='empName'
                                id='empName'
                                value={`${selectedEmployee.employeeFirstName} ${selectedEmployee.employeeLastName}`}
                                onChange={handleEmployeeNameChange}
                                required
                            />
                            {error && <div className="error-message">{error}</div>}
                            {searchResults.length > 0 && (
                                <ul className="dropdown2">
                                    {searchResults.map((employee) => (
                                        <li
                                            key={employee.id}
                                            onClick={() => handleSelectEmployee(employee)}
                                        >
                                            {`${employee.firstName} ${employee.lastName} (${employee.employeeId})`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className='input-row'>
                        {/* <div>
                            <span className="required-marker">*</span>
                            <label htmlFor="inductionId">Induction ID:</label>
                            <input type='text' className='readonly' id='inductionId' name='inductionId' value={selectedEmployee.inductionId} readOnly />
                        </div> */}
                        <div>
                            <span className="required-marker">*</span>
                            <label htmlFor="heading">Induction Name:</label>
                            <input type='text' className='readonly' id='heading' name="heading" value={selectedEmployee.heading} readOnly />
                        </div>

                        <div>
                            <span className="required-marker">*</span>
                            <label htmlFor="expiryDate">Expiry Date:</label>
                            <input
                                type='date'
                                id='expiryDate'
                                className='selectIM'
                                name='expiryDate'
                                value={selectedEmployee.expiryDate}
                                onChange={(e) => setSelectedEmployee(prev => ({
                                    ...prev,
                                    expiryDate: e.target.value
                                }))}
                                min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                                required
                                placeholder="dd-mm-yyyy"
                            />
                        </div>

                    </div>
                </div>
                <div className='btnContainer'>
                    <button
                        type='button'
                        className='btn'
                        onClick={handleAssignInduction}
                        disabled={!selectedEmployee.employeeId || !selectedEmployee.expiryDate}
                    >
                        {isAssigning ? (
                            <>
                                <div className="loading-spinner"></div>
                                Assigning...
                            </>
                        ) : (
                            'Assign'
                        )}
                    </button>
                    <button
                        type='button'
                        className='outline-btn'
                        onClick={handleClosePopup}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignInduction;
