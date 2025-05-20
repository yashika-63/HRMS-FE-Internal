import React, { useState, useEffect } from "react";
import axios from "axios";
import { strings } from "../../string";
import { useParams } from "react-router-dom";
import { showToast } from "../../Api.jsx";

const ExpenseReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [data, setData] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const { id: employeeId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            if (fromDate && toDate) {
                const url = `http://${strings.localhost}/api/expense/getApprovedByEmployeeAndDate?employeeId=${employeeId}&fromDate=${fromDate}&toDate=${toDate}`;
                try {
                    setIsProcessing(true);
                    const response = await axios.get(url);
                    setData(response.data || []);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    showToast("Failed to fetch data",'error');
                } finally {
                    setIsProcessing(false);
                }
            }
        };

        fetchData();
    }, [fromDate, toDate]); // Triggers every time dates change

    const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.expenseAmountSpent || 0), 0);
    let runningTotal = 0;





    return (
        <div className="coreContainer">
            <div className="form-title">Expense Report</div>

            <div className="middleline-btn">
                <div>
                    <label>From Date: </label>
                    <input
                        className="selectIM"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>
                <div>
                    <label>To Date: </label>
                    <input
                        className="selectIM"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
            </div>

            {isProcessing ? (
                <p>Loading...</p>
            ) : data.length > 0 ? (
                <table className="interview-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>From</th>
                            <th>To</th>
                            <th>Purpose</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Currency</th>
                            <th>Amount</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => {
                            const amount = parseFloat(item.expenseAmountSpent || 0);
                            runningTotal += amount;

                            return (
                                <tr key={item.id}>
                                    <td>{new Date(item.expenseFromDate).toLocaleDateString()}</td>
                                    <td>{new Date(item.expenseTillDate).toLocaleDateString()}</td>
                                    <td>{item.expensePurpose}</td>
                                    <td>{item.requestStatus}</td>
                                    <td>{item.expenseType}</td>
                                    <td>{item.currencyCode}</td>
                                    <td>{amount.toFixed(2)}</td>
                                    <td><strong>{runningTotal.toFixed(2)}</strong></td>
                                </tr>
                            );
                        })}
                        <tr style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                            <td colSpan="5">Grand Total</td>
                            <td>{totalAmount.toFixed(2)}</td>
                            <td colSpan="1"></td>
                            <td>{runningTotal.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            ) : (
                fromDate && toDate && <p className="no-data">No data available for the selected date range.</p>
            )}
            <div className="form-controls">
                <button className="btn" type="button" onClick={() => window.print()}>Print</button>
            </div>
        </div>
    );
};

export default ExpenseReport;
