// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
// import '../../CommonCss/EmployeeView.css';
// import { strings } from "../../../string";

// const EmployeeGoalAnalytic = () => {
//     const { id: employeeId } = useParams();
//     const [year, setYear] = useState(new Date().getFullYear());
//     const [goals, setGoals] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [isExpanded, setIsExpanded] = useState(false); // State for enlarging graph

//     useEffect(() => {
//         if (employeeId) {
//             fetchGoals();
//         }
//     }, [employeeId, year]);

//     const fetchGoals = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(`http://${strings.localhost}/api/goalSetting/getByEmployeeAndYearDetailForReview?employeeId=${employeeId}&year=${year}`);
//             setGoals(response.data || []);
//         } catch (error) {
//             console.error("Error fetching goals:", error);
//             setGoals([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const barChartData = goals.map((goal) => ({
//         name: goal.goal,
//         avgRating: goal.averageRating || 0,
//     }));

//     const feedbackData = [];
//     (goals || []).forEach((goal) => {
//         (goal.feedbacks || []).forEach(() => {
//             feedbackData.push({
//                 date: goal.date,
//                 goal: goal.goal,
//                 rating: goal.averageRating,
//             });
//         });
//     });

//     const pieChartData = (goals || []).map((goal) => ({
//         name: goal.goal,
//         value: goal.averageRating,
//     }));

//     const colors = ["#4CAF50", "#FF9800", "#3F51B5", "#E91E63", "#2196F3"];

//     // Toggle Expand View
//     const toggleExpand = () => {
//         setIsExpanded(!isExpanded);
//     };

//     return (
//         <div className="coreContainer">
//             <div className='year-select-container'>
//                 <div className='year-select'>
//                     <label htmlFor="year">Select Year: </label>
//                     <select id="year" value={year} onChange={(e) => setYear(e.target.value)}>
//                         {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((yearOption) => (
//                             <option key={yearOption} value={yearOption}>
//                                 {yearOption}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//             </div>

//             {loading ? (
//                 <p className="loading">Loading...</p>
//             ) : goals.length === 0 ? (
//                 <p className="no-data">No data available for this employee.</p>
//             ) : (
//                 <>
//                     <div className="charts-container">
//                         {/* Clickable Bar Chart */}
//                         <div className={`chart-box ${isExpanded ? "expanded" : ""}`} onClick={toggleExpand}>
//                             <h3 className="chart-title">Goal-wise Average Ratings</h3>
//                             <ResponsiveContainer width="100%" height={isExpanded ? 400 : 150}>
//                                 <BarChart data={barChartData}>
//                                     <XAxis dataKey="name" />
//                                     <YAxis domain={[0, 5]} />
//                                     <Tooltip />
//                                     <Bar dataKey="avgRating" fill="#4CAF50" />
//                                 </BarChart>
//                             </ResponsiveContainer>
//                         </div>

//                         <div className="chart-box">
//                             <h3 className="chart-title">Feedback Ratings Over Time</h3>
//                             <ResponsiveContainer width="100%" height={150}>
//                                 <LineChart data={feedbackData}>
//                                     <XAxis dataKey="date" />
//                                     <YAxis domain={[0, 5]} />
//                                     <Tooltip />
//                                     <Legend />
//                                     <Line type="monotone" dataKey="rating" stroke="#FF9800" />
//                                 </LineChart>
//                             </ResponsiveContainer>
//                         </div>

//                         <div className="chart-box">
//                             <h3 className="chart-title">Ratings Distribution Across Goals</h3>
//                             <ResponsiveContainer width="100%" height={100}>
//                                 <PieChart>
//                                     <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} label>
//                                         {pieChartData.map((entry, index) => (
//                                             <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
//                                         ))}
//                                     </Pie>
//                                     <Tooltip />
//                                 </PieChart>
//                             </ResponsiveContainer>
//                         </div>
//                     </div>

//                     <div className="chart-box1">
//                         <h3 className="chart-title">Goals List With Average Rating</h3>
//                         <ul className="list-group1">
//                             {goals.map((goal, index) => (
//                                 <li key={index} className="list-group-item1">
//                                     <span>{goal.goal}</span>
//                                     <span> <strong>- {goal.averageRating}</strong></span>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default EmployeeGoalAnalytic;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import '../../CommonCss/EmployeeView.css';
import { strings } from "../../../string";

const EmployeeGoalAnalytic = () => {
    const { id: employeeId } = useParams();
    const [year, setYear] = useState(new Date().getFullYear()); 
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedChart, setSelectedChart] = useState(null);

    useEffect(() => {
        if (employeeId) {
            fetchGoals();
        }
    }, [employeeId, year]);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://${strings.localhost}/api/goalSetting/getByEmployeeAndYearDetailForReview?employeeId=${employeeId}&year=${year}`);
            setGoals(response.data || []);
        } catch (error) {
            console.error("Error fetching goals:", error);
            setGoals([]);
        } finally {
            setLoading(false);
        }
    };

    const barChartData = goals.map((goal) => ({
        name: goal.goal,
        avgRating: goal.averageRating || 0,
    }));

    const feedbackData = [];
    (goals || []).forEach((goal) => {
        (goal.feedbacks || []).forEach((feedback) => {
            feedbackData.push({
                date: goal.date,
                goal: goal.goal,
                rating: goal.averageRating,
            });
        });
    });

    const pieChartData = (goals || []).map((goal) => ({
        name: goal.goal,
        value: goal.averageRating,
    }));

    const colors = ["#4CAF50", "#FF9800", "#3F51B5", "#E91E63", "#2196F3"];

    const openChartModal = (chartType) => {
        setSelectedChart(chartType);
    };

    const closeChartModal = () => {
        setSelectedChart(null);
    };

    return (
        <div className="coreContainer">
            <div className='year-select-container'>
                <div className='year-select'>
                    <label htmlFor="year">Select Year: </label>
                    <select id="year" value={year} onChange={(e) => setYear(e.target.value)}>
                        {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((yearOption) => (
                            <option key={yearOption} value={yearOption}>
                                {yearOption}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <p className="loading">Loading...</p>
            ) : goals.length === 0 ? (
                <p className="no-data">No data available for this employee.</p>
            ) : (
                <>
                    <div className="charts-container">
                        <div className="chart-box" onClick={() => openChartModal("bar")}>
                            <h3 className="chart-title">Goal-wise Average Ratings</h3>
                            <ResponsiveContainer width="70%" height={150}>
                                <BarChart data={barChartData}>
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Bar dataKey="avgRating" fill="#4CAF50" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-box" onClick={() => openChartModal("line")}>
                            <h3 className="chart-title">Feedback Ratings Over Time</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <LineChart data={feedbackData}>
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="rating" stroke="#FF9800" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-box" onClick={() => openChartModal("pie")}>
                            <h3 className="chart-title">Ratings Distribution Across Goals</h3>
                            <ResponsiveContainer width="100%" height={100}>
                                <PieChart>
                                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} label>
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Enlarged Chart Modal */}
                    {selectedChart && (
                        <div className="chart-modal">
                            <div className="chart-modal-content">
                                <span className="close-button" onClick={closeChartModal}>&times;</span>
                                <h3 className="chart-modal-title">Expanded View</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    {selectedChart === "bar" && (
                                        <BarChart data={barChartData}>
                                            <XAxis dataKey="name" />
                                            <YAxis domain={[0, 5]} />
                                            <Tooltip />
                                            <Bar dataKey="avgRating" fill="#4CAF50" />
                                        </BarChart>
                                    )}
                                    {selectedChart === "line" && (
                                        <LineChart data={feedbackData}>
                                            <XAxis dataKey="date" />
                                            <YAxis domain={[0, 5]} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="rating" stroke="#FF9800" />
                                        </LineChart>
                                    )}
                                    {selectedChart === "pie" && (
                                        <PieChart>
                                            <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} label>
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>

                           
                    )}
                    <br/>
                      <div className="chart-box1">
                                            <h3 className="chart-title">Goals List With Average Rating</h3>
                                            <ul className="list-group1">
                                                {goals.map((goal, index) => (
                                                    <li key={index} className="list-group-item1">
                                                        <span>{goal.goal}</span>
                                                        <span> <strong>- {goal.averageRating}</strong></span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div> 
                </>
            )}
        </div>
    );
};

export default EmployeeGoalAnalytic;
