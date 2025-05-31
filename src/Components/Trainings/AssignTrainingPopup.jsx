import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import axios from 'axios';
import { strings } from "../../string.jsx";

const AssignTrainingPopup = ({
    companyId,
    employeeId,
    selectedEmployee,
    setSelectedEmployee,
    showAssignPopup,
    setShowAssignPopup,
    dropdownData,
    dropdownDepartment,
    dropdownDesignation,
    isAssigning,
    setIsAssigning,
    showToast
}) => {
    const [selectedFilters, setSelectedFilters] = useState({
        regionId: '',
        departmentId: '',
        designationId: ''
    });
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState('');

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSelectedFilters(prev => ({
            ...prev,
            [name]: value
        }));

        setSelectAll(false);
        setSelectedEmployees([]);
    };

    const handleEmployeeNameChange = async (event) => {
        const { value } = event.value;
        setEmployeeSearch(value);
        setSelectedEmployee(prev => ({
            ...prev,
            employeeFirstName: value
        }));

        if (value.trim() !== '') {
            try {
                const response = await axios.get(
                    `http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${value.trim()}`
                );
                setSearchResults(response.data);
                setError(null);
            } catch (error) {
                console.error('Error searching employees:', error);
                setError('Error searching employees');
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
            setError(null);
        }
    };

    const handleSelectEmployee = (employee) => {
        const mappedEmployee = {
            id: employee.id,
            employee: {
                id: employee.id,
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName || ''
            },
            department: employee.department || 'N/A',
            departmentId: employee.deptId || '',
            designation: employee.designation || 'N/A',
            designationId: employee.designationId || '',
            region: employee.region || 'N/A',
            regionId: employee.regionId || '',
            employeeType: employee.employeeType || 'N/A',
            workCategory: employee.workCategory || 'N/A'
        };

        const isAlreadyAdded = filteredEmployees.some(emp => emp.id === employee.id);

        if (!isAlreadyAdded) {
            setFilteredEmployees(prev => [...prev, mappedEmployee]);
        }

        if (!selectedEmployees.includes(employee.id)) {
            setSelectedEmployees(prev => [...prev, employee.id]);
        }
        setSelectedEmployee({
            employeeId: employee.id,
            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName || '',
            trainingId: selectedEmployee.trainingId,
            heading: selectedEmployee.heading
        });

        setSearchResults([]);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedEmployees([]);
        } else {
            const allEmployeeIds = filteredEmployees.map(emp => emp.id);
            setSelectedEmployees(allEmployeeIds);
        }
        setSelectAll(!selectAll);
    };

    const handleEmployeeSelection = (employeeId) => {
        setSelectedEmployees(prev => {
            const newSelected = prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId];

            setSelectAll(newSelected.length === filteredEmployees.length);

            return newSelected;
        });
    };

    const fetchFilteredEmployees = async () => {
        try {
            const { regionId, departmentId, designationId } = selectedFilters;
            let url = `http://${strings.localhost}/employees/filter?companyId=${companyId}`;

            if (regionId) url += `&regionId=${regionId}`;
            if (departmentId) url += `&departmentId=${departmentId}`;
            if (designationId) url += `&designationId=${designationId}`;

            if (!regionId && !departmentId && !designationId) {
                setFilteredEmployees([]);
                return;
            }

            const response = await axios.get(url);

            const mappedEmployees = response.data.map(emp => ({
                id: emp.id,
                employee: {
                    id: emp.employee?.id,
                    employeeId: emp.employee?.employeeId,
                    firstName: emp.employee?.firstName,
                    lastName: emp.employee?.lastName,
                    designation: emp.designation,
                    designationId: emp.designationId,
                },
                department: emp.department,
                departmentId: emp.deptId,
                region: emp.region,
                regionId: emp.region_id,
                employeeType: emp.employeeType,
                workCategory: emp.workCategory
            }));

            setFilteredEmployees(mappedEmployees);
        } catch (error) {
            console.error('Error fetching filtered employees:', error);
            setFilteredEmployees([]);
        }
    };

    useEffect(() => {
        fetchFilteredEmployees();
    }, [selectedFilters.regionId, selectedFilters.departmentId, selectedFilters.designationId]);

    useEffect(() => {
        if (employeeSearch.trim()) {
            const searchTerm = employeeSearch.toLowerCase();
            setFilteredEmployees(prev =>
                prev.filter(emp =>
                    emp.employee?.firstName?.toLowerCase().includes(searchTerm) ||
                    emp.employee?.lastName?.toLowerCase().includes(searchTerm) ||
                    emp.employee?.employeeId?.toLowerCase().includes(searchTerm)
            ));
        } else {
            fetchFilteredEmployees();
        }
    }, [employeeSearch]);

    const handleAssignTraining = async () => {
        setIsAssigning(true);
        try {
            const employeeIds = selectedEmployees.map(id => {
                const employee = filteredEmployees.find(emp => emp.id === id);
                return employee?.employee?.id;
            }).filter(id => id);

            if (employeeIds.length === 0) {
                showToast('No valid employees selected');
                return;
            }

            const employeeIdsParam = employeeIds.join(',');
            const currentDate = new Date().toISOString().split('T')[0];

            await axios.post(
                `http://${strings.localhost}/api/assign-trainings/assign`,
                null,
                {
                    params: {
                        employeeIds: employeeIdsParam,
                        trainingId: selectedEmployee.trainingId,
                        assignedById: employeeId,
                        compId: companyId,
                        assignDate: currentDate,
                        status: true,
                        expiryStatus: false,
                        completionStatus: false
                    }
                }
            );

            showToast('Training assigned successfully');
            setShowAssignPopup(false);
            setSelectedEmployees([]);
            setSelectAll(false);
        } catch (error) {
            console.error('Error assigning training:', error);
            showToast('Failed to assign training');
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <div className='modal-overlay'>
            <div className='modal'>
                <div className="modal-header">
                    <div className='form-title'>Assign Training</div>
                    <button className="button-close" onClick={() => setShowAssignPopup(false)}>x</button>
                </div>

                <div className="modal-body">
                    <div className="input-row">
                        <div>
                            <label>Training ID:</label>
                            <input
                                type='text'
                                className='readonly'
                                value={selectedEmployee.trainingId}
                                readOnly
                            />
                        </div>
                        <div>
                            <label>Training Name:</label>
                            <input
                                type='text'
                                className='readonly'
                                value={selectedEmployee.heading}
                                readOnly
                            />
                        </div>
                        <div>
                            <label htmlFor="empName">Search:</label>
                            <div className="search-bar1">
                                <input
                                    type="text"
                                    name="name"
                                    id="empName"
                                    value={employeeSearch}
                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                    required
                                    className="search-input1"
                                />
                                <FaSearch className="search-icon1" />
                                {error && <div className="error-message">{error}</div>}
                                {searchResults.length > 0 && (
                                    <ul className="dropdown2">
                                        {searchResults.map((employee) => (
                                            <li
                                                key={employee.id}
                                                onClick={() => handleSelectEmployee(employee)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {`${employee.firstName} ${employee.lastName} (${employee.employeeId})`}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="input-row">
                        <div>
                            <label>Region:</label>
                            <select
                                name="regionId"
                                value={selectedFilters.regionId}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Regions</option>
                                {dropdownData.region.map(region => (
                                    <option key={region.masterId} value={region.masterId}>{region.data}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Department:</label>
                            <select
                                name="departmentId"
                                value={selectedFilters.departmentId}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Departments</option>
                                {dropdownDepartment.department.map(dept => (
                                    <option key={dept.masterId} value={dept.masterId}>{dept.data}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Designation:</label>
                            <select
                                name="designationId"
                                value={selectedFilters.designationId}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Designations</option>
                                {dropdownDesignation.designation.map(designation => (
                                    <option key={designation.masterId} value={designation.masterId}>{designation.data}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th>Designation</th>
                                    <th>Region</th>
                                    <th style={{ width: "5%" }}>Select</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map(employee => (
                                        <tr key={employee.id}>
                                            <td>{employee.employee?.employeeId || 'N/A'}</td>
                                            <td>{`${employee.employee?.firstName || ''} ${employee.employee?.lastName || ''}`}</td>
                                            <td>{employee.department || 'N/A'}</td>
                                            <td>{employee.designation || 'N/A'}</td>
                                            <td>{employee.region || 'N/A'}</td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmployees.includes(employee.id)}
                                                    onChange={() => handleEmployeeSelection(employee.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-results">
                                            {selectedFilters.regionId || selectedFilters.deptId || selectedFilters.designationId || employeeSearch
                                                ? "No employees found matching your criteria"
                                                : "Please select at least one filter to see results"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="form-controls">
                            <button
                                type="button"
                                className="btn"
                                onClick={handleSelectAll}
                            >
                                {selectAll ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className='btnContainer'>
                    <button
                        type='button'
                        className='btn'
                        onClick={handleAssignTraining}
                        disabled={selectedEmployees.length === 0 || isAssigning}
                    >
                        {isAssigning ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            `Assign to Selected Employees (${selectedEmployees.length})`
                        )}
                    </button>

                    <button
                        type='button'
                        className='outline-btn'
                        onClick={() => setShowAssignPopup(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignTrainingPopup;