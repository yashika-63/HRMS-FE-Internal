import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../Api.jsx";
import { strings } from "../../string";
import { useNavigate } from "react-router-dom";

const PayrollDashboard = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [status, setStatus] = useState(0);
  const [data, setData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false); // Track visibility of confirmation popup
  const [recordIdToUpdate, setRecordIdToUpdate] = useState(null); // Track the record to update
  const companyId = localStorage.getItem("companyId");
  const navigate = useNavigate();

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);


  const statuses = [
    { value: 1, label: "Paid" },
    { value: 0, label: "Unpaid" },
  ];


  // Format date as dd-MM-yyyy
  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-GB', options);
  };


  useEffect(() => {
    const fetchData = async () => {
      if (year && month && status !== "") {
        try {
          const response = await axios.get(`http://${strings.localhost}/api/payrollProcessed/byMonthYearCompanyAndStatus`,
            {
              params: {
                month,
                year,
                companyId,
                status,
              },
            }
          );
          setData(response.data);
        } catch (error) {
          console.error("Error fetching payroll data", error);
          showToast("Error Fetching Data", 'error');
          setData(null);
        }
      }
    };

    fetchData();
  }, [year, month, status, companyId]);

  const handleUpdateStatus = async () => {
    setShowConfirmation(false);

    try {
      // First, update the payment status
      const updatePaymentStatusAPI = axios.put(`http://${strings.localhost}/api/payrollProcessed/updatePaymentStatus/${recordIdToUpdate}`
      );

      // Find the payroll record associated with the recordIdToUpdate
      const payrollDataResponse = await axios.get(`http://${strings.localhost}/api/payrollProcessed/byMonthYearCompanyAndStatus`,
        {
          params: {
            month,
            year,
            companyId,
            status,
          },
        }
      );
      const payrollData = payrollDataResponse.data;

      // Extract the payroll record ID for generating the payslip
      const payrollRecord = payrollData.find(
        (record) => record.id === recordIdToUpdate
      );

      if (!payrollRecord || !payrollRecord.payrollRecordayrollRecord?.id) {
        throw new Error("Payroll record not found or invalid.");
      }

      const payrollRecordId = payrollRecord.payrollRecordayrollRecord.id;

      // API call for generating the payslip
      const generatePaySlipAPI = axios.post(`http://${strings.localhost}/api/PaySlip/generate/${payrollRecordId}`);

      // Execute both APIs concurrently using Promise.all
      await Promise.all([updatePaymentStatusAPI, generatePaySlipAPI]);

      showToast("Payment status updated and Pay Slip generated successfully.", 'success');

      // Refresh data after successful updates
      const refreshedData = await axios.get(`http://${strings.localhost}/api/payrollProcessed/byMonthYearCompanyAndStatus`,
        {
          params: {
            month,
            year,
            companyId,
            status,
          },
        }
      );
      setData(refreshedData.data);
    } catch (error) {
      console.error("Error updating payment status or generating Pay Slip", error);
      showToast("Failed to update payment status or generate Pay Slip.", 'error');
    }
  };


  const openConfirmationPopup = (recordId) => {
    setRecordIdToUpdate(recordId); // Set the recordId to update
    setShowConfirmation(true); // Show confirmation dialog
  };
  const handleRowClick = (id) => {
    navigate(`/payslip/${id}`);
  };

  // Function to export data to CSV
  // const exportToCSV = () => {
  //   if (!data || data.length === 0) {
  //     showToast("No data available to export.", 'error');
  //     return;
  //   }

  //   // Extract the headers dynamically from the keys of the first record
  //   const headers = Object.keys(data[0]);

  //   // Create CSV rows
  //   const rows = data.map(item => {
  //     return headers.map(header => {
  //       // Check for nested fields like employee data
  //       const field = header.split('.').reduce((acc, part) => acc && acc[part], item);
  //       return field !== undefined ? `"${field}"` : '""'; // Handle undefined fields gracefully
  //     }).join(',');
  //   });

  //   // Combine headers and rows into CSV format
  //   const csvContent = [headers.join(','), ...rows].join('\n');

  //   // Create a Blob from the CSV content and trigger download
  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const link = document.createElement("a");
  //   if (link.download !== undefined) {
  //     const url = URL.createObjectURL(blob);
  //     link.setAttribute("href", url);
  //     link.setAttribute("download", `payroll_${year}_${month}_${status === 1 ? 'paid' : 'unpaid'}.csv`);
  //     link.click();
  //   }
  // };


  return (
    <div className="coreContainer">
      <div className="form-title">Payroll Processed Data</div>
      <div className="input-row">
        <div>
          {/* <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Select Year</option>
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select> */}
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Select Year</option>
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
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">Select Month</option>
            {months.map((mo) => (
              <option key={mo.value} value={mo.value}>
                {mo.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Select Status</option>
            {statuses.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {data && data.length > 0 ? (
        <table className="styled-table" style={{ marginTop: "40px" }}>
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Employee ID</th>
              <th>Employee Name</th>
              {/* <th>Date</th> */}
              <th>Date</th>
              <th>Ideal Amount (Days)</th>
              <th>Actual Amount (Days)</th>
              <th>Total Deduction</th>
              <th>Total InHand</th>
              <th>Income Tax Deduction</th>
              <th>Ideal Working Days</th>
              <th>Actual Working Days</th>
              <th> Overtime Amount</th>

              <th>Paid Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{index+1}</td>
                {/* Row Click (excludes the last Paid Status column) */}
                <td onClick={() => handleRowClick(item.employee.id)}>{item.employee.employeeId}</td>
                <td onClick={() => handleRowClick(item.employee.id)}>
                  {item.employee.firstName} {item.employee.middleName} {item.employee.lastName}
                </td>
                <td>{formatDate(item.date)}</td>
                <td onClick={() => handleRowClick(item.employee.id)}>
                  {item.idealAmountForEmployeeToPaidForDays.toFixed(2)}
                </td>
                <td onClick={() => handleRowClick(item.employee.id)}>
                  {item.actualAmountForEmployeeToPaidForDays.toFixed(2)}
                </td>
                <td>{item.totalDiduction.toFixed(2)}</td>
                <td>{item.totalInhand.toFixed(2)}</td>
                <td>
                  {item.incomeTaxDeduction != null && !isNaN(item.incomeTaxDeduction)
                    ? item.incomeTaxDeduction.toFixed(3)
                    : 'N/A'}
                </td>
                {/* <td>{item.incomeTaxDeduction}</td> */}
                <td onClick={() => handleRowClick(item.employee.id)}>
                  {item.idealWorkingdaysForThisPayroll}
                </td>
                <td onClick={() => handleRowClick(item.employee.id)}>
                  {item.actualWorkingdaysForThisPayroll}
                </td>
                <td>{item.overtimeAmount.toFixed(2)}</td>

                {/* <td>{item.idealAmountForEmployeeToPaidForDays.toFixed(2)}</td>
                <td>{item.actualAmountForEmployeeToPaidForDays.toFixed(2)}</td>
                <td>{item.idealWorkingdaysForThisPayroll}</td>
                <td>{item.actualWorkingdaysForThisPayroll}</td> */}
                {/* <td>{item.actualWorkingdaysForThisPayroll}</td>  */}
                <td>
                  <div
                    className={`round-checkbox ${item.paymentPaidStatus ? "active" : ""}`}
                    onClick={
                      !item.paymentPaidStatus
                        ? () => openConfirmationPopup(item.id)
                        : null
                    }
                    title={
                      !item.paymentPaidStatus
                        ? "Click to mark as Paid"
                        : "Already Paid"
                    }
                  ></div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      ) : (
        <p><span style={{ color: 'red' }}>No records found.</span></p>
      )}

      {showConfirmation && (
        <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
          <p>Are you sure you want to update this status to Paid?</p>
          <div className="btnContainer">
            <button className="btn" onClick={handleUpdateStatus} > Yes </button>
            <button className="btn" onClick={() => setShowConfirmation(false)} >  No </button>
          </div>
        </div>
      )}
      {/* <div className="form-controls">
        <button type="button" onClick={exportToCSV} className="btn">Export to CSV</button>

      </div> */}
    </div>
  );
};

export default PayrollDashboard;

