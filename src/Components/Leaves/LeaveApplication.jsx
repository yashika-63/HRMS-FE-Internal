

import React, { useState, useEffect } from 'react';
import moment from 'moment';
import '../CommonCss/LeaveAppl.css'
import Divider from '@mui/material/Divider';
import { strings } from '../../string';
import axios from 'axios';
import { fetchDataByKey } from '../../Api.jsx';
import { showToast } from '../../Api.jsx';

const LeaveApplication = ({ employeeData, onSubmit }) => {

  const [dateError, setDateError] = useState('');
  const employeeId = localStorage.getItem("employeeId");
  const companyId = localStorage.getItem("companyId");
  const [dropdownError, setDropdownError] = useState('');
  const [workflowOptions, setWorkflowOptions] = useState([]);
  const [employeeConfig, setEmployeeConfig] = useState();

  const [formData, setFormData] = useState({
    name: employeeData.name || '',
    department: employeeData.department || '',
    designation: employeeData.designation || '',
    managerName: '',
    applyDate: moment().format('DD-MM-YYYY'),
    fromDate: null,
    toDate: null,
    totalNoOfDays: '',
    reason: '',
    leaveType: '',
    id: '',
    leaveCategory: ''
  });
  const [dropdownData, setDropdownData] = useState({
    leaveType: [],
    leaveCategory: []
  });


  useEffect(() => {
    const fetchWorkingDays = async () => {
      const { fromDate, toDate } = formData;
      if (!fromDate || !toDate) return;

      const from = moment(fromDate, 'DD-MM-YYYY');
      const to = moment(toDate, 'DD-MM-YYYY');

      if (to.isBefore(from)) {
        setDateError("To Date cannot be before From Date.");
        setFormData(prev => ({
          ...prev,
          totalNoOfDays: ''
        }));
        return;
      }

      setDateError('');

      try {
        const response = await axios.get(`http://${strings.localhost}/api/holidayCalendar/calculateWorkingDaysAndHoursByDates/${companyId}/${from.format('YYYY-MM-DD')}/${to.format('YYYY-MM-DD')}`);
        const totalDays = response.data?.actualWorkingDays || 0;

        setFormData(prev => ({
          ...prev,
          totalNoOfDays: totalDays
        }));
      } catch (error) {
        console.error("Error calculating working days:", error);
        setFormData(prev => ({
          ...prev,
          totalNoOfDays: ''
        }));
        showToast('Failed to calculate working days. Please try again.', 'error');
      }
    };

    fetchWorkingDays();
  }, [formData.fromDate, formData.toDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleDateChange = (dateStr, name) => {
    const formattedDate = dateStr ? moment(dateStr, 'YYYY-MM-DD').format('DD-MM-YYYY') : null;
    setFormData(prev => ({
      ...prev,
      [name]: formattedDate
    }));
  };


  const handleSave = async (event) => {
    event.preventDefault();
    // if(!leaveType && !fromDate && !toDate){
    //   toast.warn("Please fill mandatory fields");
    //   return;
    // }
    if (dateError) {
      showToast("Please resolve the errors before submitting the form.", 'warn');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const { id, ...dataToSubmit } = formData;
      const response = await axios.post(
        `http://${strings.localhost}/api/leaveApplications/saveLeaveRequestForWorkflowMain/${companyId}/${employeeId}/${id}`,
        {
          ...dataToSubmit, // Use the modified data without 'id'
          name: formData.name,
          department: formData.department,
          designation: formData.designation
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      showToast('Leave application submitted successfully.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('There was an error submitting the leave application:', error); // Log the error
      console.error('Error details:', error.response ? error.response.data : error.message);
      showToast('There was an error submitting the leave application. Please try again.', 'error');
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
  }, []);


  const fetchEmployeeConfig = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/employee-config/employee/${employeeId}`);
      const config = Array.isArray(response.data) ? response.data[0] : response.data;

      if (config) {
        const manager = config.reportingManager;
        const managerName = [
          manager?.firstName,
          manager?.middleName,
          manager?.lastName
        ].filter(Boolean).join(' ');

        setEmployeeConfig(config);
        setFormData(prev => ({
          ...prev,
          managerName: managerName || ''
        }));
      } else {
        setEmployeeConfig(null);
      }
    } catch (error) {
      console.error("Error fetching employee config:", error);
      setEmployeeConfig(null);
    }
  };


  useEffect(() => {
    fetchEmployeeConfig();
  }, [employeeId]);


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


  return (
    <div className='leave-application'>
      <h1 className='centerText'> Employee Leave Request Form </h1>
      <div>
        <label htmlFor='applyDate'>Apply Date:</label>
        <input
          style={{ width: '20%' }}
          type="date"
          id="applyDate"
          name="applyDate"
          className="selectIM"
          value={moment(formData.applyDate, 'DD-MM-YYYY').format('YYYY-MM-DD')}
          onChange={(e) => handleDateChange(e.target.value, 'applyDate')}
          disabled
        />

      </div>

      <div>
        <form onSubmit={handleSave}>
          <div className='leave-containers'>
            <div className='leave-container'>
              <div className='input-row'>
                <div>
                  <h2 className='leavesubtitle'>1. Employee Details</h2>
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
                    <input className='readonly' type='text' id='managerName' name='managerName' value={formData.managerName} onChange={handleInputChange} required readOnly/>
                  </div>
                </div>

              </div>
            </div>

            <Divider orientation="vertical" variant="fullWidth" flexItem />

            <div className='leave-container'>
              <h2 className='leavesubtitle'>2. Leave Details</h2>
              <div>
                <span className="required-marker">*</span>
                <label htmlFor="leaveType">Leave Type:</label>
                <select className='selectIM' name='leaveType' value={formData.leaveType} onChange={handleInputChange} required >
                  <option value=''></option>
                  {dropdownData.leaveType.map((option) => (
                    <option key={option.masterId} value={option.data}>
                      {option.data}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="required-marker">*</span>
                <label htmlFor="LeaveCategory">Leave Category:</label>
                <select className='selectIM' name='leaveCategory' value={formData.leaveCategory} onChange={handleInputChange} required >
                  <option value='' disabled hidden></option>
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
                <span className="required-marker">*</span>
                <label htmlFor='fromDate'>From Date:</label>
                <input
                  type="date"
                  id="fromDate"
                  name="fromDate"
                  className="selectIM"
                  value={formData.fromDate ? moment(formData.fromDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : ''}
                  onChange={(e) => handleDateChange(e.target.value, 'fromDate')}
                  required
                />
              </div>

              <div>
                <span className="required-marker">*</span>
                <label htmlFor='toDate'>To Date:</label>
                <input
                  type="date"
                  id="toDate"
                  name="toDate"
                  className="selectIM"
                  value={formData.toDate ? moment(formData.toDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : ''}
                  onChange={(e) => handleDateChange(e.target.value, 'toDate')}
                  required
                />

                {dateError && (
                  <div className='no-data'>{dateError} </div>
                )}
              </div>

              <div>
                <label htmlFor='totalNoOfDays'>Total Number of Days:</label>
                <input className='readonly' type='text' id='totalNoOfDays' name='totalNoOfDays' value={formData.totalNoOfDays} onChange={handleInputChange} readOnly />
              </div>

              <div>
                <span className="required-marker">*</span>
                <label htmlFor='reason'>Reason for leave:</label>
                <textarea id='reason' name='reason' value={formData.reason} onChange={handleInputChange} required />
              </div>
            </div>
          </div>
          <div className='form-controls'>
            <button type='submit' className='btn1' disabled={!!dateError} > Save </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default LeaveApplication;
