import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaDownload, FaCloudUploadAlt, FaInbox, FaFile, FaFileAlt, FaFileArchive, FaFilePdf, FaFileWord, FaFileImage, FaFileExcel } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faEdit, faTrash, faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import { showToast } from '../../Api.jsx';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../CommonCss/EnrollDashboard.css';
import { strings } from '../../string';

const ViewDocuments = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fetchedFiles, setFetchedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fileToRemoveKey, setFileToRemoveKey] = useState(null);
  const [renameFileKey, setRenameFileKey] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const { employeeId, id } = useParams();

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://${strings.localhost}/api/documents/view/employee/${id}`, {
        params: { _t: new Date().getTime() }, // Adding a timestamp query to prevent caching
      });
      setFetchedFiles(response.data);  // Update the fetched files state with the response data
    } catch (error) {
      console.error("Error fetching documents:", error);
      showToast("Failed to fetch documents.",'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [id]);


  // Function to view a selected document
  const viewDocument = async (docId) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/api/documents/view/${docId}`, { responseType: 'arraybuffer' });
      const fileBlob = new Blob([response.data], { type: response.headers['content-type'] });
      const fileURL = URL.createObjectURL(fileBlob);

      const fileType = response.headers['content-type'];

      if (fileType === 'application/pdf') {
        setSelectedDocument({ url: fileURL, type: 'pdf' });
      } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedDocument({ url: fileURL, type: 'word' });
      } else if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setSelectedDocument({ url: fileURL, type: 'excel' });
      } else if (fileType === 'image/jpeg' || fileType === 'image/png' || fileType === 'image/gif') {
        setSelectedDocument({ url: fileURL, type: 'image' });
      } else {
        setSelectedDocument({ url: fileURL, type: 'other' });
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      showToast("Failed to fetch document.",'error');
    }
  };

  const onDrop = (acceptedFiles) => {
    console.log('Files dropped:', acceptedFiles);

    acceptedFiles.forEach((file) => {
      const fileExists = uploadedFiles.some(existingFile => existingFile.name === file.name);

      if (fileExists) {
        showToast(`File ${file.name} is already in the list.`,'warn');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        showToast(`File ${file.name} is too large. Maximum size is 10 MB.`,'warn');
        return;
      }

      // If file is not in the list and is not too large, add it to the uploadedFiles array
      setUploadedFiles((prevFiles) => [
        ...prevFiles,
        { name: file.name, size: file.size, file, isUploaded: false, newName: '' },
      ]);
    });
  };


  const handleUploadFiles = async () => {
    try {
      let anyError = false;
      for (const file of uploadedFiles) {
        if (!file.isUploaded) {
          const formData = new FormData();
          const fileNameToUpload = file.newName || file.name;
          formData.append('file', file.file, fileNameToUpload); 

          const response = await axios.post(`http://${strings.localhost}/api/documents/${id}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percentage); // Update the progress
            },
          });

          if (response.status === 200) {
            // If successful, mark the file as uploaded
            setUploadedFiles((prevFiles) =>
              prevFiles.map((file) =>
                file.name === file.name ? { ...file, isUploaded: true } : file
              )
            );
            showToast(`Uploaded: ${fileNameToUpload}`,'success');
          } else {
            showToast(`Failed to upload: ${fileNameToUpload}`,'error');
            anyError = true;
          }
        }
      }

      if (anyError) {
        showToast('Some files failed to upload.','error');
      } else {
        // Refresh the documents right after upload without page reload
        await fetchDocuments();  // Fetch updated documents after upload is successful
      }

    } catch (error) {
      console.error('Upload error:', error);
      showToast('An error occurred during the upload.','error');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      const response = await axios.delete(`http://${strings.localhost}/api/documents/delete/${documentId}`);

      if (response.status === 200) {
        showToast('Document deleted successfully.','success');
        setFetchedFiles((prevFiles) => prevFiles.filter((file) => file.documentId !== documentId));
      } else {
        showToast('Failed to delete the document.','error');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showToast('Error deleting the document.','error');
    }
  };

  const handleRemoveFile = (key) => {
    setFileToRemoveKey(key);
    setShowConfirmation(true);
  };

  const confirmRemoveFile = () => {
    setUploadedFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((file, index) => index !== fileToRemoveKey);
      return updatedFiles;
    });

    setFileToRemoveKey(null); // Reset the state of the file to remove
    setShowConfirmation(false); // Close the confirmation dialog
  };

  const handleRenameFile = (key) => {
    setRenameFileKey(key);
    setNewFileName(uploadedFiles[key].name);
  };

  const confirmRenameFile = () => {
    if (renameFileKey === null || !uploadedFiles[renameFileKey] || !uploadedFiles[renameFileKey].name) {
      showToast("Invalid file.",'warn');
      return;
    }
    const fileName = uploadedFiles[renameFileKey].name;
    if (!newFileName.trim()) {
      showToast("File name cannot be empty.",'warn');
      return;
    }
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : '';
    const baseName = newFileName.replace(new RegExp(`\\.${fileExtension}$`), '');
    setUploadedFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles[renameFileKey] = {
        ...updatedFiles[renameFileKey],
        name: `${baseName}.${fileExtension}`,
        newName: `${baseName}.${fileExtension}`,
      };
      return updatedFiles;
    });

    setRenameFileKey(null);
    setNewFileName("");
  };

  const cancelRenameFile = () => {
    setRenameFileKey(null);
    setNewFileName("");
  };

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      deleteDocument(fileToDelete);
      setShowDeleteConfirmation(false);
      setFileToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setFileToDelete(null);
  };

  const editDropdownMenu = (key) => (
    <div className="dropdown">
      <button type='button' className="dots-button">
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      <div className="dropdown-content">
        <div>
          <button type='button' onClick={() => handleRenameFile(key)}>
            <FontAwesomeIcon className="ml-1" icon={faEdit} /> Rename
          </button>
        </div>
        <div>
          <button type='button' onClick={() => handleRemoveFile(key)}>
            <FontAwesomeIcon className="ml-1" icon={faTrash} /> Remove
          </button>
        </div>
      </div>
    </div>
  );

  const downloadDocument = (downloadUrl, fileName) => {
    if (!downloadUrl) {
      showToast('Download URL is missing.','warn');
      return;
    }
    if (!fileName) {
      fileName = extractFileNameFromUrl(downloadUrl);
    }
    if (!fileName) {
      showToast('File name is missing.','warn');
      return;
    }
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const extractFileNameFromUrl = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];  
  };
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '*/*',
    onDragOver: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const extractFileName = (filePath) => {
    if (!filePath) return 'Unknown File';
    const pathParts = filePath.split('\\');
    return pathParts[pathParts.length - 1]; // Return the last part (file name)
  };
  const fileTypeIcon = (filePath) => {
    // Check if filePath is a string and contains a '.'
    if (typeof filePath !== 'string' || !filePath.includes('.')) {
      console.warn('Invalid filePath:', filePath);  // Log invalid filePath for debugging
      return <FaFile />;  // Return a default icon if filePath is invalid
    }

    const extension = filePath.split('.').pop().toLowerCase();

    // Now proceed with different file type icons
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
    <div>
      {/* <div {...getRootProps({ className: `form-controls ${isDragging ? 'drag-over' : ''}` })}>
        <input {...getInputProps()} />
        <FaUpload />
        <p>Select Files or Drag & Drop Here</p>
      </div> */}
      {/* Render Drag & Drop zone */}

      {/* <div {...getRootProps({ className: `btn ${isDragging ? 'drag-over' : ''}` })}>
          <input {...getInputProps()} />
          <FaCloudUploadAlt style={{ fontSize: '20px', marginLeft: '70px' }} />
          <p>Select Files or Drag & Drop Here</p>
        </div> */}

      {/* Upload Button */}
      {/* <button
          type="button"
          className="btn"
          onClick={handleUploadFiles}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button> */}

      {fetchedFiles.filter(file => !file.isUploaded).length > 0 && (
        <div className="underlineText" style={{ marginLeft: '20px' }}>Fetched Documents</div>
      )}
      <div className="document-tiles">

        {fetchedFiles.filter(file => !file.isUploaded).map((file, index) => (
          <div key={index} className="document-tile">
            <div className='document-file'>
              {file.previewUrl ? (
                <div className="document-preview">
                  {file.fileType.startsWith('image/') ? (
                    <img src={file.previewUrl} alt="Document Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                  ) : file.fileType === 'application/pdf' ? (
                    <img src={file.previewUrl} alt="PDF Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                  ) : (
                    <p>Preview Not Available</p>
                  )}
                </div>
              ) : (
                <div className='document-file-icon'>{fileTypeIcon(file.fileName || '')}</div> 
              )}
            </div>

            <div className='document-below-content'>
              <div className="document-tile-content" onClick={() => viewDocument(file.documentId)}>
                <p>{file.fileName}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => viewDocument(file.documentId)}>
                  <FontAwesomeIcon className="ml-1" style={{ cursor: 'pointer' }} icon={faEye} />
                </button>
                <button type='button' onClick={() => {
                  setFileToDelete(file.documentId);
                  setShowDeleteConfirmation(true);
                }}>
                  <FontAwesomeIcon className="ml-3" style={{ cursor: 'pointer' }} icon={faTrash} />
                </button>
              </div>
            </div>
          </div>
        ))}

      </div>
      <div {...getRootProps({ className: `dropzone ${isDragging ? 'drag-over' : ''}` })}>
        <input {...getInputProps()} />
        <FaInbox className="upload-icon" />
        <p>Select Files or Drag & Drop Here</p>
      </div>
      {uploadedFiles.filter(file => !file.isUploaded).length > 0 && (
        <div className="document-list">
          <div className="title">Uploaded Documents</div>
          <table className="Attendance-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.filter(file => !file.isUploaded).map((file, key) => (
                <tr key={key}>
                  <td>
                    {renameFileKey === key ? (
                      <input
                        type="text"
                        value={newFileName || file.name}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')
                            confirmRenameFile();
                        }}
                        onBlur={cancelRenameFile}
                        autoFocus
                      />
                    ) : (
                      file.newName || file.name
                    )}
                  </td>
                  <td>{editDropdownMenu(key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="form-controls">
        {uploadedFiles.filter(file => !file.isUploaded).length > 0 && (
          <button
            type="button"
            className="btn"
            onClick={handleUploadFiles}
          >
            {loading ? 'Uploading...' : 'Save'}
          </button>
        )}
      </div>
      {/* Document Preview */}
      {selectedDocument && (
        <div className="document-preview-popup" >
          {selectedDocument.type === 'pdf' && (
            <iframe
              src={selectedDocument.url}
              width="100%"
              height="600px"
              title="Document Preview"
            />
          )}
          {selectedDocument && selectedDocument.type === 'image' && (
            <div>
              <img src={selectedDocument.url} alt="Document Preview" />
            </div>
          )}

          {selectedDocument.type === 'word' && (
            <div className='add-popup'>
              <p style={{ fontSize: '12px' }}>This is a Word document. Please download it to view the content.</p>

            </div>
          )}
          {selectedDocument.type === 'excel' && (
            <div>
              <p style={{ fontSize: '12px' }}>This is an Excel document. Please download it to view the content.</p>

            </div>
          )}
          {selectedDocument.type === 'other' && (
            <div>
              <p style={{ fontSize: '12px' }}>File cannot be displayed inline. Click the download button to download the file.</p>

            </div>
          )}

          <div>
            <button type='button' className='outline-btn' onClick={() => downloadDocument(selectedDocument.url)}>
              <FaDownload /> Download File
            </button>
            <button type='button' className='outline-btn' onClick={() => setSelectedDocument(null)} >  Cancel </button>

          </div>
        </div>
      )}
      {showConfirmation && (
        <div className="add-popup" style={{ height: '120px', textAlign: 'center' }}>
          <p>Are you sure you want to remove this file?</p>
          <div className="btnContainer">
            <button type="button" className="btn" onClick={confirmRemoveFile}>
              Confirm
            </button>
            <button type="button" className="outline-btn" onClick={() => setShowConfirmation(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {showDeleteConfirmation && (
        <div className="add-popup" style={{ height: '120px', textAlign: 'center' }}>
          <p>Are you sure you want to delete this document?</p>
          <div className="btnContainer">
            <button type="button" className="btn" onClick={handleDeleteConfirm}>Confirm</button>
            <button type="button" className="outline-btn" onClick={cancelDelete}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDocuments;

