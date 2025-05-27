import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchDataByKey } from '../../Api';
import { strings } from '../../string';
import { toast } from 'react-toastify';

const AddTransfer = ({ onClose, onSave }) => {
  const companyId = localStorage.getItem('companyId');
  const createdById = localStorage.getItem('employeeId');

  const [dropdownData, setDropdownData] = useState({ region: [], department: [] });
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    fromDepartment: '',
    toDepartment: '',
    fromDepartmentId: '',
    toDepartmentId: '',
    fromRegion: '',
    toRegion: '',
    fromRegionId: '',
    toRegionId: '',
    transferDate: '',
    reason: '',
    reportingManagerName: '',
    reportingManagerId: '',
    responsiblePersonDisplayId: '',
    employeeDisplayId: ''
  });

  const [selectedEmployee, setSelectedEmployee] = useState({
    id: '',
    employeeId: '',
    employeeFirstName: '',
    employeeLastName: ''
  });

  const [selectedResponsiblePerson, setSelectedResponsiblePerson] = useState({
    id: '',
    employeeId: '',
    employeeFirstName: '',
    employeeLastName: ''
  });

  const [error, setError] = useState(null);
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [responsiblePersonSearchResults, setResponsiblePersonSearchResults] = useState([]);
  const [employeeSearchInput, setEmployeeSearchInput] = useState('');
  const [responsiblePersonSearchInput, setResponsiblePersonSearchInput] = useState('');
  const [employeeSearchError, setEmployeeSearchError] = useState('');
  const [responsiblePersonSearchError, setResponsiblePersonSearchError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workflowOptions, setWorkflowOptions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    e.preventDefault();
    const { employeeId, reportingManagerId } = formData;

    try {
      const response = await axios.post(
        `http://${strings.localhost}/api/Transfer-request/save/${employeeId}/${reportingManagerId}/${createdById}/${companyId}`,
        formData
      );

      console.log('Transfer saved:', response.data);
      onSave(response.data);
      toast.success("Transfer request created successfully!");
      onClose();
    } catch (error) {
      console.error('Error saving transfer:', error);
      toast.error('Failed to save transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const regions = await fetchDataByKey('region');
        const departments = await fetchDataByKey('department');
        setDropdownData({
          region: regions,
          department: departments,
        });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const fetchWorkflowIds = async () => {
      try {
        const response = await axios.get(`http://${strings.localhost}/api/workflow/names/${companyId}`);
        setWorkflowOptions(response.data);
      } catch (error) {
        console.error('Error fetching workflow Name', error);
      }
    };

    fetchWorkflowIds();
  }, []);

  const getEmployeeName = () => {
    const manager = formData.reportingManagerName;
    if (manager && typeof manager === 'object') {
      const { firstName = '', middleName = '', lastName = '' } = manager;
      return `${firstName} ${middleName} ${lastName}`.trim();
    }
    return employeeSearchInput || '';
  };

  const fetchEmployees = async (value) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/employees/search`, {
        params: { companyId, searchTerm: value.trim() },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
  };

  const handleEmployeeSelect = async (event) => {
    const { value } = event.target;

    setSelectedEmployee((prevEmployee) => ({
      ...prevEmployee,
      employeeId: value,
    }));

    if (value.trim() !== '') {
      try {
        const response = await axios.get(`http://${strings.localhost}/employees/${value}?companyId=${companyId}`);
        const employee = response.data;
        setSelectedEmployee((prevEmployee) => ({
          ...prevEmployee,
          employeeFirstName: employee.firstName,
        }));

        setError(null);
      } catch (error) {
        console.error('Error fetching employee details:', error);
        setError('Employee not found.');
        setSelectedEmployee((prevEmployee) => ({
          ...prevEmployee,
          employeeFirstName: '',
        }));
      }
    } else {
      setSelectedEmployee((prevEmployee) => ({
        ...prevEmployee,
        employeeFirstName: '',
      }));
      setError(null);
    }
  };

  const handleEmployeeSearchChange = async (e) => {
    const value = e.target.value;
    setEmployeeSearchInput(value);
    console.log("Search Input Value:", value);
    if (value.trim() === '') {
      setEmployeeSearchResults([]);
      setEmployeeSearchError('');
      return;
    }
    const filteredEmployees = await fetchEmployees(value);
    setEmployeeSearchResults(filteredEmployees);
    if (filteredEmployees.length === 0) {
      setEmployeeSearchError('No employees found.');
    } else {
      setEmployeeSearchError('');
    }
  };

  const handleResponsiblePersonSearchChange = async (e) => {
    const value = e.target.value;
    setResponsiblePersonSearchInput(value);
    if (value.trim() === '') {
      setResponsiblePersonSearchResults([]);
      setResponsiblePersonSearchError('');
      return;
    }
    const filteredEmployees = await fetchEmployees(value);
    setResponsiblePersonSearchResults(filteredEmployees);
    if (filteredEmployees.length === 0) {
      setResponsiblePersonSearchError('No employees found.');
    } else {
      setResponsiblePersonSearchError('');
    }
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeSearchInput(`${employee.firstName} ${employee.lastName}`);
    setEmployeeSearchResults([]);
    setEmployeeSearchError('');

    setFormData(prevData => ({
      ...prevData,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeDisplayId: employee.employeeId
    }));
  };

  const handleSelectResponsiblePerson = (employee) => {
    setSelectedResponsiblePerson(employee);
    setResponsiblePersonSearchInput(`${employee.firstName} ${employee.lastName}`);
    setResponsiblePersonSearchResults([]);
    setResponsiblePersonSearchError('');

    setFormData(prevData => ({
      ...prevData,
      reportingManagerId: employee.id,
      reportingManagerName: `${employee.firstName} ${employee.lastName}`,
      responsiblePersonDisplayId: employee.employeeId
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add New Transfer</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div>
          <div className='input-row'>
            <div>
              <span className="required-marker">*</span>
              <label htmlFor='workflowId'>Workflow ID:</label>
              <select className='selectIM' name='id' value={formData.id} onChange={handleInputChange} required >
                <option value='' ></option>
                {workflowOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.workflowName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Employee ID:</label>
              <input
                type="text"
                name="employeeDisplayId"
                value={formData.employeeDisplayId}
                onChange={handleEmployeeSelect}
                className='readonly'
                readOnly
              />
            </div>

            <div>
              <span className="required-marker">*</span>
              <label>Employee Name:</label>
              <input
                type="text"
                name="employeeName"
                value={employeeSearchInput || getEmployeeName()}
                onChange={handleEmployeeSearchChange}
                required
              />
              {error && <div className="toast"><span style={{ color: 'red' }}>{error}</span></div>}
              {employeeSearchResults.length > 0 && (
                <ul className="dropdown2">
                  {employeeSearchResults.map((employee) => (
                    <li
                      key={employee.id}
                      onClick={() => handleSelectEmployee(employee)}
                      style={{ cursor: 'pointer' }}
                    >
                      {`${employee.firstName} ${employee.lastName} `}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="input-row">
            <div>
              <span className="required-marker">*</span>
              <label>From Department:</label>
              <select
                name="fromDepartment"
                value={formData.fromDepartment}
                className='selectIM'
                onChange={(e) => {
                  const selectedDepartment = dropdownData.department.find(
                    r => r.data === e.target.value
                  );
                  setFormData(prev => ({
                    ...prev,
                    fromDepartment: e.target.value,
                    fromDepartmentId: selectedDepartment ? selectedDepartment.masterId : ''
                  }));
                }}
                required
              >
                <option value="">Select Department</option>
                {dropdownData.department && dropdownData.department.length > 0 ? (
                  dropdownData.department.map(option => (
                    <option key={option.masterId} value={option.data}>
                      {option.data}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Training Department Not available</option>
                )}
              </select>
            </div>

            <div>
              <span className="required-marker">*</span>
              <label>To Department:</label>
              <select
                name="toDepartment"
                value={formData.toDepartment}
                className='selectIM'
                onChange={(e) => {
                  const selectedDepartment = dropdownData.department.find(
                    r => r.data === e.target.value
                  );
                  setFormData(prev => ({
                    ...prev,
                    toDepartment: e.target.value,
                    toDepartmentId: selectedDepartment ? selectedDepartment.masterId : ''
                  }));
                }}
                required
              >
                <option value="">Select Department</option>
                {dropdownData.department && dropdownData.department.length > 0 ? (
                  dropdownData.department.map(option => (
                    <option key={option.masterId} value={option.data}>
                      {option.data}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Training Department Not available</option>
                )}
              </select>
            </div>
          </div>

          <div className="input-row">
            <div>
              <span className="required-marker">*</span>
              <label htmlFor="region">From Region:</label>
              <select
                name="fromRegion"
                value={formData.fromRegion}
                className='selectIM'
                onChange={(e) => {
                  const selectedRegion = dropdownData.region.find(
                    r => r.data === e.target.value
                  );
                  setFormData(prev => ({
                    ...prev,
                    fromRegion: e.target.value,
                    fromRegionId: selectedRegion ? selectedRegion.masterId : ''
                  }));
                }}
                required
              >
                <option value="">Select Region</option>
                {dropdownData.region && dropdownData.region.length > 0 ? (
                  dropdownData.region.map(option => (
                    <option key={option.masterId} value={option.data}>
                      {option.data}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Region Not available</option>
                )}
              </select>
            </div>

            <div>
              <span className="required-marker">*</span>
              <label>To Region:</label>
              <select
                name="toRegion"
                value={formData.toRegion}
                className='selectIM'
                onChange={(e) => {
                  const selectedRegion = dropdownData.region.find(
                    r => r.data === e.target.value
                  );
                  setFormData(prev => ({
                    ...prev,
                    toRegion: e.target.value,
                    toRegionId: selectedRegion ? selectedRegion.masterId : ''
                  }));
                }}
                required
              >
                <option value="">Select Region</option>
                {dropdownData.region && dropdownData.region.length > 0 ? (
                  dropdownData.region.map(option => (
                    <option key={option.masterId} value={option.data}>
                      {option.data}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Region Not available</option>
                )}
              </select>
            </div>
          </div>

          <div className='input-row'>
            <div>
              <span className="required-marker">*</span>
              <label>Transfer Date:</label>
              <input
                type="date"
                name="transferDate"
                value={formData.transferDate}
                className='selectIM'
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <span className="required-marker">*</span>
              <label>Reporting Manager Name:</label>
              <input
                type="text"
                name="responsiblePersonName"
                className='selectIM'
                value={responsiblePersonSearchInput || formData.reportingManagerName}
                onChange={handleResponsiblePersonSearchChange}
                required
              />
              {responsiblePersonSearchError && <div className="toast"><span style={{ color: 'red' }}>{responsiblePersonSearchError}</span></div>}
              {responsiblePersonSearchResults.length > 0 && (
                <ul className="dropdown2">
                  {responsiblePersonSearchResults.map((employee) => (
                    <li
                      key={employee.id}
                      onClick={() => handleSelectResponsiblePerson(employee)}
                      style={{ cursor: 'pointer' }}
                    >
                      {`${employee.firstName} ${employee.lastName} `}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label>Reason:</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>

          <div className="btnContainer">
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn" onClick={handleSubmit}>
              {isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTransfer;