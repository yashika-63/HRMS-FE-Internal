import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CommonCss/EnrollDashboard.css';
import '../CommonCss/Main.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { strings } from '../../string';
import { showToast } from '../../Api.jsx';

const PayrollTransactionScreen = () => {
    const [payrollRecords, setPayrollRecords] = useState([]);
    const [error, setError] = useState(null);
    const [editRecordId, setEditRecordId] = useState(null);
    const [updatedRecord, setUpdatedRecord] = useState({});
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(null);
    const [employeeCount, setEmployeeCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [showBulkConfirmation, setShowBulkConfirmation] = useState(false); // For showing confirmation dialog for processing all records

    const [showProcessConfirmation, setShowProcessConfirmation] = useState(false);
    const token = localStorage.getItem('token');
    const companyId = localStorage.getItem('companyId');
    const [isProcessAllDisabled, setIsProcessAllDisabled] = useState(false); // Disable the button after processing



    const fetchPayrollRecords = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/PayrollRecord/getPayrollRecordsWithStatusTrueAndPayrollStatusFalse?companyId=${companyId}&month=${month}&year=${year}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setPayrollRecords(response.data || []);
        } catch (err) {
            // setError('Failed to load payroll records. Please try again later.');
            showToast('Failed to load payroll records. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch employee count
    const fetchEmployeeCount = async () => {
        if (!token) {
            showToast("Authentication token is missing.", 'warn');
            return;
        }

        try {
            const response = await axios.get(
                `http://${strings.localhost}/employees/count/active?companyId=${companyId}`,
                `http://${strings.localhost}/employees/count/active?companyId=${companyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setEmployeeCount(response.data);
        } catch (err) {
            showToast("Failed to fetch employee count.", 'error');
        }
    };


    // const fetchMonthlyPayrollData = async () => {
    //     if (!companyId || !year || !month) return; // Skip if any of the necessary values are missing

    //     try {
    //         const response = await axios.get(
    //             `http://localhost:5557/getmonthlypayrolldata/${companyId}/${year}/${month}`,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );
    //         // You can use the response data to update the state as needed
    //         console.log('Fetched monthly payroll data:', response.data);
    //         // Example: You can update payrollRecords with the response
    //         setPayrollRecords(response.data || []);
    //     } catch (err) {
    //         toast.error('Failed to fetch monthly payroll data. Please try again later.');
    //     }
    // };


    useEffect(() => {
        fetchPayrollRecords();
        fetchEmployeeCount();
        // fetchMonthlyPayrollData();
    }, [month, year]);




    const cancelProcessConfirmation = () => {
        setShowProcessConfirmation(false);
    };
    const handleConfirmProcessAll = async () => {
        // Set the confirmation dialog to show
        setShowBulkConfirmation(true);
    };

    const confirmBulkCheckboxChange = async () => {


        setShowBulkConfirmation(false); // Close the confirmation dialog

        try {
            const updatedRecords = payrollRecords.map((record) => ({
                ...record,
                proceedForPayrollStatus: true,
            }));

            // Send batch update to the backend (if API supports batch update)
            // If not, loop through each record and send a separate API request
            await Promise.all(
                payrollRecords.map((record) =>
                    axios.put(`http://${strings.localhost}/api/PayrollRecord/updateProceedStatus/${record.id}`, {
                        proceedForPayrollStatus: true,
                    })
                )
            );

            // Update the UI to reflect the changes
            setPayrollRecords(updatedRecords);
            showToast("All records marked as Proceed for Payroll successfully.", 'success');
            fetchPayrollRecords();

        } catch (error) {
            console.error("Error marking records for payroll:", error);
            showToast("Failed to update records. Please try again.", 'error');
        }
    };

    const cancelBulkCheckboxChange = () => {
        setShowBulkConfirmation(false); // Close the confirmation dialog without making changes
    };

    const handleEditClick = (record) => {
        setEditRecordId(record.id);
        setUpdatedRecord({
            actualWorkingDays: record.actualWorkingDays,
            assignHours: record.assignHours,
            expectedHours: record.expectedHours,
            dailyWorkingHours: record.dailyWorkingHours,
            totalWorkingHours: record.totalWorkingHours,
            incomeTaxDeduction: record.incomeTaxDeduction,
            actualHours: record.actualHours,
        });
    };

    const handleInputChange = (e, field) => {
        let value = e.target.value;
        if (value < 0) {
            value = 0;  // Set to 0 if negative number is entered
            showToast("Negative numbers are not allowed.", 'warn');
        }

        setUpdatedRecord({ ...updatedRecord, [field]: value });
    };
    const handleUpdateClick = async (id) => {
        try {
            await axios.put(`http://${strings.localhost}/api/PayrollRecord/updateFields/${id}`, updatedRecord, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPayrollRecords(
                payrollRecords.map((record) =>
                    record.id === id ? { ...record, ...updatedRecord } : record
                )
            );
            setEditRecordId(null);

            showToast('Payroll record updated successfully', 'success');
        } catch (error) {
            console.error('Error updating payroll record:', error);
            setError('Failed to update payroll record. Please try again.');
            showToast('Failed to update payroll record. Please try again.', 'error');
        }
    };

    const handleGenerateCTC = async () => {
        setShowConfirmation({
            action: 'generatePayroll',
            month,
            year,
        });
    };

    const handleGeneratePayroll = async () => {
        setIsProcessing(true);  // Disable buttons while processing
        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/ctcmain/createRecords/${companyId}?month=${month}&year=${year}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Success:', response.data);  // Log success message
            setShowConfirmation({
                action: 'payrollHoursSetup',
            });
            setIsProcessing(false);
            showToast('CTC records generated successfully.', 'success');
        } catch (error) {
            const errorMessage = error.response ? error.response.data : 'Failed to generate CTC records. Please try again.';
            console.error('Error:', errorMessage);  // Log error message
            setIsProcessing(false);
            showToast(errorMessage, 'error');  // Show specific error message
        }
    };
    const handlePayrollHoursSetupConfirmation = () => {
        setShowConfirmation({
            action: 'payrollHoursSetup',
        });
    };

    const handleProceedForPayrollConfirmation = (id) => {
        setShowConfirmation({
            action: 'proceedForPayroll',
            recordId: id,
        });
    };

    const handleProceedForPayroll = async () => {
        if (showConfirmation?.action === 'proceedForPayroll') {
            const { recordId } = showConfirmation;

            try {
                await axios.put(
                    `http://${strings.localhost}/api/PayrollRecord/updateProceedStatus/${recordId}`,
                    { proceedForPayrollStatus: true },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setShowConfirmation(null);
                showToast('Record marked as Proceed for Payroll successfully', 'success');
                fetchPayrollRecords();
            } catch (error) {
                showToast('Failed to mark record for payroll.', 'error');
            }
        }
    };

    const cancelConfirmation = () => {
        setShowConfirmation(null);  // Close the confirmation dialog
    };
    const handlePayrollHoursSetup = async () => {
        setIsProcessing(true);

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/PayrollRecord/merge?companyId=${companyId}&month=${month}&year=${year}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Payroll records genrated successfully:', response.data);
            fetchPayrollRecords();
            setShowConfirmation(null);

            showToast('Payroll records genrated successfully', 'success');
        } catch (error) {
            console.error('Error genrated payroll records:', error);
            showToast('Failed to genrating  payroll records. Please try again later.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };
   

    return (
        <div className="coreContainer">
            <div className="form-title">Payroll Basis</div>
            <div className='middleline-btn'>
                <div>
                    <select value={year} onChange={(e) => setYear(e.target.value)}>
                        {[...Array(5)].map((_, i) => {
                            const optionYear = new Date().getFullYear() - i;
                            return (
                                <option key={optionYear} value={optionYear}>
                                    {optionYear}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div>
                    <select value={month} onChange={(e) => setMonth(e.target.value)}>
                        {[...Array(12)].map((_, i) => (
                            <option key={i} value={i + 1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={handleGenerateCTC} className="btn" disabled={isProcessing}>
                    Get CTC Data
                </button>
            </div>
            {showConfirmation?.action === 'generatePayroll' && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <div className="popup-content">
                        <p>
                            Are you sure you want to generate CTC records for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}?
                        </p>
                        <div className="btnContainer">
                            <button onClick={handleGeneratePayroll} className="btn">
                                Yes
                            </button>
                            <button onClick={cancelConfirmation} className="outline-btn">
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showConfirmation?.action === 'payrollHoursSetup' && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <div className="popup-content">
                        <p>Have you setup payroll hours ?</p>
                        <div className="btnContainer">
                            <button onClick={handlePayrollHoursSetup} className="btn" disabled={isProcessing}>
                                Yes
                            </button>
                            <button onClick={cancelConfirmation} className="outline-btn">
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showConfirmation?.action === 'proceedForPayroll' && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <div className="popup-content">
                        <p>Are you sure you want to proceed for payroll?</p>
                        <div className="btnContainer">
                            <button onClick={handleProceedForPayroll} className="btn">
                                Yes
                            </button>
                            <button onClick={cancelConfirmation} className="outline-btn">
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showProcessConfirmation && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <div className="popup-content">
                        <p>Are you sure you want to proceed with payroll for all records?</p>
                        <div className="btnContainer">
                            <button onClick={handleConfirmProcessAll} className="btn" disabled={isProcessing}>
                                Yes
                            </button>
                            <button onClick={cancelProcessConfirmation} className="outline-btn">
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showBulkConfirmation && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <div className="popup-content">
                        <p>Are you sure you want to update the payroll status for all records?</p>
                        <div className="btnContainer">
                            <button onClick={confirmBulkCheckboxChange} className="btn">
                                Yes
                            </button>
                            <button onClick={cancelBulkCheckboxChange} className="outline-btn">
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <p>Loading payroll records...</p>
            ) : payrollRecords.length > 0 ? (
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Sr.No </th>
                            <th>Employee</th>
                            <th>Date</th>
                            <th>Fixed Salary</th>
                            <th>Per Day Salary</th>
                            <th>Per Hour Salary</th>
                            <th>Actual Hours</th>
                            <th>Total Working Hours</th>
                            <th>Actual Working Days</th>
                            <th>Daily Working Hours</th>
                            <th>Overtime Hours</th>
                            <th>Income Tax Deduction</th>
                            <th>Status</th>
                            <th>Proceed For Payroll Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payrollRecords.map((record, index) => (
                            <tr key={record.id}>
                                <td>{index + 1}</td>
                                <td>{record.employee.firstName} {record.employee.lastName}</td>
                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                <td>{(record.staticAmount || 0).toFixed(2)}</td>
                                <td>{(record.variableAmount || 0).toFixed(2)}</td>
                                <td>{(record.variableAmountPerHour || 0).toFixed(2)}</td>
                                <td>
                                    {editRecordId === record.id ? (
                                        <input
                                            type="number"
                                            value={updatedRecord.actualHours}
                                            onChange={(e) => handleInputChange(e, 'actualHours')}
                                            style={{ border: '1px solid #000', padding: '5px' }}  // Inline CSS for Income Tax Deduction field
                                        />
                                    ) : (
                                        record.actualHours
                                    )}
                                </td>
                                <td>{record.totalWorkingHours}</td>
                                <td>{record.actualWorkingDays}</td>
                                <td>{record.dailyWorkingHours}</td>
                                <td>{record.overtimeHours}</td>
                                <td>
                                    {editRecordId === record.id ? (
                                        <input
                                            type="number"
                                            value={updatedRecord.incomeTaxDeduction}
                                            onChange={(e) => handleInputChange(e, 'incomeTaxDeduction')}
                                            style={{ border: '1px solid #000', padding: '5px' }}  // Inline CSS for Income Tax Deduction field
                                        />
                                    ) : (
                                        record.incomeTaxDeduction
                                    )}
                                </td>
                                <td>
                                    <div
                                        className={`round-checkbox ${record.status ? 'active' : 'inactive'}`}
                                    ></div>
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={record.proceedForPayrollStatus}
                                        disabled={isProcessing}
                                        onChange={() => handleProceedForPayrollConfirmation(record.id)}
                                    />
                                </td>
                                <td>
                                    {editRecordId === record.id ? (
                                        <>
                                            <button type='button' className='btn' onClick={() => handleUpdateClick(record.id)}>Save</button>
                                            <button type='button' className='red-btn' onClick={() => setEditRecordId(null)} >Cancel</button>
                                        </>
                                    ) : (
                                        <button type='button' onClick={() => handleEditClick(record)} className="textbutton">Update</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <span style={{ color: 'red' }}>No payroll records found.</span>
            )}
            <div className="form-controls">
                <button onClick={handleConfirmProcessAll} className="btn" disabled={isProcessAllDisabled}>
                    Process All Transactions for Payroll
                </button>
            </div>
         

        </div>
    );
};
export default PayrollTransactionScreen;































































































// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FaUser, FaBuilding, FaProjectDiagram, FaClock } from 'react-icons/fa';
// import '../CommonCss/EnrollDashboard.css';
// import '../CommonCss/Main.css';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const PayrollTransactionScreen = () => {
//     const [payrollRecords, setPayrollRecords] = useState([]);
//     const [year, setYear] = useState(new Date().getFullYear());
//     const [month, setMonth] = useState(new Date().getMonth() + 1);
//     const [error, setError] = useState(null);
//     const [editRecordId, setEditRecordId] = useState(null);
//     const [updatedRecord, setUpdatedRecord] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [showConfirmation, setShowConfirmation] = useState(null); // Changed from '' to null
//     const [employeeCount, setEmployeeCount] = useState(0);
//     const [showPayrollPopup, setShowPayrollPopup] = useState(false); // Add state to handle payroll popup

//     const token = localStorage.getItem('token');
//     const companyId = localStorage.getItem('companyId');

//     const months = [
//         { value: 1, name: "January" },
//         { value: 2, name: "February" },
//         { value: 3, name: "March" },
//         { value: 4, name: "April" },
//         { value: 5, name: "May" },
//         { value: 6, name: "June" },
//         { value: 7, name: "July" },
//         { value: 8, name: "August" },
//         { value: 9, name: "September" },
//         { value: 10, name: "October" },
//         { value: 11, name: "November" },
//         { value: 12, name: "December" },
//     ];

//     const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

//     // Fetch payroll records from API
//     const fetchPayrollRecords = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(
//                 `http://localhost:5557/api/PayrollRecord/getPayrollRecordsWithStatusTrueAndPayrollStatusFalse?companyId=${companyId}`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );
//             setPayrollRecords(response.data || []);
//         } catch (err) {
//             console.error('Error fetching payroll records:', err);
//             setError('Failed to load payroll records. Please try again later.');
//             toast.error('Failed to load payroll records. Please try again later.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetch employee count
//     const fetchEmployeeCount = async () => {
//         if (!token) {
//             setError("Authentication token is missing.");
//             toast.error("Authentication token is missing.");
//             return;
//         }

//         try {
//             const response = await axios.get(
//                 `http://localhost:5557/employees/count/active?companyId=${companyId}`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );
//             setEmployeeCount(response.data); // Assuming the API returns the count directly
//         } catch (err) {
//             console.error("Error fetching employee count:", err);
//             setError("Failed to fetch employee count.");
//             toast.error("Failed to fetch employee count.");
//         }
//     };

//     useEffect(() => {
//         fetchPayrollRecords();
//         fetchEmployeeCount();
//     }, []); // Fetch once on mount

//     // Handle "Edit" button click
//     const handleEditClick = (record) => {
//         setEditRecordId(record.id);
//         setUpdatedRecord({
//             actualWorkingDays: record.actualWorkingDays,
//             assignHours: record.assignHours,
//             expectedHours: record.expectedHours,
//             dailyWorkingHours: record.dailyWorkingHours,
//             totalWorkingHours: record.totalWorkingHours,
//             incomeTaxDeduction: record.incomeTaxDeduction,
//             actualHours: record.actualHours, // Make actualHours editable
//         });
//     };

//     // Handle input change in editable fields
//     const handleInputChange = (e, field) => {
//         setUpdatedRecord({ ...updatedRecord, [field]: e.target.value });
//     };

//     // Save updated fields to backend
//     const handleSaveClick = async (id) => {
//         try {
//             await axios.put(`http://localhost:5557/api/PayrollRecord/updateFields/${id}`, updatedRecord, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             setPayrollRecords(
//                 payrollRecords.map((record) =>
//                     record.id === id ? { ...record, ...updatedRecord } : record
//                 )
//             );
//             setEditRecordId(null); // Exit edit mode
//             toast.success('Payroll record updated successfully!');
//         } catch (error) {
//             console.error('Error updating payroll record:', error);
//             setError('Failed to update payroll record. Please try again.');
//             toast.error('Failed to update payroll record. Please try again.');
//         }
//     };

//     // Format date as dd-MM-yyyy
//     const formatDate = (date) => {
//         const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//         return new Date(date).toLocaleDateString('en-GB', options);
//     };

//     // Handle checkbox change with confirmation
//     const handleCheckboxChange = (id, field, value) => {
//         setShowConfirmation({
//             id,
//             field,
//             value,
//         });
//     };

//     // Confirm checkbox change
//     const confirmCheckboxChange = async () => {
//         const { id, field, value } = showConfirmation;

//         // Optimistic UI update
//         setPayrollRecords((prevRecords) =>
//             prevRecords.map((record) =>
//                 record.id === id ? { ...record, [field]: value } : record
//             )
//         );

//         setShowConfirmation(null); // Close the confirmation dialog

//         try {
//             await axios.put(`http://localhost:5557/api/PayrollRecord/updateProceedStatus/${id}`, {
//                 [field]: value,
//             }, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             toast.success('Payroll status updated successfully!');
//         } catch (error) {
//             console.error(`Error updating ${field}:`, error);
//             setError('Failed to update payroll status. Please try again.');
//             toast.error('Failed to update payroll status. Please try again.');

//             // Revert the state if backend update fails
//             setPayrollRecords((prevRecords) =>
//                 prevRecords.map((record) =>
//                     record.id === id ? { ...record, [field]: !value } : record
//                 )
//             );
//         }
//     };

//     // Cancel checkbox change
//     const cancelCheckboxChange = () => {
//         setShowConfirmation(null); // Close the confirmation dialog without making changes
//     };

//     // Handle "Process All Transactions for Payroll"
//     const handleCheckAllForPayroll = async () => {
//         try {
//             const updatedRecords = payrollRecords.map((record) => ({
//                 ...record,
//                 proceedForPayrollStatus: true,
//             }));

//             await Promise.all(
//                 payrollRecords.map((record) =>
//                     axios.put(`http://localhost:5557/api/PayrollRecord/updateProceedStatus/${record.id}`, {
//                         proceedForPayrollStatus: true,
//                     })
//                 )
//             );

//             setPayrollRecords(updatedRecords);
//             toast.success("All records marked as Proceed for Payroll successfully!");

//         } catch (error) {
//             console.error("Error marking records for payroll:", error);
//             toast.error("Failed to update records. Please try again.");
//         }
//     };

//     const handlePayRollClick = async () => {
//         setShowPayrollPopup(true); // Show confirmation popup before generating payroll
//     };

//     const confirmGeneratePayroll = async () => {
//         try {
//             await axios.post(
//                 `http://localhost:5557/api/PayrollRecord/storePayrollRecords/${companyId}`,
//                 {},
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );
//             toast.success('Payroll processing completed successfully!');
//             fetchPayrollRecords(); // Refresh records after processing
//         } catch (error) {
//             console.error('Error processing payroll:', error);
//             setError('Failed to process payroll. Please try again.');
//             toast.error('Failed to process payroll. Please try again.');
//         } finally {
//             setShowPayrollPopup(false); // Close popup after processing
//         }
//     };

//     const cancelGeneratePayroll = () => {
//         setShowPayrollPopup(false); // Close popup without generating payroll
//     };

//     return (
//         <div className="enrollment-dashboard">
//             <div className='form-title'>Payroll Basis</div>
//             <div className='form-controls'>
//                 <button onClick={handlePayRollClick} className="btn">
//                     Generate Payroll
//                 </button>
//             </div>

//             {/* Show confirmation popup for Generate Payroll */}
//             {showPayrollPopup && (
//                 <div className="confirmation-dialog">
//                     <p>Are you sure you want to generate payroll for the selected period?</p>
//                     <button onClick={confirmGeneratePayroll}>Yes</button>
//                     <button onClick={cancelGeneratePayroll}>No</button>
//                 </div>
//             )}

//             <div className="input-row" style={{ width: '400px', marginBottom: '20px' }}>
//                 <div>
//                     <select value={year} onChange={(e) => setYear(e.target.value)}>
//                         <option value="">Select Year</option>
//                         {years.map((yr) => (
//                             <option key={yr} value={yr}>
//                                 {yr}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//                 <div>
//                     <select value={month} onChange={(e) => setMonth(e.target.value)}>
//                         <option value="">Select Month</option>
//                         {months.map((mo) => (
//                             <option key={mo.value} value={mo.value}>
//                                 {mo.name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//             </div>

//             {error && <p className="error-message">{error}</p>}
//             {loading ? (
//                 <p>Loading payroll records...</p>
//             ) : payrollRecords.length > 0 ? (
//                 <table className="styled-table">
//                     <thead>
//                         <tr>
//                             <th>Sr.No </th>
//                             <th>Employee</th>
//                             <th>Date</th>
//                             <th>Fixed Salary</th>
//                             <th>Per Day Salary</th>
//                             <th>Per Hour Salary</th>
//                             <th>Actual Hours</th>
//                             <th>Total Working Hours</th>
//                             <th>Total Working Days</th>
//                             <th>Actual Working Days</th>
//                             <th>Daily Working Hours</th>
//                             <th>Overtime Hours</th>
//                             <th>Income Tax Deduction</th>
//                             <th>Status</th>
//                             <th>Proceed For Payroll Status</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {payrollRecords.map((record, index) => (
//                             <tr key={record.id}>
//                                 <td>{index + 1}</td>
//                                 <td>{record.employee.firstName} {record.employee.lastName}</td>
//                                 <td>{formatDate(record.date)}</td>
//                                 <td>{(record.staticAmount || 0).toFixed(2)}</td>
//                                 <td>{(record.variableAmount || 0).toFixed(2)}</td>
//                                 <td>{(record.variableAmountPerHour || 0).toFixed(2)}</td>
//                                 <td>
//                                     {editRecordId === record.id ? (
//                                         <input
//                                             type="number"
//                                             value={updatedRecord.actualHours || ''}
//                                             onChange={(e) => handleInputChange(e, 'actualHours')}
//                                         />
//                                     ) : (
//                                         record.actualHours
//                                     )}
//                                 </td>
//                                 <td>
//                                     {editRecordId === record.id ? (
//                                         <input
//                                             type="number"
//                                             value={updatedRecord.totalWorkingHours || ''}
//                                             onChange={(e) => handleInputChange(e, 'totalWorkingHours')}
//                                         />
//                                     ) : (
//                                         record.totalWorkingHours
//                                     )}
//                                 </td>
//                                 <td>
//                                     {editRecordId === record.id ? (
//                                         <input
//                                             type="number"
//                                             value={updatedRecord.actualWorkingDays || ''}
//                                             onChange={(e) => handleInputChange(e, 'actualWorkingDays')}
//                                         />
//                                     ) : (
//                                         record.actualWorkingDays
//                                     )}
//                                 </td>
//                                 <td>{record.dailyWorkingHours ? (record.actualHours / record.dailyWorkingHours).toFixed(0) : "N/A"}</td>
//                                 <td>
//                                     {editRecordId === record.id ? (
//                                         <input
//                                             type="number"
//                                             value={updatedRecord.dailyWorkingHours || ''}
//                                             onChange={(e) => handleInputChange(e, 'dailyWorkingHours')}
//                                         />
//                                     ) : (
//                                         record.dailyWorkingHours
//                                     )}
//                                 </td>
//                                 <td>{record.overtimeHours}</td>
//                                 <td>
//                                     {editRecordId === record.id ? (
//                                         <input
//                                             type="number"
//                                             value={updatedRecord.incomeTaxDeduction || ''}
//                                             onChange={(e) => handleInputChange(e, 'incomeTaxDeduction')}
//                                         />
//                                     ) : (
//                                         record.incomeTaxDeduction
//                                     )}
//                                 </td>
//                                 <td>
//                                     <div className={`round-checkbox ${record.status ? 'active' : 'inactive'}`} title={record.status ? 'Active' : 'Inactive'}></div>
//                                 </td>
//                                 <td>
//                                     <input
//                                         type="checkbox"
//                                         className={`round-checkbox ${record.proceedForPayrollStatus ? 'active' : 'inactive'}`}
//                                         checked={!!record.proceedForPayrollStatus}
//                                         onChange={() => handleCheckboxChange(record.id, 'proceedForPayrollStatus', !record.proceedForPayrollStatus)}
//                                     />
//                                     {showConfirmation && showConfirmation.id === record.id && (
//                                         <div className="confirmation-dialog">
//                                             <p>Are you sure you want to update this status?</p>
//                                             <button onClick={confirmCheckboxChange}>Yes</button>
//                                             <button onClick={cancelCheckboxChange}>No</button>
//                                         </div>
//                                     )}
//                                 </td>
//                                 <td>
//                                     {editRecordId === record.id ? (
//                                         <button onClick={() => handleSaveClick(record.id)}>Save</button>
//                                     ) : (
//                                         <button onClick={() => handleEditClick(record)}>Edit</button>
//                                     )}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             ) : (
//                 <p>No payroll records available for the selected month and year.</p>
//             )}

//             <div className="employee-count">
//                 Total Active Employees: {employeeCount}
//             </div>

//
//         </div>
//     );
// };

// export default PayrollTransactionScreen;
