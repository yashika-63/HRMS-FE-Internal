import React, { useState, useEffect } from "react";
import axios from "axios";
import { strings } from "../../string.jsx";
import { showToast } from "../../Api.jsx";
import "../CommonCss/InterviewCalendar.css"; // For custom styles

const InterviewCalendarView = () => {

    const companyId = localStorage.getItem("companyId");
    const interviewerId = localStorage.getItem("employeeId");
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [interviewerInterviews, setInterviewerInterviews] = useState([]);
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [conflictData, setConflictData] = useState([]);
    const [monthlyInterviews, setMonthlyInterviews] = useState([]);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [isViewing, setIsViewing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showInterviewDetailsPopup, setShowInterviewDetailsPopup] = useState(false);
    const [interviewDetailsByCandidate, setInterviewDetailsByCandidate] = useState([]);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [interviewResultData, setInterviewResultData] = useState({ interviewId: null, passed: null });
    const [interviewScore, setInterviewScore] = useState("");
    const [interviewNotes, setInterviewNotes] = useState([]);
    const [note, setNote] = useState("");
    const Name = localStorage.getItem("firstName");
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
    const fetchMonthlyInterviews = async () => {
        try {
            const res = await axios.get(`http://${strings.localhost}/api/interview/byMonthYear`, {
                params: {
                    month: currentMonth + 1,
                    year: currentYear,
                    companyId,
                }
            });

            console.log("Fetched Monthly Interviews:", res.data);

            setMonthlyInterviews(res.data || []);
        } catch (err) {
            console.error("Failed to fetch monthly interviews:", err);
            showToast?.("Could not fetch interviews for the selected month", "error");
        }
    };
    const fetchInterviewsForInterviewer = async () => {
        try {
            const res = await axios.get(`http://${strings.localhost}/api/interview/getByInterviewerIdAndMonthYear`, {
                params: {
                    interviewerId,
                    month: currentMonth + 1,
                    year: currentYear,
                }
            });

            console.log("Fetched Interviews for Interviewer:", res.data);
            setInterviewerInterviews(res.data || []);
        } catch (err) {
            console.error("Failed to fetch interviews for the interviewer:", err);
            showToast?.("Could not fetch interviews for the selected month", "error");
        }
    };

    useEffect(() => {
        if (companyId) {
            fetchMonthlyInterviews();
        }
        fetchInterviewsForInterviewer();
    }, [currentMonth, currentYear, companyId, interviewerId]);

    const handleSlotClick = (interview) => {
        setSelectedInterview(interview);
        setShowInterviewDetailsPopup(true)
    };
    const handleInterviewResult = (passed) => {
        setInterviewResultData({ interviewId: selectedInterview.id, passed });
        setShowResultPopup(true);

    };


    const validateScore = (score) => {
        const scoreValue = Number(score);
        if (!Number.isInteger(scoreValue) || scoreValue < 1 || scoreValue > 10) {
            return { isValid: false, value: null };
        }
        return { isValid: true, value: scoreValue };
    };

    const handleSaveInterviewResult = async () => {
        const { interviewId, passed } = interviewResultData;
        const actionTakenByName = Name;
        console.log("Interview Score entered:", interviewScore);
        if (!note.trim()) {
            showToast?.("Note cannot be empty", "warning");
            return;
        }
        const { isValid, value: scoreValue } = validateScore(interviewScore);
        if (!isValid) {

            showToast("Score must be a number between 1 and 10", "warning");
            return;
        }
        try {
            // Save interview note
            await axios.post(`http://${strings.localhost}/api/interview-notes/save/${selectedInterview.id}`, {
                note,
                actionTakenByName,
                interviewScore: scoreValue
            });
            // Update result
            await axios.put(`http://${strings.localhost}/api/interview/updateResult/${selectedInterview.id}?passed=${passed}`);

            showToast?.(`Interview marked as ${passed ? "Passed" : "Failed"} with notes`, "success");
            setSelectedInterview({ ...selectedInterview, interviewComplitionStatus: true });
            setShowResultPopup(false);
            fetchInterviews();

        } catch (error) {
            console.error("Error saving result/note", error);
        }
    };
    function getInterviewStatus(interview) {
        if (interview.interviewComplitionStatus) {
            return interview.interviewResult ? "Passed" : "Failed";
        } else {
            return "Pending in slot";
        }
    }


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
            <div className="color-legend" >
                <div className="legend-item">
                    <span className="legend-circle company"></span> <span>Company Interviews</span>
                </div>
                <div className="legend-item">
                    <span className="legend-circle YourInterview"></span> <span>Your Scheduled Interviews</span>
                </div>
                <div className="legend-item">
                    <span className="legend-circle green"></span> <span>Completed Interviews</span>
                </div>
            </div>
            <div className="calendar-grid">
                {daysInMonth.map((day) => (
                    <div key={day.toISOString()} className={`calendar-day ${isToday(day) ? 'today' : ''}`}>
                        <div className="day-top">
                            <span className="circle-date">{day.getDate()}</span>
                        </div>
                        <div className="day-bottom">
                            {(() => {
                                const dayDateStr = day.toLocaleDateString("en-CA");

                                const interviewsOnThisDay = monthlyInterviews.filter(
                                    (intv) => intv.interviewDate === dayDateStr
                                );
                                const interviewerSlots = interviewerInterviews.filter(
                                    (intv) => intv.interviewDate === dayDateStr
                                );

                                if (interviewsOnThisDay.length === 0 && interviewerSlots.length === 0) {
                                    return <small>No Interview</small>;
                                }

                                return (
                                    <div className="slots-container">
                                        {interviewsOnThisDay.map((intv) => (
                                            <button
                                                key={`company-${intv.id}`}
                                                className="slot-button"
                                                title={intv.interviewTitle}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSlotClick(intv); // Show details in the popup
                                                }}
                                            >
                                                {intv.interviewTime.slice(0, 5)}
                                            </button>
                                        ))}
                                        {interviewerSlots.map((intv) => {
                                            const slotClass = intv.interviewComplitionStatus
                                                ? 'slot-button green-slot'
                                                : 'slot-button orange-slot';

                                            return (
                                                <button
                                                    key={`interviewer-${intv.id}`}
                                                    className={slotClass}
                                                    title={intv.interviewTitle}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSlotClick(intv); // Show details in the popup
                                                    }}
                                                >
                                                    {intv.interviewTime.slice(0, 5)}
                                                </button>
                                            );
                                        })}
                                    </div>
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
                                {interviewDetailsByCandidate.length > 0 && (
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
                        <p><strong>Candidate Name:</strong> {`${selectedInterview.candidateRegistration.firstName} ${selectedInterview.candidateRegistration.middelName || ""} ${selectedInterview.candidateRegistration.lastName}`}</p>
                        <p><strong>Candidate Email Id:</strong> {selectedInterview.candidateRegistration.email}</p>
                        <hr />
                        <p><strong>Title:</strong> {selectedInterview.interviewTitle}</p>
                        <p><strong>Description:</strong> {selectedInterview.interviewDescription}</p>
                        <p><strong>Date:</strong> {selectedInterview.interviewDate}</p>
                        <p><strong>Time:</strong> {selectedInterview.interviewTime?.slice(0, 5)}</p>
                        <p><strong>Mode:</strong> {selectedInterview.interviewMode ? "Virtual" : "Face to Face"}</p>
                        <p><strong>Status:</strong>
                            <span
                                className={`status-confirmationBadge ${selectedInterview?.interviewComplitionStatus
                                    ? selectedInterview?.interviewResult
                                        ? "confirmed"
                                        : "terminated"
                                    : "pending"
                                    }`}
                            >
                                {selectedInterview?.interviewComplitionStatus
                                    ? selectedInterview?.interviewResult
                                        ? "Passed"
                                        : "Failed"
                                    : "Pending"
                                }
                            </span>
                        </p>


                        {(() => {
                            const now = new Date();
                            const interviewDateTime = new Date(`${selectedInterview.interviewDate}T${selectedInterview.interviewTime}`);
                            const isUpcoming = interviewDateTime > now;
                            const hasResult = selectedInterview.interviewComplitionStatus; // assuming this means result is submitted

                            if (isUpcoming && !hasResult) {
                                return (
                                    <div className="btnContainer">
                                        <div>
                                            <button type="button" className="btn" onClick={() => handleInterviewResult(true)}>Pass</button>
                                        </div>
                                        <div>
                                            <button type="button" className="outline-btn" onClick={() => handleInterviewResult(false)}>Fail</button>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {showResultPopup && (
                            <div className="add-popup">
                                <div>
                                    <h3 className="centerText">Add Interview Result</h3>
                                    <div>
                                        <span className="required-marker">*</span>
                                        <label>Interview Score (1 to 10)</label>
                                        <input
                                            className="selectIM"
                                            type="number"
                                            value={interviewScore}
                                            onChange={(e) => setInterviewScore(e.target.value)}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                    <div>
                                        <span className="required-marker">*</span>
                                        <label>Note</label>
                                        <textarea value={note} onChange={(e) => setNote(e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Action Taken By</label>
                                        <input className="readonly" type="text" value={Name} disabled />
                                    </div>

                                    <div className="btnContainer">
                                        <button className="btn" onClick={handleSaveInterviewResult}>Save</button>
                                        <button className="outline-btn" onClick={() => setShowResultPopup(false)}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="btnContainer">
                            <button type="button" className="outline-btn" onClick={() => setShowInterviewDetailsPopup(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
export default InterviewCalendarView;
