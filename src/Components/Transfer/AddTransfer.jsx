import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchDataByKey } from '../../Api';
import { strings } from '../../string';

const AddTransfer = ({ onClose, onSave }) => {
    const companyId = localStorage.getItem('companyId');

  const [dropdownData, setDropdownData] = useState({ region: [], department: [] });

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    fromDepartment: '',
    toDepartment: '',
    fromRegion: '',
    toRegion: '',
    transferDate: '',
    reason: '',
    responsiblePersonName: '',
    responsiblePersonId: ''
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
  const [searchResults, setSearchResults] = useState([]);
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [responsiblePersonSearchResults, setResponsiblePersonSearchResults] = useState([]);
  const [employeeSearchInput, setEmployeeSearchInput] = useState('');
  const [responsiblePersonSearchInput, setResponsiblePersonSearchInput] = useState('');
  const [employees, setEmployees] = useState([]);
  const [employeeSearchError, setEmployeeSearchError] = useState('');
  const [responsiblePersonSearchError, setResponsiblePersonSearchError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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

  const getEmployeeName = () => {
    const manager = formData.reportingManager;
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
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`
    }));
  };

  const handleSelectResponsiblePerson = (employee) => {
    setSelectedResponsiblePerson(employee);
    setResponsiblePersonSearchInput(`${employee.firstName} ${employee.lastName}`);
    setResponsiblePersonSearchResults([]);
    setResponsiblePersonSearchError('');

    setFormData(prevData => ({
      ...prevData,
      responsiblePersonId: employee.employeeId,
      responsiblePersonName: `${employee.firstName} ${employee.lastName}`
    }));
  };

  const handleEmployeeNameChange = async (event) => {
    const { value } = event.target;

    setSelectedEmployee((prevEmployee) => ({
      ...prevEmployee,
      employeeFirstName: value,
    }));

    if (value.trim() !== '') {
      try {
        const response = await axios.get(`http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${value.trim()}`);
        setSearchResults(response.data);
        setError(null);
      } catch (error) {
        console.error('Error searching employee:', error);
        setError('Error searching for employees.');
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setError(null);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add New Transfer</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='input-row'>
            <div>
              <label>Employee ID:</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleEmployeeSelect}
                className='readonly'
                readOnly
              />
            </div>

            <div>
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
                    department: e.target.value,
                    deptId: selectedDepartment ? selectedDepartment.masterId : ''
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
                    department: e.target.value,
                    deptId: selectedDepartment ? selectedDepartment.masterId : ''
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
                    region: e.target.value,
                    regionId: selectedRegion ? selectedRegion.masterId : ''
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
                    region: e.target.value,
                    regionId: selectedRegion ? selectedRegion.masterId : ''
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
              <label>Responsible Person Name:</label>
              <input
                type="text"
                name="responsiblePersonName"
                className='selectIM'
                value={responsiblePersonSearchInput || formData.responsiblePersonName}
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

          <div className="form-controls">
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Save Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransfer;