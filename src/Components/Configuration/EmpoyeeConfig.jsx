import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import "../CommonCss/EmployeeConfig.css";
import { fetchDataByKey, showToast } from '../../Api.jsx';
import { strings } from '../../string.jsx';

const EmployeeDetails = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [specialHolidayAccess, setSpecialHolidayAccess] = useState(0);
  const [overtimeApplicable, setOvertimeApplicable] = useState(0);
  const [isSwitchedOn, setIsSwitchedOn] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [employeeSearchInput, setEmployeeSearchInput] = useState('');
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [employeeSearchError, setEmployeeSearchError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [field, setField] = useState('');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const companyId = localStorage.getItem('companyId');
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    employeeType: '',
    workingHours: '',
    workStateCode: '',
    workCategoryCode: '',
    allowableOvertimedays: '',
    allowableOvertimeHours: '',
    overtimeRate: '',
    workState: '',
    workCategory: '',
    department: '',
    departmentId: '',
    typeofGoal: '',
    typeofGoalId: '',
    region: '',
    regionId: '',
    goalLevel: '',
    goalLevelId: '',
    levelCode: '',
    reportingManager: { id: null },
    reportingManagerName: '',
    probationMonth: '',
    confirmationStatus: '',
    designation:'',
    designationId:''
  });

  const [dropdownData, setDropdownData] = useState({
    employeeType: [],
    department: [],
    typeofGoal: [],
    region: [],
    goalLevel: [],
    designation: []

  });

  useEffect(() => {
    if (employeeData) {
      setSpecialHolidayAccess(employeeData.employeeSpecialHolidayAccess ? 1 : 0);
      setOvertimeApplicable(employeeData.overtimeApplicable ? 1 : 0);
      setIsSwitchedOn(employeeData.overtimeApplicable ? 1 : 0);
      setIsSwitchedOn(employeeData.overtimeApplicable ? 1 : 0);
      setFormData({
        employeeType: employeeData.employeeType || '',
        workingHours: employeeData.workingHours || '',
        workStateCode: employeeData.workStateCode || '',
        workCategoryCode: employeeData.workCategoryCode || '',
        workState: employeeData.workState || '',
        workCategory: employeeData.workCategory || '',
        specialHolidayAccess: employeeData.specialHolidayAccess || 0,
        overtimeApplicable: employeeData.overtimeApplicable || 0,
        overtimeRate: employeeData.overtimeRate || '',
        allowableOvertimeHours: employeeData.allowableOvertimeHours || '',
        allowableOvertimedays: employeeData.allowableOvertimedays || '',
        confirmationStatus: String(employeeData.confirmationStatus),
        probationMonth: employeeData.probationMonth || '',
        reportingManager: employeeData.reportingManager || { id: null, firstName: '', middleName: '', lastName: '' },

      });

    }
  }, [employeeData]);

  useEffect(() => {
    if (id) {
      console.log('Id', id);
      fetchEmployeeData(id);
    }
  }, [id]);


  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const employeeType = await fetchDataByKey('employeeType');
        const state = await fetchDataByKey('state');
        const employeeDayOffCategory = await fetchDataByKey('employeeDayOffCategory');
        const typeofGoal = await fetchDataByKey('typeofGoal');
        const department = await fetchDataByKey('department');
        const region = await fetchDataByKey('region');
        const goalLevel = await fetchDataByKey('goalLevel');
        const designation = await fetchDataByKey('designation')
        setDropdownData({
          employeeType: employeeType,
          state: state,
          employeeDayOffCategory: employeeDayOffCategory,
          typeofGoal: typeofGoal,
          department: department,
          region: region,
          goalLevel: goalLevel,
          designation: designation


        });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);

  const handleEmployeeSearchChange = (e) => {
    const value = e.target.value;
    setEmployeeSearchInput(value);
    console.log("Search Input Value:", value);
    if (value.trim() === '') {
      setEmployeeSearchResults([]);
      setEmployeeSearchError('');
      return;
    }
    fetchEmployees(value);
    const filteredEmployees = employees.filter(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      return fullName.includes(value.toLowerCase());
    });
    console.log("Filtered Employees:", filteredEmployees);
    setEmployeeSearchResults(filteredEmployees);
    if (filteredEmployees.length === 0) {
      setEmployeeSearchError('No employees found.');
    } else {
      setEmployeeSearchError('');
    }
  };


  const fetchEmployees = async (value) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/employees/search`, {
        params: { companyId, searchTerm: value.trim() },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeSearchInput(`${employee.firstName} ${employee.lastName}`);
    setEmployeeSearchResults([]);
    setEmployeeSearchError('');

    // When selecting an employee as a reporting manager
    setFormData(prevData => {
      const updatedData = {
        ...prevData,
        reportingManager: {
          id: employee.id,
          firstName: employee.firstName,
          middleName: employee.middleName,
          lastName: employee.lastName,
        },
      };
      console.log("Updated reportingManager:", updatedData.reportingManager); 
      return updatedData;
    });
  };
  const getReportingManagerName = () => {
    const manager = formData.reportingManager;
    if (manager && typeof manager === 'object') {
      const { firstName = '', middleName = '', lastName = '' } = manager;
      return `${firstName} ${middleName} ${lastName}`.trim();
    }
    return employeeSearchInput || '';
  };




  useEffect(() => {
    if (employeeSearchInput.trim() === '') {
      setEmployeeSearchResults([]);
    }
  }, [employeeSearchInput]);


  const fetchEmployeeData = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/employee-config/employee/${id}`);
      if (response.data && response.data.length > 0) {
        const employeeData = response.data[0];
        console.log('employeeData', employeeData);
        const reportingManagerName = employeeData.reportingManager
          ? `${employeeData.reportingManager.firstName} ${employeeData.reportingManager.middleName ? employeeData.reportingManager.middleName + ' ' : ''}${employeeData.reportingManager.lastName}`
          : '';
        setEmployeeData(employeeData);
        setIsSwitchedOn(employeeData.overtimeApplicable ? 1 : 0);
        setFormData({
          employeeType: employeeData.employeeType || '',
          workingHours: employeeData.workingHours || '',
          workStateCode: employeeData.workStateCode || '',
          workCategoryCode: employeeData.workCategoryCode || '',
          workState: employeeData.workState || '',
          workCategory: employeeData.workCategory || '',
          specialHolidayAccess: employeeData.specialHolidayAccess || 0,
          overtimeRate: employeeData.overtimeRate || '',
          allowableOvertimeHours: employeeData.allowableOvertimeHours || '',
          allowableOvertimedays: employeeData.allowableOvertimedays || '',
          region: employeeData.region || '',
          department: employeeData.department || '',
          designation: employeeData.designation || '',
          goalLevel: employeeData.level || '',
          typeofGoal: employeeData.type || '',
          reportingManager: employeeData.reportingManager || { id: null, firstName: '', middleName: '', lastName: '' },
          confirmationStatus: employeeData.confirmationStatus || '',
          probationMonth: employeeData.probationMonth || ''

        });
      } else {
        setEmployeeData(null);
      }
    } catch (error) {
      setEmployeeData(null);
    }
  };
  useEffect(() => {
    fetchEmployeeData();
  }, [id]);


  const handleChange = (e) => {
    const { name, value, } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Fields that can't be negative
    const fieldsThatCantBeNegative = [
      'workingHours',
      'overtimeRate',
      'allowableOvertimeHours',
      'allowableOvertimedays'
    ];
    if (name === 'workingHours') {
      if (!/^\d*\.?\d*$/.test(value)) {
        showToast('Please enter a valid number.', 'warn');
        return;
      }

      if (parseFloat(value) < 0) { // Ensure it's not negative
        showToast('Working hours cannot be negative', 'warn');
        return;
      }
    }
    // Handle numeric fields that can't be negative
    if (fieldsThatCantBeNegative.includes(name) && value < 0) {
      showToast(`${name} cannot be negative`, 'warn');
      return;
    }

    if (name === 'region' || name === 'department' || name === 'designation' || name === 'goalLevel' || name === 'typeofGoal') {
      // Get the selected option
      const selectedOption = dropdownData[name].find(option => option.data === value);

      // Update state with both data and the corresponding masterId
      setFormData(prevData => ({
        ...prevData,
        [name]: selectedOption ? selectedOption.data : value,  // Store the label (data)
        [`${name}Id`]: selectedOption ? selectedOption.masterId : null,  // Store the masterId
      }));
    } else {
      // For regular fields, just update the value
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleStateChange = (e) => {
    const { value } = e.target;
    const selectedState = dropdownData.state.find(option => option.data === value);
    if (selectedState) {
      console.debug("Selected State:", selectedState);
      setFormData((prevState) => ({
        ...prevState,
        workStateCode: selectedState.masterId,
        workState: selectedState.data,
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    const selectedCategory = dropdownData.employeeDayOffCategory.find(option => option.data === value);
    if (selectedCategory) {
      console.debug("Selected Category:", selectedCategory);
      setFormData((prevState) => ({
        ...prevState,
        workCategoryCode: selectedCategory.masterId,
        workCategory: selectedCategory.data,
      }));
    }
  };


  const handleSpecialHolidayAccessToggle = () => {
    const updatedAccess = specialHolidayAccess === 1 ? 0 : 1;
    setSpecialHolidayAccess(updatedAccess);

    if (employeeData) {
      setEmployeeData({
        ...employeeData,
        employeeSpecialHolidayAccess: updatedAccess
      });
    }
  };

  const handleOvertimeApplicableToggle = () => {
    const updatedOvertime = overtimeApplicable === 1 ? 0 : 1;
    setOvertimeApplicable(updatedOvertime);

    if (employeeData) {
      setEmployeeData({
        ...employeeData,
        overtimeApplicable: updatedOvertime
      });
    }
  };


  const handleSave = (e) => {
    console.log("FormData before save:", formData);
    e.preventDefault();
    setLoading(true);

    if (!id && !selectedEmployee) {
      showToast('Please select an employee.', 'warn');
      return;
    }

    if (!formData.employeeType || !formData.workingHours || !formData.workState || !formData.workCategory || !formData.department || !formData.designation || !formData.goalLevel || !formData.region || !formData.typeofGoal) {
      showToast('Please fill in all required fields.', 'warn');
      return;
    }
    const employeeId = id ? id : (selectedEmployee ? selectedEmployee.id : null);
    if (!employeeId) {
      showToast('Employee ID is missing.', 'warn');
      return;
    }

    const updatedData = {
      ...employeeData,
      employeeId: employeeId,
      employeeSpecialHolidayAccess: specialHolidayAccess === 1 ? 1 : 0,
      overtimeApplicable: overtimeApplicable === 1 ? 1 : 0,
      workStateCode: formData.workStateCode,
      workCategoryCode: formData.workCategoryCode,
      workingHours: formData.workingHours,
      workState: formData.workState,
      workCategory: formData.workCategory,
      overtimeRate: formData.overtimeRate,
      allowableOvertimeHours: formData.allowableOvertimeHours,
      allowableOvertimedays: formData.allowableOvertimedays,
      department: formData.department,
      departmentId: formData.departmentId,
      designation : formData.designation,
      designationId : formData.designationId,
      region: formData.region,
      regionId: formData.regionId,
      level: formData.goalLevel,
      levelCode: formData.goalLevelId,
      type: formData.typeofGoal,
      typeId: formData.typeofGoalId,
      reportingManager: formData.reportingManager,
      confirmationStatus: formData.confirmationStatus,
      probationMonth: formData.probationMonth
    };
    if (updatedData.id) {
      updateEmployeeConfig(updatedData);
    } else {
      createEmployeeConfig(updatedData);
    }
    setLoading(false);
  };


  const updateEmployeeConfig = (updatedData) => {
    const { id, ...dataToSubmit } = updatedData;
    console.log("Data to submit for update:", dataToSubmit);

    axios
      .put(`http://${strings.localhost}/api/employee-config/${updatedData.id}`, dataToSubmit)
      .then((response) => {
        console.log('Employee configuration updated:', response.data);
        showToast('Updated successfully.', 'success');
        fetchEmployeeData();
        setIsSaved(true);
      })
      .catch((error) => {
        console.error('Error updating employee configuration:', error);
        showToast('Error while saving', 'error');
        if (error.response) {
          console.error("API Response Error:", error.response.data);
        }
      });
  };


  const createEmployeeConfig = (updatedData) => {

    setLoading(true);
    const employeeDataToSend = {
      employeeType: formData.employeeType,
      workingHours: updatedData.workingHours,
      employeeId: updatedData.employeeId,
      workCategoryCode: updatedData.workCategoryCode,
      workStateCode: updatedData.workStateCode,
      employeeSpecialHolidayAccess: updatedData.employeeSpecialHolidayAccess,
      overtimeApplicable: updatedData.overtimeApplicable,
      overtimeRate: formData.overtimeRate || 0,
      allowableOvertimeHours: formData.allowableOvertimeHours || 0,
      allowableOvertimedays: formData.allowableOvertimedays || 0,
      workState: formData.workState,
      workCategory: formData.workCategory,
      department: formData.department,
      departmentId: formData.departmentId || 0,
      designation : formData.designation,
      designationId : formData.designationId || 0,
      region: formData.region,
      regionId: formData.regionId || 0,
      level: formData.goalLevel,
      levelCode: formData.goalLevelId || 0,
      type: formData.typeofGoal,
      typeId: formData.typeofGoalId || 0,
      reportingManager: formData.reportingManager,
      confirmationStatus: formData.confirmationStatus || false,
      probationMonth: formData.probationMonth || 0
    };
    console.log("Data being sent to the server:", employeeDataToSend);
    axios
      .post(`http://${strings.localhost}/api/employee-config/${employeeDataToSend.employeeId}`, employeeDataToSend)
      .then((response) => {
        showToast('Configuration saved successfully.', 'success');
        fetchEmployeeData();
        setIsSaved(true);
      })
      .catch((error) => {
        showToast('Error saving', 'error');
        console.error('Error creating new employee configuration:', error);
      });
    setLoading(false);
  };


  const handleDelete = async () => {
    const recordId = employeeData ? employeeData.id : id;

    try {
      await axios.delete(`http://${strings.localhost}/api/employee-config/${recordId}`);

      setEmployeeData(null);
      setSpecialHolidayAccess(0);
      setOvertimeApplicable(0);
      setIsSwitchedOn(0);
      setFormData([]);

      showToast('Employee configuration deleted successfully.', 'success');
    } catch (error) {
      showToast('Error while deleting employee configuration', 'error');
    }
  };

  const handleSetupClick = () => {

    if (!id && !selectedEmployee) {
      showToast('Please select an employee.', 'warn');
      return;
    } if (!isSaved) {
      showToast('Please save the form before proceeding.', 'warn');
      return;
    }
    if (specialHolidayAccess) {
      const employeeId = selectedEmployee ? selectedEmployee.id : id;
      navigate(`/EmployeeLevelconfiguration/${employeeId}`);
      console.log('Navigating to:', employeeId);
    }
  };


  const handlesetUpEmployeeDataClick = () => {
    if (!employeeData && !id) {
      showToast('Employee data not found.', 'warn');
      return;
    }
    if (specialHolidayAccess) {
      const employeeId = id;
      navigate(`/EmployeeLevelconfiguration/${employeeId}`);
    } else {
      showToast('Special holiday access is not enabled for this employee.', 'info');
    }
  };


  const handleBack = () => {
    navigate(`/EnrollmentDashboard`);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!employeeData || !employeeData.id) {
      showToast('Employee data is missing or incomplete.', 'warn');
      return;
    }

    const updatedData = {
      ...employeeData,
      employeeSpecialHolidayAccess: specialHolidayAccess === 1 ? 1 : 0,
      overtimeApplicable: overtimeApplicable === 1 ? 1 : 0,
      employeeType: formData.employeeType,
      workingHours: formData.workingHours,
      workStateCode: formData.workStateCode,
      workCategoryCode: formData.workCategoryCode,
      workState: formData.workState,
      workCategory: formData.workCategory,
      department: formData.department,
      departmentId: formData.departmentId,
      designation : formData.designation,
      designationId : formData.designationId,
      region: formData.region,
      regionId: formData.regionId,
      goalLevel: formData.goalLevel,
      levelCode: formData.goalLevelId,
      typeofGoal: formData.typeofGoal,
      typeofGoalId: formData.typeofGoalId,
      reportingManager: formData.reportingManager,
      confirmationStatus: formData.confirmationStatus,
      probationMonth: formData.probationMonth
    };

    if (overtimeApplicable === 0) {
      updatedData.overtimeRate = 0;
      updatedData.allowableOvertimeHours = 0;
      updatedData.allowableOvertimedays = 0;
    } else {
      updatedData.overtimeRate = formData.overtimeRate || 0;
      updatedData.allowableOvertimeHours = formData.allowableOvertimeHours || 0;
      updatedData.allowableOvertimedays = formData.allowableOvertimedays || 0;
    }

    updateEmployeeConfig(updatedData);
  };



  return (
    <div className='coreContainer'>
      <div className="form-title">Employee Configuration</div>
      <div className="emp-details-container">
        {employeeData && id ? (
          <div className="emp-details">
            <div className="emp-info-container">
              <div className="emp-section">
                <h3>Employee Information</h3>
                {employeeData && employeeData.employee ? (
                  <>
                    <p><strong>Name:</strong> {employeeData.employee.firstName} {employeeData.employee.middleName} {employeeData.employee.lastName}</p>
                    <p><strong>Contact No:</strong> {employeeData.employee.contactNo}</p>
                    <p><strong>Employee ID:</strong> {employeeData.employee.employeeId}</p>
                    <p><strong>Gender:</strong> {employeeData.employee.gender}</p>
                    <p><strong>Nationality:</strong> {employeeData.employee.nationality}</p>
                    <p><strong>Designation:</strong> {employeeData.employee.designation}</p>
                  </>
                ) : (
                  <p className='no-data'>No employee data available</p>
                )}
              </div>

              <div className="emp-section">
                <h3 >Address Information</h3>
                {employeeData && employeeData.employee ? (
                  <>
                    <p><strong>Current Address:</strong> {employeeData.employee.currentHouseNo}, {employeeData.employee.currentStreet}, {employeeData.employee.currentCity}, {employeeData.employee.currentState}, {employeeData.employee.currentCountry} - {employeeData.employee.currentPostelcode}</p>
                    <p><strong>Permanent Address:</strong> {employeeData.employee.permanentHouseNo}, {employeeData.employee.permanentStreet}, {employeeData.employee.permanentCity}, {employeeData.employee.permanentState}, {employeeData.employee.permanentCountry} - {employeeData.employee.permanentPostelcode}</p>
                  </>
                ) : (
                  <p className='no-data'>No address data available</p>
                )}
              </div>

              <div className="emp-section">
                <h3>Company Details</h3>
                {employeeData && employeeData.employee && employeeData.employee.companyRegistration ? (
                  <>
                    <p><strong>Company Name:</strong> {employeeData.employee.companyRegistration.companyName}</p>
                    <p><strong>Company Type:</strong> {employeeData.employee.companyRegistration.companyType}</p>
                    <p><strong>Company Assign ID:</strong> {employeeData.employee.companyRegistration.companyAssignId}</p>
                  </>
                ) : (
                  <p className='no-data'>No company registration data available</p>
                )}
              </div>
            </div>
            <div className="emp-other-details">
              <h3>Configuration</h3>
              <div className='input-row'>
                <div>
                  <span className="required-marker">*</span>
                  <label htmlFor="employeeType">Employee Type:</label>
                  <select id="employeeType" name="employeeType" value={formData.employeeType} onChange={handleInputChange} required>
                    <option value="" selected disabled hidden>select</option>
                    {dropdownData.employeeType && dropdownData.employeeType.length > 0 ? (
                      dropdownData.employeeType.map(option => (
                        <option key={option.masterId} value={option.data}>
                          {option.data}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>employeeType Not available</option>
                    )}
                  </select>
                </div>
                <div>
                  <span className="required-marker">*</span>
                  <label>Working Hours:</label>
                  <input className='selectIM' type="text" name="workingHours" value={formData.workingHours} onChange={handleInputChange} required />
                </div>
                <div>
                  <span className="required-marker">*</span>
                  <label htmlFor="state"> State</label>
                  <select id="state" name="state" value={formData.workState || ''} onChange={handleStateChange}  className='selectIM' required>
                    <option value="" disabled>Select a state</option>
                    {dropdownData.state && dropdownData.state.length > 0 ? (
                      dropdownData.state.map(option => (
                        <option key={option.masterId} value={option.data}>
                          {option.data}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No states available</option>
                    )}
                  </select>

                </div>
              </div>
              <div className='input-row'>

                <div>
                  <span className="required-marker">*</span>
                  <label htmlFor="Category">Employee Category</label>
                  <select id="employeeDayOffCategory" name="employeeDayOffCategory"   className='selectIM' value={formData.workCategory || ''} onChange={handleCategoryChange} required >
                    <option value="" disabled hidden>Select a category</option>
                    {dropdownData.employeeDayOffCategory && dropdownData.employeeDayOffCategory.length > 0 ? (
                      dropdownData.employeeDayOffCategory.map(option => (
                        <option key={option.masterId} value={option.data}>
                          {option.data}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Category Not available</option>
                    )}
                  </select>

                </div>
                <div>
                  <span className="required-marker">*</span>
                  <label htmlFor="region">Region</label>
                  <select
                   className='selectIM'
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select Region</option>
                    {dropdownData.region && dropdownData.region.length > 0 ? (
                      dropdownData.region.map(option => (
                        <option key={option.masterId} value={option.data}>
                          {option.data}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No regions available</option>
                    )}
                  </select>
                </div>

                <div>
                  <span className="required-marker">*</span>
                  <label htmlFor="department">Department</label>
                  <select
                   className='selectIM'
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select Department</option>
                    {dropdownData.department && dropdownData.department.length > 0 ? (
                      dropdownData.department.map(option => (
                        <option key={option.masterId} value={option.data}>
                          {option.data}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No departments available</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="input-row">
                <div>
                  <span className="required-marker">*</span>
                  <label htmlFor="department">Designation</label>
                  <select
                  className='selectIM'
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select Designation</option>
                    {dropdownData.designation && dropdownData.designation.length > 0 ? (
                      dropdownData.designation.map(option => (
                        <option key={option.masterId} value={option.data}>
                          {option.data}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No designations available</option>
                    )}
                  </select>
                </div>
                <div>
                  <span className="required-marker">*</span>
                  <label htmlFor="goalLevel">Level</label>
                  <select
                   className='selectIM'
                    id="goalLevel"
                    name="goalLevel"
                    value={formData.goalLevel}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select Level</option>
                    {dropdownData.goalLevel && dropdownData.goalLevel.length > 0 ? (
                      dropdownData.goalLevel.map(option => (
                        <option key={option.masterId} value={option.data}>
                          {option.data}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No levels available</option>
                    )}
                  </select>
                </div>

                <div>
                  <span className="required-marker">*</span>
                  <label htmlFor="type">Type</label>
                  <select
                   className='selectIM'
                    id="typeofGoal"
                    name="typeofGoal"
                    value={formData.typeofGoal}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select Type</option>
                    {dropdownData.typeofGoal && dropdownData.typeofGoal.length > 0 ? (
                      dropdownData.typeofGoal.map(option => (
                        <option key={option.masterId} value={option.data}>
                          {option.data}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No types available</option>
                    )}
                  </select>
                </div>


              </div>
              <div className='input-row'>
                <div>
                  <span className="required-marker">*</span>
                  <label htmlFor="reportingManager">Reporting Manager</label>
                  <input
                    className='selectIM'
                    type="text"
                    id="reportingManager"
                    name="reportingManager"
                    value={employeeSearchInput || getReportingManagerName()}
                    onChange={handleEmployeeSearchChange}

                    required
                  />

                  {employeeSearchError && (
                    <div className="toast">
                      <span style={{ color: 'red' }}>{employeeSearchError}</span>
                    </div>
                  )}

                  {employeeSearchResults.length > 0 && (
                    <ul className="dropdown2">
                      {employeeSearchResults.map((employee) => (
                        <li
                          key={employee.id}
                          onClick={() => handleSelectEmployee(employee)}
                          style={{ cursor: 'pointer' }}
                        >
                          {`${employee.firstName} ${employee.lastName}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <span className="required-marker">*</span>
                  <label>Confirmation Status:</label>
                  <select name="confirmationStatus" onChange={handleInputChange}  className='selectIM' value={formData.confirmationStatus || ''} required>
                    <option value="">Select Status</option>
                    <option value="false">On Probation</option>
                    <option value="true">Confirmed</option>
                  </select>
                </div>
                <div>
                  <span className="required-marker">*</span>
                  <label>Probation Period (Months):</label>
                  <select name="probationMonth" onChange={handleInputChange}  className='selectIM' value={formData.probationMonth || ''} required>
                    <option value="">Select Months</option>
                    {[...Array(24)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'month' : 'months'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {overtimeApplicable === 1 && (
              <div className='input-row'>
                <div>
                  <label>Overtime Rate (%):</label>
                  <input className='selectIM' type="number" name="overtimeRate" value={formData.overtimeRate} onChange={handleInputChange} onInput={handleInputChange} />
                </div>
                <div>
                  <label>Allowable Overtime Hours:</label>
                  <input className='selectIM' type="number" name="allowableOvertimeHours" value={formData.allowableOvertimeHours} onChange={handleInputChange} />
                </div>
                <div>
                  <label>Allowable Overtime Days:</label>
                  <input className='selectIM' type="number" name="allowableOvertimedays" value={formData.allowableOvertimedays} onChange={handleInputChange} />
                </div>
              </div>
            )}

            <div className="form-controls" style={{ gap: '50px' }}>
              <div>
                <div><strong>Special holiday access</strong></div>
                <label className="switch">
                  <input type="checkbox" checked={specialHolidayAccess === 1} onChange={handleSpecialHolidayAccessToggle} />
                  <span className="slider"></span>
                </label>
                <span>{specialHolidayAccess === 1 ? 'ON' : 'OFF'}</span>
              </div>

              <div>
                <div><strong>Overtime Applicable</strong></div>
                <label className="switch">
                  <input type="checkbox" checked={overtimeApplicable === 1} onChange={handleOvertimeApplicableToggle} />
                  <span className="slider"></span>
                </label>
                <span>{overtimeApplicable === 1 ? 'ON' : 'OFF'}</span>
              </div>
            </div>
            <div className='btnContainer'>
              <button type="submit" className='btn' onClick={handleUpdate}>Update Configuration</button>
              <button type="button" className="outline-btn" onClick={handleBack} >Back</button>
            </div>

            <button type="button" className="circle-button red-btn" onClick={handleDelete}>Delete Employee</button>

            {specialHolidayAccess === 1 && (
              <div className='form-controls'>
                <button type="button" className='btn' onClick={handlesetUpEmployeeDataClick}>Setup Employee Configuration</button>
              </div>
            )}

          </div>
        ) : (
          <div className="box-container">
            <span style={{ color: 'red' }}>No configuration for employee</span>
            {/* {!id && (
              <div className='form-controls'>
                <div>
                  <input type="text" id="employeeSearch" value={employeeSearchInput} onChange={handleEmployeeSearchChange} required placeholder="Search for an employee" />
                  {employeeSearchResults.length > 0 && (
                    <ul className={`dropdown2 ${employeeSearchResults.length > 4 ? 'multiple-results' : 'single-result'}`} style={{ marginTop: '5px' }}>
                      {employeeSearchResults.map((employee) => (
                        <li key={employee.id} onClick={() => handleSelectEmployee(employee)}>
                          {`${employee.firstName} ${employee.lastName}`}
                        </li>
                      ))}
                    </ul>
                  )}
                  {employeeSearchError && <span style={{ color: 'red' }}>{employeeSearchError}</span>}
                </div>
              </div>
            )} */}
            <div className='input-row'>
              <div>
                <span className="required-marker">*</span>
                <label htmlFor="employeeType">Employee Type:</label>
                <select id="employeeType" name="employeeType" value={formData.employeeType} onChange={handleInputChange} required>
                  <option value="" selected disabled hidden>select</option>
                  {dropdownData.employeeType && dropdownData.employeeType.length > 0 ? (
                    dropdownData.employeeType.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>employeeType Not available</option>
                  )}
                </select>
              </div>

              <div>
                <span className="required-marker">*</span>
                <label htmlFor="state"> State</label>
                <select

                  id="state"
                  name="state"
                  value={formData.workState || ''}
                  onChange={handleStateChange}
                  required
                >
                  <option value="" disabled>Select a state</option>
                  {dropdownData.state && dropdownData.state.length > 0 ? (
                    dropdownData.state.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No states available</option>
                  )}
                </select>

              </div>
              <div>
                <span className="required-marker">*</span>
                <label>Working Hours:</label>
                <input className='selectIM' style={{ marginTop: '10px' }} type="text" name="workingHours" value={formData.workingHours || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className='input-row'>

              <div>
                <span className="required-marker">*</span>
                <label htmlFor="Category">Employee Category</label>
                <select
                  id="employeeDayOffCategory"
                  name="employeeDayOffCategory"
                  value={formData.workCategory || ''}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="" disabled hidden>Select a category</option>
                  {dropdownData.employeeDayOffCategory && dropdownData.employeeDayOffCategory.length > 0 ? (
                    dropdownData.employeeDayOffCategory.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Category Not available</option>
                  )}
                </select>

              </div>
              <div>
                <span className="required-marker">*</span>
                <label htmlFor="region">Region</label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select Region</option>
                  {dropdownData.region && dropdownData.region.length > 0 ? (
                    dropdownData.region.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No regions available</option>
                  )}
                </select>
              </div>

              <div>
                <span className="required-marker">*</span>
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select Department</option>
                  {dropdownData.department && dropdownData.department.length > 0 ? (
                    dropdownData.department.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No departments available</option>
                  )}
                </select>
              </div>
            </div>


            <div className="input-row">
            <div>
                <span className="required-marker">*</span>
                <label htmlFor="designation">Designation</label>
                <select
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select Designation</option>
                  {dropdownData.designation && dropdownData.designation.length > 0 ? (
                    dropdownData.designation.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No designations available</option>
                  )}
                </select>
              </div>
              <div>
                <span className="required-marker">*</span>
                <label htmlFor="goalLevel">Level</label>
                <select
                  id="goalLevel"
                  name="goalLevel"
                  value={formData.goalLevel || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select Level</option>
                  {dropdownData.goalLevel && dropdownData.goalLevel.length > 0 ? (
                    dropdownData.goalLevel.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No levels available</option>
                  )}
                </select>
              </div>

              <div>
                <span className="required-marker">*</span>
                <label htmlFor="type">Type</label>
                <select
                  id="typeofGoal"
                  name="typeofGoal"
                  value={formData.typeofGoal}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select Type</option>
                  {dropdownData.typeofGoal && dropdownData.typeofGoal.length > 0 ? (
                    dropdownData.typeofGoal.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No types available</option>
                  )}
                </select>
              </div>
             
            </div>
            <div className='input-row'>
            <div>
                <span className="required-marker">*</span>
                <label htmlFor="reportingManager">Reporting Manager</label>
                <input
                  type="text"
                  id="reportingManager"
                  name="reportingManager"
                  value={employeeSearchInput}
                  onChange={handleEmployeeSearchChange}
                  required
                />
                {employeeSearchError && (
                  <div className="toast">
                    <span style={{ color: 'red' }}>{employeeSearchError}</span>
                  </div>
                )}
                {employeeSearchResults.length > 0 && (
                  <ul className="dropdown2">
                    {employeeSearchResults.map((employee) => (
                      <li
                        key={employee.id}
                        onClick={() => handleSelectEmployee(employee)} 
                        style={{ cursor: 'pointer' }}
                      >
                        {`${employee.firstName} ${employee.lastName}`} 
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label>Confirmation Status:</label>
                <select name="confirmationStatus" onChange={handleInputChange} value={formData.confirmationStatus || ''} required>
                  <option value="">Select Status</option>
                  <option value="false">On Probation</option>
                  <option value="true">Confirmed</option>
                </select>
              </div>
              <div>
                <label>Probation Period (Months):</label>
                <select name="probationMonth" onChange={handleInputChange} value={formData.probationMonth || ''} required>
                  <option value="">Select Months</option>
                  {[...Array(24)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i + 1 === 1 ? 'month' : 'months'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {overtimeApplicable === 1 && (
              <div className='input-row'>
                <div>
                  <label>Overtime Rate:</label>
                  <input className='selectIM' type="number" name="overtimeRate" value={formData.overtimeRate} onChange={handleInputChange} />
                </div>
                <div>
                  <label>Allowable Overtime Hours:</label>
                  <input className='selectIM' type="number" name="allowableOvertimeHours" value={formData.allowableOvertimeHours} onChange={handleInputChange} />
                </div>
                <div>
                  <label>Allowable Overtime Days:</label>
                  <input className='selectIM' type="number" name="allowableOvertimedays" value={formData.allowableOvertimedays} onChange={handleInputChange} />
                </div>
              </div>
            )}
            <div className="form-controls" style={{ gap: '50px' }}>
              <div>
                <div><strong>Special holiday access</strong></div>
                <label className="switch">
                  <input type="checkbox" checked={specialHolidayAccess === 1} onChange={handleSpecialHolidayAccessToggle} />
                  <span className="slider"></span>
                </label>
                <span>{specialHolidayAccess === 1 ? 'ON' : 'OFF'}</span>
              </div>

              <div>
                <div><strong>Overtime Applicable</strong></div>
                <label className="switch">
                  <input type="checkbox" checked={overtimeApplicable === 1} onChange={handleOvertimeApplicableToggle} />
                  <span className="slider"></span>
                </label>
                <span>{overtimeApplicable === 1 ? 'ON' : 'OFF'}</span>
              </div>
            </div>
            <div className='btnContainer'>

              <button type="submit" className='btn' onClick={handleSave}>Save</button>

              <button type="button" className="outline-btn" onClick={handleBack} >Back</button>
            </div>

            {specialHolidayAccess === 1 && (
              <div className='form-controls'>
                <button type="button" className='btn' onClick={handleSetupClick}>Setup Employee Configuration</button>
              </div>
            )}
          </div>
        )}


      </div>
    </div >
  );
};

export default EmployeeDetails;
