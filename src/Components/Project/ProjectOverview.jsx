import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import { strings } from '../../string'; // Ensure `strings.localhost` is correctly set
import '../CommonCss/Project.css';
import { useNavigate } from 'react-router-dom';

const ProjectOverview = () => {
    const [formData, setFormData] = useState({
        proId: '',
        clientName: '',
        projectName: '',
        projectLead: '',
        deliveryLead: '',
        projectType: '',
        industry: '',
        technologies: [],
        assign: '',
        startDate: '',
        endDate: '',
        actualStartDate: '',
        expectedEndDate: '',
        projectStatus: '',
        cityLocation: '',
        currentPhase: '',
        deallocate: '',
        description: '',
        totalEffort: '',
        totalCost: '',
        shift: '',
        workType: ''
    });

    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();

    const handlePrint = () => {
        window.print();
    };

    const fetchProjectDetails = async (projectId) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await Axios.get(
                `http://${strings.localhost}/project/getProjectById/${projectId}`,
                config
            );

            const data = response.data;

            const formattedStartDate = data.startDate ? new Date(data.startDate).toISOString().slice(0, 10) : '-';
            const formattedEndDate = data.endDate ? new Date(data.endDate).toISOString().slice(0, 10) : '-';

            setFormData({
                proId: data.proId || '',
                clientName: data.clientName || '',
                projectName: data.projectName || '',
                projectLead: data.projectLead || '',
                deliveryLead: data.deliveryLead || '',
                projectType: data.projectType || '',
                industry: data.industry || '',
                technologies: typeof data.technologies === 'string'
                    ? data.technologies.split(',').map((tech) => tech.trim())
                    : data.technologies || [],
                assign: data.assign || '',
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                projectStatus: data.projectStatus || '',
                cityLocation: data.cityLocation || '',
                currentPhase: data.currentPhase || '',
                deallocate: data.deallocate || '',
                description: data.description || '',
                totalEffort: data.totalEffort || '',
                totalCost: data.totalCost || '',
                shift: data.shift || '',
                workType: data.workType || ''
            });
        } catch (error) {
            console.error('Error fetching project details:', error);
        }
    };

    const fetchEmployeeDetails = async (projectId) => {
        try {
            const response = await Axios.get(`http://${strings.localhost}/api/project/${projectId}/employees`);
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employee details:', error);
            setEmployees([]);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProjectDetails(id);
            fetchEmployeeDetails(id);
        }
    }, [id]);

    const handleBack = () => {
        navigate(`/ListProject`);
    };

    return (
        <div className="coreContainer">
            <div className="form-title">
                <div>Project Overview</div>
            </div>
            <div className='overviewcard-container'>

                <div className='overviewcard small-width'>
                    <span className='underlineText' style={{ textAlign: 'center' }}><strong>{formData.projectName}</strong></span>
                    <div className="field"><span className="label">ID:</span> <span className="data">{formData.proId}</span></div>
                    <div className="field"><span className="label">Client Name:</span> <span className="data">{formData.clientName}</span></div>
                    <div className="field"><span className="label">Project Name:</span> <span className="data">{formData.projectName}</span></div>
                   

                </div>




                <div className='overviewcard large-width'>
                    <div className='fields-wrapper'>
                    <div className="field"><span className="label">Project Lead:</span> <span className="data">{formData.projectLead}</span></div>
                    <div className="field"><span className="label">Delivery Lead:</span> <span className="data">{formData.deliveryLead}</span></div>
                        <div className="field"><span className="label">Project Type:</span> <span className="data">{formData.projectType}</span></div>
                        <div className="field"><span className="label">Industry:</span> <span className="data">{formData.industry}</span></div>
                        <div className="field"><span className="label">City Location:</span> <span className="data">{formData.cityLocation}</span></div>
                        <div className="field"><span className="label">Current Phase:</span> <span className="data">{formData.currentPhase}</span></div>
                        <div className="field"><span className="label">Project Duration:</span> <span className="data">{formData.totalEffort}</span></div>
                        <div className="field"><span className="label">Total Cost:</span> <span className="data">{formData.totalCost}</span></div>
                        <div className="field"><span className="label">Shift:</span> <span className="data">{formData.shift}</span></div>
                        <div className="field"><span className="label">Work Type:</span> <span className="data">{formData.workType}</span></div>
                    </div>
                </div>

                <div className='overviewcard'>
                <div className='section'>
                    <h4 style={{textAlign:'center'}}>Technologies Used</h4>
                    <div className="tiles"><span className="data">{formData.technologies.join(', ')}</span></div>
                </div>
                </div>

                <div className=' overviewcard'>
                    <h4 style={{textAlign:'center'}}>Project Timeline & Status</h4>
                    <div className="field"><span className="label">Start Date:</span> <span className="data">{formData.startDate || '-'}</span></div>
                    <div className="field"><span className="label">End Date:</span> <span className="data">{formData.endDate || '-'}</span></div>
                    <div className="field"><span className="label">Project Status:</span> <span className="data">{formData.projectStatus}</span></div>
                </div>

                <div className='overviewcard'>
                    <h4 style={{textAlign:'center'}}>Project Description</h4>
                    <div className="field"><span className="data">{formData.description}</span></div>
                </div>
                <div className="overviewcard">
                    <h3 style={{textAlign:'center'}}>Assigned Employees</h3>
                    {employees.length > 0 ? (
                        employees.map((employee) => (
                            <div className="field" key={employee.employeeId}>
                                <span className="label">Employee Name:</span>
                                <span className="data">{`${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`}</span>
                            </div>
                        ))
                    ) : (
                        <p>No employees assigned to this project.</p>
                    )}
                </div>
            </div>

            <div className="btnContainer">
                <button type="button" className="outline-btn" onClick={handleBack}>Back</button>
                <button className="btn" type="button" onClick={handlePrint}>Print</button>
            </div>
        </div>
    );
};

export default ProjectOverview;
