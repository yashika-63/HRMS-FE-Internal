import React, { useEffect, useState } from 'react';
import { fetchDataByKey } from '../../Api';
import axios from 'axios';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
 
const ReportsFilters = () => {
  const [dropdownData, setDropdownData] = useState({
    region: [],
    department: []
  });
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(false);
 
  const mainOptions = [
    { value: '', label: 'Select an option' },
    { value: 'leave', label: 'Leave' },
    { value: 'induction', label: 'Induction' },
    { value: 'training', label: 'Training' },
  ];
 
  const filterOptions = {
    leave: {
      years: ['2023', '2022', '2021'],
      departments: ['HR', 'Finance', 'IT']
    },
    induction: {
      years: ['2023', '2022']
    },
    training: {
      years: ['2023', '2022', '2021', '2020'],
      departments: ['HR', 'Finance', 'IT', 'Marketing']
    }
  };
 
  const sampleData = {
    leave: [
      { id: 1, year: '2023', department: 'HR', region: 'North', days: 5 },
      { id: 2, year: '2023', department: 'IT', region: 'South', days: 3 },
      { id: 3, year: '2022', department: 'Finance', region: 'East', days: 7 }
    ],
    induction: [
      { id: 1, year: '2023', region: 'North', participants: 15 },
      { id: 2, year: '2022', region: 'South', participants: 10 }
    ]
  };
 
  const [selectedMainOption, setSelectedMainOption] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    department: '',
    region: ''
  });
 
  const fetchTrainingData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://${strings.localhost}/api/training-report/companyTrainings?page=0&size=50&sortDir=asc`);
      setTrainingData(response.data.content || []);
    } catch (error) {
      console.error('Error fetching training data:', error);
      setTrainingData([]);
    } finally {
      setLoading(false);
    }
  };
 
  const handleMainOptionChange = (e) => {
    const value = e.target.value;
    setSelectedMainOption(value);
    setFilters({
      year: '',
      department: '',
      region: ''
    });
 
    if (value === 'training') {
      fetchTrainingData();
    }
  };
 
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
 
  const getFilteredData = () => {
    if (!selectedMainOption) return [];
 
    let data;
    if (selectedMainOption === 'training') {
      data = [...trainingData];
    } else {
      data = sampleData[selectedMainOption];
    }
 
    if (filters.year) {
      data = data.filter(item => {
        const itemYear = new Date(item.date || item.startDate || item.createdAt).getFullYear().toString();
        return itemYear === filters.year;
      });
    }
    if (filters.department && data[0]?.hasOwnProperty('department')) {
      data = data.filter(item => item.department === filters.department);
    }
    if (filters.region) {
      data = data.filter(item => item.region === filters.region);
    }
 
    return data;
  };
 
  const getTableColumns = () => {
    if (!selectedMainOption) return [];
 
    try {
      if (selectedMainOption === 'training') {
        if (trainingData.length > 0) {
          return Object.keys(trainingData[0]).filter(key => key !== 'id');
        }
        return ['topic', 'department', 'region', 'duration', 'trainer', 'date'];
      }
 
 
      if (sampleData[selectedMainOption] && sampleData[selectedMainOption].length > 0) {
        return Object.keys(sampleData[selectedMainOption][0]).filter(key => key !== 'id');
      }
 
      switch (selectedMainOption) {
        case 'leave':
          return ['year', 'department', 'region', 'days'];
        case 'induction':
          return ['year', 'region', 'participants'];
        default:
          return [];
      }
    } catch (error) {
      console.error('Error getting table columns:', error);
      return [];
    }
  };
 
  const filteredData = getFilteredData();
  const tableColumns = getTableColumns();
 
  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 3; i > 0; i--) {
      years.push(currentYear - i);
    }
    years.push(currentYear);
    return years;
  };
 
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const responseRegion = await fetchDataByKey('region');
        const regionList = responseRegion || [];
        const regions = regionList.map(item => item.data);
 
        const responseDepartment = await fetchDataByKey('department');
        const departmentList = responseDepartment || [];
        const departments = departmentList.map(item => item.data);
 
        setDropdownData({
          region: regions,
          department: departments
        });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);
 
  const exportToExcel = () => {
    if (filteredData.length === 0) return;
    const dataForExport = filteredData.map((item, index) => {
      const exportItem = {
        'Sr.No': index + 1,
      };
      tableColumns.forEach(column => {
        let value = item[column];
        if (value === undefined || value === null) value = 'N/A';
        if (column === 'date' && value && value !== 'N/A') {
          value = new Date(value).toLocaleDateString();
        }
        exportItem[column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1')] = value;
      });
      return exportItem;
    });
    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ReportData");
    const fileName = `${selectedMainOption + "Report" || 'Report'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
 
  return (
    <div className="coreContainer">
      <h1 className="form-title">Reports Dashboard</h1>
 
      <div className="middleline-btn">
        <div>
          <label htmlFor="main-option">Main Category</label>
          <select
            id="main-option"
            value={selectedMainOption}
            onChange={handleMainOptionChange}
            className="selectIM"
          >
            {mainOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
 
        {selectedMainOption && (
          <>
            <div className="dropdown-container">
              <label htmlFor="year-filter">Year</label>
              <select
                id="year-filter"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className='selectIM'
              >
                <option value="">All Years</option>
                {generateYearRange().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
 
            {(selectedMainOption === 'leave' || selectedMainOption === 'training') && (
              <div className="dropdown-container">
                <label htmlFor="dept-filter">Department</label>
                <select
                  id="dept-filter"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className='selectIM'
                >
                  <option value="">All Departments</option>
                  {dropdownData.department.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
            )}
 
            <div className="dropdown-container">
              <label htmlFor="region-filter">Region</label>
              <select
                id="region-filter"
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className='selectIM'
              >
                <option value="">All Regions</option>
                {dropdownData.region.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
         </>
        )}
      </div>
 
      {tableColumns.length > 0 ? (
        <table className="interview-table">
          <thead>
            <tr>
              {tableColumns.map(column => (
                <th key={column}>{column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item.id || index}>
                {tableColumns.map(column => {
                  let value = item[column];
                  if (value === undefined || value === null) value = '-';
                  if (column === 'date' && value && value !== '-') {
                    value = new Date(value).toLocaleDateString();
                  }
                  return <td key={`${item.id || index}-${column}`}>{value}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">No columns available to display</div>
      )}
 
      <div className='form-controls'>
        <button
          onClick={exportToExcel}
          className="btn"
          disabled={filteredData.length === 0}
        >
          <FaFileExcel style={{ marginRight: '8px' }} />
          Export to Excel
        </button>
      </div>
    </div>
  );
};
 
export default ReportsFilters;