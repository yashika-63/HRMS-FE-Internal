import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { showToast } from '../../Api.jsx';
import { strings } from "../../string.jsx";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Confirmedcandidate = () => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedCandidates, setSelectedCandidates] = useState({});
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [candidateToOnboard, setCandidateToOnboard] = useState(null);
    const [isLoading , setIsLoading] = useState ();
    const employeeId = localStorage.getItem("employeeId");
    const companyId = localStorage.getItem("companyId");
    const navigate = useNavigate();
    const { id } = useParams();
    const jobDescriptionId = id;


    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await axios.get(`http://${strings.localhost}/api/candidate/filter`, {
                    params: {
                        jobDescriptionId,
                        status: true,
                        shortListed: true,
                        finalizedForInterview: true,
                        selectedCandidate: true,
                    }
                });

                setCandidates(res.data || []);
            } catch (error) {
                console.error("Failed to fetch candidates", error);
            }
        };

        fetchCandidates();
    }, [jobDescriptionId]);

    const handleCheckboxChange = (candidate, index) => {
        const key = `${candidate.email}-${index}`;
        setSelectedCandidates((prev) => ({
            ...prev,
            [key]: prev[key] ? null : candidate,
        }));
    };


    const handleSelectCandidate = (candidate) => {
        setSelectedCandidate(candidate);
    };

    const handleCloseDetailPopup = () => {
        setSelectedCandidate(null);
    };

    const handleViewClick = (candidate) => {
        setCandidateToOnboard(candidate);
        setShowConfirmationPopup(true);
    };


    const handleSubmit = async (candidate) => {
        setIsLoading(true);
    
        const assignByFirstName = localStorage.getItem('firstName') || '';
        const assignByLastName = localStorage.getItem('lastName') || '';
        const payload = {
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            middelName : candidate.middelName,
            email: candidate.email,
            assignByFirstName,
            assignByLastName,
        };
    
        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/preregistration/save/${companyId}/${employeeId}`,
                payload
            );
    
            if (response.data) {
                showToast("Candidate successfully onboarded", "success");
                setShowConfirmationPopup(false); 
            }
        } catch (error) {
            console.error(error);
            showToast(error.response?.data || "An error occurred. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
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
                        onClick={() => handleViewClick(candidate)}
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    )

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
                            <th>Qualification</th>
                            <th>Experience</th>
                            <th>Skills</th>
                            <th>Action</th>
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
                                    <td>{candidate.skills || "NA"}</td>
                                    <td>
                                        {editdropdown(candidate)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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
            {showConfirmationPopup && candidateToOnboard && (
                <div className="add-popup">
                    <div className="popup-content">
                        <h3>Do you really want to onboard {candidateToOnboard.firstName}?</h3>
                        <div className="btnContainer">
                            <button
                                className="btn"
                                onClick={() => handleSubmit(candidateToOnboard)} 
                            >
                                Yes
                            </button>
                            <button
                                className="outline-btn"
                                onClick={() => setShowConfirmationPopup(false)} 
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Confirmedcandidate;
