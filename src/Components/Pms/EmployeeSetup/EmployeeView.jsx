import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../CommonCss/EmployeeView.css';
import { showToast } from '../../../Api.jsx';
import { strings } from '../../../string';

const EmployeeView = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [goalData, setGoalData] = useState([]);
    const [kpiData, setKpiData] = useState([]);
    const [showApproveButton, setShowApproveButton] = useState(false);
    const [showKpiApproveButton, setShowKpiApproveButton] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [approvalType, setApprovalType] = useState(null); // To track which approval is being triggered (goal/kpi)
    const [isLoading, setIsLoading] = useState(false); // For loading spinner state

    const employeeId = localStorage.getItem('employeeId');

    useEffect(() => {
        fetchData();
    }, [year]);

    const fetchData = async () => {
        try {
            // Fetch goal data
            const goalResponse = await axios.get(`http://${strings.localhost}/api/goalSetting/getByEmployeeAndYear?employeeId=${employeeId}&year=${year}`);
            setGoalData(goalResponse.data);
            const hasPendingGoalApproval = goalResponse.data.some(item => !item.employeeApproval);
            setShowApproveButton(hasPendingGoalApproval);


            // Fetch KPI data
            const kpiResponse = await axios.get(`http://${strings.localhost}/api/kpi/getKpiByYear?year=${year}&employeeId=${employeeId}`);
            setKpiData(kpiResponse.data);
            const hasPendingKpiApproval = kpiResponse.data.some(item => !item.employeeApproval);
            setShowKpiApproveButton(hasPendingKpiApproval);

        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const handleYearChange = (event) => {
        setYear(event.target.value);
    };

    const handleApprove = (type) => {
        setApprovalType(type);
        setShowConfirmation(true);
    };

    const approveGoals = async () => {
        setIsLoading(true);
        try {
            await axios.put(`http://${strings.localhost}/api/goalSetting/updateApprovalStatus?employeeId=${employeeId}`);
            showToast('Goals approved successfully', 'success');
            fetchData();
            setShowConfirmation(false);
        } catch (error) {
            console.error('Error approving goals', error);
            showToast("Error approving goals", 'error');
        }
        setIsLoading(false);
    };

    const approveKpis = async () => {
        setIsLoading(true);
        try {
            await axios.put(`http://${strings.localhost}/api/kpi/updateKpiApprovalStatus?employeeId=${employeeId}`);
            showToast('KPI approved successfully', 'success');
            fetchData();
            setShowConfirmation(false);
        } catch (error) {
            console.error('Error approving KPIs', error);
            showToast('Error approving KPIs', 'error');
        }
        setIsLoading(false);
    };

    const cancelApproval = () => {
        setShowConfirmation(false); // Close confirmation popup without approving
    };
    const yearOptions = [...Array(11)].map((_, i) => {
        const yearOption = new Date().getFullYear() - 5 + i;
        return yearOption;
    });
    return (
        <div className='coreContainer'>
            <div className='form-title'>Employee Goals & KPIs</div>

            <div className='year-select-container'>
                <div className='year-select'>
                    <label htmlFor="year">Select Year: </label>
                    <select id="year" value={year} onChange={handleYearChange}>
                        {yearOptions.map((yearOption) => (
                            <option key={yearOption} value={yearOption}>
                                {yearOption}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Goals Section */}
            <div className='goal-view'>
                <div className='underlineText' >Goals for {year}</div>
                {goalData.map((goal, index) => (
                    <div key={index} className='goal-item'>
                        <p className='goal-number'>{index + 1}. </p>
                        <p className='goal-description'>
                            {Array.isArray(goal.goal) ? goal.goal.join(', ') : goal.goal}
                        </p>
                    </div>
                ))}
                <div className='form-controls'>
                    {showApproveButton && <button type='button' className='btn' onClick={() => handleApprove('goal')}>Confirm Goals</button>}
                </div>
            </div>

            <div className='goal-view'>
                <div className='underlineText'>KPI for {year}</div>
                {kpiData.length > 0 ? (
                    kpiData.map((kpi, index) => (
                        <div key={index} className='goal-item'>
                            <p className='goal-number'>{index + 1}. </p>
                            <p className='goal-description'>{kpi.kpi}</p>
                        </div>
                    ))
                ) : (
                    <p>No KPI data available for this year or all KPIs are already approved.</p>
                )}
                <div className='form-controls'>
                    {showKpiApproveButton && <button type='button' className='btn' onClick={() => handleApprove('kpi')}>Confirm KPIs</button>}
                </div>
            </div>

            {/* Confirmation Popup */}
            {showConfirmation && (
                <div className="add-popup">
                    <div className="popup-content">
                        <div style={{ textAlign: 'center' }}>Are you sure you want to approve all {approvalType === 'goal' ? 'goals' : 'KPIs'}?</div>
                        <div className='btnContainer'>
                            <button type='button' className='btn' disabled={isLoading} onClick={approvalType === 'goal' ? approveGoals : approveKpis}>
                                {isLoading ? (
                                    <>
                                        Approving...
                                        <div className="loading-spinner-dots"></div>
                                    </>
                                ) : 'Yes'}</button>


                            <button type='button' className='outline-btn' onClick={cancelApproval}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeView;
