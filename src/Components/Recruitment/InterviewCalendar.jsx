import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { strings } from "../../string.jsx";
import { showToast } from "../../Api.jsx";
import "../CommonCss/InterviewCalendar.css"; 

const InterviewCalendar = () => {
    const { jobDescriptionId, candidateId } = useParams();
    const companyId = localStorage.getItem("companyId");
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [conflictData, setConflictData] = useState([]);
    const [isScheduling, setIsScheduling] = useState(false);
    const [monthlyInterviews, setMonthlyInterviews] = useState([]);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isViewing, setIsViewing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showInterviewDetailsPopup, setShowInterviewDetailsPopup] = useState(false);
    const [isViewingAllForCandidate, setIsViewingAllForCandidate] = useState(false);
    const [interviewDetailsByCandidate, setInterviewDetailsByCandidate] = useState([]);

    const [interviewDetails, setInterviewDetails] = useState({
        interviewTitle: "",
        interviewUrl: "",
        interviewDescription: "",
        interviewMode: true,
        interviewDate: "",
        interviewTime: "",
    });

    const [selectedEmployee, setSelectedEmployee] = useState({});
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const isToday = (date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };


    const generateMonthDays = () => {
        const days = [];
        const date = new Date(currentYear, currentMonth, 1);
        const month = date.getMonth();
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };
    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const daysInMonth = generateMonthDays();

    const handleDateClick = (date) => {
        const utcDate = new Date(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        ));

        const formattedDate = utcDate.toISOString().split("T")[0]; // yyyy-mm-dd

        setSelectedDate(date);
        handleViewInterviewDetails();
        setIsViewing(false);
        setInterviewDetails(prev => ({
            ...prev,
            interviewDate: formattedDate
        }));
        setShowPopup(true);
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setInterviewDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleTimeChange = async (e) => {
        const time = e.target.value; // format: "HH:mm"
        const [hours, minutes] = time.split(":").map(Number);

        const [year, month, day] = interviewDetails.interviewDate.split("-").map(Number);

        const interviewDateTimeUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

        setInterviewDetails(prev => ({
            ...prev,
            interviewTime: time + ":00", // display use
            interviewDateTime: interviewDateTimeUTC.toISOString() // for backend
        }));

        if (interviewDetails.interviewDate && time && selectedEmployee.employeeId) {
            await checkTimeConflict(interviewDetails.interviewDate, time + ":00", selectedEmployee.employeeId);
        }
    };



    const checkTimeConflict = async (date, time, interviewerId) => {
        try {
            const res = await axios.get(`http://${strings.localhost}/api/interview/checkConflict`, {
                params: {
                    interviewerId,
                    date,
                    time,
                },
            });
            setConflictData(res.data || []);
            if (res.data?.conflict) {
                showToast?.("Selected time has a conflict!", "error");
            } else {
                console.success("No conflict. You can schedule!", "success");
            }
        } catch (err) {
            console.error("Error checking conflict", "error");
        }
    };

    const fetchMonthlyInterviews = async () => {
        try {
            const res = await axios.get(`http://${strings.localhost}/api/interview/byMonthYear`, {
                params: {
                    month: currentMonth + 1, // JS month is 0-indexed
                    year: currentYear,
                    companyId,
                }
            });

            console.log("Fetched Monthly Interviews:", res.data);  // Log the fetched data

            setMonthlyInterviews(res.data || []);
        } catch (err) {
            console.error("Failed to fetch monthly interviews:", err);
            showToast?.("Could not fetch interviews for the selected month", "error");
        }
    };

    useEffect(() => {
        if (companyId) {
            fetchMonthlyInterviews();
        }
    }, [currentMonth, currentYear, companyId]);


    const handleEmployeeNameChange = async (event) => {
        const { value } = event.target;

        setSelectedEmployee((prev) => ({
            ...prev,
            employeeFirstName: value,
        }));
        if (!value.trim()) {
            setSelectedEmployee({});
            setInterviewDetails(prev => ({
                ...prev,
                interviewTime: "",
            }));
            setSearchResults([]);
            setError(null);
            return;
        }

        if (value.trim()) {
            try {
                const response = await axios.get(`http://${strings.localhost}/employees/search`, {
                    params: {
                        companyId,
                        searchTerm: value.trim(),
                    }
                });
                setSearchResults(response.data);
                setError(null);
            } catch (error) {
                setError('Error searching for employees.');
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
            setError(null);
        }
    };

    const handleSelectEmployee = (employee) => {
        setSelectedEmployee({
            employeeId: employee.id,
            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName,
        });
        setSearchResults([]);
    };

    const handleSave = async () => {
        // Validate all required fields
        if (!interviewDetails.interviewTitle) {
            showToast?.("Interview title is required.", "error");
            return;
        }
        if (!interviewDetails.interviewMode) {
            showToast?.("Interview mode is required.", "error");
            return;
        }
        if (!interviewDetails.interviewDate) {
            showToast?.("Interview date is required.", "error");
            return;
        }
        if (!selectedEmployee.employeeId) {
            showToast?.("Please select an interviewer.", "error");
            return;
        }
        if (!interviewDetails.interviewTime) {
            showToast?.("Interview time is required.", "error");
            return;
        }
        if (!interviewDetails.interviewDescription) {
            showToast?.("Interview description is required.", "error");
            return;
        }
     
    
        setIsScheduling(true);
        try {
            const interviewDateTimeString = `${interviewDetails.interviewDate}T${interviewDetails.interviewTime}`; // Assuming UTC time
            const interviewDateTime = new Date(interviewDateTimeString);
    
            await axios.post(`http://${strings.localhost}/api/interview/save`, {
                ...interviewDetails,
                interviewDateTime: interviewDateTime.toISOString(),
            }, {
                params: {
                    companyId,
                    jobDescriptionId,
                    candidateId,
                    interviewerId: selectedEmployee.employeeId,
                }
            });
    
            showToast?.("Interview scheduled successfully!", "success");
            setShowPopup(false);
            fetchMonthlyInterviews();
            localStorage.removeItem("selectedCandidateId");
        } catch (err) {
            showToast?.("Failed to schedule interview", "error");
        } finally {
            setIsScheduling(false);
        }
    };
    

    const handleViewInterviewDetails = async () => {
        try {
            const res = await axios.get(`http://${strings.localhost}/api/interview/byCandidate/${candidateId}`);
            setInterviewDetailsByCandidate(res.data || []);
            setShowPopup(true);
        } catch (error) {
            console.error("Failed to fetch interview details", error);
            showToast?.("Error fetching interview details", "error");
        }
    };


    const handleSlotClick = (interview) => {
        setSelectedInterview(interview);
        setShowInterviewDetailsPopup(true)
    };
    const handleCloseModal = () => {
        setShowPopup(false);
        setSelectedInterview(null);
        setIsViewing(false);
    };

    return (
        <div className="coreContainer">

            <div className="calendar-header">
                <button type="button" className="Arrows" onClick={handlePrevMonth}>←</button>
                <h2>
                    <span onClick={() => setShowMonthPicker(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })}
                    </span>{" "}
                    <span onClick={() => setShowYearPicker(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {currentYear}
                    </span>
                </h2>
                <button type="button" className="Arrows" onClick={handleNextMonth}>→</button>
            </div>
            <div className="calendar-grid">
                {daysInMonth.map((day) => (
                    <div key={day.toISOString()} className={`calendar-day ${isToday(day) ? 'today' : ''}`} >
                        <div className="day-top" onClick={() => handleDateClick(day)}>
                            <span className="circle-date">
                                {day.getDate()}
                            </span>
                        </div>


                        <div className="day-bottom">
                            {(() => {
                                const dayDateStr = day.toLocaleDateString("en-CA");
                                const interviewsOnThisDay = monthlyInterviews.filter(
                                    intv => intv.interviewDate === dayDateStr
                                );
                                return interviewsOnThisDay.length > 0 ? (
                                    <div className="slots-container">
                                        {interviewsOnThisDay.map((intv) => (
                                            <button
                                                key={intv.id}
                                                className="slot-button"
                                                title={intv.interviewTitle}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Optional, safeguard from triggering day click
                                                    handleSlotClick(intv);
                                                }}
                                            >
                                                {intv.interviewTime.slice(0, 5)} {/* Display time in HH:MM format */}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <small>No Interview</small>
                                );
                            })()}
                        </div>
                    </div>
                ))}

            </div>


            {showPopup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button type="button" className="close-btn" onClick={() => setShowPopup(false)}>X</button>

                        {isViewing && selectedInterview ? (
                            <>
                                <h3 className="centerText">Interview Details</h3>
                                <p><strong>Title:</strong> {selectedInterview.interviewTitle}</p>
                                <p><strong>Date:</strong> {selectedInterview.interviewDate}</p>
                                <p><strong>Time:</strong> {selectedInterview.interviewTime?.slice(0, 5)}</p>
                                <p><strong>Mode:</strong> {selectedInterview.interviewMode ? "Virtual" : "Face to Face"}</p>
                                <p><strong>Description:</strong> {selectedInterview.interviewDescription}</p>
                                <hr />
                                <p><strong>Candidate:</strong> {`${selectedInterview.candidateRegistration.firstName} ${selectedInterview.candidateRegistration.middelName || ""} ${selectedInterview.candidateRegistration.lastName}`}</p>
                                <p><strong>Email:</strong> {selectedInterview.candidateRegistration.email}</p>
                                <p><strong>Job Title:</strong> {selectedInterview.jobDescription?.jobTitle}</p>

                                <div className="btnContainer">
                                    <button type="button" className="outline-btn" onClick={() => setShowPopup(false)}>Close</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="centerText">Schedule Interview</h3>
                                <div>
                                    <div className="input-row">
                                        <div>
                                        <span className="required-marker">*</span>
                                            <label>Interview Title:</label>
                                            <input name="interviewTitle" type="text" value={interviewDetails.interviewTitle} onChange={handleChange} required />
                                        </div>
                                        <div>
                                            <label>URL:</label>
                                            <input name="interviewUrl" type="text" value={interviewDetails.interviewUrl} onChange={handleChange} />
                                        </div>
                                        <div>
                                        <span className="required-marker">*</span>
                                            <label>Interviewer Name:</label>
                                            <input type="text" value={selectedEmployee.employeeFirstName || ''} onChange={handleEmployeeNameChange} required/>
                                            {error && <div style={{ color: 'red' }}>{error}</div>}
                                            {searchResults.length > 0 && (
                                                <ul className="dropdown2">
                                                    {searchResults.map(emp => (
                                                        <li key={emp.id} onClick={() => handleSelectEmployee(emp)}>
                                                            {emp.firstName} {emp.lastName}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    <div className="input-row">
                                        <div>
                                        <span className="required-marker">*</span>
                                            <label>Mode:</label>
                                            <select className="selectIM" name="interviewMode" value={interviewDetails.interviewMode} onChange={handleChange} required>
                                                <option value={true}>Virtual</option>
                                                <option value={false}>Face to Face</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label>Date:</label>
                                            <input type="date" className="selectIM" value={interviewDetails.interviewDate} readOnly style={{ cursor: 'not-allowed' }} />
                                        </div>
                                        <div>
                                        <span className="required-marker">*</span>
                                            <label>Time:</label>
                                            <input
                                                className="selectIM"
                                                name="interviewTime"
                                                required
                                                type="time"
                                                value={interviewDetails.interviewTime}
                                                disabled={!selectedEmployee.employeeId}
                                                onClick={(e) => {
                                                    if (!selectedEmployee.employeeId) {
                                                        e.preventDefault();
                                                        showToast?.("Please select an interviewer first.", "warning");
                                                    }
                                                }}
                                                onChange={handleTimeChange}
                                                style={{
                                                    cursor: selectedEmployee.employeeId ? "pointer" : "not-allowed",
                                                    backgroundColor: selectedEmployee.employeeId ? "#fff" : "#f5f5f5"
                                                }}
                                            />
                                        </div>

                                    </div>
                                    <div>
                                    <span className="required-marker">*</span>
                                        <label>Description:</label>
                                        <textarea name="interviewDescription" value={interviewDetails.interviewDescription} onChange={handleChange} required />
                                    </div>
                                </div>
                                {conflictData.length > 0 && (
                                    <div className="conflict-section-popup">
                                        <h3>Conflicting Interviews:</h3>
                                        <ol className="conflict-list">
                                            {conflictData.map((conflict, index) => {
                                                const candidate = conflict?.candidateRegistration || {};
                                                return (
                                                    <li key={index} className="interview-details">
                                                        <span className="list-number">{index + 1}.</span>
                                                        <p><strong>Interview Title:</strong> {conflict?.interviewTitle || 'NA'}</p>
                                                        <p><strong>Date:</strong> {conflict?.interviewDate || 'NA'}</p>
                                                        <p><strong>Time:</strong> {conflict?.interviewTime || 'NA'}</p>
                                                        <p className="info-wrapper">
                                                            <img
                                                                className="info-icon"
                                                                src="/Images/info-icon.png"
                                                                alt="Info Icon"
                                                                width="20"
                                                                height="20"
                                                            />
                                                        </p>

                                                        <hr />
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    </div>
                                )}
                                {conflictData.length > 0 && (
                                    <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
                                        Note : Already scheduled  {conflictData.length} interview(s) at the near by time.
                                    </p>
                                )}
                                {candidateId && interviewDetailsByCandidate.length > 0 && (
                                    <div className="candidate-interview-tiles">
                                        <hr />
                                        <h3 className="underlineText">Scheduled Interviews for Candidate</h3>
                                        <ul className="interviewtiles">
                                            {interviewDetailsByCandidate.map((interview, idx) => (
                                                <li key={idx} className="interviewtile">
                                                    <div className="interview-row">
                                                        <span className="interview-label">Title:</span>
                                                        <span className="interview-value">{interview.interviewTitle || 'NA'}</span>
                                                    </div>
                                                    <div className="interview-row">
                                                        <span className="interview-label">Date:</span>
                                                        <span className="interview-value">{interview.interviewDate || 'NA'}</span>
                                                    </div>
                                                    <div className="interview-row">
                                                        <span className="interview-label">Time:</span>
                                                        <span className="interview-value time-highlight">{interview.interviewTime?.slice(0, 5) || 'NA'}</span>
                                                    </div>
                                                    <div className="interview-row">
                                                        <span className="interview-label">Status:</span>
                                                        <span className="interview-value">
                                                            {interview.interviewComplitionStatus
                                                                ? (interview.interviewResult ? "Passed" : "Failed")
                                                                : "Pending"}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}

                                        </ul>
                                    </div>
                                )}

                                <div className="btnContainer">
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={handleSave}
                                    // disabled={conflictData.length > 0 || isScheduling}
                                    // style={{
                                    //     opacity: conflictData.length > 0 ? 0.5 : 1,
                                    //     cursor: conflictData.length > 0 ? "not-allowed" : "pointer"
                                    // }}
                                    >
                                        {isScheduling ? (
                                            <>
                                                <span className="loading-spinner" /> Scheduling...
                                            </>
                                        ) : (
                                            "Schedule Interview"
                                        )}

                                    </button>
                                    <button type="button" className="outline-btn" onClick={() => setShowPopup(false)}>Close</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>



            )}
            {showYearPicker && (
                <div className="Ipopup-overlay">
                    <div className="Ipopup-box">
                        <span className="Ipopup-close" onClick={() => setShowYearPicker(false)}>×</span>

                        <h4>Select Year</h4>
                        {[...Array(21)].map((_, i) => {
                            const year = currentYear - 10 + i;
                            return (
                                <div key={year} onClick={() => {
                                    setCurrentYear(year);
                                    setShowYearPicker(false);
                                }} className="Ipopup-item">
                                    {year}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showMonthPicker && (
                <div className="Ipopup-overlay">
                    <div className="Ipopup-box">
                        <span className="Ipopup-close" onClick={() => setShowMonthPicker(false)}>×</span>

                        <h4>Select Month</h4>
                        {Array.from({ length: 12 }, (_, i) => (
                            <div key={i} onClick={() => {
                                setCurrentMonth(i);
                                setShowMonthPicker(false);
                            }} className="Ipopup-item">
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {showInterviewDetailsPopup && selectedInterview && (
                <div className="add-popup">
                    <div>
                        <h3 className="centerText">Interview Details</h3>

                        <p><strong>Candidate:</strong> {`${selectedInterview.candidateRegistration.firstName} ${selectedInterview.candidateRegistration.middelName || ""} ${selectedInterview.candidateRegistration.lastName}`}</p>
                        <p><strong>Email:</strong> {selectedInterview.candidateRegistration.email}</p>
                        <hr />
                        <p><strong>Title:</strong> {selectedInterview.interviewTitle}</p>
                        <p><strong>Date:</strong> {selectedInterview.interviewDate}</p>
                        <p><strong>Time:</strong> {selectedInterview.interviewTime?.slice(0, 5)}</p>
                        <p><strong>Mode:</strong> {selectedInterview.interviewMode ? "Virtual" : "Face to Face"}</p>
                        <p><strong>Description:</strong> {selectedInterview.interviewDescription}</p>


                        <div className="btnContainer">
                            <button type="button" className="outline-btn" onClick={() => setShowInterviewDetailsPopup(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default InterviewCalendar;
