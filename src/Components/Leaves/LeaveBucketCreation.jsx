import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchDataByKey, showToast } from '../../Api.jsx';
import { strings } from '../../string.jsx';

const LeaveBucketCreation = () => {
    const [employeeConfig, setEmployeeConfig] = useState({});
    const [leaveBuckets, setLeaveBuckets] = useState([]);
    const [leaveBalance, setLeaveBalance] = useState({ additionalLeaveData: [] });
    const [dropdownData, setDropdownData] = useState({ employeeType: [] });
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formEntries, setFormEntries] = useState([]);
    const [currentForm, setCurrentForm] = useState({ employeeType: '', casualLeave: '', sickLeave: '', paid: '', unPaid: '', probrationAllowedHolidays: '' });
    const employeeId = localStorage.getItem("employeeId");
    const companyId = localStorage.getItem("companyId");
    const token = localStorage.getItem("token");
    useEffect(() => {
        if (employeeId && token && companyId) {
            fetchAllLeaveData();
        }
    }, [employeeId, token, companyId]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const employeeType = await fetchDataByKey('employeeType');
                setDropdownData({ employeeType });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);

    const fetchAllLeaveData = async () => {
        try {
            const configRes = await axios.get(`http://${strings.localhost}/api/employee-config/employee/${employeeId}`);
            const config = configRes.data[0];
            setEmployeeConfig(config);
            fetchLeaveBuckets(config);
        } catch (err) {
            console.error('Error fetching employee config:', err);
        }
    };

    const fetchLeaveBuckets = async (config) => {
        try {
            const fullData = config.confirmationStatus ? 1 : 0;
            const bucketsRes = await axios.get(`http://${strings.localhost}/api/leave-buckets/active/${companyId}`);
            setLeaveBuckets(bucketsRes.data);
            setLeaveBalance(prev => ({
                ...prev,
                additionalLeaveData: bucketsRes.data
            }));
        } catch (err) {
            console.error('Error fetching leave buckets:', err);
        }
    };

    const validateInput = (value) => {
        const regex = /^[0-9]*$/;
        return regex.test(value);
    };

    const handleInputChange = (field, value) => {
        if (validateInput(value) || value === '') {
            setCurrentForm(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleAddEntry = () => {
        if (!currentForm.employeeType) return;

        setFormEntries(prev => [...prev, { ...currentForm, status: true }]);
        setSelectedTypes(prev => [...prev, currentForm.employeeType]);
        setCurrentForm({ employeeType: '', casualLeave: '', sickLeave: '', paid: '', unPaid: '', probrationAllowedHolidays: '' });
    };

    const handleSave = async () => {
        try {
            const response = await axios.post(`http://${strings.localhost}/api/leave-buckets/save/${companyId}`, formEntries);
            showToast('Leave buckets saved successfully', 'success');
            setFormEntries([]);
            setSelectedTypes([]);
            setShowModal(false);
            fetchAllLeaveData(); // Refresh table
        } catch (error) {
            showToast('Failed to save leave buckets', 'error');
            console.error(error);
        }
    };

    const handleRemoveEntry = (index) => {
        const removedType = formEntries[index].employeeType;
        setFormEntries(prev => prev.filter((_, i) => i !== index));
        setSelectedTypes(prev => prev.filter(type => type !== removedType));
    };


    const availableTypes = dropdownData.employeeType.filter(type => !selectedTypes.includes(type));

    const isTrainee = currentForm.employeeType === 'Trainee/probation';

    return (
        <div className='coreContainer'>
            <div className='form-controls'>
                <button type='button' className='btn' onClick={() => setShowModal(true)}>Create</button>
            </div>

            {leaveBalance.additionalLeaveData?.length > 0 && (
                <table className='interview-table'>
                    <thead>
                        <tr>
                            <th>Employee Type</th>
                            <th>Probation Allowed Holidays</th>
                            <th>Casual Leave</th>
                            <th>Sick Leave</th>
                            <th>Paid Leave</th>
                            <th>Unpaid Leave</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveBalance.additionalLeaveData.map((item) => (
                            <tr key={item.id}>
                                <td>{item.employeeType || 'N/A'}</td>
                                <td>{item.probrationAllowedHolidays || 'N/A'}</td>
                                <td>{item.casualLeave || 'N/A'}</td>
                                <td>{item.sickLeave || 'N/A'}</td>
                                <td>{item.paid || 'N/A'}</td>
                                <td>{item.unPaid || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}


            {showModal && (
                <div className="modal-overlay">
                    <div className='modal-content'>
                        <button type='button' className='close-btn' onClick={() => setShowModal(false)}> X</button>
                        <h3 className='centerText'>Add Leaves</h3>
                        <div className='input-row'>
                            <div>
                                <label>Employee Type:</label>
                                <select className='selectIM' value={currentForm.employeeType} onChange={e => setCurrentForm({ ...currentForm, employeeType: e.target.value })}>
                                    <option value="">Select</option>
                                    {availableTypes.map(type => (
                                        <option key={type.masterId} value={type.data}>{type.data}</option>
                                    ))}
                                </select>
                            </div>

                            {isTrainee && (
                                <div>
                                    <label>Probation Allowed Holidays:</label>
                                    <input type="text" value={currentForm.probrationAllowedHolidays} onChange={e => handleInputChange('probrationAllowedHolidays', e.target.value)} />
                                </div>
                            )}

                            {!isTrainee && (
                                <>
                                    <div>
                                        <label>Casual Leave:</label>
                                        <input type="text" value={currentForm.casualLeave} onChange={e => handleInputChange('casualLeave', e.target.value)} disabled={!currentForm.employeeType} />
                                    </div>
                                    <div>
                                        <label>Sick Leave:</label>
                                        <input type="text" value={currentForm.sickLeave} onChange={e => handleInputChange('sickLeave', e.target.value)} disabled={!currentForm.employeeType} />
                                    </div>
                                    <div>
                                        <label>Paid Leave:</label>
                                        <input type="text" value={currentForm.paid} onChange={e => handleInputChange('paid', e.target.value)} disabled={!currentForm.employeeType} />
                                    </div>
                                    <div>
                                        <label>Unpaid Leave:</label>
                                        <input type="text" value={currentForm.unPaid} onChange={e => handleInputChange('unPaid', e.target.value)} disabled={!currentForm.employeeType} />
                                    </div>
                                </>
                            )}

                            <button disabled={!currentForm.employeeType} onClick={handleAddEntry}>Add</button>


                        </div>
                        {formEntries.length > 0 && (
                            <div>
                                <h4>Entries</h4>
                                <table className="interview-table">
                                    <thead>
                                        <tr>
                                            <th>Employee Type</th>
                                            <th>Probation Allowed Holidays</th>
                                            <th>Casual Leave</th>
                                            <th>Sick Leave</th>
                                            <th>Paid Leave</th>
                                            <th>Unpaid Leave</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formEntries.map((entry, idx) => (
                                            <tr key={idx}>
                                                <td>{entry.employeeType}</td>
                                                <td>{entry.probrationAllowedHolidays || 'N/A'}</td>
                                                <td>{entry.casualLeave || 'N/A'}</td>
                                                <td>{entry.sickLeave || 'N/A'}</td>
                                                <td>{entry.paid || 'N/A'}</td>
                                                <td>{entry.unPaid || 'N/A'}</td>
                                                <td>
                                                    <button onClick={() => handleRemoveEntry(idx)} style={{ color: 'red' }}>−</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className='form-controls'>
                                    <button type='button' className='btn' onClick={handleSave}>Save All</button>
                                </div>
                            </div>
                        )}

                        <button type='button' className='outline-btn' onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveBucketCreation;
