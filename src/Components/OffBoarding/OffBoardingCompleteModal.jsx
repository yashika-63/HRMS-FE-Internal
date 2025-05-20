import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import { strings } from '../../string';
const OffboardingCompleteModal = ({ record, onClose, onComplete }) => {
  if (!record) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [showHandoverDetails, setShowHandoverDetails] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assets, setAssets] = useState(record.assets || []);
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const employeeName = `${firstName} ${lastName}`;
  console.log("record", record);
  const isAlreadyCompleted = record.completionStatus;

  useEffect(() => {
    const fetchData = async () => {
      if (selectedHandover && showHandoverDetails) {
        setLoadingDocuments(true);
        try {
          const docsResponse = await axios.get(`http://${strings.localhost}/api/KnowledgeDocument/DocumentTraining/${selectedHandover.id}`);
          setDocuments(docsResponse.data);
        } catch (error) {
          console.error('Error fetching documents:', error);
          setDocuments([]);
        } finally {
          setLoadingDocuments(false);
        }

        setLoadingNotes(true);
        try {
          const notesResponse = await axios.get(`http://${strings.localhost}/api/kt-notes/${selectedHandover.id}`);
          console.log('Notes API response:', notesResponse.data);
          setNotes(Array.isArray(notesResponse.data) ? notesResponse.data : [notesResponse.data]);
        } catch (error) {
          console.error('Error fetching notes:', error);
          setNotes([]);
        } finally {
          setLoadingNotes(false);
        }

        setLoadingAssets(true);
        try {
          const assetResponse = await axios.get(`http://${strings.localhost}/api/asset/getByEmployee/${employeeId}`);
          console.log('Assets API response:', assetResponse.data);
          setAssets(Array.isArray(assetResponse.data) ? assetResponse.data : [assetResponse.data]);
        } catch (error) {
          console.error('Error fetching assets:', error);
          setAssets([]);
        } finally {
          setLoadingAssets(false);
        }
      }
    };

    fetchData();
  }, [selectedHandover, showHandoverDetails]);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(record.id);
      onClose();
    } catch (error) {
      console.error('Error completing offboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleView = (handover) => {
    setSelectedHandover(handover);
    setShowHandoverDetails(true);
    setOpenDropdownId(null);
    setDocuments([]);
    setNotes([]);
  };

  const handleAssetReturn = async (assetId, isReturned) => {
    try {
      const response = await axios.put(
        `http://${strings.localhost}/api/asset/updateAssetAction/${assetId}?actiontakenBy=${employeeName}`
      );
      toast.success(response.data);
      setAssets(prevAssets =>
        prevAssets.map(asset =>
          asset.id === assetId ? { ...asset, returned: isReturned } : asset
        )
      );
    } catch (error) {
      const errorMessage =
        error.response?.data || 'Failed to update asset status';
      toast.error(errorMessage);
      console.error('Error updating asset:', error);
    }
  };


  const editDropdownMenu = (handover, index) => (
    <div className="dropdown">
      <button
        type='button'
        className="dots-button"
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown(`handover-${index}`);
        }}
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      <div
        className="dropdown-content"
        style={{ display: openDropdownId === `handover-${index}` ? 'block' : 'none' }}
      >
        <button
          className="dropdown-item"
          style={{ display: 'flex', alignItems: 'center' }}
          onClick={() => handleView(handover)}
        >
          <FaEye style={{ marginRight: '8px' }} /> View Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Complete Offboarding Process</h2>
          <button className="button-close" onClick={onClose}>×</button>
        </div>

        <div className="view-modal-content">
          {/* Basic Information Section */}
          <div className="detail-section">
            <h3 className='underlineText'>Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Employee Name:</label>
                <span>{record.employeeName || record.name || '-'}</span>
              </div>
              <div className="detail-item">
                <label>Department:</label>
                <span>{record.department || '-'}</span>
              </div>
              <div className="detail-item">
                <label>Employee ID:</label>
                <span>{record.offboarding?.employee?.employeeId || '-'}</span>
              </div>
              <div className="detail-item">
                <label>Last Working Date:</label>
                <span>{moment(record.lastDate || record.lastWorkingDate).format('MMMM D, YYYY')}</span>
              </div>
              <div className="detail-item">
                <label>Offboarding Reason:</label>
                <span>{record.offboarding?.reason || '-'}</span>
              </div>
              <div className="detail-item">
                <label>Other Reason:</label>
                <span>{record.offboarding?.other || '-'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className='underlineText'>Knowledge Transfer & Handover</h3>
            <table className="interview-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Responsible Person</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ width: "5%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {record.handovers.map((handover, index) => (
                  <tr key={index}>
                    <td>{handover.title}</td>
                    <td>{handover.employee?.firstName} {handover.employee?.lastName}</td>
                    <td>{handover.description}</td>
                    <td>
                      <span className={`green-text ${handover.completionStatus ? 'green-text' : 'orange-text'}`}>
                        {handover.completionStatus ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {editDropdownMenu(handover, index)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="detail-section">
            <h3 className="underlineText">Exit Interview</h3>
            {record.exitInterview && record.exitInterview.length > 0 ? (
              record.exitInterview.map((interview, idx) => (
                <div key={idx} className="detail-grid">
                  <div className="detail-item">
                    <label>Interview Date:</label>
                    <span>{moment(interview.interviewDate).format('MMMM D, YYYY') || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Conducted By:</label>
                    <span>{interview.supervisorName || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Employee Title:</label>
                    <span>{interview.title || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Length of Service:</label>
                    <span>{interview.lengthOfService ? `${interview.lengthOfService} years` : '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Primary Reason for Leaving:</label>
                    <span>{interview.reason ||  '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Supervisor Name:</label>
                    <span>{interview.supervisorName || 'N/A'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">Exit interview not conducted</div>
            )}
          </div>


          <div className="detail-section">
            <h3 className='underlineText'>Assets</h3>
            {assets && assets.length > 0 ? (
              <div className="assets-grid">
                {assets.map((asset, index) => (
                  <div key={index} className="asset-item">
                    <div className="asset-name">{asset.lable || `Asset ${index + 1}`}</div>
                    <div className="asset-checkbox">
                      <input
                        type="checkbox"
                        checked={asset.returned || false}
                        onChange={(e) => handleAssetReturn(asset.id, e.target.checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No assets assigned</div>
            )}
          </div>

          <div className="modal-footer">
            <button className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn"
              onClick={handleComplete}
              disabled={isSubmitting || isAlreadyCompleted}
            >
              {isAlreadyCompleted ? 'Already Completed' : isSubmitting ? 'Completing...' : 'Mark as Complete'}
            </button>
          </div>
        </div>
      </div>

      {/* Handover Details Popup */}
      {showHandoverDetails && selectedHandover && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Handover Details: {selectedHandover.title}</h2>
              <button className="button-close" onClick={() => setShowHandoverDetails(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className='detail-item'>
                  <label>Title:</label>
                  <span>{selectedHandover.title}</span>
                </div>
                <div className='detail-item'>
                  <label>Responsible Person:</label>
                  <span>{selectedHandover.employee?.firstName} {selectedHandover.employee?.lastName}</span>
                </div>
                <div className='detail-item'>
                  <label>Status:</label>
                  <span className={selectedHandover.completionStatus ? 'green-text' : 'orange-text'}>
                    {selectedHandover.completionStatus ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <div className='detail-item full-width'>
                  <label>Description:</label>
                  <span>{selectedHandover.description}</span>
                </div>
              </div>

              <div className="section-divider">
                <h3>Documents</h3>
                {loadingDocuments ? (
                  <p>Loading documents...</p>
                ) : documents.length > 0 ? (
                  <div className="document-list">
                    {documents.map((doc, index) => (
                      <div key={index} className="document-item">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="document-link"
                        >
                          {doc.fileName || `Document ${index + 1}`}
                        </a>
                        {doc.description && <p className="document-description">{doc.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No documents available</p>
                )}

                {selectedHandover.documents?.length > 0 && (
                  <>
                    <h4>Attached Handover Documents</h4>
                    <div className="document-list">
                      {selectedHandover.documents.map((doc, index) => (
                        <div key={`handover-doc-${index}`} className="document-item">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="document-link"
                          >
                            {doc.fileName || `Handover Document ${index + 1}`}
                          </a>
                          {doc.description && <p className="document-description">{doc.description}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="section-divider">
                <h3>Knowledge Transfer Notes</h3>
                {loadingNotes ? (
                  <p>Loading notes...</p>
                ) : notes.length > 0 ? (
                  <div className="notes-list">
                    {notes.map((note, index) => (
                      <div key={`api-note-${index}`} className="note-item">
                        <div className="note-content">
                          {note.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No knowledge transfer notes available</p>
                )}

                {selectedHandover.notes?.length > 0 && (
                  <>
                    <h4>Additional Notes</h4>
                    <div className="notes-list">
                      {selectedHandover.notes.map((note, index) => (
                        <div key={`handover-note-${index}`} className="note-item">
                          <div className="note-content">
                            {note.notes || note.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="outline-btn"
                onClick={() => setShowHandoverDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffboardingCompleteModal;