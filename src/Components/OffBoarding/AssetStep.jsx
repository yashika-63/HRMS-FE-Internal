import React, { useState, useEffect } from "react";
import axios from "axios";
import { strings } from "../../string";

const AssetStep = ({ employeeId, setCurrentStep, handleSubmit, currentStep, handleNextStep, viewMode = false }) => {
    const [assets, setAssets] = useState([]);
    const [selectedAssets, setSelectedAssets] = useState([]);

    useEffect(() => {
        if (employeeId) {
            axios
                .get(`http://${strings.localhost}/api/asset/getByEmployee/${employeeId}`)
                .then((response) => {
                    const transformedAssets = response.data.map(asset => ({
                        ...asset,
                        occupied: asset.occupied === '0x01' || asset.occupied === true,
                        status: asset.status === '0x01' || asset.status === true,
                        submitted: asset.submitted === '0x01' || asset.submitted === true
                    }));
                    setAssets(transformedAssets);
                })
                .catch((error) => {
                    console.error("Error fetching assets:", error);
                });
        }
    }, [employeeId]);

    const handleCheckboxChange = (assetId) => {
        setSelectedAssets((prevSelected) => {
            if (prevSelected.includes(assetId)) {
                return prevSelected.filter((id) => id !== assetId);
            } else {
                return [...prevSelected, assetId];
            }
        });
    };

    const booleanToYesNo = (value) => value ? "Yes" : "No";

    return (
        <div className="asset-table-container">
            <div className="table-responsive">
                <table className="interview-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Label</th>
                            <th>Description</th>
                            <th>Occupied</th>
                            <th>Submitted</th>
                          {/* <th>Select</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => (
                            <tr key={asset.id}>
                                <td>{asset.id}</td>
                                <td>{asset.lable}</td>
                                <td>{asset.description}</td>
                                <td>{booleanToYesNo(asset.occupied)}</td>
                                <td>{booleanToYesNo(asset.submitted)}</td>
                                {/* <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedAssets.includes(asset.id)}
                                        onChange={() => handleCheckboxChange(asset.id)}
                                        className="form-check-input"
                                    />
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="form-controls">
                {!viewMode && (
                    <div className="form-controls">
                        <button type="button" className='outline-btn' onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
                        <button type="button" className='btn' onClick={handleNextStep}>Next</button>
                    </div>
                )}
                {viewMode && (
                    <button type="button" className='outline-btn' onClick={() => setCurrentStep(currentStep - 1)}>Back</button>
                )}
            </div>
        </div>
    );
};

export default AssetStep;