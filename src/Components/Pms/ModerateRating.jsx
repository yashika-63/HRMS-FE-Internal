import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../string';
import { showToast } from '../../Api.jsx';

const ModerateRating = () => {
    const [employees, setEmployees] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const employeeId = localStorage.getItem('employeeId');

    useEffect(() => {
        fetchEmployees();
        fetchRatings();
    }, [year]); 

    useEffect(() => {
        fetchRatings(); 
    }, [year , employeeId]);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/employee-config/by-reporting-manager/${employeeId}`);
            setEmployees(response.data);
            setRatings(response.data.map(employee => ({
                employee: employee.employee,
                moderatedRating: 0
            })));
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchRatings = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/moderateRating/byManagerAndYear/${employeeId}/${year}`);
            setRatings(response.data);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    };

    const handleRatingChange = (employeeId, value) => {
        if (isNaN(value) || value === '') {
            setRatings(prevRatings => {
                const updatedRatings = prevRatings.map(rating =>
                    rating.employee.id === employeeId ? { ...rating, moderatedRating: '' } : rating
                );
                return updatedRatings;
            });
            return;
        }

        value = parseFloat(value);

        if (value < 0 || value > 5) {
            showToast('Rating must be between 0 and 5', 'warn');
            return;
        }

        setRatings(prevRatings => {
            const updatedRatings = prevRatings.map(rating =>
                rating.employee.id === employeeId ? { ...rating, moderatedRating: value } : rating
            );
            return updatedRatings;
        });
    };

    const saveRatings = async () => {
        try {
            await axios.post(`http://${strings.localhost}/api/moderateRating/save/${employeeId}`, ratings);
            showToast('Ratings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving ratings:', error);
        }
    };

    const isEmployeesAvailable = employees.length > 0;
    const isRatingsAvailable = ratings.some(rating => rating.moderatedRating !== 0);

    const exportToCSV = () => {
        const data = employees.map((employee, index) => {
            const rating = ratings.find(r => r.employee.id === employee.employee.id) || { moderatedRating: 0 };
            return {
                'Sr.No': index + 1,
                'Employee ID': employee.employee.employeeId,
                'Employee Name': `${employee.employee.firstName} ${employee.employee.middleName} ${employee.employee.lastName}`,
                'Department': employee.employee.department,
                'Designation': employee.employee.designation,
                'Division': employee.employee.division,
                'Joining Date': employee.employee.joiningDate,
                'Moderate Rating': rating.moderatedRating
            };
        });

        // Create CSV content
        const csvRows = [];
        const headers = ['Sr.No', 'Employee ID', 'Employee Name', 'Department', 'Designation', 'Division', 'Joining Date', 'Moderate Rating'];
        csvRows.push(headers.join(',')); // Add the header row

        // Add data rows
        data.forEach(row => {
            const rowValues = headers.map(header => row[header]);
            csvRows.push(rowValues.join(','));
        });

        // Create a CSV file and trigger a download
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Moderate_Ratings.csv';
        link.click();
    };

    return (
        <div className='coreContainer'>
            <div className='title'>Moderate Ratings Of My Team</div>
            <div className='year-select-container'>
                <div className='year-select'>
                    <label htmlFor="year">Year: </label>
                    <select id="year" value={year} onChange={(e) => setYear(e.target.value)}>
                        {[...Array(10)].map((_, i) => {
                            const y = new Date().getFullYear() - i;
                            return <option key={y} value={y}>{y}</option>;
                        })}
                    </select>
                </div>
            </div>

            {isEmployeesAvailable ? (
                <table className='Goal-table'>
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Division</th>
                            <th>Joining Date</th>
                            <th>Moderate Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee, index) => {
                            const rating = ratings.find(r => r.employee.id === employee.employee.id) || { moderatedRating: 0 };
                            return (
                                <tr key={employee.employee.id}>
                                    <td>{index + 1}</td>
                                    <td>{employee.employee.employeeId}</td>
                                    <td>{`${employee.employee.firstName} ${employee.employee.middleName} ${employee.employee.lastName}`}</td>
                                    <td>{employee.employee.department}</td>
                                    <td>{employee.employee.designation}</td>
                                    <td>{employee.employee.division}</td>
                                    <td>{employee.employee.joiningDate}</td>
                                    <td>
                                        <input
                                            className='selectIM'
                                            type="number"
                                            value={rating.moderatedRating}
                                            min="0"
                                            max="5"
                                            onChange={(e) => handleRatingChange(employee.employee.id, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <div className='error-message'>
                    No team members available to give ratings.
                </div>
            )}

            <div className='form-controls'>
                {isEmployeesAvailable && (
                    <button type='button' className='btn' onClick={saveRatings}>Save Ratings</button>
                )}
                {isEmployeesAvailable && isRatingsAvailable && (
                    <button type='button' className='btn' onClick={exportToCSV}>Export to CSV</button>
                )}
            </div>
        </div>
    );
};

export default ModerateRating;
