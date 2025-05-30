import React, { useState, useEffect } from 'react';
import AddTransfer from './AddTransfer';
import { FaEdit, FaEye, FaSearch } from 'react-icons/fa';
import { fetchDataByKey } from '../../Api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import UpdateTransfer from './UpdateTransfer';
import ViewTransfer from './ViewTransfer';
import { strings } from '../../string';

const TransferList = () => {
    const companyId = localStorage.getItem('companyId');
    const [transfers, setTransfers] = useState([]);
    const [filteredTransfers, setFilteredTransfers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [showUpdateTransfer, setShowUpdateTransfer] = useState(false);
    const [transferToView, setTransferToView] = useState(null);
    const [filters, setFilters] = useState({
        department: '',
        region: '',
        year: '',
        employeeName: ''
    });
    const [showAddTransfer, setShowAddTransfer] = useState(false);
    const [dropdownData, setDropdownData] = useState({
        region: [],
        department: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [employeeName, setEmployeeName] = useState('');

    useEffect(() => {
        const fetchTransfersData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://${strings.localhost}/api/Transfer-request/company/${companyId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch transfers');
                }
                const data = await response.json();
                setTransfers(data);
                setFilteredTransfers(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Error fetching transfer data:', err);
            }
        };

        fetchTransfersData();
    }, [showAddTransfer]);

    const generateYearRange = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 3; i > 0; i--) {
            years.push(currentYear - i);
        }
        years.push(currentYear);
        return years;
    };

   const handleSearch = async (paramsObj = { ...filters, employeeName }) => {
    try {
        setLoading(true);
        const params = new URLSearchParams();

        if (paramsObj.department) {
            const dept = dropdownData.department.find(d => d.data === paramsObj.department);
            if (dept) params.append('deptId', dept.masterId);
        }
        if (paramsObj.region) {
            const region = dropdownData.region.find(r => r.data === paramsObj.region);
            if (region) params.append('regionId', region.masterId);
        }
        if (paramsObj.year) {
            params.append('year', paramsObj.year);
        }
        if (paramsObj.employeeName) {
            params.append('employeeName', paramsObj.employeeName);
        }

        const response = await fetch(`http://${strings.localhost}/api/Transfer-request/search-Transfer-Request?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch filtered transfers');
        }
        const data = await response.json();
        setFilteredTransfers(data.content);
        setLoading(false);
    } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error('Error fetching filtered transfers:', err);
    }
};


    useEffect(() => {
        handleSearch();
    }, [filters]);

    const handleYearChange = (e) => {
        setFilters(prev => ({
            ...prev,
            year: e.target.value
        }));
    };

    const handleDepartmentChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, department: value }));
    };

    const handleRegionChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, region: value }));
    };


    const handleEmployeeNameChange = (e) => {
        const value = e.target.value;
        setEmployeeName(value);
        if (searchTimeout) clearTimeout(searchTimeout);
        const timeout = setTimeout(() => {
            handleSearch({ ...filters, employeeName: value });
        }, 500);
        setSearchTimeout(timeout);
    };


    useEffect(() => {
        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
        };
    }, []);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const regions = await fetchDataByKey('region');
                const departments = await fetchDataByKey('department');
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

    const handleUpdateClick = (transfer) => {
        setSelectedTransfer(transfer);
        setShowUpdateTransfer(true);
    };

    const handleViewClick = (transfer) => {
        setTransferToView(transfer);
    };

    const editDropdownMenu = (transfer) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <button className="dropdown-item" onClick={() => handleUpdateClick(transfer)}>
                    <FaEdit style={{ marginRight: '8px' }} /> Update
                </button>
                <button className="dropdown-item" onClick={() => handleViewClick(transfer)}>
                    <FaEye style={{ marginRight: '8px' }} /> View
                </button>
            </div>
        </div>
    );

    const handleUpdateTransfer = (updatedTransfer) => {
        setTransfers(prev => prev.map(t =>
            t.id === selectedTransfer.id ? { ...t, ...updatedTransfer } : t
        ));
        setFilteredTransfers(prev => prev.map(t =>
            t.id === selectedTransfer.id ? { ...t, ...updatedTransfer } : t
        ));
        setShowUpdateTransfer(false);
    };

    const handleAddTransfer = (newTransfer) => {
        setTransfers(prev => [...prev, newTransfer]);
        setFilteredTransfers(prev => [...prev, newTransfer]);
        setShowAddTransfer(false);
    };

    if (loading) {
        return <div>Loading transfers...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="coreContainer">
            <h3 className='title'>Transfer Records</h3>
            <div className="filters">
                <div className="search-bar">
                    <input
                        placeholder="Search by employee name..."
                        value={employeeName}
                        onChange={handleEmployeeNameChange}
                    />
                    <FaSearch className="search-icon" />
                </div>

                <select value={filters.year} onChange={handleYearChange}>
                    <option value="">All Years</option>
                    {generateYearRange().map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <select
                    value={filters.department}
                    onChange={handleDepartmentChange}
                >
                    <option value="">Department</option>
                    {dropdownData.department.map(option => (
                        <option key={option.masterId} value={option.data}>
                            {option.data}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.region}
                    onChange={handleRegionChange}
                >
                    <option value="">Region</option>
                    {dropdownData.region.map(option => (
                        <option key={option.masterId} value={option.data}>
                            {option.data}
                        </option>
                    ))}
                </select>
                <button className="btn" onClick={() => setShowAddTransfer(true)}>
                    Add New Transfer
                </button>
            </div>

            <table className="interview-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Employee ID</th>
                        <th>Employee Name</th>
                        <th>From Department</th>
                        <th>To Department</th>
                        <th>From Region</th>
                        <th>To Region</th>
                        <th>Transfer Date</th>
                        <th>Reporting Person</th>
                        <th>Reason</th>
                        <th style={{ width: "5%" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransfers.length > 0 ? (
                        filteredTransfers.map((transfer, index) => (
                            <tr key={transfer.id}>
                                <td>{index + 1}.</td>
                                <td>{transfer.employee?.employeeId}</td>
                                <td>{transfer.employeeName}</td>
                                <td>{transfer.fromDepartment}</td>
                                <td>{transfer.toDepartment}</td>
                                <td>{transfer.fromRegion}</td>
                                <td>{transfer.toRegion}</td>
                                <td>{transfer.transferDate}</td>
                                <td>{transfer.reportingManagerName}</td>
                                <td>{transfer.reason}</td>
                                <td>
                                    {editDropdownMenu(transfer)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="11" className="no-data">No Transfers found matching your criteria</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {showAddTransfer && (
                <AddTransfer
                    onClose={() => setShowAddTransfer(false)}
                    onSave={handleAddTransfer}
                />
            )}

            {showUpdateTransfer && selectedTransfer && (
                <UpdateTransfer
                    transferId={selectedTransfer.id}
                    onClose={() => setShowUpdateTransfer(false)}
                    onUpdate={handleUpdateTransfer}
                />
            )}

            {transferToView && (
                <ViewTransfer
                    transferId={transferToView.id}
                    onClose={() => setTransferToView(null)}
                />
            )}
        </div>
    );
};

export default TransferList;