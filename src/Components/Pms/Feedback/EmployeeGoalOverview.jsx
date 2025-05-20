import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, ScatterChart, Scatter, ZAxis,Treemap  } from "recharts";
import "./EmployeeGoalOverview.css";
import { strings } from '../../../string';

const EmployeeGoalOverview = ({ employeeId, year }) => {
    const [goals, setGoals] = useState([]); // Ensure it's an array by default
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/goalSetting/getByEmployeeAndYearDetailForReview?employeeId=2&year=2025`);
            setGoals(response.data || []); // Ensure response.data is an array
        } catch (error) {
            console.error("Error fetching goals:", error);
            setGoals([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const colors = ["#4CAF50", "#FF9800", "#3F51B5", "#E91E63", "#2196F3"];

    const barChartData = (goals || []).map((goal) => ({
        name: goal.goal,
        avgRating: goal.averageRating,
    }));

    const barChartData1 = (goals || []).map((goal) => ({
        name: goal.goal,
        rating: goal.feedback ? goal.feedback.rating : 0, // Default to 0 if feedback is missing
    }));


    const pieChartData = (goals || []).map((goal) => ({
        name: goal.goal,
        value: goal.totalRatings,
    }));

    const radarChartData = (goals || []).map((goal) => ({
        goal: goal.goal,
        rating: goal.averageRating || 0, // Ensure a valid number
    }));

    const stackedBarChartData = (goals || []).map((goal) => ({
        name: goal.goal,
        selfRating: goal.selfRating || 0,  // Add separate rating categories if available
        managerRating: goal.managerRating || 0,
    }));
    const bulletChartData = (goals || []).map((goal) => ({
        name: goal.goal,
        target: goal.targetRating || 5, // Assume 5 is the max
        actual: goal.averageRating || 0,
    }));


    const heatmapData = (goals || []).flatMap((goal, index) =>
        (goal.feedbacks || []).map((feedback) => ({
            x: feedback.date,
            y: index,
            z: feedback.rating,
            goal: goal.goal,
        }))
    );

    const treemapData = (goals || []).map((goal) => ({
        name: goal.goal,
        size: goal.totalRatings || 1,
    }));

    const feedbackData = [];
    (goals || []).forEach((goal) => {
        (goal.feedbacks || []).forEach((feedback) => {
            feedbackData.push({
                date: feedback.date,
                goal: goal.goal,
                rating: feedback.rating,
            });
        });
    });
    return (
        <div className="coreContainer">

        <div className="container">
            <h2 className="header">Employee Goal Overview - {year}</h2>

            {loading ? (
                <p className="loading">Loading...</p>
            ) : goals.length === 0 ? (
                <p className="no-data">No data available for this employee.</p>
            ) : (
                <>
                    <div className="charts-container">
                        {/* Bar Chart */}
                        <div className="chart-box">
                            <h3 className="chart-title">Goal-wise Average Ratings</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barChartData}>
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Bar dataKey="avgRating" fill="#4CAF50" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>


                        {/* Bar Chart */}
                        <div className="chart-box">
                            <h3 className="chart-title">Goal-wise detail Ratings</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barChartData1}>
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Bar dataKey="rating" fill="#4CAF50" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Pie Chart */}
                        <div className="chart-box">
                            <h3 className="chart-title">Ratings Distribution Across Goals</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Pie Chart */}
                        <div className="chart-box">
                            <h3 className="chart-title">Ratings Distribution Across Goals</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>

                            </ResponsiveContainer>
                        </div>
                        {/* Line Chart */}
                        <div className="chart-box">
                            <h3 className="chart-title">Feedback Ratings Over Time</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={feedbackData}>
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="rating" stroke="#FF9800" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-box">
                            <h3 className="chart-title">Goal Ratings Radar Chart</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="goal" />
                                    <PolarRadiusAxis domain={[0, 5]} />
                                    <Radar name="Ratings" dataKey="rating" stroke="#FF9800" fill="#FF9800" fillOpacity={0.6} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-box">
                            <h3 className="chart-title">Self vs Manager Ratings</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stackedBarChartData} barSize={20}>
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="selfRating" stackId="a" fill="#3F51B5" />
                                    <Bar dataKey="managerRating" stackId="a" fill="#E91E63" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>


                        <div className="chart-box">
                            <h3 className="chart-title">Performance Trends</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={feedbackData}>
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="rating" stroke="#2196F3" fill="#BBDEFB" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-box">

                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={bulletChartData} layout="vertical">
                                    <XAxis type="number" domain={[0, 5]} />
                                    <YAxis dataKey="name" type="category" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="target" fill="#ddd" barSize={10} />
                                    <Bar dataKey="actual" fill="#4CAF50" barSize={10} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-box">

                            <ResponsiveContainer width="100%" height={300}>
                                <ScatterChart>
                                    <XAxis dataKey="x" name="Date" />
                                    <YAxis dataKey="y" name="Goals" tickFormatter={(tick) => goals[tick]?.goal} />
                                    <ZAxis dataKey="z" range={[50, 400]} />
                                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                                    <Scatter data={heatmapData} fill="#FF9800" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="chart-box">

                            <ResponsiveContainer width="100%" height={300}>
                                <Treemap data={treemapData} dataKey="size" stroke="#fff" fill="#3F51B5" />
                            </ResponsiveContainer>

                        </div>

                    </div>

                    {/* <PieChart>
                        <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart> */}
                    <div className="refresh-button">
                        <button onClick={fetchGoals}>Refresh Data</button>
                    </div>
                </>
            )}
        </div>
        </div> 
    );

};

export default EmployeeGoalOverview;
