import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import '../CommonCss/ConfigScreen.css'
import Select from 'react-select';
import { strings } from "../../string";
import { useParams } from 'react-router-dom';
import { showToast } from "../../Api.jsx";

const EmployeeLevelConfigScreen = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationId, setConfirmationId] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState([]);
    const { id: employeeId } = useParams();
    const [employees, setEmployees] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);
    const [formData, setFormData] = useState([]);
    const [selectedDays, setSelectedDays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isViewing, setIsViewing] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [isFormValid, setIsFormValid] = useState(false);
    const [popupData, setPopupData] = useState([]);
    const companyId = localStorage.getItem("companyId");
    const itemsPerPage = 12;
 
    const paginatedData = formData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
    const showAllDates = isViewing ? formData : paginatedData;
    const dayOptions = [
        { value: "Monday", label: "Monday" },
        { value: "Tuesday", label: "Tuesday" },
        { value: "Wednesday", label: "Wednesday" },
        { value: "Thursday", label: "Thursday" },
        { value: "Friday", label: "Friday" },
        { value: "Saturday", label: "Saturday" },
        { value: "Sunday", label: "Sunday" },
    ];
 
    // Group formData by day
    const groupDatesByDay = (formData) => {
        const grouped = {};
        formData.forEach(item => {
            if (!grouped[item.day]) {
                grouped[item.day] = [];
            }
            grouped[item.day].push(item);
        });
        return grouped;
    };
    const groupDatesForView = (formData) => {
        const grouped = {};
        formData.forEach(item => {
            if (!grouped[item.day]) {
                grouped[item.day] = [];
            }
            grouped[item.day].push(item);
        });
        return grouped;
    };
    function chunkArray(arr, chunkSize) {
        const result = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    }
    const showPopup = (day) => {
        const dayData = formData.filter(item => item.day === day);
        setPopupData(dayData);
    };
    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setPopupData([]);
    };
 
 
    const formatDate = (date) => {
        if (!(date instanceof Date) || isNaN(date)) {
            console.error('Invalid date for formatting:', date);
            return '';
        }
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
 
    const getDayOfWeek = (date) => {
        if (!(date instanceof Date) || isNaN(date)) {
            console.error('Invalid date:', date);
            return 'Invalid Date';
        }
        const options = { weekday: 'long' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };
 
 
    useEffect(() => {
        if (employeeId) {
            // Fetch the employee data using employeeId from the URL
            axios.get(`http://${strings.localhost}/employees/${employeeId}`)
                .then(response => {
                    setSelectedEmployee(response.data);
                })
                .catch(error => {
                    showToast('Failed to fetch employee data.', 'error');
                });
        }
    }, [employeeId]);
 
 
    const getAllDatesForDay = (day) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const dates = [];
        let date = new Date(currentYear, 0, 1);
        while (date.getFullYear() === currentYear) {
            const dayOfWeek = getDayOfWeek(date);
            if (dayOfWeek === day) {
                const formattedDate = formatDate(date);
                if (formattedDate) {
                    dates.push({ date: formattedDate, day: dayOfWeek });
                }
            }
            date.setDate(date.getDate() + 1);
        }
        return dates;
    };
 
    const handleDayChange = (selectedOptions) => {
        const selectedValues = selectedOptions.map(option => option.value);
        setSelectedDays(selectedValues);
    
        if (selectedValues.length === 0) {
            setSelectedDates([]);
            setFormData([]);
            setIsFormValid(false);
        } else {
            const allDates = selectedValues.flatMap(day => getAllDatesForDay(day));
    
            // Avoid duplicates by checking if the date already exists in formData
            const newFormData = allDates.filter((date) => {
                return !formData.some((existingItem) => existingItem.date === date.date); // Filter out duplicates
            }).map((date, index) => ({
                id: formData.length + index + 1,
                date: date.date,
                day: date.day,
            }));
    
            // Add the new (non-duplicate) dates to the formData
            setFormData(prevData => {
                const updatedData = [...prevData, ...newFormData];
                setIsFormValid(updatedData.length > 0); // Ensure form is valid if there's data
                return updatedData;
            });
        }
        setIsFormValid(selectedValues.length > 0 && selectedEmployee);
    };
    
 
    const toggleDateSelection = (date) => {
        const formattedDate = formatDate(date);
        const dayOfWeek = getDayOfWeek(date);
        if (selectedDates.includes(formattedDate)) {
            setSelectedDates(selectedDates.filter(d => d !== formattedDate));
        } else {
            setSelectedDates([...selectedDates, formattedDate]);
        }
        const newFormData = [
            ...formData,
            { id: formData.length + 1, date: formattedDate, day: dayOfWeek },
        ];
 
        setFormData(newFormData);
        setIsFormValid(newFormData.length > 0);
    };
 
    const handleCancel = () => {
        setFormData([]);
        setSelectedDates([]);
        setSelectedDays([]);
        setIsFormValid(false);
    };
 
    const handlePrevPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };
 
    const handleNextPage = () => {
        if ((currentPage + 1) * itemsPerPage < formData.length) setCurrentPage(currentPage + 1);
    };
 
    const handleView = () => {
        setIsViewing(true);
        fetchSavedHolidays();
    };
 
    const handleBackToForm = () => {
        setIsViewing(false);
        setFormData([]);
    };
 
    const handleSelectClick = () => {
        if (isViewing) {
            // e.preventDefault();
            showToast('You are in view mode. You can\'t add or edit dates.' , 'info');
        }
    };
    const removeRow = (id) => {
        setShowConfirmation(true);  // Show the confirmation popup
        setConfirmationId(id);  // Store the ID of the item to be deleted
    };
    const handleDelete = async () => {
        try {
            const response = await axios.delete(`http://${strings.localhost}/api/holidayCalendar/deleteByEmployee/${selectedEmployee.id}`);
            if (response.status === 200) {
                showToast('Date deleted successfully' , 'success');
                setShowConfirmation(false);
                setConfirmationId(null);
                // setFormData(formData.filter((item) => item.id !== id));
            } else {
                showToast('Failed to delete dates.' , 'error');
                setShowConfirmation(false);
            }
        } catch (error) {
            console.error(error);
            // showToast('Failed to delete dates.');
        }
    };
 
    const fetchSavedHolidays = async () => {
        if (!selectedEmployee || !selectedEmployee.id) {
            showToast('Please select a  employee & Day.' , 'warn');
            return;
        }
 
        setIsLoading(true);
        try {
            const response = await axios.get(`http://${strings.localhost}/api/holidayCalendar/getByEmployee/${selectedEmployee.id}`);
            const fetchedData = response.data.map(holiday => {
                const holidayDate = new Date(holiday.holidayDate + 'T00:00:00Z');  // Convert to Date object
                if (isNaN(holidayDate)) return null;
 
                return {
                    ...holiday,
                    date: formatDate(holidayDate),
                    day: getDayOfWeek(holidayDate),
                };
            }).filter(holiday => holiday !== null);
 
            setFormData(fetchedData);
        } catch (error) {
            showToast('Failed to fetch holidays.' , 'error');
        } finally {
            setIsLoading(false);
        }
    };
 
    useEffect(() => {
        if (selectedEmployee && selectedEmployee.id) {
            console.log("Fetching holidays for employee:", selectedEmployee); // Log the selected employee before fetching holidays
            fetchSavedHolidays();
        } else {
            console.log("No valid employee selected.");
        }
    }, [selectedEmployee]);
 
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("selectedEmployee in handleSubmit:", selectedEmployee);
        if (!selectedEmployee || !selectedEmployee.id) {
            showToast('Please select an employee.' , 'warn');
            return;
        }
        const requestData = formData.map(row => ({ holidayDate: row.date }));
        try {
            const response = await axios.post(`http://${strings.localhost}/api/holidayCalendar/saveMultiple/${selectedEmployee.id || selectedEmployee.employeeId}`, requestData);
            if (response.status === 200) {
                showToast('Dates saved successfully' , 'success');
                setFormData([]);
                setSelectedDates([]);
            }
        } catch (error) {
            showToast('Failed to save dates.' , 'error');
        }
    };
 
    const fetchEmployees = async (value) => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/search`, {
                params: { companyId, searchTerm: value.trim() },
            });
            setEmployees(response.data);
        } catch (error) {
        }
    };
    useEffect(() => {
        fetchEmployees();
    }, []);
 
 
    return (
        <div className="coreContainer">
            <div className="title">Employee Day-off Setup</div>
            <div className="configScreen">
 
                <div className="calendar-container1">
                    <Calendar
                        value={selectedDates.map(date => new Date(date))}
                        onClickDay={toggleDateSelection}
                        tileClassName={({ date }) => selectedDates.includes(formatDate(date)) ? 'selected-date' : ''}
                        tileDisabled={({ date }) => isViewing}
                        style={isViewing ? { cursor: 'not-allowed' } : {}}
                    />
                </div>
 
                <div className="holidayform">
                    <div className="oneine-btn">
 
                        {!isViewing && (
                            <div style={{ width: '200px' }}>
                                <Select
                                    className="selectMe"
                                    isMulti
                                    name="days"
                                    options={dayOptions}
                                    value={dayOptions.filter(option => selectedDays.includes(option.value))}
                                    onChange={handleDayChange}
                                    placeholder="Select Days"
                                    isDisabled={isViewing}
                                    onMouseDown={handleSelectClick}
                                />
                            </div>
                        )}
                        {!isViewing && (
                            <button type="button" className="btn" onClick={handleView} >  View </button>
                        )}
                        {isViewing && (
                            <button type="button" className="btn" onClick={handleBackToForm}  >  Add </button>
                        )}
                    </div>
                    {isViewing ? (
                        <div>
                            <table className="styled-table">
                                <thead>
                                    <tr>
                                        <th>Day</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(groupDatesForView(formData)).length > 0 ? (
                                        Object.keys(groupDatesForView(formData)).map((day) => {
                                            const datesForDay = groupDatesForView(formData)[day];
                                            return (
                                                <tr key={day}> 
                                                    <td>
                                                        <button onClick={() => showPopup(day)}>{day}</button>
                                                    </td> 
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="3">No dates saved</td>
                                        </tr>
                                    )}
                                </tbody>
 
                            </table>
                            <div className="form-controls">
                                <button className="btn" onClick={removeRow}>Delete All</button>
                            </div>
                            {popupData.length > 0 && (
                                <div className="config-popup-overlay">
                                    <div className="config-popup-content-container">
                                        <h3 style={{ textDecoration: 'underline' }}>Dates for {popupData[0].day}</h3>
                                        <div className="config-date-grid-wrapper">
                                            {chunkArray(popupData, 8).map((chunk, chunkIndex) => (
                                                <div key={chunkIndex} className="config-date-row">
                                                    {chunk.map((item, index) => (
                                                        <span key={index} className="config-date-item-box">
                                                            {item.date}
                                                        </span>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="form-controls">
                                            <button className="btn" onClick={handleClosePopup}>Close</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {!isViewing && isFormValid && (
                                <div className="date-nav">
                                    <button className="textbutton" onClick={handlePrevPage} disabled={currentPage === 0}> &lt; Prev</button>
                                    <button className="textbutton" onClick={handleNextPage} disabled={(currentPage + 1) * itemsPerPage >= formData.length}> Next &gt; </button>
                                </div>
                            )}
 
                        </div>
                    ) : (
                        <div>
                            <div className="datescontainer">
                                {formData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((row) => (
                                    <div key={row.id} className="date-box">
                                        <div>
                                            <p>{row.date}</p>
                                            <p>{row.day}</p>
                                        </div>
                                        <button className="remove-btn" onClick={() => removeRow(row.id)}>  Remove </button>
                                    </div>
                                ))}
                            </div>
                            {isFormValid && (
                                <div className="date-nav">
                                    <button className="textbutton" onClick={handlePrevPage} disabled={currentPage === 0}> &lt; Prev</button>
                                    <button className="textbutton" onClick={handleNextPage} disabled={(currentPage + 1) * itemsPerPage >= formData.length}> Next &gt; </button>
                                </div>
                            )}
                            {isFormValid && (
                                <div className="btnContainer" style={{ marginTop: '10px' }}>
                                    <button type="button" className="btn" onClick={handleSubmit} disabled={!isFormValid} >  Submit </button>
                                    <button type="button" className="outline-btn" onClick={handleCancel} disabled={!isFormValid} > Cancel </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
 
             
            </div>
            {showConfirmation && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to delete this date?</p>
                    <div className="btnContainer">
                        <button className="btn" onClick={handleDelete}>Yes</button>
                        <button className="btn" onClick={() => setShowConfirmation(false)}>No</button>
                    </div>
                </div>
            )}
        
 
        </div>
    );
};
 
export default EmployeeLevelConfigScreen;
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 