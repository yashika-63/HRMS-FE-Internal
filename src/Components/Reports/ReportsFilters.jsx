<<<<<<< HEAD
import React, { useCallback, useEffect, useState } from 'react';
import { fetchDataByKey } from '../../Api';
import axios from 'axios';
import { FaFileExcel } from 'react-icons/fa';
import './ReportsFilters.css';
import { reportTypes, exportReportApiPaths } from './ReportTypes';
import ReportsTable from './ReportsTable';
import { toast } from 'react-toastify';

const ReportsFilters = () => {
  const companyId = localStorage.getItem("companyId");

=======
import React, { useEffect, useState } from 'react';
import { fetchDataByKey } from '../../Api';
import axios from 'axios';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
 
const ReportsFilters = () => {
>>>>>>> 8a5f66f (merging code)
  const [dropdownData, setDropdownData] = useState({
    region: [],
    department: []
  });
<<<<<<< HEAD
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
=======
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
 
>>>>>>> 8a5f66f (merging code)
  const [selectedMainOption, setSelectedMainOption] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    department: '',
    region: ''
  });
<<<<<<< HEAD
  const [pagination, setPagination] = useState(() => {
    const defaultSize = selectedMainOption ?
      reportTypes[selectedMainOption]?.pagination?.defaultSize || 15 :
      15;
    return {
      page: 0,
      size: defaultSize,
      totalElements: 0,
      sortDir: 'asc',
      sortBy: ''
    };
  });
  const [sortByOptions, setSortByOptions] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({});

  const mainOptions = [
    { value: '', label: 'Select an option' },
    ...Object.entries(reportTypes).map(([value, config]) => ({
      value,
      label: config.label
    }))
  ];

  const fetchReportData = useCallback(async () => {
    if (!selectedMainOption) return;

    setLoading(true);
    try {
      const { page, size, sortDir, sortBy } = pagination;
      const apiPath = reportTypes[selectedMainOption].apiPath;

      const queryParams = new URLSearchParams({
        page: page,
        size: size,
        sortDir: sortDir,
        ...(sortBy && { sortBy: sortBy }),
        ...(filters.department && { departmentId: filters.department }),
        ...(filters.region && { region: filters.region }),
        ...(filters.year && { year: filters.year }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await axios.get(
        `http://localhost:5558/api/${apiPath}/${companyId}?${queryParams}`
      );

      setReportData(response.data.content || response.data || []);
      setPagination(prev => ({
        ...prev,
        totalElements: response.data.totalElements || (response.data.length || 0)
      }));
    } catch (error) {
      console.error(`Error fetching ${selectedMainOption} data:`, error);
      setReportData([]);
      setPagination(prev => ({
        ...prev,
        totalElements: 0
      }));
    } finally {
      setLoading(false);
    }
  }, [selectedMainOption, pagination.page, pagination.size, pagination.sortDir, pagination.sortBy, filters.department, filters.region, filters.year, filters.startDate, filters.endDate]);

=======
 
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
 
>>>>>>> 8a5f66f (merging code)
  const handleMainOptionChange = (e) => {
    const value = e.target.value;
    setSelectedMainOption(value);
    setFilters({
      year: '',
      department: '',
      region: ''
    });
<<<<<<< HEAD
    setPagination(prev => ({
      ...prev,
      page: 0,
      size: value ?
        (reportTypes[value]?.pagination?.defaultSize || 15) :
        15
    }));
  };

=======
 
    if (value === 'training') {
      fetchTrainingData();
    }
  };
 
>>>>>>> 8a5f66f (merging code)
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
<<<<<<< HEAD
    setPagination(prev => ({
      ...prev,
      page: 0
    }));
  };

  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPagination(prev => ({
      ...prev,
      size,
      page: 0
    }));
  };

  const handleSortDirectionChange = (e) => {
    const sortDir = e.target.value;
    setPagination(prev => ({
      ...prev,
      sortDir,
      page: 0
    }));
  };

  const handleSortByChange = (e) => {
    const sortBy = e.target.value;
    setPagination(prev => ({
      ...prev,
      sortBy,
      page: 0
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  useEffect(() => {
    if (selectedMainOption) {
      fetchReportData();
    }
  }, [
    selectedMainOption,
    pagination.page,
    pagination.size,
    pagination.sortDir,
    pagination.sortBy,
    filters.department,
    filters.region,
    filters.year,
    filters.startDate,
    filters.endDate
  ]);

  const getFilteredData = () => {
    if (!selectedMainOption) return [];

    let data = [...reportData];

=======
  };
 
  const getFilteredData = () => {
    if (!selectedMainOption) return [];
 
    let data;
    if (selectedMainOption === 'training') {
      data = [...trainingData];
    } else {
      data = sampleData[selectedMainOption];
    }
 
>>>>>>> 8a5f66f (merging code)
    if (filters.year) {
      data = data.filter(item => {
        const itemYear = new Date(item.date || item.startDate || item.createdAt).getFullYear().toString();
        return itemYear === filters.year;
      });
    }
<<<<<<< HEAD
    if (filters.department && reportTypes[selectedMainOption].hasDepartment) {
      data = data.filter(item => item.departmentId?.toString() === filters.department);
    }
    if (filters.region) {
      data = data.filter(item => item.regionId?.toString() === filters.region);
    }

    return data;
  };

  const getTableColumns = () => {
    if (!selectedMainOption || reportData.length === 0) return [];
    return Object.keys(reportData[0])
      .filter(key => key !== 'id')
      .filter(column => visibleColumns[column] !== false);
  };

  useEffect(() => {
    if (reportData.length > 0) {
      const columns = Object.keys(reportData[0]).filter(key => key !== 'id');
      const initialVisibility = {};
      columns.forEach(column => {
        initialVisibility[column] = true;
      });
      setVisibleColumns(initialVisibility);
    }
  }, [reportData]);


  const filteredData = getFilteredData();
  const tableColumns = getTableColumns();
  const totalPages = Math.ceil(pagination.totalElements / pagination.size);

  useEffect(() => {
    if (tableColumns.length > 0) {
      const options = tableColumns.map(column => ({
        value: column,
        label: column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1')
      }));
      setSortByOptions(options);
    }
  }, [tableColumns]);

  const handleYearChange = (e) => {
    setFilters(prev => ({
      ...prev,
      year: e.target.value,
      page: 0
    }));
  };

=======
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
 
>>>>>>> 8a5f66f (merging code)
  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 3; i > 0; i--) {
      years.push(currentYear - i);
    }
    years.push(currentYear);
    return years;
  };
<<<<<<< HEAD

  const transformReportData = (data) => {
    if (!data || !selectedMainOption) return data;

    return data.map(item => {
      const transformedItem = { ...item };

      const typeKey = Object.keys(item).find(key => key.toLowerCase() === 'type');
      if (typeKey) {
        const isMandatory = Number(item[typeKey]) === 1;
        transformedItem[typeKey] = {
          value: isMandatory ? 'Mandatory' : 'Non Mandatory',
          className: isMandatory ? 'green-text' : 'orange-text'
        };
      }
      ['completionStatus', 'expiryStatus', 'applied'].forEach(key => {
        if (key in transformedItem) {
          const isYes = Boolean(transformedItem[key]);
          transformedItem[key] = {
            value: isYes ? 'Yes' : 'No',
            className: isYes ? 'green-text' : 'orange-text'
          };
        }
      });

      ['status', 'trainingStatus'].forEach(key => {
        if (key in transformedItem) {
          const isActive = Boolean(transformedItem[key]);
          transformedItem[key] = {
            value: isActive ? 'Active' : 'Inactive',
            className: isActive ? 'green-text' : 'red-text'
          };
        }
      });

      return transformedItem;
    });
  };

=======
 
>>>>>>> 8a5f66f (merging code)
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const responseRegion = await fetchDataByKey('region');
        const regionList = responseRegion || [];
<<<<<<< HEAD
        const regions = regionList.map(item => ({
          masterId: item.masterId,
          data: item.data
        }));

        const responseDepartment = await fetchDataByKey('department');
        const departmentList = responseDepartment || [];
        const departments = departmentList.map(item => ({
          masterId: item.masterId,
          data: item.data
        }));

=======
        const regions = regionList.map(item => item.data);
 
        const responseDepartment = await fetchDataByKey('department');
        const departmentList = responseDepartment || [];
        const departments = departmentList.map(item => item.data);
 
>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD

  const exportToExcel = async () => {
    if (!selectedMainOption) return;

    try {
      const apiPath = exportReportApiPaths[selectedMainOption];
      if (!apiPath) {
        throw new Error('No API path defined for this report type');
      }

      const transformedFilters = {
        ...filters,
      };

      const queryParams = new URLSearchParams({
        ...(filters.department && { departmentId: filters.department }),
        ...(filters.region && { region: filters.region }),
        ...(filters.year && { year: filters.year }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const url = `http://localhost:5558/api/export/${apiPath}/${companyId}?${queryParams}`;

      const response = await axios.get(url, {
        responseType: 'blob' // Important: Treat response as binary file
      });

      // Create blob and trigger file download
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${selectedMainOption}_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Export completed successfully! The download should start shortly.');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report. Please try again.');
    }
  };

  return (
    <div className="resultCoreContainer">
      <h1 className="form-title">Reports Dashboard</h1>

      <div className="filter-container">
        <div className="main-category">
=======
 
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
>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD

        {selectedMainOption && (
          <div className="secondary-filters">
            <div className="dropdown-container">
              <label htmlFor="dept-filter">All Years</label>
              <select value={filters.year} onChange={handleYearChange} className='selectIM'>
=======
 
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
>>>>>>> 8a5f66f (merging code)
                <option value="">All Years</option>
                {generateYearRange().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
<<<<<<< HEAD

            {reportTypes[selectedMainOption].filters.department && (
=======
 
            {(selectedMainOption === 'leave' || selectedMainOption === 'training') && (
>>>>>>> 8a5f66f (merging code)
              <div className="dropdown-container">
                <label htmlFor="dept-filter">Department</label>
                <select
                  id="dept-filter"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className='selectIM'
                >
                  <option value="">All Departments</option>
<<<<<<< HEAD
                  {dropdownData.department.map((department) => (
                    <option key={department.masterId} value={department.masterId}>{department.data}</option>
=======
                  {dropdownData.department.map(department => (
                    <option key={department} value={department}>{department}</option>
>>>>>>> 8a5f66f (merging code)
                  ))}
                </select>
              </div>
            )}
<<<<<<< HEAD

            {reportTypes[selectedMainOption].filters.region && (
              <div className="dropdown-container">
                <label htmlFor="region-filter">Region</label>
                <select
                  id="region-filter"
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className='selectIM'
                >
                  <option value="">All Regions</option>
                  {dropdownData.region.map((region) => (
                    <option key={region.masterId} value={region.masterId}>{region.data}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedMainOption && (
        <div className="secondary-filters">
          <div className='secondary-filters'>
            <div className="dropdown-container">
              <label htmlFor="start-date">Start Date</label>
              <input
                type="date"
                id="start-date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className='selectIM'
              />
            </div>

            <div className="dropdown-container">
              <label htmlFor="end-date">End Date</label>
              <input
                type="date"
                id="end-date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className='selectIM'
              />
            </div>
          </div>
          <div className="dropdown-container">
            <label htmlFor="records-per-page">Records per page:</label>
            <select
              id="records-per-page"
              value={pagination.size}
              onChange={handlePageSizeChange}
              className="selectIM"
            >
              {reportTypes[selectedMainOption]?.pagination?.availableSizes?.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="dropdown-container">
            <label htmlFor="sort-direction">Sort direction:</label>
            <select
              id="sort-direction"
              value={pagination.sortDir}
              onChange={handleSortDirectionChange}
              className="selectIM"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="dropdown-container">
            <label htmlFor="sort-by">Sort By:</label>
            <select
              id="sort-by"
              value={pagination.sortBy || ''}
              onChange={handleSortByChange}
              className="selectIM"
              disabled={sortByOptions.length === 0}
            >
              <option value="">Select field</option>
              {sortByOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {selectedMainOption && (
        <ReportsTable
          tableColumns={tableColumns}
          filteredData={transformReportData(filteredData)}
          pagination={pagination}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          selectedMainOption={selectedMainOption}
          loading={loading}
        />
      )}

=======
 
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
 
>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD

=======
 
>>>>>>> 8a5f66f (merging code)
export default ReportsFilters;