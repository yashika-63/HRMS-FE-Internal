import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { showToast } from '../../Api.jsx';
import { strings } from "../../string.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

const InterviewedCandidate = () => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedCandidates, setSelectedCandidates] = useState({});
    const [interviewList, setInterviewList] = useState([]);
    const [showInterviewPopup, setShowInterviewPopup] = useState(false);
    const [showInterviewDataPopup, setShowInterviewDataPopup] = useState(false);
    const [interviewDetailsByCandidate, setInterviewDetailsByCandidate] = useState([]);
    const [interviewData, setInterviewData] = useState([]);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [interviewNotes, setInterviewNotes] = useState([]);
    const [interviewResultData, setInterviewResultData] = useState({ interviewId: null, passed: null });
    const [note, setNote] = useState("");
    const [interviewScore, setInterviewScore] = useState("");
    const Name = localStorage.getItem("firstName");
    const navigate = useNavigate();
    const { id } = useParams();
    const jobDescriptionId = id;

    const fetchCandidates = async () => {
        try {
            const res = await axios.get(`http://${strings.localhost}/api/candidate/filter`, {
                params: {
                    jobDescriptionId,
                    status: true,
                    shortListed: true,
                    finalizedForInterview: true,
                    selectedCandidate: false,
                }
            });

            setCandidates(res.data || []);
        } catch (error) {
            console.error("Failed to fetch candidates", error);
        }
    };
    useEffect(() => {
        fetchCandidates();
    }, [jobDescriptionId]);


    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await axios.get(`http://${strings.localhost}/api/interview/byJobDescription/${jobDescriptionId}`);
                setInterviewList(res.data || []);
            } catch (error) {
                console.error("Failed to fetch interview list", error);
            }
        };

        if (jobDescriptionId) {
            fetchInterviews();
        }
    }, [jobDescriptionId]);

    const handleViewInterviewDetails = async (candidateId) => {
        try {
            const res = await axios.get(`http://${strings.localhost}/api/interview/byCandidate/${candidateId}`);
            setInterviewDetailsByCandidate(res.data || []);
            setShowInterviewPopup(true);
        } catch (error) {
            console.error("Failed to fetch interview details", error);
            showToast?.("Error fetching interview details", "error");
        }
    };

    const handleInterviewResult = (interviewId, passed) => {
        setInterviewResultData({ interviewId, passed });
        setNote("");
        setInterviewScore("");
        setShowResultPopup(true);
    };
    const validateScore = (score) => {
        const scoreValue = Number(score);
        if (!Number.isInteger(scoreValue) || scoreValue < 1 || scoreValue > 10) {
            return { isValid: false, value: null };
        }
        return { isValid: true, value: scoreValue };
    };

    const handleCheckboxChange = (candidate, index) => {
        const key = `${candidate.email}-${index}`;
        setSelectedCandidates((prev) => ({
            ...prev,
            [key]: prev[key] ? null : candidate,
        }));
    };

    const handleSaveSelected = async () => {
        const candidatesToSave = Object.values(selectedCandidates);
        console.log("candidatesToSave", candidatesToSave);

        if (candidatesToSave.length === 0) {
            showToast("No candidates selected!", "warning");
            return;
        }

        const candidatesWithShortlisted = candidatesToSave.map(candidate => ({
            id: candidate.id,
            selectedCandidate: true
        }));

        try {
            const response = await axios.put(
                `http://${strings.localhost}/api/candidate/updateMultiple`,
                candidatesWithShortlisted
            );
            showToast("Selected candidates saved successfully!", "success");
            setSelectedCandidates({});
            fetchCandidates();
        } catch (error) {
            console.error("Error saving selected candidates:", error);
            showToast("Failed to save selected candidates", "error");
        }
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
            await axios.post(`http://${strings.localhost}/api/interview-notes/save/${interviewId}`, {
                note,
                actionTakenByName,
                interviewScore: scoreValue
            });
            // Update result
            await axios.put(`http://${strings.localhost}/api/interview/updateResult/${interviewId}?passed=${passed}`);

            showToast?.(`Interview marked as ${passed ? "Passed" : "Failed"} with notes`, "success");
            setShowResultPopup(false);
            fetchInterviews();
        } catch (error) {
            console.error("Error saving result/note", error);
        }
    };

    const handleViewInterviewData = async (interviewId) => {
        try {
            const [interviewRes, notesRes] = await Promise.all([
                axios.get(`http://${strings.localhost}/api/interview/${interviewId}`),
                axios.get(`http://${strings.localhost}/api/interview-notes/get-by-schedule/${interviewId}`)
            ]);
            setInterviewData([interviewRes.data]);
            setInterviewNotes(notesRes.data || []);
            setShowInterviewDataPopup(true);
        } catch (error) {
            console.error("Failed to fetch interview or notes", error);
            showToast?.("Error fetching interview or notes", "error");
        }
    };

    const handleSelectCandidate = (candidate) => {
        setSelectedCandidate(candidate);
    };

    const handleCloseDetailPopup = () => {
        setSelectedCandidate(null);
    };

    const editdropdown = (candidate) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button
                        type='button'
                        onClick={() => navigate(`/InterviewCalendar/${jobDescriptionId}/${candidate.id}`)}
                    >
                        Schedule Interview
                    </button>
                </div>
                <div>
                    <button onClick={() => handleViewInterviewDetails(candidate.id)}>
                        View
                    </button>
                </div>
            </div>
        </div>
    )

    const editdropdownInterview = (interview) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button
                        onClick={() => {
                            if (interview.interviewComplitionStatus) {
                                showToast?.("This interview result is already submitted.", "info");
                            } else {
                                handleInterviewResult(interview.id, true);
                            }
                        }}
                    >
                        Pass
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => {
                            if (interview.interviewComplitionStatus) {
                                showToast?.("This interview result is already submitted.", "info");
                            } else {
                                handleInterviewResult(interview.id, false);
                            }
                        }}
                    >
                        Fail
                    </button>
                </div>
                <div>
                    <button onClick={() => handleViewInterviewData(interview.id)}>
                        View
                    </button>
                </div>
            </div>
        </div>
    )

    const isInterviewResultPending = (candidateId) => {
        return interviewList.some(interview =>
            interview.candidateRegistration?.id === candidateId &&
            !interview.interviewComplitionStatus
        );
    };
    const hasAnyInterview = (candidateId) => {
        return interviewList.some(interview => interview.candidateRegistration?.id === candidateId);
    };

    return (
        <div className="interview-tables">
            <div className="candidate-table-container">
                {candidates.length === 0 ? (
                    <p className="error-message">No candidates found.</p>
                ) : (
                    <table className="interview-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Qualification</th>
                                <th>Experience</th>
                                <th>Action</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((candidate, index) => {
                                const getInitials = (name) => name ? name[0].toUpperCase() : '';
                                const key = `${candidate.email}-${index}`;
                                return (
                                    <tr key={key}>
                                        <td className="Ravatar" onClick={() => handleSelectCandidate(candidate)} style={{ cursor: 'pointer' }}>
                                            {getInitials(candidate.firstName)}
                                        </td>
                                        <td>{`${candidate.firstName} ${candidate.lastName}`}</td>
                                        <td>{candidate.email || "NA"}</td>
                                        <td>{candidate.highestQualification || "NA"}</td>
                                        <td>{candidate.yearsOfExperience || "NA"}</td>
                                        <td>{editdropdown(candidate)}</td>
                                        <td>
                                            {!hasAnyInterview(candidate.id) ? (
                                                <span className="no-data">Not interviewed</span>
                                            ) : isInterviewResultPending(candidate.id) ? (
                                                <span className="no-data">Awaiting result</span>
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedCandidates[key]}
                                                    onChange={() => handleCheckboxChange(candidate, index)}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
                {Object.keys(selectedCandidates).filter(key => selectedCandidates[key]).length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <button className="btn" onClick={handleSaveSelected}>Save Selected Candidates</button>
                    </div>
                )}
            </div>
            <div className="scheduled-table-container">
                {interviewList.length === 0 ? (
                    <p className="error-message">No interviews scheduled yet.</p>
                ) : (
                    <table className="interview-table small-table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Action</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interviewList.map((interview, index) => (
                                <tr key={index}>
                                    <td>{`${interview?.candidateRegistration?.firstName} ${interview?.candidateRegistration?.lastName}`}</td>
                                    <td>{interview.interviewDate || "NA"}</td>
                                    <td>{interview.interviewTime || ""}</td>
                                    <td>{editdropdownInterview(interview)}</td>
                                    <td>
                                        <span
                                            className={`status-confirmationBadge ${interview?.interviewComplitionStatus
                                                ? interview?.interviewResult
                                                    ? "confirmed"
                                                    : "terminated"
                                                : "pending"
                                                }`}
                                        >
                                            {interview?.interviewComplitionStatus
                                                ? interview?.interviewResult
                                                    ? "Passed"
                                                    : "Failed"
                                                : "Pending"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {showInterviewPopup && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: "600px" }}>
                        <h3 className="centerText">Interview Details</h3>

                        {interviewDetailsByCandidate.length === 0 ? (
                            <p className="error-message">No interviews found for this candidate.</p>
                        ) : (
                            <>
                                <div>
                                    <p><strong>1. Candidate Name:</strong> {`${interviewDetailsByCandidate[0]?.candidateRegistration?.firstName || ''} ${interviewDetailsByCandidate[0]?.candidateRegistration?.middelName || ''} ${interviewDetailsByCandidate[0]?.candidateRegistration?.lastName || ''}`}</p>
                                    <p><strong>2. Email:</strong> {interviewDetailsByCandidate[0]?.candidateRegistration?.email || 'NA'}</p>
                                </div>
                                <hr />
                                <ul>
                                    {interviewDetailsByCandidate.map((interview, index) => (
                                        <li key={index} style={{ marginBottom: "10px" }}>
                                            <p><strong>Title:</strong> {interview.interviewTitle || 'NA'}</p>
                                            <p><strong>Date:</strong> {interview.interviewDate || 'NA'}</p>
                                            <p><strong>Time:</strong> {interview.interviewTime || 'NA'}</p>
                                            <p><strong>Mode:</strong> {interview.interviewMode ? "Virtual" : "Face to Face"}</p>
                                            <p><strong>Description:</strong> {interview.interviewDescription || 'NA'}</p>

                                            <p><strong> Status:</strong>{interview?.interviewComplitionStatus ? interview?.interviewResult ? "Passed" : "Failed" : "Pending"}
                                            </p>
                                            <hr />
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        <div className="form-controls">
                            <button className="outline-btn" onClick={() => setShowInterviewPopup(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {showInterviewDataPopup && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: "600px" }}>
                        <h3 className="centerText">Interview Details</h3>

                        {interviewData.length === 0 ? (
                            <p className="error-message">No interview details found.</p>
                        ) : (
                            <>
                                <div>
                                    <p><strong>1. Candidate Name:</strong> {`${interviewData[0]?.candidateRegistration?.firstName || ''} ${interviewData[0]?.candidateRegistration?.middelName || ''} ${interviewData[0]?.candidateRegistration?.lastName || ''}`}</p>
                                    <p><strong>2. Email:</strong> {interviewData[0]?.candidateRegistration?.email || 'NA'}</p>
                                </div>
                                <hr />
                                <ul>
                                    {interviewData.map((interview, index) => (
                                        <li key={index} style={{ marginBottom: "10px" }}>
                                            <p><strong>Title:</strong> {interview.interviewTitle || 'NA'}</p>
                                            <p><strong>Date:</strong> {interview.interviewDate || 'NA'}</p>
                                            <p><strong>Time:</strong> {interview.interviewTime || 'NA'}</p>
                                            <p><strong>Mode:</strong> {interview.interviewMode ? "Virtual" : "Face to Face"}</p>
                                            <p><strong>Description:</strong> {interview.interviewDescription || 'NA'}</p>
                                            <p><strong>Status:</strong> {interview.interviewComplitionStatus ? interview.interviewResult ? "Passed" : "Failed" : "Pending"}</p>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        <hr />
                        <h4 className="centerText">Interview Notes</h4>
                        {interviewNotes.length === 0 ? (
                            <p className="error-message">No notes found for this interview.</p>
                        ) : (
                            <ul>
                                {interviewNotes.map((note, idx) => (
                                    <li key={idx}>
                                        <p><strong>Note:</strong> {note.note}</p>
                                        <p><strong>Score:</strong> {note.interviewScore}</p>
                                        <p><strong>Action Taken By:</strong> {note.actionTakenByName}</p>
                                        <hr />
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="form-controls">
                            <button className="outline-btn" onClick={() => setShowInterviewDataPopup(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

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
            {selectedCandidate && (
                <div className="add-popup">
                    <h3 className='centerText'>Candidate Details</h3>
                    <div>
                        <div><strong> Name:  </strong>{`${selectedCandidate.firstName} ${selectedCandidate.middelName} ${selectedCandidate.lastName}`}</div>
                        <br />
                        <div><strong>Email: </strong>{selectedCandidate.email}</div>  <br />
                        <div><strong>Phone Number: </strong>{selectedCandidate.phoneNumber}</div>  <br />
                        <div><strong>Highest Qualification: </strong>{selectedCandidate.highestQualification}</div>  <br />
                        <div><strong>Years of Experience: </strong>{selectedCandidate.yearsOfExperience}</div>  <br />
                        <div><strong>Skills: </strong>{selectedCandidate.skills}</div>  <br />
                        <div><strong>Job Title: </strong>{selectedCandidate.jobTitle}</div>  <br />
                        <div className='btnContainer'>
                            <button className="outline-btn" onClick={handleCloseDetailPopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default InterviewedCandidate;
