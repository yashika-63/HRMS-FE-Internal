import React, { useState, useEffect } from 'react';
import { Divider } from '@mui/material';
import moment from 'moment';
import { strings } from '../../string';
import '../CommonCss/LeaveAppl.css';
import axios from 'axios';
import { fetchDataByKey ,showToast} from '../../Api.jsx';

const UpdateLeaveApplication = ({ employeeData, onSubmit, visible, onClose, selectedLeaveId }) => {

  const [formData, setFormData] = useState({
    name: employeeData.name || '',
    department: employeeData.department || '',
    designation: employeeData.designation || '',
    managerName: '',
    applyDate: moment().format('DD-MM-YYYY'),
    fromDate: null,
    toDate: null,
    totalNoOfDays: '',
    id: '',
    reason: '',
    leaveType: '',
    leaveCategory: '',
    workflowId: ''
  });

  const [selectedWorkflowName, setSelectedWorkflowName] = useState('');
  const [workflowOptions, setWorkflowOptions] = useState([]);

  const [dropdownData, setDropdownData] = useState({
    leaveType: [],
    leaveCategory: []
  });

  useEffect(() => {
    if (selectedLeaveId) {
      const fetchLeaveData = async () => {
        try {
          const token = localStorage.getItem('token');
          const config = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          };
          const response = await axios.get(
            `http://${strings.localhost}/api/leaveApplications/leaves/${selectedLeaveId}`,
            config
          );
          setFormData(response.data);

          // Fetch workflow name based on workflowId
          if (response.data.workflowId) {
            const workflowResponse = await axios.get(
              `http://${strings.localhost}/api/workflow/names/${response.data.workflowId}`,
              config
            );
            setSelectedWorkflowName(workflowResponse.data.workflowName || 'No workflow found');
          }
        } catch (error) {
          console.error('Error fetching Leave by ID:', error);
        }
      };
      fetchLeaveData();
    }
  }, [selectedLeaveId]);

  // Calculate total number of days between fromDate and toDate
  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      const from = moment(formData.fromDate, 'DD-MM-YYYY');
      const to = moment(formData.toDate, 'DD-MM-YYYY');
      const days = to.diff(from, 'days') + 1; // +1 to include both start and end dates
      setFormData(prev => ({
        ...prev,
        totalNoOfDays: days
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        totalNoOfDays: ''
      }));
    }
  }, [formData.fromDate, formData.toDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (value, name) => {
    const selectedDate = moment(value, 'YYYY-MM-DD').format('DD-MM-YYYY');
    setFormData({
      ...formData,
      [name]: selectedDate
    });
  };

  const formatDateForInput = (date) => {
    return date ? moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD') : '';
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://${strings.localhost}/api/leaveApplications/update/${selectedLeaveId}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      showToast('Leave application updated successfully.','success');
      setTimeout(() => {
        window.location.reload();
    }, 1000);
      if (onSubmit) {
        onSubmit(formData);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('There was an error updating the leave application:', error);
      showToast('There was an error updating the leave application. Please try again.','error');
    }
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const leaveTypeData = await fetchDataByKey('leaveType');
        const leaveCategoryData = await fetchDataByKey('leaveCategory');
        setDropdownData({
          leaveType: leaveTypeData,
          leaveCategory: leaveCategoryData
        });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
    fetchWorkflowIds();
  }, []);

  const fetchWorkflowIds = async () => {
    try {
      const companyId = localStorage.getItem("companyId");
      const response = await axios.get(`http://${strings.localhost}/api/workflow/names/${companyId}`);
      setWorkflowOptions(response.data);
      if (response.data.length > 0) {
        setSelectedWorkflowName(response.data[0].workflowName); // Set the first workflow as default if available
      }
    } catch (error) {
      console.error('Error fetching workflow Names', error);
    }
  };

  return (
    <div className='leave-application'>
      <div>
        <form onSubmit={handleUpdate}>
          <div className='leave-containers'>
            <div className='leave-container'>
              
              <div className='input-row'>
                <div>
                  <h2 className='leavesubtitle'>1. Employee Details</h2>
                  <div>
                    <label htmlFor='workflowId'>Workflow Name:</label>
                    <input type="text" value={selectedWorkflowName} readOnly className='readonly' />
                  </div>

                  <div>
                    <label htmlFor='name'>Employee Name:</label>
                    <input className='readonly' type='text' id='name' name='name' value={formData.name} onChange={handleInputChange} readOnly />
                  </div>

                  <div>
                    <label htmlFor='department'>Department:</label>
                    <input className='readonly' type='text' id='department' name='department' value={formData.department} onChange={handleInputChange} readOnly />
                  </div>
                  <div>
                    <label htmlFor='designation'>Designation:</label>
                    <input className='readonly' type='text' id='designation' name='designation' value={formData.designation} onChange={handleInputChange} readOnly />
                  </div>
                  <div>
                    <span className="required-marker">*</span>
                    <label htmlFor='managerName'>Manager Name:</label>
                    <input className='required' type='text' id='managerName' name='managerName' value={formData.managerName} onChange={handleInputChange} required />
                  </div>
                </div>
              </div>
            </div>

            <Divider orientation="vertical" variant="fullWidth" flexItem />

            <div className='leave-container'>
              <div className='leave-title'>
                <h2 className='leavesubtitle'>2. Leave Request</h2>
              </div>
              <div>
                <label htmlFor="LeaveType">Leave Type:</label>
                <select className='selectIM' id="leaveType" name="leaveType" value={formData.leaveType} onChange={handleInputChange} >
                  <option value="" disabled></option>
                  <option value="Paid">Paid</option>
                  <option value="UnPaid">UnPaid</option>
                </select>
              </div>
              <div>
                <label htmlFor="leaveCategory">Leave Category</label>
                <select className='selectIM' id="leaveCategory" name="leaveCategory" value={formData.leaveCategory} onChange={handleInputChange}>
                  <option value="" disabled></option>
                  {dropdownData.leaveCategory && dropdownData.leaveCategory.length > 0 ? (
                    dropdownData.leaveCategory.map(option => (
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
                <label htmlFor='fromDate'>From Date:</label>
                <input type='date' className="datePicker" id="fromDate" name="fromDate"
                  value={formatDateForInput(formData.fromDate)} // Convert to YYYY-MM-DD for input display
                  onChange={(e) => handleDateChange(e.target.value, "fromDate")} // Handle date change
                  required
                />
              </div>
              <div>
                <label htmlFor='toDate'>To Date:</label>
                <input type='date' className="datePicker" id="toDate" name="toDate"
                  value={formatDateForInput(formData.toDate)} // Format date for display
                  onChange={(e) => handleDateChange(e.target.value, "toDate")}
                  required
                />
              </div>
              <div>
                <label htmlFor='totalNoOfDays'>Total No Of Days:</label>
                <input className='readonly' type='text' id='totalNoOfDays' name='totalNoOfDays' value={formData.totalNoOfDays} readOnly />
              </div>
              <div>
                <label htmlFor='reason'>Reason for Leave:</label>
                <textarea className='required' id='reason' name='reason' value={formData.reason} onChange={handleInputChange} required />
              </div>
              <div>
              </div>
                              <button className="btn" type="submit">Update</button>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateLeaveApplication;
