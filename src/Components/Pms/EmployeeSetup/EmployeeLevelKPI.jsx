import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { strings } from '../../../string';
import { showToast } from '../../../Api.jsx';

const EmployeeLevelKPI = () => {
    const [kpiData, setKpiData] = useState([]);
    const [selectedKpis, setSelectedKpis] = useState([]);
    const [employeeConfig, setEmployeeConfig] = useState(null);
    const [reportingManagerId, setReportingManagerId] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newKpi, setNewKpi] = useState("");
    const [newDate, setNewDate] = useState("");
    const [modalKpis, setModalKpis] = useState([]);
    const [loadingInConfirmation, setLoadingInConfirmation] = useState(false); 

    const companyId = localStorage.getItem("companyId");
    const { id: employeeId } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchEmployeeConfig = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/employee-config/employee/${employeeId}`);
                const { departmentId, levelCode, typeId, regionId, reportingManager } = response.data[0];
                setEmployeeConfig({ departmentId, levelId: levelCode, typeId, regionId });
                setReportingManagerId(reportingManager.id);
            } catch (error) {
                console.error('Error fetching employee config:', error);
            }
        };

        fetchEmployeeConfig();
    }, [employeeId]);

    useEffect(() => {
        const fetchKPIs = async () => {
            if (employeeConfig) {
                const { departmentId, levelId, typeId, regionId } = employeeConfig;
                try {
                    const response = await axios.get(
                        `http://${strings.localhost}/api/KpiSetting/organization/getByFiltersNew/${companyId}/${departmentId}/${levelId}/${regionId}/${typeId}`
                    );
                    setKpiData(response.data);
                } catch (error) {
                    console.error('Error fetching KPIs:', error);
                }
            }
        };

        fetchKPIs();
    }, [employeeConfig, companyId]);

    const handleCheckboxChange = (kpi, isChecked) => {
        if (isChecked) {
            setSelectedKpis([...selectedKpis, { kpi, date: new Date().toISOString().split('T')[0] }]);
        } else {
            setSelectedKpis(selectedKpis.filter(selectedKpi => selectedKpi.kpi !== kpi));
        }
    };

    const saveSelectedKpis = async () => {
        if (selectedKpis.length === 0) {
            showToast("Please select at least one goal before saving.", 'warn');
            return;
        }
        try {
            await axios.post(`http://${strings.localhost}/api/kpi/saveMultiple/${employeeId}/${reportingManagerId}`, selectedKpis);
            showToast('KPIs saved successfully', 'success');
        } catch (error) {
            console.error('Error saving KPIs:', error);
            showToast('Failed to save.', 'error');
        }
    };

    const handleAddKpi = () => {
        if (newKpi && newDate) {
            setModalKpis([...modalKpis, { kpi: newKpi, date: newDate }]);
            setNewKpi("");
            setNewDate("");
        } else {
            showToast("Please enter both KPI and Date.", 'warn');
        }
    };

    const handleSaveInConfirmation = async () => {
        console.log('Before setting loadingInConfirmation to true', loadingInConfirmation);
        setLoadingInConfirmation(true);  // Start loading spinner
        console.log('After setting loadingInConfirmation to true', loadingInConfirmation);

        try {
            await saveSelectedKpis();  // Save the KPIs
            showToast('KPIs saved successfully', 'success');
        } catch (error) {
            showToast('Failed to save KPIs', 'error');
        } finally {
            setLoadingInConfirmation(false);  // Stop the spinner after saving
            setShowConfirmation(false);  // Close the confirmation modal
        }
    };




    const handleBack = () => {
        navigate(`/Team`);
    };

    return (
        <div className='coreContainer'>

            {showModal && (
                <div className="add-popup">
                    <h3 className='underlineText' style={{ textAlign: 'center' }}>Add New KPI</h3>
                    <input type="text" placeholder="Enter KPI" value={newKpi} onChange={(e) => setNewKpi(e.target.value)} />
                    <input type="date" style={{ border: '1px solid lightgrey' }} value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    <div className='btnContainer'>
                        <button type='button' className='btn' onClick={handleAddKpi}>Add</button>
                        <button type='button' className='outline-btn' onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
            <div className='form-controls' style={{ marginRight: '50px' }}>
                <button onClick={() => setShowModal(true)} className="btn">Add kpi</button>
            </div>
            <table className='Attendance-table'>
                <thead>
                    <tr>
                        <th>KPI</th>
                        <th>Date</th>
                        <th style={{ width: "20px" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Iterate through the KPI data */}
                    {kpiData.map((kpiItem, index) => {
                        return kpiItem.organizationalLevelKpiManagementDetails?.map((kpiDetail) => (
                            <tr key={kpiDetail.id}>
                                <td>{kpiDetail.kpi}</td>
                                <td>{kpiItem.date}</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        // Check if the KPI is already selected
                                        checked={selectedKpis.some(selectedKpi => selectedKpi.kpi === kpiDetail.kpi)}
                                        onChange={(e) => handleCheckboxChange(kpiDetail.kpi, e.target.checked)}
                                    />
                                </td>
                            </tr>
                        ));
                    })}
                    {modalKpis.map((kpiItem, index) => (
                        <tr key={index}>
                            <td>{kpiItem.kpi}</td>
                            <td>{kpiItem.date}</td>
                            <td>
                                <input
                                    type="checkbox"
                                    onChange={(e) => handleCheckboxChange(kpiItem.kpi, e.target.checked)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="form-controls" style={{ marginRight: '50px' }}>
                <button type='button' className='outline-btn' onClick={handleBack} >Back</button>
                <button type="button" className="btn" onClick={() => setShowConfirmation(true)}>Save</button>
            </div>

            {showConfirmation && (
                <div className="add-popup">
                    <p style={{ textAlign: 'center' }}>Are you sure you want to save the selected KPIs?</p>
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

export default EmployeeLevelKPI;



















































// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';
// import { strings } from '../../../string';
// import { toast } from 'react-toastify';

// const EmployeeLevelKPI = () => {
//     const [kpiData, setKpiData] = useState([]); // Store the KPIs
//     const [selectedKpis, setSelectedKpis] = useState([]); // Store selected KPIs
//     const [employeeConfig, setEmployeeConfig] = useState(null);
//     const [reportingManagerId, setReportingManagerId] = useState(null);
//     const [showConfirmation, setShowConfirmation] = useState(false);
//     const [showModal, setShowModal] = useState(false); // For modal visibility
//     const [modalKpis, setModalKpis] = useState([]); // KPIs added in the modal
//     const [modalKpiInput, setModalKpiInput] = useState(''); // New KPI input in the modal
//     const [modalDateInput, setModalDateInput] = useState(''); // New KPI Date input
//     const companyId = localStorage.getItem("companyId");
//     const { id: employeeId } = useParams();

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
//         const fetchKPIs = async () => {
//             if (employeeConfig) {
//                 const { departmentId, levelId, typeId, regionId } = employeeConfig;
//                 try {
//                     const response = await axios.get(
//                         `http://${strings.localhost}/api/KpiSetting/organization/getByFilters/${companyId}/true/${departmentId}/${levelId}/${regionId}/${typeId}`
//                     );
//                     setKpiData(response.data); // Set the KPIs data
//                 } catch (error) {
//                     console.error('Error fetching KPIs:', error);
//                 }
//             }
//         };

//         fetchKPIs();
//     }, [employeeConfig, companyId]);

//     const handleCheckboxChange = (kpi, isChecked) => {
//         if (isChecked) {
//             // Only add to selectedKpis if not already selected
//             setSelectedKpis(prevState => {
//                 if (!prevState.some(selectedKpi => selectedKpi.kpi === kpi)) {
//                     return [...prevState, { kpi, date: new Date().toISOString().split('T')[0] }];
//                 }
//                 return prevState; // Prevent adding duplicates
//             });
//         } else {
//             // When unchecked, remove from selectedKpis
//             setSelectedKpis(prevState => prevState.filter(selectedKpi => selectedKpi.kpi !== kpi));
//         }
//     };



//     // Handle KPI and Date input in the modal
//     const handleAddKpiInModal = () => {
//         if (modalKpiInput && modalDateInput) {  // Ensure both fields are filled
//             // Avoid adding duplicate KPIs from the modal to modalKpis
//             if (!modalKpis.some(modalKpi => modalKpi.kpi === modalKpiInput)) {
//                 // Add the new KPI to modalKpis
//                 setModalKpis([...modalKpis, { kpi: modalKpiInput, date: modalDateInput }]);
//                 setModalKpiInput('');  // Clear the input field for KPI
//                 setModalDateInput('');  // Clear the input field for date
//             } else {
//                 toast.warn("This KPI is already added in the modal.");
//             }
//         } else {
//             toast.warn("Please fill in both KPI and Date fields.");
//         }
//     };
    
//     const addAllKpisToTable = () => {
//         setSelectedKpis(prevSelectedKpis => {
//             const updatedSelectedKpis = [...prevSelectedKpis];  // Copy current selected KPIs
    
//             // Iterate over modal KPIs and add to selectedKpis
//             modalKpis.forEach(modalKpi => {
//                 // Only add unique KPIs to selectedKpis (attendance table)
//                 if (!updatedSelectedKpis.some(selectedKpi => selectedKpi.kpi === modalKpi.kpi)) {
//                     updatedSelectedKpis.push(modalKpi);
//                 }
//             });
    
//             return updatedSelectedKpis;  // Return the updated list of selected KPIs
//         });
    
//         // Close the modal after adding all KPIs to the attendance table
//         setShowModal(false);
//         setModalKpis([]);  // Clear the modal KPIs list after transfer
//     };
    
//     // Save selected KPIs to the backend
//     const saveSelectedKpis = async () => {
//         if (selectedKpis.length === 0) {
//             toast.warn("Please select at least one goal before saving.");
//             return;
//         }
//         try {
//             // Send the selected KPIs to the backend
//             await axios.post(`http://localhost:5557/api/kpi/saveMultiple/${employeeId}/${reportingManagerId}`, selectedKpis);
//             toast.success('KPIs saved successfully');
//         } catch (error) {
//             console.error('Error saving KPIs:', error);
//             toast.error('Failed to save.');
//         }
//     };


//     return (
//         <div className='coreContainer'>
//             <table className='Attendance-table'>
//                 <thead>
//                     <tr>
//                         <th>KPI</th>
//                         <th>Date</th>
//                         <th style={{ width: "20px" }}>Action</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {/* Iterate through the KPI data (kpiData from API) */}
//                     {kpiData.map((kpiItem, index) => {
//                         return kpiItem.organizationalLevelKpiManagementDetails?.map((kpiDetail) => (
//                             <tr key={kpiDetail.id}>
//                                 <td>{kpiDetail.kpi}</td>
//                                 <td>{kpiItem.date}</td>
//                                 <td>
//                                     <input
//                                         type="checkbox"
//                                         // Check if the KPI is already selected
//                                         checked={selectedKpis.some(selectedKpi => selectedKpi.kpi === kpiDetail.kpi)}
//                                         onChange={(e) => handleCheckboxChange(kpiDetail.kpi, e.target.checked)}
//                                     />
//                                 </td>
//                             </tr>
//                         ));
//                     })}



//                 </tbody>



//             </table>
//             <div>
//                 <button type='button' className='btn' onClick={() => setShowModal(true)}>Add KPI</button>
//             </div>
//             {showModal && (
//                 <div className="add-popup">
//                     <div className="modal-content">
//                         <h3>Add KPIs</h3>
//                         <input
//                             type="text"
//                             value={modalKpiInput}
//                             onChange={(e) => setModalKpiInput(e.target.value)}
//                             placeholder="Enter KPI"
//                         />
//                         <input
//                             type="date"
//                             value={modalDateInput}
//                             onChange={(e) => setModalDateInput(e.target.value)}
//                         />
//                         <button onClick={handleAddKpiInModal}>Add KPI</button>

//                         <table>
//                             <thead>
//                                 <tr>
//                                     <th>KPI</th>
//                                     <th>Date</th>
//                                     <th>Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {/* Display KPIs added in the modal */}
//                                 {modalKpis.map((kpiItem, index) => (
//                                     <tr key={index}>
//                                         <td>{kpiItem.kpi}</td>
//                                         <td>{kpiItem.date}</td>
//                                         <td>
//                                             <button
//                                                 onClick={() => setModalKpis(modalKpis.filter((_, i) => i !== index))}
//                                             >
//                                                 Remove
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                         <button onClick={addAllKpisToTable}>Add All</button>
//                         <button onClick={() => setShowModal(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}
//             {showConfirmation && (
//                 <div className="add-popup">
//                     <p style={{ textAlign: 'center' }}>Are you sure you want to save the selected kpis?</p>
//                     <div className='btnContainer'>
//                         <button type='button' className='btn'
//                             onClick={() => {
//                                 setShowConfirmation(false);
//                                 saveSelectedKpis();
//                             }} >   Yes
//                         </button>
//                         <button type='button' className='outline-btn' onClick={() => setShowConfirmation(false)}>Cancel</button>

//                     </div>
//                 </div>
//             )}
//             <div className='form-controls'>
//                 <button type='button' className='btn' onClick={() => setShowConfirmation(true)}>Save</button>
//             </div>
//         </div>
//     );
// };

// export default EmployeeLevelKPI;
