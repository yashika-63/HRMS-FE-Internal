import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { showToast } from '../../Api.jsx';
import { strings } from "../../string.jsx";
 
const ShortlistedCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedCandidates, setSelectedCandidates] = useState({});
    const [jobDescription, setJobDescription] = useState(null);
 
    const companyId = localStorage.getItem("companyId");
    const [showShortlistPopup, setShowShortlistPopup] = useState(false);
    const [shortlistCount, setShortlistCount] = useState('');
    const [shortlistedResponse, setShortlistedResponse] = useState([]);
 
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
                    finalizedForInterview: false,
                    selectedCandidate: false,
                }
            });
 
            const data = res.data || [];
 
            if (data.length > 0 && data[0].jobDescription) {
                const { jobDesc, jobTitle, requiredSkills, requiredExperience } = data[0].jobDescription;
                const jobDescriptionString = `Looking for a ${jobTitle} with ${requiredSkills} and at least ${requiredExperience} years experience. ${jobDesc}`;
                setJobDescription(jobDescriptionString); // ✅ set plain string
            } else {
                setJobDescription(null);
            }
 
            // Normalize candidate list for table display
            const normalized = data.map(candidate => ({
                id: candidate.id,
                firstName: candidate.firstName || 'NA',
                middelName: candidate.middelName || 'NA',
                lastName: candidate.lastName || 'NA',
                email: candidate.email || 'NA',
                phoneNumber: candidate.phoneNumber || 'NA',
                highestQualification: candidate.highestQualification || 'NA',
                yearsOfExperience: candidate.yearsOfExperience || 'NA',
                skills: candidate.skills || 'NA',
                jobTitle: candidate.jobTitle || 'NA'
            }));
 
            setCandidates(normalized);
        } catch (error) {
            console.error("Error fetching candidates:", error);
            showToast("Failed to load candidates", "error");
        }
    };
 
    const saveShortlistedCandidates = async (candidates) => {
        const candidatesWithShortlisted = candidates.map(candidate => ({
            id: candidate.id,
            finalizedForInterview: true
        }));
 
        try {
            const response = await axios.put(
                `http://${strings.localhost}/api/candidate/updateMultiple`,
                candidatesWithShortlisted
            );
            if (response.data) {
                showToast("Selected candidates saved successfully!", "success");
                setShortlistedResponse([]); // Clear the shortlisted candidates after saving
                fetchCandidates(); // Reload the candidates list
            } else {
                showToast("Failed to save selected candidates", "error");
            }
        } catch (error) {
            console.error("Error saving shortlisted candidates:", error);
            showToast("Failed to save selected candidates", "error");
        }
    };
 
 
 
    const handleShortlistCandidates = async () => {
        if (!shortlistCount || isNaN(shortlistCount) || shortlistCount <= 0) {
            showToast("Please enter a valid number of candidates.", "warning");
            return;
        }
 
        if (!jobDescription) {
            showToast("Job description not loaded. Please refresh and try again.", "error");
            return;
        }
 
        try {
            const response = await axios.post(`http://${strings.localhost}/api/ai/shortlist-candidates`, {
                topN: parseInt(shortlistCount),
                candidates: candidates,           // normalized data
                requirement: jobDescription       // full jobDescription object
            });
 
            if (response.data && Array.isArray(response.data)) {
                setShortlistedResponse(response.data);
                showToast("Shortlisted candidates successfully!", "success");
                fetchCandidates(); // refresh
            } else {
                showToast("Unexpected response from server", "error");
            }
 
            setShortlistCount('');
        } catch (error) {
            console.error("Error shortlisting candidates:", error);
            showToast("Failed to shortlist candidates", "error");
        }
    };
 
 
 
 
 
 
 
 
 
    useEffect(() => {
        fetchCandidates();
    }, [jobDescriptionId]);
 
    const handleCheckboxChange = (candidate, index) => {
        const key = `${candidate.email}-${index}`;
        setSelectedCandidates((prev) => ({
            ...prev,
            [key]: prev[key] ? null : candidate,
        }));
    };
    const handleSaveSelected = async () => {
        const candidatesToSave = Object.values(selectedCandidates);
 
        if (candidatesToSave.length === 0) {
            showToast("No candidates selected!", "warning");
            return;
        }
 
        const candidatesWithShortlisted = candidatesToSave.map(candidate => ({
            id: candidate.id,
            finalizedForInterview: true
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
    const handleSelectCandidate = (candidate) => {
        setSelectedCandidate(candidate); // Set the selected candidate
    };
 
    const handleCloseDetailPopup = () => {
        setSelectedCandidate(null); // Close the detail popup
    };
 
 
    // const handleSaveSelected = async () => {
    //     const toSave = Object.values(selectedCandidates).filter(Boolean);
    //     if (toSave.length === 0) {
    //         showToast?.("No candidates selected!", "warning");
    //         return;
    //     }
 
    //     try {
    //         await axios.post(`http://${strings.localhost}/savecheckedcandidate/${companyId}`, toSave);
    //         showToast?.("Candidates saved successfully!", "success");
    //         setSelectedCandidates({});
    //     } catch (error) {
    //         console.error("Save error:", error);
    //         showToast?.("Error saving candidates", "error");
    //     }
    // };
 
    return (
        <div className="coreContainer">
            {candidates.length === 0 ? (
                <p className="error-message">No candidates found.</p>
            ) : (
                <table className="recruitment-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Experience</th>
                            <th>Skills</th>
                            <th>Job Title</th>
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
                                    <td>{`${candidate.firstName} ${candidate.middelName} ${candidate.lastName}`}</td>
                                    <td>{candidate.email || "NA"}</td>
                                    <td>{candidate.yearsOfExperience || "NA"}</td>
                                    <td>{candidate.skills || "NA"}</td>
                                    <td>{candidate.jobTitle || "NA"}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedCandidates[key]}
                                            onChange={() => handleCheckboxChange(candidate, index)}
                                        />
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
            <div className='form-controls'>
                <div>
                    <button className="ai-button" onClick={() => setShowShortlistPopup(true)}>
                        <span className="sparkle">✨</span>
                        AI Shortlist Candidates
                    </button>
                </div>
            </div>
 
            {showShortlistPopup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button type='button' className='close-btn' onClick={() => { setShowShortlistPopup(false) }}>X</button>
                        <h3 className='centerText'>Shortlist Candidates Using AI</h3>
                        <div className='row'>
                            <input
                                className="selectIM"
                                type="number"
                                placeholder="Number of candidates to shortlist"
                                value={shortlistCount}
                                onChange={(e) => setShortlistCount(e.target.value)}
                            />
                        </div>
                        <div className='btnContainer'>
                            <button className="ai-button" onClick={handleShortlistCandidates}>Shortlist</button>
                            <button className="outline-btn" onClick={() => {
                                setShowShortlistPopup(false);
                                setShortlistedResponse([]);
                                setShortlistCount('');
                            }}>Cancel</button>
                        </div>
 
                        {shortlistedResponse.length > 0 && (
                            <div>
                                <h4 className='underlineText'>Shortlisted Candidates:</h4>
                                <table className='interview-table'>
                                    <thead>
                                        <tr>
                                            <th>First Name</th>
                                            <th>Middle Name</th>
                                            <th>Last Name</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shortlistedResponse.map((candidate, index) => (
                                            <tr key={index}>
                                                <td> {candidate.firstName} </td>
                                                <td>{candidate.middelName}</td>
                                                <td>{candidate.lastName}</td>
                                                <td>{candidate.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className='form-controls'>
                            <button type='button' className="ai-button" onClick={() => saveShortlistedCandidates(shortlistedResponse)} >Shortlist</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
 
    );
};
 
export default ShortlistedCandidates;