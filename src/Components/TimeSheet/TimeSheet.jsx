
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { strings } from '../../string';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../CommonCss/TimeSheet.css'
import { showToast } from '../../Api.jsx';

const TimesheetTable = () => {

    const [savedDates, setSavedDates] = useState([]); // Track saved dates
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [datesInRange, setDatesInRange] = useState([]);
    const [dateRangeId, setDateRangeId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [newTasks, setNewTasks] = useState([{ taskName: '', dayStartTime: '', dayEndTime: '', taskDescription: '', hoursSpent: '' }]);
    const [selectedDate, setSelectedDate] = useState('');
    const [headerStartTime, setHeaderStartTime] = useState('');
    const [headerEndTime, setHeaderEndTime] = useState('');
    const employeeId = localStorage.getItem("employeeId");
    const companyId = localStorage.getItem("companyId");
    const [formData, setFormData] = useState({ id: '', leaveCategory: '' });
    const [dateRangeSaved, setDateRangeSaved] = useState(false);
    const [workflowOptions, setWorkflowOptions] = useState([]);
    const [apiData, setApiData] = useState(null);
    const [totalTime, setTotalTime] = useState('00:00');
    const [timeSlots, setTimeSlots] = useState([]);

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
    }, [companyId]);

    useEffect(() => {
        if (fromDate && toDate) {
            generateDatesInRange(fromDate, toDate);
        }
    }, [fromDate, toDate]);

    const generateDatesInRange = (start, end) => {
        const startMoment = moment(start);
        const endMoment = moment(end);
        const dates = [];
        while (startMoment <= endMoment) {
            dates.push(startMoment.format('YYYY-MM-DD'));
            startMoment.add(1, 'day');
        }
        setDatesInRange(dates);
    };

    const handleSaveDateRange = async () => {
        if (fromDate && toDate) {
            const formattedFromDate = moment(fromDate).format('YYYY-MM-DD');
            const formattedToDate = moment(toDate).format('YYYY-MM-DD');

            try {
                const response = await axios.post(
                    `http://${strings.localhost}/api/timesheetmain/saveTimesheetMain/${employeeId}/${companyId}`,
                    {
                        fromDate: formattedFromDate,
                        toDate: formattedToDate,
                        employeeId: employeeId
                    }
                );

                setDateRangeId(response.data.id);
                setDateRangeSaved(true);
                showToast('Date Range Saved successfully','success');
            } catch (error) {
                console.error("Error:", error);
                // Check if the error response has data with backend validation messages
                if (error.response && error.response.data) {
                    const errorMessage = error.response.data || 'An error occurred. Please try again.';
                  showToast(errorMessage,'error');
                } else {
                    toast.error('An unexpected error occurred. Please try again.', {
                        autoClose: 5000,
                        closeButton: true
                    });
                }
            }
        } else {
            toast.error('Please select a valid date range.', {
                autoClose: 5000,
                closeButton: true
            });
        }
    };
    const handleAddTask = () => {
        setNewTasks([...newTasks, { taskName: '', dayStartTime: '', dayEndTime: '', taskDescription: '', hoursSpent: '' }]);
    };

    const handleRemoveTask = (index) => {
        const updatedTasks = newTasks.filter((_, i) => i !== index);
        setNewTasks(updatedTasks);
    };
    const handleTaskChange = (index, field, value) => {
        const updatedTasks = [...newTasks];
        updatedTasks[index][field] = value;
        setNewTasks(updatedTasks);
        if (field === 'hoursSpent') {
            const totalHoursSpent = calculateTotalHoursSpent();
            const totalCalculatedTime = calculateTotalTime(headerStartTime, headerEndTime);
            const totalSpentMinutes = totalHoursSpent.hours * 60 + totalHoursSpent.minutes;
            const calculatedMinutes = moment.duration(totalCalculatedTime).asMinutes();
            if (totalSpentMinutes !== calculatedMinutes) {
                showToast('Total hours spent and calculated time do not match.','warn');
            }
        }
    };
    const calculateTotalHoursSpent = () => {
        const totalMinutes = newTasks.reduce((acc, task) => {
            const parts = task.hoursSpent.split(':');
            const hours = parseInt(parts[0], 10) || 0;
            const minutes = parseInt(parts[1], 10) || 0;
            return acc + (hours * 60 + minutes);
        }, 0);

        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        return {
            hours: totalHours,
            minutes: remainingMinutes,
            formatted: `${totalHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:00`
        };
    };
    const formatHoursSpent = (hoursSpent) => {
        const parts = hoursSpent.split(':');
        const hours = parts[0] || '00';
        const minutes = parts[1] || '00';
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`; // Append seconds
    };
    const handleModalSave = async (savedDate) => {
        if (dateRangeId) {
            const formattedStartTime = moment(headerStartTime, 'HH:mm').format('HH:mm:ss');
            const formattedEndTime = moment(headerEndTime, 'HH:mm').format('HH:mm:ss');
            const totalTime = calculateTotalTime(formattedStartTime, formattedEndTime);
            const totalHoursSpent = calculateTotalHoursSpent();
            const formattedTotalHoursSpent = totalHoursSpent.formatted;
            const totalSpentMinutes = (totalHoursSpent.hours * 60) + totalHoursSpent.minutes;
            const totalCalculatedMinutes = moment.duration(totalTime).asMinutes();
            const isValid = newTasks.every(task => task.taskName && task.hoursSpent);
            if (!isValid) {
                showToast('Please fill in all task details','warn');
                return;
            }
            if (totalCalculatedMinutes !== totalSpentMinutes) {
                showToast('Total hours spent and calculated time do not match. Please correct this before saving.','warn');
                return;
            }
            const dataToSave = {
                date: selectedDate,
                dayStartTime: formattedStartTime,
                dayEndTime: formattedEndTime,
                employeeId: employeeId,
                companyId: companyId,
                totalTime: `${totalHoursSpent.hours.toString().padStart(2, '0')}:${totalHoursSpent.minutes.toString().padStart(2, '0')}:00`,
                timesheetDayDetails: newTasks.map(task => ({
                    taskName: task.taskName,
                    hoursSpent: formatHoursSpent(task.hoursSpent),
                    taskDescription: task.taskDescription
                }))
            };

            try {
                const response = await axios.post(`http://${strings.localhost}/api/timesheet-day/save?timesheetMainId=${dateRangeId}&employeeId=${employeeId}&companyId=${companyId}`, dataToSave);
                const savedId = response.data.id;
                setSavedDates(prevDates => [...prevDates, selectedDate]); // Add the saved date to the list of saved dates
                setNewTasks([{ taskName: '', dayStartTime: '', dayEndTime: '', taskDescription: '', hoursSpent: '' }]);
                showToast('Tasks Saved Successfully','success');
                setModalOpen(false);
            } catch (error) {
                console.error('Error saving tasks:', error);
                showToast('Error saving tasks','error');
            }
        }
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const time = moment().set({ hour, minute }).format('HH:mm');
                slots.push(time);
            }
        }
        return slots;
    };
    useEffect(() => {
        const slots = generateTimeSlots();
        setTimeSlots(slots);
    }, []);
    const handleDateSelect = async (date) => {
        setSelectedDate(date);
        try {
            const response = await axios.get(`http://${strings.localhost}/api/timesheetmain/getByDates?date=${date}`);
            setApiData(response.data);
        } catch (error) {
            console.error('Error fetching data for selected date:', error.response ? error.response.data : error.message);
        }
    };

    const resetModal = () => {
        setNewTasks([{ taskName: '', dayStartTime: '', dayEndTime: '', taskDescription: '', hoursSpent: '' }]);
        setHeaderStartTime('');
        setHeaderEndTime('');
    };

    const calculateTotalTime = (start, end) => {
        const startMoment = moment(start, 'HH:mm');
        const endMoment = moment(end, 'HH:mm');

        if (startMoment.isValid() && endMoment.isValid()) {
            if (endMoment.isBefore(startMoment)) {
                showToast('End time cannot be before start time.','warn');
                return '00:00:00';
            }
            const duration = moment.duration(endMoment.diff(startMoment));
            const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
            const minutes = duration.minutes().toString().padStart(2, '0');
            const seconds = '00'; // You can add seconds if needed

            return `${hours}:${minutes}:${seconds}`; // Return in HH:mm:ss format
        }
        return '00:00:00';
    };

    const handleStartTimeChange = (e) => {
        const newStartTime = e.target.value;
        setHeaderStartTime(newStartTime);
        if (newStartTime && headerEndTime) {
            const totalTime = calculateTotalTime(newStartTime, headerEndTime);
            setTotalTime(totalTime);
        } else {
            setTotalTime('00:00:00'); // Reset to default if end time is not set
        }
    };

    const handleEndTimeChange = (e) => {
        const newEndTime = e.target.value;
        setHeaderEndTime(newEndTime);
        if (headerStartTime && newEndTime) {
            const totalTime = calculateTotalTime(headerStartTime, newEndTime);
            setTotalTime(totalTime);
        } else {
            setTotalTime('00:00:00'); // Reset to default if start time is not set
        }
    };
    const logTimeValues = () => {
        console.log('Start Time:', headerStartTime, 'End Time:', headerEndTime);
    };


    const isDateRangeValid = () => {
        const from = moment(fromDate);
        const to = moment(toDate);
        return to.diff(from, 'days') >= 1; // Check if the difference is at least 1 day
    };
    const handleDateRangeChange = (item) => {
        const selectedStartDate = moment(item.selection.startDate);
        const selectedEndDate = moment(item.selection.endDate);
        if (selectedEndDate.diff(selectedStartDate, 'days') < 1) {
            showToast('Please select a date range of at least two days.','warn');
        } else {
            setFromDate(item.selection.startDate);
            setToDate(item.selection.endDate);
            setDateRangeSaved(false);
            setSavedDates([]);  // Disable all tiles until saved
            setDateRangeId(null); 
        }
    };
    return (
        <div className='coreContainer'>
            <div className="color-legend">
                <div className="legend-item">
                    <span className="legend-circle red"></span> <span>Weekend (Saturday/Sunday)</span>
                </div>
                <div className="legend-item">
                    <span className="legend-circle green"></span> <span>Saved Data</span>
                </div>
            </div>
            <div className="timesheet-container">
           
                <div className="calendar-container">
                    <DateRangePicker
                        ranges={[{
                            startDate: fromDate,
                            endDate: toDate,
                            key: 'selection'
                        }]}
                        
                        onChange={handleDateRangeChange}
                    />

                    <button className="btn save-range-btn" onClick={handleSaveDateRange}> Save Date Range</button>

                </div>

                <div className="dates-container">
                    {datesInRange.map((date, index) => (
                        <div
                            key={index}
                            className={`date-box ${savedDates.includes(date) ? 'saved' : ''} 
                        ${moment(date).day() === 6 || moment(date).day() === 0 ? 'weekendDay' : ''} 
                        ${!dateRangeId || savedDates.includes(date) ? 'disabled' : ''}`}
                            onClick={() => {
                                if (!savedDates.includes(date) && !dateRangeId) {
                                    // Show toast if user tries to click on a disabled date
                                    toast.info('Please save the date range first!', {
                                        autoClose: 5000,
                                        closeButton: true
                                    });
                                } else if (!savedDates.includes(date) && dateRangeId) {
                                    setSelectedDate(date);
                                    setModalOpen(true);
                                }
                            }}
                            style={{
                                cursor: (savedDates.includes(date) || !dateRangeId) ? 'not-allowed' : 'pointer',
                                opacity: (savedDates.includes(date) || !dateRangeId) ? 0.5 : 1,
                                pointerEvents: savedDates.includes(date) ? 'none' : 'auto'
                            }}
                        >
                            {moment(date).format('YYYY-MM-DD')}
                        </div>
                    ))}
                </div>

            </div>

            {apiData && apiData.length > 0 && selectedDate && (
                <div>
                    <h2 className='form-title'>Details for {selectedDate}</h2>
                    <table className="EP-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>Task Name</th>
                                <th>Hours Spent</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiData[0].timesheetDays.map(day =>
                                day.timesheetDayDetails.map((detail, index) => (
                                    <tr key={`${day.id}-${index}`}>
                                        <td>{detail.id}</td>
                                        <td>{detail.date}</td>
                                        <td>{detail.taskName}</td>
                                        <td>{detail.hoursSpent}</td>
                                        <td>{detail.taskDescription}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className='title'>Add Tasks for {selectedDate}</h2>
                        <div className="input-row">
                            <div>
                                <label>Start Time:</label>
                                <select value={headerStartTime} onChange={handleStartTimeChange}>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>
                                            {slot}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>End Time:</label>
                                <select value={headerEndTime} onChange={handleEndTimeChange}>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>
                                            {slot}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <p><strong>Total Time:</strong> {totalTime}</p>
                                <p><strong>Total Hours Spent:</strong> {`${calculateTotalHoursSpent().hours}h ${calculateTotalHoursSpent().minutes.toString().padStart(2, '0')}m`}</p>
                            </div>
                        </div>
                        <table className="EP-table">
                            <thead>
                                <tr>
                                    <th>Task Name</th>
                                    <th>Hours Spent</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newTasks.map((task, index) => (
                                    <tr key={index}>
                                        <td>{task.taskName}</td>
                                        <td>{task.hoursSpent}</td>
                                        <td>{task.taskDescription}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {newTasks.map((task, index) => (
                            <div key={index} className="task-form">
                                <label>Task: </label>
                                <input type="text" value={task.taskName} onChange={(e) => handleTaskChange(index, 'taskName', e.target.value)} />
                                <label>Description:
                                    <input type="text" value={task.taskDescription} onChange={(e) => handleTaskChange(index, 'taskDescription', e.target.value)} />
                                </label>

                                <div className='input-row'>
                                    <div>
                                        <label>Hours Spent:
                                            <select value={task.hoursSpent} onChange={(e) => handleTaskChange(index, 'hoursSpent', e.target.value)} style={{ border: '1px solid gray' }}>
                                                {timeSlots.map(slot => (
                                                    <option key={slot} value={slot}>
                                                        {slot}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                </div>
                                <button type="button" className="circle-button red-btn" onClick={() => handleRemoveTask(index)}>Remove Task</button>
                            </div>
                        ))}
                        <button type="button" className="btn" onClick={handleAddTask}>Add Another Task</button>
                        <button type="button" className="btn" onClick={handleModalSave}>Save Tasks</button>
                        <button type="button" className="outline-btn" onClick={() => { setModalOpen(false); resetModal(); }}>Cancel</button>
                    </div>
                </div>
            )}

            
        </div>
    );
};

export default TimesheetTable;


















































































// import React, { useState, useEffect, Fragment } from 'react';
// import axios from 'axios';
// import moment from 'moment';
// import { strings } from '../string';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSave } from '@fortawesome/free-solid-svg-icons';

// const TimesheetTable = () => {
//     const [timesheetRows, setTimesheetRows] = useState([]);
//     const [selectedYear, setSelectedYear] = useState(moment().year());
//     const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
//     const [selectedWeek, setSelectedWeek] = useState(0);
//     const [dropdownData, setDropdownData] = useState({ shifttype: [] });
//     const [dropdownError, setDropdownError] = useState('');
//     const [expandedRows, setExpandedRows] = useState([]);
//     const [weekOptions, setWeekOptions] = useState([]);
//     const [showAllRows, setShowAllRows] = useState(false);
// const employeeId = localStorage.getItem("employeeId");
// const token = localStorage.getItem("token");
//     useEffect(() => {
//         fetchDataByKey('shifttype', 'shifttype');
//         setTimesheetRows(generateWeekRows(selectedYear, selectedMonth, selectedWeek));
//     }, [selectedYear, selectedMonth, selectedWeek]);

//     useEffect(() => {
//         updateWeekOptions();
//     }, [selectedYear, selectedMonth]);

//     const handleYearChange = (event) => {
//         setSelectedYear(parseInt(event.target.value));
//     };

//     const handleMonthChange = (event) => {
//         setSelectedMonth(parseInt(event.target.value));
//     };

//     const handleWeekChange = (event) => {
//         setSelectedWeek(parseInt(event.target.value));
//     };

//     const handleSaveRow = async (rowData) => {
//         try {
//             const response = await axios.post(http://${strings.localhost}/api/schedules/batch/${employeeId}, {
//                 date: rowData.date,
//                 timesheetTask: rowData.timesheetTask,
//                 taskDesc: rowData.taskDesc,
//                 taskStartTime: rowData.taskStartTime,
//                 taskEndTime: rowData.taskEndTime,
//                 taskTotalTime: rowData.taskTotalTime,
//                 taskShift: rowData.taskShift,
//                 taskNotes: rowData.taskNotes,
//                 taskWeekday: rowData.taskWeekday,
                
//                     headers: {
//                         'Authorization': Bearer ${token}
//                     }
                
//             });
//             console.log('Saved successfully:', response.data);
//             alert('Task saved successfully');
//         } catch (error) {
//             console.error('Error saving:', error);
//             alert('Error saving task');
//         }
//     };

//     const handleChange = (event, index, field) => {
//         const updatedRows = [...timesheetRows];
//         const value = event.target.value;

//         updatedRows[index][field] = value;

//         if (field === 'taskStartTime' || field === 'taskEndTime') {
//             if (value && value.trim() !== '') {
//                 const formattedTime = moment(value, 'HH:mm').format('HH:mm:ss');
//                 updatedRows[index][field] = formattedTime;
//             } else {
//                 updatedRows[index][field] = null;
//             }

//             const start = moment(updatedRows[index].taskStartTime, 'HH:mm:ss');
//             const end = moment(updatedRows[index].taskEndTime, 'HH:mm:ss');
//             if (start.isValid() && end.isValid() && end.isAfter(start)) {
//                 const duration = moment.duration(end.diff(start));
//                 updatedRows[index].taskTotalTime = moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
//             } else {
//                 updatedRows[index].taskTotalTime = '';
//             }
//         }

//         setTimesheetRows(updatedRows);
//     };

//     const fetchDataByKey = (keyvalue, dropdown) => {
//         axios.get(http://${strings.localhost}/GetDataByKey/${keyvalue})
//             .then(response => {
//                 const dropdownContent = response.data.map(item => ({
//                     masterId: item.masterId,
//                     data: item.data
//                 }));
//                 setDropdownData(prevData => ({
//                     ...prevData,
//                     [dropdown]: dropdownContent
//                 }));
//                 setDropdownError('');
//             })
//             .catch(error => {
//                 console.error(Error fetching data for ${dropdown}:, error);
//                 setDropdownError(Error fetching data for ${dropdown});
//             });
//     };

//     const generateWeekRows = (year, month, weekIndex) => {
//         const firstDayOfMonth = moment(${year}-${month}-01);
//         const startOfMonth = firstDayOfMonth.clone().startOf('month');
//         const endOfMonth = firstDayOfMonth.clone().endOf('month');
//         const weeks = [];

//         let currentDay = startOfMonth.clone().startOf('week').add(weekIndex * 7, 'days');

//         while (currentDay.isSameOrBefore(endOfMonth)) {
//             const weekStart = currentDay.clone().startOf('week');
//             const weekEnd = currentDay.clone().endOf('week').isBefore(endOfMonth) ? currentDay.clone().endOf('week') : endOfMonth;

//             const daysInWeek = [];
//             for (let day = weekStart; day.isSameOrBefore(weekEnd); day.add(1, 'day')) {
//                 if (day.month() + 1 === month) {
//                     daysInWeek.push({
//                         date: day.format('YYYY-MM-DD'),
//                         taskWeekday: day.format('dddd').toUpperCase(),
//                         timesheetTask: '',
//                         taskStartTime: '',
//                         taskEndTime: '',
//                         taskTotalTime: '',
//                         taskDesc: '',
//                         taskNotes: '',
//                         taskShift: ''
//                     });
//                 }
//             }

//             weeks.push(daysInWeek);
//             currentDay.add(7, 'days');
//         }

//         // Flatten the weeks array to get a single array of rows
//         return weeks.flat();
//     };

//     const updateWeekOptions = () => {
//         const weeksInMonth = [];
//         const firstDayOfMonth = moment(${selectedYear}-${selectedMonth}-01);
//         const lastDayOfMonth = firstDayOfMonth.clone().endOf('month');
//         let currentWeekStart = firstDayOfMonth.clone().startOf('week');
//         let weekIndex = 0;

//         while (currentWeekStart.isBefore(lastDayOfMonth)) {
//             weeksInMonth.push(<option key={weekIndex} value={weekIndex}>{Week ${weekIndex + 1}}</option>);
//             currentWeekStart.add(1, 'week');
//             weekIndex++;
//         }

//         setWeekOptions(weeksInMonth);
//         setSelectedWeek(0);  // Reset to first week whenever year or month changes
//     };

//     const yearOptions = [];
//     for (let i = moment().year() - 5; i <= moment().year() + 5; i++) {
//         yearOptions.push(<option key={i} value={i}>{i}</option>);
//     }

//     const monthOptions = moment.months().map((month, index) => (
//         <option key={index + 1} value={index + 1}>{month}</option>
//     ));

//     const visibleRows = showAllRows ? timesheetRows : timesheetRows.slice(0, 7);

//     const toggleRowExpansion = (index) => {
//         if (expandedRows.includes(index)) {
//             setExpandedRows(expandedRows.filter(i => i !== index));
//         } else {
//             setExpandedRows([...expandedRows, index]);
//         }
//     };

//     return (
//         <div>
//             <div style={{ display: 'flex', gap: "2%", marginBottom: '20px' }}>
//                 <label> Year:
//                     <select value={selectedYear} onChange={handleYearChange}>
//                         {yearOptions}
//                     </select>
//                 </label>
//                 <label> Month:
//                     <select value={selectedMonth} onChange={handleMonthChange}>
//                         {monthOptions}
//                     </select>
//                 </label>
//                 <label> Week:
//                     <select value={selectedWeek} onChange={handleWeekChange}>
//                         {weekOptions}
//                     </select>
//                 </label>
//                 <div>
//                 <button className='btn' >  Add task</button>
//                 </div>
//             </div>
//             <table className='EP-table'>
//                 <thead>
//                     <tr>
//                         <th></th>
//                         <th>Date</th>
//                         <th>Day</th>
//                         <th>Task</th>
//                         <th>Start Time</th>
//                         <th>End Time</th>
//                         <th>Total Time</th>
//                         <th>Description</th>
//                         <th>Notes</th>
//                         <th>Shift</th>
//                         <th>Action</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {visibleRows.map((row, index) => (
//                         <Fragment key={index}>
//                             <tr style={{ cursor: "pointer" }}>
//                                 <td className="bold-toggle" onClick={() => toggleRowExpansion(index)}>{expandedRows.includes(index) ? 'v' : '>'}</td>
//                                 <td style={{ width: "10%" }}>{row.date}</td>
//                                 <td>{row.taskWeekday}</td>
//                                 <td><input type="Itext" value={row.timesheetTask} onChange={(e) => handleChange(e, index, 'timesheetTask')} /></td>
//                                 <td><input type="time" value={row.taskStartTime} onChange={(e) => handleChange(e, index, 'taskStartTime')} /></td>
//                                 <td><input type="time" value={row.taskEndTime} onChange={(e) => handleChange(e, index, 'taskEndTime')} /></td>
//                                 <td>{row.taskTotalTime}</td>
//                                 <td><input type="Itext" value={row.taskDesc} onChange={(e) => handleChange(e, index, 'taskDesc')} /></td>
//                                 <td><input type="Itext" value={row.taskNotes} onChange={(e) => handleChange(e, index, 'taskNotes')} /></td>
//                                 <td style={{ width: "12%" }}>
//                                     <select className='shiftdrop' value={row.taskShift} onChange={(e) => handleChange(e, index, 'taskShift')} >

//                                         <option value="" disabled hidden></option>
//                                         {dropdownData.shifttype && dropdownData.shifttype.length > 0 ? (
//                                             dropdownData.shifttype.map(option => (
//                                                 <option key={option.masterId} value={option.data}>
//                                                     {option.data}
//                                                 </option>
//                                             ))
//                                         ) : (
//                                             <option value="" disabled>No shift available</option>
//                                         )}
//                                     </select>
//                                 </td>

//                                 <td><button onClick={() => handleSaveRow(row)}>
//                                     <FontAwesomeIcon icon={faSave} />
//                                 </button></td>
//                             </tr>
//                             {expandedRows.includes(index) && (
//                                 <tr>
//                                     <td colSpan={11}>
//                                         <div style={{ display: 'flex', gap: '10px', backgroundColor: 'transparent', padding: '10px' }}>
//                                             {/* <div style={{ flex: 1 }}>
//                                                 <p><strong>Task Details:</strong></p>
//                                             </div> */}
//                                             <div style={{ flex: 1, fontWeight: 'bold' }}> Task Details:
//                                                 <p style={{ fontWeight: 'lighter' }}>{row.timesheetTask}</p>
//                                             </div>

//                                             <div style={{ flex: 1, fontWeight: 'bold' }}> Notes:

//                                                 <p style={{ fontWeight: 'lighter' }}>{row.taskNotes}</p>
//                                             </div>
//                                             <div style={{ flex: 1, fontWeight: 'bold' }}> Description:
//                                                 <p style={{ fontWeight: 'lighter' }}>{row.taskDesc}</p>
//                                             </div>
//                                         </div>
//                                     </td>
//                                 </tr>

//                             )}
//                         </Fragment>
//                     ))}
//                 </tbody>
//             </table>
//             {/* {timesheetRows.length > 7 && (
//                 <button className='btn' onClick={() => setShowAllRows(!showAllRows)}>
//                     {showAllRows ? 'Show Less' : 'Show More'}
//                 </button>
//             )} */}
//         </div>
//     );
// };

// export default TimesheetTable;