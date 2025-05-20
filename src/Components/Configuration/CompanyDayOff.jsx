import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from 'axios';
import '../CommonCss/ConfigScreen.css'
import Select from 'react-select';
import { strings } from "../../string";
import { fetchDataByKey , showToast } from '../../Api.jsx';

const CompanyDayOff = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationId, setConfirmationId] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [formData, setFormData] = useState([]);
    const [selectedDays, setSelectedDays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isViewing, setIsViewing] = useState(false);
    const [popupData, setPopupData] = useState([]);  // For storing data to show in popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [isFormValid, setIsFormValid] = useState(false);
    const companyId = localStorage.getItem("companyId");
    const itemsPerPage = 12;
    const paginatedData = Array.isArray(formData) ? formData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage) : [];
    const [dropdownData, setDropdownData] = useState({
        employeeDayOffCategory: []
    });
    const dayOptions = [
        { value: "Monday", label: "Monday" },
        { value: "Tuesday", label: "Tuesday" },
        { value: "Wednesday", label: "Wednesday" },
        { value: "Thursday", label: "Thursday" },
        { value: "Friday", label: "Friday" },
        { value: "Saturday", label: "Saturday" },
        { value: "Sunday", label: "Sunday" },
    ];
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
    const showPopup = (day) => {
        const dayData = formData.filter(item => item.day === day);
        setPopupData(dayData);
    };
    function chunkArray(arr, chunkSize) {
        const result = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    }
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const Category = await fetchDataByKey('employeeDayOffCategory');
                setDropdownData({
                    employeeDayOffCategory: Category
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);
    

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
            setSelectedDates([]);  // Clear the selected dates
            setFormData([]);  // Clear the form data
            setIsFormValid(false);  // Ensure the form is invalid when no days are selected
        } else {
            // Step 1: Filter the formData to only keep the dates of the currently selected days
            const filteredFormData = formData.filter(item => selectedValues.includes(item.day));
            setFormData(filteredFormData);
            setIsFormValid(filteredFormData.length > 0);  // Validate form

            // Step 2: Add dates for the newly selected days only
            const newDates = selectedValues.flatMap(day => getAllDatesForDay(day));
            const newFormData = newDates.filter(date => !filteredFormData.some(item => item.date === date.date)).map((date, index) => ({
                id: formData.length + index + 1,
                date: date.date,
                day: date.day
            }));

            setFormData(prevData => {
                const updatedData = [...filteredFormData, ...newFormData];
                setIsFormValid(updatedData.length > 0); // Ensure form is valid if there's data
                return updatedData;
            });
        }
    };

    const removeDate = (dateId) => {
        const updatedFormData = formData.filter(item => item.id !== dateId); // Remove date by id
        setFormData(updatedFormData);
        setIsFormValid(updatedFormData.length > 0); // Update form validity if form data is not empty
    };

    const handleRemoveDateClick = (dateId) => {
        removeDate(dateId);
    };

    const toggleDateSelection = (date) => {
        const formattedDate = formatDate(date);
        const dayOfWeek = getDayOfWeek(date);
        const newFormData = [
            ...formData,
            { id: formData.length + 1, date: formattedDate, day: dayOfWeek, categoryId: selectedCategoryId },
        ];
        console.log('Form Data:', formData);

        setFormData(newFormData);
        setSelectedDates([formattedDate]);
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
        if (!selectedCategoryId) {
            showToast('Please Select category.' ,'warn');
            return;
        }
        setIsViewing(true);
        setFormData([]);
        fetchSavedHolidays();
    };

    const handleBackToForm = () => {
        setIsViewing(false);
        setFormData([]);
    };

    const handleSelectClick = () => {
        if (isViewing) {
            // e.preventDefault();
            showToast('You are in view mode. You can\'t add or edit dates.' ,'info');
        }
    };

    const removeRow = (selectedCategoryId) => {
        if (!selectedCategoryId) {
            showToast('Please Select category.','warn');
            return;
        }
        setSelectedCategoryId(selectedCategoryId);  // Set the selected category for context
        setShowConfirmation(true);  // Show the confirmation popup
    };


    const handleDelete = async () => {
        const deletedItem = formData.find(item => item.id === confirmationId);  // Find the item with the matching id
        try {
            const response = await axios.delete(
                `http://${strings.localhost}/api/companyDayOffConfig/deleteByCategoryAndCompany/${companyId}/${selectedCategoryId}`
            );
            if (response.status === 200) {
                showToast('Date deleted successfully!','success');
                setSelectedCategoryId(selectedCategoryId);
                setFormData(formData.filter(item => item.categoryId !== selectedCategoryId)); // Remove the item by its id
                setShowConfirmation(false);  // Hide the confirmation popup after deletion
                setConfirmationId(null);
                fetchSavedHolidays();
            }
        } catch (error) {
            showToast('Failed to delete date.','error');
            setShowConfirmation(false);  // Hide the confirmation popup if there's an error
        }
    };
    const fetchSavedHolidays = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`http://${strings.localhost}/api/companyDayOffConfig/getByCompanyAndCategory/${companyId}/${selectedCategoryId}`);
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
            showToast('Failed to fetch holidays.','error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCategoryId && isViewing) {
            setFormData([]);
            fetchSavedHolidays();
        }
    }, [selectedCategoryId, isViewing]);
    const resetForm = () => {
        setSelectedCategoryId('');  // Clear selected category
        setSelectedDays([]);  // Clear selected days
        setSelectedDates([]);
        setFormData([]);  // Clear selected dates
        setIsFormValid(false);  // Reset form validity
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation checks
        if (!selectedCategoryId) {
            showToast('Please select a category.' , 'warn');
            return;
        }
        if (!dropdownData.employeeDayOffCategory || dropdownData.employeeDayOffCategory.length === 0) {
            showToast('Categories are not available.','warn');
            return;
        }
        const selectedCategory = dropdownData.employeeDayOffCategory.find(
            (cat) => cat.masterId.toString() === selectedCategoryId.toString()
        );
        if (!selectedCategory) {
            showToast('Invalid category selected.','warn');
            return;
        }
        if (formData.length === 0) {
            showToast('No dates selected.' ,'warn');
            return;
        }

        // Prepare data to send
        const requestData = formData.map(row => ({
            holidayDate: row.date,
            workCategoryCode: selectedCategory.masterId,
        }));

        try {
            const response = await axios.post(`http://${strings.localhost}/api/companyDayOffConfig/save-multiple/${companyId}`, requestData);

            if (response.status === 200) {
                showToast('Dates saved successfully.', 'success');

                // Reset states after successful save
                resetForm();  // Reset the form by calling resetForm function

                fetchSavedHolidays();  // Re-fetch saved holidays (optional, depending on your logic)
            } else {
                showToast(`Failed to save dates. Status: ${response.status}` ,'error');
            }
        } catch (error) {
            console.error("Error in handleSubmit:", error);

            if (error.response) {
                showToast(`Failed to save dates. Server responded with: ${error.response.data.message || error.response.statusText}` , 'error');
            } else if (error.request) {
                showToast('Failed to save dates. No response from server.' , 'error');
            } else {
                showToast(`Failed to save dates. Error: ${error.message}` , 'error');
            }
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'employeeDayOffCategory') {
            if (value) {
                setSelectedCategoryId(value);  // Set the selected category
                const selectedCategory = dropdownData.employeeDayOffCategory.find(cat => cat.masterId === value);

                if (selectedCategory) {
                    const categoryMasterId = selectedCategory.masterId;
                    setSelectedCategoryId(categoryMasterId);
                }
                if (isViewing) {
                    fetchSavedHolidays();
                }

                setFormData(prevData => {
                    const newData = prevData.filter(item => item && Object.keys(item).length > 0);
                    return [...newData];
                });
            } else {
                setFormData([]);
            }
        }
    };

    const validFormData = formData.filter(item => item && Object.keys(item).length > 0);
    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setPopupData([]);
    };
    useEffect(() => {
        console.log('Selected Days:', selectedDays);
        console.log('Form Data:', formData);
    }, [selectedDays, formData]);
    
    return (
        <div className="ctcBox">
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
                    <div>
                        <span className="required-marker">*</span>
                        <label htmlFor="Category">Employee Category</label>
                        <select id="employeeDayOffCategory" name="employeeDayOffCategory" value={selectedCategoryId} onChange={handleChange} required>
                            <option value="" disabled hidden>select </option>
                            {dropdownData.employeeDayOffCategory && dropdownData.employeeDayOffCategory.length > 0 ? (
                                dropdownData.employeeDayOffCategory.map(option => (
                                    <option key={option.masterId} value={option.masterId}>
                                        {option.data}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Category Not available</option>
                            )}
                        </select>

                    </div>
                    {!isViewing && (
                        <div style={{ marginTop: '20px', width: '200px' }}>
                            <Select isMulti name="days" options={dayOptions} value={dayOptions.filter(option => selectedDays.includes(option.value))} onChange={handleDayChange} placeholder="Select Days" isDisabled={isViewing} onMouseDown={handleSelectClick} />
                        </div>
                    )}
                    {!isViewing && (
                        <button type="button" className="btn" style={{ marginTop: '20px' }} onClick={handleView} >  View </button>
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
                                {Object.keys(groupDatesByDay(formData)).length > 0 ? (
                                    Object.keys(groupDatesByDay(formData)).map((day) => {
                                        const datesForDay = groupDatesByDay(formData)[day]; // Get all dates for this day
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
                        <div className="form-controls" style={{ marginBottom: '0px' }}>
                            <button type="button" className="red-btn" onClick={() => removeRow(selectedCategoryId)}> Delete</button>
                        </div>
                        {/* <div className="date-nav" >
                            <button type="button" onClick={handlePrevPage} disabled={currentPage === 0}>
                             Previous
                            </button>
                            <button type="button" onClick={handleNextPage} disabled={(currentPage + 1) * itemsPerPage >= formData.length}>
                                Next
                            </button>
                        </div> */}

                    </div>
                ) : (
                    <div>
                        <div className="datescontainer">
                            {validFormData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((row) => (
                                <div key={row.id} className="date-box">
                                    <div>
                                        <p>{row.date}</p>
                                        <p>{row.day}</p>
                                    </div>
                                    <button className="remove-btn" onClick={() => handleRemoveDateClick(row.id)}>Remove</button>
                                </div>
                            ))}

                        </div>


                        {(selectedDays.length > 0 || formData.length > 0)&&(
                            <div className="date-nav">
                                <button className="textbutton" onClick={handlePrevPage} disabled={currentPage === 0}>
                                Previous
                                </button>
                                <button className="textbutton" onClick={handleNextPage} disabled={(currentPage + 1) * itemsPerPage >= formData.length}>
                                    Next
                                </button>
                            </div>
                        )}
                        {(selectedDays.length > 0 || formData.length > 0) && (
                            <div className="btnContainer">
                                <button type="button" className="btn" onClick={handleSubmit} disabled={!isFormValid}>
                                    Submit
                                </button>
                                <button type="button" className="outline-btn" onClick={handleCancel} disabled={!isFormValid}>
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
            {showConfirmation && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to delete this date?</p>
                    <div className="btnContainer">
                        <button className="btn" onClick={handleDelete}>Yes</button>
                        <button className="outline-btn" onClick={() => setShowConfirmation(false)}>No</button>
                    </div>
                </div>
            )}

         
        </div>
    );
};
export default CompanyDayOff;
