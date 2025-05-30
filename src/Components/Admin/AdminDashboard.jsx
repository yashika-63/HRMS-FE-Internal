// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';
// import Calendar from 'react-calendar';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faChartPie, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
// import { strings } from '../../string';
// const LeaveDashboard = () => {
//     const { id } = useParams();
//     const [formData, setFormData] = useState({
//         name: '',
//         employeeid: '',
//         designation: '',
//         department: '',
//         employeeName: '',
//     });

//     const [calendarDate, setCalendarDate] = useState(new Date());
//     const [timesheets, setTimesheets] = useState([]);
//     const [absentData, setAbsentData] = useState([]);

//     // Fetch employee details by ID
//     const fetchEmployeeDetails = async () => {
//         try {
//             const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${id}`);
//             const employee = response.data;
//             setFormData({
//                 name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
//                 id: employee.id,
//                 department: employee.department,
//                 designation: employee.designation,
//             });
//         } catch (error) {
//             console.error('Error fetching employee details:', error);
//         }
//     };

//     // Fetch timesheets for all employees for the selected year and month
//     const fetchTimesheets = async (year, month) => {
//         try {
//             const response = await axios.get(`http://${strings.localhost}/timesheets/${year}/${month}`);
//             setTimesheets(response.data);
//         } catch (error) {
//             console.error('Error fetching timesheets:', error);
//         }
//     };

//     // Fetch absenteeism data for the selected year and month
//     const fetchAbsenteeData = async (year, month) => {
//         try {
//             const response = await axios.get(`http://${strings.localhost}/absentee/${year}/${month}`);
//             setAbsentData(response.data);
//         } catch (error) {
//             console.error('Error fetching absentee data:', error);
//         }
//     };

//     useEffect(() => {
//         fetchEmployeeDetails();
//     }, [id]);

//     // Assuming you want to fetch timesheets and absentee data for the current calendar date initially
//     useEffect(() => {
//         const year = calendarDate.getFullYear();
//         const month = calendarDate.getMonth() + 1; // getMonth() returns 0-based index

//         fetchTimesheets(year, month);
//         fetchAbsenteeData(year, month);
//     }, [calendarDate]);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({
//             ...formData,
//             [name]: value,
//         });
//     };

//     // Example function to render pie chart based on absentee data
//     const renderPieChart = () => {
//         // Assuming absentData is structured as an array of objects { date: 'YYYY-MM-DD', count: number }
//         // You can use any chart library like Chart.js or VictoryChart for rendering the pie chart
//         return (
//             <div className="pie-chart-container">
//                 <h3>Absenteeism</h3>
//                 <ul>
//                     {absentData.map((item, index) => (
//                         <li key={index}>
//                             Date: {item.date}, Absent Employees: {item.count}
//                         </li>
//                     ))}
//                 </ul>
//             </div>
//         );
//     };

//     return (
//         <div className="dashboard-container">
//             <header className="dashboard-header">
//                 <div className="tiles">
//                     <div className="tile">
//                         <label htmlFor="name">Employee Name:</label>
//                         <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} readOnly />
//                     </div>
//                     <div className="tile">
//                         <label htmlFor="id">Employee ID:</label>
//                         <input type="text" id="id" name="id" value={formData.id} onChange={handleInputChange} readOnly />
//                     </div>
//                     <div className="tile">
//                         <label htmlFor="designation">Employee Designation:</label>
//                         <input type="text" id="designation" name="designation" value={formData.designation} onChange={handleInputChange} readOnly />
//                     </div>
//                     <div className="tile">
//                         <label htmlFor="department">Employee Department:</label>
//                         <input type="text" id="department" name="department" value={formData.department} onChange={handleInputChange} readOnly />
//                     </div>
//                 </div>
//             </header>

//             <div className="dashboard-main">
//                 <aside>
//                     <Calendar
//                         onChange={setCalendarDate}
//                         value={calendarDate}
//                     />
//                     {renderPieChart()}
//                 </aside>

//                 <main className="timesheets">
//                     <h2>Timesheets</h2>
//                     <table>
//                         <thead>
//                             <tr>
//                                 <th>Employee Name</th>
//                                 <th>Date</th>
//                                 <th>Hours Worked</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {timesheets.map((timesheet, index) => (
//                                 <tr key={index}>
//                                     <td>{timesheet.employeeName}</td>
//                                     <td>{timesheet.date}</td>
//                                     <td>{timesheet.hoursWorked}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default LeaveDashboard;




import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EmployeeEvents from './EmployeeEvents';
import CompanyEvents from './CompanyEvents';
import Performance from './Performance';
import SuggestionBox from './SuggestionBox';
import Calendar from './Calendar'; // Assuming Calendar is a component you already have
import '../CommonCss/EnrollDashboard.css';

const Admindashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <div className="dashboard-container">
      {/* Tiles Section */}
      <div >
        <div
          className={` ${activeMenu === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveMenu('dashboard')}
        >
          <h3>Dashboard</h3>
        </div>
        <div
          className={`tile ${activeMenu === 'employee-events' ? 'active' : ''}`}
          onClick={() => setActiveMenu('employee-events')}
        >
          <h3>Employee Events</h3>
        </div>
        <div
          className={`tile ${activeMenu === 'company-events' ? 'active' : ''}`}
          onClick={() => setActiveMenu('company-events')}
        >
          <h3>Company Events</h3>
        </div>
        <div
          className={`tile ${activeMenu === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveMenu('performance')}
        >
          <h3>Performance</h3>
        </div>
        <div
          className={`tile ${activeMenu === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveMenu('calendar')}
        >
          <h3>Calendar</h3>
        </div>
        <div
          className={`tile ${activeMenu === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveMenu('suggestions')}
        >
          <h3>Suggestions</h3>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeMenu === 'dashboard' && <h2>Welcome, Admin!</h2>}
        <div className="dashboard-section">
          {activeMenu === 'employee-events' && <EmployeeEvents />}
          {activeMenu === 'company-events' && <CompanyEvents />}
        </div>
        <div className="dashboard-section">
          {activeMenu === 'performance' && <Performance />}
          {activeMenu === 'calendar' && <Calendar />}
        </div>
        {activeMenu === 'suggestions' && <SuggestionBox />}
      </div>
    </div>
  );
};

export default Admindashboard;
