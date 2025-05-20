import React, { useState, useEffect } from 'react';
import { fetchDataByKey, showToast } from '../../../Api.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { strings } from '../../../string';
import { toast } from 'react-toastify';

const OrganizationalKPI = () => {
    const [kpis, setKpis] = useState([{ kpi: '' }]);
    const [viewMode, setViewMode] = useState(true);
    const companyId = localStorage.getItem("companyId");

    const [fetchStatus, setFetchStatus] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
    const [selectedDate, setSelectedDate] = useState('');
    const [dropdownData, setDropdownData] = useState({
        department: [],
        region: [],
        goalLevel: [],
        typeofGoal: []
    });
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [kpiType, setKpiType] = useState(true);
    const [kpiToUpdate, setKpiToUpdate] = useState(null);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let i = currentYear - 6; i <= currentYear + 5; i++) {
        years.push(i);
    }




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


    const fetchAllKpis = async () => {
        if (selectedDate) return;

        try {
            const response = await axios.get(`http://${strings.localhost}/api/KpiSetting/organization/getByCompanyAndYear/${companyId}/${selectedYear}`); // Use selectedYear instead of hardcoded year
            setKpis(response.data);
            showToast('KPIs fetched successfully.', 'success');
            setFetchStatus('success');
        } catch (error) {
            console.error('Error fetching KPIs:', error);
            showToast('Failed to fetch KPIs.', 'error');
            setFetchStatus('error');
        }
    };

    useEffect(() => {
        if (viewMode) {
            fetchAllKpis();
        }
    }, [viewMode, selectedYear, companyId]);

    const handleAddKpi = () => {
        setKpis([...kpis, { kpi: '' }]);
    };

    const handleRemoveKpi = (index) => {
        const updatedKpis = kpis.filter((_, i) => i !== index);
        setKpis(updatedKpis);
    };

    const handleKpiChange = (index, event) => {
        const newKpis = kpis.map((kpi, i) => {
            if (i === index) {
                return { ...kpi, kpi: event.target.value };
            }
            return kpi;
        });
        setKpis(newKpis);
    };

    const handleSave = async () => {
        const nonEmptyKpis = kpis.filter(kpi => kpi.kpi.trim() !== '');
        showToast("Please write down goals.", 'warn');
        console.log('Non-empty KPIs:', nonEmptyKpis);

        if (
            (!selectedDepartment && selectedDepartment !== null) ||
            (!selectedRegion && selectedRegion !== null) ||
            (!selectedLevel && selectedLevel !== null) ||
            (!selectedType && selectedType !== null)
        ) {
            showToast('Please fill all the required fields.', 'warn');
            return;
        }
        if (nonEmptyKpis.length === 0) {
            showToast('Please add at least one valid KPI before saving.', 'warn');
            return;
        }

        const requestData = {
            levelCode: selectedLevel?.masterId || 0,
            level: selectedLevel?.data || '',
            regionId: selectedRegion?.masterId || 0,
            region: selectedRegion?.data || '',
            typeId: selectedType?.masterId || 0,
            type: selectedType?.data || '',
            departmentId: selectedDepartment?.masterId || 0,
            department: selectedDepartment?.data || '',
            // kpiType,
            // date: selectedDate,
            organizationalLevelKpiManagementDetails: nonEmptyKpis.map(kpi => ({
                kpi: kpi.kpi
            }))
        };
        console.log('Request Data:', requestData);

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/KpiSetting/organization/save/${companyId}`,
                requestData
            );
            showToast('KPIs saved successfully.', 'success');
            fetchAllKpis();
            // window.location.reload();
            setViewMode(true);

            setShowModal(false);
        } catch (error) {
            console.error('Error saving data:', error);
            showToast('Failed to save KPIs.', 'error');
        }
    };


    const closeModal = () => {
        setShowModal(false);
    };
    const handleEditKpi = (kpiData) => {

        console.log("Editing KPI:", kpiData);

        setKpiToUpdate({
            kpiData,
            kpiDetail: Array.isArray(kpiData.organizationalLevelKpiManagementDetails)
                ? kpiData.organizationalLevelKpiManagementDetails
                : [],
        });

        setSelectedLevel({
            masterId: kpiData.levelCode,
            data: kpiData.level,
        });

        setSelectedRegion({
            masterId: kpiData.regionId,
            data: kpiData.region,
        });

        setSelectedDepartment({
            masterId: kpiData.departmentId,
            data: kpiData.department,
        });
        setSelectedType({
            masterId: kpiData.typeId,
            data: kpiData.type,
        });
        // setSelectedType(goalData.type);
        setKpiType(kpiData.kpiType);
        setUpdateModalVisible(true);
        console.log("modal visibilt should be true now ");
    };


    const handleUpdateAddKpi = () => {
        setKpiToUpdate((prevKpiToUpdate) => ({
            ...prevKpiToUpdate,
            kpiDetail: [
                ...prevKpiToUpdate.kpiDetail,
                { id: null, kpi: '' },
            ],
        }));
    };

    const handleUpdateRemoveKpi = (index) => {
        setKpiToUpdate((prevKpiToUpdate) => {
            const updatedKpis = [...prevKpiToUpdate.goalDetail];
            updatedKpis.splice(index, 1);
            return {
                ...prevKpiToUpdate,
                kpiDetail: updatedKpis,
            };
        });
    };

    const handleUpdateKpiChange = (index, event) => {
        const updatedKpi = event.target.value;
        setKpiToUpdate((prevKpiToUpdate) => {
            const updatedKpis = [...prevKpiToUpdate.kpiDetail];
            updatedKpis[index] = { ...updatedKpis[index], kpi: updatedKpi };
            return {
                ...prevKpiToUpdate,
                kpiDetail: updatedKpis,
            };
        });
    };
    const handleUpdateField = (field, value) => {
        setKpiToUpdate((prevKpiToUpdate) => {
            // Check if the field belongs to goalDetail
            if (prevKpiToUpdate.kpiDetail.some(kpi => kpi.hasOwnProperty(field))) {
                const updatedKpiDetail = prevKpiToUpdate.kpiDetail.map((kpi, index) => {
                    if (index === prevKpiToUpdate.kpiDetailIndex) {
                        return { ...kpi, [field]: value };  // Dynamically update the field in goalDetail
                    }
                    return kpi;
                });

                return {
                    ...prevKpiToUpdate,
                    kpiDetail: updatedKpiDetail,
                };
            } else {
                return {
                    ...prevKpiToUpdate,
                    kpiData: {
                        ...prevKpiToUpdate.kpiData,
                        [field]: value,
                    },
                };
            }
        });
    };

    const handleUpdateKpi = async () => {
        try {
            console.log("Kpi to update:", kpiToUpdate);
            const updatedKpidata = kpiToUpdate.kpiData;
            const updatedKpiDetail = kpiToUpdate.kpiDetail;

            const requestData = {
                levelCode: selectedLevel?.masterId || 0,
                level: selectedLevel?.data || '',
                regionId: selectedRegion?.masterId || 0,
                region: selectedRegion?.data || '',
                departmentId: selectedDepartment?.masterId || 0,
                department: selectedDepartment?.data || '',
                goalType: updatedKpidata.goalType,
                type: updatedKpidata?.type || '',
                typeId: updatedKpidata?.masterId || 0,
                date: updatedKpidata.date,
                organizationalLevelKpiManagementDetails: updatedKpiDetail.map(kpi => ({
                    kpi: kpi.kpi,
                })),

            };
            const kpiIdToUpdate = kpiToUpdate.kpiData.id;
            console.log("Updating KPI with ID:", kpiIdToUpdate);
            const response = await axios.put(
                `http://${strings.localhost}/api/KpiSetting/organization/update/${kpiIdToUpdate}`,
                requestData
            );

            if (response.status === 200) {
                showToast('KPI updated successfully.', 'success');
                setUpdateModalVisible(false);
                // window.location.reload();
            } else {
                showToast('Failed to update goal.', 'error');
            }
        } catch (error) {
            console.error('Error updating goal:', error);
            showToast('Failed to update goal', 'error');
        }
    };

    const closeUpdateModal = () => {
        setUpdateModalVisible(false);
    };
    return (
        <div>
            {/* <div className="form-title">
                {viewMode ? 'Organizational KPIs' : 'Organizational KPI Setting'}
            </div> */}

            {viewMode ? (
                <div className='goal-table-container'>
                    <div className='containerbtn'>

                        <div >
                            <label>Select Year: </label>
                            <select
                                className='selectOption'
                                style={{ marginTop: '10px' }}
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                onClick={fetchAllKpis}
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginTop: '25px' }}>
                            <button type="button" onClick={() => setShowModal(true)} className="btn">
                                Add KPI
                            </button>
                        </div>
                    </div>
                    <table className="Goal-table">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>Department</th>
                                <th style={{ width: '10%' }}>Region</th>
                                <th style={{ width: '10%' }}>Level</th>
                                <th>KPIs</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kpis.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>No KPIs available for this year</td>
                                </tr>
                            ) : (
                                kpis.map((kpiData, index) => (
                                    <tr key={kpiData.id}>
                                        <td>{kpiData.department}</td>
                                        <td>{kpiData.region}</td>
                                        <td>{kpiData.level}</td>
                                        <td>
                                            <ul>
                                                {Array.isArray(kpiData.organizationalLevelKpiManagementDetails) &&
                                                    kpiData.organizationalLevelKpiManagementDetails.length > 0
                                                    ? kpiData.organizationalLevelKpiManagementDetails.map((kpiDetail) => (
                                                        <li key={kpiDetail.id}>{kpiDetail.kpi}</li>
                                                    ))
                                                    : <span>No KPIs available</span>}
                                            </ul>
                                        </td>
                                        <td>
                                            {kpiData.organizationalLevelKpiManagementDetails && kpiData.organizationalLevelKpiManagementDetails.length > 0 &&
                                                <button type='button' className='textbutton' onClick={() => handleEditKpi(kpiData)}>Update</button>
                                            }
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                </div>
            ) : null}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">

                        <div className='title'>Organizational KPI Setting</div>
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
                                        }
                                        required
                                    >
                                        <option value="">Select Department</option>
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
                                        <option value="">Select Region</option>
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
                                        <option value="">Select Level</option>
                                        {dropdownData.goalLevel.map((item) => (
                                            <option key={item.masterId} value={item.masterId}>
                                                {item.data}
                                            </option>
                                        ))}
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
                                                dropdownData.typeofGoal.find((d) => d.masterId === parseInt(e.target.value))
                                            )
                                        }
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {dropdownData.typeofGoal.map((item) => (
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
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <span className='required-marker'>*</span>
                                    <label>Status</label>
                                    <select   className='selectOption' onChange={(e) => setKpiType(e.target.value === 'false')} required>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div> */}
                            </div>

                            <div className="organizational-goal-container">
                                <div className="goal-inputs">
                                    <div className="stickyHeading">KPIs</div>
                                    {kpis.map((kpi, index) => (
                                        <div key={index} className="goal-row">
                                            <span className="serial-number">{index + 1}.</span>
                                            <input
                                                value={kpi.kpi}
                                                onChange={(event) => handleKpiChange(index, event)}
                                                placeholder="Enter KPI"
                                                className="goal-input"
                                            />
                                            <button
                                                type="button"
                                                className="cross-btn"
                                                onClick={() => handleRemoveKpi(index)}
                                            >
                                                &#10005;
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" className="btn" onClick={handleAddKpi}>+</button>
                                </div>
                            </div>
                            <div className='btnContainer'>
                                <button
                                    type='button'
                                    className="btn"
                                    onClick={handleSave}
                                >  Save
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
                        <div className="title">Update KPI</div>
                        <div className="modal-header">
                            <button type="button" className="close-btn" onClick={closeUpdateModal}>X</button>
                        </div>
                        <div className="modal-body">
                            <div className="input-row">
                                <div>
                                    <label>Department</label>
                                    <input
                                        value={kpiToUpdate?.kpiData?.department || ''}
                                        onChange={(e) => handleUpdateField('department', e.target.value)} readOnly className='readonly' >

                                    </input>
                                </div>
                                <div>
                                    <label>Region</label>
                                    <input
                                        value={kpiToUpdate?.kpiData?.region || ''}
                                        onChange={(e) => handleUpdateField('region', e.target.value)} readOnly className='readonly' >

                                    </input>
                                </div>
                                <div>
                                    <label>Level</label>
                                    <input
                                        value={kpiToUpdate?.kpiData?.level || ''}
                                        onChange={(e) => handleUpdateField('level', e.target.value)} readOnly className='readonly' >

                                    </input>
                                </div>
                                <div>
                                    <label>Date</label>
                                    <input
                                        className="readonly"
                                        type="date"
                                        value={kpiToUpdate?.kpiData?.date || ''}
                                        readOnly />

                                </div>

                                {/* <div>
                                    <label>KPI Type</label>
                                    <input
                                        value={kpiToUpdate?.kpiData?.kpiType ? 'True' : 'False'}
                                        onChange={(e) => handleUpdateField('kpiType', e.target.value === 'true' ? true : false)}
                                        readOnly className='readonly'
                                    >

                                    </input>
                                </div> */}

                                <div>
                                    <label>Type</label>
                                    <input
                                        value={kpiToUpdate?.kpiData?.type || ''}
                                        onChange={(e) => handleUpdateField('type', e.target.value)}
                                        readOnly className='readonly'
                                    >

                                    </input>
                                </div>

                            </div>

                            <div className="organizational-goal-container">
                                <div className="goal-inputs">
                                    <div className="stickyHeading">KPI's</div>
                                    {Array.isArray(kpiToUpdate?.kpiDetail) && kpiToUpdate?.kpiDetail.map((kpi, index) => (

                                        <div key={index} className="goal-row">
                                            <span className="serial-number">{index + 1}.</span>
                                            <FontAwesomeIcon icon={faBullseye} className="goal-icon" />
                                            <input
                                                value={kpi.kpi}
                                                onChange={(event) => handleUpdateKpiChange(index, event)}
                                                placeholder="Enter goal"
                                                className="goal-input"
                                            />
                                            <button
                                                type="button"
                                                className="cross-btn"
                                                onClick={() => handleUpdateRemoveKpi(index)}
                                            >
                                                &#10005;
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" className="btn" onClick={handleUpdateAddKpi}>+</button>
                                </div>
                            </div>
                            <div className="btnContainer">
                                <button type="button" className="btn" onClick={handleUpdateKpi}>Save Changes</button>
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

export default OrganizationalKPI;
