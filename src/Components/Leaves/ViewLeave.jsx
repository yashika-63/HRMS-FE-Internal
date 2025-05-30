import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { strings } from '../../string';
import '../CommonCss/LeaveAppl.css';
import Divider from '@mui/material/Divider';
import axios from 'axios';

const ViewLeaveApplication = ({ employeeData, visible, onClose, selectedLeaveId }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: employeeData.department || '',
    designation: employeeData.designation || '',
    managerName: '',
    applyDate: moment().format('DD-MM-YYYY'),
    fromDate: null,
    toDate: null,
    totalNoOfDays: '',
    reason: '',
    leaveType: '',
    leaveCategory: '',
  });

  const [leaveApprovalData, setLeaveApprovalData] = useState(null);
  const [selectedWorkflowName, setSelectedWorkflowName] = useState('');

  useEffect(() => {
    if (selectedLeaveId) {
      const fetchLeaveData = async () => {
        try {
          const token = localStorage.getItem('token');
          const config = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          };
          const response = await axios.get(
            `http://${strings.localhost}/api/leaveApplications/leaves/${selectedLeaveId}`,
            config
          );
          setFormData(response.data);
        } catch (error) {
          console.error('Error fetching Leave by ID:', error);
        }
      };
      fetchLeaveData();
    }
  }, [selectedLeaveId]);

  useEffect(() => {
    const fetchLeaveApprovalData = async () => {
      if (selectedLeaveId) {
        try {
          const token = localStorage.getItem('token');
          const config = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          };
          const response = await axios.get(
            `http://${strings.localhost}/api/leaveApproval/all/${selectedLeaveId}`,
            config
          );
          setLeaveApprovalData(response.data); // Store all data instead of just the first item
        } catch (error) {
          console.error('Error fetching leave approval data:', error);
        }
      }
    };

    fetchLeaveApprovalData();
  }, [selectedLeaveId]);

  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      const from = moment(formData.fromDate, 'DD-MM-YYYY');
      const to = moment(formData.toDate, 'DD-MM-YYYY');
      const days = to.diff(from, 'days') + 1; // +1 to include both start and end dates
      setFormData((prev) => ({
        ...prev,
        totalNoOfDays: days,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        totalNoOfDays: '',
      }));
    }
  }, [formData.fromDate, formData.toDate]);

  const [workflowOptions, setWorkflowOptions] = useState([]);

  useEffect(() => {
    const fetchWorkflowIds = async () => {
      try {
        const companyId = localStorage.getItem('companyId');
        const response = await axios.get(`http://${strings.localhost}/api/workflow/names/${companyId}`);
        setWorkflowOptions(response.data);
      } catch (error) {
        console.error('Error fetching workflow Name', error);
      }
    };

    fetchWorkflowIds();
  }, []);

  useEffect(() => {
    if (workflowOptions.length > 0) {
      setSelectedWorkflowName(workflowOptions[0].workflowName); // or however you want to set the selected name
    }
  }, [workflowOptions]);

  return (
    visible && (
      <div className='modal-overlay' onClick={onClose}>
        <div className='modal-content' onClick={(e) => e.stopPropagation()}>
          <h2 className='centre-heading'>Leave Details</h2>
          <div className='input-row'>
            <div>
              <label htmlFor='workflowId'>Workflow Name:</label>
              <input type='text' value={selectedWorkflowName || 'No workflow selected'} readOnly className='readonly' />
            </div>

            <div>
              <label htmlFor='name'>Employee Name:</label>
              <input className='readonly' type='text' id='name' name='name' value={formData.name} readOnly />
            </div>
          </div>
          <div className='input-row'>
            <div>
              <label htmlFor='department'>Department:</label>
              <input className='readonly' type='text' id='department' name='department' value={formData.department} readOnly />
            </div>
            <div>
              <label htmlFor='designation'>Designation:</label>
              <input className='readonly' type='text' id='designation' name='designation' value={formData.designation} readOnly />
            </div>
            <div>
              <label htmlFor='managerName'>Manager Name:</label>
              <input className='readonly' type='text' id='managerName' name='managerName' value={formData.managerName} readOnly />
            </div>
            <div>
              <label htmlFor='leaveType'>Leave Type:</label>
              <input className='readonly' type='text' id='leaveType' name='leaveType' value={formData.leaveType} readOnly />
            </div>
          </div>
       
          <div className='input-row'>
            <div>
              <label htmlFor='leaveCategory'>Leave Category:</label>
              <input className='readonly' type='text' id='leaveCategory' name='leaveCategory' value={formData.leaveCategory} readOnly />
            </div>
            <div>
              <label htmlFor='totalNoOfDays'>Total No Of Days:</label>
              <input className='readonly' type='text' id='totalNoOfDays' name='totalNoOfDays' value={formData.totalNoOfDays} readOnly />
            </div>
            <div>
              <label htmlFor='fromDate'>From Date:</label>
              <input className='readonly' type='text' id='fromDate' name='fromDate' value={formData.fromDate} readOnly />
            </div>
            <div>
              <label htmlFor='toDate'>To Date:</label>
              <input className='readonly' type='text' id='toDate' name='toDate' value={formData.toDate} readOnly />
            </div>
          </div>
        

          <div className='input-row'>
            <div>
              <label htmlFor='reason'>Reason for Leave:</label>
              <textarea className='readonly' id='reason' name='reason' value={formData.reason} readOnly />
            </div>
          </div>
          {leaveApprovalData && leaveApprovalData.length > 0 && (
            <div>
              <h3>Leave Approval Information</h3>
              {leaveApprovalData.map((approval, index) => (
                <div key={index} className='approval-item'>
                  <div>
                    <label><strong>Status:</strong></label>
                    <span>{approval.action ? 'Approved' : 'Rejected'}</span>
                  </div>
                  <div>
                    <label><strong>Action Taken By:</strong></label>
                    <span>{approval.actionTakenBy}</span>
                  </div>
                  <div>
                    <label><strong>Date:</strong></label>
                    <span>{moment(approval.date).format('DD-MM-YYYY')}</span>
                  </div>
                  <div>
                    <label><strong>Mail:</strong></label>
                    <span>{approval.mail}</span>
                  </div>
                  <div>
                    <label><strong>Note:</strong></label>
                    <span>{approval.note}</span>
                  </div>
                  <Divider />
                </div>
              ))}
            </div>
          )}
          <div className='form-controls'>
          <button onClick={onClose} className='outline-btn'>Close</button>
          </div>
        </div>
      </div>
    )
  );
};

export default ViewLeaveApplication;
