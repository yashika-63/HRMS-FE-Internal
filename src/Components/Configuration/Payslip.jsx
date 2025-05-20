import React, { useEffect, useState } from "react";
import axios from 'axios';
import '../CommonCss/Payslip.css';
import { useParams,useNavigate } from "react-router-dom";
import { strings } from "../../string";
import { useCompanyLogo } from "../../Api.jsx";
const Payslip = () => {
  const { id: employeeId } = useParams();
  const [companyName, setCompanyName] = useState("");
  const accountId = localStorage.getItem('accountId');
  const companyId = localStorage.getItem("companyId");
  const logo = useCompanyLogo(companyId);
  const [companyAdress, setCompanyAdress] = useState("");
  const navigate =useNavigate();
  const [companyAssignId, setCompanyAssignId] = useState("");
  const [employee, setEmployee] = useState({
    name: "",
    employeeId: "",
    designation: "",
    panNo: "",
    email: "",
    department: "",
    joiningDate: "",
    balanceLeaves: 0,
  });
  const [payslipData, setPayslipData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [incomeData, setIncomeData] = useState([]);
  const [deductionData, setDeductionData] = useState([]);
  const totalDeduction = deductionData.reduce((sum, item) => sum + item.amount, 0) + (deductionData.incomeTaxDeduction ? deductionData.incomeTaxDeduction.amount : 0).toFixed(2);
  // Constants for months and years
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, index) => currentYear - index);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`);
        const employeeData = response.data;

        setEmployee({
          name: `${employeeData.firstName} ${employeeData.middleName} ${employeeData.lastName}`,
          employeeId: employeeData.employeeId,
          designation: employeeData.designation,
          department: employeeData.department,
          email: employeeData.email,
          panNo: employeeData.panNo,
          joiningDate: employeeData.joiningDate,
          balanceLeaves: employeeData.balanceLeaves || 0,
        });

        const companyAssignId = employeeData.companyRegistration?.companyAssignId;
        if (companyAssignId) {
          setCompanyAssignId(companyAssignId);
        }
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [employeeId]);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!companyAssignId || !accountId) return;

      try {
        const companyResponse = await axios.get(
          `http://${strings.localhost}/api/CompanyRegistartion/GetCompanyByIds?companyAssignId=${companyAssignId}&accountId=${accountId}`
        );
        const company = companyResponse.data[0];
        if (company) {
          setCompanyName(company.companyName);
          setCompanyAdress(company.companyAdress);
        }
      } catch (error) {
        console.error("Error fetching company details:", error.message);
      }
    };

    fetchCompanyDetails();
  }, [companyAssignId, accountId]);

  useEffect(() => {
    const fetchPayslipData = async () => {
      if (selectedYear && selectedMonth) {
        try {
          const payslipResponse = await axios.get(`http://${strings.localhost}/api/PaySlip/employee`, {
            params: {
              employeeId: employeeId,
              year: selectedYear,
              month: selectedMonth
            }
          });
          setPayslipData(payslipResponse.data);

          const incomeItems = payslipResponse.data.filter(item => item.type === true);
          const deductionItems = payslipResponse.data.filter(item => item.type === false);

          setIncomeData(incomeItems);
          setDeductionData(deductionItems);
        } catch (error) {
          console.error("Error fetching payslip data:", error);
        }
      }
    };

    fetchPayslipData();
  }, [employeeId, selectedMonth, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const numberWords = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
    "Twenty", "Twenty One", "Twenty Two", "Twenty Three", "Twenty Four", "Twenty Five", "Twenty Six",
    "Twenty Seven", "Twenty Eight", "Twenty Nine", "Thirty", "Thirty One", "Thirty Two", "Thirty Three",
    "Thirty Four", "Thirty Five", "Thirty Six", "Thirty Seven", "Thirty Eight", "Thirty Nine", "Forty",
    "Forty One", "Forty Two", "Forty Three", "Forty Four", "Forty Five", "Forty Six", "Forty Seven",
    "Forty Eight", "Forty Nine", "Fifty", "Fifty One", "Fifty Two", "Fifty Three", "Fifty Four",
    "Fifty Five", "Fifty Six", "Fifty Seven", "Fifty Eight", "Fifty Nine", "Sixty", "Sixty One", "Sixty Two",
    "Sixty Three", "Sixty Four", "Sixty Five", "Sixty Six", "Sixty Seven", "Sixty Eight", "Sixty Nine",
    "Seventy", "Seventy One", "Seventy Two", "Seventy Three", "Seventy Four", "Seventy Five", "Seventy Six",
    "Seventy Seven", "Seventy Eight", "Seventy Nine", "Eighty", "Eighty One", "Eighty Two", "Eighty Three",
    "Eighty Four", "Eighty Five", "Eighty Six", "Eighty Seven", "Eighty Eight", "Eighty Nine", "Ninety",
    "Ninety One", "Ninety Two", "Ninety Three", "Ninety Four", "Ninety Five", "Ninety Six", "Ninety Seven",
    "Ninety Eight", "Ninety Nine", "Hundred"
  ];

  const convertNumberToWords = (num) => {
    if (num === 0) return "Zero";
    const lakh = Math.floor(num / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const hundred = Math.floor((num % 1000) / 100);
    const remainder = num % 100;

    let result = "";

    if (lakh > 0) {
      result += numberWords[lakh] + " Lakh ";
    }
    if (thousand > 0) {
      result += numberWords[thousand] + " Thousand ";
    }
    if (hundred > 0) {
      result += numberWords[hundred] + " Hundred ";
    }
    if (remainder > 0) {
      result += numberWords[remainder];
    }

    if (num === remainder) {
      result += " Only";
    }

    return result.trim();
  };

  const filteredIncomeData = incomeData.filter(item => item.lable !== "Professional Tax");

  const firstPayslipItem = payslipData[1] || {};
  const actualWorkingHours = firstPayslipItem.actualWorkingHours || 0;
  const totalWorkingHours = firstPayslipItem.totalWorkingHours || 0;
  const overtimeHours = firstPayslipItem.overtimeHours || 0;
  const netSalary = firstPayslipItem.netSalary || 0;
  const incometaxdeduction = firstPayslipItem.incomeTaxDeduction || 0;
  const professionalTax = firstPayslipItem.professionalTax || 0;


  const handleDownloadPDF = () => {
    const payslipElement = document.querySelector(".payslip-container");

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <body>
          <div style="width: 100%; font-size: 12px;">
            ${payslipElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // Clean up
    document.body.removeChild(iframe);
  };

  const handleDownloadExcel = () => {
    const payslipTable = document.querySelector(".payslip-container table");

    let csvContent = "";
    Array.from(payslipTable.rows).forEach(row => {
      const rowData = Array.from(row.cells).map(cell => cell.innerText).join(",");
      csvContent += rowData + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "payslip.csv";
    link.click();
  };

  const handleDownloadWord = () => {
    const payslipElement = document.querySelector(".payslip-container");

    const htmlContent = `
      <html>
        <body>
          <div>
            ${payslipElement.innerHTML}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "payslip.doc";
    link.click();
  };

  const handleDownloadImage = () => {
    const payslipElement = document.querySelector(".payslip-container");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = payslipElement.offsetWidth;
    const height = payslipElement.offsetHeight;

    canvas.width = width;
    canvas.height = height;

    // Draw the payslip content on the canvas
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "12px Arial";
    ctx.fillStyle = "#000";

    // This is a simple example, but ideally you'd need to draw each element (text, tables, etc.)
    ctx.fillText(payslipElement.innerText, 10, 10); // For simplicity, we draw text here

    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = "payslip.png";
    link.click();
  };

  const handleBack = () => {
    navigate(`/ListEmp`);
  };

  return (
    <div>
      <div className="year-select-container" style={{gap:'20px'}}>
        <div className="year-dropdown">
          <label htmlFor="year">Year:</label>
          <select id="year" value={selectedYear} onChange={handleYearChange}>
            <option value="">Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="month-dropdown">
          <label htmlFor="month">Month:</label>
          <select id="month" value={selectedMonth} onChange={handleMonthChange}>
            <option value="">Select Month</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="payslip-container">
        <div className="payslip-header" >
          <div className="companyInfo">
            <h2 className="company-name">{companyName || "Loading Company Name..."}</h2>
            <p className="company-address">{companyAdress || "Loading Company Adress..."}</p>
          </div>
          <img className='HRMSNew'   src={logo}  alt="Pristine Logo" width={120} height={30} />
        </div>


        <table className="employee-info">
          <thead>
            <tr>
              <th colSpan="3">Employee Information</th>
              <th colSpan='2' style={{ fontSize: '0.6rem', fontWeight: 'lighter' }}>  Pay Slip for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</th>

              {/* <th>Date:</th> */}
            </tr>

          </thead>
          <tbody>
            <tr>
              <td><strong>Employee ID</strong></td>
              <td>{employee.employeeId || "Loading..."}</td>
              <td><strong>Employee Name</strong></td>
              <td>{employee.name || "Loading..."}</td>
            </tr>
            <tr>
              <td><strong>Email id</strong></td>
              <td>{employee.email || "Loading..."}</td>
              <td><strong>PAN No</strong></td>
              <td>{employee.panNo || "Loading..."}</td>
            </tr>
            <tr>
              <td><strong>Designation</strong></td>
              <td>{employee.designation || "Loading..."}</td>
              <td><strong>Department</strong></td>
              <td>{employee.department || "Loading..."}</td>
            </tr>
            <tr>
              <td><strong>Office Work Hours</strong></td>
              <td>{totalWorkingHours}</td>
              <td><strong> Working Hours</strong></td>
              <td>{actualWorkingHours}</td>
            </tr>
            <tr>
              <td><strong> Overtime Hours</strong></td>
              <td>{overtimeHours}</td>
              <td><strong>Joining Date </strong></td>
              <td>{employee.joiningDate}</td>
            </tr>
            {/* <tr >
              <th colSpan='3'><strong>Monthly Gross Salary</strong></th>
              <th>{netSalary.toFixed(0)}</th>
            </tr> */}
          </tbody>

        </table>

        <div className="income-deduction-section">
          <table className="income-table">
            <thead>
              <tr><th colSpan="2" style={{ borderBottom: '1px solid grey', textAlign: 'center' }}>Income</th></tr>
              <tr><th>Particulars</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {incomeData.map((item) => (
                <tr key={item.id}>
                  <td>{item.lable}</td>
                  <td className="amount">{item.amount.toFixed(2)}</td></tr>
              ))}
              {deductionData.map((item) => (
                item.lable !== "Professional Tax" ? (
                  <tr key={item.id}>
                    <td>{item.lable}</td>
                    <td className="amount">{item.amount.toFixed(2)}</td>
                  </tr>
                ) : null
              ))}
            </tbody>
            <tfoot>
              <tr><td>Total Income</td><td className="amount">{netSalary.toFixed(2)} </td></tr>
            </tfoot>
          </table>

          <table className="deduction-table">
            <thead>
              <tr><th style={{ borderBottom: '1px solid grey', textAlign: 'center' }} colSpan="2">Deduction</th></tr>
              <tr><th>Particulars</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {deductionData.map((item) => (
                item.lable !== "Income Tax" && item.lable !== "Professional Tax" ? (
                  <tr key={item.id}>
                    <td>{item.lable}</td>
                    <td className="amount">{item.amount.toFixed(2)}</td>
                  </tr>
                ) : null
              ))}

              {incometaxdeduction > 0 && (
                <tr key="income-tax">
                  <td>Income tax</td>
                  <td style={{ textAlign: "right" }}>{incometaxdeduction.toFixed(2)}</td>
                </tr>
              )}

              {payslipData.some(item => item.lable === "Professional Tax" && item.amount > 0) && (
                <tr key="professional-tax">
                  <td>Professional Tax</td>
                  <td style={{ textAlign: "right" }}>
                    {payslipData.find(item => item.lable === "Professional Tax")?.amount.toFixed(2)}
                  </td>
                </tr>
              )}

            </tbody>
            <tfoot>
              <tr><td>Total Deduction</td><td className="amount">{totalDeduction}</td></tr>
            </tfoot>
          </table>
        </div>
        <table className="payroll-table" style={{ marginTop: '20px', }}>
          <tbody>
            <tr>
              <th style={{ textAlign: 'left' }} >Net Salary</th>
              <th style={{ textAlign: 'right' }} colSpan="1">{(netSalary - deductionData.reduce((sum, item) => sum + item.amount, 0)).toFixed(0)}</th>
              <th style={{ textAlign: 'right' }} colSpan="2">{convertNumberToWords(Math.round(netSalary - deductionData.reduce((sum, item) => sum + item.amount, 0)))} </th>
            </tr>
          </tbody>
        </table>

        {/* <div>
          <p><strong>Signed By</strong></p>
          <input style={{ borderBottom: '1px solide grey' }}></input>
        </div> */}

        {/* <div> <td> <strong><span >Net salaray:</span>{(netSalary - deductionData.reduce((sum, item) => sum + item.amount, 0)).toFixed(0)}</strong></td></div> */}
        <div className="footer-container">
          <p className="footer-text">*This is system genrated payslip and doesn't require a signature</p>
          <p className="footer-text">
            Pay Slip for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </p>
        </div>

        <div className='form-controls'>
        {/* <button type="button" className="outline-btn" onClick={handleBack} >Back</button> */}
          <button className='btn' type='button' onClick={handlePrint}>Print</button>
          <button className='btn' onClick={handleDownloadPDF}>Download PDF</button>
          {/* <button className='btn' onClick={handleDownloadExcel}>Download Excel</button>
        <button className='btn' onClick={handleDownloadWord}>Download Word</button>
        <button className='btn' onClick={handleDownloadImage}>Download Image</button> */}

        </div>
      </div>
    </div>
  );
};

export default Payslip;
