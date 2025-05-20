import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faUserPlus, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FaEdit, FaEye, FaSearch, FaTrash, FaUserCheck } from 'react-icons/fa';
import OffboardingForm from '../OffBoardingForm';
import { fetchDataByKey } from '../../../Api.jsx';
import OffboardingViewModal from '../OffboardingViewModal.jsx';
import OffboardingCompleteModal from '../OffBoardingCompleteModal.jsx';
import { showToast } from '../../../Api.jsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { strings } from '../../../string.jsx';
import '../Offboarding.css';
const ManagerView = () => {
  const companyId = localStorage.getItem("companyId");
  const employeeId = localStorage.getItem("employeeId");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  const [viewingRecord, setViewingRecord] = useState(null);
  const [completingRecord, setCompletingRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    department: [],
    reason: [],
    inductionRegion: []
  });
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 0
  });

  const [filterType, setFilterType] = useState(null);
  const [selectedFilterValue, setSelectedFilterValue] = useState('all');
  const [showValueDropdown, setShowValueDropdown] = useState(false);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    description: '',
    heading: '',
    regionId: '',
    deptId: '',
    page: 0,
    size: 10,
    sortBy: 'id',
    direction: 'asc'
  });

  const fetchAllOffboardingData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://${strings.localhost}/api/offboarding/by-status-company-and-manager?status=true&companyId=${companyId}&managerId=${employeeId}&page=${filters.page}&size=${filters.size}`
      );
      const dataArray = response.data.content || response.data;

      const transformedData = dataArray.map(item => ({
        id: item.id,
        employeeName: item.name || `${item.employee?.firstName} ${item.employee?.lastName || ''}`,
        department: item.department,
        deptId: item.deptId,
        lastDate: moment(item.lastWorkingDate).format('YYYY-MM-DD'),
        status: item.completionStatus ? 'Completed' : 'Pending',
        year: moment(item.lastWorkingDate).format('YYYY'),
        completionStatus: item.completionStatus,
        employeeId: item.employeeId || item.employee?.id
      }));

      setRecords(transformedData);
      setPagination({
        totalItems: response.data.totalElements,
        totalPages: response.data.totalPages,
        currentPage: response.data.number
      });
    } catch (error) {
      console.error('Error fetching all offboarding data:', error);
      toast.error('Failed to fetch offboarding data');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOffboardingData = async () => {
    try {
      setIsLoading(true);

      if (!filterType || selectedFilterValue === 'all') {
        await fetchAllOffboardingData();
        return;
      }

      const baseParams = {
        companyId: companyId
      };

      if (filterType && selectedFilterValue !== 'all') {
        switch (filterType) {
          case 'department':
            const selectedDept = dropdownData.department.find(
              dept => dept.masterId == selectedFilterValue
            );
            if (selectedDept) {
              baseParams.deptId = selectedDept.masterId;
            }
            break;
          case 'status':
          case 'completion':
            baseParams.completionStatus = selectedFilterValue === 'Completed' || selectedFilterValue === 'completed';
            break;
          case 'year':
            baseParams.year = selectedFilterValue;
            break;
          default:
            break;
        }
      }

      const params = new URLSearchParams(baseParams);
      const response = await axios.get(
        `http://${strings.localhost}/api/offboarding/searchOffBoarding?${params.toString()}`
      );
      const dataArray = response.data.content || response.data;
      const transformedData = dataArray.map(item => ({
        id: item.id,
        employeeName: item.name || `${item.employee?.firstName} ${item.employee?.lastName || ''}`,
        department: item.department,
        deptId: item.deptId,
        lastDate: moment(item.lastWorkingDate).format('YYYY-MM-DD'),
        status: item.completionStatus ? 'Completed' : 'Pending',
        year: moment(item.lastWorkingDate).format('YYYY'),
        completionStatus: item.completionStatus
      }));

      setRecords(transformedData);
      setPagination({
        totalItems: response.data.totalElements,
        totalPages: response.data.totalPages,
        currentPage: response.data.number
      });
    } catch (error) {
      console.error('Offboarding Filter Error:', error);
      toast.error('Failed to fetch offboarding data');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchOffboardingRecords = async (searchTerm) => {
    setIsLoading(true);
    try {
      if (searchTerm.trim() === '') {
        await fetchAllOffboardingData();
        return;
      }

      const response = await axios.get(`http://${strings.localhost}/api/offboarding/search`, {
        params: {
          companyId: companyId,
          employeeName: searchTerm,
        }
      });
      const dataArray = response.data.content || response.data;
      const formattedData = dataArray.map(item => ({
        id: item.id,
        employeeName: item.name || `${item.employee?.firstName} ${item.employee?.lastName || ''}`,
        department: item.department,
        lastDate: moment(item.lastWorkingDate).format('YYYY-MM-DD'),
        status: item.completionStatus ? 'Completed' : 'Pending',
        year: moment(item.lastWorkingDate).format('YYYY'),
        completionStatus: item.completionStatus
      }));
      setRecords(formattedData);
    } catch (error) {
      toast.error('Error searching offboarding records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffboardingData();
  }, [filterType, selectedFilterValue, companyId]);

  const getUniqueYears = () => {
    const years = [...new Set(records.map(record => record.year))].sort((a, b) => b - a);
    return years;
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  useEffect(() => {
    fetchAllOffboardingData();
    const fetchDropdownData = async () => {
      try {
        const departments = await fetchDataByKey('department');
        const reasons = await fetchDataByKey('reason');
        setDropdownData({
          department: departments,
          reason: reasons
        });
      } catch (error) {
        toast.error('Error fetching dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, [companyId]);

  const handleView = async (record) => {
    setIsLoading(true);
    try {
      const offboardingResponse = await axios.get(`http://${strings.localhost}/api/offboarding/${record.id}`);

      let handovers = [];
      let exitInterview = null;

      try {
        const handoversResponse = await axios.get(`http://${strings.localhost}/api/knowledgeTransfer/offBoarding?offBoardingId=${record.id}`);
        const exitInterviewResponse = await axios.get(`http://${strings.localhost}/api/exit-interviews/offboarding/${record.id}`);

        handovers = handoversResponse.data || [];
        exitInterview = exitInterviewResponse.data || null;
      } catch (error) {
        console.warn('Optional data fetch failed:', error);
        toast.warning('Some additional data could not be fetched.');
      }

      const completeRecord = {
        ...offboardingResponse.data,
        ...record,
        handovers,
        exitInterview
      };

      setViewingRecord(completeRecord);
    } catch (error) {
      toast.error('Error fetching record details');
      console.error('Main fetch error:', error);
      setViewingRecord(record);
    } finally {
      setIsLoading(false);
    }
  };


  const handleComplete = async (record) => {
    try {
      const [handoversResponse, exitInterviewResponse, assetResponse] = await Promise.all([
        axios.get(`http://${strings.localhost}/api/knowledgeTransfer/offBoarding?offBoardingId=${record.id}`),
        axios.get(`http://${strings.localhost}/api/exit-interviews/offboarding/${record.id}`).catch(() => ({ data: null })),
        axios.get(`http://${strings.localhost}/api/asset/getByEmployee/${record.employeeId}`).catch(() => ({ data: [] }))
      ]);

      setCompletingRecord({
        ...record,
        handovers: handoversResponse.data || [],
        exitInterview: exitInterviewResponse.data || [],
        assets: assetResponse.data
      });
    } catch (error) {
      console.error('Error fetching completion data:', error);
      toast.error('Failed to fetch completion details');
    }
  };

  const handleCompleteOffboarding = async (recordId) => {
    try {
      await axios.put(
        `http://${strings.localhost}/api/offboarding/complete/${recordId}?completedBy=${firstName + lastName + employeeId}`,
        { completionStatus: true }
      );
      fetchOffboardingData();
      toast.success('Offboarding marked as complete successfully!');
    } catch (error) {
      toast.error('Error completing offboarding:', error);
      throw error;
    }
  };

  const handleUpdate = async (record) => {
    setIsLoading(true);
    try {
      const [offboardingResponse, handoversResponse, exitInterviewResponse, assetsResponse] = await Promise.all([
        axios.get(`http://${strings.localhost}/api/offboarding/${record.id}`),
        axios.get(`http://${strings.localhost}/api/knowledgeTransfer/offBoarding?offBoardingId=${record.id}`),
        axios.get(`http://${strings.localhost}/api/exit-interviews/offboarding/${record.id}`).catch(() => ({ data: null })),
        axios.get(`http://${strings.localhost}/api/asset/getByEmployee/${record.employeeId}`).catch(() => ({ data: [] }))
      ]);

      console.log('Offboarding response:', offboardingResponse.data);
      const completeRecord = {
        ...offboardingResponse.data,
        ...record,
        handovers: handoversResponse.data || [],
        exitInterview: exitInterviewResponse.data || null,
        assets: assetsResponse.data || []
      };
      setEditingRecord(completeRecord);
      setShowModal(true);
    } catch (error) {
      toast.error('Error fetching record details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterTypeChange = (e) => {
    const selectedType = e.target.value;
    setFilterType(selectedType === 'all' ? null : selectedType);
    setSelectedFilterValue('all');
    setShowValueDropdown(selectedType !== 'all');
  };

  const handleFilterValueChange = (e) => {
    setSelectedFilterValue(e.target.value);
  };

  const handleSearchInputChange = (event) => {
    const searchTerm = event.target.value;
    setFilters(prev => ({
      ...prev,
      heading: searchTerm,
      page: 0
    }));

    if (searchTerm.trim() !== '') {
      searchOffboardingRecords(searchTerm);
    } else {
      fetchOffboardingData();
    }
  };

  const getFilterOptions = () => {
    if (!filterType) return [];

    switch (filterType) {
      case 'department':
        return dropdownData.department.map(dept => ({
          value: dept.masterId,
          label: dept.data
        }));
      case 'status':
        return [
          { value: 'Pending', label: 'Pending' },
          { value: 'Completed', label: 'Completed' }
        ];
      case 'year':
        return getUniqueYears().map(year => ({
          value: year,
          label: year
        }));
      case 'completion':
        return [
          { value: 'completed', label: 'Completed' },
          { value: 'pending', label: 'Pending' }
        ];
      default:
        return [];
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const PaginationControls = () => (
    <div className="form-controls">
      <button
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 0}
        type='button'
        className='pagination-btn'
      >
        Previous
      </button>
      <span>
        {pagination.currentPage + 1} of {pagination.totalPages}
      </span>
      <button
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage >= pagination.totalPages - 1}
        type='button'
        className='pagination-btn'
      >
        Next
      </button>
    </div>
  );
  const editDropdownMenu = (record) => (
    <div className="dropdown">
      <button className="dots-button">
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      <div className="dropdown-content">
        {!record.completionStatus ? (
          <div>
            <button
              type="button"
              onClick={() => handleComplete(record)}
            >
              <FaUserCheck /> Complete
            </button>
          </div>
        ) : (
          <div>
            <button
              type="button"
              disabled
              className="readonly"
            >
              <FaUserCheck /> Completed
            </button>
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => handleView(record)}
          >
            <FaEye /> View
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => handleUpdate(record)}
          >
            <FaEdit /> Update
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <div className="coreContainer">
      <div className="filters">
        <div className="search-bar">
          <input
            placeholder="Search by employee name..."
            value={filters.heading}
            onChange={handleSearchInputChange}
          />
          <FaSearch className="search-icon" />
        </div>

        <select
          id="filterType"
          className="selectIM"
          value={filterType || 'all'}
          onChange={handleFilterTypeChange}
        >
          <option value="all">All Filters</option>
          <option value="department">Department</option>
          <option value="status">Status</option>
          <option value="year">Year</option>
          <option value="completion">Completion</option>
        </select>

        {showValueDropdown && (
          <select
            id="filterValue"
            className="selectIM"
            value={selectedFilterValue}
            onChange={handleFilterValueChange}
          >
            <option value="all">All {filterType}</option>
            {getFilterOptions().map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <div className="underlineText">Resigned Employees</div>
        <table className="interview-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Last Date</th>
              <th>Year</th>
              <th>Status</th>
              <th style={{ width: "5%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="loading-text">Loading data...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No records found</td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr key={record.id}>
                  <td>{index + 1}</td>
                  <td>{record.employeeName}</td>
                  <td>{record.department}</td>
                  <td>{record.lastDate}</td>
                  <td>{record.year}</td>
                  <td>
                    <span className={`off-status-badge off-status-${record.status.toLowerCase().replace(' ', '-')}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    {editDropdownMenu(record)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <PaginationControls />
      </div>

      {showModal && (
        <OffboardingForm
          companyId={companyId}
          employeeId={employeeId}
          onClose={() => {
            setShowModal(false);
            setEditingRecord(null);
            fetchOffboardingData();
          }}
          fetchOffboardingData={fetchOffboardingData}
          dropdownData={dropdownData}
          editingRecord={editingRecord}
          isEditMode={!!editingRecord}
        />
      )}

      {completingRecord && (
        <OffboardingCompleteModal
          record={completingRecord}
          onClose={() => setCompletingRecord(null)}
          onComplete={handleCompleteOffboarding}
        />
      )}

      {viewingRecord && (
        <OffboardingViewModal
          record={viewingRecord}
          onClose={() => setViewingRecord(null)}
        />
      )}
    </div>
  );
};

export default ManagerView;