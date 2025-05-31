import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faUserPlus, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FaEdit, FaEye, FaSearch, FaTrash, FaUserCheck } from 'react-icons/fa';
import OffboardingForm from './OffBoardingForm';
import { fetchDataByKey } from '../../Api.jsx';
import OffboardingViewModal from './OffboardingViewModal.jsx';
import OffboardingCompleteModal from './OffBoardingCompleteModal.jsx';
import { showToast } from '../../Api.jsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { strings } from '../../string.jsx';
import './Offboarding.css';
const OffBoarding = () => {
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

  const [filterType, setFilterType] = useState(null);
  const [selectedFilterValue, setSelectedFilterValue] = useState('all');
  const [showValueDropdown, setShowValueDropdown] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    description: '',
    heading: '',
    regionId: '',
    deptId: '',
    page: 0,
    size: 0,
    sortBy: 'id',
    direction: 'asc'
  });

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });



  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`http://${strings.localhost}/api/offboarding/searchByCompOrStatus`, {
        params: {
          companyId,
          page: pagination.page,
          size: pagination.size
        }
      });
      const dataArray = res.data.content || res.data;
      setRecords(transformOffboardingData(dataArray));
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.totalPages,
        totalElements: res.data.totalElements
      }));
    } catch (err) {
      // toast.error('Failed to fetch offboarding data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [companyId, pagination.page, pagination.size]);



  const transformOffboardingData = (data) => {
    return data.map(item => ({
      id: item.id,
      employeeName: item.name || `${item.employee?.firstName} ${item.employee?.lastName || ''}`,
      department: item.department,
      deptId: item.deptId,
      lastDate: moment(item.lastWorkingDate).format('YYYY-MM-DD'),
      year: moment(item.lastWorkingDate).format('YYYY'),
      status: item.completionStatus ? 'Completed' : 'Pending',
      completionStatus: item.completionStatus,
      employeeId: item.employeeId || item.employee?.id
    }));
  };


  const fetchOffboardingData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if ((filterType === 'status' || filterType === 'completion') && selectedFilterValue.toLowerCase() !== 'all') {
        const isCompleted = selectedFilterValue.toLowerCase() === 'completed';
        params.append('completionStatus', isCompleted);
      }
      params.append('companyId', companyId);

      if (filterType === 'department') {
        const selectedDept = dropdownData.department.find(
          dept => dept.masterId == selectedFilterValue
        );
        if (selectedDept) {
          params.append('deptId', selectedDept.masterId);
        }
      } else if (filterType === 'year') {
        params.append('year', selectedFilterValue);
      }

      params.append('page', pagination.page);
      params.append('size', pagination.size);

      const response = await axios.get(
        `http://${strings.localhost}/api/offboarding/searchOffBoarding?${params.toString()}`
      );

      const dataArray = response.data.content || response.data;
      setRecords(transformOffboardingData(dataArray));
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      }));
    } catch (error) {
      console.error('Offboarding Filter Error:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchOffboardingRecords = async (searchTerm) => {
    setIsLoading(true);
    try {
      if (searchTerm.trim() === '') {
        setPagination(prev => ({ ...prev, page: 0 }));
        await fetchOffboardingData(0, pagination.size);
        return;
      }

      const response = await axios.get(`http://${strings.localhost}/api/offboarding/search`, {
        params: {
          companyId: companyId,
          employeeName: searchTerm,
          page: 0,
          size: pagination.size
        }
      });
      setRecords(transformOffboardingData(response.data.content || response.data));

      setPagination(prev => ({
        ...prev,
        page: 0,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      }));
    } catch (error) {
      toast.error('Error searching offboarding records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffboardingData();
    fetchOffboardingData();
  }, [companyId, filterType, selectedFilterValue, companyId, pagination.page, pagination.size]);



  useEffect(() => {
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
    fetchOffboardingData();
  }, [companyId, pageSize, currentPage]);

  const handleView = async (record) => {
    setIsLoading(true);
    let handovers = [];
    let exitInterview = null;

    try {
      const offboardingResponse = await axios.get(`http://${strings.localhost}/api/offboarding/${record.id}`);

      try {
        const handoversResponse = await axios.get(`http://${strings.localhost}/api/knowledgeTransfer/offBoarding?offBoardingId=${record.id}`);
        handovers = handoversResponse.data;
      } catch (error) {
        toast.warn('No handovers found');
      }

      try {
        const exitInterviewResponse = await axios.get(`http://${strings.localhost}/api/exit-interviews/offboarding/${record.id}`);
        exitInterview = exitInterviewResponse.data;
      } catch (error) {
        toast.warn('No exit interview found');
      }

      const completeRecord = {
        ...offboardingResponse.data,
        ...record,
        handovers,
        exitInterview
      };

      console.log('completeRecord', completeRecord);
      setViewingRecord(completeRecord);
    } catch (error) {
      toast.error('Error fetching record details');
      setViewingRecord(record);
    } finally {
      setIsLoading(false);
    }
  };


  const handleComplete = async (record) => {
    try {

      const [
        offboardingResult,
        handoversResult,
        exitInterviewResult,
        assetResult
      ] = await Promise.allSettled([
        axios.get(`http://${strings.localhost}/api/offboarding/${record.id}`),
        axios.get(`http://${strings.localhost}/api/knowledgeTransfer/offBoarding?offBoardingId=${record.id}`),
        axios.get(`http://${strings.localhost}/api/exit-interviews/offboarding/${record.id}`),
        axios.get(`http://${strings.localhost}/api/asset/getByEmployee/${record.employeeId}`)
      ]);

      const offboarding = offboardingResult.status === 'fulfilled' ? offboardingResult.value.data : null;
      const handovers = handoversResult.status === 'fulfilled' ? handoversResult.value.data : [];
      const exitInterview = exitInterviewResult.status === 'fulfilled' ? exitInterviewResult.value.data : null;
      const assets = assetResult.status === 'fulfilled' ? assetResult.value.data : [];

      if (!offboarding) {
        toast.error('Failed to fetch offboarding details');
        return;
      }

      if (handoversResult.status === 'rejected') toast.warn('No handovers found');
      if (exitInterviewResult.status === 'rejected') toast.warn('No exit interview found');
      if (assetResult.status === 'rejected') toast.warn('No asset details found');

      setCompletingRecord({
        ...record,
        offboarding,
        handovers,
        exitInterview,
        assets
      });

      console.log("Exit Interview Response:", exitInterview);
    } catch (error) {
      console.error('Unexpected error during completion handling:', error);
      toast.error('Unexpected failure while fetching offboarding details');
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
      const [offboardingResponse, handoversResponse, assetsResponse, exitInterviewResponse] = await Promise.all([
        axios.get(`http://${strings.localhost}/api/offboarding/${record.id}`),
        axios.get(`http://${strings.localhost}/api/knowledgeTransfer/offBoarding?offBoardingId=${record.id}`),
        axios.get(`http://${strings.localhost}/api/asset/getByEmployee/${record.employeeId}`).catch(() => ({ data: [] })),
        axios.get(`http://${strings.localhost}/api/exit-interviews/offboarding/${record.id}`),
      ]);

      console.log('Offboarding response:', offboardingResponse.data);

      const completeRecord = {
        ...record,
        ...offboardingResponse.data,
        id: record.id,
        employeeId: record.employeeId,
        handovers: handoversResponse.data || [],
        assets: assetsResponse.data || [],
        exitInterview: exitInterviewResponse.data || null,

      };
      console.log("complete record", completeRecord);
      setEditingRecord(completeRecord);
      setShowModal(true);
    } catch (error) {
      toast.error('Error fetching record details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPastFiveYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  };

  const handleFilterTypeChange = (e) => {
    const selectedType = e.target.value;
    setFilterType(selectedType === 'all' ? null : selectedType);
    setSelectedFilterValue('all');
    setShowValueDropdown(selectedType !== 'all');
    setFilters(prev => ({ ...prev, page: 0 }));
  };

  const handleFilterValueChange = (e) => {
    setSelectedFilterValue(e.target.value);
    setFilters(prev => ({ ...prev, page: 0 }));
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
        return getPastFiveYears().map(year => ({
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
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const renderDropdown = (record) => (
    <div className="dropdown">
      <button className="dots-button">
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      <div className="dropdown-content">
        <div>
          <button type="button" onClick={() => handleComplete(record)}>
            <FaUserCheck /> Complete
          </button>
        </div>
        <div>
          <button type="button" onClick={() => handleView(record)}>
            <FaEye /> View
          </button>
        </div>
        <div>
          <button type="button" onClick={() => handleUpdate(record)}>
            <FaEdit /> Update
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <div className="coreContainer">
      <div className="form-title">Employee Offboarding</div>

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

        <button className="btn" onClick={() => setShowModal(true)}>Add New Offboarding</button>
      </div>

      <div>
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
                <td colSpan="7" className="no-data1">No records found</td>
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
                    <span className={`status-confirmationBadge ${record.status === 'Completed' ? 'confirmed' : 'pending'}`}>
                      {record.status}
                    </span>
                  </td>

                  <td>
                    {renderDropdown(record)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className='form-controls'>
          <button
            type='button'
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 0}
            aria-label='Previous Page'
          >
            Previous
          </button>
          <span> {pagination.page + 1} of {pagination.totalPages}</span>
          <button
            type='button'
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1}
            aria-label='Next Page'
          >
            Next
          </button>
        </div>
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

export default OffBoarding;