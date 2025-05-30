import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { strings } from "../../string";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable';
import { fetchDataByKey ,showToast} from '../../Api.jsx';
import "react-calendar/dist/Calendar.css";
import '../CommonCss/ConfigScreen.css';
import 'react-toastify/dist/ReactToastify.css';

const ConfigScreen = () => {
    const [deleteId, setDeleteId] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false); // Controls the "Add" mode
    const [selectedDates, setSelectedDates] = useState([]); // Stores selected dates
    const [formData, setFormData] = useState([]); // Stores selected date data with description
    const [savedDates, setSavedDates] = useState([]); // Stores the fetched saved dates
    const companyId = localStorage.getItem("companyId");
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSavedDates = savedDates.slice(indexOfFirstItem, indexOfLastItem);
    const [dropdownData, setDropdownData] = useState({ state: [], CompanyHolidayDescription: [] });
    const [selectedState, setSelectedState] = useState(""); // Add state to track selected state
    const [selectedStateId, setSelectedStateId] = useState('');
   
    useEffect(() => {
        // Fetch the saved holiday dates when the component mounts
        fetchSavedDates();
    }, [selectedStateId]);
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const state = await fetchDataByKey('state');
                const CompanyHolidayDescription = await fetchDataByKey('CompanyHolidayDescription');
                    setDropdownData({ CompanyHolidayDescription, state });
               
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };

        fetchDropdownData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "state") {
            const selectedState = dropdownData.state.find(state => state.data === value);
            if (selectedState) {
                setSelectedState(selectedState.data);
                setSelectedStateId(selectedState.masterId);
                console.log("State selected:", selectedState.data);
                console.log("Selected State ID (masterId):", selectedState.masterId);
            } else {
                console.log("Selected state not found!");
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const fetchSavedDates = async () => {
        setIsLoading(true);
          if ( !selectedStateId) {
            showToast('Please select state.' , 'warn');
              return;
            }
        try {
            const response = await axios.get(`http://${strings.localhost}/api/companyHolidayCalendar/company/${companyId}/workStateCode/${selectedStateId}`);
            if (response.status === 200) {
                setSavedDates(response.data);
            }
        } catch (error) {
            showToast('Failed to fetch saved data.' , 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData([]);
        setSelectedDates([]);
    };

  

    const updateFormData = (newSelectedDates) => {
        const newFormData = newSelectedDates.map((dateStr, index) => {
            const date = new Date(dateStr);
            return {
                id: index + 1,
                date: formatDate(date),
                day: getDayOfWeek(date),
                description: ''
            };
        });
        setFormData(newFormData);
    }; 
    const toggleDateSelection = (date) => {
        const dateStr = date.toDateString();
        setSelectedDates(prevState => {
            const updatedDates = prevState.includes(dateStr)
                ? prevState.filter(d => d !== dateStr)
                : [...prevState, dateStr];
            updateFormData(updatedDates);
            return updatedDates;
        });
    };

    const getDayOfWeek = (date) => {
        const options = { weekday: 'long' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const newFormData = [...formData];
        newFormData[index][name] = value;
        setFormData(newFormData);
    };

    const handleSelectChange = (selectedOptions, index) => {
        const newFormData = [...formData];
        if (selectedOptions && selectedOptions.length > 0) {
            newFormData[index].CompanyHolidayDescription = selectedOptions.map(option => option.value).join(', ');
        } else {
            newFormData[index].CompanyHolidayDescription = '';
        }
        setFormData(newFormData);
    };

    const removeRow = async (index) => {
        const deletedItem = formData[index];
        try {
            const response = await axios.delete(`http://${strings.localhost}/api/holidayCalendar/delete/${deletedItem.id}`);
            if (response.status === 200) {
                showToast('Date deleted successfully' , 'success');
                setFormData(formData.filter((_, i) => i !== index));
            }
        } catch (error) {
            showToast('Failed to delete date.' ,'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!selectedStateId) {
            console.log("Error: Please select a state. selectedStateId is", selectedStateId); // Debugging log
            showToast('Please select a state.' , 'warn');
            return;
        }
    
        const requestData = formData.map(row => {
            const [day, month, year] = row.date.split('-');
            const validDate = new Date(`${year}-${month}-${day}`);
    
            if (isNaN(validDate)) {
                console.error('Invalid date:', row.date);
                return null;
            }
    
            return {
                holidayDate: validDate.toISOString().split('T')[0],
                description: row.CompanyHolidayDescription,
                workStateCode: selectedStateId // This should be the masterId of the selected state
            };
        }).filter(item => item !== null); // Filter out any null items in case of invalid dates
    
        if (requestData.length === 0) {
            showToast('Please provide valid dates.' , 'warn');
            return;
        }
    
        try {
            const response = await axios.post(`http://${strings.localhost}/api/companyHolidayCalendar/saveMultiple/${companyId}`, requestData);
            if (response.status === 200 || response.status === 201) {
                showToast('Dates saved successfully', 'success');
                setFormData([]);
                setSelectedDates([]);
                setIsAddMode(false);
                fetchSavedDates();
            }
        } catch (error) {
            showToast('Failed to save dates. Please try again later.' , 'error');
        }
    };
    

    const handleDelete = async () => {
        if (deleteId === null) return; // Ensure there's a valid ID before deleting
        try {
            const response = await axios.delete(`http://${strings.localhost}/api/companyHolidayCalendar/${deleteId}`);
            if (response.status === 200) {
                showToast('Date deleted successfully.' , 'success');
                fetchSavedDates(); // Refresh saved dates after deletion
            }
        } catch (error) {
            showToast('Failed to delete date. Please try again.' ,'error');
        } finally {
            setDeleteId(null); // Reset the deleteId
            setShowConfirmation(false); // Close the confirmation dialog
        }
    };
    
    const openConfirmationPopup = (id) => {
        setDeleteId(id); 
        setShowConfirmation(true); // Show confirmation dialog
      };
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage * itemsPerPage < savedDates.length) setCurrentPage(prev => prev + 1);
    };

    return (
        <div className="coreContainer">
        <div>
            {/* <div className='addform'>
                <button type="button" className={activePage === 'Employee Level' ? 'active' : ''} onClick={() => setActivePage('Employee Level')}>Employee Level</button>
                <button type="button" className={activePage === 'CTC generation' ? 'active' : ''} onClick={() => setActivePage('CTC generation')}>CTC Generation</button>
                <button type="button" className={activePage === 'percentageAdjustment' ? 'active' : ''} onClick={() => setActivePage('percentageAdjustment')}> percentageAdjustment</button>
                <button type="button" className={activePage === 'Employee Level' ? 'active' : ''} onClick={() => setActivePage('Employee Level')}> Employee level</button>

            </div> */}

            {/* {activePage === 'Company Level' && ( */}
            <div className="ctcBox">
                <div className="calendar-container1">
                    <Calendar
                        value={selectedDates.map(date => new Date(date))}
                        onClickDay={toggleDateSelection}
                        tileClassName={({ date, view }) => {
                            if (selectedDates.includes(date.toDateString())) {
                                return 'selected-date';
                            }
                        }}
                    />
                </div>

                <div className="holidayform">
                    <div className="add-button-container">
                        {isAddMode && (
                            <button type="button" className="btn" onClick={() => setIsAddMode(false)} > View </button>
                        )}
                        {!isAddMode && (
                            <button type="button" className="btn" onClick={() => setIsAddMode(true)} > Add </button>
                        )}
                    </div>
                    <div>
                        <span className="required-marker">*</span>
                        <label htmlFor="state"> State</label>
                        <select
                            id="state"
                            name="state"
                            value={selectedState  || ""}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled >Select a state</option>
                            {dropdownData.state && dropdownData.state.length > 0 ? (
                                dropdownData.state.map(option => (
                                    <option key={option.masterId} value={option.data}>
                                        {option.data}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No states available</option>
                            )}
                        </select>
                    </div>
                    <h3>{isAddMode ? "Add New Dates" : ""}</h3>
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>Holiday Date</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isAddMode ? (
                                formData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td>{row.date}</td>
                                        <td>
                                            <CreatableSelect
                                                isMulti
                                                options={dropdownData.CompanyHolidayDescription.map(option => ({
                                                    value: option.data, 
                                                    label: option.data
                                                }))}
                                                onChange={(selectedOptions) => handleSelectChange(selectedOptions, index)}
                                                value={formData[index]?.CompanyHolidayDescription?.split(', ').map(value => ({
                                                    value,
                                                    label: value
                                                }))}
                                                isClearable
                                            />                                            
                                        </td>
                                        <td>
                                            <button type="button" onClick={() => removeRow(index)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                savedDates.length > 0 ? (
                                    savedDates.map((row , index) => {
                                        const formattedDate = formatDate(new Date(row.holidayDate));
                                        return (
                                            <tr key={row.id}>
                                                <td>{index+1}</td>
                                                <td>{formattedDate}</td>
                                                <td>{row.description || "No description"}</td>
                                                <td>
                                                    <button type="button" onClick={() => openConfirmationPopup(row.id)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4">No saved data available.</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>

                    {!isAddMode && (
                        <div className="date-nav">
                            <button type="button"  onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                            <button type="button"  onClick={handleNextPage} disabled={currentPage * itemsPerPage >= savedDates.length}>Next</button>
                        </div>
                    )}

                    {isAddMode && (
                        <div className="form-controls">
                            <button type="button" className="btn" onClick={handleSubmit} disabled={selectedDates.length === 0}>Submit</button>
                            <button type="button" className="outline-btn" onClick={handleCancel} disabled={selectedDates.length === 0}>Cancel</button>
                        </div>
                    )}
                </div>
            </div>
            {showConfirmation && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to delete ?</p>
                    <div className="btnContainer">
                    <button className="btn" onClick={handleDelete}> Yes </button>
                    <button className="outline-btn" onClick={() => setShowConfirmation(false)} >  No </button>
                    </div>
                </div>
            )}
            {/* )} */}

            {/* {activePage === 'Employee Level' && <EmployeeConfigScreen />}
            {activePage === 'CTC Generation' && <SalaryBreakup />}
            {activePage === 'percentageAdjustment' && <percentageAdjustment />} */}

       
        </div>
        </div>
    );
};

export default ConfigScreen;
