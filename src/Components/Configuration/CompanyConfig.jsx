import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../string';
import { showToast, fetchDataByKey } from '../../Api.jsx';
import '../CommonCss/ConfigScreen.css';

const CompanyConfig = () => {
    const companyId = localStorage.getItem('companyId');
    const [dropdownData, setDropdownData] = useState({ CompanyDocument: [] });
    const [existingConfig, setExistingConfig] = useState(null);
    const [existingPayrollConfig, setExistingPayrollConfig] = useState(null);
    const [existingDocuments, setExistingDocuments] = useState([]);

    const [formData, setFormData] = useState({
        feedbackStartDate: '',
        feedbackEndDate: '',
        feedbackFrequency: '',
        appraisalStartDate: '',
        appraisalEndDate: '',
        payrollDate: '',

    });

    const [errors, setErrors] = useState({
        feedbackStartDate: '',
        feedbackEndDate: '',
        feedbackFrequency: '',
        appraisalStartDate: '',
        appraisalEndDate: '',
        payrollDate: '',

    });

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const CompanyDocument = await fetchDataByKey('CompanyDocument');
                setDropdownData({ CompanyDocument });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };

        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchCompanyConfig();
        fetchPayrollConfig();
        fetchCompanyDocuments();
    }, [companyId]);

    const fetchCompanyConfig = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/company-config/view/${companyId}`);
            console.log("Company Config Response:", response.data);
            setExistingConfig(response.data);
        } catch (error) {
            console.error("Error fetching company config:", error);
        }
    };

    const fetchPayrollConfig = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/payrollConfig/getByCompanyId/${companyId}`);
            console.log("Payroll Config Response:", response.data);
            setExistingPayrollConfig(response.data);
        } catch (error) {
            console.error("Error fetching payroll config:", error);
        }
    };

    const fetchCompanyDocuments = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/company-documents/active/${companyId}`);
            console.log("Company Documents Response:", response.data);
            setExistingDocuments(response.data);
        } catch (error) {
            console.error("Error fetching company documents:", error);
        }
    };


    // Handle input change for form fields
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setFormData((prevData) => ({
                ...prevData,
                [name]: files[0],
            }));
        } else if (name === "feedbackFrequency") {
            const numericValue = value === '' ? '' : parseInt(value);
            if (numericValue >= 1 && numericValue <= 4) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: numericValue,
                }));
            } else {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: '',
                }));
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }

        validateField(name, value);
    };

    // Validate fields, specifically start/end date and file uploads
    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'feedbackEndDate':
                if (formData.feedbackStartDate && value && value < formData.feedbackStartDate) {
                    newErrors.feedbackEndDate = 'Feedback end date should not be before the start date';
                } else {
                    newErrors.feedbackEndDate = '';
                }
                break;
            case 'appraisalEndDate':
                if (formData.appraisalStartDate && value && value < formData.appraisalStartDate) {
                    newErrors.appraisalEndDate = 'Appraisal end date should not be before the start date';
                } else {
                    newErrors.appraisalEndDate = '';
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    };

    // Handle the form submit for Company Config
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(errors).every((error) => error === '')) {
            // Prepare the data to be sent as JSON (excluding payrollDate)
            const payload = {};
            for (let key in formData) {
                if (key !== 'payrollDate') {
                    payload[key] = formData[key];
                }
            }

            try {
                const response = await axios.post(
                    `http://${strings.localhost}/api/company-config/save/${companyId}`,
                    payload, // Send as JSON
                    {
                        headers: {
                            'Content-Type': 'application/json', // Send data as JSON
                        },
                    }
                );
                showToast('Saved Successfully.', 'success');
                console.log('Response:', response.data);
            } catch (error) {
                console.error('Error saving company config:', error);
            }
        } else {
            showToast('Please fix the errors before submitting', 'error');
        }
    };



    // Handle form submit for Payroll Config
    const handleSubmitPayrollConfig = async (e) => {
        e.preventDefault();
        if (Object.values(errors).every((error) => error === '')) {
            // Prepare the data to be sent as JSON
            const payload = [
                {
                    payrollDate: formData.payrollDate, // Single payroll config object
                }
            ];
            try {
                const response = await axios.post(
                    `http://${strings.localhost}/api/payrollConfig/saveMultiple/${companyId}`,
                    payload, // Send as JSON
                    {
                        headers: {
                            'Content-Type': 'application/json', // Ensure the server knows we’re sending JSON
                        },
                    }
                );
                showToast('Saved Successfully.', 'success');
                fetchPayrollConfig();
                console.log('Response:', response.data);
            } catch (error) {
                console.error('Error saving payroll config:', error);
            }
        } else {
            showToast('Please fix the errors before submitting', 'error');
        }
    };



    const [documentList, setDocumentList] = useState([{ label: '' }]);

    const handleDocumentChange = (index, value) => {
        const updatedList = [...documentList];
        updatedList[index].label = value;
        setDocumentList(updatedList);
    };

    const addDocumentRow = () => {
        setDocumentList([...documentList, { label: '' }]);
    };

    const handleSaveDocuments = async () => {
        if (documentList.some(doc => doc.label.trim() === '')) {
            showToast('Please add one doument atleast.', 'error');
            return;
        }
        console.log("documentList", documentList);
        try {
            const documentsToSave = documentList.map(doc => ({ label: doc.label }));
            const response = await axios.post(`http://${strings.localhost}/api/company-documents/save/${companyId}`, documentsToSave, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            showToast('Documents saved successfully.', 'success');
            fetchCompanyDocuments();
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error saving documents:', error);
            showToast('Error saving documents.', 'error');
        }
    };

    return (
        <div className='coreContainer'>
            <div className='company-config-container'>
                <div className='company-tiles'>
                    <div className='half-tile'>
                        <div className='underlineText'>PMS</div>
                        <div className='input-row'>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Feedback Start Date</label>
                                <input type="date" name="feedbackStartDate" value={formData.feedbackStartDate} onChange={handleChange} required />
                            </div>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Feedback End Date</label>
                                <input type="date" name="feedbackEndDate" value={formData.feedbackEndDate} onChange={handleChange} required />
                                {errors.feedbackEndDate && <p className="error">{errors.feedbackEndDate}</p>}
                            </div>
                        </div>
                        <div className='input-row'>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Feedback Frequency</label>
                                <input type="number" name="feedbackFrequency" value={formData.feedbackFrequency} onChange={handleChange} min="1" max="4" required />
                            </div>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Appraisal Start Date</label>
                                <input type="date" name="appraisalStartDate" value={formData.appraisalStartDate} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className='input-row'>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Appraisal End Date</label>
                                <input type="date" name="appraisalEndDate" value={formData.appraisalEndDate} onChange={handleChange} required />
                                {errors.appraisalEndDate && <p className="error">{errors.appraisalEndDate}</p>}
                            </div>
                        </div>
                        <div className='form-controls'>
                            <button type="button" className='btn' onClick={handleSubmit}>Save Company Config</button>
                        </div>
                    </div>
                    {existingConfig && (
                        <div className='half-tile'>
                            <div className='underlineText'>Saved Config</div>
                            <p><strong>Feedback Start:</strong> {existingConfig.feedbackStartDate}</p>
                            <p><strong>Feedback End:</strong> {existingConfig.feedbackEndDate}</p>
                            <p><strong>Frequency:</strong> {existingConfig.feedbackFrequency}</p>
                            <p><strong>Appraisal Start:</strong> {existingConfig.appraisalStartDate}</p>
                            <p><strong>Appraisal End:</strong> {existingConfig.appraisalEndDate}</p>
                        </div>
                    )}
                </div>


                <div className='company-tiles'>
                    <div className='half-tile'>
                        <div className='underlineText'>Payroll Config</div>
                        <div className='input-row'>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Payroll Process Date</label>
                                <input type="date" name="payrollDate" value={formData.payrollDate} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className='form-controls'>
                            <button type="button" className='btn' onClick={handleSubmitPayrollConfig}>Save Payroll Config</button>
                        </div>
                    </div>
                    {existingPayrollConfig && existingPayrollConfig.length > 0 && (
                        <div className='half-tile'>
                            <div className='underlineText'>Saved Payrolls</div>
                            <ul>
                                {existingPayrollConfig.map((config, index) => (
                                    <li key={index}>
                                        <strong>Payroll Date:</strong> {config.payrollDate}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </div>

                <div className='company-tiles'>
                    <div className='half-tile'>
                        <div className='underlineText'>Company Document List</div>
                        {documentList.map((doc, index) => (
                            <div className='input-row' key={index}>
                                <input
                                    type="text"
                                    placeholder="Enter Document Type"
                                    value={doc.label}
                                    onChange={(e) => handleDocumentChange(index, e.target.value)}
                                    required
                                />
                            </div>
                        ))}
                        <div className='form-controls'>
                            <button type='button' className='btn' onClick={addDocumentRow}>Add Document</button>
                            <button type='button' className='btn' onClick={handleSaveDocuments}>Save Document List</button>
                        </div>
                    </div>
                    {existingDocuments.length > 0 && (
                        <div className='half-tile'>
                            <div className='underlineText'>Saved Documents</div>
                            <ul>
                                {[...new Set(existingDocuments.map(doc => doc.label))].map((label, idx) => (
                                    <li key={idx}>
                                        <strong>{label}</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}


                </div>

            </div>
        </div>

    );
};
export default CompanyConfig;
