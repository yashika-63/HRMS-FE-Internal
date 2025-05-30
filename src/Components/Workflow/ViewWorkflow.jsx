import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { strings } from '../../string';

const ViewWorkflow = ({ workflowMain, onClose, visible }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (visible && workflowMain && workflowMain.id) {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://${strings.localhost}/api/workflow/getWorkflowById/${workflowMain.id}`);
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
    }, [visible, workflowMain]);

    if (!workflowMain) return null;

    return (
        <div className={`workflowmodal ${visible ? 'show' : ''}`}>
            <div className='modal-content'>

                <div className="modal-header">
                    <div className='title'>View Workflow</div>
                    <button className="close-btn" onClick={onClose}>×</button>

                </div>
                <div className="modal-body">
                    <p><strong>Workflow Name:</strong> {workflowMain.workflowName}</p>
                    <p><strong>Status:</strong> {workflowMain.workflowActivityStatus ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="workflow-details">
                    {/* <div className='form-title'>Workflow Details</div> */}
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>From Division</th>
                                    <th>To Division</th>
                                    <th>From Department</th>
                                    <th>To Department</th>
                                    <th>Previous Role</th>
                                    <th>Next Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workflowMain.workflowDetails.length > 0 ? (
                                    workflowMain.workflowDetails.map((detail) => (
                                        <tr key={detail.id}>
                                            <td>{detail.workflowFromDivision}</td>
                                            <td>{detail.workflowToDivision}</td>
                                            <td>{detail.workflowFromDepartment}</td>
                                            <td>{detail.workflowToDepartment}</td>
                                            <td>{detail.workflowPreviousRole}</td>
                                            <td>{detail.workflowNextRole}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No details available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="outline-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ViewWorkflow;
