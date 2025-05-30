import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from '../../Api.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import '../CommonCss/ListProject.css';  // Ensure this file includes the new CSS
import { strings } from '../../string';

const EmployeeProjectsTable = () => {
    const [employeeProjects, setEmployeeProjects] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    useEffect(() => {
        const fetchEmployeeProjects = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/employees/getAllEmployeeProjects`);
                setEmployeeProjects(response.data);
            } catch (error) {
                console.error('Error fetching employee projects:', error);
            }
        };
 
        fetchEmployeeProjects();
    }, []);

    const handleDelete = (projectId, employeeId) => {
        setProjectToDelete({ projectId, employeeId });
        setShowConfirmation(true);
    };

    const handleRemoveEmployee = async (projectId, employeeId) => {
        setProjectToDelete({ projectId, employeeId });
        setShowConfirmation(true);
    };

    const confirmRemoveEmployee = async () => {
        if (!projectToDelete) return;

        try {
            const { employeeId, projectId } = projectToDelete;
            const token = localStorage.getItem('token');

            await axios.delete(
                `http://${strings.localhost}/project/removeEmployeeFromProject/${projectId}/${employeeId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            showToast('Employee removed successfully.','success');
            setShowConfirmation(false);

            // Optionally, refresh the data to reflect the removal
            setEmployeeProjects((prevProjects) =>
                prevProjects.filter(employee => {
                    return !employee.generateProjects.some(project => project.projectId === projectId);
                })
            );
        } catch (error) {
            console.error('Error removing employee:', error);
            showToast('Error removing employee. Please try again.','error');
        }
    };

    const editDropdownMenu = (projectId, employeeId) => (
        <div className='dropdown'>
            <button className='dots-button'>
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className='dropdown-content'>
                <button type='button' onClick={() => handleRemoveEmployee(projectId, employeeId)}>
                    <FontAwesomeIcon icon={faTrashAlt} /> Remove
                </button>
            </div>
        </div>
    );

    return (
        <div className='coreContainer'>
            <table className='interview-table'>
                <thead>
                    <tr>
                        
                        <th>Employee ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Project Name</th>
                        <th>Project Lead</th>
                        <th>Delivery Lead</th>
                        <th>Description</th>
                        <th style={{ width: "5%" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employeeProjects.map(employee => (
                        employee.generateProjects.map(project => (
                            <tr key={project.projectId}>
                                <td>{employee.employeeId}</td>
                                <td>{employee.firstName}</td>
                                <td>{employee.lastName}</td>
                                <td>{project.projectName}</td>
                                <td>{project.projectLead}</td>
                                <td>{project.deliveryLead}</td>
                                <td>
                                    <span
                                        className="truncate-text"
                                        title={project.description}  // Native tooltip (optional)
                                    >
                                        {project.description ? project.description.slice(0, 50) + '...' : '-'}  {/* Truncate text */}
                                    </span>
                                </td>
                                <td>{editDropdownMenu(project.projectId, employee.id)}</td>
                            </tr>
                        ))
                    ))}
                </tbody>
            </table>

            {showConfirmation && (
                <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to remove the employee from this project?</p>
                    <div className='btnContainer'>
                        <button type='button' className='btn' onClick={confirmRemoveEmployee}>
                            Remove from Project
                        </button>
                        <button type='button' className='outline-btn' onClick={() => setShowConfirmation(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
          
        </div>
    );
};
 
export default EmployeeProjectsTable;