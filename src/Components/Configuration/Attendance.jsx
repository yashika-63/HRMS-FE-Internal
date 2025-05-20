import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faEdit, faTrash, faSearch, faSave } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { strings } from "../../string";
import '../CommonCss/Attendance.css';
import { showToast } from "../../Api.jsx";
const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const companyId = localStorage.getItem('companyId');

  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 3; i > 0; i--) {
      years.push(currentYear - i);
    }
    years.push(currentYear);
    for (let i = 1; i <= 2; i++) {
      years.push(currentYear + i);
    }
    return years;
  };




  // Fetch all active employees
  const fetchAllEmployees = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://${strings.localhost}/employees/employees/active?companyId=${companyId}&page=${page}&size=${size}`);
      setEmployees(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  // Fetch payroll data for the selected year and month
  const fetchPayrollData = async (year, month) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/payroll-hours/byCompanyAndMonthAndYear?companyId=${companyId}&month=${month}&year=${year}`);

      if (response.data && response.data.length === 0) {
        setPayrollData([]);
        showToast('No working hour available for the selected month and year.', 'warn');
      } else {
        setPayrollData(response.data);
        showToast('Working hours fetched successfully.', 'success');
      }
    } catch (error) {
      showToast('Error fetching working hours.', 'warn');
    }
  };


  const searchEmployeeText = async (text) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${text}`);
      setSearchResults(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      showToast('No employee found.', 'error');
      setSearchResults([]);
    }
  };

  // Handle year and month change
  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    fetchPayrollData(newYear, selectedMonth);
  };

  const handleMonthChange = (e) => {
    const selectedMonthName = e.target.value;
    const monthIndex = monthNames.indexOf(selectedMonthName) + 1;
    setSelectedMonth(monthIndex);
    fetchPayrollData(selectedYear, monthIndex);
  };

  const handleSaveClick = async () => {
    const selectedDate = new Date(selectedYear, selectedMonth - 1, 21);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    const employeesToSave = payrollData.filter(payroll =>
      payroll.actualHours >= 0 && payroll.expectedHours >= 0 && payroll.assignHours >= 0
    );

    if (employeesToSave.length === 0) {
      console.log('No valid employee data to save.');
      return;
    }
    const payload = employeesToSave.map(payroll => ({
      assignHours: payroll.assignHours,
      expectedHours: payroll.expectedHours,
      actualHours: payroll.actualHours,
      date: formattedDate,
      employee: {
        id: payroll.employee.id
      }
    }));

    try {
      const response = await axios.post(`http://${strings.localhost}/api/payroll-hours/storeMain/${companyId}`, payload);
      if (response.status === 200) {
        showToast('Working hours saved successfully.', 'success');
      } else {
        showToast('Failed to save Working hours.', 'error');
      }
    } catch (error) {
      showToast('Error saving working hours.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) {
      console.log("deleteId", deleteId);
      return;
    }
    try {
      const response = await axios.delete(`http://${strings.localhost}/api/payroll-hours/delete/${deleteId}`);
      if (response.status === 200) {
        fetchPayrollData(selectedYear, selectedMonth);
        showToast(response.data, 'success');
        setShowConfirmation(false);
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch (error) {
      showToast('Error while deleting', 'error');
    }
  };

  const handleInputChange = (e, employeeId, field) => {
    let value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      const updatedPayrollData = payrollData.map((payroll) =>
        payroll.employee.id === employeeId
          ? { ...payroll, [field]: value === '' ? '' : parseFloat(value) }
          : payroll
      );

      if (!payrollData.find(p => p.employee.id === employeeId)) {
        updatedPayrollData.push({
          employee: { id: employeeId },
          actualHours: field === 'actualHours' ? value : '',
          assignHours: field === 'assignHours' ? value : '',
          expectedHours: field === 'expectedHours' ? value : '',
        });
      }
      setPayrollData(updatedPayrollData);
    } else {
      showToast('Please enter a valid number', 'warn');
    }
  };

  const handleChange = (e, field) => {
    const { value } = e.target;
    const parsedValue = value === '' ? '' : parseFloat(value);
    if (parsedValue < 0 || isNaN(parsedValue)) {
      showToast('Negative values are not allowed', 'warn');
      return;
    }
    setSelectedEmployee(prevState => ({
      ...prevState,
      [field]: parsedValue
    }));
  };

  useEffect(() => {
    fetchAllEmployees(currentPage, pageSize);
    fetchPayrollData(selectedYear, selectedMonth);
  }, [currentPage, pageSize, companyId, selectedYear, selectedMonth]);


  const handleSearchInputChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setError(null);
    if (query) {
      searchEmployeeText(query);
    } else {
      setSearchResults([]);
    }
  };


  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const openConfirmationPopup = (payrollId) => {
    const payroll = payrollData.find((payroll) => payroll.id === payrollId);
    if (payroll) {
      setDeleteId(payroll.id);
      setShowConfirmation(true);
    }
  };


  const handleEditClick = (payrollId) => {
    const payrollToEdit = payrollData.find((payroll) => payroll.id === payrollId);
    if (!payrollToEdit) {
      console.log('Payroll not found');
      return;
    }
    setSelectedEmployee(payrollToEdit);
    setIsUpdatePopupOpen(true);
  };

  const handleUpdate = async (payrollId) => {
    if (!selectedEmployee || !selectedEmployee.id) {
      showToast(' Attendance not found', 'error');
      return;
    }
    const updatedEmployeeData = {
      payrollId: selectedEmployee.id,
      assignHours: selectedEmployee.assignHours,
      expectedHours: selectedEmployee.expectedHours,
      actualHours: selectedEmployee.actualHours,
    };

    try {
      const response = await axios.put(
        `http://${strings.localhost}/api/payroll-hours/update/${selectedEmployee.id}`,
        updatedEmployeeData
      );

      if (response.status === 200) {
        console.log('Data updated successfully');
        fetchPayrollData(selectedYear, selectedMonth);
        showToast('Updated successfully', 'success');
        setIsUpdatePopupOpen(false);
      } else {
        console.log('Failed to update employee data');
        showToast('Error while updating', 'error');
      }
    } catch (error) {
      console.error('Error updating employee data:', error);
      showToast('Error updating employee data', 'error');
    }
  };

  const editDropdownMenu = (payrollId) => (
    <div className="dropdown">
      <button className="dots-button">
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      <div className="dropdown-content">
        <div>
          <button onClick={() => handleEditClick(payrollId)}>
            <FontAwesomeIcon className="ml-2" icon={faEdit} /> Update
          </button>
        </div>
        <div>
          <button onClick={() => openConfirmationPopup(payrollId)}>
            <FontAwesomeIcon className="ml-2" icon={faTrash} /> Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="coreContainer">
      <div className="form-title">Employee Working Hours / Attendance</div>

      <div className="middleline-btn">


        <div>
          <select value={selectedYear} onChange={handleYearChange}>
            {generateYearRange().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <select value={monthNames[selectedMonth - 1]} onChange={handleMonthChange}>
            {monthNames.map((month, index) => (
              <option key={index} value={month}>{month}</option>
            ))}
          </select>
        </div>
        <div className="search-bar" style={{ marginBottom: '-10px', marginLeft: '600px' }}>
          <input
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <FontAwesomeIcon
            className="search-icon"
            icon={faSearch}
            onClick={() => handleSearchInputChange(searchQuery)}
          />
        </div>
      </div>
      <table className="Attendance-table" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Actual Working Hours</th>
            <th>Total Working Hours</th>
            <th>Expected Working Hours</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {(searchResults.length > 0 ? searchResults : employees).map((employee) => {
            const payroll = payrollData.find(p => p.employee.id === employee.id);
            const actualHours = payroll ? payroll.actualHours : '';
            const assignHours = payroll ? payroll.assignHours : '';
            const expectedHours = payroll ? payroll.expectedHours : '';
            return (
              <tr key={employee.id}>
                <td style={{ verticalAlign: 'middle' }}>{`${employee.firstName} ${employee.middleName} ${employee.lastName}`}</td>
                <td>
                  <input
                    type="text"
                    value={actualHours || ''}
                    onChange={(e) => handleInputChange(e, employee.id, "actualHours")}
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={assignHours || ''}
                    onChange={(e) => handleInputChange(e, employee.id, "assignHours")}
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={expectedHours || ''}
                    onChange={(e) => handleInputChange(e, employee.id, "expectedHours")}
                    min="0"
                  />
                </td>
                <td>{editDropdownMenu(payroll ? payroll.id : null)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="form-controls">
        <button onClick={handleSaveClick} className="btn">Save All</button>
        <button
          type="button"  className='pagination-btn' onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} aria-label="Previous Page" >
         Previous
        </button>
        <span> {currentPage + 1} of {totalPages}</span>
        <button
          type="button" className='pagination-btn' onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} aria-label="Next Page" >
          Next
        </button>
      </div>

      {isUpdatePopupOpen && selectedEmployee && (
        <div className="add-popup">
          <div className="popup-content">
            <h3 className="title">Update Employee Data</h3>
            <div>
              <div className="input-row">
                <div>
                  <label><strong>Name:</strong></label>
                  <input
                    type="text"
                    value={`${selectedEmployee.employee.firstName} ${selectedEmployee.employee.middleName} ${selectedEmployee.employee.lastName}`}
                    readOnly
                  />
                </div>

                <div>
                  <label>Actual Working Hours:</label>
                  <input type="number" value={selectedEmployee.actualHours || ''} onChange={(e) => handleChange(e, 'actualHours')} min="0" />
                </div>
              </div>
              <div className="input-row">
                <div>
                  <label>Total Working Hours:</label>
                  <input type="number" value={selectedEmployee.assignHours || ''} onChange={(e) => handleChange(e, 'assignHours')} min="0" />
                </div>
                <div>
                  <label>Expected Working Hours:</label>
                  <input type="number" value={selectedEmployee.expectedHours || ''} onChange={(e) => handleChange(e, 'expectedHours')} min="0" />
                </div>
              </div>
            </div>
            <div className="btnContainer">
              <button className="btn" onClick={handleUpdate}>Update</button>
              <button className="outline-btn" onClick={() => setIsUpdatePopupOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
          <p>Are you sure you want to delete?</p>
          <div className="btnContainer">
            <button className="btn" onClick={handleDelete}> Yes </button>
            <button className="outline-btn" onClick={() => setShowConfirmation(false)}> No </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default Attendance;




































































































