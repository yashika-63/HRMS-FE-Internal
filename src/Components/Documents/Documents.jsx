import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaArrowsAlt, FaUpload, FaFileUpload, FaInbox } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { showToast } from '../../Api.jsx';
import { strings } from '../../string';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../CommonCss/EnrollDashboard.css';

const Documents = () => {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fileToRemoveKey, setFileToRemoveKey] = useState(null);
  const [renameFileKey, setRenameFileKey] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const { employeeId, id } = useParams();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  // Load files from local storage when the component mounts
  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || {};
    setFiles(storedFiles);
  }, []);

  // Update local storage whenever files change
  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify(files));
  }, [files]);

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`File ${file.name} is too large. Maximum size is 10 MB.`,'warn');
        return;
      }

      const fileKey = `key_${file.name}`;
      setFiles((prevFiles) => ({
        ...prevFiles,
        [fileKey]: file, // Store the actual file object here
      }));
    });
  };

  const handleUploadFiles = async () => {
    if (Object.keys(files).length === 0) {
      showToast('No files to upload.','warn');
      return;
    }
  
    setLoading(true);
    setProgress(0);
  
    try {
      // Iterate over the files object directly
      for (const fileKey in files) {
        const file = files[fileKey]; // Get the actual file object
        console.log('Uploading file:', file); // Log the file object for debugging
  
        // Create FormData and append the file under the 'file' key
        const formData = new FormData();
        formData.append('file', file); // 'file' is the key, and the file object is the value
  
        // Debugging: Log the FormData object to check its content
        for (let [key, value] of formData.entries()) {
          console.log(`FormData key: ${key}, value: ${value.name || value}`);  // This will show the file name, not the file object
        }
  
        // Upload the file to the server
        const response = await axios.post(`http://${strings.localhost}/api/documents/${id}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentage);
          },
        });
  
        if (response.status === 200) {
          showToast(`Uploaded: ${file.name}`,'success');
        } else {
          showToast(`Failed to upload: ${file.name}`,'error');
        }
      }
  
      setFiles({}); // Clear the uploaded files after successful upload
    } catch (error) {
      console.error('Upload error:', error);
      showToast('An error occurred during the upload.','error');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleRemoveFile = (key) => {
    setFileToRemoveKey(key);
    setShowConfirmation(true);
  };

  const confirmRemoveFile = () => {
    setFiles((prevFiles) => {
      const { [fileToRemoveKey]: removedFile, ...remainingFiles } = prevFiles;
      return remainingFiles;
    });
    setFileToRemoveKey(null);
    setShowConfirmation(false);
  };

  const handleRenameFile = (key) => {
    setRenameFileKey(key);
    setNewFileName(files[key].name); // Use the file object's name for renaming
  };

  const confirmRenameFile = () => {
    if (!newFileName.trim()) {
      showToast("File name cannot be empty.",'warn');
      return;
    }

    // Prevent modification of the file extension
    const fileExtension = files[renameFileKey].name.split('.').pop();
    const baseName = newFileName.replace(new RegExp(`\\.${fileExtension}$`), ''); // Strip the old extension if present
    setFiles((prevFiles) => ({
      ...prevFiles,
      [renameFileKey]: { ...prevFiles[renameFileKey], name: `${baseName}.${fileExtension}` }, // Ensure extension is not changed
    }));
    setRenameFileKey(null);
    setNewFileName("");
  };

  const cancelRenameFile = () => {
    setRenameFileKey(null);
    setNewFileName("");
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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '*/*',  // Accept any file type
    onDragOver: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div className="file-upload-container">
      <div {...getRootProps({ className: `dropzone ${isDragging ? 'drag-over' : ''}` })}>
        <input {...getInputProps()} />
        <FaInbox className="upload-icon" />
        <p>Select Files or Drag & Drop Here</p>
      </div>
      <div className="form-controls">
        <button
          type="button"
          className="btn"
          onClick={handleUploadFiles}
          disabled={loading || Object.keys(files).length === 0}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      {Object.keys(files).length > 0 && (
        <div className="file-list">
          <table className="Attendance-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(files).map((key) => (
                <tr key={key}>
                  <td>
                    {renameFileKey === key ? (
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRenameFile();
                        }}
                        onBlur={cancelRenameFile}
                        autoFocus
                      />
                    ) : (
                      files[key].name // Display the file's name (value of the file object)
                    )}
                  </td>
                  <td>{editDropdownMenu(key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConfirmation && (
        <div className="add-popup" style={{ height: '120px', textAlign: 'center' }}>
          <p>Are you sure you want to remove this file?</p>
          <div className="btnContainer">
            <button type="button" className="btn" onClick={confirmRemoveFile}>
              Confirm
            </button>
            <button
              type="button"
              className="outline-btn"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
   
    </div>
  );
};

export default Documents;
