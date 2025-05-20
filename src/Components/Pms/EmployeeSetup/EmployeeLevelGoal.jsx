import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchDataByKey, showToast } from '../../../Api.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import { strings } from '../../../string';
import { FaBuilding, FaSearch, FaUserTie } from 'react-icons/fa';

const EmployeeLevelGoal = () => {
    const [employeeConfig, setEmployeeConfig] = useState(null);
    const [combinedGoals, setCombinedGoals] = useState([]); // State for all goals (fetched + new popup goals)
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingInConfirmation, setLoadingInConfirmation] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [reportingManagerId, setReportingManagerId] = useState(null);
    const [dropdownData, setDropdownData] = useState({
        region: [],
        typeofGoal: [],
        level: [],
        department: []
    });
    const [newGoal, setNewGoal] = useState({
        goal: '',
        regionId: '',
        levelCode: '',
        goalType: '',
        typeofGoal: '',
        departmentId: ''
    });

    const companyId = localStorage.getItem("companyId");
    const { id: employeeId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployeeConfig = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/employee-config/employee/${employeeId}`);
                const { departmentId, levelCode, typeId, regionId, reportingManager } = response.data[0];
                setEmployeeConfig({ departmentId, levelId: levelCode, typeId, regionId, reportingManager });
                setReportingManagerId(reportingManager.id);
            } catch (error) {
                console.error('Error fetching employee config:', error);
            }
        };

        fetchEmployeeConfig();
    }, [employeeId]);


    useEffect(() => {
        const fetchData = async () => {
            if (employeeConfig) {
                const { departmentId, levelId, typeId, regionId } = employeeConfig;
                try {
                    const [goalsResponse, additionalGoalsResponse] = await Promise.all([
                        axios.get(
                            `http://${strings.localhost}/api/goalSetting/organization/getByFiltersNew?companyId=${companyId}&status=true&departmentId=${departmentId}&levelId=${levelId}&regionId=${regionId}&typeCode=${typeId}`
                        ),
                        axios.get(
                            `http://${strings.localhost}/api/goalSetting/getGoals?regionId=${regionId}&employeeId=${reportingManagerId}&departmentId=${departmentId}&goalType=true`
                        )
                    ]);

                    // Add source to the goals and log them
                    const goalsWithSource = goalsResponse.data.map(goal => ({
                        ...goal,
                        source: 'api1' // Source for the first API
                    }));

                    const additionalGoalsWithSource = additionalGoalsResponse.data.map(goal => ({
                        ...goal,
                        source: 'api2' // Source for the second API
                    }));

                    const combined = [...goalsWithSource, ...additionalGoalsWithSource];

                    console.log("Combined Goals: ", combined); // Log combined goals to verify

                    setCombinedGoals(combined);

                } catch (error) {
                    console.error('Error fetching goals:', error);
                }
            }
        };

        fetchData();
    }, [employeeConfig, companyId, reportingManagerId]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const region = await fetchDataByKey('region');
                const type = await fetchDataByKey('typeofGoal');
                const level = await fetchDataByKey('level');
                const department = await fetchDataByKey('department');

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

        fetchDropdownData();
    }, []);

    const handleAddGoal = () => {
        // Create a new goal object with the selected dropdown values
        const newGoalData = {
            ...newGoal,
            region: dropdownData.region.find((region) => region.masterId === newGoal.regionId)?.data,
            level: dropdownData.level.find((level) => level.masterId === newGoal.levelCode)?.data,
            goalType: newGoal.goalType, // 'Organizational' or 'Personal'
            goal: newGoal.goal, // the goal name
            type: dropdownData.typeofGoal.find((type) => type.masterId === newGoal.typeofGoal)?.data,
            department: dropdownData.department.find((dept) => dept.masterId === newGoal.departmentId)?.data,
            isSelected: false, // Initially unchecked
            regionData: newGoal.regionId,  // Store the selected regionId (masterId)
            levelData: newGoal.levelCode,  // Store the selected levelCode (masterId)
            typeofGoalData: newGoal.typeofGoal,  // Store the selected goalType (masterId)
            departmentData: newGoal.departmentId,  // Store the selected departmentId (masterId)
        };

        // Add the new goal to the combinedGoals array
        setCombinedGoals((prevGoals) => [...prevGoals, newGoalData]);

        // Reset the form for adding a new goal
        setNewGoal({
            goal: '',
            regionId: '',
            levelCode: '',
            goalType: 'Organizational',
            typeofGoal: '',
            departmentId: '',
            region: '',
            department: ''
        });
    };

    const handleSaveInConfirmation = async () => {
        setLoadingInConfirmation(true);  // Start loading spinner    
        try {
            await handleSaveGoals();
        } catch (error) {
            showToast('Failed to save KPIs', 'error');
        } finally {
            setLoadingInConfirmation(false);  // Stop the spinner after saving
            setShowConfirmation(false);  // Close the confirmation modal
        }
    };



    const handlePopupGoalChange = (e) => {
        const { name, value } = e.target;
        setNewGoal({
            ...newGoal,
            [name]: value
        });
    };

    const handleGoalChange = (index, e) => {
        const { name, value } = e.target;
        const updatedGoals = [...combinedGoals];

        // Update the goal item based on the dropdown name
        if (name === 'region') {
            updatedGoals[index] = {
                ...updatedGoals[index],
                region: value,  // Directly update the region data
                regionId: dropdownData.region.find((region) => region.data === value)?.masterId // Store masterId
            };
        } else if (name === 'goalType') {
            // Convert the goalType to a boolean
            updatedGoals[index] = {
                ...updatedGoals[index],
                goalType: value === 'Organizational' ? true : false,  // Convert "Organizational" to true, "Personal" to false
            };
        } else if (name === 'type') {
            updatedGoals[index] = {
                ...updatedGoals[index],
                type: value,  // Update type
                typeId: dropdownData.typeofGoal.find((type) => type.data === value)?.masterId // Store masterId
            };
        } else if (name === 'department') {
            updatedGoals[index] = {
                ...updatedGoals[index],
                department: value,  // Update department
                departmentId: dropdownData.department.find((dept) => dept.data === value)?.masterId // Store masterId
            };
        }

        // Update the state with the modified goals array
        setCombinedGoals(updatedGoals);
    };



    const handleCheckboxChange = (e, index) => {
        const updatedGoals = [...combinedGoals];
        updatedGoals[index] = {
            ...updatedGoals[index],
            isSelected: e.target.checked
        };
        setCombinedGoals(updatedGoals);
    };

    const handleSaveGoals = async () => {
        setLoading(true);
        const selectedGoals = combinedGoals.filter(goal => goal.isSelected); // Only selected goals
        if (selectedGoals.length === 0) {
            showToast("Please select at least one goal before saving.", 'warn');
            return;
        }

        const payload = selectedGoals.map(goal => ({
            goal: goal.goal,
            regionId: goal.regionId,
            region: goal.region,
            typeId: goal.typeId,
            type: goal.type,
            departmentId: goal.departmentId,
            department: goal.department,
            goalType: goal.goalType
        }));

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/goalSetting/saveMultiple/${employeeId}/${reportingManagerId}`,
                payload
            );

            if (response.data) {
                showToast("Goals saved successfully", 'success');
            } else {
                showToast("Failed to save goals. Please try again.", 'error');
            }
        } catch (error) {
            console.error("Error saving goals:", error);
            showToast("An error occurred while saving goals.", 'error');
        }
        finally {
            setLoading(false);
        }
    };


    const handleBack = () => {
        navigate(`/Team`);
    };
    return (
        <div className="Attendance-table-container">
            {showPopup && (
                <div className="add-popup">
                    <h3 className='underlineText' style={{ textAlign: 'center' }}>Add New Goal</h3>
                    <div className="popup-form">
                        <input
                            type="text"
                            name="goal"
                            placeholder="Enter Goal"
                            value={newGoal.goal}
                            onChange={handlePopupGoalChange}
                        />
                        {/* <select name="regionId" value={newGoal.regionId} onChange={handlePopupGoalChange}>
                            <option value="">Select Region</option>
                            {dropdownData.region.map((option) => (
                                <option key={option.masterId} value={option.masterId}>
                                    {option.data}
                                </option>
                            ))}
                        </select> */}

                        {/* <select name="levelCode" value={newGoal.levelCode} onChange={handlePopupGoalChange}>
                            <option value="">Select Level</option>
                            {dropdownData.level.map((option) => (
                                <option key={option.masterId} value={option.masterId}>
                                    {option.data}
                                </option>
                            ))}
                        </select>

                        <select name="goalType" value={newGoal.goalType} onChange={handlePopupGoalChange}>
                            <option value="Organizational">Organizational</option>
                            <option value="Personal">Personal</option>
                        </select>

                        <select name="typeofGoal" value={newGoal.typeofGoal} onChange={handlePopupGoalChange}>
                            <option value="">Select Goal Type</option>
                            {dropdownData.typeofGoal.map((option) => (
                                <option key={option.masterId} value={option.masterId}>
                                    {option.data}
                                </option>
                            ))}
                        </select>

                        <select name="departmentId" value={newGoal.departmentId} onChange={handlePopupGoalChange}>
                            <option value="">Select Department</option>
                            {dropdownData.department.map((option) => (
                                <option key={option.masterId} value={option.masterId}>
                                    {option.data}
                                </option>
                            ))}
                        </select> */}

                        <div className='btnContainer'>
                            <button type='button' className='btn' onClick={handleAddGoal}>Add Goal</button>
                            <button type='button' className='outline-btn' onClick={() => setShowPopup(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            <div className='form-controls' style={{ marginRight: '50px' }}>
                <button type='button' className="btn" onClick={() => setShowPopup(true)}> Add Goal </button>
            </div>
            <table className="Attendance-table">
                <thead>
                    <tr>
                        <th>Goal</th>
                        <th>Region</th>
                        <th>Goal Type</th>
                        <th>Type</th>
                        <th>Department</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {combinedGoals.map((goalItem, index) => {
                        console.log(`Goal ${index} Source: `, goalItem.source)
                        return (
                            <tr key={index}>
                                <td>
                                    <div className='goalIcon'>
                                        {goalItem.source === 'api1' ? (
                                            <FaBuilding className='orgIcon'/>
                                        ) : goalItem.source === 'api2' ? (
                                            <FaUserTie  className='orgIcon2'/>
                                        ) : null}
                                   
                                    <div style={{textAlign:'center'}}>{goalItem.goal}</div>
                                    </div>
                                </td>
                                <td>
                                    <select
                                        name="region"
                                        value={goalItem.region}
                                        onChange={(e) => handleGoalChange(index, e)}
                                    >
                                        <option value="">Select Region</option>
                                        {dropdownData.region.map((option) => (
                                            <option key={option.masterId} value={option.data}>
                                                {option.data}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                {/* <td>
                                <select
                                    name="level"
                                    value={goalItem.level} 
                                    onChange={(e) => handleGoalChange(index, e)} 
                                >
                                    <option value="">Select Level</option>
                                    {dropdownData.level.map((option) => (
                                        <option key={option.masterId} value={option.data}>
                                            {option.data}
                                        </option>
                                    ))}
                                </select>
                            </td> */}

                                <td>
                                    <select
                                        name="goalType"
                                        value={goalItem.goalType ? 'Organizational' : 'Personal'}
                                        onChange={(e) => handleGoalChange(index, e)}
                                    >
                                        <option value="Organizational">Organizational</option>
                                        <option value="Personal">Personal</option>
                                    </select>
                                </td>

                                <td>
                                    <select
                                        name="type"
                                        value={goalItem.type}
                                        onChange={(e) => handleGoalChange(index, e)}
                                    >
                                        <option value="">Select Type</option>
                                        {dropdownData.typeofGoal.map((option) => (
                                            <option key={option.masterId} value={option.data}>
                                                {option.data}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                <td>
                                    <select
                                        name="department"
                                        value={goalItem.department}
                                        onChange={(e) => handleGoalChange(index, e)}
                                    >
                                        <option value="">Select Department</option>
                                        {dropdownData.department.map((option) => (
                                            <option key={option.masterId} value={option.data}>
                                                {option.data}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                <td>
                                    <input
                                        type="checkbox"
                                        checked={goalItem.isSelected || false}
                                        onChange={(e) => handleCheckboxChange(e, index)}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className='form-controls' style={{ marginRight: '50px' }}>
                <button type='button' className='outline-btn' onClick={handleBack} >Back</button>
                <button type='button' className='btn' onClick={() => setShowConfirmation(true)} disabled={loading} > {loading ? 'Saving...' : 'Save Goals'}</button>
                {loading && <div className="loading-spinner"></div>}

            </div>
            {showConfirmation && (
                <div className="add-popup">
                    <p style={{ textAlign: 'center' }}>Are you sure you want to save the selected Goals?</p>
                    <div className="btnContainer">
                        <button
                            type="button"
                            className="btn"
                            onClick={handleSaveInConfirmation}
                            disabled={loadingInConfirmation}
                        >
                            {loadingInConfirmation ? 'Saving...' : 'Yes'}
                        </button>
                        {loadingInConfirmation && <div className="loading-spinner"></div>}
                        <button type="button" className="outline-btn" onClick={() => setShowConfirmation(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeLevelGoal;










































































































// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { fetchDataByKey } from '../../../Api.jsx';
// import { useParams } from 'react-router-dom';
// import { strings } from '../../../string';
// import { toast } from 'react-toastify';

// const EmployeeLevelGoal = () => {
//     const [employeeConfig, setEmployeeConfig] = useState(null);
//     const [goals, setGoals] = useState([]);
//     const [additionalGoals, setAdditionalGoals] = useState([]);
//     const [showConfirmation, setShowConfirmation] = useState(false);
//     const [modalGoals, setModalGoals] = useState([]);
//     const [selectedGoals, setSelectedGoals] = useState([]);
//     const [showAddGoalModal, setShowAddGoalModal] = useState(false);
//     const [reportingManagerId, setReportingManagerId] = useState(null);
//     const [checkedGoals, setCheckedGoals] = useState([]);
//     const companyId = localStorage.getItem("companyId");
//     const { id: employeeId } = useParams();
//     const [dropdownData, setDropdownData] = useState({
//         region: [],
//         typeofGoal: [],
//         level: [],
//         department: []
//     });
//     const [newGoal, setNewGoal] = useState({
//         goal: '',
//         regionId: '',
//         levelCode: '',
//         goalType: 'Personal',
//         typeOfGoal: '',
//         departmentId: '',
       
//     });
//     useEffect(() => {
//         const fetchEmployeeConfig = async () => {
//             try {
//                 const response = await axios.get(`http://${strings.localhost}/api/employee-config/employee/${employeeId}`);
//                 const { departmentId, levelCode, typeId, regionId, reportingManager } = response.data[0];
//                 setEmployeeConfig({ departmentId, levelId: levelCode, typeId, regionId });
//                 setReportingManagerId(reportingManager.id);
//             } catch (error) {
//                 console.error('Error fetching employee config:', error);
//             }
//         };

//         fetchEmployeeConfig();
//     }, [employeeId]);

//     useEffect(() => {
//         const fetchGoals = async () => {
//             if (employeeConfig) {
//                 const { departmentId, levelId, typeId, regionId } = employeeConfig;
//                 try {
//                     const response = await axios.get(
//                         `http://${strings.localhost}/api/goalSetting/organization/getByFilters/${companyId}/true/${departmentId}/${levelId}/${regionId}/${typeId}`
//                     );
//                     setGoals(response.data);
//                 } catch (error) {
//                     console.error('Error fetching goals:', error);
//                 }
//             }
//         };

//         fetchGoals();
//     }, [employeeConfig, companyId]);

//     useEffect(() => {
//         const fetchAdditionalGoals = async () => {
//             if (employeeConfig) {
//                 const { departmentId, regionId } = employeeConfig;
//                 try {
//                     const response = await axios.get(
//                         `http://${strings.localhost}/api/goalSetting/getGoals?regionId=${regionId}&employeeId=${reportingManagerId}&departmentId=${departmentId}&goalType=true`
//                     );
//                     setAdditionalGoals(response.data);
//                 } catch (error) {
//                     console.error('Error fetching additional goals:', error);
//                 }
//             }
//         };

//         fetchAdditionalGoals();
//     }, [employeeConfig]);

//     useEffect(() => {
//         const fetchDropdownData = async () => {
//             try {
//                 const region = await fetchDataByKey('region');
//                 const typeofGoal = await fetchDataByKey('typeofGoal');
//                 const level = await fetchDataByKey('level');
//                 const department = await fetchDataByKey('department');

//                 setDropdownData({
//                     region: region,
//                     typeofGoal: typeofGoal,
//                     level: level,
//                     department: department
//                 });
//             } catch (error) {
//                 console.error('Error fetching dropdown data:', error);
//             }
//         };

//         fetchDropdownData();
//     }, []);

//     const handleModalChange = (e, field) => {
//         const { value } = e.target;
//         setNewGoal(prevGoal => ({
//             ...prevGoal,
//             [field]: value
//         }));
//     };
//     const handleAddGoalToModal = () => {
//         if (!newGoal.goal.trim()) {
//             toast.warn("Goal cannot be empty.");
//             return;
//         }

//         const goalToAdd = {
//             ...newGoal,
//             id: Date.now(),
//         };
//         setModalGoals([...modalGoals, goalToAdd]);
//         setNewGoal({
//             goal: '',
//             regionId: '',
//             levelCode: '',
//             typeOfGoal: '',
//             departmentId: '',
            
//         });
//     };
//     const handleAddAllGoals = () => {
//         if (modalGoals.length === 0) {
//             toast.warn("Please add at least one goal.");
//             return;
//         }
//         const validGoals = modalGoals.filter(goal => goal.goal.trim() !== "");
//         if (validGoals.length === 0) {
//             toast.warn("No valid goals to add.");
//             return;
//         }
//         const newGoals = validGoals.filter(goal =>
//             !selectedGoals.some(existingGoal => existingGoal.id === goal.id)
//         );
//         setSelectedGoals(prevGoals => {
//             const updatedGoals = [...prevGoals, ...newGoals];
//             return updatedGoals;
//         });
//         setModalGoals([]);
//         setShowAddGoalModal(false);
//     };
//    const handleDropdownChange = (e, index, field) => {
//     const { value } = e.target;
//     setSelectedGoals((prevGoals) => {
//         const updatedGoals = [...prevGoals];

//         updatedGoals[index] = {
//             ...updatedGoals[index],
//             [field]: value,
//         };
//         console.log('Updated Goals after dropdown change:', updatedGoals);
//         return updatedGoals;
//     });
// };
// const handleCheckboxChange = (e, goal) => {
//     console.log("Checkbox checked:", e.target.checked, goal);

//     // Ensure we're working with selected (modified) goal data
//     const currentGoal = selectedGoals.find(item => item.id === goal.id);

//     if (e.target.checked) {
//         if (!currentGoal) return;  // Skip if the goal is not found in the selected goals

//         setCheckedGoals(prevGoals => {
//             const updatedGoal = {
//                 ...currentGoal,
//                 goal: currentGoal?.goal ?? "",
//                 regionId: currentGoal?.regionId ?? null,
//                 region: currentGoal?.region ?? "",
//                 typeId: currentGoal?.typeId ?? null,
//                 type: currentGoal?.type ?? "",
//                 departmentId: currentGoal?.departmentId ?? null,
//                 department: currentGoal?.department ?? "",
//                 goalType: currentGoal?.goalType ?? '',
//             };

//             const goalExists = prevGoals.some(existingGoal => existingGoal.goal === updatedGoal.goal);
//             if (!goalExists) {
//                 console.log("Adding goal to checkedGoals:", updatedGoal);
//                 return [...prevGoals, updatedGoal];
//             }

//             console.log("Goal already exists, not adding:", updatedGoal);
//             return prevGoals;  // Goal already checked, don't add again
//         });
//     } else {
//         setCheckedGoals(prevGoals => prevGoals.filter(existingGoal => existingGoal.goal !== goal.goal));
//     }
// };

// const handleSave = async () => {
//     if (checkedGoals.length === 0) {
//         toast.warn("Please select at least one goal before saving.");
//         return;
//     }

//     try {
//         // We're now using selectedGoals, which holds the current (modified) goal data
//         const payload = selectedGoals.map((goal) => {
//             const selectedDepartment = dropdownData?.department?.find(dep => dep.data === goal.department) || {};
//             const selectedRegion = dropdownData?.region?.find(reg => reg.data === goal.region) || {};
//             const selectedType = dropdownData?.typeofGoal?.find(typ => typ.data && goal.type && typ.data.toLowerCase() === goal.type.toLowerCase()) || {};

//             return {
//                 goal: goal.goal || "",
//                 regionId: selectedRegion?.masterId || null,
//                 region: selectedRegion?.data || "",
//                 typeId: selectedType?.masterId || null,
//                 type: selectedType?.data || "",
//                 departmentId: selectedDepartment?.masterId || null,
//                 department: selectedDepartment?.data || "",
//                 goalType: goal.goalType || '',
//             };
//         });

//         console.log("Formatted Data to be sent:", JSON.stringify(payload, null, 2));

//         const response = await axios.post(
//             `http://${strings.localhost}/api/goalSetting/saveMultiple/${employeeId}`,
//             payload  // Pass the payload directly (which now contains the current modified data)
//         );

//         if (response.status === 200) {
//             toast.success("Goals saved successfully!");
//             setCheckedGoals([]);  // Clear checked goals after save
//         } else {
//             toast.error("Failed to save goals. Please try again.");
//         }
//     } catch (error) {
//         console.error("Error saving goals:", error);
//         toast.error("An error occurred while saving goals.");
//     }
// };

//     const handleRemove = (goalId) => {
//         setModalGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
//     };

//     return (
//         <div className='Attendance-table-container'>
//             <table className='Attendance-table'>
//                 <thead>
//                     <tr>
//                         <th>Date</th>
//                         <th style={{ width: '30%' }}>Goal</th>
//                         <th>Region</th>
//                         <th>Level</th>
//                         <th>Goal Type</th>
//                         <th>Type</th>
//                         <th>Department</th>
//                         <th>Action</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {[...goals, ...additionalGoals, ...selectedGoals]
                      
//                         .map((goalItem, index) => (
//                             <tr key={index}>
//                                 <td>{goalItem?.date || 'N/A'}</td>
//                                 <td>{goalItem?.goal || 'N/A'}</td>
//                                 <td>
//                                     <select
//                                         value={selectedGoals[index]?.region || ''}
//                                         onChange={(e) => handleDropdownChange(e, index, 'region')}
//                                     >
//                                         {dropdownData.region.map(option => (
//                                             <option key={option.masterId} value={option.masterId}>
//                                                 {option.data}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </td>
//                                 <td>
//                                     <select
//                                         value={selectedGoals[index]?.levelCode || ''}
//                                         onChange={(e) => handleDropdownChange(e, index, 'levelCode')}
//                                     >
//                                         {dropdownData.level.map(option => (
//                                             <option key={option.masterId} value={option.masterId}>
//                                                 {option.data}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </td>
//                                 <td>
//                                     <select
//                                         value={selectedGoals[index]?.goalType || ''}
//                                         onChange={(e) => handleDropdownChange(e, index, 'goalType')}
//                                     >
//                                         <option value="true">Personal</option>
//                                         <option value="false">Organizational</option>
//                                     </select>
//                                 </td>
//                                 <td>
//                                     <select
//                                         value={selectedGoals[index]?.typeofGoal || ''}
//                                         onChange={(e) => handleDropdownChange(e, index, 'typeofGoal')}
//                                     >
//                                         {dropdownData.typeofGoal.map(option => (
//                                             <option key={option.masterId} value={option.masterId}>
//                                                 {option.data}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </td>
//                                 <td>
//                                     <select
//                                         value={selectedGoals[index]?.department || ''}
//                                         onChange={(e) => handleDropdownChange(e, index, 'department')}
//                                     >
//                                         {dropdownData.department.map(option => (
//                                             <option key={option.masterId} value={option.masterId}>
//                                                 {option.data}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </td>
//                                 <td>
//                                     <input
//                                         type="checkbox"
//                                         onChange={(e) => handleCheckboxChange(e, goalItem)}
//                                     />
//                                 </td>
//                             </tr>
//                         ))}
//                 </tbody>
//             </table>
//             <button type="button" className="btn" onClick={() => setShowAddGoalModal(true)}>+ Add Goal</button>
//             {showAddGoalModal && (
//                 <div className="modal-overlay">
//                     <div className="modal-content">
//                         <div className="form-group">
//                             <label>Goal</label>
//                             <input
//                                 type="text"
//                                 value={newGoal.goal}
//                                 onChange={(e) => handleModalChange(e, 'goal')}
//                             />
//                         </div>
//                         <div className='row'>
//                             <div className="form-group">
//                                 <label>Date</label>
//                                 <input
//                                     type='date'
//                                     value={newGoal.date}
//                                     onChange={(e) => handleModalChange(e, 'date')}
//                                 >
//                                 </input>
//                             </div>
//                             <div className="form-group">
//                                 <label>Region</label>
//                                 <select
                                
//                                     value={newGoal.regionId}
//                                     onChange={(e) => handleModalChange(e, 'regionId')}
//                                 >
//                                     {dropdownData.region.map(option => (
//                                         <option key={option.masterId} value={option.masterId}>
//                                             {option.data}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="form-group">
//                                 <label>Level</label>
//                                 <select
//                                     value={newGoal.levelCode}
//                                     onChange={(e) => handleModalChange(e, 'levelCode')}
//                                 >
//                                     {dropdownData.level.map(option => (
//                                         <option key={option.masterId} value={option.masterId}>
//                                             {option.data}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="form-group">
//                                 <label>Goal Type</label>
//                                 <select
//                                     value={newGoal.goalType}
//                                     onChange={(e) => handleModalChange(e, 'goalType')}
//                                 >
//                                     <option value="true">Personal</option>
//                                     <option value="false">Organizational</option>
//                                 </select>
//                             </div>

//                             <div className="form-group">
//                                 <label>Type of Goal</label>
//                                 <select
//                                     value={newGoal.typeOfGoal}
//                                     onChange={(e) => handleModalChange(e, 'typeOfGoal')}
//                                 >
//                                     {dropdownData.typeofGoal.map(option => (
//                                         <option key={option.masterId} value={option.masterId}>
//                                             {option.data}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="form-group">
//                                 <label>Department</label>
//                                 <select
//                                     value={newGoal.departmentId}
//                                     onChange={(e) => handleModalChange(e, 'departmentId')}
//                                 >
//                                     {dropdownData.department.map(option => (
//                                         <option key={option.masterId} value={option.masterId}>
//                                             {option.data}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

                          
//                         </div>
//                         <div>
//                             <h3>Goals Added</h3>
//                             <table  className="styled-table">
//                                 <thead>
//                                     <tr>
//                                         <th>Goal</th>
//                                         <th>Region</th>
//                                         <th>Level</th>
//                                         <th>Goal Type</th>
//                                         <th>Type of Goal</th>
//                                         <th>Department</th>
//                                         <th>Status</th>
//                                         <th>Action</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {modalGoals.map((goal, index) => (
//                                         <tr key={goal.id}>
//                                             <td>{goal.goal}</td>
//                                             <td>{dropdownData.region.find(reg => reg.masterId === goal.regionId)?.data}</td>
//                                             <td>{dropdownData.level.find(level => level.masterId === goal.levelCode)?.data}</td>
//                                             <td>{goal.goalType}</td>
//                                             <td>{dropdownData.typeofGoal.find(tg => tg.masterId === goal.typeOfGoal)?.data}</td>
//                                             <td>{dropdownData.department.find(dep => dep.masterId === goal.departmentId)?.data}</td>
//                                             <td>{goal.status}</td>
//                                             <td>
//                                                 <button type='button' className="cross-btn" onClick={() => handleRemove(goal.id)}>
//                                                 &#10005;
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>


//                         <div className="form-controls">
//                             <button className="btn" onClick={handleAddGoalToModal}>Add Goal</button>
//                             <button className="outline-btn" onClick={() => setShowAddGoalModal(false)}>Cancel</button>
//                             <button className="btn" onClick={handleAddAllGoals}>Add All</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//             {showConfirmation && (
//                 <div className="add-popup">
//                     <p style={{ textAlign: 'center' }}>Are you sure you want to save the selected goals?</p>
//                     <div className='btnContainer'>
//                         <button type='button' className='btn'
//                             onClick={() => {
//                                 setShowConfirmation(false);
//                                 handleSave();
//                             }} >Yes</button>
//                         <button type='button' className='outline-btn' onClick={() => setShowConfirmation(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}
//             <div className='form-controls'>
//                 <button type='button' className='btn' onClick={() => setShowConfirmation(true)}>Save </button>
//             </div>
//         </div>
//     );
// };

// export default EmployeeLevelGoal;
