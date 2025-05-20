import React, { useState, useEffect } from 'react';
import { useParams , useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../CommonCss/EmployeeView.css';
import { fetchDataByKey , showToast } from '../../../Api.jsx';
import { strings } from '../../../string';

const ManagerView = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [kpiData, setKpiData] = useState([]);
    const [goalData, setGoalData] = useState([]);
    const { id:employeeId } = useParams();
    const [dropdownData, setDropdownData] = useState({
        region: [],
        typeofGoal: [],
        level: [],
        department: []
    });

    const [goalEditData, setGoalEditData] = useState({});
    const [editingGoal, setEditingGoal] = useState({});
    const [kpiEditData, setKpiEditData] = useState({});
    const [editingKpi, setEditingKpi] = useState({});
   const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        fetchDropdownData();
    }, [year]);

    const fetchData = async () => {
        try {
            const goalResponse = await axios.get(`http://${strings.localhost}/api/goalSetting/getByEmployeeAndYear?employeeId=${employeeId}&year=${year}`);
            setGoalData(goalResponse.data);

            const kpiResponse = await axios.get(`http://${strings.localhost}/api/kpi/getKpiByYear?year=${year}&employeeId=${employeeId}`);
            setKpiData(kpiResponse.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const region = await fetchDataByKey('region');
            const type = await fetchDataByKey('typeofGoal');
            const level = await fetchDataByKey('level');
            const department = await fetchDataByKey('department');

            console.log("Dropdown Data:", { region, type, level, department });

            setDropdownData({
                region: region,
                typeofGoal: type,
                level: level,
                department: department
            });
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleYearChange = (event) => {
        setYear(event.target.value);
    };

    const updateGoal = async (goalId) => {
        const goal = goalEditData[goalId];
        const originalGoal = goalData.find((g) => g.id === goalId);

        let updatedFields = {};

        // Iterate over all fields in goalEditData to check for changed values
        for (let key in goal) {
            if (goal[key] !== originalGoal[key]) {
                console.log(`Checking field: ${key}, Value: ${goal[key]}`);

                // Check if the field is a dropdown (e.g., departmentId, typeId, regionId)
                if (dropdownData[key]) {
                    console.log(`Dropdown data for ${key}:`, dropdownData[key]);

                    // If the field is a dropdown, find the matching option using 'data'
                    const selectedOption = dropdownData[key].find(option => option.data === goal[key]);

                    console.log(`Dropdown Key: ${key}, Field Value: ${goal[key]}, Selected Option:`, selectedOption);

                    if (selectedOption) {
                        // Save both the *Id and the name (data) to the updatedFields
                        updatedFields[key + 'Id'] = selectedOption.masterId;  // Save the *Id (e.g., regionId, typeId, departmentId)
                        updatedFields[key] = selectedOption.data;  // Save the name (e.g., "Dhule", "technical", "Electrical")
                    } else {
                        console.warn(`No matching option found for ${key} with value: ${goal[key]}`);
                    }
                } else {
                    // For non-dropdown fields, update the value as is
                    updatedFields[key] = goal[key];
                }
            }
        }

        console.log('Updated fields:', updatedFields);

        // Include the goal data in the request payload
        const payload = {
            ...updatedFields
        };

        console.log('Payload before sending:', payload);

        // If any fields are updated, send the request
        if (Object.keys(updatedFields).length > 0) {
            try {
                await axios.put(`http://${strings.localhost}/api/goalSetting/update/${goalId}`, payload);
                setEditingGoal((prevState) => ({ ...prevState, [goalId]: false }));
                showToast("Goal updated successfully.",'success');
                fetchData(); // Fetch data again to reflect changes
            } catch (error) {
                console.error('Error updating goal:', error);
            }
        } else {
            showToast("No changes detected. Please edit before updating.",'warn');
        }
    };



    const cancelEditGoal = (goalId) => {
        setEditingGoal((prevState) => ({
            ...prevState,
            [goalId]: false
        }));
        setGoalEditData((prevState) => ({
            ...prevState,
            [goalId]: {
                goal: goalData.find((g) => g.id === goalId).goal,
                goalDescription: goalData.find((g) => g.id === goalId).goalDescription,
                regionId: goalData.find((g) => g.id === goalId).regionId,
                typeId: goalData.find((g) => g.id === goalId).typeId,
                type: goalData.find((g) => g.id === goalId).type,
                departmentId: goalData.find((g) => g.id === goalId).departmentId,
                department: goalData.find((g) => g.id === goalId).department,
            }
        }));
    };

    const toggleEditGoal = (goalId) => {
        setEditingGoal((prevState) => ({
            ...prevState,
            [goalId]: !prevState[goalId]
        }));
        setGoalEditData((prevState) => ({
            ...prevState,
            [goalId]: {
                goal: goalData.find((g) => g.id === goalId).goal,
                goalDescription: goalData.find((g) => g.id === goalId).goalDescription,
                regionId: goalData.find((g) => g.id === goalId).regionId,
                typeId: goalData.find((g) => g.id === goalId).typeId,
                type: goalData.find((g) => g.id === goalId).type,
                departmentId: goalData.find((g) => g.id === goalId).departmentId,
                department: goalData.find((g) => g.id === goalId).department,
            }
        }));
    };
    const handleEditChange = (goalId, field, value, fieldType) => {
        console.log(`Editing goalId: ${goalId}, Field: ${field}, Value: ${value}, FieldType: ${fieldType}`);

        if (dropdownData[fieldType]) {
            // Find the selected option using the data (not the masterId)
            const selectedOption = dropdownData[fieldType].find(option => option.data === value);

            console.log("Found selectedOption:", selectedOption);

            if (selectedOption) {
                // Store the selected data value (department name, region, type) and masterId (ID) in goalEditData
                setGoalEditData(prevState => ({
                    ...prevState,
                    [goalId]: {
                        ...prevState[goalId],
                        [field]: selectedOption.data,
                        [`${field}Id`]: selectedOption.masterId,  // Save the 'masterId' (e.g., 93, 102)
                    }
                }));
            }
        } else {
            // For non-dropdown fields, update the value as is
            setGoalEditData(prevState => ({
                ...prevState,
                [goalId]: {
                    ...prevState[goalId],
                    [field]: value,  // Directly update for non-dropdown fields
                }
            }));
        }
    };





    const handleKpiEditChange = (kpiId, value) => {
        console.log(`Editing KPI: ${kpiId}, New Value: ${value}`);
        setKpiEditData((prevState) => ({
            ...prevState,
            [kpiId]: value
        }));
    };

    const updateKpi = async (kpiId) => {
        const kpi = kpiEditData[kpiId];
        const originalKpi = kpiData.find((k) => k.id === kpiId);

        let updatedFields = {};

        if (kpi !== originalKpi.kpi) {
            updatedFields.kpi = kpi;
        }

        if (Object.keys(updatedFields).length > 0) {
            try {
                await axios.put(`http://${strings.localhost}/api/kpi/update/${kpiId}`, updatedFields);
                setEditingKpi((prevState) => ({ ...prevState, [kpiId]: false }));
                showToast("KPI updated successfully.",'success');
                fetchData();
            } catch (error) {
                console.error('Error updating KPI:', error);
            }
        } else {
            showToast("No changes detected. Please edit before updating.",'warn');
        }
    };

    const cancelEditKpi = (kpiId) => {
        setEditingKpi((prevState) => ({
            ...prevState,
            [kpiId]: false
        }));
        setKpiEditData((prevState) => ({
            ...prevState,
            [kpiId]: kpiData.find((k) => k.id === kpiId).kpi
        }));
    };

    const toggleEditKpi = (kpiId) => {
        setEditingKpi((prevState) => ({
            ...prevState,
            [kpiId]: !prevState[kpiId]
        }));
        setKpiEditData((prevState) => ({
            ...prevState,
            [kpiId]: kpiData.find((k) => k.id === kpiId).kpi
        }));
    };

    const handleBack =() => {
        navigate(`/Team`);
    }
    return (
        <div className="coreContainer">
           
            <div className="year-select-container">
                <div className="year-select">
                    <label htmlFor="year">Select Year: </label>
                    <select id="year" value={year} onChange={handleYearChange}>
                        {[...Array(11)].map((_, i) => {
                            const yearOption = new Date().getFullYear() - 5 + i;
                            return <option key={yearOption} value={yearOption}>{yearOption}</option>;
                        })}
                    </select>
                </div>
            </div>



            {/* Goal View Table */}
            <div>
                <div className="underlineText" style={{textAlign:'center'}}>Goals for {year}</div>
                <table className="goal-table">
                    <thead>
                        <tr>
                            <th>Index</th>
                            <th>Goal</th>
                            <th>Region</th>
                            <th>Type</th>
                            <th>Department</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {goalData.map((goal, index) => (
                            <tr key={goal.id}>
                                <td>{index + 1}</td>
                                <td>{editingGoal[goal.id] ? (
                                    <input
                                    
                                        type="text"
                                        value={goalEditData[goal.id]?.goal || goal.goal}
                                        onChange={(e) => handleEditChange(goal.id, 'goal', e.target.value)}
                                    />
                                ) : goal.goal}</td>
                                {/* <td>{editingGoal[goal.id] ? (
                                    <input
                                        type="text"
                                        value={goalEditData[goal.id]?.goalDescription || goal.goalDescription}
                                        onChange={(e) => handleEditChange(goal.id, 'goalDescription', e.target.value)}
                                    />
                                ) : goal.goalDescription}</td> */}
                                <td>{editingGoal[goal.id] ? (
                                    <select
                                    className='selectIM'
                                        value={goalEditData[goal.id]?.region || goal.region} 
                                        onChange={(e) => handleEditChange(goal.id, 'region', e.target.value, 'region')}
                                    >
                                        {dropdownData.region.map((option) => (
                                            <option key={option.masterId} value={option.data}> 
                                                {option.data}
                                            </option>
                                        ))}
                                    </select>
                                ) : goal.region}</td>



                                <td>{editingGoal[goal.id] ? (
                                    <select
                                    className='selectIM'
                                        value={goalEditData[goal.id]?.type || goal.type}  
                                        onChange={(e) => handleEditChange(goal.id, 'type', e.target.value, 'typeofGoal')}
                                    >
                                        {dropdownData.typeofGoal.map((option) => (
                                            <option key={option.masterId} value={option.data}> 
                                                {option.data}
                                            </option>
                                        ))}
                                    </select>
                                ) : goal.type}</td>


                                <td>{editingGoal[goal.id] ? (
                                    <select
                                    className='selectIM'
                                        value={goalEditData[goal.id]?.department || goal.department}  
                                        onChange={(e) => handleEditChange(goal.id, 'department', e.target.value, 'department')}
                                    >
                                        {dropdownData.department.map((option) => (
                                            <option key={option.masterId} value={option.data}>  
                                                {option.data}
                                            </option>
                                        ))}
                                    </select>
                                ) : goal.department}</td>


                                <td>
                                    {editingGoal[goal.id] ? (
                                        <>
                                        
                                            <button type='button' className='btn' onClick={() => updateGoal(goal.id)}>Update</button>
                                            <button type='button' className='outline-btn' onClick={() => cancelEditGoal(goal.id)}>Cancel</button>
                                        </>
                                    ) : (
                                        !goal.employeeApproval ? (
                                             <button type='button' className='textbutton' onClick={() => toggleEditGoal(goal.id)}>Edit</button>
                                        ):(
                                          <span className='error-message'>Employee Approved - Not Editable</span>
                                        )
                                            )}
                                       
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* KPI View Table */}
            <div>
                <div className="underlineText" style={{textAlign:'center'}}>KPIs for {year}</div>
                <table className="goal-table">
                    <thead>
                        <tr>
                            <th>KPI</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kpiData.map((kpi) => (
                            <tr key={kpi.id}>
                                <td>{editingKpi[kpi.id] ? (
                                    <input
                                        type="text"
                                        value={kpiEditData[kpi.id] || kpi.kpi}
                                        onChange={(e) => handleKpiEditChange(kpi.id, e.target.value)}
                                    />
                                ) : kpi.kpi}</td>
                                <td>
                                    {editingKpi[kpi.id] ? (
                                        <>
                                            <button type='button' className='btn' onClick={() => updateKpi(kpi.id)}>Update</button>
                                            <button type='button' className='outline-btn' onClick={() => cancelEditKpi(kpi.id)}>Cancel</button>
                                        </>
                                    ) : (
                                        !kpi.employeeApproval ?(

                                         <button type='button' className='textbutton' onClick={() => toggleEditKpi(kpi.id)}>Edit</button>
                                        ):(
                                            <span className='error-message'>Employee Approved - Not Editable</span>

                                        )
                                        )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='form-controls' style={{marginRight:'50px'}}>
              <button type='button' className='outline-btn' onClick={handleBack}>Back</button>
            </div>
        </div>
    );
};

export default ManagerView;
