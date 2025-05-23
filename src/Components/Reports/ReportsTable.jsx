import React from 'react';
import './ReportsFilters.css';

const ReportsTable = ({
    tableColumns,
    filteredData,
    pagination,
    totalPages,
    handlePageChange,
    selectedMainOption,
    loading
}) => {
    if (loading) {
        return <div className="no-data">Loading...</div>;
    }

    if (tableColumns.length === 0) {
        return <div className="no-data">No data available to display</div>;
    }

    const formatHeader = (header) => {
        return header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1');
    };

    return (
        <div className="result-table-container">
            <table className="result-table">
                <thead>
                    <tr>
                        {tableColumns.map(column => (
                            <th key={column} scope="col">{formatHeader(column)}</th>
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
                                return (
                                    <td key={`${item.id || index}-${column}`} className={value?.className || ''}>
                                        {typeof value === 'object' && value !== null && 'value' in value ? value.value : value}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedMainOption && pagination.totalElements > 0 && (
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
    );
};

export default ReportsTable;