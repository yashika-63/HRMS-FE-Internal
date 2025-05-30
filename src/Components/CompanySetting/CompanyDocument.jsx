import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchDataByKey } from '../../Api.jsx';
import { showToast } from '../../Api.jsx'; 
import Draggable from 'react-draggable';
import { FaFile, FaFilePdf, FaFileWord, FaFileImage, FaFileExcel, FaFileArchive } from 'react-icons/fa';  // Import icons for file types
import '../CommonCss/template.css';
import { strings } from '../../string.jsx';

const CompanyDocument = () => {
  const [dropdownData, setDropdownData] = useState({ CompanyDocument: [] });
  const [formData, setFormData] = useState({
    documentName: '',
    documentFile: null,
    documentIdentityKey: '',
  });
  const [downloadLink, setDownloadLink] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewType, setPreviewType] = useState('');
  const [previewFilename, setPreviewFilename] = useState('');

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [documents, setDocuments] = useState([]);
  const companyId = localStorage.getItem('companyId');
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const CompanyDocument = await fetchDataByKey('CompanyDocument');
        setDropdownData({ CompanyDocument });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`http://${strings.localhost}/api/company-document/active/${companyId}`);
        if (response.status === 200) {
          setDocuments(response.data);
        } else {
          showToast('Failed to fetch documents.', 'error');
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        showToast('An error occurred while fetching documents.', 'error');
      }
    };

    fetchDocuments();
  }, [companyId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSave = async () => {
    const { documentFile, documentIdentityKey, documentName } = formData;

    if (!documentFile) {
      showToast('Please select a file to upload.', 'warn');
      return;
    }
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];

    if (!allowedTypes.includes(documentFile.type)) {
      showToast('Only PNG, JPG, JPEG and PDF files are allowed.', 'warn');
      return;
    }
    if (documentFile.size > MAX_FILE_SIZE) {
      showToast('File is too large. Maximum size is 10 MB.', 'warn');
      return;
    }

    if (!documentIdentityKey) {
      showToast('Please select a document type.', 'warn');
      return;
    }

    if (!documentName.trim()) {
      showToast('Please enter a document name.', 'warn');
      return;
    }
    setLoading(true);
    setProgress(0);

    const formDataToSend = new FormData();
    formDataToSend.append('file', documentFile);
    formDataToSend.append('documentIdentityKey', documentIdentityKey);
    formDataToSend.append('documentName', documentName);

    try {
      const response = await axios.post(
        `http://${strings.localhost}/api/company-document/${companyId}/uploadCompanyDocument`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentage);
          },
        }
      );

      if (response.status === 200) {
        showToast('Document uploaded successfully.', 'success');
        fetchDocuments();
        setShowPopup(false);
      } else {
        showToast('Failed to upload document.', 'error');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      showToast('An error occurred during the upload.', 'error');
      console.log('formdata', formDataToSend);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };



  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/company-document/view/active?companyId=${companyId}`, {
        responseType: 'arraybuffer', // Receive binary data
      });

      console.log("API Response:", response);

      if (response.status === 200) {
        // Create a Blob from the ArrayBuffer
        const blob = new Blob([response.data], { type: 'application/zip' });

        // Create a URL for the Blob object
        const fileUrl = URL.createObjectURL(blob);

        // Create a downloadable link
        const fileName = 'documents.zip';  // You can dynamically set this if needed
        const downloadLink = (
          <a href={fileUrl} download={fileName}>
            Click here to download the document (ZIP file)
          </a>
        );

        // Show the link in the UI
        setDownloadLink(downloadLink); // Assuming you have a state for this

        showToast('Documents fetched successfully..', 'success');
      } else {
        showToast('Failed to fetch documents.', 'error');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      showToast('An error occurred while fetching documents.', 'error');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [companyId]);

  const handleViewDocument = async (id) => {
    try {
      const doc = documents.find(d => d.id === id);
      const response = await axios.get(`http://${strings.localhost}/api/company-document/view/${id}`, {
        responseType: 'blob',
      });

      const contentType = response.headers['content-type'];
      const fileUrl = URL.createObjectURL(response.data);
      const extension = contentType.split('/').pop();
      const filename = `${doc?.documentIdentityKey || 'document'}.${extension}`;
      setPreviewFilename(filename);

      if (contentType.includes('pdf')) {
        setPreviewType('pdf');
      } else if (contentType.includes('image')) {
        setPreviewType('image');
      } else {
        setPreviewType('unsupported');
      }

      setPreviewDocument(fileUrl);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error fetching document preview:', error);
      showToast('Failed to load document preview.', 'error');
    }
  };

  const getDocumentUrl = (fileData, fileType) => {
    // Create a data URI using Base64 encoding
    return `data:${fileType};base64,${fileData}`;
  };

  const fileTypeIcon = (filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();

    switch (extension) {
      case 'pdf':
        return <FaFilePdf />;
      case 'doc':
      case 'docx':
        return <FaFileWord />;
      case 'xlsx':
      case 'xls':
        return <FaFileExcel />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FaFileImage />;
      case 'zip':
        return <FaFileArchive />;
      default:
        return <FaFile />;
    }
  };

  return (
    <div className='coreContainer'>
      <div >
  
      <button type='button' className='btn' onClick={() => setShowPopup(true)}>Add Document</button>
      </div>
      <div className="document-list">
        
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc.id} className="document-item card">
              <div className="document-card-body">
                <div className="document-icon">{fileTypeIcon(doc.filePath)}</div>
                <div className="document-info">
                  <h5>{doc.documentIdentityKey}</h5>
                  <p><strong>Date:</strong> {doc.date}</p>
                  <p><strong>Company:</strong> {doc.company?.companyName}</p>

                  <button
                    className="view-Preview"
                    onClick={() => handleViewDocument(doc.id)} 
                  >
                    View Preview
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No documents available.</p>
        )}

      </div>
      {showPreviewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowPreviewModal(false)}>X</button>
            <h3>Preview: {previewFilename}</h3>

            {previewType === 'pdf' && (
              <iframe src={previewDocument} title="PDF Preview" width="100%" height="500px"></iframe>
            )}

            {previewType === 'image' && (
              <img src={previewDocument} alt="Preview" style={{ maxWidth: '100%', maxHeight: '500px' }} />
            )}

            {previewType === 'unsupported' && (
              <div style={{ textAlign: 'center' }}>
                <p>Preview not available for this file type.</p>
              </div>
            )}

            <div className="modal-footer" style={{ textAlign: 'center', marginTop: '10px' }}>
              <a href={previewDocument} download={previewFilename} className="btn">
                Download File
              </a>
            </div>
          </div>
        </div>
      )}




      {showPopup && (
        <Draggable handle=".popup-header">
          <div className="add-popup" style={{ position: 'absolute', top: '30%', left: '30%' }}>
            <div className="popup-header">
              <h3 className='centerText'>Add Document</h3>
            </div>
            <span className="required-marker">*</span>
            <div className="popup-content">
              <label>Document Name</label>
              <input
                type="text"
                name="documentName"
                value={formData.documentName}
                onChange={handleChange}
                required
              />
              <span className="required-marker">*</span>
              <label>Upload Document</label>
              <input
                type="file"
                name="documentFile"
                onChange={handleChange}
                required
              />
              <span className="required-marker">*</span>
              <label>Document Type</label>
              <select
                name="documentIdentityKey"
                value={formData.documentIdentityKey}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden>
                  Select
                </option>
                {dropdownData.CompanyDocument.length > 0 ? (
                  dropdownData.CompanyDocument.map((option) => (
                    <option key={option.masterId} value={option.data}>
                      {option.data}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Not available
                  </option>
                )}
              </select>
              <div className='btnContainer'>
                <button type='button' className='btn' onClick={handleSave} disabled={loading}>
                  {loading ? `Uploading... ${progress}%` : 'Save'}
                </button>
                <button type='button' className='outline-btn' onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </Draggable>
      )}
    </div>
  );
};

export default CompanyDocument;
