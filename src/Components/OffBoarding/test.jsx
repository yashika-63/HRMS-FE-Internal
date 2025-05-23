import React, { useEffect, useState } from 'react';
import { fetchDataByKey } from '../../Api';
import axios from 'axios';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import './ReportsFilters.css';

const ReportsFilters = () => {
  const [dropdownData, setDropdownData] = useState({
    region: [],
    department: []
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 15,
    totalElements: 0,
    sortDir: 'asc',
    sortBy: ''
  });
  const [sortByOptions, setSortByOptions] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({});

  const reportTypes = {
    leave: {
      apiPath: 'leave-report',
      label: 'Leave',
      hasDepartment: true
    },
    induction: {
      apiPath: 'induction-report',
      label: 'Induction',
      hasDepartment: false
    },
    training: {
      apiPath: 'training-report-companyTrainings',
      label: 'Training',
      hasDepartment: true
    },
    certification: {
      apiPath: 'training-report-Certifications',
      label: 'Certification',
      hasDepartment: true
    }
  };

  const mainOptions = [
    { value: '', label: 'Select an option' },
    ...Object.entries(reportTypes).map(([value, config]) => ({
      value,
      label: config.label
    }))
  ];

  const ColumnMenu = ({ column, onToggleVisibility }) => {
    return (
      <div className="column-menu">
        <button className="column-menu-button">⋮</button>
        <div className="column-menu-dropdown">
          <button onClick={() => onToggleVisibility(column)}>
            {visibleColumns[column] ? 'Hide Column' : 'Show Column'}
          </button>
        </div>
      </div>
    );
  };

  const fetchReportData = async () => {
    if (!selectedMainOption) return;

    setLoading(true);
    try {
      const { page, size, sortDir, sortBy } = pagination;
      const apiPath = reportTypes[selectedMainOption].apiPath;
      const response = await axios.get(
        `http://localhost:5558/api/${apiPath}?page=${page}&size=${size}&sortDir=${sortDir}${sortBy ? `&sortBy=${sortBy}` : ''}`
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
      const { page, size, sortDir, sortBy } = pagination;
      const response = await axios.get(`http://localhost:5558/api/training-report-companyTrainings?page=${page}&size=${size}&sortDir=${sortDir}&sortBy=${sortBy}`);
      setTrainingData(response.data.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: response.data.totalElements || 0
      }));
    } catch (error) {
      console.error('Error fetching training data:', error);
      setTrainingData([]);
      setPagination(prev => ({
        ...prev,
        totalElements: 0
      }));
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
    setPagination(prev => ({
      ...prev,
      page: 0
    }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
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
  }, [selectedMainOption, pagination.page, pagination.size, pagination.sortDir, pagination.sortBy]);

  const getFilteredData = () => {
    if (!selectedMainOption) return [];

    let data = [...reportData];

    if (filters.year) {
      data = data.filter(item => {
        const itemYear = new Date(item.date || item.startDate || item.createdAt).getFullYear().toString();
        return itemYear === filters.year;
      });
    }
    if (filters.department && reportTypes[selectedMainOption].hasDepartment) {
      data = data.filter(item => item.department === filters.department);
    }
    if (filters.region) {
      data = data.filter(item => item.region === filters.region);
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

  const toggleColumnVisibility = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const ColumnVisibilityControls = () => {
    if (!selectedMainOption || reportData.length === 0) return null;

    const allColumns = Object.keys(reportData[0]).filter(key => key !== 'id');

    return (
      <div className="column-visibility-controls">
        <h4>Toggle Columns:</h4>
        <div className="column-toggle-buttons">
          {allColumns.map(column => (
            <button
              key={`toggle-${column}`}
              onClick={() => toggleColumnVisibility(column)}
              className={`toggle-btn ${visibleColumns[column] === false ? 'inactive' : 'active'}`}
            >
              {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>
      </div>
    );
  };

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

      <div className="filter-container">
        <div className="main-category">
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
          <div className="secondary-filters">
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

            {(selectedMainOption === 'leave' || selectedMainOption === 'training' || selectedMainOption === 'certification') && (
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
          </div>
        )}
      </div>

      {selectedMainOption && (
        <div className="pagination-controls">
          <div className="records-per-page">
            <label htmlFor="records-per-page">Records per page:</label>
            <select
              id="records-per-page"
              value={pagination.size}
              onChange={handlePageSizeChange}
              className="selectIM"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="sort-direction">
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

          <div className="sort-by">
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

      {tableColumns.length > 0 ? (
        <div className="result-table-container">
          <ColumnVisibilityControls />
          <table className="result-table">
            <thead>
              <tr>
                {tableColumns.map(column => (
                  <th key={column}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1')}
                      <ColumnMenu
                        column={column}
                        onToggleVisibility={toggleColumnVisibility}
                      />
                    </div>
                  </th>
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

          {selectedMainOption === 'training' && pagination.totalElements > 0 && (
            <div className="form-controls">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 0}
                className='btn'
              >
                Previous
              </button>
              <span>
                Page {pagination.page + 1} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages - 1}
                className='btn'
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data">
          {loading ? 'Loading...' : 'No data available to display'}
        </div>
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