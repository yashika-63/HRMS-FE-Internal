import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../SheduledFeedback.css";
import { strings } from "../../../string";
import { showToast } from "../../../Api.jsx";

const SheduledFeedbackKpi = () => {
    const { id: employeeId } = useParams();
    const reportingManagerId = localStorage.getItem("employeeId");

    const [kpis, setKpis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [feedbackData, setFeedbackData] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        id: "",
        designation: "",
        department: "",
    });

    useEffect(() => {
        if (employeeId) {
            fetchDataKpi();
        }
    }, [employeeId]);

    const fetchDataKpi = async () => {
        setLoading(true);
        try {
            const [employeeRes, kpisRes] = await Promise.all([
                axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`),
                // axios.get(`http://localhost:5557/api/kpi/getByEmployeeAndYear?employeeId=${employeeId}&year=2024`)
             axios.get(`http://${strings.localhost}/api/kpi/active-reviewed/${employeeId}`)

            ]);

            const employee = employeeRes.data;
            setFormData({
                name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
                id: employee.id,
                department: employee.department,
                designation: employee.designation,
            });

            setKpis(kpisRes.data);
            setFeedbackData(kpisRes.data.map(kpi => ({
                employeeKpiSetting: { id: kpi.id },
                ratingForKpi: 0,
                note: "",
                selected: false,
            })));
        } catch (err) {
            console.log("Failed to fetch data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRatingClick = (index, rating) => {
        const updatedFeedback = [...feedbackData];
        updatedFeedback[index].ratingForKpi = Math.max(1, Math.min(rating, 5));
        setFeedbackData(updatedFeedback);
    };

    const handleInputChange = (index, field, value) => {
        const updatedFeedback = [...feedbackData];
        updatedFeedback[index][field] = value;
        setFeedbackData(updatedFeedback);
    };

    const handleCheckboxChange = (index) => {
        const updatedFeedback = [...feedbackData];
        updatedFeedback[index].selected = !updatedFeedback[index].selected;
        setFeedbackData(updatedFeedback);
    };

    const handleSubmitKpiFeedback = async () => {
        if (!reportingManagerId) {
            showToast("Reporting Manager ID not found.",'warn');
            return;
        }

        const selectedFeedback = feedbackData.filter(feedback => feedback.selected);
        if (selectedFeedback.length === 0) {
            showToast("Please select at least one KPI before submitting.",'warn');
            return;
        }

        try {
            await axios.post(
                `http://${strings.localhost}/api/feedbackkpi/save-multiple/${reportingManagerId}/${employeeId}`,
                selectedFeedback
            );
            showToast("Feedback saved successfully.",'success');
            fetchDataKpi();
        } catch (error) {
            showToast("Failed to save feedback.",'error');
            console.error("Error saving feedback:", error);
        }
    };

    return (
        <div className="coreContainer">
            <div className="goal-container">
                {/* <h2>Employee KPIs (Employee ID: {employeeId})</h2> */}
                {error && <p className="error">{error}</p>}
                {loading ? (
                    <p>Loading...</p>
                ) : kpis.length === 0 ? (
                    <p>No KPIs found.</p>
                ) : (
                    <>
                        <table className="Goal-table" cellPadding="5">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>KPI</th>
                                    <th>Rating For KPI</th>
                                    <th>Note</th>
                                    <th>Select</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kpis.map((kpi, index) => (
                                    <tr key={kpi.id}>
                                        <td>{index+1}</td>
                                        <td>{kpi.kpi}</td>
                                        <td>
                                            <div
                                                className="level-indicator"
                                                onClick={(e) => {
                                                    const rect = e.target.getBoundingClientRect();
                                                    const clickX = e.clientX - rect.left;
                                                    const width = rect.width;
                                                    const rating = Math.ceil((clickX / width) * 5);
                                                    handleRatingClick(index, rating);
                                                }}
                                            >
                                                <div
                                                    className={`level-fill rating-${feedbackData[index]?.ratingForKpi}`}
                                                    style={{ width: `${(feedbackData[index]?.ratingForKpi / 5) * 100}%` }}
                                                ></div>
                                                <div className="level-text">
                                                    {feedbackData[index]?.ratingForKpi > 0 ? feedbackData[index]?.ratingForKpi : ""}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={feedbackData[index]?.note || ""}
                                                onChange={(e) => handleInputChange(index, "note", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={feedbackData[index]?.selected || false}
                                                onChange={() => handleCheckboxChange(index)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="form-controls">
                            <button onClick={handleSubmitKpiFeedback} className="btn">Save Feedback</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SheduledFeedbackKpi;
