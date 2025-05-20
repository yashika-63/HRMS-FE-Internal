import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { strings } from '../../string';
import { fetchDataByKey  , showToast } from '../../Api.jsx';

const UpdateWorkflow = ({ workflowMain, onClose, visible }) => {

    const [workflowState, setWorkflowState] = useState({
        thisWorkflowId: '',
        workflowName: '',
        workflowActivityStatus: true,
        workflowDetails: [],
    });
    const [workflowDetail, setWorkflowDetail] = useState({
        workflowFromDivision: '',
        workflowToDivision: '',
        workflowFromDepartment: '',
        workflowToDepartment: '',
        workflowPreviousRole: '',
        workflowNextRole: '',
    });
    const [dropdownData, setDropdownData] = useState({
        role: [],
        department: [],
        division: [],
        designation: []
    });
    const [detailAdded, setDetailAdded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [details, setDetails] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const companyId = localStorage.getItem("companyId");
    const accountId = localStorage.getItem("accountId");


    useEffect(() => {
        if (visible && workflowMain && workflowMain.id) {
            setWorkflowState(workflowMain); // Sync the state with the prop
        }
    }, [visible, workflowMain]);


    useEffect(() => {
        const fetchDetails = async () => {
            if (visible && workflowState.id) {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://${strings.localhost}/api/workflow/getWorkflowById/${workflowState.id}`);
                    setDetails(response.data);
                } catch (err) {
                    console.error('Error fetching workflow details:', err);
                    setError('Failed to fetch workflow details.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDetails();
    }, [visible, workflowState]);

    const fetchWorkflows = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/workflow/${companyId}`);
            if (response.data && Array.isArray(response.data)) {
                setWorkflows(response.data);
            }
        } catch (error) {
            console.error('Error fetching workflows:', error);
        }
    };

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const division = await fetchDataByKey('division');
                const designation = await fetchDataByKey('designation');
                const department = await fetchDataByKey('department');

                setDropdownData({
                    division: division,
                    designation: designation,
                    department: department
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };

        fetchDropdownData();
        fetchWorkflows();

    }, []);


    const handleMainChange = (e) => {
        const { name, value } = e.target;
        setWorkflowState({ ...workflowState, [name]: value });
    };


    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setWorkflowDetail({ ...workflowDetail, [name]: value });
    };


    const addDetail = () => {
        if (!workflowDetail.workflowFromDivision || !workflowDetail.workflowToDivision) {
            showToast('Please fill in all the required fields.','warn');
            return;
        }
        setWorkflowState(prevState => ({
            ...prevState,
            workflowDetails: [...prevState.workflowDetails, workflowDetail]
        }));
        setDetailAdded(true);
        resetWorkflowDetail();
    };


    const resetWorkflowDetail = () => {
        setWorkflowDetail({
            workflowFromDivision: '',
            workflowToDivision: '',
            workflowFromDepartment: '',
            workflowToDepartment: '',
            workflowPreviousRole: '',
            workflowNextRole: '',
        });
    };


    const removeDetail = (index) => {
        const newDetails = workflowState.workflowDetails.filter((_, i) => i !== index);
        setWorkflowState({ ...workflowState, workflowDetails: newDetails });
        setDetailAdded(newDetails.length > 0);
    };


    const handleSubmit = async () => {
        if (workflowState.workflowDetails.length === 0) {
            showToast('Please add at least one detail before submitting.','warn');
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `http://${strings.localhost}/api/workflow/update/${workflowState.id}`,
                {
                    ...workflowState,
                    thisWorkflowId: parseInt(workflowState.thisWorkflowId),
                    companyId: parseInt(companyId),
                    accountId: parseInt(accountId)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setWorkflows([...workflows, response.data]);
            resetWorkflowMain();
            showToast("Workflow Updated Successfully.",'success');
            window.location.reload();
        } catch (error) {
            console.error('There was an error submitting the data!', error);
        }
    };

    const resetWorkflowMain = () => {
        setWorkflowState({
            thisWorkflowId: '',
            workflowName: '',
            workflowActivityStatus: true,
            workflowDetails: []
        });
        setDetailAdded(false);
    };

    return (
        <div>
            <div className="workflowmodal">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className='title'>Update Workflow</h2>
                    </div>
                    <div className="modal-body">
                        <div className='input-row1'>

                            <div>
                                <input type="text" placeholder="Workflow Name" name="workflowName" value={workflowState.workflowName} onChange={handleMainChange} className="input-field" />
                            </div>
                            <div>
                                <label className='checkbox-label'>Workflow Active Status:</label>
                                <input type="checkbox" name="workflowActivityStatus"  className='round-checkbox active'
                                    checked={workflowState.workflowActivityStatus}
                                    onChange={(e) => setWorkflowState({ ...workflowState, workflowActivityStatus: e.target.checked })} />
                            </div>
                        </div>

                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>From Division</th>
                                    <th>To Division</th>
                                    <th>From Department</th>
                                    <th>To Department</th>
                                    <th>Previous Role</th>
                                    <th>Next Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workflowState.workflowDetails.map((detail, index) => (
                                    <tr key={index}>
                                        <td>{detail.workflowFromDivision}</td>
                                        <td>{detail.workflowToDivision}</td>
                                        <td>{detail.workflowFromDepartment}</td>
                                        <td>{detail.workflowToDepartment}</td>
                                        <td>{detail.workflowPreviousRole}</td>
                                        <td>{detail.workflowNextRole}</td>
                                        <td>
                                            <button type='button' onClick={() => removeDetail(index)}>
                                                <FontAwesomeIcon className='ml-2' icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div>
                            <div className='input-row1'>
                                <div>
                                    <select
                                        name="workflowFromDivision"
                                        value={workflowDetail.workflowFromDivision}
                                        onChange={handleDetailChange}
                                        required
                                    >
                                        <option value="" disabled hidden>From Division</option>
                                        {dropdownData.division.map(option => (
                                            <option key={option.masterId} value={option.data}>{option.data}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <select
                                        name="workflowToDivision"
                                        value={workflowDetail.workflowToDivision}
                                        onChange={handleDetailChange}
                                        required
                                    >
                                        <option value="" disabled hidden>To Division</option>
                                        {dropdownData.division.map(option => (
                                            <option key={option.masterId} value={option.data}>{option.data}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className='input-row1'>
                                <div>
                                    <select
                                        name="workflowFromDepartment"
                                        value={workflowDetail.workflowFromDepartment}
                                        onChange={handleDetailChange}
                                        required
                                    >
                                        <option value="" disabled hidden>From Department</option>
                                        {dropdownData.department.map(option => (
                                            <option key={option.masterId} value={option.data}>{option.data}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <select
                                        name="workflowToDepartment"
                                        value={workflowDetail.workflowToDepartment}
                                        onChange={handleDetailChange}
                                        required
                                    >
                                        <option value="" disabled hidden>To Department</option>
                                        {dropdownData.department.map(option => (
                                            <option key={option.masterId} value={option.data}>{option.data}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className='input-row1'>
                                <div>
                                    <select
                                        name="workflowPreviousRole"
                                        value={workflowDetail.workflowPreviousRole}
                                        onChange={handleDetailChange}
                                        required
                                    >
                                        <option value="" disabled hidden>Previous Role</option>
                                        {dropdownData.designation.map(option => (
                                            <option key={option.masterId} value={option.data}>{option.data}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <select
                                        name="workflowNextRole"
                                        value={workflowDetail.workflowNextRole}
                                        onChange={handleDetailChange}
                                        required
                                    >
                                        <option value="" disabled hidden>Next Role</option>
                                        {dropdownData.designation.map(option => (
                                            <option key={option.masterId} value={option.data}>{option.data}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button className="btn" onClick={addDetail}>
                                <FontAwesomeIcon icon={faPlusCircle} /> Add Detail
                            </button>
                        </div>
                        <div className='form-controls'>
                            <button className="btn" onClick={handleSubmit} > Update</button>
                            <button className="outline-btn" onClick={onClose}  >  Cancel </button>
                        </div>
                        {loading && <p>Loading...</p>}
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </div>
            </div>
        
        </div>
    );
};

export default UpdateWorkflow;
