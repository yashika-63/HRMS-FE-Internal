
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../string';
import moment from 'moment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { showToast } from '../../Api.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaSearch } from 'react-icons/fa';
const AdminViewTimesheet = () => {
    const [employeeSearchInput, setEmployeeSearchInput] = useState('');
    const [employeeSearchError, setEmployeeSearchError] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [savedTimesheets, setSavedTimesheets] = useState([]);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [missingDates, setMissingDates] = useState([]);
    const companyId = localStorage.getItem("companyId");

    // Fetch timesheet data based on selected employee and date range
    const fetchTimesheetByDate = async (startDate, endDate) => {
        console.log('Fetching timesheet data from', startDate, 'to', endDate);
        if (!selectedEmployeeId) {
            showToast('Please select an employee', 'warn');
            return;
        }

        if (isFetchingData) return;
        setIsFetchingData(true);

        try {
            const { data } = await axios.get(
                `http://${strings.localhost}/api/timesheet-day/timesheet/byEmployeeIdAndDateRange?startDate=${startDate}&endDate=${endDate}&employeeId=${selectedEmployeeId}`
            );

            // Sort the fetched dates in ascending order on the frontend
            const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));

            setSavedTimesheets(sortedData);  // Update state with sorted data

            // Find missing dates (dates without timesheet data)
            const fetchedDates = sortedData.map(sheet => moment(sheet.date).format('YYYY-MM-DD'));
            const allDatesInRange = getDatesInRange(startDate, endDate);
            const missingDatesInRange = allDatesInRange.filter(date => !fetchedDates.includes(date));

            setMissingDates(missingDatesInRange);  // Update missing dates
            console.log('Missing Dates:', missingDatesInRange);
        } catch (error) {
            console.error('Error fetching timesheet data:', error);
        } finally {
            setIsFetchingData(false);
        }
    };


    // Get all dates between two dates
    const getDatesInRange = (startDate, endDate) => {
        const start = moment(startDate);
        const end = moment(endDate);
        let dates = [];

        while (start <= end) {
            dates.push(start.format('YYYY-MM-DD'));
            start.add(1, 'days');
        }

        return dates;
    };

    // Handle employee search input
    const handleEmployeeSearchChange = async (e) => {
        const value = e.target.value;
        setEmployeeSearchInput(value);

        // Reset table data if employee search input changes
        setSavedTimesheets([]);
        setStartDate('');
        setEndDate('');
        setMissingDates([]);  // Clear missing dates when input is cleared

        if (value.trim().length === 0) {
            setEmployeeSearchResults([]);
            setEmployeeSearchError('');

            // Clear selected employee and reset calendar
            setSelectedEmployeeId('');
        } else {
            try {
                const response = await axios.get(`http://${strings.localhost}/employees/search`, {
                    params: { companyId, searchTerm: value.trim() },
                });

                if (response.data && response.data.length > 0) {
                    setEmployeeSearchResults(response.data);
                } else {
                    setEmployeeSearchResults([]);
                    setEmployeeSearchError('No employees found matching your search.');
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
                setEmployeeSearchResults([]);
                setEmployeeSearchError('Failed to load employee data.');
            }
        }
    };

    // Select employee from search results
    const handleSelectEmployee = (employee) => {
        console.log('Employee selected:', employee);
        setEmployeeSearchInput(`${employee.firstName} ${employee.lastName}`);
        setSelectedEmployeeId(employee.id);
        setEmployeeSearchResults([]);
        setEmployeeSearchError('');

        // Clear the saved timesheets when employee is selected
        setSavedTimesheets([]);
        setStartDate('');
        setEndDate('');
        setMissingDates([]); // Clear missing dates on employee selection
    };

    // Handle date range changes and fetch corresponding timesheet data
    const handleFromDateChange = (e) => {
        const selectedStartDate = e.target.value;
        console.log('Start date selected:', selectedStartDate);
        setStartDate(selectedStartDate);

        // If start date is cleared, clear the end date as well
        if (!selectedStartDate) {
            setEndDate('');
        }

        // Clear the table data if start date or end date changes
        setSavedTimesheets([]);
        setMissingDates([]);
        if (selectedStartDate && endDate && selectedEmployeeId) {
            fetchTimesheetByDate(selectedStartDate, endDate);
        } else if (selectedStartDate && endDate && !selectedEmployeeId) {
            showToast('Please select an employee first', 'warn');
        }
    };

    const handleToDateChange = (e) => {
        const selectedEndDate = e.target.value;
        console.log('End date selected:', selectedEndDate);
        setEndDate(selectedEndDate);

        // Clear the table data if start date or end date changes
        setSavedTimesheets([]);
        setMissingDates([]);
        if (startDate && selectedEndDate && selectedEmployeeId) {
            fetchTimesheetByDate(startDate, selectedEndDate);
        } else if (startDate && selectedEndDate && !selectedEmployeeId) {
            showToast('Please select an employee first', 'warn');
        }
    };

    // Toggle row expansion (Show/Hide Details)
    const toggleRowExpansion = (id) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Format total time for display
    const formatTotalTime = (totalTime) => {
        if (!totalTime) return '00:00';
        return totalTime.split(':').map(part => part.padStart(2, '0')).join(':');
    };

    return (
        <div className='coreContainer'>
            <div className='form-title'>Timesheet Overview</div>
            <div className="input-row">
                <div >
                    <label htmlFor="employeeSearch">Employee Search</label>
                  
                    <input
                       
                        id="employeeSearch"
                        value={employeeSearchInput}
                        onChange={handleEmployeeSearchChange}
                        required
                        placeholder="Search for an employee"
                        style={{ width: '320px', border: '1px solid black' }}

                    />
                  
                    {employeeSearchError && <div className='error-message'>{employeeSearchError}</div>}
                    {employeeSearchResults.length > 0 && (
                        <ul className="dropdown2">
                            {employeeSearchResults.map((employee) => (
                                <li
                                    key={employee.id}
                                    onClick={() => handleSelectEmployee(employee)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {`${employee.firstName} ${employee.lastName}`}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Date range inputs */}
                <div>
                    <label>Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={handleFromDateChange}
                        disabled={!selectedEmployeeId} // Disable until an employee is selected
                        style={{ border: '1px solid black' }}
                    />
                </div>
                <div>
                    <label>End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={handleToDateChange}
                        disabled={!selectedEmployeeId} // Disable until an employee is selected
                        style={{ border: '1px solid black' }}
                    />
                </div>
            </div>
            <div className="sideContainers" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                {/* Calendar view */}
                <div style={{ flex: 1, marginTop: '50px' }}>
                    <div className="legend-item" style={{ marginBottom: '10px' }}>
                        <span className="legend-circle pink"></span> <span>No Data Filled </span>
                    </div>
                    <div
                        title={selectedEmployeeId ? "" : "Calendar is disabled ,You have not selected employee & Dates ."}
                    >
                        <Calendar
                            minDate={startDate ? new Date(startDate) : new Date()}
                            maxDate={endDate ? new Date(endDate) : new Date()}
                            tileClassName={({ date }) => {
                                const dateString = moment(date).format('YYYY-MM-DD');
                                if (moment(date).isSame(new Date(), 'day')) {
                                    return 'today-date'; // Highlight today in green
                                }
                                return missingDates.includes(dateString) ? 'missing-date' : '';
                            }}
                        />
                    </div>
                </div>

                {/* Timesheet data table */}
                <div style={{ flex: 2, marginLeft: '5px', marginTop: '55px' }}>
                    {savedTimesheets.length > 0 && (
                        <div className='timesheetdate-range-left'>

                            <table className="custom-table">
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
                                        <React.Fragment key={sheet.id}>
                                            <tr>
                                                <td>{moment(sheet.date).format('DD-MM-YYYY')}</td>
                                                <td>{moment(sheet.dayStartTime, 'HH:mm:ss').format('hh:mm A')}</td>
                                                <td>{moment(sheet.dayEndTime, 'HH:mm:ss').format('hh:mm A')}</td>
                                                <td>{formatTotalTime(sheet.totalTime)}</td>
                                                <td>
                                                    <button onClick={() => toggleRowExpansion(sheet.id)} className='textbutton'>
                                                        {expandedRows[sheet.id] ? 'Hide Details' : 'Show Details'}
                                                    </button>
                                                </td>
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
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {Array.isArray(sheet.timesheetDayDetails) && sheet.timesheetDayDetails.length > 0 ? (
                                                                    sheet.timesheetDayDetails.map(detail => (
                                                                        <tr key={detail.id}>
                                                                            <td>{detail.taskName}</td>
                                                                            <td>{detail.hoursSpent}</td>
                                                                            <td>{detail.taskDescription}</td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr><td colSpan="3">No task details available</td></tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {/* Toast Notifications */}

        </div>
    );
};

export default AdminViewTimesheet;


