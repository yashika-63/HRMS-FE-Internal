import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { strings } from '../../string';
import { fetchDataByKey, fetchValueByKey } from '../../Api.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlusCircle, faAdd, faSave, faEdit, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { parseISO } from 'date-fns';
import { showToast } from '../../Api.jsx';

const UpdateExpense = ({ visible, onClose, selectedExpense, onSubmit }) => {

  const companyId = localStorage.getItem("companyId");
  const [workflowOptions, setWorkflowOptions] = useState([]);
  const [selectedWorkflowName, setSelectedWorkflowName] = useState('');
  const accountId = localStorage.getItem("accountId");
  const employeeId = localStorage.getItem("employeeId");
  const [selectedLeaveId, setSelectedLeaveId] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [dropdownError, setDropdownError] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);


  const [expenseManagement, setExpenseManagement] = useState({
    expenseId: '',
    expensePurpose: '',
    expenseAmountSpent: '',
    expenseDetails: [],
    expenseCost: '',
    expenseCategory: '',
    expenseTransectionType: '',
    expenseDate: '',
    expenseFromDate: '',
    expenseTillDate: '',
    workflowMainId: '',
    expenseType: '',
    id: '',
    currencyCode: '',

  });

  const [formData, setFormData] = useState({
    currency: '',
    expenseAmountSpent: '',
    expenseCategory: '',
    employeeId: '',
    name: '',
    department: '',
    designation: '',
    expenseFromDate: '',
    expenseDate: '',
    expenseTillDate: '',
    expensePurpose: '',
    expenseTransectionType: '',
    extraNotes: '',
    onBehalfOf: ''
  });
  const [expenseDetail, setExpenseDetail] = useState({
    expenseCost: '',
    expenseCategory: '',
    expenseTransectionType: '',
    expenseDate: ''
  });


  const [expenseDetails, setExpenseDetails] = useState({
    expenseCost: '',
    expenseCategory: '',
    expenseTransectionType: '',
    expenseDate: ''
  });
  const [employeeDetails, setEmployeeDetails] = useState({
    name: '',
    department: '',
    designation: '',
    employeeId: ''
  });
  const [dropdownData, setDropdownData] = useState({
    currency_code: [],
    expenseTransectionType: [],
    expenseType: [],
    expenseCategory: [],
  });


  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const currencyCode = await fetchValueByKey('currency_code');
        const expenseType = await fetchDataByKey('expenseType');
        const expenseCategory = await fetchDataByKey('expenseCategory');
        const expenseTransectionType = await fetchDataByKey('expenseTransectionType');
        setDropdownData({
          currency_code: currencyCode,
          expenseType: expenseType,
          expenseCategory: expenseCategory,
          expenseTransectionType: expenseTransectionType
        });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();

  }, []);

  const fetchExpenseDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://${strings.localhost}/api/expense/GetExpenseById?id=${selectedExpense}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const formattedExpenseDetails = response.data.expenseDetails.map(detail => ({
        ...detail,
        expenseDate: formatDateForDisplay(detail.expenseDate)
      }));
      setExpenseManagement(response.data);
      setFormData({
        ...formData,
        currencyCode: response.data.currencyCode,
        expenseAmountSpent: response.data.expenseAmountSpent,
        expenseCategory: response.data.expenseCategory,
        employeeId: response.data.employeeId,
        name: response.data.name,
        department: response.data.department,
        designation: response.data.designation,
        // expenseFromDate: response.data.formatDateForDisplay(expenseFromDate),
        // expenseTillDate: response.data.formatDateForDisplay(expenseTillDate),
        expensePurpose: response.data.expensePurpose,
        expenseTransectionType: response.data.expenseTransectionType,
        extraNotes: response.data.extraNotes,
        expenseCost: response.data.expenseCost,
        expenseType: response.data.expenseType,
        expenseDate: formatDateForDisplay(response.data.expenseDate),
        expenseFromDate: formatDateForDisplay(response.data.expenseFromDate),
        expenseTillDate: formatDateForDisplay(response.data.expenseTillDate),
        expenseDetails: formattedExpenseDetails
      });
    } catch (error) {
      console.error('Error fetching expense details:', error);
    }
  }, [selectedExpense]);


  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';

    try {
      const date = parseISO(dateString);
      return format(date, 'dd-MM-yyyy');
    } catch (error) {
      console.error('Invalid date format:', error);
      return '';
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    try {
      // Parse the ISO date string
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error('Invalid date'); // Check for invalid date

      // Return in the format 'yyyy-MM-dd'
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Invalid date format:', error);
      return '';
    }
  };


  const fetchWorkflowData = useCallback(async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      const response = await axios.get(`http://${strings.localhost}/api/workflow/names/${companyId}`);
      setDropdownData((prevState) => ({
        ...prevState,
        workflowMain: response.data
      }));
    } catch (error) {
      console.error('Error fetching workflow data:', error);
    }
  }, []);

  useEffect(() => {
    if (workflowOptions.length > 0) {
      setSelectedWorkflowName(workflowOptions[0].workflowName); // or however you want to set the selected name
    }
  }, [workflowOptions]);

  const fetchEmployeeDetails = useCallback(async () => {
    try {
      const employeeId = localStorage.getItem('employeeId');
      const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`);
      const employee = response.data;
      setEmployeeDetails({
        name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
        department: employee.department,
        designation: employee.designation,
        employeeId: employee.employeeId
      });
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  }, []);

  useEffect(() => {
    if (visible && selectedExpense) {
      fetchExpenseDetails();
      fetchWorkflowData();
      fetchEmployeeDetails();
    }
  }, [visible, selectedExpense, fetchExpenseDetails, fetchWorkflowData, fetchEmployeeDetails]);

  const handleMainChange = (e) => {
    const { name, value } = e.target;

    setExpenseManagement(prev => {
      const updatedExpenseManagement = { ...prev, [name]: value };

      // If the expense type changes, reset dates
      if (name === 'expenseType') {
        updatedExpenseManagement.expenseFromDate = ''; // Reset From Date
        updatedExpenseManagement.expenseTillDate = ''; // Reset To Date
        setValidationMessage(''); // Clear previous validation message
      }

      // Validate date fields if either date field changes or expense type changes
      if (name === 'expenseFromDate' || name === 'expenseTillDate' || name === 'expenseType') {
        const { expenseFromDate, expenseTillDate, expenseType } = updatedExpenseManagement;
        const isValid = isValidDateRange(expenseFromDate, expenseTillDate, expenseType);

        // If invalid, set the appropriate message
        if (!isValid.valid) {
          setValidationMessage(isValid.message);
          return prev; // Return previous state if dates are invalid
        }
      }

      return updatedExpenseManagement; // Update state if valid
    });
  };



  const validateExpenseDate = (expenseDate) => {
    const fromDate = new Date(expenseManagement.expenseFromDate);
    const tillDate = new Date(expenseManagement.expenseTillDate);
    const date = new Date(expenseDate);

    if (expenseDate && (date < fromDate || date > tillDate)) {
      setValidationMessage('Expense date must be between the selected from and to dates.');
    } else {
      setValidationMessage('');
    }
  };

  useEffect(() => {
    if (expenseDetails.expenseDate) {
      validateExpenseDate(expenseDetails.expenseDate);
    }
  }, [expenseManagement.expenseFromDate, expenseManagement.expenseTillDate]);

  useEffect(() => {
    if (expenseManagement.expenseDetails.length > 0) {
      const allDetailsAdded = expenseManagement.expenseDetails.every(detail =>
        detail.expenseDate && detail.expenseCost && detail.expenseCategory && detail.expenseTransectionType
      );
      setIsSubmitDisabled(!allDetailsAdded);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [expenseManagement.expenseDetails]);

  const handleDetailChange = (e, index) => {
    const { name, value } = e.target;

    if (name === 'expenseDate') {
      // Convert 'dd-MM-yyyy' to ISO format for state
      const formattedDate = formatDateForInput(value);
      setExpenseManagement(prevState => {
        const updatedDetails = prevState.expenseDetails.map((detail, i) =>
          i === index ? { ...detail, [name]: formattedDate } : detail
        );
        return { ...prevState, expenseDetails: updatedDetails };
      });
    } else {
      setExpenseManagement(prevState => {
        const updatedDetails = prevState.expenseDetails.map((detail, i) =>
          i === index ? { ...detail, [name]: value } : detail
        );
        return { ...prevState, expenseDetails: updatedDetails };
      });
    }
    if (name === 'expenseDate') {
      validateExpenseDate(value);
    }

    if (name === 'expenseCost') {
      if (isNaN(value) || parseFloat(value) <= 0) {
        setValidationMessage('Expense cost must be a positive number.');
      } else if (parseFloat(value) > parseFloat(expenseManagement.expenseAmountSpent)) {
        setValidationMessage('Expense cost should not exceed amount spent.');
      } else {
        setValidationMessage('');
      }
    }

    if (name === 'expenseAmountSpent') {
      if (isNaN(value) || parseFloat(value) <= 0) {
        setValidationMessage('Amount spent must be a positive number.');
      } else {
        setValidationMessage('');
      }
    }
  };


  const addDetail = () => {
    setExpenseManagement((prevState) => ({
      ...prevState,
      expenseDetails: [...prevState.expenseDetails, {
        expenseDate: '',
        expenseCost: '',
        expenseCategory: '',
        expenseTransectionType: ''
      }]
    }));
  };

  const removeDetail = (index) => {
    setExpenseManagement((prevState) => ({
      ...prevState,
      expenseDetails: prevState.expenseDetails.filter((_, i) => i !== index)
    }));
    setShowDeleteConfirmation(false);

  };
  // const updateDetail = async (index) => {

  //   try {
  //     const token = localStorage.getItem('token');
  //     console.log('levaeid',selectedLeaveId)
  //     const response = await axios.put(
  //       `http://${strings.localhost}/api/expensedetails/${expenseDetails.id}`,
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           // 'Authorization': `Bearer ${token}`
  //         }
  //       }
  //     );
  //     console.log('Expense Detail updated successfully:', response.data);
  //     alert('Expense Detail updated successfully.');
  //     if (onSubmit) {
  //       onSubmit(formData);
  //     }
  //     if (onClose) {
  //       onClose();
  //     }
  //   } catch (error) {

  //     console.error('There was an error updating the leave application:', error);
  //     alert('There was an error updating the leave application. Please try again.');
  //   }
  // };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://${strings.localhost}/api/expense/update/${expenseManagement.id}`,
        expenseManagement,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      showToast("Expense Updated Successfully.",'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      onClose();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A'; // Check if date is invalid

    return format(date, 'yyyy-MM-dd');
  };


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


  const handleFormDataChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const updateDetail = async (index) => {
    try {
      const token = localStorage.getItem('token');
      const detailToUpdate = expenseManagement.expenseDetails[index];

      if (!detailToUpdate || !detailToUpdate.id) {
        showToast('Detail not found or ID is missing.','error');
        return;
      }

      const response = await axios.put(
        `http://${strings.localhost}/api/expensedetails/${detailToUpdate.id}`,
        {
          expenseDate: detailToUpdate.expenseDate,
          expenseCost: detailToUpdate.expenseCost,
          expenseCategory: detailToUpdate.expenseCategory,
          expenseTransectionType: detailToUpdate.expenseTransectionType,
          // Include any other fields you want to update
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      showToast('Expense Detail updated successfully.','success');

      // Optionally trigger any updates in the parent component
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('There was an error updating the expense detail:', error);
      showToast('There was an error updating the expense detail. Please try again.','error');
    }
  };

  const SaveDetail = async (index) => {
    try {
      const token = localStorage.getItem('token');

      const detailToSave = expenseManagement.expenseDetails[index]; // Get the detail to save

      const response = await axios.post(
        `http://${strings.localhost}/api/expensedetails/save/${expenseManagement.id}`,
        {
          expenseDate: detailToSave.expenseDate,
          expenseCost: detailToSave.expenseCost,
          expenseCategory: detailToSave.expenseCategory,
          expenseTransectionType: detailToSave.expenseTransectionType,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      showToast('Expense Detail Added successfully.','success');

      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('There was an error Adding the expense detail:', error);
      showToast('There was an error Adding the expense detail. Please try again.','error');
    }
  };

  const validateDates = () => {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const fromDate = new Date(expenseManagement.expenseFromDate);
    const tillDate = new Date(expenseManagement.expenseTillDate);

    let valid = true;

    // Validate From Date: Should be within last three months or any future date
    if (fromDate < threeMonthsAgo && fromDate < today) {
      setValidationMessage('From Date must be within the last three months or any future date.');
      valid = false;
    }

    // Validate To Date: Should not be before From Date
    if (tillDate < fromDate) {
      setValidationMessage('To Date cannot be before From Date.');
      valid = false;
    }

    // Validate Expense Date: Should be between From and To Dates
    if (expenseDetail.expenseDate) {
      const expenseDate = new Date(expenseDetail.expenseDate);
      if (expenseDate < fromDate || expenseDate > tillDate) {
        setValidationMessage('Expense Date must be between From and To Dates.');
        valid = false;
      }
    }

    if (valid) {
      setValidationMessage('');
    }
  };

  useEffect(() => {
    validateDates();
  }, [expenseManagement.expenseFromDate, expenseManagement.expenseTillDate, expenseDetail.expenseDate]);

  const isValidDateRange = (fromDateStr, tillDateStr, expenseType) => {
    const today = new Date();
    const fromDate = new Date(fromDateStr); // Date input is in YYYY-MM-DD format
    const tillDate = new Date(tillDateStr); // Date input is in YYYY-MM-DD format

    // Check if the expense type is 'Advance'
    if (expenseType === 'Advance') {
      if (fromDate < today.setHours(0, 0, 0, 0)) {
        return { valid: false, message: 'For Advance, From Date cannot be in the past.' };
      }
      if (tillDate < fromDate) {
        return { valid: false, message: 'To Date cannot be before From Date.' };
      }
    } else if (expenseType === 'Reimbursement') {
      if (fromDate > today.setHours(0, 0, 0, 0)) {
        return { valid: false, message: 'For Reimbursement, From Date cannot be in the future.' };
      }
      if (tillDate < fromDate) {
        return { valid: false, message: 'To Date cannot be before From Date.' };
      }
    }

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    if (fromDate < threeMonthsAgo || tillDate < threeMonthsAgo) {
      return { valid: false, message: 'Dates must be within the last three months.' };
    }

    return { valid: true, message: '' }; // All conditions met
  };

  const requestDeleteConfirmation = (index) => {
    setDeleteIndex(index);
    setShowDeleteConfirmation(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className='form-title'>Update Expense Management</h2>
          <button className="buttonClose" onClick={onClose}>x</button>
        </div>
        <div className="modal-body">
          <div className="input-row">
            <div>
              <label htmlFor="employeeName">Employee Name:</label>
              <input type="text" id="employeeName" name="employeeName" value={employeeDetails.name} readOnly className='readonly' />
            </div>
            <div>
              <label htmlFor="Id">Employee ID:</label>
              <input type="text" id="Id" name="Id" value={employeeDetails.employeeId} className='readonly' />
            </div>
            <div>
              <label htmlFor="employeeDepartment">Department:</label>
              <input type="text" id="employeeDepartment" name="employeeDepartment" value={employeeDetails.department} readOnly className='readonly' />
            </div>
            <div>
              <label htmlFor="employeeDesignation">Designation:</label>
              <input type="text" id="employeeDesignation" name="employeeDesignation" value={employeeDetails.designation} readOnly className="readonly" />
            </div>

          </div>
          <div className="input-row">
            <div>
              <label htmlFor='workflowId'>Workflow Name:</label>
              <input type="text" value={selectedWorkflowName || 'No workflow selected'} readOnly className='readonly' />
            </div>

            <div>
              <label htmlFor="expensePurpose">Expense Description:</label>
              <input type="text" id="expensePurpose" name="expensePurpose" value={expenseManagement.expensePurpose} onChange={handleMainChange} className="inputField" />
            </div>

            <div>
              <label htmlFor="currency">Currency:</label>
              <select className='selectIM' id="currencyCode" name="currencyCode" value={expenseManagement.currencyCode} onChange={handleMainChange} required >
                <option value="" selected disabled hidden></option>
                {dropdownData.currency_code && dropdownData.currency_code.length > 0 ? (
                  dropdownData.currency_code.map(option => (
                    <option key={option.masterId} value={option.data}>
                      {option.data}
                    </option>
                  ))
                ) : (
                  <option value="" disabled> Not available</option>
                )}
              </select>

            </div>

            <div>
              <span className="required-marker">*</span>
              <label htmlFor="expenseType">Expense Type:</label>
              <select className='selectIM' id="expenseType" name="expenseType" value={expenseManagement.expenseType} onChange={handleMainChange} required >
                <option value="" selected disabled hidden></option>
                {dropdownData.expenseType && dropdownData.expenseType.length > 0 ? (
                  dropdownData.expenseType.map(option => (
                    <option key={option.masterId} value={option.data}>
                      {option.data}
                    </option>
                  ))
                ) : (
                  <option value="" disabled> Not available</option>
                )}
              </select>
            </div>

          </div>
          <div className="input-row">
            <div>
              <label htmlFor="expenseAmountSpent">Amount Spent:</label>
              <input type="number" id="expenseAmountSpent" name="expenseAmountSpent" value={expenseManagement.expenseAmountSpent} onChange={handleMainChange} className="inputField" />
            </div>

            <div>
              <label htmlFor="expenseFromDate">From Date:</label>
              <input type="date" id="expenseFromDate" name="expenseFromDate" value={formatDateForInput(expenseManagement.expenseFromDate)} onChange={handleMainChange} className="inputField" required disabled={!expenseManagement.expenseType} />
              {validationMessage && (
                <span style={{ color: 'red', fontSize: '0.875em', marginTop: '5px', display: 'block' }}>
                  {validationMessage}
                </span>
              )}
            </div>
            <div>
              <label htmlFor="expenseTillDate">To Date:</label>
              <input type="date" id="expenseTillDate" name="expenseTillDate" value={formatDateForInput(expenseManagement.expenseTillDate)} onChange={handleMainChange} className="inputField" required disabled={!expenseManagement.expenseType} />
            </div>
          </div>

          <table className="styled-table">
            <thead>
              <tr>
                <th>Expense Date</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Payment Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenseManagement.expenseDetails.map((detail, index) => (
                <tr key={detail.id || index}>
                  <td>
                    <input type="date" name="expenseDate" value={formatDateForInput(detail.expenseDate)} onChange={(e) => handleDetailChange(e, index)} className="inputField" />
                    {validationMessage && (
                      <span style={{ color: 'red', fontSize: '0.875em', marginTop: '5px', display: 'block' }}>
                        {validationMessage}
                      </span>
                    )}
                  </td>
                  <td>
                    <input type="number" name="expenseCost" value={detail.expenseCost} onChange={(e) => handleDetailChange(e, index)} className="inputField" />
                  </td>

                  <td>
                    <select
                      className="selectIM" name="expenseCategory" selected={detail.expenseCategory} onChange={(e) => handleDetailChange(e, index)}>
                      <option value="" disabled hidden> </option>
                      {dropdownData.expenseCategory && dropdownData.expenseCategory.length > 0 ? (
                        dropdownData.expenseCategory.map(option => (
                          <option key={option.masterId} value={option.data}>
                            {option.data}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>  Not available</option>
                      )}
                    </select>
                  </td>
                  <td>
                    <select
                      className="selectIM" name="expenseTransectionType" value={detail.expenseTransectionType} onChange={(e) => handleDetailChange(e, index)} >
                      <option value="" disabled>Select Transaction Type</option>
                      {dropdownData.expenseTransectionType.map(option => (
                        <option key={option.masterId} value={option.data}>
                          {option.data}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="dropdown">
                      <button type="button" className="dots-button">
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                      <div className="dropdown-content">
                        <div>
                          <button type="button" onClick={() => requestDeleteConfirmation(index)}>
                            <FontAwesomeIcon className="ml-2" icon={faTrash} />
                            Delete
                          </button>
                        </div>
                        <div>
                          <button type="button" onClick={() => updateDetail(index)}>
                            <FontAwesomeIcon className="ml-2" icon={faEdit} />
                            Update
                          </button>
                        </div>
                        <div>
                          <button type="button" onClick={() => SaveDetail(index)}>
                            <FontAwesomeIcon className="ml-2" icon={faSave} />
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {showDeleteConfirmation && (
                <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
                  <p>Are you sure you want to delete this Expense Detail?</p>
                  <div className='btnContainer'>
                    <button className='btn' onClick={() => {
                      removeDetail(deleteIndex);
                      setShowDeleteConfirmation(false);
                    }}>Yes</button>
                    <button className='btn' onClick={() => setShowDeleteConfirmation(false)}>No</button>
                  </div>
                </div>
              )}

            </tbody>
          </table>

          <div className="detailInputs">
            <button onClick={addDetail} className="outline-btn" >
              <FontAwesomeIcon icon={faPlusCircle} /> Add Detail
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="outline-btn"> Close </button>
          <button onClick={handleSubmit} className="btn" >  Update  </button>
        </div>
      </div>
    
    </div >
  );
};

export default UpdateExpense;
