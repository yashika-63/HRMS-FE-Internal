import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../CommonCss/AppraisalForm .css'; // Fixed the extra space in the path
import { useParams } from 'react-router-dom';
import { strings } from '../../../string';
import { useCompanyLogo } from '../../../Api.jsx';

const ViewAppraisal = () => {
    const [appraisalData, setAppraisalData] = useState(null);
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [reportingManagerId, setReportingManagerId] = useState('');
    const { id: employeeId } = useParams();
    const currentYear = new Date().getFullYear();
    const companyId = localStorage.getItem("companyId");
    const logo = useCompanyLogo(companyId);
    // Fetch the employee details from API
    const fetchEmployeeDetails = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/employee-config/employee/${employeeId}`);
            console.log('Employee Details:', response.data); // Log the response for debugging
            setEmployeeDetails(response.data);
            const managerId = response.data[0]?.reportingManager?.id;
            if (managerId) {
                setReportingManagerId(managerId);
            }
        } catch (error) {
            console.error('There was an error fetching the employee details.', error);
        }
    };

    // Fetch the appraisal data from API
    const fetchAppraisalData = async () => {
        try {
            if (reportingManagerId && employeeId) {
                const response = await axios.get(`http://${strings.localhost}/api/appraisal/get-appraisal-manager/${employeeId}/${currentYear}/${reportingManagerId}`);
                setAppraisalData(response.data);
            }
        } catch (error) {
            console.error('There was an error fetching the appraisal data.', error);
        }
    };

    // Fetch employee details first and then appraisal data after reportingManagerId is set
    useEffect(() => {
        if (employeeId) {
            fetchEmployeeDetails();
        }
    }, [employeeId]);

    useEffect(() => {
        if (reportingManagerId && employeeId) {
            fetchAppraisalData();
        }
    }, [reportingManagerId, employeeId, currentYear]);

    if (!appraisalData || !employeeDetails) {
        return <div>Loading...</div>;
    }

    const totalPerformanceRating = (appraisalData.totalAverageManagerRating + appraisalData.totalAverageEmployeeRating) / 2;
    const employee = employeeDetails[0]?.employee || {};
    const reportingManager = employeeDetails[0]?.reportingManager || {};

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='appraisal-container'>
            <div className='appraisal-title'>Appraisal Form</div>
            <div className='appraisal-logo'>
                <img className='HRMSNew' src={logo} alt="Pristine Logo" width={120} height={30} />

            </div>
            {/* Employee Details Section */}
            <div>
                <h3 className='appraisal-section-header'>Employee Details</h3>
                <table className='appraisal-table'>
                    <thead>
                        <tr>
                            <th colSpan={2}>Employee Information</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Employee Name:</td>
                            <td>{employee.firstName} {employee.middleName} {employee.lastName}</td>
                        </tr>
                        <tr>
                            <td>Employee ID:</td>
                            <td>{employee.employeeId}</td>
                        </tr>
                        <tr>
                            <td>Reporting Manager Name:</td>
                            <td>{reportingManager.firstName} {reportingManager.middleName} {reportingManager.lastName}</td>
                        </tr>
                        <tr>
                            <td>Employee Division:</td>
                            <td>{employee.division}</td>
                        </tr>
                        <tr>
                            <td>Employee Department:</td>
                            <td>{employee.department}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Average Ratings Section */}
            <div>
                <h3 className='appraisal-section-header'>Average Ratings</h3>
                <table className='appraisal-table'>
                    <thead>
                        <tr>
                            <th colSpan={2}>Average Ratings</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Average Manager Rating:</td>
                            <td><strong>{appraisalData.totalAverageManagerRating}</strong></td>
                        </tr>
                        <tr>
                            <td>Total Average Employee Rating:</td>
                            <td><strong>{appraisalData.totalAverageEmployeeRating}</strong></td>
                        </tr>
                        <tr>
                            <td>Total Performance Rating:</td>
                            <td><strong>{totalPerformanceRating}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Goal & KPI Data Section */}
            <div>
                <h3 className='appraisal-section-header'>Goal & KPI Data</h3>
                <table className='appraisal-table'>
                    <thead>
                        <tr>
                            <th>Sr. No</th>
                            <th>Goal/KPI</th>
                            <th>Employee Self Rating</th>
                            <th>Reporting Manager Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Combine Goal Data and KPI Data */}
                        {appraisalData.goalData.map((goal, index) => (
                            <tr key={`goal-${goal.id}`}>
                                <td>{index + 1}</td>
                                <td>{goal.goalSetting.goal}</td>
                                <td>{goal.employeeSelfRating}</td>
                                <td>{goal.reportingManagerRating}</td>
                            </tr>
                        ))}
                        {appraisalData.kpiData.map((kpi, index) => (
                            <tr key={`kpi-${kpi.id}`}>
                                <td>{appraisalData.goalData.length + index + 1}</td> {/* Adjusting Sr. No for KPI */}
                                <td>{kpi.kpiSetting.kpi}</td>
                                <td>{kpi.employeeSelfRating}</td>
                                <td>{kpi.reportingManagerRating}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='form-controls'>
                <button onClick={handlePrint} className='btn'>Print</button>
            </div>
        </div>
    );
};

export default ViewAppraisal;
