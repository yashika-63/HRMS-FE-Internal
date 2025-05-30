import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CommonCss/EnrollDashboard.css';
import { toast } from 'react-toastify';
import { strings } from '../../string';
import '../CommonCss/Main.css';
import { showToast } from '../../Api.jsx';
const ProcessedPayRollTransection = () => {
    const [payrollRecords, setPayrollRecords] = useState([]);
    const [error, setError] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
    const [status, setStatus] = useState('unpaid'); // Default to 'paid'
    const companyId = localStorage.getItem('companyId');
    const token = localStorage.getItem('token');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Fetch payroll records based on the selected status, year, and month
    const fetchPayrollRecords = async () => {
        try {
            let apiUrl = '';
            if (status === 'unpaid') {
                apiUrl = `http://${strings.localhost}/api/PayrollRecord/company/${companyId}?proceedForPayment=false&year=${year}&month=${month}`;
            } else {
                apiUrl = `http://${strings.localhost}/api/PayrollRecord/company/${companyId}?proceedForPayment=true&year=${year}&month=${month}`;
            }
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const updatedRecords = response.data.map((record) => ({
                ...record,
                proceedForPaymentStatus: record.proceedForPayment ? true : false,
            }));

            setPayrollRecords(updatedRecords || []);
            console.log('Fetched Payroll Records:', updatedRecords);
        } catch (err) {
            showToast('Failed to load payroll records. Please try again later.', 'error');
        }
    };


    useEffect(() => {
        fetchPayrollRecords();
    }, [status, year, month]);

    // Format date to dd-MM-yyyy
    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Round amounts to two decimal places
    const formatAmount = (amount) => parseFloat(amount).toFixed(2);
    const handlePayRollClick = async () => {
        try {
            // Assign the result of axios.post to a variable
            const response = await axios.post(
                `http://${strings.localhost}/api/PayrollRecord/processByCompany/${companyId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Now log the response data
            console.log('API response:', response.data);

            // Show a success toast
            showToast('Payroll processing completed successfully', 'success');

            // Fetch updated payroll records
            fetchPayrollRecords();
        } catch (error) {
            console.error('Error processing payroll:', error);
            setError('Failed to process payroll. Please try again.');
            showToast('Failed to process payroll. Please try again.', 'error');
        }
    };

    const exportToCSV = () => {
        // Filter records that are marked as processed (proceedForPayrollStatus is true)
        const filteredRecords = payrollRecords.filter(record => record.proceedForPayrollStatus === true);

        if (filteredRecords.length === 0) {
            showToast('No records to export.', 'warn');
            return;
        }

        // Get the headers dynamically from the first record's keys
        const headers = Object.keys(filteredRecords[0])
            .filter(key => key !== 'employee') // Exclude the 'employee' field for now
            .concat(['Employee First Name', 'Employee Last Name', 'Employee ID']); // Add employee details

        // Generate CSV content
        const csvContent = [
            headers.join(','),
            ...filteredRecords.map(record => {
                const employee = record.employee || {}; // Ensure employee object exists
                return [
                    ...Object.values(record)
                        .filter((_, index) => index !== Object.keys(record).indexOf('employee')) // Exclude employee field values
                        .map(value => (value != null ? value : '')), // Avoid null or undefined in CSV
                    employee.firstName,
                    employee.lastName,
                    employee.employeeId,
                ].join(',');
            }),
        ].join('\n');

        // Create a Blob for the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv' });

        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Payroll_Records_${new Date().toLocaleDateString()}.csv`;

        // Trigger the download
        link.click();
    };
    return (
        <div className='coreContainer'>
            <div className="form-title"> PayRoll Processed Screen</div>
            <div className="input-row">
                <div>
                    {/* <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="filter-dropdown"
                    >
                        {[2025, 2024, 2023, 2022].map((yr) => (
                            <option key={yr} value={yr}>
                                {yr}
                            </option>
                        ))}
                    </select> */}
                    <select value={year} onChange={(e) => setYear(e.target.value)}>
                        {[...Array(5)].map((_, i) => {
                            const yr = new Date().getFullYear() - i;
                            return (
                                <option key={yr} value={yr}>
                                    {yr}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div>
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="filter-dropdown"
                    >
                        {monthNames.map((monthName, index) => (
                            <option key={index} value={index + 1}>
                                {monthName}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="filter-dropdown"
                    >
                        <option value="paid">Processed</option>
                        <option value="unpaid">Pending</option>
                    </select>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            {/* Payroll Records Table */}
            {payrollRecords.length > 0 ? (
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Employee</th>
                            <th style={{ width: '80px' }}>Date</th>
                            <th>Fixed Salary</th>
                            <th>Per Day Salary</th>
                            <th>Per Hour Salary</th>
                            <th>Assign Hours</th>
                            <th>Expected Hours</th>
                            <th>Actual Hours</th>
                            <th>Total Working Hours</th>
                            <th>Total Working Days</th>
                            <th>Daily Working Hours</th>
                            <th>Income Tax Deduction</th>
                            <th>Status</th>
                            <th>Payroll Processed Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payrollRecords.map((record, index) => (
                            <tr key={record.id}>
                                <td>{index + 1}</td>
                                <td>{record.employee.firstName} {record.employee.lastName}</td>
                                <td>{formatDate(record.date)}</td>
                                <td>{formatAmount(record.staticAmount)}</td>
                                <td>{formatAmount(record.variableAmount)}</td>
                                <td>{formatAmount(record.variableAmountPerHour)}</td>
                                <td>{record.assignHours}</td>
                                <td>{record.expectedHours}</td>
                                <td>{record.actualHours}</td>
                                <td>{record.totalWorkingHours}</td>
                                <td>{record.actualWorkingDays}</td>
                                <td>{record.dailyWorkingHours}</td>
                                <td>{record.incomeTaxDeduction}</td>
                                <td>
                                    <div
                                        className={`round-checkbox ${record.status ? 'active' : ''}`}
                                    ></div>
                                </td>
                                <td>
                                    <div
                                        className={`round-checkbox ${record.proceedForPayrollStatus ? 'active' : ''}`}
                                    ></div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <span style={{ color: 'red' }}>No payroll records found.</span>

            )}

            {/* <div>
                <button onClick={fetchPayrollRecords} className="btn">
                    Refresh Payroll Data
                </button>
            </div> */}
            {payrollRecords.length > 0 && (
                <div className='form-controls' onClick={handlePayRollClick}>
                    <button className='btn'>Proceed All</button>
                </div>
            )}
            <div className='form-controls'>
                <button className="btn" onClick={exportToCSV} disabled={payrollRecords.length === 0} > Export to CSV</button>
            </div>
        </div>
    );
};

export default ProcessedPayRollTransection;
