import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { showToast } from '../../Api.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { strings } from '../../string';


const TrainingApprovalRequest = () => {
    const [trainingRequests, setTrainingRequests] = useState([]);
    const [approvalStatus, setApprovalStatus] = useState({});
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isApproving, setIsApproving] = useState(false); // Track approval status
    const employeeId = localStorage.getItem('employeeId');

    useEffect(() => {
        axios.get(`http://${strings.localhost}/api/training/pending-approvals/${employeeId}`)
            .then(response => {
                setTrainingRequests(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the training requests!', error);
            });
    }, [employeeId]);

    const handleApprovalChange = (trainingId, status) => {
        setApprovalStatus(prevState => ({
            ...prevState,
            [trainingId]: status
        }));
    };

    // Handle approval for all trainings
    const handleApproveAll = () => {
        setIsApproving(true);
        const approvalData = [];

        Object.keys(approvalStatus).forEach(trainingId => {
            const status = approvalStatus[trainingId];
            if (status !== undefined) {
                approvalData.push({
                    id: parseInt(trainingId),
                    managerApproval: status
                });
            }
        });

        if (approvalData.length > 0) {
            axios.put(`http://${strings.localhost}/api/training/approve-reject/${employeeId}`, approvalData)
                .then(response => {
                    showToast(response.data || 'Approval status updated successfully.', 'success');
                    setIsApproving(false);
                    setShowModal(false);
                })
                .catch(error => {
                    showToast(error.response?.data || 'There was an error updating the approval status.', 'error');
                    setIsApproving(false);
                    setShowModal(false);
                });
        } else {
            showToast('No training requests selected for approval or rejection', 'warn');
            setIsApproving(false);
        }
    };

    // Group training requests by employee ID
    const groupedTrainingRequests = trainingRequests.reduce((acc, request) => {
        const employeeId = request.employee.id;
        if (!acc[employeeId]) {
            acc[employeeId] = {
                employee: request.employee,
                trainings: []
            };
        }
        acc[employeeId].trainings.push(request);
        return acc;
    }, {});

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };
    const handleViewClick2 = (employee) => {
        setSelectedEmployee(employee);
        setShowModal(true);
    };
    const editdropdownfeedback = (employee) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button
                        type='button'
                        onClick={() => handleViewClick2(employee)}
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className='coreContainer'>
            <table className='interview-table'>
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Employee ID</th>
                        <th>Employee Name</th>
                        <th>Department</th>
                        <th>Division</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(groupedTrainingRequests).length === 0 ? (
                        <tr>
                            <td colSpan="6" className='no-data1'>
                                No training requests available.
                            </td>
                        </tr>
                    ) : (
                        Object.values(groupedTrainingRequests).map((group, index) => (
                            <tr key={group.employee.id}>
                                <td>{index + 1}</td>
                                <td>{group.employee.employeeId}</td>
                                <td
                                    onClick={() => handleEmployeeClick(group.employee)}
                                    style={{ cursor: 'pointer', color: 'blue' }}
                                >
                                    {`${group.employee.firstName} ${group.employee.lastName}`}
                                </td>
                                <td>{group.employee.department}</td>
                                <td>{group.employee.division}</td>
                                <td>{editdropdownfeedback(group.employee)}</td>
                            </tr>
                        ))
                    )}
                </tbody>


            </table>

            {showModal && selectedEmployee && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        {/* <div className="training-left">
                            <h3 className='underlineText' style={{ textAlign: 'center' }}>Employee Details</h3>
                            <p><strong>Employee Name : </strong>{`${selectedEmployee.firstName} ${selectedEmployee.middleName} ${selectedEmployee.lastName}`}</p>
                            <p><strong>Employee Id : </strong>{selectedEmployee.id}</p>
                        </div> */}
                        <h3>Training Details</h3>
                        <table className='interview-table'>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Training Name</th>
                                    <th>Manager Approval</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedTrainingRequests[selectedEmployee.id].trainings.map(training => (
                                    <tr key={training.id}>
                                        <td>{training.date}</td>
                                        <td>{training.training}</td>
                                        <td>{training.managerApproval ? 'Approved' : 'Pending'}</td>
                                        <td>
                                            {approvalStatus[training.id] === undefined ? (
                                                <>
                                                    <div style={{ gap: '10px' }}>
                                                        <button
                                                            type='button'
                                                            className='textbutton'
                                                            onClick={() => handleApprovalChange(training.id, true)}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            type='button'
                                                            className='cross-btn'
                                                            onClick={() => handleApprovalChange(training.id, false)}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </>
                                            ) : approvalStatus[training.id] === true ? (
                                                <>
                                                    <span className="textbutton">&#x2714;</span>
                                                    <button
                                                        type="button"
                                                        className="cross-btn"
                                                        onClick={() => handleApprovalChange(training.id, false)}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="cross-btn">&#x2716;</span>
                                                    <button
                                                        type="button"
                                                        className="textbutton"
                                                        onClick={() => handleApprovalChange(training.id, true)}
                                                    >
                                                        Approve
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className='form-controls'>
                            <button
                                type='button'
                                className='btn'
                                onClick={handleApproveAll}
                                disabled={isApproving}
                            >
                                {isApproving ? (
                                    <>
                                        <div className="loading-spinner"></div>  Submitting...
                                    </>
                                ) : (
                                    'Submit'
                                )}
                            </button>
                            <button type='button' className='outline-btn' onClick={closeModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingApprovalRequest;
