import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, ScatterChart, Scatter, ZAxis, Treemap } from "recharts";
import '../../CommonCss/EmployeeView.css';
import { strings } from "../../../string";

const EmployeeKpiAnalytic = () => {
    const { id: employeeId } = useParams();
    const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
    const [kpis, setKpis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [selectedChart, setSelectedChart] = useState(null);

    // Fetch goals when employeeId or year changes
    useEffect(() => {
        if (employeeId) {
            fetchKpis();
        }
    }, [employeeId, year]);

    const openChartModal = (chartType) => {
        setSelectedChart(chartType);
    };

    const closeChartModal = () => {
        setSelectedChart(null);
    };
    const fetchKpis = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://${strings.localhost}/api/kpi/getByEmployeeAndYearDetailForReview?employeeId=${employeeId}&year=${year}`);
            setKpis(response.data || []);
        } catch (error) {
            console.error("Error fetching kpis:", error);
            setKpis([]);
        } finally {
            setLoading(false);
        }
    };

    // Data for the bar chart
    const barChartData = kpis.map((kpi) => ({
        name: kpi.kpi,
        avgRating: kpi.averageRating || 0,
    }));

    // Year selection dropdown handler
    const handleYearChange = (e) => {
        setYear(e.target.value);
    };

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

    const colors = ["#4CAF50", "#FF9800", "#3F51B5", "#E91E63", "#2196F3"];


    // const feedbackData = [];
    // (goals || []).forEach((goal) => {
    //     (goal.feedbacks || []).forEach((feedback) => {
    //         feedbackData.push({
    //             date: feedback.date,
    //             goal: goal.goal,
    //             rating: feedback.rating,
    //         });
    //     });
    // });

    const feedbackData = [];
    (kpis || []).forEach((kpi) => {
        (kpi.feedbacks || []).forEach((feedback) => {
            feedbackData.push({
                date: kpi.date,
                kpi: kpi.kpi,
                rating: kpi.averageRating,
            });
        });
    });
    const pieChartData = (kpis || []).map((kpi) => ({
        name: kpi.kpi,
        value: kpi.averageRating,
    }));



    return (
        <div className="coreContainer">

            <div className='year-select-container'>
                <div className='year-select'>
                    <label htmlFor="year">Select Year: </label>
                    <select id="year" value={year} onChange={handleYearChange}>
                        {yearOptions.map((yearOption) => (
                            <option key={yearOption} value={yearOption}>
                                {yearOption}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <p className="loading">Loading...</p>
            ) : kpis.length === 0 ? (
                <p className="no-data">No data available for this employee.</p>
            ) : (

                <>

                    {/* <div className="chart-box">
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
                        </div> */}
                    <br />

                    <div className="charts-container">
                        <div className="chart-box" onClick={() => openChartModal("bar")}>  
                            <h3 className="chart-title">KPI-wise Average Ratings</h3>
                            <ResponsiveContainer width="100%" height={150}>
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
                            <h3 className="chart-title">Ratings Distribution Across KPIs</h3>
                            <ResponsiveContainer width="100%" height={150}>
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
                    <br />
                    {/* Bar Chart */}
                    <div className="chart-box1">
                        <div>
                            <h3 className="chart-title">Kpis List With Avrage Rating</h3>
                            <ul className="list-group1">
                                {kpis.map((kpi, index) => (
                                    <div key={index} className="list-group-item1">
                                        <span>{index + 1}. </span>
                                        <span>{kpi.kpi}</span>
                                        <span><strong> - {kpi.averageRating}</strong></span>

                                    </div>
                                ))}
                            </ul>
                        </div>


                    </div>

                </>
            )}





        </div>
    );
};

export default EmployeeKpiAnalytic;
