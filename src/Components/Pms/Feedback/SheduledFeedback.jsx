import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../SheduledFeedback.css";
import { strings } from "../../../string";
import { showToast } from "../../../Api.jsx";
const SheduledFeedback = () => {
    const { id: employeeId } = useParams();
    const reportingManagerId = localStorage.getItem("employeeId");
    const [goals, setGoals] = useState([]);

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
            fetchData();

        }
    }, [employeeId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [employeeRes, goalsRes] = await Promise.all([
                axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`),
                axios.get(`http://${strings.localhost}/api/goalSetting/active/${employeeId}`)
            ]);

            const employee = employeeRes.data;
            setFormData({
                name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
                id: employee.id,
                department: employee.department,
                designation: employee.designation,
            });

            setGoals(goalsRes.data);
            setFeedbackData(goalsRes.data.map(goal => ({
                employeeGoalSetting: { id: goal.id },
                ratingForGoal: 0,
                note: "",
                selected: false,
            })));
        } catch (err) {
            setError("Failed to fetch data. Please try again.");
        }
        setLoading(false);
    };

   

    const handleRatingClick = (index, rating) => {
        const updatedFeedback = [...feedbackData];
        updatedFeedback[index].ratingForGoal = Math.max(1, Math.min(rating, 5));
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

    const handleSubmit = async () => {
        const selectedFeedback = feedbackData.filter(feedback => feedback.selected);
    
        if (selectedFeedback.length === 0) {
            showToast("Please select at least one goal before submitting.",'warn');
            return;
        }
    
        // Validation: Ensure selected goals have both rating and note
        for (const feedback of selectedFeedback) {
            if (!feedback.ratingForGoal || feedback.ratingForGoal < 1) {
                showToast("Please provide a rating for all selected goals.",'warn');
                return;
            }
            if (!feedback.note.trim()) {
                showToast("Please provide a note for all selected goals.",'warn');
                return;
            }
        }
        setLoading(true);
        try {
            await axios.post(
                `http://${strings.localhost}/api/feedback/save-multiple/${reportingManagerId}/${employeeId}`,
                selectedFeedback
            );
            showToast("Feedback saved successfully.",'success');
            fetchData();
        } catch (error) {
            showToast("Failed to save feedback.",'error');
            console.error("Error saving feedback:", error);
        }
        setLoading(false);
    };
    


    



    return (
        <div className="coreContainer">
            <div>
                {/* <div className="form-title">Feedback</div> */}
              
                <div className="goal-container">
                    {/* <h2>Employee Goals (Employee ID: {employeeId})</h2> */}
                    {error && <p className="error">{error}</p>}
                    {loading ? <p>Loading...</p> : goals.length === 0 ? <p>No goals found.</p> : (
                        <>
                            <table className="Goal-table" cellPadding="5">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Goal</th>
                                        <th> Rating For Goal </th>
                                        <th>Note</th>
                                        <th>Select</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {goals.map((goal, index) => (
                                        <tr key={goal.id}>
                                            <td>{index+1}</td>
                                            <td>{goal.goal}</td>
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
                                                        className={`level-fill rating-${feedbackData[index]?.ratingForGoal}`}
                                                        style={{ width: `${(feedbackData[index]?.ratingForGoal / 5) * 100}%` }}
                                                    ></div>
                                                    <div className="level-text">
                                                        {feedbackData[index]?.ratingForGoal > 0 ? feedbackData[index]?.ratingForGoal : ""}
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
                            {loading && <div className="loading-spinner"></div>}
                            <button type="button" disabled={loading} onClick={handleSubmit} className="btn">{loading ? 'Saving...' : 'Save Feedback'}</button>
                            </div>
                        </>
                    )}
                </div>
              
            </div>
        </div>
    );
};

export default SheduledFeedback;
