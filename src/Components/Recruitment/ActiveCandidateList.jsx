import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../../Api.jsx';
import { strings } from '../../string.jsx';
import CandidateRegistration from './CandidateRegistration.jsx';

const ActiveCandidateList = () => {
    const { id } = useParams();
    const companyId = localStorage.getItem("companyId");
    const jobDescriptionId = id;
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedCandidates, setSelectedCandidates] = useState({});
    const [jobDescription, setJobDescription] = useState(null);
    const [shortlistedResponse, setShortlistedResponse] = useState([]);
    const [showShortlistPopup, setShowShortlistPopup] = useState(false);
    const [shortlistCount, setShortlistCount] = useState('');

    const [showRegisterPopup, setShowRegisterPopup] = useState(false);


    const handleShortlistCandidates = async () => {
        if (!shortlistCount || isNaN(shortlistCount) || shortlistCount <= 0) {
            showToast("Please enter a valid number of candidates.", "warning");
            return;
        }

        try {
            const response = await axios.post(`http://${strings.localhost}/api/ai/shortlist-candidates`, {
                // jobDescriptionId,
                // companyId,
                topN: parseInt(shortlistCount),
                candidates: candidates, // send normalized candidates as formData
                requirement: jobDescription // send jobDescription of first entry

            });

            if (response.data && Array.isArray(response.data)) {
                setShortlistedResponse(response.data);
                showToast("Shortlisted candidates successfully!", "success");
                fetchCandidates(); // reload the list
            } else {
                showToast("Unexpected response from server", "error");
            }

            setShortlistCount('');
        } catch (error) {
            console.error("Error shortlisting candidates:", error);
            showToast("Failed to shortlist candidates", "error");
        }
    };

    // Fetch candidates from API
    const fetchCandidates = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/candidate/filter`, {
                params: {
                    jobDescriptionId,
                    status: true,
                    shortListed: false,
                    finalizedForInterview: false,
                    selectedCandidate: false
                }
            });

            const data = response.data;

            if (data.length > 0 && data[0].jobDescription) {
                const { jobDesc, jobTitle, requiredSkills, requiredExperience } = data[0].jobDescription;

                const jobDescriptionString = `Looking for a ${jobTitle} with ${requiredSkills} and at least ${requiredExperience} years experience. ${jobDesc}`;

                setJobDescription(jobDescriptionString);
            }



            // Normalize fields with fallback 'NA' if missing
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

    // Select/Deselect all candidates
    const handleToggleSelectAll = () => {
        const allSelected = Object.keys(selectedCandidates).length === candidates.length;

        if (allSelected) {
            setSelectedCandidates({});
        } else {
            const all = {};
            candidates.forEach((row, index) => {
                const key = `${row.email}-cand-${index}`;
                all[key] = row;
            });
            setSelectedCandidates(all);
        }
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
            shortListed: true
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

    const saveShortlistedCandidates = async (candidates) => {
        const candidatesWithShortlisted = candidates.map(candidate => ({
            id: candidate.id,
            shortListed: true
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



    const closeRegisterPopup = () => {
        setShowRegisterPopup(false);
        fetchCandidates(); // Refresh candidates after registration
    };

    // Fetch candidates on mount
    useEffect(() => {
        fetchCandidates();
    }, [jobDescriptionId]);


    const handleSelectCandidate = (candidate) => {
        setSelectedCandidate(candidate); // Set the selected candidate
    };

    const handleCloseDetailPopup = () => {
        setSelectedCandidate(null); // Close the detail popup
    };

    return (
        <div className="coreContainer">
            <div className="form-controls">
                <button className="btn" onClick={() => setShowRegisterPopup(true)}>
                    Register Candidate
                </button>
            </div>
            <div class="table-wrapper">
                {candidates.length > 0 && (
                    <table className='recruitment-table'>
                        <thead>
                            <tr>

                                <th></th>
                                {['Name', 'Email', 'Mobile Number', 'Highest Qualification'].map((column, index) => (
                                    <th key={index}>{column}</th>
                                ))}
                                <th>Select</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((row, index) => {
                                const candidateKey = `${row.email}-cand-${index}`;
                                const getInitials = (name) => name ? name[0].toUpperCase() : '';
                                const fullName = `${row.firstName} ${row.middelName} ${row.lastName}`;
                                return (
                                    <tr key={candidateKey}>


                                        <td className="Ravatar" onClick={() => handleSelectCandidate(row)} style={{ cursor: 'pointer' }}>
                                            {getInitials(row.firstName)}
                                        </td>
                                        <td onClick={() => handleSelectCandidate(row)} style={{ cursor: 'pointer' }}>{fullName}</td>
                                        {['email', 'phoneNumber', 'highestQualification'].map((fieldKey, i) => (
                                            <td key={i}>{row[fieldKey]}</td>
                                        ))}
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={!!selectedCandidates[candidateKey]}
                                                onChange={() =>
                                                    setSelectedCandidates(prev => ({
                                                        ...prev,
                                                        [candidateKey]: prev[candidateKey] ? null : row
                                                    }))
                                                }
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            {candidates.length > 0 && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button className="btn" onClick={handleSaveSelected} disabled={Object.keys(selectedCandidates).length === 0}>
                        Save Selected Candidates
                    </button>
                    <button className="outline-btn" onClick={handleToggleSelectAll}>
                        {Object.keys(selectedCandidates).length === candidates.length ? "Deselect All" : "Select All"}
                    </button>
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

            {showShortlistPopup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button type='button' className='close-btn' onClick={() => { setShowShortlistPopup(false) }}>X</button>
                        <h3 className='centerText'>Shortlist Candidates Using AI</h3>
                        <div className='row'>
                            <input
                                className='selectIM'
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
            {showRegisterPopup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            className="close-btn"
                            onClick={closeRegisterPopup}
                        >
                            X
                        </button>
                        <CandidateRegistration onClose={closeRegisterPopup} />
                    </div>
                </div>
            )}
        </div>
    );
};
export default ActiveCandidateList;