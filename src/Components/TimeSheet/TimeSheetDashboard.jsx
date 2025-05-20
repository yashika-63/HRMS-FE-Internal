
import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useParams } from 'react-router-dom';
import { strings } from '../../string';
import TimeSheet from '../TimeSheet/TimeSheet';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faTrashAlt, faEdit, faUserPlus, faEllipsisV, faUserTie, faEye } from '@fortawesome/free-solid-svg-icons';
import { showToast } from '../../Api.jsx';
const TimesheetDashboard = (onClose) => {

    const [formData, setFormData] = useState({
        name: '',
        id: '',
        designation: '',
        department: '',
        date: ''
    });
    const [highlightedDates, setHighlightedDates] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [dateRangeType, setDateRangeType] = useState('');
    const [timeSlots, setTimeSlots] = useState([]);
    const [taskDate, setTaskDate] = useState('');
    const [showDropdowns, setShowDropdowns] = useState(false);
    const [showTimesheetPage, setShowTimesheetPage] = useState(false);
    const [savedTimesheets, setSavedTimesheets] = useState([]);
    const { id } = useParams();
    const [isLocalStorageId, setIsLocalStorageId] = useState(false); // State to check the source of employeeId
    const [date, setDate] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [timesheetDelete, setTimesheetDelete] = useState(null);
    const [totalTime, setTotalTime] = useState('00:00');
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentView, setCurrentView] = useState('timesheet');
    const [expandedRows, setExpandedRows] = useState({});
    const [editTask, setEditTask] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [newTasks, setNewTasks] = useState([{ taskName: '', hoursSpent: '', taskDescription: '' }]);
    const [headerStartTime, setHeaderStartTime] = useState('00:00');
    const [headerEndTime, setHeaderEndTime] = useState('00:00');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [firstTimesheetId, setFirstTimesheetId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRangeId, setDateRangeId] = useState(null); // New state for dateRangeId
    const employeeId = localStorage.getItem("employeeId");
    const companyId = localStorage.getItem("companyId");

   
    
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
        const localEmployeeId = localStorage.getItem('employeeId'); // Get employeeId from localStorage
        const employeeIdToUse = id || localEmployeeId; // Use 'id' from URL if present, otherwise fallback to 'employeeId' from localStorage

        if (employeeIdToUse) {
            fetchEmployeeDetails(employeeIdToUse);
            setIsLocalStorageId(!!localEmployeeId && !id); // Set true if using local storage ID
        }
    }, [id]);



    const handleSendForApproval = async (date) => {
        if (!firstTimesheetId) {
            showToast("No timesheet found to approve.");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.put(`http://${strings.localhost}/api/timesheetmain/update/${firstTimesheetId}`);

            showToast("Timesheet send for approval.", 'success');

        } catch (error) {
            console.error("Error approving timesheet:", error);
            showToast("Failed to approve timesheet. Please try again.", 'error');
        }
        setLoading(false);
    };

    const generateTimeSlots = () => {
        const slots = [];
        const maxTime = 24 * 60; // 24 hours in minutes
        for (let i = 0; i < maxTime; i += 15) {
            const hours = Math.floor(i / 60);
            const minutes = i % 60;
            const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            slots.push(timeString);  // Format as HH:mm (e.g., "00:15", "23:45")
        }
        return slots;
    };

    useEffect(() => {
        const slots = generateTimeSlots();
        setTimeSlots(slots);
    }, []);


    const fetchTimesheetData = async (date) => {
        const localEmployeeId = localStorage.getItem('employeeId'); // Get employeeId from localStorage
        const employeeIdToUse = id || localEmployeeId;

        if (isFetchingData) return;

        setIsFetchingData(true);
        setDateRangeType('singleDate'); // Indicate that the first table data is being fetched

        try {
            console.log('Fetching timesheet data for date:', date); // Log the date being fetched

            const response = await axios.get(
                `http://${strings.localhost}/api/timesheetmain/getByDatesAndEmployeeId?date=${date}&employeeId=${employeeIdToUse}`
            );

            if (response.data && response.data.length > 0) {
                console.log('Fetched Timesheet Data:', response.data); // Log the fetched data before sorting
                const firstTimesheetId = response.data[0]?.id;
                setFirstTimesheetId(firstTimesheetId);
                console.log('First Timesheet ID:', firstTimesheetId);
                // Sort the fetched timesheets by `fromDate`
                const sortedData = response.data.sort((a, b) => {
                    const dateA = moment(a.fromDate).isValid() ? moment(a.fromDate) : moment();
                    const dateB = moment(b.fromDate).isValid() ? moment(b.fromDate) : moment();
                    return dateA - dateB;
                });

                // Sort `timesheetDays` inside each timesheet by `date`
                sortedData.forEach(sheet => {
                    sheet.timesheetDays.sort((a, b) => {
                        const dateA = moment(a.date).isValid() ? moment(a.date) : moment();
                        const dateB = moment(b.date).isValid() ? moment(b.date) : moment();
                        return dateA - dateB;
                    });
                });

                console.log('Sorted Timesheet Data:', sortedData); // Log the sorted data

                // Update the state with sorted timesheets
                setSavedTimesheets(sortedData);

                // Collect and highlight the dates in ascending order
                const dates = sortedData.flatMap((sheet) =>
                    sheet.timesheetDays.map((day) => day.date || day.fromDate)
                );
                setHighlightedDates(dates.map((date) => moment(date).format('YYYY-MM-DD')));

                console.log('Highlighted Dates:', dates); // Log the highlighted dates

                // Set date range values
                setFromDate(moment(sortedData[0].fromDate).format('DD-MM-YYYY'));
                setToDate(moment(sortedData[0].toDate).format('DD-MM-YYYY'));
                setDateRangeId(sortedData[0].id);
            } else {
                toast.warn('No timesheet data found for this date.');
            }
        } catch (error) {
            console.error('Error fetching timesheet data:', error);
            toast.warn('No Data Found. Try Another Date');
        } finally {
            setIsFetchingData(false);
        }
    };


    const fetchTimesheetByDate = async (startDate, endDate) => {
        const localEmployeeId = localStorage.getItem('employeeId'); // Get employeeId from localStorage
        const employeeIdToUse = id || localEmployeeId;

        if (isFetchingData) return;

        setIsFetchingData(true);
        setDateRangeType('dateRange'); // Indicate that the second table data is being fetched

        try {
            const { data } = await axios.get(
                `http://${strings.localhost}/api/timesheet-day/timesheet/byEmployeeIdAndDateRange?startDate=${startDate}&endDate=${endDate}&employeeId=${employeeIdToUse}`
            );
            const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));

            setSavedTimesheets(sortedData);
            const fetchedDates = sortedData.map(sheet => moment(sheet.date).format('YYYY-MM-DD'));
            // const dates = data.map((sheet) => sheet.date);
            setHighlightedDates(fetchedDates.map((fetchedDates) => moment(fetchedDates).format('YYYY-MM-DD')));
        } catch (error) {
            console.error('Error fetching timesheet data:', error);
        } finally {
            setIsFetchingData(false);
        }
    };



    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setFormData({ ...formData, date: selectedDate });
        setSavedTimesheets([]);
        setExpandedRows({});
        setStartDate('');
        setEndDate('');
        if (selectedDate) {
            fetchTimesheetData(selectedDate);
        }
    };
    useEffect(() => {
    }, [fromDate, toDate]);

    const handleFromDateChange = (e) => {
        const selectedStartDate = e.target.value;

        setStartDate(selectedStartDate);
        setFormData({ ...formData, date: '' });
        setDate('');
        if (selectedStartDate && endDate) {
            fetchTimesheetByDate(selectedStartDate, endDate);
        }
    };

    const handleToDateChange = (e) => {
        const selectedEndDate = e.target.value;
        setEndDate(selectedEndDate);
        setFormData({ ...formData, date: '' });
        setDate('');
        if (startDate && selectedEndDate) {
            fetchTimesheetByDate(startDate, selectedEndDate);
        }
    };
    const isAddMoreDisabled = () => {

        if (startDate && endDate) {
            return true;
        }
        if (formData.date && formData.date !== '') {
            return false;
        }

        return true;
    };


    const handleTaskDateChange = (e) => {
        const selectedDate = e.target.value;
        setTaskDate(selectedDate);
    };


    const toggleRowExpansion = (id) => {
        setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const formatTotalTime = (totalTime) => {
        if (!totalTime) return '00:00'; // or some default value
        return totalTime.split(':').map(part => part.padStart(2, '0')).join(':'); // Example formatting
    };
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    };
    const formatTotalTime1 = (totalHours) => {
        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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
        const startMoment = moment(start, 'HH:mm:ss');
        const endMoment = moment(end, 'HH:mm:ss');

        if (startMoment.isValid() && endMoment.isValid()) {
            if (endMoment.isBefore(startMoment)) {
                toast.warn('End time cannot be before start time.');
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
    const validateTimeConsistency = (newTasks, totalTime) => {
        const totalHoursSpent = newTasks.reduce((sum, task) => {
            const [hours, minutes] = (task.hoursSpent || '00:00').split(':').map(Number);
            return sum + (hours || 0) + (minutes / 60 || 0); // Convert minutes to hours
        }, 0);

        const totalHoursFromTime = moment.duration(totalTime).asHours();

        return totalHoursSpent === totalHoursFromTime; // Return true if they are equal
    };






    const handleModalSave = async () => {
        if (!dateRangeId) {
            toast.warn('Date Range ID is not defined.');
            return;
        }
        if (!fromDate || !toDate) {
            toast.warn('Please fetch timesheet data first.');
            return;
        }

        const taskDateMoment = moment(taskDate, 'YYYY-MM-DD');
        const validFromDate = moment(fromDate, 'DD-MM-YYYY');
        const validToDate = moment(toDate, 'DD-MM-YYYY');
        if (taskDateMoment.isBefore(validFromDate) || taskDateMoment.isAfter(validToDate)) {
            toast.warn('Selected date is outside the valid date range.');
            return;
        }

        const formattedStartTime = moment(headerStartTime, 'HH:mm').format('HH:mm:ss');
        const formattedEndTime = moment(headerEndTime, 'HH:mm').format('HH:mm:ss');
        const totalTime = calculateTotalTime(formattedStartTime, formattedEndTime);
        const formattedTotalTime = formatTime(totalTime);

        if (formattedTotalTime === '00:00') {
            toast.warn('End time cannot be before start time.');
            return;
        }

        if (!validateTimeConsistency(newTasks, formattedTotalTime)) {
            toast.warn("Total time and hours spent of all tasks must be the same.");
            return;
        }
        for (let task of newTasks) {
            if (!task.hoursSpent || task.hoursSpent.trim() === "") {
                toast.warn(`Please enter hours spent for task: ${task.taskName}`);
                return; // Exit early if any task is missing hoursSpent
            }
        }
        const dataToSave = {
            date: taskDate,
            dayStartTime: formattedStartTime,
            dayEndTime: formattedEndTime,
            totalTime: formattedTotalTime,
            timesheetDayDetails: newTasks.map(task => {
                const [hours, minutes] = task.hoursSpent.split(':');
                const formattedHoursSpent = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;

                return {
                    taskName: task.taskName,
                    hoursSpent: formattedHoursSpent,
                    taskDescription: task.taskDescription
                };
            })
        };



        try {
            const { data } = await axios.post(
                `http://${strings.localhost}/api/timesheet-day/save?timesheetMainId=${dateRangeId}&employeeId=${employeeId}&companyId=${companyId}`,
                dataToSave
            );
            setNewTasks([{ taskName: '', hoursSpent: '', taskDescription: '' }]);
            setHeaderStartTime('00:00');
            setHeaderEndTime('00:00');
            setTotalTime('00:00');

            toast.success("Tasks Saved Successfully!!");
            fetchTimesheetData(taskDate);
            setModalOpen(false);
        } catch (error) {
            // toast.error('Error saving tasks:', error);
            const errorMessage = error.response ? error.response.data.details : "Failed to save tasks. Please try again.";
            toast.error(errorMessage);
        }
    };


    const handleSeneToApproval = async () => {
        if (!selectedTimesheet) {
            console.error("No timesheet selected for approval.");
            return;
        }

        try {
            const response = await axios.put(`http://${strings.localhost}/api/timesheetmain/timesheets/approveOrReject/${selectedTimesheet.id}?approved=false&rejected=true`);

            alert("Timesheet approved successfully!");
            handleCloseModal();
            fetchTimesheets(); // Refresh the timesheet list
        } catch (error) {
            console.error("Error approving timesheet:", error);
            alert("Failed to approve timesheet. Please try again.");
        }
    };



    const resetModal = () => {
        setNewTasks([{ taskName: '', hoursSpent: '', taskDescription: '' }]);
        setHeaderStartTime('');
        setHeaderEndTime('');
    };
    const handleEditClick = (taskDetail) => {
        setEditTask(taskDetail);
        setShowUpdateModal(true);
        console.log(editTask);

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
                toast.success('Task updated successfully!');
                setShowEditModal(false);
                setEditTask(null);
            } catch (error) {
                console.error('Error updating task:', error);
                toast.error('Failed to update task');

            }
        }
    };

    const handleUpdate = async () => {
        if (editTask) {
            toast.dismiss(); // Clear any previous messages
            try {
                const hours = editTask.hoursSpent.split(':')[0].padStart(2, '0');
                const minutes = editTask.hoursSpent.split(':')[1].padStart(2, '0');
                const formattedHoursSpent = `${hours}:${minutes}:00`;
                await axios.put(`http://${strings.localhost}/api/timesheetDetail/${editTask.id}`, {
                    taskName: editTask.taskName,
                    hoursSpent: formattedHoursSpent,
                    taskDescription: editTask.taskDescription
                });
                toast.success('Task updated successfully!');
                setShowUpdateModal(false);
                setEditTask(null);
                if (formData.date) {
                    await fetchTimesheetData(formData.date);
                }
            } catch (error) {
                console.error('Error updating task:', error);
                toast.error('Failed to update task');
            }
        }
    };
    const editDropdownMenu = (taskDetail) => {
        const isManagerApproved = savedTimesheets.some(sheet => sheet.managerApproved);

        return (
            <div className="dropdown">
                {isManagerApproved ? (
                    <div className="approved-message">
                        <span className='error-message'>Sent For Approval</span>
                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        );
    };


    useEffect(() => {
        if (editTask) {
            setHeaderStartTime(moment(editTask.dayStartTime, 'HH:mm:ss').format('HH:mm')); // Format to HH:mm
            setHeaderEndTime(moment(editTask.dayEndTime, 'HH:mm:ss').format('HH:mm')); // Format to HH:mm
            // setShowEditModal(true);
        }
    }, [editTask]);

    const handleDelete1 = async (taskId) => {
        try {
            const response = await axios.delete(`http://${strings.localhost}/api/timesheet-day/delete/${taskId}`);
            setShowConfirmation(false);
            toast.success('Task deleted successfully!');
            fetchTimesheetData(formData.date); // Refresh the data
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        }
    };
    const handleDelete = (taskId) => {
        setTimesheetDelete(taskId); // Set the ID of the task to delete
        setShowConfirmation(true); // Show confirmation dialog
    };
    const editTimeshhetDays = (taskDetail, dayId) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                {isLocalStorageId && (
                    <>
                        {!savedTimesheets.some(sheet => sheet.managerApproved) && (

                            <div>
                                <button onClick={() => handleEditClick1(taskDetail)}>
                                    <FontAwesomeIcon className='ml-2' icon={faEdit} /> Edit
                                </button>
                            </div>
                        )}
                        <div>
                            <button onClick={() => handleDelete(taskDetail.id)}>
                                <FontAwesomeIcon className='ml-2' icon={faTrashAlt} /> Delete
                            </button>
                        </div>
                    </>
                )}
                <div>
                    <button onClick={() => toggleRowExpansion(dayId)} >
                        {expandedRows[dayId] ? 'Hide Details' : 'Show Details'}
                    </button>
                </div>
            </div>
        </div>
    );

    const calculateTotalHoursSpent = (tasks) => {
        return tasks.reduce((total, task) => {
            const [hours, minutes] = task.hoursSpent.split(':').map(Number);
            return total + (hours || 0) + (minutes / 60 || 0); // Convert minutes to hours
        }, 0);
    };
    const formatTimeForDropdown = (timeString) => {
        // Assuming timeString is in HH:MM:SS format
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`; // Returns HH:MM
    };
    useEffect(() => {
        // Assuming editTask is set when the modal is opened
        if (editTask && editTask.hoursSpent) {
            const formattedTime = formatTimeForDropdown(editTask.hoursSpent);
            setEditTask(prevState => ({
                ...prevState,
                hoursSpent: formattedTime  // Set the formatted time
            }));
        }
    }, [editTask]);


    const getMissingDates = () => {
        // Check if savedTimesheets is an array
        if (!Array.isArray(savedTimesheets)) {
            console.error('savedTimesheets is not an array:', savedTimesheets);
            return [];
        }

        const from = moment(fromDate, 'DD-MM-YYYY');
        const to = moment(toDate, 'DD-MM-YYYY');

        // Create a set of dates from savedTimesheets
        const existingDates = new Set(
            savedTimesheets.reduce((acc, sheet) => {
                if (sheet.timesheetDays && Array.isArray(sheet.timesheetDays)) {
                    // For each sheet, map over timesheetDays and add their formatted dates to the accumulator
                    const dates = sheet.timesheetDays.map(day => moment(day.date).format('YYYY-MM-DD'));
                    return acc.concat(dates); // Use concat to flatten the array
                }
                return acc; // If timesheetDays is missing or not an array, skip this sheet
            }, [])
        );

        const missingDates = [];

        // Loop through all dates from fromDate to toDate
        for (let date = moment(from); date.isBefore(to) || date.isSame(to); date.add(1, 'days')) {
            const formattedDate = date.format('YYYY-MM-DD'); // format the date for comparison
            if (!existingDates.has(formattedDate)) {
                missingDates.push(formattedDate);
            }
        }

        return missingDates;
    };


    const missingDates = getMissingDates();




    return (
        <div className='coreContainer'>

            {/* <div className="input-oneline">
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
            </div> */}

           
           

          
            <div className='timesheet-wrapper'>
               
                    <div className='timesheetleft-container'>
                      
                            <div className='timesheet-card'>
                                <div className='label'>
                                    <label htmlFor="date">Select Date:</label>
                                    <input style={{ border: '1px solid lightgrey' }} type="date" id="date" name="date" value={formData.date} onChange={handleDateChange} />
                                </div>
                                <div className='label'>
                                    <label>Start Date</label>
                                    <input type='date' value={startDate} onChange={handleFromDateChange} style={{ border: '1px solid lightgrey' }}></input>
                                </div>
                                <div className='label'>
                                    <label>End Date</label>
                                    <input type='date' value={endDate} onChange={handleToDateChange} style={{ border: '1px solid lightgrey' }}></input>
                                </div>

                            </div>

                      

                        {(dateRangeType === 'singleDate' || dateRangeType === 'dateRange') && (
                            <Calendar
                                onChange={setDate}
                                value={date}
                                tileClassName={({ date }) => {
                                    const formattedDate = moment(date).format('YYYY-MM-DD');
                                    return missingDates.includes(formattedDate) ? 'missing-date' : null;
                                }}
                            />
                        )}

                    </div>


              


                {/* {savedTimesheets.length > 0 && ( */}
                <div>
                    {/* <h3>Saved Timesheets</h3> */}




                    {/* {missingDates.length > 0 ? (
                                <div>
                                    <strong>Missing Dates:</strong>
                                    <ul>
                                        {missingDates.map((date) => (
                                            <li key={date}>{moment(date).format('DD-MM-YYYY')}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div>No missing dates between the given range.</div>
                            )} */}

                    <div className='timesheetright-container'>
                        {dateRangeType === 'singleDate' && (
                            <div className='timesheet-table-container'>
                                <div className='date-range-timesheetcontainer'>
                                    <div className='timesheetdate-range-left'>
                                        {dateRangeType === 'singleDate' ? (
                                            <>
                                                <div>
                                                    <strong>From Date:</strong> {fromDate}
                                                </div>
                                                <div>
                                                    <strong>To Date:</strong> {toDate}
                                                </div>
                                                <div>
                                                    <strong>Manager Approval: </strong>
                                                    {savedTimesheets.length > 0 && savedTimesheets[0]?.managerApproved ? (
                                                        <span className='approved'>Approved</span>
                                                    ) : savedTimesheets.length > 0 && savedTimesheets[0]?.managerRejected ? (
                                                        <span className='rejected'>Rejected</span>
                                                    ) : (
                                                        <span className='pending'>Pending</span>
                                                    )}
                                                </div>
                                            </>
                                        ) : dateRangeType === 'dateRange' ? (
                                            <>
                                                <div>
                                                    <strong>Start Date:</strong> {startDate}
                                                </div>
                                                <div>
                                                    <strong>End Date:</strong> {endDate}
                                                </div>
                                            </>
                                        ) : null}
                                    </div>


                                    <div className='timesheetdate-range-right'>
                                        {dateRangeType === 'singleDate' ? (
                                            <>
                                                <div className="color-legend">
                                                    <div className="legend-item">
                                                        <span className="legend-circle pink"></span> <span>No Data Filled </span>
                                                    </div>

                                                </div>
                                            </>
                                        ) : null}
                                        {!id && !savedTimesheets.some(sheet => sheet.managerApproved) && (
                                            <button className='btn' onClick={handleAddMore} disabled={isAddMoreDisabled()} >Add More</button>
                                        )}
                                    </div>
                                </div>


                                <table className='custom-table'>
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
                                        {savedTimesheets && savedTimesheets.length > 0 ? (
                                            savedTimesheets.map(sheet => (
                                                <Fragment key={sheet.id}>
                                                    {sheet.timesheetDays && Array.isArray(sheet.timesheetDays) && sheet.timesheetDays.length > 0 ? (
                                                        sheet.timesheetDays.map(day => (
                                                            <Fragment key={day.id}>
                                                                <tr>
                                                                    <td>{moment(day.date || day.fromDate).format('DD-MM-YYYY')}</td>
                                                                    <td>{moment(day.dayStartTime || '00:00:00', 'HH:mm:ss').format('hh:mm A')}</td>
                                                                    <td>{moment(day.dayEndTime || '00:00:00', 'HH:mm:ss').format('hh:mm A')}</td>
                                                                    <td>{formatTotalTime(day.totalTime || '00:00:00')}</td>
                                                                    <td>{editTimeshhetDays(day, day.id)}</td>
                                                                </tr>
                                                                {expandedRows[day.id] && (
                                                                    <tr>
                                                                        <td colSpan="5">
                                                                            <table className="custom-table">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Task Name</th>
                                                                                        <th>Hours Spent</th>
                                                                                        <th>Description</th>
                                                                                        <th>Actions</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {Array.isArray(day.timesheetDayDetails) && day.timesheetDayDetails.length > 0 ? (
                                                                                        day.timesheetDayDetails.map(detail => (
                                                                                            <tr key={detail.id}>
                                                                                                <td>{detail.taskName}</td>
                                                                                                <td>{detail.hoursSpent}</td>
                                                                                                <td>{detail.taskDescription}</td>
                                                                                                <td>{editDropdownMenu(detail)}</td>
                                                                                            </tr>
                                                                                        ))
                                                                                    ) : (
                                                                                        <tr><td colSpan="5">No task details available</td></tr>
                                                                                    )}
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                )}

                                                            </Fragment>

                                                        ))

                                                    ) : (
                                                        <tr key={sheet.id}><td colSpan="5">No days available for this timesheet</td></tr>
                                                    )}
                                                </Fragment>
                                            ))
                                        ) : (
                                            <tr><td colSpan="5">No timesheet data available</td></tr>
                                        )}
                                    </tbody>

                                </table>


                                {loading && <div className="loading-spinner"></div>}
                                {
                                    savedTimesheets.some(sheet =>
                                        (sheet.sendForApproval === true && (sheet.managerApproved === false || sheet.managerRejected === false)) ||
                                        (sheet.sendForApproval === false && sheet.managerApproved === false && sheet.managerRejected === true) ||
                                        (sheet.sendForApproval === false && (sheet.managerApproved === false || sheet.managerRejected === false) && !(sheet.managerApproved === true && sheet.managerRejected === false))

                                    ) && (
                                        <div className='form-controls'>
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={handleSendForApproval}
                                                disabled={loading}
                                            >
                                                {loading ? 'Sending...' : 'Send For Approval'}
                                            </button>
                                        </div>
                                    )
                                }



                            </div>
                        )}

                        {/* Conditionally render the second table */}
                        {dateRangeType === 'dateRange' && (
                            <div className='timesheet-table-container'>
                                <table className='custom-table'>
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
                                        {savedTimesheets && savedTimesheets.length > 0 ? (
                                            savedTimesheets.map(sheet => (
                                                <Fragment key={sheet.id}>
                                                    <tr>
                                                        <td>{moment(sheet.date).format('DD-MM-YYYY')}</td>
                                                        <td>{moment(sheet.dayStartTime, 'HH:mm:ss').format('hh:mm A')}</td>
                                                        <td>{moment(sheet.dayEndTime, 'HH:mm:ss').format('hh:mm A')}</td>
                                                        <td>{formatTotalTime(sheet.totalTime)}</td>
                                                        <td>{editTimeshhetDays(sheet, sheet.id)}</td>
                                                    </tr>
                                                    {expandedRows[sheet.id] && (
                                                        <tr>
                                                            <td colSpan="5">
                                                                <table className="custom-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Task Name</th>
                                                                            <th>Hours Spent</th>
                                                                            <th>Description</th>
                                                                            <th>Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {Array.isArray(sheet.timesheetDayDetails) && sheet.timesheetDayDetails.length > 0 ? (
                                                                            sheet.timesheetDayDetails.map(detail => (
                                                                                <tr key={detail.id}>
                                                                                    <td>{detail.taskName}</td>
                                                                                    <td>{detail.hoursSpent}</td>
                                                                                    <td>{detail.taskDescription}</td>
                                                                                    <td>{editDropdownMenu(detail)}</td>
                                                                                </tr>
                                                                            ))
                                                                        ) : (
                                                                            <tr><td colSpan="5">No task details available</td></tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            ))
                                        ) : (
                                            <tr><td colSpan="5">No timesheet data available</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                </div>

                {/* )} */}
            </div>
            {showUpdateModal && editTask && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className='title'>Edit Task</h2>
                        <div>
                            <label>Task Name:</label>
                            <input
                                type="text"
                                value={editTask.taskName || ''}
                                onChange={(e) => setEditTask({ ...editTask, taskName: e.target.value })}
                            />
                            <label>Hours Spent:</label>
                            <select
                                value={editTask.hoursSpent || ''}
                                onChange={(e) => setEditTask({ ...editTask, hoursSpent: e.target.value })}
                                style={{ border: '1px solid gray' }}
                            >
                                {timeSlots.map((slot) => (
                                    <option key={slot} value={slot}>
                                        {slot}
                                    </option>
                                ))}
                            </select>
                            <label>Description:</label>
                            <input
                                type="text"
                                value={editTask.taskDescription || ''}
                                onChange={(e) => setEditTask({ ...editTask, taskDescription: e.target.value })}
                            />
                            <button type="button" className='btn' onClick={handleUpdate}>Update</button>
                            <button type="button" className='outline-btn' onClick={() => setShowUpdateModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}


            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add Tasks</h2>
                        <div className="input-row">
                            <div>
                                <label>Date:</label>
                                <input type="date" value={taskDate} onChange={handleTaskDateChange} className='selectIM' />
                            </div>
                            <div>
                                <label>Start Time:</label>
                                <select value={headerStartTime} onChange={(e) => setHeaderStartTime(e.target.value)} className='selectIM'>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>
                                            {slot}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>End Time:</label>
                                <select value={headerEndTime} onChange={(e) => setHeaderEndTime(e.target.value)} className='selectIM'>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>
                                            {slot}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <p >
                                    <strong>Total Time:</strong> {formatTotalTime(calculateTotalTime(headerStartTime, headerEndTime))}
                                </p>
                                <p>
                                    <strong>Total Hours Spent:</strong> {formatTotalTime1(calculateTotalHoursSpent(newTasks))}
                                </p>
                            </div>
                        </div>
                        <table className="Goal-table">
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
                                            <select value={task.hoursSpent} onChange={(e) => handleTaskChange(index, 'hoursSpent', e.target.value)} className='selectIM'>
                                                {timeSlots.map(slot => (
                                                    <option key={slot} value={slot}>
                                                        {slot}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input type="text" value={task.taskDescription} onChange={(e) => handleTaskChange(index, 'taskDescription', e.target.value)} />
                                        </td>
                                        <td>
                                            <button type="button" onClick={() => handleRemoveTask(index)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
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
                                    <select value={headerStartTime} onChange={(e) => setHeaderStartTime(e.target.value)}>
                                        {timeSlots.map(slot => (
                                            <option key={slot} value={slot}>
                                                {slot}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <label>
                                End Time
                                <select value={headerEndTime} onChange={(e) => setHeaderEndTime(e.target.value)}>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>
                                            {slot}
                                        </option>
                                    ))}
                                </select>

                            </label>
                            <div>
                                <label>Total Time:</label>
                                <input
                                    type="text"
                                    value={formatTotalTime(calculateTotalTime(headerStartTime, headerEndTime))}
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

















































































































































// import React, { useState, useEffect, Fragment } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';
// import { strings } from '../../string';
// import TimeSheet from '../TimeSheet/TimeSheet';
// import moment from 'moment';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTrash } from '@fortawesome/free-solid-svg-icons';
// import {  toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { faTrashAlt, faEdit, faUserPlus, faEllipsisV, faUserTie, faEye } from '@fortawesome/free-solid-svg-icons';
// import { secondsInDay } from 'date-fns';
// const TimesheetDashboard = (onClose) => {

//     const [formData, setFormData] = useState({
//         name: '',
//         id: '',
//         designation: '',
//         department: '',
//         date: ''
//     });
//     const [isFetchingData, setIsFetchingData] = useState(false);
//     const [dateRangeType, setDateRangeType] = useState('');
//     const [timeSlots, setTimeSlots] = useState([]);
//     const [taskDate, setTaskDate] = useState('');
//     const [showDropdowns, setShowDropdowns] = useState(false);
//     const [showTimesheetPage, setShowTimesheetPage] = useState(false);
//     const [savedTimesheets, setSavedTimesheets] = useState([]);
//     const { id } = useParams();
//     const [isLocalStorageId, setIsLocalStorageId] = useState(false); // State to check the source of employeeId
//     const [date, setDate] = useState('');
//     const [showConfirmation, setShowConfirmation] = useState(false);
//     const [timesheetDelete, setTimesheetDelete] = useState(null);
//     const [totalTime, setTotalTime] = useState('00:00');
//     const [showUpdateModal, setShowUpdateModal] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [currentView, setCurrentView] = useState('');
//     const [expandedRows, setExpandedRows] = useState({});
//     const [editTask, setEditTask] = useState(null);
//     const [modalOpen, setModalOpen] = useState(false);
//     const [newTasks, setNewTasks] = useState([{ taskName: '', hoursSpent: '', taskDescription: '' }]);
//     const [headerStartTime, setHeaderStartTime] = useState('00:00');
//     const [headerEndTime, setHeaderEndTime] = useState('00:00');
//     const [fromDate, setFromDate] = useState('');
//     const [toDate, setToDate] = useState('');
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');

//     const [dateRangeId, setDateRangeId] = useState(null); // New state for dateRangeId
//     const employeeId = localStorage.getItem("employeeId");
//     const companyId = localStorage.getItem("companyId");

//     const handleShowTimesheet = () => {
//         setCurrentView('showTimesheet');
//         setShowDropdowns(true);
//         setShowTimesheetPage(false);
//         setSavedTimesheets([]);
//     };

//     const handleShowTimesheetPage = () => {
//         setCurrentView('timesheet');
//         setShowDropdowns(false);
//         setShowTimesheetPage(true);
//     };

//     const fetchEmployeeDetails = async (employeeIdToUse) => {
//         try {
//             const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeIdToUse}`);
//             const employee = response.data;
//             setFormData({
//                 name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
//                 id: employee.id,
//                 department: employee.department,
//                 designation: employee.designation
//             });
//         } catch (error) {
//             console.error('Error fetching employee details:', error);
//         }
//     };

//     useEffect(() => {
//         const localEmployeeId = localStorage.getItem('employeeId'); // Get employeeId from localStorage
//         const employeeIdToUse = id || localEmployeeId; // Use 'id' from URL if present, otherwise fallback to 'employeeId' from localStorage

//         if (employeeIdToUse) {
//             fetchEmployeeDetails(employeeIdToUse);
//             setIsLocalStorageId(!!localEmployeeId && !id); // Set true if using local storage ID
//         }
//     }, [id]);

//     const generateTimeSlots = () => {
//         const slots = [];
//         const maxTime = 24 * 60; // 24 hours in minutes
//         for (let i = 0; i < maxTime; i += 15) {
//             const hours = Math.floor(i / 60);
//             const minutes = i % 60;
//             const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
//             slots.push(timeString);  // Format as HH:mm (e.g., "00:15", "23:45")
//         }
//         return slots;
//     };
    
//     useEffect(() => {
//         const slots = generateTimeSlots();
//         setTimeSlots(slots);
//     }, []);
    

//     const fetchTimesheetData = async (date) => {
//         const localEmployeeId = localStorage.getItem('employeeId'); // Get employeeId from localStorage
//         const employeeIdToUse = id || localEmployeeId;
//         if (isFetchingData) return;

//         setIsFetchingData(true);
//         setDateRangeType('singleDate');  // Indicate that the first table data is being fetched

//         try {
//             const response = await axios.get(
//                 `http://${strings.localhost}/api/timesheetmain/getByDatesAndEmployeeId?date=${date}&employeeId=${employeeIdToUse}`
//             );
//             if (response.data && response.data.length > 0) {
//                 setSavedTimesheets(response.data);
//                 setFromDate(moment(response.data[0].fromDate).format('DD-MM-YYYY'));
//                 setToDate(moment(response.data[0].toDate).format('DD-MM-YYYY'));
//                 setDateRangeId(response.data[0].id);
//             } else {
//                 toast.warn('No timesheet data found for this date.');
//             }
//         } catch (error) {
//             console.error('Error fetching timesheet data:', error);
//             toast.warn('No Data Found. Try Another Date');
//         } finally {
//             setIsFetchingData(false);
//         }
//     };
//     const fetchTimesheetByDate = async (startDate, endDate) => {
//         const localEmployeeId = localStorage.getItem('employeeId'); // Get employeeId from localStorage
//         const employeeIdToUse = id || localEmployeeId;
//         if (isFetchingData) return;

//         setIsFetchingData(true);
//         setDateRangeType('dateRange');  // Indicate that the second table data is being fetched

//         try {
//             const { data } = await axios.get(
//                 `http://${strings.localhost}/api/timesheet-day/timesheet/byEmployeeIdAndDateRange?startDate=${startDate}&endDate=${endDate}&employeeId=${employeeIdToUse}`
//             );
//             setSavedTimesheets(data);
//         } catch (error) {
//             console.error('Error fetching timesheet data:', error);
//         } finally {
//             setIsFetchingData(false);
//         }
//     };


//     const handleDateChange = (e) => {
//         const selectedDate = e.target.value;
//         setFormData({ ...formData, date: selectedDate });
//         setSavedTimesheets([]);
//         setExpandedRows({});
//         setStartDate('');
//         setEndDate('');
//         if (selectedDate) {
//             fetchTimesheetData(selectedDate);
//         }
//     };
//     useEffect(() => {
//     }, [fromDate, toDate]);

//     const handleFromDateChange = (e) => {
//         const selectedStartDate = e.target.value;

//         setStartDate(selectedStartDate);
//         setFormData({ ...formData, date: '' });
//         setDate('');
//         if (selectedStartDate && endDate) {
//             fetchTimesheetByDate(selectedStartDate, endDate);
//         }
//     };

//     const handleToDateChange = (e) => {
//         const selectedEndDate = e.target.value;
//         setEndDate(selectedEndDate);
//         setFormData({ ...formData, date: '' });
//         setDate('');
//         if (startDate && selectedEndDate) {
//             fetchTimesheetByDate(startDate, selectedEndDate);
//         }
//     };
//     const isAddMoreDisabled = () => {

//         if (startDate && endDate) {
//             return true;
//         }
//         if (formData.date && formData.date !== '') {
//             return false;
//         }

//         return true;
//     };


//     const handleTaskDateChange = (e) => {
//         const selectedDate = e.target.value;
//         setTaskDate(selectedDate);
//     };


//     const toggleRowExpansion = (id) => {
//         setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
//     };

//     const formatTotalTime = (totalTime) => {
//         if (!totalTime) return '00:00'; // or some default value
//         return totalTime.split(':').map(part => part.padStart(2, '0')).join(':'); // Example formatting
//     };
//     const formatTime = (time) => {
//         const [hours, minutes] = time.split(':').map(Number);
//         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
//     };
//     const formatTotalTime1 = (totalHours) => {
//         const hours = Math.floor(totalHours);
//         const minutes = Math.round((totalHours - hours) * 60);
//         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
//     };
//     const handleAddMore = () => {
//         setModalOpen(true);
//     };

//     const handleTaskChange = (index, field, value) => {
//         const updatedTasks = [...newTasks];
//         updatedTasks[index][field] = value;
//         setNewTasks(updatedTasks);
//     };

//     const handleRemoveTask = (index) => {
//         const updatedTasks = newTasks.filter((_, i) => i !== index);
//         setNewTasks(updatedTasks);
//     };

//     const handleAddTask = () => {
//         setNewTasks([...newTasks, { taskName: '', hoursSpent: '', taskDescription: '' }]);
//     };

//     const calculateTotalTime = (start, end) => {
//         const startMoment = moment(start, 'HH:mm:ss');
//         const endMoment = moment(end, 'HH:mm:ss');

//         if (startMoment.isValid() && endMoment.isValid()) {
//             if (endMoment.isBefore(startMoment)) {
//                 toast.warn('End time cannot be before start time.');
//                 return '00:00'; // Return 00:00 if end time is before start time
//             }
//             const duration = moment.duration(endMoment.diff(startMoment));
//             const hours = Math.floor(duration.asHours());
//             const minutes = duration.minutes().toString().padStart(2, '0'); // Ensure two-digit minute format
//             const seconds = duration.seconds().toString().padStart(2, '0'); // Ensure two-digit minute format

//             return `${hours}:${minutes}:${seconds}`; // HH:mm format
//         }
//         return '00:00'; // Return 00:00 if times are invalid
//     };
//     const validateTimeConsistency = (newTasks, totalTime) => {
//         const totalHoursSpent = newTasks.reduce((sum, task) => {
//             const [hours, minutes] = (task.hoursSpent || '00:00').split(':').map(Number);
//             return sum + (hours || 0) + (minutes / 60 || 0); // Convert minutes to hours
//         }, 0);

//         const totalHoursFromTime = moment.duration(totalTime).asHours();

//         return totalHoursSpent === totalHoursFromTime; // Return true if they are equal
//     };






//     const handleModalSave = async () => {
//         if (!dateRangeId) {
//             toast.warn('Date Range ID is not defined.');
//             return;
//         }
//         if (!fromDate || !toDate) {
//             toast.warn('Please fetch timesheet data first.');
//             return;
//         }

//         const taskDateMoment = moment(taskDate, 'YYYY-MM-DD');
//         const validFromDate = moment(fromDate, 'DD-MM-YYYY');
//         const validToDate = moment(toDate, 'DD-MM-YYYY');
//         if (taskDateMoment.isBefore(validFromDate) || taskDateMoment.isAfter(validToDate)) {
//             toast.warn('Selected date is outside the valid date range.');
//             return;
//         }

//         const formattedStartTime = moment(headerStartTime, 'HH:mm').format('HH:mm:ss');
//         const formattedEndTime = moment(headerEndTime, 'HH:mm').format('HH:mm:ss');
//         const totalTime = calculateTotalTime(formattedStartTime, formattedEndTime);
//         const formattedTotalTime = formatTime(totalTime);

//         if (formattedTotalTime === '00:00') {
//             toast.warn('End time cannot be before start time.');
//             return;
//         }

//         if (!validateTimeConsistency(newTasks, formattedTotalTime)) {
//             toast.warn("Total time and hours spent of all tasks must be the same.");
//             return;
//         }

//         const dataToSave = {
//             date: taskDate,
//             dayStartTime: formattedStartTime,
//             dayEndTime: formattedEndTime,
//             totalTime: formattedTotalTime,
//             timesheetDayDetails: newTasks.map(task => {
//                 const [hours, minutes] = task.hoursSpent.split(':');
//                 const formattedHoursSpent = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;

//                 return {
//                     taskName: task.taskName,
//                     hoursSpent: formattedHoursSpent,
//                     taskDescription: task.taskDescription
//                 };
//             })
//         };

//         try {
//             const { data } = await axios.post(
//                 `http://${strings.localhost}/api/timesheet-day/save?timesheetMainId=${dateRangeId}&employeeId=${employeeId}&companyId=${companyId}`,
//                 dataToSave
//             );
//             setNewTasks([{ taskName: '', hoursSpent: '', taskDescription: '' }]);
//             setHeaderStartTime('00:00');
//             setHeaderEndTime('00:00');
//             setTotalTime('00:00');

//             toast.success("Tasks Saved Successfully!!");
//             setModalOpen(false);
//         } catch (error) {
//             toast.error('Error saving tasks:', error);
//             const errorMessage = error.response ? error.response.data.message : "Failed to save tasks. Please try again.";
//             toast.error(errorMessage);
//         }
//     };



//     const resetModal = () => {
//         setNewTasks([{ taskName: '', hoursSpent: '', taskDescription: '' }]);
//         setHeaderStartTime('');
//         setHeaderEndTime('');
//     };
//     const handleEditClick = (taskDetail) => {
//         setEditTask(taskDetail);
//         setShowUpdateModal(true);
//         console.log(editTask);

//     };
//     const handleEditClick1 = (taskDetail) => {
//         setEditTask(taskDetail);
//         setHeaderStartTime(taskDetail.dayStartTime || '');
//         setHeaderEndTime(taskDetail.dayEndTime || '');
//         setTotalTime(taskDetail.totalTime || '00:00');
//         setDate(moment(taskDetail.date).format('YYYY-MM-DD'));
//         setShowEditModal(true);

//     };

//     const handleUpdate1 = async () => {
//         if (editTask) {
//             const total = calculateTotalTime(headerStartTime, headerEndTime);
//             const formattedStartTime = moment(headerStartTime, 'HH:mm').format('HH:mm:ss');
//             const formattedEndTime = moment(headerEndTime, 'HH:mm').format('HH:mm:ss');
//             const formateeddate = date;
//             // const total = calculateTotalTime(formattedStartTime, formattedEndTime);
//             setTotalTime(total);
//             const dataToSave = {
//                 date: formateeddate,
//                 dayStartTime: formattedStartTime,
//                 dayEndTime: formattedEndTime,
//                 totalTime: total,
//             };
//             try {
//                 await axios.put(`http://${strings.localhost}/api/timesheet-day/${editTask.id}`, dataToSave);
//                 toast.success('Task updated successfully!');
//                 setShowEditModal(false);
//                 setEditTask(null);
//             } catch (error) {
//                 console.error('Error updating task:', error);
//                 toast.error('Failed to update task');

//             }
//         }
//     };

//     const handleUpdate = async () => {
//         if (editTask) {
//             toast.dismiss(); // Clear any previous messages
//             try {
//                 const hours = editTask.hoursSpent.split(':')[0].padStart(2, '0');
//                 const minutes = editTask.hoursSpent.split(':')[1].padStart(2, '0');
//                 const formattedHoursSpent = `${hours}:${minutes}:00`;
//                 await axios.put(`http://${strings.localhost}/api/timesheetDetail/${editTask.id}`, {
//                     taskName: editTask.taskName,
//                     hoursSpent: formattedHoursSpent,
//                     taskDescription: editTask.taskDescription
//                 });
//                 toast.success('Task updated successfully!');
//                 setShowUpdateModal(false);
//                 setEditTask(null);
//                 if (formData.date) {
//                     await fetchTimesheetData(formData.date);
//                 }
//             } catch (error) {
//                 console.error('Error updating task:', error);
//                 toast.error('Failed to update task');
//             }
//         }
//     };
//     const editDropdownMenu = (taskDetail) => (
//         <div className="dropdown">
//             <button className="dots-button">
//                 <FontAwesomeIcon icon={faEllipsisV} />
//             </button>
//             <ul className="dropdown-content">
//                 <li>
//                     <button onClick={() => handleEditClick(taskDetail)}>
//                         <FontAwesomeIcon className='ml-2' icon={faEdit} /> Edit
//                     </button>
//                 </li>

//             </ul>
//         </div>
//     );
//     useEffect(() => {
//         if (editTask) {
//             setHeaderStartTime(moment(editTask.dayStartTime, 'HH:mm:ss').format('HH:mm')); // Format to HH:mm
//             setHeaderEndTime(moment(editTask.dayEndTime, 'HH:mm:ss').format('HH:mm')); // Format to HH:mm
//             // setShowEditModal(true);
//         }
//     }, [editTask]);

//     const handleDelete1 = async (taskId) => {
//         try {
//             const response = await axios.delete(`http://${strings.localhost}/api/timesheet-day/delete/${taskId}`);
//             setShowConfirmation(false);
//             toast.success('Task deleted successfully!');
//             fetchTimesheetData(formData.date); // Refresh the data
//         } catch (error) {
//             console.error('Error deleting task:', error);
//             toast.delete('Failed to delete task');
//         }
//     };
//     const handleDelete = (taskId) => {
//         setTimesheetDelete(taskId); // Set the ID of the task to delete
//         setShowConfirmation(true); // Show confirmation dialog
//     };
//     const editTimeshhetDays = (taskDetail, dayId) => (
//         <div className="dropdown">
//             <button className="dots-button">
//                 <FontAwesomeIcon icon={faEllipsisV} />
//             </button>
//             <ul className="dropdown-content">
//                 {isLocalStorageId && (
//                     <>
//                         <li>
//                             <button onClick={() => handleEditClick1(taskDetail)}>
//                                 <FontAwesomeIcon className='ml-2' icon={faEdit} /> Edit
//                             </button>
//                         </li>
//                         <li>
//                             <button onClick={() => handleDelete(taskDetail.id)}>
//                                 <FontAwesomeIcon className='ml-2' icon={faTrashAlt} /> Delete
//                             </button>
//                         </li>
//                     </>
//                 )}
//                 <li>
//                     <button onClick={() => toggleRowExpansion(dayId)}>
//                         {expandedRows[dayId] ? 'Hide Details' : 'Show Details'}
//                     </button>
//                 </li>
//             </ul>
//         </div>
//     );
//     const calculateTotalHoursSpent = (tasks) => {
//         return tasks.reduce((total, task) => {
//             const [hours, minutes] = task.hoursSpent.split(':').map(Number);
//             return total + (hours || 0) + (minutes / 60 || 0); // Convert minutes to hours
//         }, 0);
//     };
//     const formatTimeForDropdown = (timeString) => {
//         // Assuming timeString is in HH:MM:SS format
//         const [hours, minutes] = timeString.split(':');
//         return `${hours}:${minutes}`; // Returns HH:MM
//     };
//     useEffect(() => {
//         // Assuming editTask is set when the modal is opened
//         if (editTask && editTask.hoursSpent) {
//             const formattedTime = formatTimeForDropdown(editTask.hoursSpent);
//             setEditTask(prevState => ({
//                 ...prevState,
//                 hoursSpent: formattedTime  // Set the formatted time
//             }));
//         }
//     }, [editTask]);  // Runs when editTask is set



//     return (
//         <div>
//             <div className="input-row">
//                 <div>
//                     <label htmlFor="name">Employee Name:</label>
//                     <input type="text" className='readonly' id="name" name="name" value={formData.name} readOnly />
//                 </div>
//                 <div>
//                     <label htmlFor="id">Employee ID:</label>
//                     <input type="text" className='readonly' id="id" name="id" value={formData.id} readOnly />
//                 </div>
//                 <div>
//                     <label htmlFor="designation">Employee Designation:</label>
//                     <input type="text" className='readonly' id="designation" name="designation" value={formData.designation} readOnly />
//                 </div>
//                 <div>
//                     <label htmlFor="department">Employee Department:</label>
//                     <input type="text" className='readonly' id="department" name="department" value={formData.department} readOnly />
//                 </div>
//             </div>

//             <div>
//                 <div style={{ marginBottom: '20px' }}>
//                     {isLocalStorageId ? (
//                         <>
//                             <button className='btn' onClick={handleShowTimesheetPage}>Timesheet</button>

//                             <button className='btn' onClick={handleShowTimesheet}>Show Timesheet</button>
//                         </>
//                     ) : (

//                         <button className='btn' onClick={handleShowTimesheet}>Show Timesheet</button>

//                     )}
//                 </div>
//             </div>
//             {currentView === 'showTimesheet' && (
//                 <div>
//                     {showDropdowns && (
//                         <div className='row'>
//                             <div>
//                                 <label htmlFor="date">Select Date:</label>
//                                 <input style={{ border: '1px solid black' }} type="date" id="date" name="date" value={formData.date} onChange={handleDateChange} />
//                             </div>
//                             <div>
//                                 <label>Start Date</label>
//                                 <input type='date' value={startDate} onChange={handleFromDateChange} style={{ border: '1px solid black' }}></input>
//                             </div>
//                             <div>
//                                 <label>End Date</label>
//                                 <input type='date' value={endDate} onChange={handleToDateChange} style={{ border: '1px solid black' }}></input>
//                             </div>

//                         </div>

//                     )}

//                     {savedTimesheets.length > 0 && (
//                         <div>
//                             <h3>Saved Timesheets</h3>
//                             <div className='form-controls'>
//                                 {!id && (
//                                     <button className='btn' onClick={handleAddMore} disabled={isAddMoreDisabled()} >Add More</button>
//                                 )}
//                             </div>
//                             <div>
//                                 <strong>From Date:</strong> {fromDate}
//                             </div>
//                             <div>
//                                 <strong>To Date:</strong> {toDate}
//                             </div>
//                             {dateRangeType === 'singleDate' && (
//                                 <table className='EP-table'>
//                                     <thead>
//                                         <tr>
//                                             <th>Date</th>
//                                             <th>Log In Time</th>
//                                             <th>Log Out Time</th>
//                                             <th>Total Time</th>
//                                             <th>Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {savedTimesheets && savedTimesheets.length > 0 ? (
//                                             savedTimesheets.map(sheet => (
//                                                 <Fragment key={sheet.id}>
//                                                     {sheet.timesheetDays && Array.isArray(sheet.timesheetDays) && sheet.timesheetDays.length > 0 ? (
//                                                         sheet.timesheetDays.map(day => (
//                                                             <Fragment key={day.id}>
//                                                                 <tr>
//                                                                     <td>{moment(day.date || day.fromDate).format('DD-MM-YYYY')}</td>
//                                                                     <td>{moment(day.dayStartTime || '00:00:00', 'HH:mm:ss').format('hh:mm A')}</td>
//                                                                     <td>{moment(day.dayEndTime || '00:00:00', 'HH:mm:ss').format('hh:mm A')}</td>
//                                                                     <td>{formatTotalTime(day.totalTime || '00:00:00')}</td>
//                                                                     <td>{editTimeshhetDays(day, day.id)}</td>
//                                                                 </tr>
//                                                                 {expandedRows[day.id] && (
//                                                                     <tr>
//                                                                         <td colSpan="6">
//                                                                             <table className="EP-table">
//                                                                                 <thead>
//                                                                                     <tr>
//                                                                                         <th>Task Name</th>
//                                                                                         <th>Hours Spent</th>
//                                                                                         <th>Description</th>
//                                                                                         <th>Actions</th>
//                                                                                     </tr>
//                                                                                 </thead>
//                                                                                 <tbody>
//                                                                                     {Array.isArray(day.timesheetDayDetails) && day.timesheetDayDetails.length > 0 ? (
//                                                                                         day.timesheetDayDetails.map(detail => (
//                                                                                             <tr key={detail.id}>
//                                                                                                 <td>{detail.taskName}</td>
//                                                                                                 <td>{detail.hoursSpent}</td>
//                                                                                                 <td>{detail.taskDescription}</td>
//                                                                                                 <td>{editDropdownMenu(detail)}</td>
//                                                                                             </tr>
//                                                                                         ))
//                                                                                     ) : (
//                                                                                         <tr><td colSpan="4">No task details available</td></tr>
//                                                                                     )}
//                                                                                 </tbody>
//                                                                             </table>
//                                                                         </td>
//                                                                     </tr>
//                                                                 )}
//                                                             </Fragment>
//                                                         ))
//                                                     ) : (
//                                                         <tr key={sheet.id}><td colSpan="5">No days available for this timesheet</td></tr>
//                                                     )}
//                                                 </Fragment>
//                                             ))
//                                         ) : (
//                                             <tr><td colSpan="5">No timesheet data available</td></tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             )}

//                             {/* Conditionally render the second table */}
//                             {dateRangeType === 'dateRange' && (
//                                 <table className='EP-table'>
//                                     <thead>
//                                         <tr>
//                                             <th>Date</th>
//                                             <th>Log In Time</th>
//                                             <th>Log Out Time</th>
//                                             <th>Total Time</th>
//                                             <th>Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {savedTimesheets && savedTimesheets.length > 0 ? (
//                                             savedTimesheets.map(sheet => (
//                                                 <Fragment key={sheet.id}>
//                                                     <tr>
//                                                         <td>{moment(sheet.date).format('DD-MM-YYYY')}</td>
//                                                         <td>{moment(sheet.dayStartTime, 'HH:mm:ss').format('hh:mm A')}</td>
//                                                         <td>{moment(sheet.dayEndTime, 'HH:mm:ss').format('hh:mm A')}</td>
//                                                         <td>{formatTotalTime(sheet.totalTime)}</td>
//                                                         <td>{editTimeshhetDays(sheet, sheet.id)}</td>
//                                                     </tr>
//                                                     {expandedRows[sheet.id] && (
//                                                         <tr>
//                                                             <td colSpan="5">
//                                                                 <table className="EP-table">
//                                                                     <thead>
//                                                                         <tr>
//                                                                             <th>Task Name</th>
//                                                                             <th>Hours Spent</th>
//                                                                             <th>Description</th>
//                                                                             <th>Actions</th>
//                                                                         </tr>
//                                                                     </thead>
//                                                                     <tbody>
//                                                                         {Array.isArray(sheet.timesheetDayDetails) && sheet.timesheetDayDetails.length > 0 ? (
//                                                                             sheet.timesheetDayDetails.map(detail => (
//                                                                                 <tr key={detail.id}>
//                                                                                     <td>{detail.taskName}</td>
//                                                                                     <td>{detail.hoursSpent}</td>
//                                                                                     <td>{detail.taskDescription}</td>
//                                                                                     <td>{editDropdownMenu(detail)}</td>
//                                                                                 </tr>
//                                                                             ))
//                                                                         ) : (
//                                                                             <tr><td colSpan="4">No task details available</td></tr>
//                                                                         )}
//                                                                     </tbody>
//                                                                 </table>
//                                                             </td>
//                                                         </tr>
//                                                     )}
//                                                 </Fragment>
//                                             ))
//                                         ) : (
//                                             <tr><td colSpan="5">No timesheet data available</td></tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             )}


//                         </div>
//                     )}

//                 </div>

//             )}
//             {showUpdateModal && editTask && (
//                 <div className="modal-overlay">
//                     <div className="modal-content">
//                         <h2 className='title'>Edit Task</h2>
//                         <div>
//                             <label>Task Name:</label>
//                             <input
//                                 type="text"
//                                 value={editTask.taskName || ''}
//                                 onChange={(e) => setEditTask({ ...editTask, taskName: e.target.value })}
//                             />
//                             <label>Hours Spent:</label>
//                             <select
//                                 value={editTask.hoursSpent || ''}
//                                 onChange={(e) => setEditTask({ ...editTask, hoursSpent: e.target.value })}
//                                 style={{ border: '1px solid gray' }}
//                             >
//                                 {timeSlots.map((slot) => (
//                                     <option key={slot} value={slot}>
//                                         {slot}
//                                     </option>
//                                 ))}
//                             </select>
//                             <label>Description:</label>
//                             <input
//                                 type="text"
//                                 value={editTask.taskDescription || ''}
//                                 onChange={(e) => setEditTask({ ...editTask, taskDescription: e.target.value })}
//                             />
//                             <button type="button" className='btn' onClick={handleUpdate}>Update</button>
//                             <button type="button" className='outline-btn' onClick={() => setShowUpdateModal(false)}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showTimesheetPage && <TimeSheet />}

//             {modalOpen && (
//                 <div className="modal-overlay">
//                     <div className="modal-content">
//                         <h2>Add Tasks</h2>
//                         <div className="input-row">
//                             <div>
//                                 <label>Date:</label>
//                                 <input type="date" value={taskDate} onChange={handleTaskDateChange} />
//                             </div>
//                             <div>
//                                 <label>Start Time:</label>
//                                 <select value={headerStartTime} onChange={(e) => setHeaderStartTime(e.target.value)}>
//                                     {timeSlots.map(slot => (
//                                         <option key={slot} value={slot}>
//                                             {slot}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div>
//                                 <label>End Time:</label>
//                                 <select value={headerEndTime} onChange={(e) => setHeaderEndTime(e.target.value)}>
//                                     {timeSlots.map(slot => (
//                                         <option key={slot} value={slot}>
//                                             {slot}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div>
//                                 <p style={{ marginTop: '35px' }}>
//                                     <strong>Total Time:</strong> {formatTotalTime(calculateTotalTime(headerStartTime, headerEndTime))}
//                                 </p>
//                                 <p>
//                                     <strong>Total Hours Spent:</strong> {formatTotalTime1(calculateTotalHoursSpent(newTasks))}
//                                 </p>
//                             </div>
//                         </div>
//                         <table className="EP-table">
//                             <thead>
//                                 <tr>
//                                     <th>Task Name</th>
//                                     <th>Hours Spent</th>
//                                     <th>Description</th>
//                                     <th>Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {newTasks.map((task, index) => (
//                                     <tr key={index}>
//                                         <td>
//                                             <input type="text" value={task.taskName} onChange={(e) => handleTaskChange(index, 'taskName', e.target.value)} />
//                                         </td>
//                                         <td>
//                                             <select value={task.hoursSpent} onChange={(e) => handleTaskChange(index, 'hoursSpent', e.target.value)}>
//                                                 {timeSlots.map(slot => (
//                                                     <option key={slot} value={slot}>
//                                                         {slot}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </td>
//                                         <td>
//                                             <input type="text" value={task.taskDescription} onChange={(e) => handleTaskChange(index, 'taskDescription', e.target.value)} />
//                                         </td>
//                                         <td>
//                                             <button type="button" onClick={() => handleRemoveTask(index)}>
//                                                 <FontAwesomeIcon className='ml-2' icon={faTrash} />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                         <button type="button" className='btn' onClick={handleAddTask}>Add Another Task</button>
//                         <button type="button" className='btn' onClick={handleModalSave}>Save Tasks</button>
//                         <button type="button" className='outline-btn' onClick={() => { setModalOpen(false); resetModal(); }}>Cancel</button>
//                     </div>
//                 </div>
//             )}

//             {showEditModal && (
//                 <div className="modal-overlay">
//                     <div className="modal-content">
//                         <h2 className='title'>Edit Task</h2>
//                         <div className='input-row'>
//                             <label>
//                                 Date
//                                 <input
//                                     className='readonly'
//                                     type='date'
//                                     value={date}
//                                     onChange={(e) => setDate(e.target.value)}
//                                     style={{ border: '1px solid gray', borderRadius: '5px' }}
//                                     readOnly
//                                 />
//                             </label>
//                             <div>
//                                 <label>
//                                     Start Time
//                                     <select value={headerStartTime} onChange={(e) => setHeaderStartTime(e.target.value)}>
//                                         {timeSlots.map(slot => (
//                                             <option key={slot} value={slot}>
//                                                 {slot}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </label>
//                             </div>
//                             <label>
//                                 End Time
//                                 <select value={headerEndTime} onChange={(e) => setHeaderEndTime(e.target.value)}>
//                                     {timeSlots.map(slot => (
//                                         <option key={slot} value={slot}>
//                                             {slot}
//                                         </option>
//                                     ))}
//                                 </select>

//                             </label>
//                             <div>
//                                 <label>Total Time:</label>
//                                 <input
//                                     type="text"
//                                     value={formatTotalTime(calculateTotalTime(headerStartTime, headerEndTime))}
//                                     readOnly
//                                     style={{ border: '1px solid gray', borderRadius: '5px' }}
//                                 />
//                             </div>


//                         </div>
//                         <button type='button' className='btn' onClick={handleUpdate1}>Update</button>
//                         <button type='button' className='outline-btn' onClick={() => setShowEditModal(false)}>Cancel</button>
//                     </div>

//                 </div>
//             )}
//             {showConfirmation && (
//                 <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
//                     <p>Are you sure you want to delete this task?</p>
//                     <div className='btnContainer'>
//                         <button
//                             type='button'
//                             className='btn'
//                             onClick={() => handleDelete1(timesheetDelete)} // Call handleDelete1 with the task ID
//                         >
//                             Yes
//                         </button>
//                         <button
//                             type='button'
//                             className='btn'
//                             onClick={() => setShowConfirmation(false)}
//                         >
//                             No
//                         </button>
//                     </div>
//                 </div>
//             )}
//             
//         </div>

//     );

// };

// export default TimesheetDashboard;


































































