import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import '../CommonCss/Recruitment.css';
import { strings } from "../../string";
import { useNavigate } from 'react-router-dom';

const JdList = ({ statusFilter }) => {
    const [jdList, setJdList] = useState([]);
    const [selectedJd, setSelectedJd] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const companyId = localStorage.getItem("companyId");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJds = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/jobdescription/get-by-company-and-status?companyId=${companyId}&status=${statusFilter}`);
                setJdList(response.data);
            } catch (error) {
                console.error("Failed to fetch job descriptions", error);
            }
        };

        fetchJds();
    }, [companyId, statusFilter]);


    const handleClosePopup = () => {
        setShowModal(false);
        setSelectedJd(null);
    };

    const handleOpenModal = (jd) => {
        setShowModal(true);
        setSelectedJd(jd)
    }
    const editdropdown = (jd) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button type='button' onClick={handleOpenModal} > View </button>
                </div>
                <div>
                    <button type="button" onClick={() => navigate(`/RecruitmentPortal/${jd.id}`)}> Registration</button>

                </div>
            </div>
        </div>
    )

    return (
        <div className="coreContainer">
            <h2 className="title">Job Requirement</h2>

            <div className="jd-grid-container">
                {jdList.map((jd) => (
                    <div
                        key={jd.id}
                        className="jd-card"
                        onClick={() => setSelectedJd(jd)}

                    >
                        <span className={`status-badge ${jd.status ? 'status-active' : 'status-inactive'}`}>
                            {jd.status ? 'Active' : 'Inactive'}
                        </span>


                        <h4 className="centerText">{jd.jobTitle}</h4>
                        {/* <div className="description">
                            {jd.jobDesc}
                        </div> */}
                        <div className="Top-right-corner">{editdropdown(jd)}</div>
                        <div>
                            <strong>Skills:</strong>
                            <ul>
                                {jd.requiredSkills
                                    .split(',')
                                    .slice(0, 6) 
                                    .map((skill, index) => (
                                        <li key={index}>{skill.trim()}</li>
                                    ))
                                }
                                {jd.requiredSkills.split(',').length > 6 && <li>...</li>}
                            </ul>
                        </div>


                        <div className="card-footer">
                            <div><strong>Jd Link :</strong> <a href={jd.jdLink} target="_blank" rel="noopener noreferrer">{jd.jdLink}</a></div>
                            <div><strong>Experience:</strong> {jd.requiredExperience}</div>
                            <div><strong>Date:</strong> {jd.date}</div>
                        </div>

                    </div>
                ))}
            </div>


            {showModal && selectedJd && (
                <div className="add-popup">
                    <div className="popup-content">
                        <div>
                            <p className="centerText"><strong>Company:</strong> {selectedJd.company?.companyName} ({selectedJd.company?.companyType})</p>
                            <h2 className="centerText">{selectedJd.jobTitle}</h2>

                            <div className="Jddescription"><strong>Description:</strong> {selectedJd.jobDesc} </div>
                            <p><strong>Expected Skills :</strong> {selectedJd.requiredSkills}</p>
                            <p><strong>Expected Experience :</strong> {selectedJd.requiredExperience}</p>
                            <p><strong>Created By:</strong> {selectedJd.createdBy}</p>
                            <p><strong>Date:</strong> {selectedJd.date}</p>
                        </div>
                        <div className="btnContainer">
                            <button className="outline-btn" onClick={handleClosePopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default JdList;
