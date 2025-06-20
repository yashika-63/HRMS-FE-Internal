import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CommonCss/AddEmp.css';
import { parseISO } from 'date-fns';
import { strings } from '../../string.jsx';
import { differenceInMonths, differenceInYears } from 'date-fns';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from '../../Api.jsx';

const EmployeeMentHistory = ({ ticketDetails, nextStep }) => {
  const [employeeDetails, setEmployeeDetails] = useState([{
    companyName: '',
    jobRole: '',
    responsibilities: '',
    startDate: '',
    endDate: '',
    latestCtc: '',
    jobDuration: '',
    supervisorContact: '',
    reasonOfLeaving: '',
    achievements: '',
    location: '',
    industry: '',
    companySize: '',
    latestMonthGross: '',
  }]);
  const [errors, setErrors] = useState({});
  const [isUpdate, setIsUpdate] = useState(false);
  const [dirtyFlags, setDirtyFlags] = useState([]);
  const preLoginToken = localStorage.getItem("PreLoginToken");
  const [dropdownData, setDropdownData] = useState({
    employeetype: [],
    industry: [],
    CompanySize: [],
    currency_code: [],
  });

  const fetchDataByKey = async (keyvalue) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/master1/GetDataByKey/${keyvalue}`);
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(item => ({
          masterId: item.masterId,
          data: item.data || ''
        }));
      }
      console.error(`Invalid data structure or empty response for ${keyvalue}`);
      return [];
    } catch (error) {
      console.error(`Error fetching data for ${keyvalue}:`, error);
      throw error;
    }
  };

  const fetchValueByKey = async (keyvalue) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/master/GetDataByKey/${keyvalue}`);
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(item => ({
          masterId: item.masterId,
          data: item.data || ''
        }));
      }
      console.error(`Invalid data structure or empty response for ${keyvalue}`);
      return [];
    } catch (error) {
      console.error(`Error fetching data for ${keyvalue}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const employeetype = await fetchDataByKey('employeetype');
        const industry = await fetchDataByKey('industry');
        const CompanySize = await fetchDataByKey('CompanySize');
        const currency_code = await fetchValueByKey('currency_code');
        setDropdownData({
          employeetype,
          industry,
          CompanySize,
          currency_code,
        });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchDropdownData();
    fetchEmployemnetData();
  }, []);

  const fetchEmployemnetData = async () => {
    try {
      const { id: verificationTicketId } = ticketDetails;
      const response = await axios.get(`http://${strings.localhost}/api/employment-data/getByVerificationAndToken?verificationId=${verificationTicketId}&preLoginToken=${preLoginToken}`);
      if (response.data && response.data.length > 0) {
        setEmployeeDetails(response.data);
        setDirtyFlags(Array(response.data.length).fill(false));
        setIsUpdate(true);
      } else {

        setEmployeeDetails([{
          companyName: '',
          jobRole: '',
          responsibilities: '',
          startDate: '',
          endDate: '',
          latestCtc: '',
          jobDuration: '',
          supervisorContact: '',
          reasonOfLeaving: '',
          achievements: '',
          location: '',
          industry: '',
          companySize: '',
          latestMonthGross: '',
        }]);
        setDirtyFlags([false])
        setIsUpdate(false);
      }
    } catch (error) {
      console.error('Error fetching employment details:', error);
      showToast('Failed to fetch employment details.', 'error');
    }
  };

  const handleAddFields = () => {
    const lastEntry = employeeDetails[employeeDetails.length - 1];
    let isValid = true;
    if (
      !lastEntry.companyName ||
      !lastEntry.jobRole ||
      !lastEntry.startDate ||
      !lastEntry.endDate ||
      !lastEntry.latestCtc
    ) {
      isValid = false;
    }

    if (isValid) {
      setEmployeeDetails([
        ...employeeDetails,
        {
          companyName: '',
          jobRole: '',
          startDate: '',
          endDate: '',
          latestCtc: '',
          employeementType: '',
          industry: '',
          companySize: '',
          latestMonthGross: '',
          responsibilities: '',
          supervisorContact: '',
          reasonOfLeaving: '',
          achievements: '',
          location: '',
        },
      ]);
    } else {
      showToast('Please fill all required fields in the current entry before adding more.', 'warn');
    }
  };

  const handleRemoveFields = (index) => {
    const newEmployeeDetails = [...employeeDetails];
    newEmployeeDetails.splice(index, 1);
    setEmployeeDetails(newEmployeeDetails);
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newEmployeeDetails = [...employeeDetails];
    if (name === 'latestCtc' || name === 'latestMonthGross') {
      if (!/^\d*\.?\d*$/.test(value)) {
        showToast(`${name === 'latestCtc' ? 'Last CTC' : 'Monthly Gross'} must be a positive number.`, 'error');
        return;
      }
    }
    if (name === 'latestMonthGross' && parseFloat(value) >= parseFloat(newEmployeeDetails[index].latestCtc)) {
      showToast('Monthly Gross must be less than Latest CTC.', 'error');
      return;
    }
    newEmployeeDetails[index][name] = value;
    setEmployeeDetails(newEmployeeDetails);
    if (isUpdate) {
      const updatedDirtyFlags = [...dirtyFlags];
      updatedDirtyFlags[index] = true;
      setDirtyFlags(updatedDirtyFlags);
    }
  };

  const handleDateChange = (event, name, index) => {
    const date = event.target.value;
    const newEmployeeDetails = [...employeeDetails];
    newEmployeeDetails[index][name] = date;
    if (name === 'startDate' || name === 'endDate') {
      const startDate = newEmployeeDetails[index].startDate;
      const endDate = newEmployeeDetails[index].endDate;

      const today = new Date();
      if (new Date(startDate) > today || new Date(endDate) > today) {
        setErrors({ dateRange: 'Start and End dates cannot be in the future.' });
        showToast('Start and End dates cannot be in the future.', 'error');
      } else if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setErrors({ dateRange: 'End date cannot be before start date.' });
        showToast('End date cannot be before start date.', 'error');
        newEmployeeDetails[index][name] = ''; // Reset the invalid date
      } else if (startDate && endDate) {
        newEmployeeDetails[index].jobDuration = calculateJobDuration(startDate, endDate);
      }
    }
    setEmployeeDetails(newEmployeeDetails);
  };

  const calculateJobDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const years = differenceInYears(end, start);
    const months = differenceInMonths(end, start) % 12;
    return `${years} years ${months} months`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};
    let isValid = true;

    const newRecords = [];
    const updatedRecords = [];

    employeeDetails.forEach((detail, index) => {
      const isExisting = !!detail.id;
      const isDirty = dirtyFlags[index];

      // Required validation
      if (!detail.companyName || !detail.jobRole || !detail.startDate || !detail.endDate || !detail.latestCtc || !detail.companySize || !detail.industry || !detail.employeementType) {
        isValid = false;
        newErrors[`detail${index}`] = 'Please fill all required fields in each entry.';
      }

      // CTC validations
      if (detail.latestCtc && (!/^\d+(\.\d+)?$/.test(detail.latestCtc) || parseFloat(detail.latestCtc) <= 0)) {
        newErrors[`detail${index}latestCtc`] = 'Latest CTC must be a positive number.';
      }
      if (detail.latestMonthGross && (!/^\d+(\.\d+)?$/.test(detail.latestMonthGross) || parseFloat(detail.latestMonthGross) <= 0)) {
        newErrors[`detail${index}latestMonthGross`] = 'Monthly Gross must be a positive number.';
      }
      if (detail.latestMonthGross && parseFloat(detail.latestMonthGross) >= parseFloat(detail.latestCtc)) {
        newErrors[`detail${index}latestMonthGrossCTC`] = 'Monthly Gross must be less than Latest CTC.';
      }
      if (detail.startDate && detail.endDate && new Date(detail.startDate) > new Date(detail.endDate)) {
        isValid = false;
        newErrors[`detail${index}dateRange`] = 'End date cannot be before start date.';
      }

      // Determine if it's new or updated
      if (isExisting && isDirty) {
        updatedRecords.push(detail);
      } else if (!isExisting) {
        newRecords.push(detail);
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    try {
      const { id: verificationTicketId } = ticketDetails;

      //  PUT: Update dirty existing records one by one
      for (let record of updatedRecords) {
        await axios.put(`http://${strings.localhost}/api/employment-data/update/${record.id}`, record);
      }

      //  POST: Add new records in bulk
      if (newRecords.length > 0) {
        await axios.post(`http://${strings.localhost}/api/employment-data/save-all/${verificationTicketId}/${preLoginToken}`, newRecords, {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      showToast('Employment history saved successfully', 'success');
      nextStep();

    } catch (error) {
      console.error('Error saving/updating employment data:', error);
      showToast('Failed to save/update employment history.', 'error');
    }
  };


  const handleUpdateSingleRecord = async (index) => {
    const employement = employeeDetails[index];
    // Optional: Validate data before sending
    try {
      const response = await axios.put(
        `http://${strings.localhost}/api/employment-data/update/${employement.id}`,
        employement,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      const message = response?.data?.message || 'Updated successfully.';
      showToast(message.split('successfully')[0] + 'successfully', 'success');
      const newDirtyFlags = [...dirtyFlags];
      newDirtyFlags[index] = false;
      setDirtyFlags(newDirtyFlags);
    } catch (error) {
      console.error('Error updating single record:', error);
      showToast('Failed to update record.', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="coreContainer">
      <div>
        <h4 className="underlineText">Employment History</h4>
        {employeeDetails.map((detail, index) => (
          <div key={index} className="employee-entry">
            {index === employeeDetails.length - 1 && (
              <button type="button" className="circle-button add-more-btn" onClick={handleAddFields}>
                Add More
              </button>
            )}
            <div className="input-row">
              <div className="input-wrapper">
                <span className="required-marker">*</span>
                <label>Company Name</label>
                <input type="text" name="companyName" value={detail.companyName} onChange={(e) => handleChange(index, e)} required />
              </div>
              <div className="input-wrapper">
                <span className="required-marker">*</span>
                <label>Job Role</label>
                <input type="text" name="jobRole" value={detail.jobRole} onChange={(e) => handleChange(index, e)} required />
              </div>
              <div className="input-wrapper">
                <label>Responsibilities</label>
                <input type="text" name="responsibilities" value={detail.responsibilities} onChange={(e) => handleChange(index, e)} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-wrapper">
                <span className="required-marker">*</span>
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={detail.startDate}
                  onChange={(e) => handleDateChange(e, 'startDate', index)}
                  required
                />
              </div>
              <div className="input-wrapper">
                <span className="required-marker">*</span>
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={detail.endDate}
                  onChange={(e) => handleDateChange(e, 'endDate', index)}
                  required
                />
              </div>
              <div className="input-wrapper">
                <label>Job Duration</label>
                <input type="text" name="jobDuration" value={detail.jobDuration} readOnly />
              </div>
            </div>
            <div className="input-row">
              <div className="input-wrapper">
                <span className="required-marker">*</span>
                <label>Last CTC</label>
                <input
                  type="text"
                  name="latestCtc"
                  value={detail.latestCtc}
                  onChange={(e) => handleChange(index, e)}
                  required
                />
                {errors[`detail${index}latestCtc`] && (
                  <p className="error">{errors[`detail${index}latestCtc`]}</p>
                )}
                {errors[`detail${index}latestMonthGrossCTC`] && (
                  <p className="error">{errors[`detail${index}latestMonthGrossCTC`]}</p>
                )}
              </div>
              <div className="input-wrapper">
                <label>Monthly Gross</label>
                <input
                  type="text"
                  name="latestMonthGross"
                  value={detail.latestMonthGross}
                  onChange={(e) => handleChange(index, e)}
                />
                {errors[`detail${index}latestMonthGross`] && (
                  <p className="error">{errors[`detail${index}latestMonthGross`]}</p>
                )}
                {errors[`detail${index}latestCtc`] && (
                  <p className="error">{errors[`detail${index}latestCtc`]}</p>
                )}
              </div>
              <div className="input-wrapper">
                <label>Supervisor Contact</label>
                <input type="text" name="supervisorContact" value={detail.supervisorContact} onChange={(e) => handleChange(index, e)} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-wrapper">
                <label>Reason of Leaving</label>
                <input type="text" name="reasonOfLeaving" value={detail.reasonOfLeaving} onChange={(e) => handleChange(index, e)} />
              </div>
              <div className="input-wrapper">
                <label>Achievements</label>
                <input type="text" name="achievements" value={detail.achievements} onChange={(e) => handleChange(index, e)} />
              </div>
              <div className="input-wrapper">
                <label>Location</label>
                <input type="text" name="location" value={detail.location} onChange={(e) => handleChange(index, e)} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-wrapper">
                <span className="required-marker">*</span>
                <label>Industry</label>
                <select
                  name="industry"
                  value={detail.industry}
                  onChange={(e) => handleChange(index, e)}
                  required
                >
                  <option value="" disabled hidden>
                    Select Industry
                  </option>
                  {dropdownData.industry.map((item) => (
                    <option key={item.masterId} value={item.data}>
                      {item.data}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-wrapper">
                <span className="required-marker">*</span>
                <label>Employment Type</label>
                <select
                  name="employeementType"
                  value={detail.employeementType}
                  onChange={(e) => handleChange(index, e)}
                  required
                >
                  <option value="" disabled hidden>
                    Select Employment Type
                  </option>
                  {dropdownData.employeetype.map((option) => (
                    <option key={option.masterId} value={option.data}>
                      {option.data}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-wrapper">
                <span className="required-marker">*</span>
                <label>Company Size</label>
                <select
                  name="companySize"
                  value={detail.companySize}
                  onChange={(e) => handleChange(index, e)}
                  required
                >
                  <option value="" disabled hidden>
                    Select Company Size
                  </option>
                  {dropdownData.CompanySize.map((item) => (
                    <option key={item.masterId} value={item.data}>
                      {item.data}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='form-controls'>
              {index > 0 && (
                <button type="button" className="remove-button" onClick={() => handleRemoveFields(index)} >  Remove </button>
              )}
              {isUpdate && detail.id && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleUpdateSingleRecord(index)}
                  disabled={!dirtyFlags[index]}
                >
                  Update
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="btnContainer">
          {employeeDetails.some(detail => !detail.id) && (
            <button type="submit" className="btn">
              Save & Next
            </button>
          )}

        </div>
      </div>
    </form>
  );
};
export default EmployeeMentHistory;
