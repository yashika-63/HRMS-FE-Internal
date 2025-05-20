import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaTicketAlt, FaTimes, FaUserAlt, FaUserCircle } from "react-icons/fa";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '../Components/CommonCss/PreRegistraion.css';

const PreTopBar = () => {
  const [isHomeActive, setIsHomeActive] = useState(false);
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const email = localStorage.getItem('email');
  const name = localStorage.getItem('name');
  const modalRef = useRef(null);
  const navigate = useNavigate();

  const handleHomeClick = () => {
    setIsHomeActive(true);
    setIsLoginActive(false);
    navigate("/CandidatePortal");
  };

  const handleLoginClick = () => {
    setIsLoginActive(true);
    setIsHomeActive(false);
    navigate("/PreLogin");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/PreLogin');
  };

  const handleProfileIconClick = () => {
    fetchEmployeeDetails();
    setProfileModalOpen(!profileModalOpen);
  };

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setProfileModalOpen(false);
    }
  };

  const handlePersonalDetailsClick = () => {
    navigate("/PersonalDetails"); 
  };

  const handleTicketClick = () => {
    navigate("/Tickets"); 
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="topBar">
      <div className="center">
        <div className="icon-container">
          <FaHome onClick={handleHomeClick} className='homeIcon' />
          <div className="offertooltip">Go to Home</div>
        </div>
        
        {/* <div className="icon-container">
          <FaUserAlt className="personalDetailsIcon" onClick={handlePersonalDetailsClick} />
          <div className="offertooltip">Personal Details</div>
        </div> */}
        <div className="icon-container">
          <FaTicketAlt className="personalDetailsIcon" onClick={handleTicketClick} />
          <div className="offertooltip">View Tickets</div>
        </div>
      </div>

      <div className="topbarIconList">
        <div className="welcomemessage">Welcome {name}</div>
      </div>
      <div className="navbar-container" style={{ height: '30px', marginLeft: '-130px' }}>
        <div className="profile-icon" onClick={() => setProfileModalOpen(true)}>
          <FaUserCircle size={30} />
        </div>
      </div>
      <div className="profile-container">
        {profileModalOpen && (
          <div className="profile-modal" ref={modalRef}>
            <div className="profile-header" style={{ position: 'relative' }}>
              <h2>Profile</h2>
              <FaTimes
                size={20}
                onClick={() => setProfileModalOpen(false)}
                style={{ cursor: 'pointer', color: 'black', position: 'absolute', top: '10px', right: '10px' }}
              />
            </div>
            {localStorage.getItem('employeeData') ? (
              <div className="profile-details">
                <div className="profile-photo">
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    photo ? (
                      <img
                        src={photo}
                        alt="Profile"
                        className="profile-img"
                        style={{ cursor: 'pointer' }}
                        onClick={() => document.getElementById('file-upload').click()}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                        <FaUserCircle
                          size={50}
                          style={{ cursor: 'pointer' }}
                          onClick={() => document.getElementById('file-upload').click()}
                          aria-placeholder="Add photo"
                        />
                        <p style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>Add profile picture</p>
                      </div>
                    )
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileSelection}
                  />
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: 'black' }}><strong>Email:</strong> {email}</p>
                <p style={{ color: 'black' }}><strong>Name:</strong> {name}</p>
                <div
                  className="underlineText"
                  style={{ marginLeft: '130px', cursor: 'pointer', color: 'red', marginTop: '20px' }}
                  onClick={() => {
                    setProfileModalOpen(false);
                    handleLogout();
                  }}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '8px' }} />
                  <strong>LOGOUT</strong>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreTopBar;
