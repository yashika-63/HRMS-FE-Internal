import React, { useState, useEffect } from 'react';
import { fetchDataByKey, showToast } from '../../../Api.jsx';
import '../../CommonCss/organizationalGoal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { strings } from '../../../string';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrganizationalGoal = () => {
    const [goals, setGoals] = useState([{ goal: '' }]);
    const [viewMode, setViewMode] = useState(true);
    const companyId = localStorage.getItem("companyId");
    const [fetchStatus, setFetchStatus] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [dropdownData, setDropdownData] = useState({
        department: [],
        region: [],
        goalLevel: [],
        typeofGoal: []
    });
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [goalType, setGoalType] = useState(true);
    const [type, setType] = useState(true);
    const [goalToUpdate, setGoalToUpdate] = useState(null);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const department = await fetchDataByKey('department');
                const region = await fetchDataByKey('region');
                const goalLevel = await fetchDataByKey('goalLevel');
                const typeofGoal = await fetchDataByKey('typeofGoal');
                setDropdownData({ department, region, goalLevel, typeofGoal });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };

        fetchDropdownData();
    }, []);



    useEffect(() => {
        if (viewMode) {
            fetchAllGoals();
        }
    }, [viewMode, companyId]);

    const fetchAllGoals = async () => {
        if (fetchStatus) return;

        try {
            const response = await axios.get(`http://${strings.localhost}/api/goalSetting/organization/getByCompany/${companyId}`);
            setGoals(response.data);
            showToast('Goals fetched successfully.', 'success');
            setFetchStatus('success');
        } catch (error) {
            console.error('Error fetching goals:', error);
            showToast('Failed to fetch goals.', 'error');
            setFetchStatus('error');
        }
    };

    const handleAddGoal = () => {
        setGoals([...goals, { goal: '' }]);
    };

    const handleRemoveGoal = (index) => {
        const updatedGoals = goals.filter((_, i) => i !== index);
        setGoals(updatedGoals);
    };

    const handleGoalChange = (index, event) => {
        const newGoals = goals.map((goal, i) => {
            if (i === index) {
                return { ...goal, goal: event.target.value };
            }
            return goal;
        });
        setGoals(newGoals);
    };

    const handleSave = async () => {
        const nonEmptyGoals = goals.filter(goal => goal.goal.trim() !== '');
        // if (
        //     (!selectedDepartment && selectedDepartment !== null) ||
        //     (!selectedRegion && selectedRegion !== null) ||
        //     (!selectedLevel && selectedLevel !== null) ||
        //     (!goalType && goalType !== null) ||
        //     (!selectedType && selectedType !== null) ||
        //     !dropdownData.date
        // ) {
        //     showToast('Please fill all the required fields.','error');
        //     return;
        // }
        if (nonEmptyGoals.length === goals.length) {
            const requestData = {
                levelCode: selectedLevel?.masterId || 0,
                level: selectedLevel?.data || '',
                regionId: selectedRegion?.masterId || 0,
                region: selectedRegion?.data || '',
                departmentId: selectedDepartment?.masterId || 0,
                department: selectedDepartment?.data || '',
                type: selectedType?.data || '',
                typeId: selectedType?.masterId || 0,
                goalType,
                orgenizOrganizationGoalSettingDetails: nonEmptyGoals.map(goal => ({
                    goal: goal.goal
                }))
            };

            try {
                const response = await axios.post(
                    `http://${strings.localhost}/api/goalSetting/organization/save/${companyId}`,
                    requestData
                );
                showToast('Goals saved successfully', 'success');
                setViewMode(true);
                fetchAllGoals();
                setShowModal(false);
            } catch (error) {
                console.error('Error saving data:', error);
                showToast('Failed to save goals', 'error');
            }
        } else {
            showToast('Please remove blank goals or add a value to them before saving.', 'error');
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };
    const handleEditGoal = (goalData) => {
        console.log("Editing goal:", goalData);

        setGoalToUpdate({
            goalData,
            goalDetail: Array.isArray(goalData.orgenizOrganizationGoalSettingDetails)
                ? goalData.orgenizOrganizationGoalSettingDetails
                : [],
        });

        setSelectedLevel({
            masterId: goalData.levelCode,
            data: goalData.level,
        });

        setSelectedRegion({
            masterId: goalData.regionId,
            data: goalData.region,
        });

        setSelectedDepartment({
            masterId: goalData.departmentId,
            data: goalData.department,
        });
        setSelectedType({
            masterId: goalData.typeId,
            data: goalData.type,
        });
        // setSelectedType(goalData.type);
        setGoalType(goalData.goalType);
        setUpdateModalVisible(true);
        console.log("modal visibilt should be true now ");
    };


    const handleUpdateAddGoal = () => {
        setGoalToUpdate((prevGoalToUpdate) => ({
            ...prevGoalToUpdate,
            goalDetail: [
                ...prevGoalToUpdate.goalDetail,
                { id: null, goal: '' },
            ],
        }));
    };

    const handleUpdateRemoveGoal = (index) => {
        setGoalToUpdate((prevGoalToUpdate) => {
            const updatedGoals = [...prevGoalToUpdate.goalDetail];
            updatedGoals.splice(index, 1);
            return {
                ...prevGoalToUpdate,
                goalDetail: updatedGoals,
            };
        });
    };

    const handleUpdateGoalChange = (index, event) => {
        const updatedGoal = event.target.value;
        setGoalToUpdate((prevGoalToUpdate) => {
            const updatedGoals = [...prevGoalToUpdate.goalDetail];
            updatedGoals[index] = { ...updatedGoals[index], goal: updatedGoal };
            return {
                ...prevGoalToUpdate,
                goalDetail: updatedGoals,
            };
        });
    };

    // const handleUpdateField = (field, value) => {
    //     setGoalToUpdate((prevGoalToUpdate) => {
    //         if (field === 'goal') {
    //             const updatedGoalDetail = prevGoalToUpdate.goalDetail.map((goal, index) => {
    //                 if (index === prevGoalToUpdate.goalDetailIndex) {  
    //                     return { ...goal, goal: value };  
    //                 }
    //                 return goal;  
    //             });

    //             return {
    //                 ...prevGoalToUpdate,
    //                 goalDetail: updatedGoalDetail,  
    //             };
    //         } else {
    //             return {
    //                 ...prevGoalToUpdate,
    //                 goalData: {
    //                     ...prevGoalToUpdate.goalData,
    //                     [field]: value,  
    //                 },
    //             };
    //         }
    //     });
    // };
    const handleUpdateField = (field, value) => {
        setGoalToUpdate((prevGoalToUpdate) => {
            // Check if the field belongs to goalDetail
            if (prevGoalToUpdate.goalDetail.some(goal => goal.hasOwnProperty(field))) {
                const updatedGoalDetail = prevGoalToUpdate.goalDetail.map((goal, index) => {
                    if (index === prevGoalToUpdate.goalDetailIndex) {
                        return { ...goal, [field]: value };  // Dynamically update the field in goalDetail
                    }
                    return goal;
                });

                return {
                    ...prevGoalToUpdate,
                    goalDetail: updatedGoalDetail,
                };
            } else {
                return {
                    ...prevGoalToUpdate,
                    goalData: {
                        ...prevGoalToUpdate.goalData,
                        [field]: value,
                    },
                };
            }
        });
    };

    const handleUpdateGoal = async () => {
        try {
            console.log("Goal to update:", goalToUpdate);
            const updatedGoalData = goalToUpdate.goalData;
            const updatedGoalDetail = goalToUpdate.goalDetail;

            const requestData = {
                levelCode: selectedLevel?.masterId || 0,
                level: selectedLevel?.data || '',
                regionId: selectedRegion?.masterId || 0,
                region: selectedRegion?.data || '',
                departmentId: selectedDepartment?.masterId || 0,
                department: selectedDepartment?.data || '',
                goalType: updatedGoalData.goalType,
                tyoe: updatedGoalData?.typeofGoal || '',
                typeId: updatedGoalData?.masterId || 0,
                date: updatedGoalData.date,
                orgenizOrganizationGoalSettingDetails: updatedGoalDetail.map(goal => ({
                    goal: goal.goal,
                })),

            };
            const goalIdToUpdate = goalToUpdate.goalData.id;
            console.log("Updating goal with ID:", goalIdToUpdate);
            const response = await axios.put(
                `http://${strings.localhost}/api/goalSetting/organization/update/${goalIdToUpdate}`,
                requestData
            );

            if (response.status === 200) {
                showToast('Goal updated successfully', 'success');
                setUpdateModalVisible(false);
                window.location.reload();
            } else {
                showToast('Failed to update goal.', 'error');
            }
        } catch (error) {
            console.error('Error updating goal:', error);
            showToast('Failed to update goal.', 'error');
        }
    };

    const closeUpdateModal = () => {
        setUpdateModalVisible(false);
    };

    return (
        <div>
            {viewMode ? (
                <div className='goal-table-container'>
                    <div className="form-controls">
                        <button type="button" onClick={() => setShowModal(true)} className="btn"> Add Goal </button>
                    </div>
                    <table className="Goal-table">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>Department</th>
                                <th style={{ width: '10%' }}>Region</th>
                                <th style={{ width: '10%' }}>Level</th>
                                <th>Goals</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {goals.map((goalData, index) => (
                                <tr key={goalData.id}>
                                    <td>{goalData.department}</td>
                                    <td>{goalData.region}</td>
                                    <td>{goalData.level}</td>
                                    <td>
                                        <ul>
                                            {Array.isArray(goalData.orgenizOrganizationGoalSettingDetails) &&
                                                goalData.orgenizOrganizationGoalSettingDetails.length > 0
                                                ? goalData.orgenizOrganizationGoalSettingDetails.map((goalDetail) => (
                                                    <li key={goalDetail.id}>
                                                        {goalDetail.goal}

                                                    </li>
                                                ))
                                                : <ul>No goals available</ul>}
                                        </ul>
                                    </td>
                                    <td>
                                        {goalData.orgenizOrganizationGoalSettingDetails && goalData.orgenizOrganizationGoalSettingDetails.length > 0 &&
                                            <button type='button' className='textbutton' onClick={() => handleEditGoal(goalData)}>Update</button>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">

                        <div className='title'>Organizational Goal Setting</div>
                        <div className="modal-header">
                            <button type='button' className="close-btn" onClick={closeModal}>X</button>
                        </div>
                        <div className="modal-body">
                            <div className="input-row">
                                <div>
                                    <span className='required-marker'>*</span>
                                    <label>Department</label>
                                    <select
                                        className='selectOption'
                                        value={selectedDepartment?.masterId || ''}
                                        onChange={(e) =>
                                            setSelectedDepartment(
                                                dropdownData.department.find((d) => d.masterId === parseInt(e.target.value))
                                            )
                                        } required
                                    >
                                        <option value="" disabled>Select Department</option>
                                        {dropdownData.department.map((item) => (
                                            <option key={item.masterId} value={item.masterId}>
                                                {item.data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <span className='required-marker'>*</span>
                                    <label>Region</label>
                                    <select
                                        className='selectOption'
                                        value={selectedRegion?.masterId || ''}
                                        onChange={(e) =>
                                            setSelectedRegion(
                                                dropdownData.region.find((r) => r.masterId === parseInt(e.target.value))
                                            )
                                        }
                                        required
                                    >
                                        <option value="" disabled>Select Region</option>
                                        {dropdownData.region.map((item) => (
                                            <option key={item.masterId} value={item.masterId}>
                                                {item.data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <span className='required-marker'>*</span>
                                    <label>Level</label>
                                    <select
                                        className='selectOption'
                                        value={selectedLevel?.masterId || ''}
                                        onChange={(e) =>
                                            setSelectedLevel(
                                                dropdownData.goalLevel.find((l) => l.masterId === parseInt(e.target.value))
                                            )
                                        }
                                        required
                                    >
                                        <option value="" disabled>Select Level</option>
                                        {dropdownData.goalLevel.map((item) => (
                                            <option key={item.masterId} value={item.masterId}>
                                                {item.data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* <div>
                                    <span className='required-marker'>*</span>
                                    <label>Created Date</label>
                                    <input
                                        className='selectOption'
                                        type="date"
                                        value={dropdownData.date}
                                        onChange={(e) => setDropdownData({ ...dropdownData, date: e.target.value })}
                                        required
                                    />
                                </div> */}
                                <div>
                                    <span className='required-marker'>*</span>
                                    <label>Goal Type</label>
                                    <select  className='selectOption' onChange={(e) => setGoalType(e.target.value === 'false')} required>
                                        <option value='' disabled>Select Goal Type</option>
                                        <option value="true">Personal</option>
                                        <option value="false">Organizational</option>
                                    </select>
                                </div>
                                <div>
                                    <span className='required-marker'>*</span>
                                    <label>Type</label>
                                    <select
                                    className='selectOption'
                                        value={selectedType?.masterId || ''}
                                        onChange={(e) =>
                                            setSelectedType(
                                                dropdownData.typeofGoal.find((l) => l.masterId === parseInt(e.target.value))
                                            )
                                        }
                                        required
                                    >
                                        <option value="" disabled>Select Type</option>
                                        {dropdownData.typeofGoal.map((item) => (
                                            <option key={item.masterId} value={item.masterId}>
                                                {item.data}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="organizational-goal-container">
                                <div className="goal-inputs">
                                    <div className="stickyHeading">Goals</div>
                                    {goals.map((goal, index) => (
                                        <div key={index} className="goal-row">
                                            <span className="serial-number">{index + 1}.</span>
                                            <FontAwesomeIcon icon={faBullseye} className="goal-icon" />
                                            <input
                                                value={goal.goal}
                                                onChange={(event) => handleGoalChange(index, event)}
                                                placeholder="Enter goal"
                                                className="goal-input"
                                            />
                                            <button
                                                type="button"
                                                className="cross-btn"
                                                onClick={() => handleRemoveGoal(index)}
                                            >
                                                &#10005;
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" className="btn" onClick={handleAddGoal}>+</button>
                                </div>
                            </div>
                            <div className='btnContainer'>
                                <button
                                    type='button'
                                    className="btn"
                                    onClick={handleSave} >
                                    Save
                                </button>

                                <button type='button' className="outline-btn" onClick={closeModal}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {updateModalVisible && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="title">Update Goal</div>
                        <div className="modal-header">
                            <button type="button" className="close-btn" onClick={closeUpdateModal}>X</button>
                        </div>
                        <div className="modal-body">
                            <div className="input-row">
                                <div>
                                    <label>Department</label>
                                    <input
                                        value={goalToUpdate?.goalData?.department || ''}
                                        onChange={(e) => handleUpdateField('department', e.target.value)} readOnly className='readonly' >
                                    </input>
                                </div>
                                <div>
                                    <label>Region</label>
                                    <input
                                        value={goalToUpdate?.goalData?.region || ''}
                                        onChange={(e) => handleUpdateField('region', e.target.value)} readOnly className='readonly' >

                                    </input>
                                </div>
                                <div>
                                    <label>Level</label>
                                    <input
                                        value={goalToUpdate?.goalData?.level || ''}
                                        onChange={(e) => handleUpdateField('level', e.target.value)} readOnly className='readonly' >

                                    </input>
                                </div>
                                <div>
                                    <label>Date</label>
                                    <input
                                        className="readonly"
                                        type="date"
                                        value={goalToUpdate?.goalData?.date || ''}
                                        readOnly

                                    />

                                </div>

                                <div>
                                    <label>Goal Type</label>
                                    <input
                                        value={goalToUpdate?.goalData?.goalType ? 'True' : 'False'}
                                        onChange={(e) => handleUpdateField('goalType', e.target.value === 'true' ? true : false)}
                                        readOnly className='readonly'
                                    >

                                    </input>
                                </div>

                                <div>
                                    <label>Type</label>
                                    <input
                                        value={goalToUpdate?.goalData?.type || ''}
                                        onChange={(e) => handleUpdateField('type', e.target.value)} readOnly className='readonly'>

                                    </input>
                                </div>

                            </div>

                            <div className="organizational-goal-container">
                                <div className="goal-inputs">
                                    <div className="stickyHeading">Goals</div>
                                    {Array.isArray(goalToUpdate?.goalDetail) && goalToUpdate?.goalDetail.map((goal, index) => (

                                        <div key={index} className="goal-row">
                                            <span className="serial-number">{index + 1}.</span>
                                            <FontAwesomeIcon icon={faBullseye} className="goal-icon" />
                                            <input
                                                value={goal.goal}
                                                onChange={(event) => handleUpdateGoalChange(index, event)}
                                                placeholder="Enter goal"
                                                className="goal-input"
                                            />
                                            <button
                                                type="button"
                                                className="cross-btn"
                                                onClick={() => handleUpdateRemoveGoal(index)}
                                            >
                                                &#10005;
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" className="btn" onClick={handleUpdateAddGoal}>+</button>
                                </div>
                            </div>
                            <div className="btnContainer">
                                <button type="button" className="btn" onClick={handleUpdateGoal}>Save Changes</button>
                                <button type="button" className="outline-btn" onClick={closeUpdateModal}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
export default OrganizationalGoal;

