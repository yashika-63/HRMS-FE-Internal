import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../string';
import moment from 'moment';
import Divider from '@mui/material/Divider';
import { format } from 'date-fns';
import { FaDownload } from 'react-icons/fa';
import { showToast } from '../../Api.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faEllipsisV, faDownload } from '@fortawesome/free-solid-svg-icons';
const ViewExpense = ({ visible, onClose, selectedExpense }) => {
    const [expenseManagement, setExpenseManagement] = useState({
        name: '',
        employee: '',
        department: '',
        designation: '',
        expenseId: '',
        expensePurpose: '',
        expenseAmountSpent: '',
        expenseDetails: [],
        expenseCost: '',
        expenseCategory: '',
        expenseTransectionType: '',
        expenseDate: '',
        expenseFromDate: null,
        expenseTillDate: null,
        id: '',
        expenseType: ''
    });
    const [workflowOptions, setWorkflowOptions] = useState([]);
    const [expenseApprovalData, setExpenseApprovalData] = useState(null);
    const companyId = localStorage.getItem("companyId");
    const employeeId = localStorage.getItem("employeeId");
    const [selectedWorkflowName, setSelectedWorkflowName] = useState('');
    const [Expenses, setExpenses] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const [fetchedFiles, setFetchedFiles] = useState([]);
    const [Loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const fetchEmployeeDetails = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`);
            const employee = response.data;
            setExpenseManagement({
                ...expenseManagement,
                name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
                id: employee.id,
                department: employee.department,
                designation: employee.designation,
            });
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };

    useEffect(() => {
        fetchEmployeeDetails();
    }, []);

    useEffect(() => {
        if (selectedExpense) {
            const fetchExpense = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    };
                    const response = await axios.get(
                        `http://${strings.localhost}/api/expense/GetExpenseById?id=${selectedExpense}`,
                        config
                    );
                    setExpenseManagement(response.data);
                } catch (error) {
                    console.error('Error fetching expense by ID:', error);
                }
            };
            fetchExpense();
        }
    }, [selectedExpense]);

    useEffect(() => {
        const fetchExpenseApprovalData = async () => {
            if (selectedExpense) {
                try {
                    const token = localStorage.getItem('token');
                    const config = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    };
                    const response = await axios.get(
                        `http://${strings.localhost}/api/ExpenseApproval/by-expense-management/${selectedExpense}`,
                        config
                    );
                    setExpenseApprovalData(response.data); // Store all data instead of just the first item
                } catch (error) {
                    console.error('Error fetching expense approval data:', error);
                }
            }
        };

        fetchExpenseApprovalData();
    }, [selectedExpense]);


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A'; // Check if date is invalid

        return format(date, 'yyyy-MM-dd');
    };

    useEffect(() => {
        const fetchWorkflowIds = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/workflow/names/${companyId}`);
                setWorkflowOptions(response.data);
            } catch (error) {
                console.error('Error fetching workflow Names', error);
            }
        };

        fetchWorkflowIds();
    }, [companyId]);

    useEffect(() => {
        if (workflowOptions.length > 0) {
            setSelectedWorkflowName(workflowOptions[0].workflowName); // or however you want to set the selected name
        }
    }, [workflowOptions]);

    const fetchExpenseDocuments = async () => {
        if (fetchedFiles.length > 0) return;

        try {
            setLoading(true);
            const response = await axios.get(`http://${strings.localhost}/api/DocumentExpenseManagement/view/Expense/${selectedExpense}`);
            setFetchedFiles(response.data);
        } catch (error) {
            console.error("Error fetching documents:", error);
            // toast.error("Failed to fetch documents.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenseDocuments();
    }, [selectedExpense]);

    // Function to view a selected document
    const viewDocument = async (documentId) => {
        console.log('viewDocument called with documentId:', documentId); // Log documentId
        try {
            const response = await axios.get(`http://${strings.localhost}/api/DocumentExpenseManagement/view/${documentId}`, { responseType: 'arraybuffer' });
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

    const extractFileName = (filePath) => {
        if (!filePath) return 'Unknown File';
        const pathParts = filePath.split('\\');
        return pathParts[pathParts.length - 1]; // Return the last part (file name)
    };

    const editDropdownMenuForView = (file) => {
        const fileName = extractFileName(file.filePath);


        return (
            <div className="dropdown">
                <button type="button" className="dots-button">
                    <FontAwesomeIcon icon={faEllipsisV} />
                </button>
                <div className="dropdown-content">
                    <div>
                        <button type="button" onClick={() => viewDocument(file.documentId)}>
                            <FontAwesomeIcon className="ml-1" icon={faEye} /> View
                        </button>
                    </div>
                    {/* <li>
                        <button type="button" onClick={() => downloadDocument(file.downloadUrl, fileName)}>
                            <FontAwesomeIcon className="ml-1" icon={faDownload} /> Download
                        </button>
                    </li>
                    <li>
                        <button
                            type="button"
                            onClick={() => {
                                setFileToDelete(file.documentId);
                                setShowDeleteConfirmation(true);
                            }}
                        >
                            <FontAwesomeIcon className="ml-1" icon={faTrash} /> Delete
                        </button>
                    </li> */}
                </div>
            </div>
        );
    };




    const downloadDocument = (downloadUrl, fileName) => {
        console.log('Downloading from URL:', downloadUrl); // Log to verify URL
        console.log('File Name:', fileName); // Log to verify file name

        if (!downloadUrl) {
            showToast('Download URL is missing.','error');
            return;
        }

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName || 'downloaded-file'; // Default to a name if not provided
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2 className='form-title'>Expense Details</h2>
                    <button className="buttonClose" onClick={onClose}>x</button>
                </div>
                <div className="modal-body">
                    <div className="input-row">
                        <div>
                            <label htmlFor="employeename">Employee Id:</label>
                            <input type="text" id="employeename" name="employeename" value={expenseManagement.employee.employeeId || ''} readOnly className="inputField" />
                        </div>
                        <div>
                            <label htmlFor='workflowId'>Workflow Name:</label>
                            <input type="text" value={selectedWorkflowName || 'No workflow selected'} readOnly className='readonly' />
                        </div>
                        <div>
                            <label htmlFor="expensePurpose">Expense Name:</label>
                            <input type="text" id="expensePurpose" name="expensePurpose" value={expenseManagement.expensePurpose || ''} readOnly className="inputField" />
                        </div>
                        <div>
                            <label htmlFor="expenseType">Expense Type:</label>
                            <input type="text" id="expenseType" name="expenseType" value={expenseManagement.expenseType} readOnly className="inputField" />
                        </div>
                    </div>
                    <div className="input-row">
                        <div>
                            <label htmlFor="expenseFromDate">From Date:</label>
                            <input type="text" id="expenseFromDate" name="expenseFromDate"
                                value={expenseManagement.expenseFromDate ? formatDate(expenseManagement.expenseFromDate) : 'N/A'} readOnly className="inputField" />
                        </div>
                        <div>
                            <label htmlFor="expenseTillDate">To Date:</label>
                            <input type="text" id="expenseTillDate" name="expenseTillDate"
                                value={expenseManagement.expenseTillDate ? formatDate(expenseManagement.expenseTillDate) : 'N/A'}
                                readOnly className="inputField" />
                        </div>
                        <div>
                            <label htmlFor="expenseAmountSpent">Amount Spent:</label>
                            <input type="text" id="expenseAmountSpent" name="expenseAmountSpent" value={expenseManagement.expenseAmountSpent || ''} readOnly className="inputField" />
                        </div>
                    </div>
                    <table className="Attendance-table">
                        <thead>
                            <tr>
                                <th>Expense Date</th>
                                <th>Cost</th>
                                <th>Category</th>
                                <th>Payment Mode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenseManagement.expenseDetails.map((detail, index) => (
                                <tr key={index}>
                                    <td>{formatDate(detail.expenseDate)}</td>
                                    <td>{detail.expenseCost}</td>
                                    <td>{detail.expenseCategory}</td>
                                    <td>{detail.expenseTransectionType}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {expenseApprovalData && expenseApprovalData.length > 0 && (
                    <div>
                        <h3>Expense Approval Information</h3>
                        {expenseApprovalData.map((approval, index) => (
                            <div key={index} className="approval-item">
                                <div>
                                    <label><strong>Status:</strong></label>
                                    <span>{approval.action ? 'Approved' : 'Rejected'}</span>
                                </div>
                                <div>
                                    <label><strong>Action Taken By:</strong></label>
                                    <span>{approval.actionTakenBy}</span>
                                </div>
                                <div>
                                    <label><strong>Approval Date:</strong></label>
                                    <span>{moment(approval.date).format('DD-MM-YYYY')}</span>
                                </div>
                                <div>
                                    <label><strong>Mail:</strong></label>
                                    <span>{approval.mail}</span>
                                </div>
                                <div>
                                    <label><strong>Note:</strong></label>
                                    <span>{approval.note}</span>
                                </div>
                                <Divider />
                            </div>
                        ))}
                    </div>
                )}
                <div>
                    {/* Check if there are any files */}
                    {fetchedFiles && fetchedFiles.length > 0 ? (
                        <>
                            <h3>Documents</h3>
                            <table className="Attendance-table">
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fetchedFiles.filter(file => !file.isUploaded).map((file, index) => (
                                        <tr key={index}>
                                            <td>{(file.fileName)}</td>
                                            <td>
                                                {editDropdownMenuForView(file)}  {/* Ensure file object is passed correctly */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <span style={{color:'red'}}>No attachments available.</span> // Message when no documents exist
                    )}
                </div>


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

                        {selectedDocument.type === 'image' && (
                            <>
                                <img src={selectedDocument.url} alt="Preview" width="100%" />
                                <button type='button' className='outline-btn' onClick={() => downloadDocument(selectedDocument.url)}>
                                    <FaDownload /> Download
                                </button>
                            </>
                        )}

                        {selectedDocument.type === 'word' && (
                            <div className='add-popup'>
                                <p>This is a Word document. Please download it to view the content.</p>
                                <button type='button' onClick={() => downloadDocument(selectedDocument.url)}>
                                    <FaDownload />
                                </button>
                            </div>
                        )}
                        {selectedDocument.type === 'excel' && (
                            <div>
                                <p>This is an Excel document. Please download it to view the content.</p>
                                <button type='button' onClick={() => downloadDocument(selectedDocument.url)}>
                                    <FaDownload />
                                </button>
                            </div>
                        )}
                        {selectedDocument.type === 'other' && (
                            <div>
                                <p>File cannot be displayed inline. Click the download button to download the file.</p>
                                <button type='button' onClick={() => downloadDocument(selectedDocument.url)}>
                                    <FaDownload /> Download File
                                </button>
                            </div>
                        )}

                        <div>
                            <button type='button' className='btn' onClick={() => setSelectedDocument(null)}>  Cancel </button>

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
                <div className="modal-footer">
                    <button onClick={onClose} className="outline-btn">  Close </button>
                </div>
            </div>


        </div>
    );
};

export default ViewExpense;
