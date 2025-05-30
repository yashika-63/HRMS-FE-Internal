import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTrash, faEllipsisV, faEye, faEdit } from '@fortawesome/free-solid-svg-icons';
import './CreateWorkflow.css';
import { strings } from '../../string';
import ViewWorkflow from './ViewWorkflow';
import UpdateWorkflow from './UpdateWorkflow';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchDataByKey , showToast } from '../../Api.jsx';

const CreateWorkflow = () => {
    const companyId = localStorage.getItem("companyId");
    const accountId = localStorage.getItem("accountId");
    const [workflows, setWorkflows] = useState([]);
    const [workflowMain, setWorkflowMain] = useState({
        thisWorkflowId: '',
        workflowName: '',
        workflowActivityStatus: true, // Default to checked
        workflowDetails: [],
    });
    const [workflowDetail, setWorkflowDetail] = useState({
        workflowFromDivision: '',
        workflowToDivision: '',
        workflowFromDepartment: '',
        workflowToDepartment: '',
        workflowPreviousRole: '',
        workflowNextRole: '',
        workflowCurrentStatus: '',
        workflowPreviousStatus: '',
        workflowNextStatus: '',
    });
    const [open, setOpen] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [dropdownData, setDropdownData] = useState({
        role: [],
        department: [],
        division: [],
        designation: []
    });
    const [dropdownError, setDropdownError] = useState('');
    const [detailAdded, setDetailAdded] = useState(false); // Track if detail is added



    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/workflow/${companyId}`);
                if (response.data && Array.isArray(response.data)) {
                    setWorkflows(response.data);
                } else {
                    console.error('Invalid data structure or empty response for workflows');
                }
            } catch (error) {
                console.error('Error fetching workflows:', error);
            }
        };

        fetchWorkflows();
    }, [companyId]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const division = await fetchDataByKey('division');
                const designation = await fetchDataByKey('designation');
                const department = await fetchDataByKey('department');

                setDropdownData({
                    division: division,
                    designation: designation,
                    department: department,

                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);


    const handleMainChange = (e) => {
        const { name, value } = e.target;
        setWorkflowMain({ ...workflowMain, [name]: value });
    };

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setWorkflowDetail({ ...workflowDetail, [name]: value });
    };

    const addDetail = () => {
        if (!workflowDetail.workflowFromDivision || !workflowDetail.workflowToDivision || !workflowDetail.workflowFromDepartment || !workflowDetail.workflowToDepartment || !workflowDetail.workflowPreviousRole || !workflowDetail.workflowNextRole) {
            showToast('Please fill in all the required fields.','warn');
            return;
        }

        const lastDetail = workflowMain.workflowDetails[workflowMain.workflowDetails.length - 1];

        setWorkflowMain(prevState => ({
            ...prevState,
            workflowDetails: [...prevState.workflowDetails, workflowDetail]
        }));

        setDetailAdded(true); // Mark that a detail has been added

        setWorkflowDetail({
            workflowFromDivision: lastDetail ? lastDetail.workflowToDivision : '',
            workflowToDivision: '',
            workflowFromDepartment: lastDetail ? lastDetail.workflowToDepartment : '',
            workflowToDepartment: '',
            workflowPreviousRole: lastDetail ? lastDetail.workflowNextRole : '',
            workflowNextRole: '',
            workflowCurrentStatus: lastDetail ? lastDetail.workflowNextStatus : '',
            workflowPreviousStatus: '',
            workflowNextStatus: ''
        });
    };

    const removeDetail = (index) => {
        const newDetails = workflowMain.workflowDetails.filter((_, i) => i !== index);
        setWorkflowMain({ ...workflowMain, workflowDetails: newDetails });
        setDetailAdded(newDetails.length > 0); // Check if there are still details
    };

    const handleSubmit = async () => {
        if (!workflowMain.workflowName) {
            showToast('Workflow name is required.','warn');
            return;
        }
        if (workflowMain.workflowDetails.length === 0) {
            showToast('Please add at least one detail before submitting.','warn');
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `http://${strings.localhost}/api/workflow/save/${companyId}/${accountId}`,
                {
                    ...workflowMain,
                    thisWorkflowId: parseInt(workflowMain.thisWorkflowId),
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
            console.log(response.data);

            setWorkflows([...workflows, response.data]);

            setWorkflowMain({
                thisWorkflowId: '',
                workflowName: '',
                workflowActivityStatus: true, // Ensure checkbox remains checked
                workflowDetails: []
            });
            setOpen(false);
            setDetailAdded(false); // Reset detail added state
            alert("Workflow Added Successfully!!")
        } catch (error) {
            console.error('There was an error submitting the data!', error);
        }
    };

    const handleViewClick = (workflow) => {
        setSelectedWorkflow(workflow);
        setShowViewModal(true);
    };
    const handleEditClick = (workflow) => {
        setSelectedWorkflow(workflow);
        setShowUpdateModal(true);
    };
    const requestDeleteConfirmation = (workflow) => {
        setWorkflowMain(workflow);
        setShowDeleteConfirmation(true);
    };

    const handleDeleteRequest = async () => {
        try {
            await axios.delete(`http://${strings.localhost}/api/workflow/deleteWorkflowMainById/${workflowMain.id}`);
            alert('Workflow request deleted successfully.');
            setWorkflows(workflows.filter(wf => wf.thisWorkflowId !== workflowMain.thisWorkflowId));
            setShowDeleteConfirmation(false);
        } catch (error) {
            console.error('Error deleting Workflow request:', error);
        }
    };

    const editDropdownMenu = (workflow) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button onClick={() => handleEditClick(workflow)}>
                        <FontAwesomeIcon className='ml-2' icon={faEdit} /> Edit
                    </button>
                </div>
                <div>
                    <button onClick={() => handleViewClick(workflow)}>
                        <FontAwesomeIcon className='ml-2' icon={faEye} /> View
                    </button>
                </div>
                {/* <li>
                    <button onClick={() => requestDeleteConfirmation(workflow)}>
                        <FontAwesomeIcon className='ml-2' icon={faTrash} /> Delete
                    </button>
                </li> */}
            </div>
        </div>
    );

    return (
        <div className='mastercontainer'>
            <div className='form-title'> Define Workflow</div>
            <div className='form-controls'>
                <button type='button' className="btn" onClick={() => setOpen(true)}>
                    Create Workflow
                </button>
            </div>
            {open && (
                <div className="workflowmodal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className='title'>Create Workflow</h2>
                            <button className="button-close" onClick={() => setOpen(false)}>x</button>
                        </div>
                        <div className="modal-body">
                            <div className='input-row1'>
                                {/* <div>
                                    <input
                                        type="text"
                                        placeholder="Workflow ID"
                                        name="thisWorkflowId"
                                        value={workflowMain.thisWorkflowId}
                                        onChange={handleMainChange}
                                        className="input-field"
                                        required
                                    />
                                </div> */}
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Workflow Name"
                                        name="workflowName"
                                        value={workflowMain.workflowName}
                                        onChange={handleMainChange}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='checkbox-label'>
                                        Workflow Active Status:
                                    </label>
                                    <input
                                        className='round-checkbox active'
                                        type="checkbox"
                                        name="workflowActivityStatus"
                                        checked={workflowMain.workflowActivityStatus}
                                        onChange={(e) => setWorkflowMain({ ...workflowMain, workflowActivityStatus: e.target.checked })}
                                    />
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
                                    {workflowMain.workflowDetails.map((detail, index) => (
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
                                            placeholder="From Division"
                                            id="workflowFromDivision"
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
                                            placeholder="To Division"
                                            id="workflowToDivision"
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
                                            placeholder="From Department"
                                            id="workflowFromDepartment"
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
                                            placeholder="To Department"
                                            id="workflowToDepartment"
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
                                            placeholder="Previous Role"
                                            id="workflowPreviousRole"
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
                                            placeholder="Next Role"
                                            id="workflowNextRole"
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
                                <button onClick={() => setOpen(false)} className="outline-btn"> Cancel </button>
                                <button
                                    className="btn"
                                    onClick={handleSubmit}
                                    disabled={!detailAdded} // Disable submit if no detail is added
                                    style={{ cursor: !detailAdded ? 'not-allowed' : 'pointer' }} // Change cursor based on detail added state
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="workflow-list">
                <table className="interview-table">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Workflow Name</th>
                            <th>Active Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workflows.map(workflow => (
                            <tr key={workflow.id}>
                                <td>{workflow.id}</td>
                                <td>{workflow.workflowName}</td>
                                <td>{workflow.workflowActivityStatus ? 'Active' : 'Inactive'}</td>
                                <td>
                                    {editDropdownMenu(workflow)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showDeleteConfirmation && (
                <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to delete this workflow request?</p>
                    <div className='btnContainer'>
                        <button className='btn' onClick={handleDeleteRequest}>Yes</button>
                        <button className='btn' onClick={() => setShowDeleteConfirmation(false)}>No</button>
                    </div>
                </div>
            )}
            {showUpdateModal && (
                <div className="modal-overlay">
                    <div className="leavemodal-content">
                        <button className="close-button" onClick={() => setShowUpdateModal(false)}>X</button>
                        <UpdateWorkflow
                            workflowMain={selectedWorkflow}
                            visible={showUpdateModal}
                            onClose={() => setShowUpdateModal(false)}
                        />
                    </div>
                </div>
            )}
            {showViewModal && (
                <ViewWorkflow
                    workflowMain={selectedWorkflow}
                    visible={showViewModal}
                    onClose={() => setShowViewModal(false)}
                />
            )}

        </div>

    );
};

export default CreateWorkflow;


































































// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
// import './CreateWorkflow.css';
// import { strings } from '../../string';

// const CreateWorkflow = () => {
//     const companyId = localStorage.getItem("companyId");
//     const accountId = localStorage.getItem("accountId");
//     const [workflows, setWorkflows] = useState([]); // State to store all workflows

//     const [open, setOpen] = useState(false);
//     const [workflowMain, setWorkflowMain] = useState({
//         thisWorkflowId: '',
//         workflowName: '',
//         workflowActivityStatus: false,
//         workflowDetails: []
//     });

//     const [workflowDetail, setWorkflowDetail] = useState({
//         workflowFromDivision: '',
//         workflowToDivision: '',
//         workflowFromDepartment: '',
//         workflowToDepartment: '',
//         workflowPreviousRole: '',
//         workflowNextRole: '',
//         workflowCurrentStatus: '',
//         workflowPreviousStatus: '',
//         workflowNextStatus: ''
//     });

//     const handleMainChange = (e) => {
//         const { name, value } = e.target;
//         setWorkflowMain({ ...workflowMain, [name]: value });
//     };

//     const handleDetailChange = (e) => {
//         const { name, value } = e.target;
//         setWorkflowDetail({ ...workflowDetail, [name]: value });
//     };

//     const addDetail = () => {
//         if (!workflowDetail.workflowFromDivision || !workflowDetail.workflowToDivision) {
//             alert('Please fill in all the required fields.');
//             return;
//         }

//         setWorkflowMain((prevState) => ({
//             ...prevState,
//             workflowDetails: [...prevState.workflowDetails, workflowDetail]
//         }));

//         setWorkflowDetail({
//             workflowFromDivision: workflowMain.workflowDetails.length > 0 ? workflowMain.workflowDetails[workflowMain.workflowDetails.length - 1].workflowToDivision : '',
//             workflowToDivision: '',
//             workflowFromDepartment: workflowMain.workflowDetails.length > 0 ? workflowMain.workflowDetails[workflowMain.workflowDetails.length - 1].workflowToDepartment : '',
//             workflowToDepartment: '',
//             workflowPreviousRole: workflowMain.workflowDetails.length > 0 ? workflowMain.workflowDetails[workflowMain.workflowDetails.length - 1].workflowNextRole : '',
//             workflowNextRole: '',
//             workflowCurrentStatus: workflowMain.workflowDetails.length > 0 ? workflowMain.workflowDetails[workflowMain.workflowDetails.length - 1].workflowNextStatus : '',
//             workflowPreviousStatus: '',
//             workflowNextStatus: ''
//         });
//     };

//     const removeDetail = (index) => {
//         const newDetails = workflowMain.workflowDetails.filter((_, i) => i !== index);
//         setWorkflowMain({ ...workflowMain, workflowDetails: newDetails });
//     };

//     const handleSubmit = async () => {
//         try {
//             const token = localStorage.getItem("token");
//             await axios.post(
//                 `http://${strings.localhost}/api/workflow/save/${companyId}/${accountId}`,
//                 {
//                     ...workflowMain,
//                     thisWorkflowId: parseInt(workflowMain.thisWorkflowId),
//                     companyId: parseInt(companyId),
//                     accountId: parseInt(accountId)
//                 },
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             // Refresh the list of workflows
//             fetchWorkflows();

//             // Reset form after submission
//             setWorkflowMain({
//                 thisWorkflowId: '',
//                 workflowName: '',
//                 workflowActivityStatus: false,
//                 workflowDetails: []
//             });
//             setOpen(false);
//         } catch (error) {
//             console.error('There was an error submitting the data!', error);
//         }
//     };

//     const fetchWorkflows = async () => {
//         try {
//             const token = localStorage.getItem("token");
//             const response = await axios.get(
//                 `http://${strings.localhost}/api/fetchdetails`,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );
//             setWorkflows(response.data);
//         } catch (error) {
//             console.error('There was an error fetching the workflows!', error);
//         }
//     };

//     useEffect(() => {
//         fetchWorkflows();
//     }, []);

//     const [dropdownError, setDropdownError] = useState('');
//     const [dropdownData, setDropdownData] = useState({
//         role: [],
//         department: [],
//         division: []
//     });

//     const fetchDataByKey = (keyvalue, content) => {
//         axios.get(`http://${strings.localhost}/api/master1/GetDataByKey/${keyvalue}`)
//             .then(response => {
//                 // Ensure response.data is defined and not null
//                 if (response.data && Array.isArray(response.data)) {
//                     const dropdownContent = response.data.map(item => ({
//                         masterId: item.masterId,
//                         data: item.data || ''  // Handle null or undefined values gracefully
//                     }));

//                     setDropdownData(prevData => ({
//                         ...prevData,
//                         [content]: dropdownContent
//                     }));

//                     setDropdownError('');
//                 } else {
//                     console.error(`Invalid data structure or empty response for ${keyvalue}`);
//                     setDropdownError(`Invalid data structure or empty response for ${keyvalue}`);
//                 }
//             })
//             .catch(error => {
//                 console.error(`Error fetching data for ${keyvalue}:`, error);
//                 setDropdownError(`Error fetching data for ${keyvalue}`);
//             });
//     };

//     useEffect(() => {
//         fetchDataByKey('division', 'division');
//         fetchDataByKey('role', 'role');
//         fetchDataByKey('department', 'department');
//     }, []);

//     return (
//         <div>
//             <button className="btn" onClick={() => setOpen(true)}>
//                 Create Workflow
//             </button>
//             {open && (
//                 <div className="workflowmodal">
//                     <div className="modal-content">
//                         <div className="modal-header">
//                             <h2 className='title'>Create Workflow</h2>
//                             <button className="button-close" onClick={() => setOpen(false)}>x</button>
//                         </div>
//                         <div className="modal-body">
//                             <div className='input-row'>
//                                 <div>
//                                     <input
//                                         type="text"
//                                         placeholder="Workflow ID"
//                                         name="thisWorkflowId"
//                                         value={workflowMain.thisWorkflowId}
//                                         onChange={handleMainChange}
//                                         className="input-field"
//                                     />
//                                 </div>
//                                 <div>
//                                     <input
//                                         type="text"
//                                         placeholder="Workflow Name"
//                                         name="workflowName"
//                                         value={workflowMain.workflowName}
//                                         onChange={handleMainChange}
//                                         className="input-field"
//                                     />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className='checkbox-label' >
//                                     Workflow Active Status:
//                                 </label>
//                                 <input
//                                     type="checkbox"
//                                     name="workflowActivityStatus"
//                                     checked={workflowMain.workflowActivityStatus}
//                                     onChange={(e) => setWorkflowMain({ ...workflowMain, workflowActivityStatus: e.target.checked })}
//                                 />
//                             </div>

//                             <table className="EP-table">
//                                 <thead>
//                                     <tr>
//                                         <th>From Division</th>
//                                         <th>To Division</th>
//                                         <th>From Department</th>
//                                         <th>To Department</th>
//                                         <th>Previous Role</th>
//                                         <th>Next Role</th>
//                                         <th>Current Status</th>
//                                         <th>Previous Status</th>
//                                         <th>Next Status</th>
//                                         <th>Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {workflowMain.workflowDetails.map((detail, index) => (
//                                         <tr key={index}>
//                                             <td>{detail.workflowFromDivision}</td>
//                                             <td>{detail.workflowToDivision}</td>
//                                             <td>{detail.workflowFromDepartment}</td>
//                                             <td>{detail.workflowToDepartment}</td>
//                                             <td>{detail.workflowPreviousRole}</td>
//                                             <td>{detail.workflowNextRole}</td>
//                                             <td>{detail.workflowCurrentStatus}</td>
//                                             <td>{detail.workflowPreviousStatus}</td>
//                                             <td>{detail.workflowNextStatus}</td>
//                                             <td>
//                                                 <button onClick={() => removeDetail(index)} className="button-icon">
//                                                     <FontAwesomeIcon icon={faTrash} />
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>

//                             <div>
//                                 <div className='input-row'>
//                                     <div>
//                                         <select
//                                             className='selectIM'
//                                             id="workflowFromDivision"
//                                             name="workflowFromDivision"
//                                             value={workflowDetail.workflowFromDivision}
//                                             onChange={handleDetailChange}
//                                             required
//                                         >
//                                             <option value="" disabled hidden>From Division</option>
//                                             {dropdownData.division && dropdownData.division.length > 0 ? (
//                                                 dropdownData.division.map(option => (
//                                                     <option key={option.masterId} value={option.masterId}>
//                                                         {option.data}
//                                                     </option>
//                                                 ))
//                                             ) : (
//                                                 <option value="">No Divisions</option>
//                                             )}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <select
//                                             className='selectIM'
//                                             id="workflowToDivision"
//                                             name="workflowToDivision"
//                                             value={workflowDetail.workflowToDivision}
//                                             onChange={handleDetailChange}
//                                             required
//                                         >
//                                             <option value="" disabled hidden>To Division</option>
//                                             {dropdownData.division && dropdownData.division.length > 0 ? (
//                                                 dropdownData.division.map(option => (
//                                                     <option key={option.masterId} value={option.masterId}>
//                                                         {option.data}
//                                                     </option>
//                                                 ))
//                                             ) : (
//                                                 <option value="">No Divisions</option>
//                                             )}
//                                         </select>
//                                     </div>
//                                 </div>
//                                 <div className='input-row'>
//                                     <div>
//                                         <select
//                                             className='selectIM'
//                                             id="workflowFromDepartment"
//                                             name="workflowFromDepartment"
//                                             value={workflowDetail.workflowFromDepartment}
//                                             onChange={handleDetailChange}
//                                             required
//                                         >
//                                             <option value="" disabled hidden>From Department</option>
//                                             {dropdownData.department && dropdownData.department.length > 0 ? (
//                                                 dropdownData.department.map(option => (
//                                                     <option key={option.masterId} value={option.masterId}>
//                                                         {option.data}
//                                                     </option>
//                                                 ))
//                                             ) : (
//                                                 <option value="">No Departments</option>
//                                             )}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <select
//                                             className='selectIM'
//                                             id="workflowToDepartment"
//                                             name="workflowToDepartment"
//                                             value={workflowDetail.workflowToDepartment}
//                                             onChange={handleDetailChange}
//                                             required
//                                         >
//                                             <option value="" disabled hidden>To Department</option>
//                                             {dropdownData.department && dropdownData.department.length > 0 ? (
//                                                 dropdownData.department.map(option => (
//                                                     <option key={option.masterId} value={option.masterId}>
//                                                         {option.data}
//                                                     </option>
//                                                 ))
//                                             ) : (
//                                                 <option value="">No Departments</option>
//                                             )}
//                                         </select>
//                                     </div>
//                                 </div>
//                                 <div className='input-row'>
//                                     <div>
//                                         <select
//                                             className='selectIM'
//                                             id="workflowPreviousRole"
//                                             name="workflowPreviousRole"
//                                             value={workflowDetail.workflowPreviousRole}
//                                             onChange={handleDetailChange}
//                                             required
//                                         >
//                                             <option value="" disabled hidden>Previous Role</option>
//                                             {dropdownData.role && dropdownData.role.length > 0 ? (
//                                                 dropdownData.role.map(option => (
//                                                     <option key={option.masterId} value={option.masterId}>
//                                                         {option.data}
//                                                     </option>
//                                                 ))
//                                             ) : (
//                                                 <option value="">No Roles</option>
//                                             )}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <select
//                                             className='selectIM'
//                                             id="workflowNextRole"
//                                             name="workflowNextRole"
//                                             value={workflowDetail.workflowNextRole}
//                                             onChange={handleDetailChange}
//                                             required
//                                         >
//                                             <option value="" disabled hidden>Next Role</option>
//                                             {dropdownData.role && dropdownData.role.length > 0 ? (
//                                                 dropdownData.role.map(option => (
//                                                     <option key={option.masterId} value={option.masterId}>
//                                                         {option.data}
//                                                     </option>
//                                                 ))
//                                             ) : (
//                                                 <option value="">No Roles</option>
//                                             )}
//                                         </select>
//                                     </div>
//                                 </div>
//                                 <div className='input-row'>
//                                     <div>
//                                         <input
//                                             type="text"
//                                             placeholder="Current Status"
//                                             name="workflowCurrentStatus"
//                                             value={workflowDetail.workflowCurrentStatus}
//                                             onChange={handleDetailChange}
//                                             className="input-field"
//                                         />
//                                     </div>
//                                     <div>
//                                         <input
//                                             type="text"
//                                             placeholder="Previous Status"
//                                             name="workflowPreviousStatus"
//                                             value={workflowDetail.workflowPreviousStatus}
//                                             onChange={handleDetailChange}
//                                             className="input-field"
//                                         />
//                                     </div>
//                                     <div>
//                                         <input
//                                             type="text"
//                                             placeholder="Next Status"
//                                             name="workflowNextStatus"
//                                             value={workflowDetail.workflowNextStatus}
//                                             onChange={handleDetailChange}
//                                             className="input-field"
//                                         />
//                                     </div>
//                                 </div>
//                                 <button className="btn" onClick={addDetail}>
//                                     <FontAwesomeIcon icon={faPlusCircle} /> Add Detail
//                                 </button>
//                             </div>
//                             <div className="modal-footer">
//                                 <button className="btn" onClick={handleSubmit}>
//                                     Save Workflow
//                                 </button>
//                                 <button className="outline-btn" onClick={() => setOpen(false)}>
//                                     Cancel
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//             <div className="workflow-list">
//                 {/* <h2>Workflows List</h2> */}
//                 <table className="EP-table">
//                     <thead>
//                         <tr>
//                             <th>ID</th>
//                             <th>Name</th>
//                             <th>Status</th>
//                             <th>Details Count</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {workflows.map((workflow, index) => (
//                             <tr key={index}>
//                                 <td>{workflow.thisWorkflowId}</td>
//                                 <td>{workflow.workflowName}</td>
//                                 <td>{workflow.workflowActivityStatus ? 'Active' : 'Inactive'}</td>
//                                 <td>{workflow.workflowDetails.length}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default CreateWorkflow;
