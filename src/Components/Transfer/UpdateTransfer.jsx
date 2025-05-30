import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchDataByKey } from '../../Api';
import { strings } from '../../string';
import { toast } from 'react-toastify';

const UpdateTransfer = ({ transferId, onClose, onUpdate }) => {
  const companyId = localStorage.getItem('companyId');
  const [loading, setLoading] = useState(true);
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
    reportingManagerName: '',
    reportingManagerId: '',
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

  useEffect(() => {
    const fetchTransferData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://${strings.localhost}/api/Transfer-request/get-by-transfer/${transferId}`);
        const transfer = response.data;

        // First get dropdown data if not already loaded
        if (dropdownData.department.length === 0 || dropdownData.region.length === 0) {
          const regions = await fetchDataByKey('region');
          const departments = await fetchDataByKey('department');
          setDropdownData({ region: regions, department: departments });
        }

        // Find IDs from dropdown data if not provided in response
        const findId = (type, value) => {
          const items = type === 'region' ? dropdownData.region : dropdownData.department;
          const found = items.find(item => item.data === value);
          return found ? found.masterId : '';
        };

        setFormData({
          employeeName: transfer.employeeName || '',
          employeeId: transfer.employee?.id || transfer.employeeId || '',
          fromDepartment: transfer.fromDepartment || '',
          toDepartment: transfer.toDepartment || '',
          fromRegion: transfer.fromRegion || '',
          toRegion: transfer.toRegion || '',
          transferDate: transfer.transferDate || '',
          reason: transfer.reason || '',
          reportingManagerName: transfer.reportingManagerName || '',
          reportingManagerId: transfer.reportingManagerId || '',
          employeeDisplayId: transfer.employee?.employeeId || transfer.employeeId || '',
          // Initialize IDs - use response if available, otherwise find from dropdown
          fromDepartmentId: transfer.fromDepartmentId || findId('department', transfer.fromDepartment),
          toDepartmentId: transfer.toDepartmentId || findId('department', transfer.toDepartment),
          fromRegionId: transfer.fromRegionId || findId('region', transfer.fromRegion),
          toRegionId: transfer.toRegionId || findId('region', transfer.toRegion)
        });

        setEmployeeSearchInput(transfer.employeeName || '');
        setResponsiblePersonSearchInput(transfer.reportingManagerName || '');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transfer data:', error);
        toast.error('Failed to load transfer data');
        setLoading(false);
      }
    };

    if (transferId) {
      fetchTransferData();
    }
  }, [transferId]);

  const handleDepartmentChange = (fieldName, value) => {
    const selectedDepartment = dropdownData.department.find(
      r => r.data === value
    );

    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
      ...(fieldName === 'fromDepartment'
        ? { fromDepartmentId: selectedDepartment?.masterId || '' }
        : { toDepartmentId: selectedDepartment?.masterId || '' })
    }));
  };

  const handleRegionChange = (fieldName, value) => {
    const selectedRegion = dropdownData.region.find(
      r => r.data === value
    );

    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
      ...(fieldName === 'fromRegion'
        ? { fromRegionId: selectedRegion?.masterId || '' }
        : { toRegionId: selectedRegion?.masterId || '' })
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        employeeName: formData.employeeName,
        employeeId: formData.employeeId,
        fromDepartment: formData.fromDepartment,
        toDepartment: formData.toDepartment,
        fromRegion: formData.fromRegion,
        toRegion: formData.toRegion,
        transferDate: formData.transferDate,
        reason: formData.reason,
        reportingManagerName: formData.reportingManagerName,
        reportingManagerId: formData.reportingManagerId,
        fromDepartmentId: formData.fromDepartmentId,
        toDepartmentId: formData.toDepartmentId,
        fromRegionId: formData.fromRegionId,
        toRegionId: formData.toRegionId
      };

      const response = await axios.put(
        `http://${strings.localhost}/api/Transfer-request/update-transfer/${transferId}`,
        payload
      );

      if (response.status === 200) {
        onUpdate(response.data);
        toast.success("Transfer record updated successfully!");
        onClose();
      }
    } catch (error) {
      console.error('Error updating transfer:', error);
      toast.error(error.response?.data?.message || 'Failed to update transfer');
    } finally {
      setLoading(false);
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
        if (transferId) {
          await fetchTransferData();
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, [transferId]);

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
      reportingManagerId: employee.employeeId,
      reportingManagerName: `${employee.firstName} ${employee.lastName}`
    }));
  };

  if (loading && !formData.employeeId) {
    return <div className="modal-overlay">Loading...</div>;
  }

  if (error) {
    return <div className="modal-overlay">{error}</div>;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Update Transfer</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='input-row'>
            <div>
              <label>Employee ID:</label>
              <input
                type="text"
                name="employeeDisplayId"
                value={formData.employeeDisplayId || formData.employeeId}
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
                onChange={(e) => handleDepartmentChange('fromDepartment', e.target.value)}
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
                onChange={(e) => handleDepartmentChange('toDepartment', e.target.value)}
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
                onChange={(e) => handleRegionChange('fromRegion', e.target.value)}
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
                onChange={(e) => handleRegionChange('toRegion', e.target.value)}
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

          <div className="form-controls">
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTransfer;