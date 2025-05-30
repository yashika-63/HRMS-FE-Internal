import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaEye } from 'react-icons/fa';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { strings } from '../../string';

const OffboardingViewModal = ({ record, onClose }) => {
  if (!record) return null;

  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [showHandoverDetails, setShowHandoverDetails] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assets, setAssets] = useState([]);

  const employeeId = record.employeeId;
console.log("RECORDVIEW" , record);
  useEffect(() => {
    const fetchAssets = async () => {
      if (employeeId) {
        setLoadingAssets(true);
        try {
          const assetResponse = await axios.get(`http://${strings.localhost}/api/asset/getByEmployee/${employeeId}`);
          console.log('Assets API response:', assetResponse.data);
          setAssets(Array.isArray(assetResponse.data) ? assetResponse.data : [assetResponse.data]);
        } catch (error) {
          toast.error('Error fetching assets:', error);
          setAssets([]);
        } finally {
          setLoadingAssets(false);
        }
      }
    };

    fetchAssets();
  }, [employeeId]);

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
      }
    };

    fetchData();
  }, [selectedHandover, showHandoverDetails]);

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

  const booleanToYesNo = (value) => ({
    text: value ? "Submitted" : "Not submitted",
    className: value ? "green-text" : "orange-text"
  });

  return (
    <div className="modal-overlay">
<<<<<<< HEAD
      <div className="modal">
=======
      <div className="modal" style={{ maxWidth: '900px' }}>
>>>>>>> 8a5f66f (merging code)
        <div className="modal-header">
          <h2>Offboarding Details</h2>
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
                <span>{record.employeeId || '-'}</span>
              </div>
              <div className="detail-item">
                <label>Last Working Date:</label>
                <span>{moment(record.lastDate || record.lastWorkingDate).format('MMMM D, YYYY')}</span>
              </div>
              <div className="detail-item">
                <label>Offboarding Reason:</label>
                <span>{record.reason || '-'}</span>
              </div>
              <div className="detail-item">
                <label>Other Reason:</label>
                <span>{record.other || '-'}</span>
              </div>
            </div>
          </div>

          {/* Handover Section */}
          <div className="detail-section">
            <h3 className='underlineText'>Knowledge Transfer & Handover</h3>
            {record.handovers && record.handovers.length > 0 ? (
              <div>
                <table className="goal-table">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Title</th>
                      <th>Responsible Person</th>
                      <th>Description</th>
                      <th>Completion Status</th>
                      <th style={{ width: "5%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.handovers.map((handover, index) => (
                      <tr key={handover.id || index}>
                        <td>{index + 1}</td>
                        <td>{handover.title || '-'}</td>
                        <td>
                          {handover.employee ?
                            `${handover.employee?.firstName} ${handover.employee?.lastName || ''}` :
                            (handover.responsiblePerson || '-')}
                        </td>
                        <td>{handover.description || '-'}</td>
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
            ) : (
<<<<<<< HEAD
              <div className="no-data">No handover records found</div>
=======
              <div className="no-data1">No handover records found</div>
>>>>>>> 8a5f66f (merging code)
            )}
          </div>

          {/* Exit Interview Section */}
      
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
<<<<<<< HEAD
                    <div className="no-data">Exit interview not conducted</div>
=======
                    <div className="no-data1">Exit interview not conducted</div>
>>>>>>> 8a5f66f (merging code)
                  )}
                </div>

          {/*Assets data*/}
          <div className="detail-section">
            <h3 className='underlineText'>Assets</h3>
            {loadingAssets ? (
<<<<<<< HEAD
              <div className="no-data">Loading assets...</div>
=======
              <div className="no-data1">Loading assets...</div>
>>>>>>> 8a5f66f (merging code)
            ) : assets && assets.length > 0 ? (
              <div className="assets-grid">
                {assets.map((asset, index) => {
                  const submissionStatus = booleanToYesNo(asset.submitted);
                  return (
                    <div key={index} className="asset-item">
                      <div className="asset-name">{asset.lable || asset.name || `Asset ${index + 1}`}</div>
                      {asset.description && <div className="asset-type"> {asset.description}</div>}
                      <div className={submissionStatus.className}>{submissionStatus.text}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
<<<<<<< HEAD
              <div className="no-data">No assets assigned</div>
=======
              <div className="no-data1">No assets assigned</div>
>>>>>>> 8a5f66f (merging code)
            )}
          </div>

          <div className="modal-footer">
            <button className="outline-btn" onClick={onClose}>
              Close
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

export default OffboardingViewModal;