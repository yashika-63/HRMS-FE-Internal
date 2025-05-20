import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../../string";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

const AllActiveConfirmation = () => {
    const [data, setData] = useState([]);
    const [status, setStatus] = useState("pending");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const pastYears = 5;
    const futureYears = 3;
    const companyId = localStorage.getItem("companyId");
    const responsiblePersonId = localStorage.getItem("employeeId");

    useEffect(() => {
        fetchData();
    }, [status, selectedYear, selectedMonth]);

    const fetchData = () => {
        let apiUrl = "";

        if (status === "pending") {
            apiUrl = `http://${strings.localhost}/api/confirmation/pending/responsible/${responsiblePersonId}`;
        } else if (status === "confirmed") {
            apiUrl = `http://${strings.localhost}/api/confirmation/confirm?companyId=${companyId}&year=${selectedYear}&month=${selectedMonth}`;
        } else if (status === "terminated") {
            apiUrl = `http://${strings.localhost}/api/confirmation/terminate?companyId=${companyId}&year=${selectedYear}&month=${selectedMonth}`;
        } else if (status === 'extended') {
            apiUrl = `http://${strings.localhost}/api/confirmation/extended?companyId=${companyId}&year=${selectedYear}&month=${selectedMonth}`;
        }

        axios
            .get(apiUrl)
            .then((response) => setData(response.data))
            .catch((error) => {
                console.error("Error fetching data:", error);
                setData([]);
            });
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
    };

    const closePopup = () => {
        setSelectedEmployee(null);
    };

    const editdropdown = (employee) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <button type="button" onClick={() => handleEmployeeClick(employee)}>View</button>
            </div>
        </div>
    );

    // Export to CSV function
    const exportToCSV = () => {
        const headers = ['S.No', 'Name', 'Designation', 'Department', 'Joining Date', 'Status'];

        // Prepare the data for CSV
        const rows = data.map((item, index) => [
            index + 1,
            item.employeeName,
            item.designation || 'N/A',
            item.department || 'N/A',
            item.date,
            status.charAt(0).toUpperCase() + status.slice(1)
        ]);

        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
        rows.forEach(row => {
            csvContent += row.join(",") + "\n";
        });

        // Create a hidden link to trigger the download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `all_confirmations_${status}_${selectedYear}_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="coreContainer">
            <h3 className="title">All Confirmations</h3>
            <div className="middleline-btn">
                <div>
                    <label>Status: </label>
                    <select value={status} onChange={handleStatusChange} className="selectIM">
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="terminated">Terminated</option>
                        <option value="extended">Extended</option>
                    </select>
                </div>
                {status !== "pending" && (
                    <>
                        <div>
                            <label style={{ marginLeft: '10px' }}>Year:</label>
                            <select value={selectedYear} onChange={handleYearChange} className="selectIM">
                                {Array.from({ length: pastYears + futureYears + 1 }, (_, i) => {
                                    const year = new Date().getFullYear() - pastYears + i;
                                    return (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div>
                            <label style={{ marginLeft: '10px' }}>Month:</label>
                            <select value={selectedMonth} onChange={handleMonthChange} className="selectIM">
                                {[...Array(12).keys()].map(m => (
                                    <option key={m + 1} value={m + 1}>
                                        {new Date(0, m).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
            </div>

            <table className="interview-table">
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Employee Name</th>
                        <th>Responsible Person Name</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.employeeName}</td>
                                <td>{item.responsiblePersonName || 'N/A'}</td>
                                <td>{item.date}</td>
                                <td>
                                    <span className={`status-confirmationBadge ${status.toLowerCase()}`}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                </td>
                                <td>{editdropdown(item)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="no-data">
                                No {status} candidates available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedEmployee && (
                <div className="add-popup">
                    <div className="popup-content">
                        <h3 className="centerText">Employee Details</h3>
                        <p><strong>Employee Id:</strong> {selectedEmployee.employeeId}</p>
                        <p><strong>Employee Name:</strong> {selectedEmployee.employeeName}</p>
                        <p><strong>Joining Date:</strong> {selectedEmployee.date}</p>
                        <p><strong>Employee Email:</strong> {selectedEmployee.employeeEmail}</p>
                        <p><strong>Action Taken By :</strong>{selectedEmployee.responsiblePersonName}</p>
                        <p><strong>Email of responsible person :</strong>{selectedEmployee.responsiblePersonEmail}</p>
                        <div className="btnContainer">
                            <button type="button" className="outline-btn" onClick={closePopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            <div className='form-controls'>
                <button type="button" onClick={exportToCSV} className="btn">Export to CSV</button>
            </div>
        </div>
    );
};

export default AllActiveConfirmation;
