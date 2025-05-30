import React, { useState, useEffect } from "react";
import axios from "axios";
import '../CommonCss/EnrollDashboard.css';
import '../../string.jsx';
import { strings } from "../../string.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEllipsisV, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { showToast } from "../../Api.jsx";

const CtcAttributes = () => {
    const [formData, setFormData] = useState({
        ctcStructure: '',
        ctcAttributes: ''
    });
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [totalPercentageError, setTotalPercentageError] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editRowData, setEditRowData] = useState(null);
    const [editedCategory, setEditedCategory] = useState("");
    const [variableDetails, setVariableDetails] = useState([]);
    const [adjustPercentageClicked, setAdjustPercentageClicked] = useState(false);
    const [percentageAdjustments, setPercentageAdjustments] = useState({});
    const [showPercentageAdjustment, setShowPercentageAdjustment] = useState(false);
    const shouldShowPercentageAdjustment = variableDetails.length > 1;
    const [tableData, setTableData] = useState([]);
    const [dropdownData, setDropdownData] = useState({
        CtcCategory: [],
        ctcAttributes: [],
    });
    const [categoryDetails, setCategoryDetails] = useState({
        label: '',
        category: '',
        type: '',
        percentValue: null,
    });
    const [categoryAttributes, setCategoryAttributes] = useState([]);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const companyId = localStorage.getItem("companyId");

    const handleEditChange = async (row) => {
        setEditMode(true);
        setEditRowData(row);
        setEditedCategory(row);

        try {
            const response = await axios.get(`http://${strings.localhost}/api/ctcMaster/company/${companyId}/category/${row}`);
            const labels = response.data || [];

            setCategoryAttributes(labels);

            setCategoryDetails({
                label: row.label,
                category: row.category,
                type: row.type,
                percentValue: row.percentValue,
            });
            setShowEditPopup(true);
        } catch (error) {
            console.error('Error fetching category attributes:', error);
            showToast('Error fetching category attributes.' , 'error');
        }
    };

    useEffect(() => {
        const fetchDataByKey = async (keyvalue) => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/master1/GetDataByKey/${keyvalue}`);
                if (response.data && Array.isArray(response.data)) {
                    const formattedData = response.data.map(item => ({
                        masterId: item.masterId,
                        category: item.category,
                        data: item.data || ''
                    }));

                    if (keyvalue === 'CtcCategory') {
                        setDropdownData(prevState => ({
                            ...prevState,
                            CtcCategory: formattedData
                        }));
                    } else if (keyvalue === 'ctcAttributes') {
                        setDropdownData(prevState => ({
                            ...prevState,
                            ctcAttributes: formattedData
                        }));
                    }
                }
            } catch (error) {
                console.error(`Error fetching data for ${keyvalue}:`, error);
            }
        };
        fetchDataByKey('CtcCategory');
        fetchDataByKey('ctcAttributes');
    }, []);

    const fetchTableData = async () => {
        if (companyId) {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/ctcMaster/company/${companyId}`);
                if (response.data && Array.isArray(response.data)) {
                    setTableData(response.data); // Store table data
                }
            } catch (error) {
                console.error("Error fetching table data:", error);
                showToast("Error fetching table data." , 'error');
            }
        }
    };
    useEffect(() => {
        fetchTableData();
    }, [companyId]);

    useEffect(() => {
        if (dropdownData.ctcAttributes) {
            const basic = dropdownData.ctcAttributes.find(item => item.data === 'Basic');
            if (basic) {
                setVariableDetails([{ data: 'Basic', category: 'Basic' }]);  // Select "Basic" tile by default
                setPercentageAdjustments({ Basic: 100 });  // Set Basic to 100% by default
            }
        }
    }, [dropdownData]);

    const handleTileClick = (option) => {
        setVariableDetails((prevDetails) => {
            const isSelected = prevDetails.some((item) => item.data === option.data);
            let updatedDetails;
            if (isSelected) {
                updatedDetails = prevDetails.filter((item) => item.data !== option.data);
            } else {
                updatedDetails = [...prevDetails, { data: option.data, category: option.category }];
            }
            return updatedDetails;
        });
    };

    const handleUpdate = async (attributeId) => {
        if (!editedCategory) {
            showToast("Please select a category." , 'error');
            return;
        }

        // Step 1: Check if any of the adjusted percentage values exceed 100
        // const invalidPercentValue = Object.values(percentageAdjustments).some(percent => percent > 100);
        // if (invalidPercentValue) {
        //     toast.error("Percentage value cannot exceed 100.");
        //     return;
        // }

        // Step 2: Update category attributes with the adjusted percentage values
        const updatedData = categoryAttributes.map(item => {
            if (item.id === attributeId) {
                return {
                    ...item,
                    percentValue: percentageAdjustments[item.label] || item.percentValue
                };
            }
            return item;
        });

        const updatedAttribute = updatedData.find(item => item.id === attributeId);
        const requestBody = {
            label: updatedAttribute.label,
            category: editedCategory,
            type: updatedAttribute.type,
            percentValue: percentageAdjustments[updatedAttribute.label] || updatedAttribute.percentValue
        };
        console.log('Request Body:', requestBody);

        // Step 3: Send the update request only if all percent values are valid
        try {
            const response = await axios.put(`http://${strings.localhost}/api/ctcMaster/update/${attributeId}`, requestBody);

            if (response.status === 200) {
                showToast("Data updated successfully" , 'success');
                setCategoryAttributes(updatedData);

                setTableData(prevTableData =>
                    prevTableData.map(row =>
                        row.id === editRowData.id ? { ...row, category: editedCategory, attributes: updatedData } : row
                    )
                );

                setShowEditPopup(false);
            }
        } catch (error) {
            console.error("Error updating data:", error);
            showToast("Error updating data." , 'error');
        }
    };

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) {
            showToast("No category selected for deletion.", 'warn');
            return;
        }

        setShowConfirmation(false); // Hide the confirmation popup
        try {
            const response = await axios.delete(`http://${strings.localhost}/api/ctcMaster/delete/company/${companyId}/category/${categoryToDelete}`);
            if (response.status === 200) {
                showToast("Category deleted successfully", 'success');
                setTableData(prevTableData => prevTableData.filter(row => row.category !== categoryToDelete));
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            showToast("Error deleting category." , 'error');
        }
    };

    const handleUpdateAll = () => {
        // Prepare the updated data based on current percentage adjustments
        const updatedData = categoryAttributes.map((row) => {
            return {
                label: row.label,
                category: editedCategory,
                type: row.type,  // Keep existing type
                percentValue: percentageAdjustments[row.label] || row.percentValue  // Use the adjusted percentage if exists
            };
        });

        // Ensure there's data to update
        if (updatedData.length === 0) {
            showToast("No data to update." , 'warn');
            return;
        }

        // Send the update request to the backend
        axios.put(`http://${strings.localhost}/api/ctcMaster/updateAll/${companyId}/${editedCategory}`, updatedData)
            .then(response => {
                console.log('Updated successfully:', response.data);
                showToast("All categories updated successfully" , 'success');
                setShowEditPopup(false);  // Close the edit popup after successful update

            })
            .catch(error => {
                console.error('Error updating data:', error);
                showToast("Error updating categories." , 'error');
            });
    };


    const openConfirmationPopup = (category) => {
        setCategoryToDelete(category); // Set the recordId to update
        setShowConfirmation(true); // Show confirmation dialog
    };
    const handlePercentageChange = (e, tileData, row) => {
        const { value } = e.target;

        if (value === '') {
            const newPercentageAdjustments = { ...percentageAdjustments };

            if (tileData && tileData.data) {
                delete newPercentageAdjustments[tileData.data];
            } else if (row && row.label) {
                delete newPercentageAdjustments[row.label];
            }

            setPercentageAdjustments(newPercentageAdjustments);
            return;
        }

        const parsedValue = parseFloat(value);
        if (isNaN(parsedValue) || parsedValue < 0) {
            showToast("Please enter a valid percentage.", 'warn');
            return;
        }

        const newPercentageAdjustments = { ...percentageAdjustments };

        // If the value is greater than 100, treat it as a flat amount
        if (parsedValue > 100) {
            if (tileData) {
                newPercentageAdjustments[tileData.data] = parsedValue;  // Flat value
            } else if (row) {
                newPercentageAdjustments[row.label] = parsedValue;  // Flat value
            }
        } else {
            if (tileData) {
                newPercentageAdjustments[tileData.data] = parsedValue;
            } else if (row) {
                newPercentageAdjustments[row.label] = parsedValue;
            }
        }

        setPercentageAdjustments(newPercentageAdjustments);
    };

    // Calculate the total percentage (only for valid percentage values)
    const getTotalPercentage = () => {
        return Object.values(percentageAdjustments).reduce((total, value) => {
            if (value <= 100) {
                return total + (parseFloat(value) || 0);
            }
            return total;
        }, 0);
    };

    // Calculate the remaining percentage (subtract from 100)
    const getRemainingPercentage = () => {
        const totalPercentage = getTotalPercentage();
        return (100 - totalPercentage).toFixed(2);  // Ensure to show two decimals
    };
    const handleAdjustPercentageClick = () => {
        if (variableDetails.length === 0) {
            showToast("Please select tiles first.", 'warn');
        } else {
            setShowPercentageAdjustment((prev) => !prev);
        }
    };
    const handleSave = async () => {
        // Check if a category is selected
        if (!formData.CtcCategory) {
            showToast("Please select a category." , 'warn');
            return;
        }

        // Check if any tiles are selected
        if (variableDetails.length === 0) {
            showToast("Please select tiles first." , 'warn');
            return;
        }

        // Check if the user has adjusted the percentages for all selected tiles
        const allTilesAdjusted = variableDetails.every(item =>
            percentageAdjustments[item.data] !== undefined && percentageAdjustments[item.data] !== ''
        );

        if (!allTilesAdjusted) {
            showToast("Please adjust the percentages for all selected tiles." , 'warn');
            return;
        }

        // Check if the total percentage adds up to 100
        // const totalPercentage = getTotalPercentage();
        // if (totalPercentage !== 100) {
        //     toast.error("The total percentage must equal 100.");
        //     return;
        // }

        // Proceed to save the data if everything is valid
        const isValidData = variableDetails.every(item => item && item.data);
        if (!isValidData) {
            showToast("Some tiles have invalid data. Please check your selection." , 'warn');
            return;
        }

        await saveCtcData();
        fetchTableData();
        clearTileSelection();
    };


    const saveCtcData = async () => {
        const dataToSave = variableDetails.map(item => {
            // Check if item and item.data are defined
            if (item && item.data) {
                const percentValue = item.data === 'Basic' ? 100 : percentageAdjustments[item.data] || '';

                return {
                    label: item.data,
                    category: formData.CtcCategory,
                    type: item.category,
                    percentValue: percentValue
                };
            }
            return null;
        }).filter(item => item !== null);

        if (dataToSave.length === 0) {
            showToast("No valid data to save." , 'warn');
            return;
        }
        try {
            const response = await axios.post(`http://${strings.localhost}/api/ctcMaster/saveMultiple/${companyId}`, dataToSave);
            showToast("CTC details saved successfully" , 'success');
            console.log(response);
        } catch (error) {
            console.error("Error saving CTC details:", error);
            showToast("Error saving CTC details." , 'error');
        }
    };


    const clearTileSelection = () => {
        setVariableDetails([]);
        setPercentageAdjustments({});
        setFormData({ ...formData, CtcCategory: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCategoryClick = (categoryId) => {
        const selectedCategory = tableData.filter(row => row.category === categoryId);
        if (selectedCategory.length > 0) {
            setCategoryAttributes(selectedCategory); // Store the entire row for each label (with all details)
            setCategoryDetails({
                label: selectedCategory[0].label,
                category: selectedCategory[0].category,
                type: selectedCategory[0].type,
                percentValue: selectedCategory[0].percentValue
            });

            setShowCategoryPopup(true);
        }
    };

    const handleClosePopup = async () => {
        if (totalPercentageError) {
            showToast("Total percentage must be 100 before closing." , 'warn');
            return;
        }
        setShowEditPopup(false);
    };

    const handleViewClose = async () => {
        setShowCategoryPopup(false);
    }

    const handleConfirmSave = async () => {
        setShowConfirmationDialog(false);
        await saveCtcData();
    };

    const handleCancelSave = () => {
        setShowConfirmationDialog(false);
    };
    const editDropdownMenu = (category) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button onClick={() => handleEditChange(category)} >
                        <FontAwesomeIcon className="ml-2" icon={faEdit} /> Edit
                    </button>
                </div>
                <div>
                    <button onClick={() => openConfirmationPopup(category)}>
                        <FontAwesomeIcon className="ml-2" icon={faTrashAlt} /> Delete
                    </button>
                </div>
            </div>
        </div>
    );

    const handleRemove = (id) => {
        const updatedAttributes = categoryAttributes.filter((row) => row.id !== id);
        setCategoryAttributes(updatedAttributes); // Update the state to remove the label
    };

    return (
        <div>
            <div className="ctcBox">
                <div className="left-container">
                    <div>
                        <span className="required-marker">*</span>
                        <label htmlFor="CtcCategory">CTC Structure</label>
                        <select id="CtcCategory" name="CtcCategory" value={formData.CtcCategory} onChange={handleChange} required>
                            <option value="" selected disabled hidden> </option>
                            {dropdownData.CtcCategory && dropdownData.CtcCategory.length > 0 ? (
                                dropdownData.CtcCategory.map(option => (
                                    <option key={option.masterId} value={option.data}>
                                        {option.data}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Category Not available</option>
                            )}
                        </select>
                    </div>

                    <div className="tiles-container">
                        {dropdownData.ctcAttributes && dropdownData.ctcAttributes.length > 0 ? (
                            dropdownData.ctcAttributes.map((option) => (
                                <div
                                    key={option.masterId}
                                    className={`tiles ${variableDetails.some(item => item.data === option.data) ? "selected" : ""} `}
                                    onClick={() => handleTileClick(option)}
                                >
                                    {option.data}
                                </div>
                            ))
                        ) : (
                            <div>No CTC attributes available</div>
                        )}
                    </div>

                    <div className="form-controls">
                        {!showPercentageAdjustment && (
                            <button className="btn" onClick={handleSave}>Save</button>
                        )}
                        <button type="button" className="btn" onClick={() => handleAdjustPercentageClick()}>
                            {showPercentageAdjustment ? 'Hide' : 'Adjust Percentages'}
                        </button>
                    </div>

                    {/* {showPercentageAdjustment && variableDetails.length > 0 && (
                        <div>
                            <div>Total Percentage: {getTotalPercentage()}%</div>
                            <div>Remaining Percentage: {getRemainingPercentage()}%</div>
                        </div>
                    )} */}
                    <hr />
                    <div>
                        {adjustPercentageClicked && <hr />}
                        {showPercentageAdjustment && variableDetails.length > 0 && (
                            <div className="input-row" style={{ marginTop: '20px' }}>
                                {variableDetails.map((tile) => (
                                    <div key={tile.data} className="tiles tile-percentage-container" style={{ height: 'auto' }}>
                                        <span>{tile.data}</span>

                                        {tile.data === "Basic" ? (
                                            // For "Basic" category, show only one input
                                            <input
                                                type="number"
                                                value={percentageAdjustments[tile.data] || 100}
                                                onChange={(e) => handlePercentageChange(e, tile)}
                                                readOnly // Make it readonly if you want to keep it fixed at 100
                                            />
                                        ) : (
                                            // For other categories, show both inputs
                                            <>
                                                <input
                                                    type="number"
                                                    placeholder="Enter percent"
                                                    value={percentageAdjustments[tile.data] || ''}
                                                    onChange={(e) => handlePercentageChange(e, tile)}
                                                />

                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {showPercentageAdjustment && variableDetails.length > 0 && (
                            <div className="form-controls" style={{ marginTop: '20px' }}>
                                <button className="btn" onClick={handleSave}>Save</button>
                            </div>
                        )}
                    </div>

                </div>
                {showConfirmationDialog && (
                    <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                        <p>Are you sure you want to save without making adjustments?</p>
                        <div className="btnContainer">
                            <button className="btn" onClick={handleConfirmSave}>Yes</button>
                            <button className="outline-btn" onClick={handleCancelSave}>No</button>
                        </div>
                    </div>
                )}

                <div className="right-container">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Category</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData && tableData.length > 0 ? (
                                Array.from(new Set(tableData.map(row => row.category))).map((category, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleCategoryClick(category)}>{category}</td>
                                        <td>
                                            {editDropdownMenu(category)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3">No data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* {shouldShowPercentageAdjustment && (
                <div className="input-row">
                    {variableDetails.map((tile) => (
                        <div key={tile.data} className="input-container">
                            <label>{tile.data}</label>
                            <input
                                type="number"
                                value={percentageAdjustments[tile.data] || (tile.data === 'Basic' ? 100 : '')}
                                onChange={(e) => handlePercentageChange(e, tile)}
                                disabled={tile.data === "Basic"}
                                readOnly={tile.data === "Basic"}
                            />
                        </div>
                    ))}
                </div>
            )} */}

            {showCategoryPopup && (
                <div className="ctc-popup">
                    <div className="ctc-content">
                        <h3>Category Details</h3>
                        <button className="close-btn" onClick={handleViewClose}>Close</button>
                        <div className="labels-details-table">
                            <h4>Attribute Details:</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Attribute</th>
                                        <th>Percent Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryAttributes.length > 0 ? (
                                        categoryAttributes.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.label}</td>
                                                <td>{row.percentValue}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3">No labels available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="form-controls">
                            <button type="button" className="btn" onClick={handleViewClose} disabled={totalPercentageError}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {showEditPopup && (
                <div className="ctc-popup">
                    <div className="ctc-content">
                        <h2 className="title">Edit Category</h2>
                        <label>Category Name:</label>
                        <input type="text" value={editedCategory} readOnly />

                        <div>
                            <table className="labels-details-table">
                                <thead>
                                    <tr>
                                        <th>Label</th>
                                        <th>Percent Value</th>
                                        <th>Action</th>
                                        <th>Remove</th> 
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryAttributes.length > 0 ? (
                                        categoryAttributes.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.label}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={percentageAdjustments[row.label] || row.percentValue || ''}
                                                        onChange={(e) => handlePercentageChange(e, null, row)}
                                                        placeholder="Enter percent"
                                                        className="inputField"
                                                    />
                                                </td>
                                                <td className="textbutton" onClick={() => handleUpdate(row.id)}>Update</td>
                                                <td style={{ color: 'red', cursor: 'pointer' }} onClick={() => handleRemove(row.id)}>Remove</td> {/* Add remove button */}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4">No labels available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="form-controls">
                            <button type="button" className="btn" onClick={handleUpdateAll}>Update</button>
                            <button type="button" className="outline-btn" onClick={handleClosePopup}>Close</button>

                        </div>
                    </div>
                </div>
            )}


            {showConfirmation && (
                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
                    <p>Are you sure you want to delete ?</p>
                    <div className="btnContainer">
                        <button className="btn" onClick={handleDeleteCategory}> Yes </button>
                        <button className="outline-btn" onClick={() => setShowConfirmation(false)} >  No </button>
                    </div>
                </div>
            )}
      
        </div>
    );
};

export default CtcAttributes;
