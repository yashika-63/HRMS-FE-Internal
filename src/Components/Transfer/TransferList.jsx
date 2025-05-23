import React, { useState, useEffect } from 'react';
import AddTransfer from './AddTransfer';
import { FaEdit, FaEye, FaSearch } from 'react-icons/fa';
import { fetchDataByKey } from '../../Api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import UpdateTransfer from './UpdateTransfer';
import ViewTransfer from './ViewTransfer';

const TransferList = () => {
    const [transfers, setTransfers] = useState([]);
    const [filteredTransfers, setFilteredTransfers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [showUpdateTransfer, setShowUpdateTransfer] = useState(false);
    const [transferToView, setTransferToView] = useState(null);
    const [filters, setFilters] = useState({
        department: '',
        region: '',
        year: ''
    });
    const [showAddTransfer, setShowAddTransfer] = useState(false);
    const [dropdownData, setDropdownData] = useState({
        region: [],
        department: []
    });

    useEffect(() => {
        const mockData = [
            { id: 1, employeeName: 'John Doe', employeeId: 'EMP001', fromDepartment: 'HR', toDepartment: 'Finance', fromRegion: 'North', toRegion: 'South', responsiblePerson: 'Jane Smith', transferDate: '2023-05-15', reason: 'Promotion' },
            { id: 2, employeeName: 'Jane Smith', employeeId: 'EMP002', fromDepartment: 'IT', toDepartment: 'Marketing', fromRegion: 'East', toRegion: 'West', responsiblePerson: 'Mike Johnson', transferDate: '2023-06-20', reason: 'Department Rotation' },
            { id: 3, employeeName: 'Mike Johnson', employeeId: 'EMP003', fromDepartment: 'Finance', toDepartment: 'Operations', fromRegion: 'South', toRegion: 'North', responsiblePerson: 'John Doe', transferDate: '2023-07-10', reason: 'Workload Distribution' }
        ];
        setTransfers(mockData);
        setFilteredTransfers(mockData);
    }, []);

    const generateYearRange = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 3; i > 0; i--) {
            years.push(currentYear - i);
        }
        years.push(currentYear);
        return years;
    };

    const handleYearChange = (e) => {
        setFilters(prev => ({
            ...prev,
            year: e.target.value,
            page: 0
        }));
    };

    const handleRegionChange = (e) => {
        const selectedRegion = dropdownData.region.find(
            r => r.data === e.target.value
        );

        setFilters(prev => ({
            ...prev,
            regionId: selectedRegion ? selectedRegion.masterId : '',
            page: 0
        }));

        setFormData(prev => ({
            ...prev,
            region: e.target.value,
            regionId: selectedRegion ? selectedRegion.masterId : ''
        }));
    };

    const handleDepartmentChange = (e) => {
        const selected = dropdownData.department.find(r => r.data === e.target.value);
        setFilters(prev => ({
            ...prev,
            departmentId: selected ? selected.masterId : '',
            page: 0
        }));
        setFormData(prev => ({ ...prev, department: e.target.value }));
    };

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

    useEffect(() => {
        let result = transfers.filter(transfer => {
            return (
                (transfer.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    transfer.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (filters.department === '' || transfer.toDepartment === filters.department) &&
                (filters.region === '' || transfer.toRegion === filters.region) &&
                (filters.year === '' || transfer.transferDate.includes(filters.year))
            );
        });
        setFilteredTransfers(result);
    }, [searchTerm, filters, transfers]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddTransfer = (newTransfer) => {
        const updatedTransfers = [...transfers, { ...newTransfer, id: transfers.length + 1 }];
        setTransfers(updatedTransfers);
        setFilteredTransfers(updatedTransfers);
        setShowAddTransfer(false);
    };

    return (
        <div className="coreContainer">
            <h3 className='title'>Transfer Records</h3>
            <div className="filters">
                <div className="search-bar">
                    <input
                        placeholder="Search by heading..."
                        value={filters.heading}
                    // onChange={handleSearchInputChange}
                    />
                    <FaSearch className="search-icon" />
                </div>

                <select value={filters.year} onChange={handleYearChange}>
                    <option value="">All Years</option>
                    {generateYearRange().map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <select value={"qw"} onChange={handleDepartmentChange}>
                    <option value="">Departments</option>
                    {dropdownData.department.length > 0 ? (
                        dropdownData.department.map(option => (
                            <option key={option.masterId} value={option.data}>
                                {option.data}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>No Departments Available</option>
                    )}
                </select>

                <select value={"gs"} onChange={handleRegionChange}>
                    <option value="">All Regions</option>
                    {dropdownData.region && dropdownData.region.length > 0 ? (
                        dropdownData.region.map(option => (
                            <option key={option.masterId} value={option.data}>
                                {option.data}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>Induction Region Not available</option>
                    )}
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
                        <th>Responsible Person</th>
                        <th>Reason</th>
                        <th style={{ width: "5%" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransfers.map(transfer => (
                        <tr key={transfer.id}>
                            <td>{transfer.id}</td>
                            <td>{transfer.employeeId}</td>
                            <td>{transfer.employeeName}</td>
                            <td>{transfer.fromDepartment}</td>
                            <td>{transfer.toDepartment}</td>
                            <td>{transfer.fromRegion}</td>
                            <td>{transfer.toRegion}</td>
                            <td>{transfer.transferDate}</td>
                            <td>{transfer.responsiblePerson}</td>
                            <td>{transfer.reason}</td>
                            <td>
                                {editDropdownMenu(transfer)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showAddTransfer && (
                <AddTransfer
                    onClose={() => setShowAddTransfer(false)}
                    onSave={handleAddTransfer}
                />
            )}

            {showUpdateTransfer && (
                <UpdateTransfer
                    transfer={selectedTransfer}
                    onClose={() => setShowUpdateTransfer(false)}
                    onUpdate={handleUpdateTransfer}
                />
            )}

            {transferToView && (
                <ViewTransfer
                    transfer={transferToView}
                    onClose={() => setTransferToView(null)}
                />
            )}
        </div>
    );
};

export default TransferList;