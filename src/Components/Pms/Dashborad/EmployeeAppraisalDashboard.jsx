import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, LineChart, Line, } from "recharts";
import '../../CommonCss/EmployeeView.css';
import { strings } from "../../../string";

const EmployeeAppraisalDashboard = () => {
    const { id } = useParams();
    const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
    const [goals, setGoals] = useState([]);
    const [kpis, setKpis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [combinedData, setCombinedData] = useState([]);
    const [combinedDatas, setCombinedDatas] = useState([]);
    const employeeId = localStorage.getItem('employeeId');
    useEffect(() => {
        if (id) {
            fetchAppraisalData();
        }
    }, [id , year]);



    const handleYearChange = (e) => {
        setYear(e.target.value);
    };


    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

    const fetchAppraisalData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://${strings.localhost}/api/appraisal/get-appraisal-manager/${id}/${year}/${employeeId}`);
            const { goalData = [], kpiData = [] } = response.data;

            // Format Goal Data for the first graph
            const formattedGoals = goalData.map((goal) => ({
                name: goal.goalSetting.goal,
                selfRating: goal.employeeSelfRating || 0,
                managerRating: goal.reportingManagerRating || 0,
                moderatedRating: goal.moderatedRating || 0,
            }));

            // Format KPI Data for the second graph
            const formattedKpis = kpiData.map((kpi) => ({
                name: kpi.kpiSetting.kpi,
                selfRating: kpi.employeeSelfRating || 0,
                managerRating: kpi.reportingManagerRating || 0,
                moderatedRating: kpi.moderatedRating || 0,
            }));

            // Merge goals and KPIs for the Performance Trends chart
            const combinedData = [...formattedGoals, ...formattedKpis];

            const pieChartData = [
                { name: "Total Average Employee Rating", value: 2.29 },
                { name: "Average Employee Goal Rating", value: 3.0 },
                { name: "Average Manager Goal Rating", value: 4.0 },
                { name: "Average Moderated Goal Rating", value: 5.0 },
                { name: "Total Average Manager Rating", value: 3.43 },
                { name: "Average Employee KPI Rating", value: 1.57 },
            ];



            const combinedDatas = [...goals, ...kpis].map((item) => ({
                name: item.name,
                selfGoalRating: goals.find(goal => goal.name === item.name)?.selfRating || 0,
                managerGoalRating: goals.find(goal => goal.name === item.name)?.managerRating || 0,
                selfKpiRating: kpis.find(kpi => kpi.name === item.name)?.selfRating || 0,
                managerKpiRating: kpis.find(kpi => kpi.name === item.name)?.managerRating || 0,
            }));
            setGoals(formattedGoals);
            setKpis(formattedKpis);
            setCombinedData(combinedData); // New state for merged data
            setCombinedDatas(combinedDatas); // New state for merged data

        } catch (error) {
            console.error("Error fetching appraisal data:", error);
            setGoals([]);
            setKpis([]);
        } finally {
            setLoading(false);
        }
    };

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
            ) : goals.length === 0 && kpis.length === 0 ? (
                <p className="no-data">No data available for this employee.</p>
            ) : (
                <div className="charts-container">
                    {/* Line Chart */}
                    <div className="chart-box">
                        <h3 className="chart-title">KPI Ratings: Self vs Manager</h3>
                        <ResponsiveContainer width="70%" height={150}>
                            <LineChart data={kpis}>
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="selfRating" stroke="#FF9800" />
                                <Line type="monotone" dataKey="managerRating" stroke="#f55e2e" />

                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Combined Performance Trends Chart */}
                    <div className="chart-box">
                        <h3 className="chart-title">Performance Trends (Goals + KPIs)</h3>
                        <ResponsiveContainer width="70%" height={150}>
                            <AreaChart data={combinedData}>
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="selfRating" stroke="#2196F3" fill="#3F51B5" />
                                <Area type="monotone" dataKey="managerRating" stroke="#2196F3" fill="#BBDEFB" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Line Chart */}
                    <div className="chart-box">
                        <h3 className="chart-title">Goal Ratings: Self vs Manager</h3>
                        <ResponsiveContainer width="70%" height={150}>
                            <LineChart data={goals}>
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="selfRating" stroke="#FF9800" />
                                <Line type="monotone" dataKey="managerRating" stroke="#f55e2e" />

                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Goal Ratings Chart */}
                    {/* <div className="chart-box">
                        <h3 className="chart-title">Goal Ratings: Self vs Manager vs Moderated</h3>
                        <ResponsiveContainer width="70%" height={150}>
                            <BarChart data={goals} barSize={20}>
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="selfRating" fill="#3F51B5" name="Self Rating" />
                                <Bar dataKey="managerRating" fill="#E91E63" name="Manager Rating" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div> */}

                    {/* KPI Ratings Chart */}
                    {/* <div className="chart-box">
                        <h3 className="chart-title">KPI Ratings: Self vs Manager vs Moderated</h3>
                        <ResponsiveContainer width="70%" height={150}>
                            <BarChart data={kpis} barSize={20}>
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="selfRating" fill="#3F51B5" name="Self Rating" />
                                <Bar dataKey="managerRating" fill="#E91E63" name="Manager Rating" />
                            </BarChart>
                        </ResponsiveContainer>

                    </div> */}





                    {/* <div className="chart-box">
    <h3 className="chart-title">Performance Trends</h3>
    <ResponsiveContainer width="70%" height={150}>
        <AreaChart data={combinedDatas}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="selfGoalRating" stroke="#FF9800" fill="#FFCC80" name="Self Goal Rating" />
            <Area type="monotone" dataKey="managerGoalRating" stroke="#f55e2e" fill="#FF7043" name="Manager Goal Rating" />
            <Area type="monotone" dataKey="selfKpiRating" stroke="#2196F3" fill="#64B5F6" name="Self KPI Rating" />
            <Area type="monotone" dataKey="managerKpiRating" stroke="#3F51B5" fill="#9FA8DA" name="Manager KPI Rating" />
        </AreaChart>
    </ResponsiveContainer>
</div> */}
                    <div className="chart-box">

                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Goal</th>
                                    <th>Self Rating</th>
                                    <th>Manager Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {goals.length > 0 ? (
                                    goals.map((goal, index) => (
                                        <tr key={index}>
                                            <td>{goal.name}</td>
                                            <td>{goal.selfRating}</td>
                                            <td>{goal.managerRating}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">No Goal Data Available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                    </div>
                    <div className="chart-box">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>KPI</th>
                                    <th>Self Rating</th>
                                    <th>Manager Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kpis.length > 0 ? (
                                    kpis.map((kpi, index) => (
                                        <tr key={index}>
                                            <td>{kpi.name}</td>
                                            <td>{kpi.selfRating}</td>
                                            <td>{kpi.managerRating}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">No KPI Data Available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <br />


                </div>


            )}

        </div>

    );
};

export default EmployeeAppraisalDashboard;
