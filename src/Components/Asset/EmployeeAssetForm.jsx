import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../../string";
import { showToast } from "../../Api.jsx";

const EmployeeAssetForm = () => {
    const [labels, setLabels] = useState([]);
    const [formData, setFormData] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const employeeId = localStorage.getItem("employeeId");

    useEffect(() => {
        axios
            .get(`http://${strings.localhost}/api/asset/getByEmployee/${employeeId}`)
            .then((response) => {
                setLabels(response.data);
            })
            .catch((error) => {
                console.error("Error fetching labels:", error);
            });
    }, [employeeId]);

    const handleInputChange = (index, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [index]: value,
        }));
    };

    const handleSave = () => {
        const incompleteDescriptions = labels.filter((label, index) => {
            return !(formData[index] || label.description);
        });

        if (incompleteDescriptions.length > 0) {
            // setErrorMessage("Please provide descriptions for all fields.");
            showToast("Please provide descriptions for all fields.",'warn');
            return; 
        }
        const descriptions = labels.map((label, index) => ({
            id: label.id,
            description: formData[index] || label.description || "",
        }));

        axios
            .put(`http://${strings.localhost}/api/asset/updateDescriptions/${employeeId}`, descriptions)
            .then((response) => {
                console.log("Save successful:", response.data);
                const message = response.data;
                showToast(message, 'success');
            })
            .catch((error) => {
                console.error("Error saving descriptions:", error);
                showToast("Failed to add descriptions. Please try again.", 'error');
            });
    };

    return (
        <div className="coreContainer">
            <h2 className="title">Employee Asset Form</h2>

            {labels.length === 0 ? (
                <p className="no-data">No assets assigned to you</p>
            ) : (
                <table className="interview-table">
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Issued Date</th>
                            <th>Employee Using or Not</th>
                            <th>Assets</th>
                            <th>Assign Data / Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {labels.map((label, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{label.assetManagement?.date}</td>
                                <td>{label.assetManagement?.status ? 'Using' : 'Not Using'}</td>
                                <td>{label.lable}</td>
                                <td>
                                    <input
                                        type="text"
                                        value={formData[index] || label.description || ""} 
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        style={{ width: "100%" }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {errorMessage && (
                <div className="no-data" >{errorMessage} </div>
            )}

            {labels.length > 0 && (
                <div className="form-controls">
                    <button type="button" className="btn" onClick={handleSave} style={{ marginTop: "20px" }}>
                        Save
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmployeeAssetForm;
