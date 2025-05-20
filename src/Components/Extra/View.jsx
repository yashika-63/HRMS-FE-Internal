
import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { strings } from '../../string';
import TimeSheet from '../TimeSheet/TimeSheet';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { showToast } from '../../Api.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { faTrashAlt, faEdit, faUserPlus, faEllipsisV, faUserTie, faEye } from '@fortawesome/free-solid-svg-icons';


const TimesheetDashboard = (onClose) => {

  const [formData, setFormData] = useState({
    name: '',
    id: '',
    designation: '',
    department: '',
    date: '', // Default value in YYYY-MM-DD format
  });
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [showTimesheetPage, setShowTimesheetPage] = useState(false);
  const [savedTimesheets, setSavedTimesheets] = useState([]);
  const { id } = useParams();
  const [isFromLocalStorage, setIsFromLocalStorage] = useState(false); // State to check the source of employeeId
  const [date, setDate] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timesheetDelete, setTimesheetDelete] = useState(null);
  const [totalTime, setTotalTime] = useState('00:00');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentView, setCurrentView] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [editTask, setEditTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTasks, setNewTasks] = useState([{ taskName: '', hoursSpent: '', taskDescription: '' }]);
  const [headerStartTime, setHeaderStartTime] = useState('00:00');
  const [headerEndTime, setHeaderEndTime] = useState('00:00');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateRangeId, setDateRangeId] = useState(null); // New state for dateRangeId
  const employeeId = localStorage.getItem("employeeId");
  const companyId = localStorage.getItem("companyId");

  const handleShowTimesheet = () => {
    setCurrentView('showTimesheet');
    setShowDropdowns(true);
    setShowTimesheetPage(false);
    setSavedTimesheets([]);
  };

  const handleShowTimesheetPage = () => {
    setCurrentView('timesheet');
    setShowDropdowns(false);
    setShowTimesheetPage(true);
  };

  const fetchEmployeeDetails = async (employeeIdToUse) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeIdToUse}`);
      const employee = response.data;
      setFormData({
        name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
        id: employee.id,
        department: employee.department,
        designation: employee.designation
      });
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  useEffect(() => {
    const localEmployeeId = localStorage.getItem('employeeId');
    const employeeIdToUse = id || localEmployeeId;

    if (employeeIdToUse) {
      fetchEmployeeDetails(employeeIdToUse);
      setIsFromLocalStorage(!!localEmployeeId && !id);

      // Fetch timesheet data for the employee based on selected date or range
      if (formData.date) {
        fetchTimesheetData(formData.date);
      }
      if (fromDate && toDate) {
        fetchTimesheets(fromDate, toDate);
      }
    }
  }, [id, formData.date, fromDate, toDate]); // Added fromDate and toDate as dependencies

  const fetchTimesheetData = async (date) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/timesheetmain/getByDates?date=${date}`);
      if (response.data && response.data.length > 0) {
        setSavedTimesheets(response.data);
        setFromDate(moment(response.data[0].fromDate).format('DD-MM-YYYY'));
        setToDate(moment(response.data[0].toDate).format('DD-MM-YYYY'));
        setDateRangeId(response.data[0].id);
      } else {
        // Only show this message if it is a new fetch, not after an update
        showToast('No timesheet data found for this date.','warn');
      }
    } catch (error) {
      console.error('Error fetching timesheet data:', error);
      showToast('No Data Found Try Another Date','warn');
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData({ ...formData, date: selectedDate });
    setSavedTimesheets([]);
    setExpandedRows({});
    if (selectedDate) {
      fetchTimesheetData(selectedDate);
    }
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // const formatTotalTime = (totalTime) => {
  //   const [hours, minutes] = totalTime.split(':').map(Number);
  //   return `${hours}h ${minutes}m`;
  // };
  const formatTotalTime = (totalTime) => {
    if (!totalTime) {
      return '0h 0m'; // Default value when totalTime is undefined
    }
    const timeParts = totalTime.split(':');
    if (timeParts.length < 2) {
      return 'Invalid format'; // Handle unexpected formats
    }
    const [hours, minutes] = timeParts.map(Number);
    return `${hours}h ${minutes}m`;
  };


  const handleAddMore = () => {
    setModalOpen(true);
  };

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...newTasks];
    updatedTasks[index][field] = value;
    setNewTasks(updatedTasks);
  };

  const handleRemoveTask = (index) => {
    const updatedTasks = newTasks.filter((_, i) => i !== index);
    setNewTasks(updatedTasks);
  };

  const handleAddTask = () => {
    setNewTasks([...newTasks, { taskName: '', hoursSpent: '', taskDescription: '' }]);
  };

  const calculateTotalTime = (start, end) => {
    const startMoment = moment(start, 'HH:mm');
    const endMoment = moment(end, 'HH:mm');

    if (startMoment.isValid() && endMoment.isValid()) {
      if (endMoment.isBefore(startMoment)) {
        showToast('End time cannot be before start time.','warn');
        return '00:00'; // Return 00:00 if end time is before start time
      }
      const duration = moment.duration(endMoment.diff(startMoment));
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes().toString().padStart(2, '0'); // Ensure two-digit minute format
      const seconds = duration.seconds().toString().padStart(2, '0'); // Ensure two-digit minute format

      return `${hours}:${minutes}:${seconds}`; // HH:mm format
    }
    return '00:00'; // Return 00:00 if times are invalid
  };



  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setHeaderStartTime(newStartTime);

    // Calculate total time only if end time is valid
    if (headerEndTime) {
      const totalTime = calculateTotalTime(newStartTime, headerEndTime);
      setTotalTime(totalTime);
    } else {
      setTotalTime('00:00'); // Reset if end time is not set
    }
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    setHeaderEndTime(newEndTime);

    const startDateTime = moment(`${formData.date} ${headerStartTime}`);
    const endDateTime = moment(`${formData.date} ${newEndTime}`);

    if (headerStartTime && endDateTime.isBefore(startDateTime)) {
      showToast("End time cannot be before start time.",'warn');
      setTotalTime('00:00'); // Reset total time
    } else {
      const totalTime = calculateTotalTime(headerStartTime, newEndTime);
      setTotalTime(totalTime);
    }
  };



  const handleModalSave = async () => {
    if (dateRangeId) {
      const formattedStartTime = moment(headerStartTime, 'HH:mm').format('HH:mm:ss');
      const formattedEndTime = moment(headerEndTime, 'HH:mm').format('HH:mm:ss');
      const totalTime = calculateTotalTime(formattedStartTime, formattedEndTime);
      const date = formData.date;
      // Validate tasks
      const isValid = newTasks.every(task => task.taskName && task.hoursSpent);
      if (!isValid) {
        showToast("Please fill in all task details.",'warn');

        return;
      }

      const dataToSave = {
        date: formData.date,
        dayStartTime: formattedStartTime,
        dayEndTime: formattedEndTime,
        totalTime: totalTime,
        timesheetDayDetails: newTasks.map(task => ({
          taskName: task.taskName,
          hoursSpent: parseInt(task.hoursSpent, 10) || 0,
          taskDescription: task.taskDescription
        }))
      };

      try {
        const response = await axios.post(`http://${strings.localhost}/api/timesheet-day/SaveTimesheet/${employeeId}/${companyId}/${dateRangeId}`, dataToSave);
        const savedId = response.data.id;
      
        setNewTasks([{ taskName: '', hoursSpent: '', taskDescription: '' }]);
        showToast('Task Saved successfully.','success'); 
        setTimeout(() => {
          window.location.reload();
      }, 1000);
        setModalOpen(false);
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    } else {
      showToast('Date Range ID is not defined.','warn');

    }
  };

  const resetModal = () => {
    setNewTasks([{ taskName: '', hoursSpent: '', taskDescription: '' }]);
    setHeaderStartTime('');
    setHeaderEndTime('');
  };
  const handleEditClick = (taskDetail) => {
    setEditTask(taskDetail); // Set the task to edit
    setShowUpdateModal(true); // Show the modal
  };


  const handleEditClick1 = (taskDetail) => {

    setEditTask(taskDetail);
    setHeaderStartTime(taskDetail.dayStartTime || '');
    setHeaderEndTime(taskDetail.dayEndTime || '');
    setTotalTime(taskDetail.totalTime || '00:00');
    setDate(moment(taskDetail.date).format('YYYY-MM-DD'));
    setShowEditModal(true);
  };

  const handleUpdate1 = async () => {
    if (editTask) {
      const total = calculateTotalTime(headerStartTime, headerEndTime);
      const formattedStartTime = moment(headerStartTime, 'HH:mm').format('HH:mm:ss');
      const formattedEndTime = moment(headerEndTime, 'HH:mm').format('HH:mm:ss');
      const formateeddate = date;
      // const total = calculateTotalTime(formattedStartTime, formattedEndTime);
      setTotalTime(total);
      const dataToSave = {
        date: formateeddate,
        dayStartTime: formattedStartTime,
        dayEndTime: formattedEndTime,
        totalTime: total,
      };
      try {
        await axios.put(`http://${strings.localhost}/api/timesheet-day/${editTask.id}`, dataToSave);
        // alert('Task updated successfully!');
        showToast('Task updated successfully','success');
        window.location.reload();
        setShowEditModal(false);
        setEditTask(null);
      } catch (error) {
        console.error('Error updating task:', 'error');
        // alert('Failed to update task.');
        showToast('Failed to update task','error');

      }
    }
  };

  const handleUpdate = async () => {
    if (editTask) {
      toast.dismiss(); // Clear any previous messages
      try {
        await axios.put(`http://${strings.localhost}/api/timesheetDetail/${editTask.id}`, {
          taskName: editTask.taskName,
          hoursSpent: editTask.hoursSpent,
          taskDescription: editTask.taskDescription
        });
        showToast('Task updated successfully','success');

        // Fetch the updated timesheet data
        await fetchTimesheetData(formData.date);

        setShowUpdateModal(false);
        setEditTask(null);
      } catch (error) {
        console.error('Error updating task:', error);
        showToast('Failed to update task','error');
      }
    }
  };




  useEffect(() => {
    if (editTask) {
      // Fetch and set existing timesheet data
      setHeaderStartTime(editTask.dayStartTime);
      setHeaderEndTime(editTask.dayEndTime);
      // If total time is part of the editTask, ensure it's defined properly
      setTotalTime(editTask.totalTime || '00:00');
    }
  }, [editTask]);

  const handleDelete1 = async (taskId) => {
    try {
      const response = await axios.delete(`http://${strings.localhost}/api/timesheet-day/delete/${taskId}`);
      setShowConfirmation(false);
      // alert('Task deleted successfully!');
      showToast('Task deleted successfully','success');
      fetchTimesheetData(formData.date); // Refresh the data
    } catch (error) {
      console.error('Error deleting task:', error);
      // alert('Failed to delete task.'); 
      showToast('Failed to delete task','error');
    }
  };
  const handleDelete = (taskId) => {
    setTimesheetDelete(taskId); // Set the ID of the task to delete
    setShowConfirmation(true); // Show confirmation dialog
  };

  const calculateTotalHoursSpent = () => {
    const totalMinutes = newTasks.reduce((acc, task) => {
      const parts = task.hoursSpent.split('.');
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parts.length > 1 ? Math.round((parseFloat('0.' + parts[1]) * 60)) : 0;
      return acc + (hours * 60 + minutes);
    }, 0);

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return {
      hours: totalHours,
      minutes: remainingMinutes
    };
  };
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };
  const fetchTimesheets = async (fromDate, toDate) => {
    if (!fromDate || !toDate) {
      showToast("Both From and To dates must be provided.",'warn');
      return;
    }

    try {
      const response = await axios.get(`http://${strings.localhost}/api/timesheet-day/timesheet/byEmployeeIdAndDateRange?startDate=${fromDate}&endDate=${toDate}&employeeId=${employeeId}`);

      // Assuming the response data is in the correct format
      setSavedTimesheets(response.data);
    } catch (error) {
      console.error("Failed to fetch timesheets:", error);
      setSavedTimesheets([]); // Reset state in case of an error
    }
  };



  const editDropdownMenu = (taskDetail) => (
    <div className="dropdown">
      <button className="dots-button">
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      <div className="dropdown-content">
        <div>
          <button onClick={() => handleEditClick(taskDetail)}>
            <FontAwesomeIcon className='ml-2' icon={faEdit} /> Edit
          </button>
        </div>
      </div>
    </div>
  );

  const editTimeshhetDays = (taskDetail, dayId) => (
    <div className="dropdown">
      <button className="dots-button">
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      <ul className="dropdown-content">
        {id ? ( // Check if id is present
          <li>
            <button onClick={() => toggleRowExpansion(dayId)}>
              {expandedRows[dayId] ? 'Hide Details' : 'Show Details'}
            </button>
          </li>
        ) : (
          <>
            <li>
              <button onClick={() => handleEditClick1(taskDetail)}>
                <FontAwesomeIcon className='ml-2' icon={faEdit} /> Edit
              </button>
            </li>
            <li>
              <button onClick={() => handleDelete(taskDetail.id)}>
                <FontAwesomeIcon className='ml-2' icon={faTrashAlt} /> Delete
              </button>
            </li>
            <li>
              <button onClick={() => toggleRowExpansion(dayId)}>
                {expandedRows[dayId] ? 'Hide Details' : 'Show Details'}
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );



  return (
    <div>
      <div className="input-row">
        <div>
          <label htmlFor="name">Employee Name:</label>
          <input type="text" className='readonly' id="name" name="name" value={formData.name} readOnly />
        </div>
        <div>
          <label htmlFor="id">Employee ID:</label>
          <input type="text" className='readonly' id="id" name="id" value={formData.id} readOnly />
        </div>
        <div>
          <label htmlFor="designation">Employee Designation:</label>
          <input type="text" className='readonly' id="designation" name="designation" value={formData.designation} readOnly />
        </div>
        <div>
          <label htmlFor="department">Employee Department:</label>
          <input type="text" className='readonly' id="department" name="department" value={formData.department} readOnly />
        </div>
      </div>

      <div>
        <div style={{ marginBottom: '20px' }}>
          {isFromLocalStorage ? (
            <>
              <button className='btn' onClick={handleShowTimesheetPage}>Timesheet</button>
              <button className='btn' onClick={handleShowTimesheet}>Show Timesheet</button>
            </>
          ) : (
            <button className='btn' onClick={handleShowTimesheet}>Show Timesheet</button>
          )}
        </div>
        {/* Render other component content based on formData or other states */}
      </div>
      {currentView === 'showTimesheet' && (
        <div>
          {showDropdowns && (
            <div className="row">
              <div>

                <label htmlFor="date">Select Date:</label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleDateChange} />
              </div>



              <div>
                <label htmlFor="fromDate">From Date:</label>
                <input
                  style={{ border: '1px solid black' }}
                  type="date" id="fromDate" name="fromDate" value={fromDate} onChange={handleFromDateChange} />
              </div>
              <div>
                <label htmlFor="toDate">To Date:</label>
                <input
                  style={{ border: '1px solid black' }}
                  type="date" id="toDate" name="toDate" value={toDate} onChange={handleToDateChange} />
              </div >
              {/* <div style={{marginTop:'10px'}}>
                            <button type='button' className='btn' onClick={() => fetchTimesheets(fromDate, toDate)}>Fetch Timesheets</button>
                            </div> */}

            </div>
          )}

          {savedTimesheets.length > 0 && (
            <div>
              <h3>Saved Timesheets</h3>
              <div className='form-controls'>
                {!id && (
                  <button className='btn' onClick={handleAddMore}>Add More</button>
                )}
              </div>

              <div>
                <strong>From Date:</strong> {fromDate}
              </div>
              <div>
                <strong>To Date:</strong> {toDate}
              </div>
              <table className='EP-table'>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Log In Time</th>
                    <th>Log Out Time</th>
                    <th>Total Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedTimesheets.map(sheet => (
                    <Fragment key={sheet.id}>
                      <tr>
                        <td>{moment(sheet.date).format('DD-MM-YYYY')}</td>
                        <td>{moment(sheet.dayStartTime, 'HH:mm:ss').format('hh:mm A')}</td>
                        <td>{moment(sheet.dayEndTime, 'HH:mm:ss').format('hh:mm A')}</td>
                        <td>{formatTotalTime(sheet.totalTime)}</td>
                        <td>
                          {editTimeshhetDays(sheet, sheet.id)}
                        </td>
                      </tr>
                      {/* Details for each day's tasks */}
                      {expandedRows[sheet.id] && (
                        <tr>
                          <td colSpan="6">
                            <table className="EP-table">
                              <thead>
                                <tr>
                                  <th>Task Name</th>
                                  <th>Hours Spent</th>
                                  <th>Description</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sheet.timesheetDayDetails.map(detail => (
                                  <tr key={detail.id}>
                                    <td>{detail.taskName}</td>
                                    <td>{detail.hoursSpent}</td>
                                    <td>{detail.taskDescription}</td>
                                    <td>
                                      {!id && editDropdownMenu(detail.id)} {/* Only show dropdown if id is not present */}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                      {showUpdateModal && editTask && (
                        <div className="modal-overlay">
                          <div className="modal-content">
                            <h2 className='title'>Edit Task</h2>
                            <div>
                              <label>Task Name:</label>
                              <input
                                type="text"
                                value={editTask.taskName || ''} // Ensure it's correctly assigned
                                onChange={(e) => setEditTask({ ...editTask, taskName: e.target.value })}
                              />
                              <label>Hours Spent:</label>
                              <input
                                style={{ border: '1px solid gray', borderRadius: '5px' }}
                                type="number"
                                value={editTask.hoursSpent || ''} // Ensure it's correctly assigned
                                onChange={(e) => setEditTask({ ...editTask, hoursSpent: e.target.value })}
                              />
                              <label>Description:</label>
                              <input
                                type="text"
                                value={editTask.taskDescription || ''} // Ensure it's correctly assigned
                                onChange={(e) => setEditTask({ ...editTask, taskDescription: e.target.value })}
                              />
                              <button type="button" className='btn' onClick={handleUpdate}>Update</button>
                              <button type="button" className='outline-btn' onClick={() => setShowUpdateModal(false)}>Cancel</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}







      {showTimesheetPage && <TimeSheet />}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Tasks</h2>
            <div className="input-row">
              <label>Date:</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              <label>Start Time:</label>
              <input type="time" value={headerStartTime} onChange={handleStartTimeChange} />
              <label>End Time:</label>
              <input type="time" value={headerEndTime} onChange={handleEndTimeChange} />
              <p><strong>Total Time:</strong> {totalTime}</p>
              <p><strong>Total Hours Spent:</strong> {`${calculateTotalHoursSpent().hours}h ${calculateTotalHoursSpent().minutes.toString().padStart(2, '0')}m`}</p>

            </div>
            <table className="EP-table">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Hours Spent</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {newTasks.map((task, index) => (
                  <tr key={index}>
                    <td>
                      <input type="text" value={task.taskName} onChange={(e) => handleTaskChange(index, 'taskName', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" value={task.hoursSpent} onChange={(e) => handleTaskChange(index, 'hoursSpent', e.target.value)} />
                    </td>
                    <td>
                      <input type="text" value={task.taskDescription} onChange={(e) => handleTaskChange(index, 'taskDescription', e.target.value)} />
                    </td>
                    <td>
                      <button type="button" onClick={() => handleRemoveTask(index)}><FontAwesomeIcon className='ml-2' icon={faTrash} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className='btn' onClick={handleAddTask}>Add Another Task</button>
            <button type="button" className='btn' onClick={handleModalSave}>Save Tasks</button>
            <button type="button" className='outline-btn' onClick={() => { setModalOpen(false); resetModal(); }}>Cancel</button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className='title'>Edit Task</h2>
            <div className='input-row'>
              <label>
                Date
                <input
                  className='readonly'
                  type='date'
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ border: '1px solid gray', borderRadius: '5px' }}
                  readOnly
                />
              </label>
              <div>
                <label>
                  Start Time
                  <input type="time" value={headerStartTime} style={{ border: '1px solid gray', borderRadius: '5px' }} onChange={handleStartTimeChange} />
                </label>
              </div>
              <label>
                End Time
                <input type="time" value={headerEndTime} style={{ border: '1px solid gray', borderRadius: '5px' }} onChange={handleEndTimeChange} />

              </label>
              <div>
                <label>Total Time:</label>
                <input
                  type="time"
                  value={totalTime} // Make sure totalTime is formatted as HH:mm
                  readOnly
                  style={{ border: '1px solid gray', borderRadius: '5px' }}
                />
              </div>


            </div>
            <button type='button' className='btn' onClick={handleUpdate1}>Update</button>
            <button type='button' className='outline-btn' onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>

        </div>
      )}
      {showConfirmation && (
        <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
          <p>Are you sure you want to delete this task?</p>
          <div className='btnContainer'>
            <button
              type='button'
              className='btn'
              onClick={() => handleDelete1(timesheetDelete)} // Call handleDelete1 with the task ID
            >
              Yes
            </button>
            <button
              type='button'
              className='btn'
              onClick={() => setShowConfirmation(false)}
            >
              No
            </button>
          </div>
        </div>
      )}
    
    </div>

  );

};

export default TimesheetDashboard;



































































