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

  const [dropdownData, setDropdownData] = useState({
    region: [],
    department: []
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMainOption, setSelectedMainOption] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    department: '',
    region: ''
  });
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
      page: 0,
      size: value ?
        (reportTypes[value]?.pagination?.defaultSize || 15) :
        15
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

    if (filters.year) {
      data = data.filter(item => {
        const itemYear = new Date(item.date || item.startDate || item.createdAt).getFullYear().toString();
        return itemYear === filters.year;
      });
    }
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

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 3; i > 0; i--) {
      years.push(currentYear - i);
    }
    years.push(currentYear);
    return years;
  };

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

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const responseRegion = await fetchDataByKey('region');
        const regionList = responseRegion || [];
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
              <label htmlFor="dept-filter">All Years</label>
              <select value={filters.year} onChange={handleYearChange} className='selectIM'>
                <option value="">All Years</option>
                {generateYearRange().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {reportTypes[selectedMainOption].filters.department && (
              <div className="dropdown-container">
                <label htmlFor="dept-filter">Department</label>
                <select
                  id="dept-filter"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className='selectIM'
                >
                  <option value="">All Departments</option>
                  {dropdownData.department.map((department) => (
                    <option key={department.masterId} value={department.masterId}>{department.data}</option>
                  ))}
                </select>
              </div>
            )}

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