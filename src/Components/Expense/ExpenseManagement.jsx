
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import CreateExpenseManagement from './CreateExpenseManagement';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaInbox } from 'react-icons/fa';
import { faTrashAlt, faTrash, faEdit, faUserPlus, faEllipsisV, faEye, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import ViewExpense from './ViewExpense';
import UpdateExpense from './UpdateExpense';
import { strings } from '../../string';
import { useDropzone } from 'react-dropzone';
import { showToast } from '../../Api.jsx';

const ExpenseManagement = () => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const location = useLocation();
  const expenses = location.state?.expenses || [];
  const [expenseRequests, setExpenseRequests] = useState(expenses);
  const [open, setOpen] = useState(false);
  const [dates, setDates] = useState([null, null]); // store selected date range
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [Expenses, setExpenses] = useState([]);
  const [files, setFiles] = useState({}); // To store files with unique keys
  const [isDragging, setIsDragging] = useState(false);
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const companyId = localStorage.getItem("companyId");
  const accountId = localStorage.getItem("accountId");
  const employeeId = localStorage.getItem("employeeId");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currency: '',
    activityItem: '',
    category: '',
    itemDescription: '',
    receipt: null,
    subCategory: '',
    eligibilityApproval: '',
    id: '',
    name: '',
    department: '',
    designation: '',
    expenseFromDate: '',
    expenseTillDate: '',
    expensePurpose: '',
    expenseAmountSpent: '',
    expenseTransectionType: '',
    uploadDocument: null,
    extraNotes: '',
    onBehalfOf: ''
  });
  const [employeeData, setEmployeeData] = useState({
    id: '',
    name: '',
    department: '',
    designation: ''
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  useEffect(() => {
    if (location.state?.expenses) {
      setExpenseRequests(location.state.expenses);
    }
  }, [location.state?.expenses]);

  const handleMainSubmit = (e) => {
    e.preventDefault();
    const newExpense = {
      Id: formData.id,
      name: formData.name,
      department: formData.department,
      designation: formData.designation,
      expenseFromDate: formData.expenseFromDate,
      expenseTillDate: formData.expenseTillDate,
      expensePurpose: formData.expensePurpose,
      expenseAmountSpent: formData.expenseAmountSpent,
      expenseTransectionType: formData.expenseTransectionType,
      uploadDocument: formData.uploadDocument,
      extraNotes: formData.extraNotes,
      onBehalfOf: formData.onBehalfOf,
      details: expenses
    };
    setExpenses([...expenses, newExpense]);
    setFormData({
      currency: '',
      amount: '',
      activityItem: '',
      category: '',
      itemDescription: '',
      receipt: null,
      subCategory: '',
      eligibilityApproval: '',
      id: '',
      name: '',
      department: '',
      designation: '',
      expenseFromDate: '',
      expenseTillDate: '',
      expensePurpose: '',
      expenseAmountSpent: '',
      expenseTransectionType: '',
      uploadDocument: null,
      extraNotes: '',
      onBehalfOf: ''
    });
    setIsMainModalOpen(false);
  };


  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://${strings.localhost}/api/expense/save/${companyId}/${accountId}`,
        {
          ...formData,
          expenseId: parseInt(formData.expenseId),
          companyId: parseInt(companyId),
          accountId: parseInt(accountId)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setOpen(false);
    } catch (error) {
      console.error('There was an error submitting the data!', error);
    }
  };
  const handleUploadFiles = async (id) => {
    if (!id) {
      showToast('Please select an expense before uploading files.','warn');
      return;
    }

    // Ensure selectedExpense is set with the correct ID
    setSelectedExpense(id);  // Set the selected expense ID
    console.log('Starting file upload for Expense ID:', id);  // Log to check the ID

    if (Object.keys(files).length === 0) {
      showToast('No files to upload.','warn');
      return;
    }

    setLoading(true);

    try {
      for (const fileKey in files) {
        const file = files[fileKey].file;
        console.log('Uploading file:', file);

        const formData = new FormData();
        formData.append('file', file);

        const uploadUrl = `http://${strings.localhost}/api/DocumentExpenseManagement/${id}/upload`;  // Use `id` here
        console.log('Sending request to:', uploadUrl);

        const response = await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // onUploadProgress: (progressEvent) => {
          //   const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // },
        });

        if (response.status === 200) {
          showToast(`Uploaded: ${file.name}`,'success');
        } else {
          showToast(`Failed to upload: ${file.name}`,'error');
        }
      }

      setShowAttachmentModal(false);
      setFiles({});
    } catch (error) {
      console.error('Upload error:', error);
      showToast('An error occurred during the upload.','error');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`File ${file.name} is too large. Maximum size is 10 MB.`,'warn');
        return;
      }

      const fileKey = `key_${file.name}`;
      setFiles((prevFiles) => ({
        ...prevFiles,
        [fileKey]: { file, progress: 0 }, // Store the actual file object and initialize progress
      }));
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    
    onDrop: handleDrop,
    accept: "*/*", // Accept any file type
    onDragOver: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const handleConfirmation = (id) => {
    setSelectedExpense(id);  // Set the selected expense ID
    setShowAttachmentModal(true);  // Open the attachment modal
  };


  const fetchEmployeeDetails = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`);
      const employee = response.data;
      setEmployeeData({
        id: employee.id,
        name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
        department: employee.department,
        designation: employee.designation,
        employeeId: employee.employeeId

      });
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };


  const fetchExpenseRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://${strings.localhost}/api/expense/latest/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (Array.isArray(response.data)) {
        setExpenseRequests(response.data);
      } else {
        console.error('Expected an array but got:', response.data);
        setExpenseRequests([]);  // Set to empty array if the response is not an array
      }
    } catch (error) {
      console.error('Error fetching expense requests:', error);
    }
  };
  useEffect(() => {
    fetchEmployeeDetails();
    fetchExpenseRequests();
  }, []);


  const handleDeleteRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://${strings.localhost}/api/expense/delete/${selectedExpense}`);
      setExpenseRequests(prevRequests => prevRequests.filter(request => request.id !== selectedExpense));
      showToast('Expense request deleted successfully.','success');
    } catch (error) {
      console.error('Error deleting expense request:', error);
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A'; // Check if date is invalid
    return format(date, 'dd-MM-yyyy');
  };


  const statusStyle = (status) => {
    switch (status) {
      case 'REJECTED':
        return { color: 'red' };
      case 'APPROVED':
        return { color: 'green' };
      case 'PENDING':
        return { color: 'blue' };
      default:
        return { color: 'black' }; // Default color if status is unknown
    }
  };


  const handleEditClick = (id) => {
    setSelectedExpense(id);
    setShowUpdateModal(true);
  };

  const handleViewClick = (id) => {
    setSelectedExpense(id);
    setShowViewModal(true);
  };

  const requestDeleteConfirmation = (selectedExpense) => {
    setSelectedExpense(selectedExpense);
    setShowDeleteConfirmation(true);
  };


  const handleBack = () => {
    setShowAttachmentModal(false);
  };
  // Assuming files is stored as an object where the key is the file identifier (e.g., the file name or a unique ID)
  const handleRemoveFile = (fileKey) => {
    // Create a copy of the files object without the file to be removed
    const updatedFiles = { ...files };
    delete updatedFiles[fileKey];  // Remove the file by key
    setFiles(updatedFiles);  // Update the state to reflect the changes
  };

  const editDropdownMenu = (id, requestStatus) => (
    <div className="dropdown">
      <button className="dots-button">
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      <div className="dropdown-content">
        <div>
          <button  type="button" onClick={() => handleEditClick(id)} disabled={requestStatus === 'APPROVED'} style={requestStatus === 'APPROVED' ? { cursor: 'not-allowed' } : {}}
          >
            <FontAwesomeIcon className='ml-2' icon={faEdit} /> Edit
          </button>
        </div>
        <div>
          <button  type="button" onClick={() => handleViewClick(id)}>
            <FontAwesomeIcon className='ml-2' icon={faEye} /> View
          </button>
        </div>
        <div>
          <button  type="button" onClick={() => handleConfirmation(id)}>
            <FontAwesomeIcon className='ml-2' icon={faPaperclip} /> Attachments
          </button>
        </div>

        {/* <li>
          <button type='button' onClick={() => requestDeleteConfirmation(id)}> <FontAwesomeIcon className='ml-2' icon={faTrashAlt} /> Delete </button>
        </li> */}
      </div>
    </div>
  );

  const fetchExpenseData = async (startDate, endDate) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://${strings.localhost}/api/expense/getByDateRange/${companyId}/${employeeId}`, {
        params: {
          startDate: startDate,
          endDate: endDate,
        }
      });
      setExpenseRequests(response.data); // set fetched data to state
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expense data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dates[0] && dates[1]) {
      const startDate = dates[0].toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const endDate = dates[1].toISOString().split('T')[0]; // Format as YYYY-MM-DD
      fetchExpenseData(startDate, endDate); // Fetch data when dates are set
    }
  }, [dates]);

  return (
    <div>
      <form onSubmit={handleMainSubmit} className="expense-form">
        <div className="form-title">Expense Management</div>
        <div className="input-oneline">
          <div>
            <label htmlFor="employeename">Employee Name</label>
            <input type="text" className='readonly' id="employeename" name="employeename" value={employeeData.name} readOnly />
          </div>
          <div>
            <label htmlFor="Id">Employee Id</label>
            <input type="text" className='readonly' id="Id" name="Id" value={employeeData.employeeId} readOnly />
          </div>
          <div>
            <label htmlFor="designation">Employee Designation</label>
            <input className='readonly' type="text" id="designation" name="designation" value={employeeData.designation} readOnly />
          </div>

          <div>
            <label htmlFor="department">Employee Department</label>
            <input type="text" className='readonly' id="department" name="department" value={employeeData.department} readOnly />
          </div>

        </div>
        <CreateExpenseManagement
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={handleMainSubmit}
        />
        <div>

<<<<<<< HEAD
          <table className="Attendance-table">
=======
          <table className="interview-table">
>>>>>>> 8a5f66f (merging code)
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Expense Description</th>
                <th>Amount Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(expenseRequests) && expenseRequests.length > 0 ? (
                expenseRequests.map((request, index) => (
                  <tr key={request.id}>
                    <td>{index + 1}</td>
                    <td>{formatDate(request.expenseFromDate || 'N/A')}</td>
                    <td>{formatDate(request.expenseTillDate || 'N/A')}</td>
                    <td>{request.expensePurpose || 'N/A'}</td>
                    <td>{request.expenseAmountSpent !== null ? request.expenseAmountSpent : 'N/A'}</td>
                    <td style={statusStyle(request.requestStatus)}> {request.requestStatus || 'N/A'}</td>
                    <td>
                      {editDropdownMenu(request.id, request.requestStatus)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No expense requests available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </form>


      {showDeleteConfirmation && (
        <div className='add-popup' style={{ height: "120px", textAlign: "center" }}>
          <p>Are you sure you want to delete this Expense request?</p>
          <div className='btnContainer'>
            <button className='btn' onClick={handleDeleteRequest}>Yes</button>
            <button className='btn' onClick={() => setShowDeleteConfirmation(false)}>No</button>
          </div>
        </div>
      )}


      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="leavemodal-content">
            <button className="close-button" onClick={() => setShowUpdateModal(false)}>X</button>
            <UpdateExpense
              employeeData={selectedExpense}
              visible={showUpdateModal}
              onClose={() => setShowUpdateModal(false)}
              selectedExpense={selectedExpense}
            />
          </div>
        </div>
      )}

      {showViewModal && (
        <ViewExpense
          employeeData={selectedExpense}
          visible={showViewModal}
          onClose={() => setShowViewModal(false)}
          selectedExpense={selectedExpense}
        />
      )}
      {showAttachmentModal && (
        <div className="modal-overlay">
          <div className="leavemodal-content">
            <div>
              <h3>Upload Documents</h3>
              <button onClick={() => setShowAttachmentModal(false)} className="close-button"> X </button>
            </div>
            <div className="leave-containers">
              
              <div
                {...getRootProps()}
                style={{
                  border: isDragging ? "2px solid #00f" : "2px dashed #ccc",
                  padding: "20px",
                  textAlign: "center",
                  justifyContent: 'center',
                }}
              >
                <input {...getInputProps()} />
                <FaInbox className="upload-icon" style={{marginLeft:'90px'}}/>
                <p>Drag & drop some files here, or click to select files</p>
                
              </div>
              
              <div className="file-list-section">
                {Object.keys(files).length > 0 ? (
                  <ul className="file-list">
                    {Object.keys(files).map((key) => (
                      <li key={key} className="file-item">
                        {files[key] && files[key].file ? (
                          <>
                            <div className="file-preview-circle">
                              {/* Check if the file is an image, show preview */}
                              {files[key].file.type.startsWith("image/") ? (
                                <img
                                  src={URL.createObjectURL(files[key].file)}
                                  alt="Preview"
                                  className="file-preview-img"
                                />
                              ) : (
                                <span className="file-icon">📄</span> // Show a document icon for non-images (you can change this to any icon)
                              )}
                            </div>
                            <span className="file-name">{files[key].file.name}</span>
                            {/* Cross button to remove the file */}
                            <button
                              type="button"
                              className="cross-btn"
                              onClick={() => handleRemoveFile(key)}
                            >
                              &#10005; {/* Cross symbol */}
                            </button>
                          </>
                        ) : (
                          <span>No file available</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No files selected yet.</p>
                )}
                <button type="button" className="outline-btn" onClick={handleBack}>Back</button>
                <button type="button" className="outline-btn" onClick={() => handleUploadFiles(selectedExpense)}>Upload Files</button>
              </div>
              
            </div>
          </div>
        </div>
      )}

    
    </div>
  );
};

export default ExpenseManagement;
