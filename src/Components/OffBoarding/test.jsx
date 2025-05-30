<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from 'react';
import { fetchDataByKey } from '../../Api.jsx';
import axios from 'axios';
import { strings } from '../../string';

const ResignationForm = ({ 
    isOpen, 
    onClose, 
    companyId, 
    employeeId, 
    employeeFirstName,
    hrDetails 
}) => {
    const currentDate = new Date().toISOString().split('T')[0];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dropdownDepartment, setDropdownDepartment] = useState({ department: [] });

    const [selectedHR, setSelectedHR] = useState({
        id: '',
        employeeId: '',
        employeeFirstName: '',
        employeeLastName: '',
    });

    const [selectedManager, setSelectedManager] = useState({
        id: '',
        employeeId: '',
        employeeFirstName: '',
        employeeLastName: '',
    });

    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsManager, setSearchResultsManager] = useState([]);

    const [formData, setFormData] = useState({
        applied: true,
        completionStatus: false,
        date: currentDate,
        department: '',
        deptId: '',
        lastWorkingDate: '',
        name: employeeFirstName,
        other: '',
        reason: '',
        status: false,
        companyId: companyId,
        employeeId: selectedHR?.id || '',
        hrId: hrDetails?.id || employeeId,
        hrName: hrDetails?.name || '',
        reportingManagerId: selectedManager?.id || '',
        reportingManagerName: selectedManager?.name || ''
    });

    useEffect(() => {
        const fetchDropdownDepartment = async () => {
            try {
                setIsLoading(true);
                const departments = await fetchDataByKey('department');
                setDropdownDepartment({ department: departments });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDropdownDepartment();
    }, []);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            employeeId: selectedHR?.id || '',
            reportingManagerId: selectedManager?.id || '',
            reportingManagerName: selectedManager?.employeeFirstName 
                ? `${selectedManager.employeeFirstName} ${selectedManager.employeeLastName || ''}`
                : '',
            hrId: hrDetails?.id || employeeId,
            hrName: hrDetails?.name || ''
        }));
    }, [selectedHR, selectedManager, employeeId, hrDetails]);

    const handleEmployeeSearch = async (searchTerm, setResults) => {
        if (searchTerm.trim() === '') {
            setResults([]);
            return;
        }

        try {
            const response = await axios.get(
                `http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${searchTerm.trim()}`
            );
            setResults(response.data);
            setError(null);
        } catch (error) {
            console.error('Error searching employees:', error);
            setError('Error searching employees');
            setResults([]);
        }
    };

    const handleHRNameChange = (event) => {
        const { value } = event.target;
        setSelectedHR(prev => ({ ...prev, employeeFirstName: value }));
        handleEmployeeSearch(value, setSearchResults);
    };

    const handleManagerNameChange = (event) => {
        const { value } = event.target;
        setSelectedManager(prev => ({ ...prev, employeeFirstName: value }));
        handleEmployeeSearch(value, setSearchResultsManager);
    };

    const handleSelectEmployee = (employee, setEmployee, setResults) => {
        setEmployee({
            id: employee.id,
            employeeId: employee.employeeId,
            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName || '',
        });
        setResults([]);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDepartmentChange = (e) => {
        const selectedDepartment = dropdownDepartment.department.find(
            r => r.data === e.target.value
        );
        setFormData(prev => ({
            ...prev,
            department: e.target.value,
            deptId: selectedDepartment ? selectedDepartment.masterId : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!selectedHR?.id || !selectedManager?.id) {
            setError('Please select both an employee and a manager');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/offboarding/save/${companyId}/${employeeId}/${selectedManager.id}/${selectedHR.id}`,
                formData
            );

            if (response.status === 200 || response.status === 201) {
                alert('Resignation submitted successfully!');
                onClose();
            } else {
                throw new Error('Failed to submit resignation');
            }
        } catch (error) {
            console.error('Error submitting resignation:', error);
            setError('Error submitting resignation. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSearchResults = (results, handleSelect) => {
        if (results.length === 0) return null;
        
        return (
            <ul className="dropdown2">
                {results.map((employee) => (
                    <li
                        key={employee.id}
                        onClick={() => handleSelect(employee)}
                        style={{ cursor: 'pointer' }}
                    >
                        {`${employee.firstName} ${employee.lastName} (${employee.employeeId})`}
                    </li>
                ))}
            </ul>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <div className='form-title'>Resignation Form</div>
                    <button className="button-close" onClick={onClose}>×</button>
                </div>

                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className='input-row'>
                        <div>
                            <label>Application Date:</label>
                            <input
                                type="text"
                                value={formData.date}
                                readOnly
                                className="uneditable-field"
                            />
                        </div>

                        <div>
                            <label>Employee ID:</label>
                            <input
                                type="text"
                                name='hrId'
                                value={formData.hrId}
                                onChange={handleInputChange}
                                readOnly
                            />
                        </div>

                        <div>
                            <label>Employee Name:</label>
                            <input
                                type="text"
                                value={formData.name}
                                readOnly
                                className="uneditable-field"
                            />
                        </div>
                    </div>

                    <div className='input-row'>
                        <div>
                            <label htmlFor='hrName'>HR Name:</label>
                            <input
                                type="text"
                                name='hrName'
                                id='hrName'
                                value={selectedHR.employeeFirstName}
                                onChange={handleHRNameChange}
                            />
                            {renderSearchResults(searchResults, (employee) => 
                                handleSelectEmployee(employee, setSelectedHR, setSearchResults)
                            )}
                        </div>

                        <div>
                            <label htmlFor='reportingManagerName'>Reporting Manager Name:</label>
                            <input
                                type="text"
                                name='reportingManagerName'
                                id='reportingManagerName'
                                value={selectedManager.employeeFirstName}
                                onChange={handleManagerNameChange}
                            />
                            {renderSearchResults(searchResultsManager, (employee) => 
                                handleSelectEmployee(employee, setSelectedManager, setSearchResultsManager)
                            )}
                        </div>

                        <div>
                            <label htmlFor="department">Department:</label>
                            <select
                                name="department"
                                value={formData.department}
                                className="selectIM"
                                onChange={handleDepartmentChange}
                                required
                                disabled={isLoading}
                            >
                                <option value="">Select Department</option>
                                {dropdownDepartment.department?.length > 0 ? (
                                    dropdownDepartment.department.map(option => (
                                        <option key={option.masterId} value={option.data}>
                                            {option.data}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Department Not available</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className='input-row'>
                        <div>
                            <label>
                                Last Working Date:
                                <input
                                    type="date"
                                    name="lastWorkingDate"
                                    value={formData.lastWorkingDate}
                                    onChange={handleInputChange}
                                    className='selectIM'
                                    required
                                />
                            </label>
                        </div>

                        <div>
                            <label>
                                Reason:
                                <select
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a reason</option>
                                    <option value="Personal">Personal</option>
                                    <option value="Career Growth">Career Growth</option>
                                    <option value="Better Opportunity">Better Opportunity</option>
                                    <option value="Health">Health</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label>
                            Other:
                            <textarea
                                name="other"
                                value={formData.other}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-controls">
                        <button
                            type="button"
                            className='outline-btn'
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className='btn'
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResignationForm;
>>>>>>> 8a5f66f (merging code)
