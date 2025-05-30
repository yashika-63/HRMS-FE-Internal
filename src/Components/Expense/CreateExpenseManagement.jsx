import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaInbox } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import './CreateExpenseManagement.css';
import { strings } from '../../string';
import 'react-toastify/dist/ReactToastify.css';
import { fetchDataByKey, fetchValueByKey, showToast } from '../../Api.jsx';
import { format } from 'date-fns';

const CreateExpenseManagement = () => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const companyId = localStorage.getItem("companyId");
    const accountId = localStorage.getItem("accountId");
    const employeeId = localStorage.getItem("employeeId");
    const [validationMessage, setValidationMessage] = useState('');
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const [detailsAdded, setDetailsAdded] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [expenseDocumentId, setExpenseDocumentId] = useState(null);
    const [loading, setLoading] = useState();
    const calendarRef = useRef(null);
    const [files, setFiles] = useState({});
    const [isDragging, setIsDragging] = useState(false);
    const [dates, setDates] = useState([null, null]);
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [expenseManagement, setExpenseManagement] = useState({
        expenseId: '',
        expensePurpose: '',
        expenseAmountSpent: '',
        expenseDetails: [],
        expenseFromDate: '',
        expenseTillDate: '',
        workflowMainId: '',
        id: '',
        expenseType: '',
        currencyCode: ''
    });
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currency: '',
        expenseCategory: '',
        expenseType: '',
        id: '',
        name: '',
        department: '',
        designation: '',
        expenseFromDate: '',
        expenseTillDate: '',
        expensePurpose: '',
        expenseAmountSpent: '',
        expenseTransectionType: '',
        extraNotes: '',
        onBehalfOf: '',
        currencyCode: ''
    });

    const [expenseDetail, setExpenseDetail] = useState({
        expenseCost: '',
        expenseCategory: '',
        expenseTransectionType: '',
        expenseDate: ''
    });
    const [fieldErrors, setFieldErrors] = useState({
        expenseFromDate: '',
        expenseTillDate: '',
        expenseDate: '',
        expenseCost: '',
        expenseAmountSpent: ''
    });

    const [dropdownData, setDropdownData] = useState({
        currency_code: [],
        expenseTransectionType: []
    });
    const [workflowOptions, setWorkflowOptions] = useState([]);

    useEffect(() => {
        fetchEmployeeDetails();
        fetchWorkflowIds();
    }, []);

    const handleMainChange = (e) => {
        const { name, value } = e.target;

        setExpenseManagement(prev => {
            const updatedExpenseManagement = { ...prev, [name]: value };

            if (name === 'expenseType') {
                updatedExpenseManagement.expenseFromDate = '';
                updatedExpenseManagement.expenseTillDate = '';
                setFieldErrors(prevErrors => ({ ...prevErrors, expenseFromDate: '', expenseTillDate: '' }));
            }

            // Validate date fields if either date field changes or expense type changes
            if (name === 'expenseFromDate' || name === 'expenseTillDate' || name === 'expenseType') {
                const { expenseFromDate, expenseTillDate, expenseType } = updatedExpenseManagement;
                const isValid = isValidDateRange(expenseFromDate, expenseTillDate, expenseType);

                if (!isValid.valid) {
                    setFieldErrors(prevErrors => ({
                        ...prevErrors,
                        expenseFromDate: isValid.message,
                        expenseTillDate: isValid.message
                    }));
                } else {
                    setFieldErrors(prevErrors => ({
                        ...prevErrors,
                        expenseFromDate: '',
                        expenseTillDate: ''
                    }));
                }
            }

            return updatedExpenseManagement; // Update state if valid
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A'; // Check if date is invalid

        return format(date, 'dd-MM-yyyy');
    };

    const isValidDateRange = (fromDateStr, tillDateStr, expenseType) => {
        const today = new Date();
        const fromDate = new Date(fromDateStr); // Date input is in YYYY-MM-DD format
        const tillDate = new Date(tillDateStr); // Date input is in YYYY-MM-DD format

        // Check if the expense type is 'Advance'
        if (expenseType === 'Advance') {
            // Both From Date and To Date cannot be in the past
            if (fromDate < today.setHours(0, 0, 0, 0) || tillDate < today.setHours(0, 0, 0, 0)) {
                return { valid: false, message: 'For Advance, both From Date and To Date cannot be in the past.' };
            }
            if (tillDate < fromDate) {
                return { valid: false, message: 'To Date cannot be before From Date.' };
            }
        } else if (expenseType === 'Reimbursement') {
            // Both From Date and To Date cannot be in the future
            if (fromDate > today.setHours(0, 0, 0, 0) || tillDate > today.setHours(0, 0, 0, 0)) {
                return { valid: false, message: 'For Reimbursement, both From Date and To Date cannot be in the future.' };
            }
            if (tillDate < fromDate) {
                return { valid: false, message: 'To Date cannot be before From Date.' };
            }
        }

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setFullYear(today.getFullYear(), today.getMonth() - 3, today.getDate());

        if (fromDate < threeMonthsAgo || tillDate < threeMonthsAgo) {
            return { valid: false, message: 'Dates must be within the last three months.' };
        }

        return { valid: true, message: '' }; // All conditions met
    };



   
    const validateExpenseDate = (expenseDate) => {
        const fromDate = new Date(expenseManagement.expenseFromDate);
        const tillDate = new Date(expenseManagement.expenseTillDate);
        const date = new Date(expenseDate);

        // Get today's date and the date 3 months ago
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        // Check if the expense type is "Reimbursement" and apply different validations
        if (expenseDate) {
            // Check if expense type is 'Reimbursement'
            if (expenseManagement.expenseType === 'Reimbursement') {
                const isDateValid = date >= threeMonthsAgo && date <= today; // Ensure date is within the last 3 months
                const isWithinRange = date >= fromDate && date <= tillDate; // Ensure date is within From and Till range
                console.log('Expense Date:', expenseDate);
                console.log('From Date:', fromDate);
                console.log('Till Date:', tillDate);

                if (!isDateValid || !isWithinRange) {
                    setFieldErrors(prevErrors => ({
                        ...prevErrors,
                        expenseDate: 'Expense date must be between the selected From and To dates, and within the last 3 months.'
                    }));
                } else {
                    setFieldErrors(prevErrors => ({ ...prevErrors, expenseDate: '' }));
                }
            }
            // For 'Advance', we only need to check if the expense date is within the From and Till range
            else if (expenseManagement.expenseType === 'Advance') {
                const isWithinRange = date >= fromDate && date <= tillDate; // Ensure date is within From and Till range



                if (!isWithinRange) {
                    setFieldErrors(prevErrors => ({
                        ...prevErrors,
                        expenseDate: 'Expense date must be between the selected From and To dates.'
                    }));
                } else {
                    setFieldErrors(prevErrors => ({ ...prevErrors, expenseDate: '' }));
                }
            }
        }
    };

    useEffect(() => {
        if (expenseDetail.expenseDate) {
            validateExpenseDate(expenseDetail.expenseDate);
        }
    }, [expenseManagement.expenseFromDate, expenseManagement.expenseTillDate, expenseDetail.expenseDate]);

    const handleFormDataChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value
        });
    };

    useEffect(() => {
        if (expenseManagement.expenseDetails.length > 0) {
            const allDetailsAdded = expenseManagement.expenseDetails.every(detail =>
                detail.expenseDate && detail.expenseCost && detail.expenseCategory && detail.expenseTransectionType
            );
            setIsSubmitDisabled(!allDetailsAdded);
        } else {
            setIsSubmitDisabled(false);
        }
    }, [expenseManagement.expenseDetails]);

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setExpenseDetail(prev => ({ ...prev, [name]: value }));

        if (name === 'expenseDate') {
            validateExpenseDate(value);
        }

        // Validate numeric inputs
        if (name === 'expenseCost') {
            if (isNaN(value) || parseFloat(value) <= 0) {
                setFieldErrors(prevErrors => ({
                    ...prevErrors,
                    expenseCost: 'Expense cost must be a positive number.'
                }));
            } else if (parseFloat(value) > parseFloat(expenseManagement.expenseAmountSpent)) {
                setFieldErrors(prevErrors => ({
                    ...prevErrors,
                    expenseCost: 'Expense cost should not exceed amount spent.'
                }));
            } else {
                setFieldErrors(prevErrors => ({ ...prevErrors, expenseCost: '' }));
            }
        }

        if (name === 'expenseAmountSpent') {
            const validValue = value.replace(/[^0-9.]/g, '');  
            setExpenseManagement((prev) => ({ ...prev, [name]: validValue }));
            if (isNaN(validValue) || parseFloat(validValue) <= 0) {
                setFieldErrors(prevErrors => ({
                    ...prevErrors,
                    expenseAmountSpent: 'Total Amount must be a positive number.'
                }));
            } else {
                setFieldErrors(prevErrors => ({ ...prevErrors, expenseAmountSpent: '' }));
            }
        }

    };

    const isMainDetailsComplete = () => {
        return expenseManagement.expensePurpose && expenseManagement.expenseAmountSpent && expenseManagement.expenseFromDate && expenseManagement.expenseTillDate;
    };
    const addDetail = () => {
        let isError = false; // Track if any error occurs during validation

        // Check if main details are complete
        if (!isMainDetailsComplete()) {
            showToast('Please fill out all details before adding expense details.', 'warn');
            isError = true;
        }

        // Check if the date range is valid
        if (!isValidDateRange()) {
            showToast('Please select a correct date.', 'warn');
            isError = true;
        }

        // Check if all fields in expenseDetail are filled
        if (!expenseDetail.expenseDate || !expenseDetail.expenseCost || !expenseDetail.expenseCategory || !expenseDetail.expenseTransectionType) {
            showToast('Please fill all fields before adding.', 'warn');
            isError = true;
        }

        // Check if expense cost is a positive number
        if (isNaN(expenseDetail.expenseCost) || parseFloat(expenseDetail.expenseCost) <= 0) {
            showToast('Expense cost must be a positive number.', 'warn');
            isError = true;
        }

        // Check if expense cost exceeds amount spent
        if (parseFloat(expenseDetail.expenseCost) > parseFloat(expenseManagement.expenseAmountSpent)) {
            showToast('Expense cost should not exceed amount spent.', 'warn');
            isError = true;
        }

        // Validate the expense date against the From and To dates
        const fromDate = new Date(expenseManagement.expenseFromDate);
        const tillDate = new Date(expenseManagement.expenseTillDate);
        const expenseDate = new Date(expenseDetail.expenseDate);

        if (expenseDate < fromDate || expenseDate > tillDate) {
            showToast('Please select an expense date between From and To Dates.', 'warn');
            isError = true;
        }

        // If there are any errors, do not proceed further
        if (isError) {
            return; // Stop execution if any validation fails
        }

        // If all validations pass, add the expense detail
        setExpenseManagement(prev => ({
            ...prev,
            expenseDetails: [...prev.expenseDetails, expenseDetail]
        }));

        // Reset expense detail fields after adding
        setExpenseDetail({
            expenseCost: '',
            expenseCategory: '',
            expenseTransectionType: '',
            expenseDate: ''
        });

        setDetailsAdded(true);
    };

    const removeDetail = (index) => {
        const newDetails = expenseManagement.expenseDetails.filter((_, i) => i !== index);
        setExpenseManagement({ ...expenseManagement, expenseDetails: newDetails });
    };

    const handleSubmit = async () => {
        const mainErrors = validateMainExpenseDetails();
        if (Object.keys(mainErrors).length > 0) {
            setFieldErrors(mainErrors);  // Set errors for main form
            return;
        }

        const itemErrors = expenseManagement.expenseDetails.map((detail, index) => {
            return validateExpenseItemDetails(detail);
        });

        // Flatten errors and set
        const flatItemErrors = itemErrors.reduce((acc, err) => ({ ...acc, ...err }), {});
        if (Object.keys(flatItemErrors).length > 0) {
            setFieldErrors(prevErrors => ({ ...prevErrors, ...flatItemErrors }));
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const dataToSubmit = {
                expenseFromDate: expenseManagement.expenseFromDate,
                expenseTillDate: expenseManagement.expenseTillDate,
                expensePurpose: expenseManagement.expensePurpose,
                expenseAmountSpent: expenseManagement.expenseAmountSpent,
                expenseTransectionType: formData.expenseTransectionType, // Assuming you get this from formData
                workflowDivision: workflowOptions.find(option => option.id === expenseManagement.workflowMainId)?.division || '',
                workflowDepartment: workflowOptions.find(option => option.id === expenseManagement.workflowMainId)?.department || '',
                workflowRole: workflowOptions.find(option => option.id === expenseManagement.workflowMainId)?.role || '',
                currencyCode: expenseManagement.currencyCode,
                expenseType: expenseManagement.expenseType, // Assuming you set this in state somewhere
                expenseDetails: expenseManagement.expenseDetails.map(detail => ({
                    expenseDate: detail.expenseDate,
                    expenseDescription: detail.expenseDescription,
                    expenseCategory: detail.expenseCategory,
                    expenseCost: detail.expenseCost,
                    expenseTransectionType: detail.expenseTransectionType
                }))
            };
            console.log('expense submission should work on this id:', expenseManagement.id);
            const response = await axios.post(
                `http://${strings.localhost}/api/expense/saveExpense/${employeeId}/${companyId}/${expenseManagement.id}`,
                dataToSubmit,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log(response.data);
            if (response.data && response.data.id) {
                console.log(response.data.id);
                setExpenseDocumentId(response.data.id); // Pass the response ID to the upload function
            }
            showToast('Expense added successfully.', 'success');
            setOpen(false);
            setShowConfirmationPopup(true);
            console.log("State of showConfirmationPopup:", showConfirmationPopup);
            // window.location.reload();
        } catch (error) {
            console.error('There was an error submitting the data.', error);
            showToast('An error occurred while submitting the expense. Please try again.', 'error');
        }
    };
    const handleUploadFiles = async () => {
        console.log('Starting file upload for Expense ID:', expenseDocumentId); // Log the expense ID

        if (Object.keys(files).length === 0) {
            showToast('No files to upload.', 'warn');
            return;
        }

        setLoading(true);
        setProgress(0);

        try {
            // Iterate over the files object directly
            for (const fileKey in files) {
                const file = files[fileKey].file;  // Get the actual file object from files object
                console.log('Uploading file:', file); // Log the file object for debugging

                // Create FormData and append the file under the 'file' key
                const formData = new FormData();
                console.log('Appending file to FormData:', file.name); // Log the file name
                formData.append('file', file); // 'file' is the key, and the file object is the value

                // Debugging: Log the FormData content before sending
                for (let [key, value] of formData.entries()) {
                    console.log(`FormData key: ${key}, value: ${value.name || value}`);  // This will show the file name, not the file object
                }
                console.log(expenseDocumentId);
                // Check the URL and expenseManagementId
                const uploadUrl = `http://${strings.localhost}/api/DocumentExpenseManagement/${expenseDocumentId}/upload`;
                console.log('Sending request to:', uploadUrl); // Log the request URL

                // Send the request with the correct expenseManagementId
                const response = await axios.post(uploadUrl, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentage);
                    },
                });

                if (response.status === 200) {
                    showToast(`Uploaded: ${file.name}`, 'success');
                } else {
                    showToast(`Failed to upload: ${file.name}`, 'error');
                }
            }
            setShowAttachmentModal(false);
            setFiles({}); // Clear the uploaded files after successful upload
        } catch (error) {
            console.error('Upload error:', error);
            showToast('An error occurred during the upload.', 'error');
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    const handleConfirmation = (hasAttachments) => {
        if (hasAttachments) {
            setShowConfirmationPopup(false);
            setShowAttachmentModal(true);
        } else {
            setShowConfirmationPopup(false);
        }
    };
    const fetchEmployeeDetails = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`);
            const employee = response.data;
            setFormData({
                ...formData,
                name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
                id: employee.id,
                department: employee.department,
                designation: employee.designation,
                employeeId: employee.employeeId

            });
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };


    // const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    //     <input type="text" value={value}  onClick={onClick} ref={ref}  readOnly className="date-input"/>
    // ));
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const expenseType = await fetchDataByKey('expenseType');
                const expenseCategory = await fetchDataByKey('expenseCategory');
                const expenseTransectionType = await fetchDataByKey('expenseTransectionType');
                const currency_code = await fetchValueByKey('currency_code');
                setDropdownData({
                    expenseType: expenseType,
                    expenseCategory: expenseCategory,
                    expenseTransectionType: expenseTransectionType,
                    currency_code: currency_code,

                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);

    const fetchWorkflowIds = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/workflow/names/${companyId}`);
            setWorkflowOptions(response.data);
        } catch (error) {
            console.error('Error fetching workflow Name', error);
        }
    };
    const calculateTotalExpenseCost = () => {
        return expenseManagement.expenseDetails.reduce((total, detail) => total + parseFloat(detail.expenseCost || 0), 0);
    };

 
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const validateDates = () => {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const fromDate = new Date(expenseManagement.expenseFromDate);
        const tillDate = new Date(expenseManagement.expenseTillDate);
        let valid = true;
        // Validate From Date: Should be within last three months or any future date
        if (fromDate < threeMonthsAgo && fromDate < today) {
            setValidationMessage('From Date must be within the last three months or any future date.');
            valid = false;
        }
        // Validate To Date: Should not be before From Date
        if (tillDate < fromDate) {
            setValidationMessage('To Date cannot be before From Date.');
            valid = false;
        }
        // Validate Expense Date: Should be between From and To Dates
        if (expenseDetail.expenseDate) {
            const expenseDate = new Date(expenseDetail.expenseDate);
            if (expenseDate < fromDate || expenseDate > tillDate) {
                setValidationMessage('Expense Date must be between From and To Dates.');
                valid = false;
            }
        }
        if (valid) {
            setValidationMessage('');
        }
    };

    useEffect(() => {
        validateDates();
    }, [expenseManagement.expenseFromDate, expenseManagement.expenseTillDate, expenseDetail.expenseDate]);

    const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
        <input
            type="text"
            value={value}
            onClick={onClick}
            ref={ref}
            readOnly
            className="date-input"
        />
    ));
    const handleDateChange = async (dates) => {
        setDates(dates);
        setCalendarOpen(false)
        if (dates[0] && dates[1]) {
            try {
                setLoading(true);  // Set loading state while fetching
                const startDate = dates[0].toISOString().split('T')[0];
                const endDate = dates[1].toISOString().split('T')[0];

                const response = await axios.get(`http://${strings.localhost}/api/expense/getByDateRange/${companyId}/${employeeId}`, {
                    params: { startDate, endDate }
                });

                // Navigate to ExpenseMan page and pass fetched data
                navigate('/ExpenseMan', { state: { expenses: response.data } });

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDrop = (acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                showToast(`File ${file.name} is too large. Maximum size is 10 MB.`, 'warn');
                return;
            }

            const fileKey = `key_${file.name}`;
            setFiles((prevFiles) => ({
                ...prevFiles,
                [fileKey]: { file, progress: 0 }, // Store the actual file object and initialize progress
            }));
        });
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: handleDrop,
        accept: "*/*", // Accept any file type
        onDragOver: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false),
    });

    const handleRemoveFile = (fileKey) => {
        const updatedFiles = { ...files };
        delete updatedFiles[fileKey];
        setFiles(updatedFiles);
    };

    const handleBack = () => {
        setShowAttachmentModal(false);
    };

    const validateMainExpenseDetails = () => {
        const errors = {};

        // 1. Validate Purpose
        if (!expenseManagement.expensePurpose.trim()) {
            errors.expensePurpose = "Expense purpose is required.";
        }

        // 2. Validate Total Amount
        if (!expenseManagement.expenseAmountSpent || isNaN(expenseManagement.expenseAmountSpent) || parseFloat(expenseManagement.expenseAmountSpent) <= 0) {
            errors.expenseAmountSpent = "Total amount must be a positive number.";
            showToast('Total amount must be a positive number.','error')
        }

        // 3. Validate Currency
        if (!expenseManagement.currencyCode) {
            errors.currencyCode = "Currency is required.";
        }

        // 4. Validate Expense Type
        if (!expenseManagement.expenseType) {
            errors.expenseType = "Expense type is required.";
        }

        // 5. Validate From Date
        if (!expenseManagement.expenseFromDate) {
            errors.expenseFromDate = "From date is required.";
        } else {
            const fromDate = new Date(expenseManagement.expenseFromDate);
            if (expenseManagement.expenseType === 'Reimbursement') {
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                if (fromDate < threeMonthsAgo || fromDate > new Date()) {
                    errors.expenseFromDate = "For reimbursement, From Date must be within the past three months.";
                    showToast('For reimbursement, From Date must be within the past three months .', 'error')
                }
            }
        }

        // 6. Validate Till Date
        if (!expenseManagement.expenseTillDate) {
            errors.expenseTillDate = "To date is required.";
        } else {
            const fromDate = new Date(expenseManagement.expenseFromDate);
            const tillDate = new Date(expenseManagement.expenseTillDate);
            if (expenseManagement.expenseType === 'Reimbursement') {
                if (tillDate < fromDate || tillDate > new Date()) {
                    errors.expenseTillDate = "For reimbursement, To Date must be within the past three months or any future date and cannot be before From Date.";
                }
            }
        }

        return errors;
    };

    const validateExpenseItemDetails = (detail) => {
        const errors = {};

        // 1. Validate Expense Date (for reimbursement)
        if (!detail.expenseDate) {
            errors.expenseDate = "Expense date is required.";
        } else if (expenseManagement.expenseType === 'Reimbursement') {
            const expenseDate = new Date(detail.expenseDate);
            const fromDate = new Date(expenseManagement.expenseFromDate);
            const tillDate = new Date(expenseManagement.expenseTillDate);

            // Ensure the expense date is between expenseFromDate and expenseTillDate
            if (expenseDate < fromDate || expenseDate > tillDate) {
                errors.expenseDate = "Expense date must be between From Date and To Date for reimbursement.";
            }
        }

        // 2. Validate Expense Cost
        if (!detail.expenseCost || isNaN(detail.expenseCost) || parseFloat(detail.expenseCost) <= 0) {
            errors.expenseCost = "Amount must be a positive number.";
        }

        // 3. Validate Category
        if (!detail.expenseCategory) {
            errors.expenseCategory = "Expense category is required.";
        }

        // 4. Validate Payment Mode (Transaction Type)
        if (!detail.expenseTransectionType) {
            errors.expenseTransectionType = "Payment mode is required.";
        }

        return errors;
    };
  const handleClearDates = () => {
        setDates([null, null]);
        setCalendarOpen(false);
        window.location.reload();

    };
   

    return (
        <div>
            <div className='form-controls'>
                <div>
                    <div className='date-input-wrapper'>
                        <input type="text" placeholder="Select date range" readOnly className='date-input'
                            value={`${dates[0] ? dates[0].toLocaleDateString() : ''} - ${dates[1] ? dates[1].toLocaleDateString() : ''}`}
                            onClick={() => setCalendarOpen(!calendarOpen)}
                        />
                        <FaCalendarAlt
                            className='calendar-icon'
                            onClick={() => setCalendarOpen(!calendarOpen)}
                        />
                          {dates[0] || dates[1] ? (
                                    <button className="outline-btn" onClick={handleClearDates}>Clear</button>
                                ) : null}
                        {calendarOpen && (
                            <div ref={calendarRef} className='calendar-popup'>
                                <DatePicker selected={dates[0]} onChange={handleDateChange} startDate={dates[0]} endDate={dates[1]} selectsRange inline customInput={<CustomInput />} />
                                {loading && <p>Loading...</p>}
                            </div>
                        )}
                    </div>
                </div>
                <div className='containerbtn'>
                    <button type="button" className="btn" onClick={() => setOpen(true)}>Add Expense</button>
                </div>
            </div>
            {open && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <div className='form-title'>Create Expense Management</div>
                            <button className="button-close" onClick={() => setOpen(false)}>x</button>
                        </div>
                        <div className="modal-body">
                            <div className="input-row">
                                <div>
                                    <label htmlFor="employeename">Employee Name</label>
                                    <input type="text" id="employeename" name="employeename" value={formData.name} onChange={handleFormDataChange} className='readonly' />
                                </div>
                                <div>
                                    <label htmlFor="Id">Employee ID</label>
                                    <input type="text" id="Id" name="Id" value={formData.employeeId} onChange={handleFormDataChange} className='readonly' />
                                </div>
                                <div>
                                    <span className="required-marker">*</span>
                                    <label htmlFor='workflowId'>Workflow ID</label>
                                    <select className='selectIM' name='id' value={expenseManagement.id} onChange={handleMainChange} required >
                                        <option value="" disabled hidden></option>
                                        {workflowOptions.map((option) => (
                                            <option key={option.id} value={option.id}>
                                                {option.workflowName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <span className="required-marker">*</span>
                                    <label htmlFor="expensePurpose">Expense Description</label>
                                    <input type="text" id="expensePurpose" name="expensePurpose" value={expenseManagement.expensePurpose} onChange={handleMainChange} className="inputField" required />
                                </div>
                            </div>
                            <div className='input-row'>
                                <div>
                                    <span className="required-marker">*</span>
                                    <label htmlFor="currency">Currency</label>
                                    <select className='selectIM' id="currencyCode" name="currencyCode" value={expenseManagement.currencyCode} onChange={handleMainChange} required >
                                        <option value="" disabled hidden></option>
                                        {dropdownData.currency_code && dropdownData.currency_code.length > 0 ? (
                                            dropdownData.currency_code.map(option => (
                                                <option key={option.masterId} value={option.data}>
                                                    {option.data}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>currency code not available</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <span className="required-marker">*</span>
                                    <label htmlFor="expenseAmountSpent">Total Amount</label>
                                    <input
                                        type="number"
                                        id="expenseAmountSpent"
                                        name="expenseAmountSpent"
                                        value={expenseManagement.expenseAmountSpent}
                                        onChange={handleDetailChange} className="inputField" required />
                                    {fieldErrors.expenseAmountSpent && (
                                        <span className='error-message'>
                                            {fieldErrors.expenseAmountSpent}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="required-marker">*</span>
                                    <label htmlFor="expenseType">Expense Type</label>
                                    <select className='selectIM' id="expenseType" name="expenseType" value={expenseManagement.expenseType} onChange={handleMainChange} required >
                                        <option value="" selected disabled hidden></option>
                                        {dropdownData.expenseType && dropdownData.expenseType.length > 0 ? (
                                            dropdownData.expenseType.map(option => (
                                                <option key={option.masterId} value={option.data}>
                                                    {option.data}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled> Not available</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <span className="required-marker">*</span>
                                    <label htmlFor="expenseFromDate">From Date</label>
                                    <input
                                        style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '5px', marginTop: '5px' }}
                                        type="date"
                                        id="expenseFromDate"
                                        name="expenseFromDate"
                                        value={expenseManagement.expenseFromDate}
                                        onChange={handleMainChange}
                                        className="inputField"
                                        required
                                        disabled={!expenseManagement.expenseType}
                                    />
                                    {fieldErrors.expenseFromDate && (
                                        <span className='error-message'>
                                            {fieldErrors.expenseFromDate}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="required-marker">*</span>
                                    <label htmlFor="expenseTillDate">To Date</label>
                                    <input
                                        style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '5px', marginTop: '5px' }}
                                        type="date"
                                        id="expenseTillDate"
                                        name="expenseTillDate"
                                        value={expenseManagement.expenseTillDate}
                                        onChange={handleMainChange}
                                        className="inputField"
                                        required
                                        disabled={!expenseManagement.expenseType}
                                    />
                                </div>
                            </div>
                            <table className="Attendance-table">
                                <thead>
                                    <tr>
                                        <th>Expense Date</th>
                                        <th>Amount</th>
                                        <th>Category</th>
                                        <th>Payment Mode</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseManagement.expenseDetails.map((detail, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(detail.expenseDate)}</td>
                                            <td>{detail.expenseCost}</td>
                                            <td>{detail.expenseCategory}</td>
                                            <td>{detail.expenseTransectionType}</td>
                                            <td>
                                                <button onClick={() => removeDetail(index)} className="buttonIcon">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="input-row">
                                <div>
                                    <label>Expense Date</label>
                                    <input
                                        style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '5px', marginTop: '5px' }}
                                        type="date" id="expenseDate" name="expenseDate" value={expenseDetail.expenseDate} onChange={handleDetailChange} className="inputField" />
                                    {fieldErrors.expenseDate && (
                                        <span className='error-message'>
                                            {fieldErrors.expenseDate}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <label>Amount</label>
                                    <input style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '5px', marginTop: '5px' }}
                                        type='text' id='expenseCost' name='expenseCost' value={expenseDetail.expenseCost} onChange={handleDetailChange} />
                                    {fieldErrors.expenseCost && (
                                        <span className='error-message'>
                                            {fieldErrors.expenseCost}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <label>Expense Category</label>
                                    <select className='selectIM' id="expenseCategory" name="expenseCategory" value={expenseDetail.expenseCategory} onChange={handleDetailChange} >
                                        <option value="" disabled hidden> </option>
                                        {dropdownData.expenseCategory && dropdownData.expenseCategory.length > 0 ? (
                                            dropdownData.expenseCategory.map(option => (
                                                <option key={option.masterId} value={option.data}>
                                                    {option.data}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>  Not available</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label>Payment Mode</label>
                                    <select className='selectIM' id="expenseTransectionType" name="expenseTransectionType" value={expenseDetail.expenseTransectionType} onChange={handleDetailChange} >
                                        <option value="" disabled hidden> </option>
                                        {dropdownData.expenseTransectionType && dropdownData.expenseTransectionType.length > 0 ? (
                                            dropdownData.expenseTransectionType.map(option => (
                                                <option key={option.masterId} value={option.data}>
                                                    {option.data}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Transaction Type Not available</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <button disabled={!isMainDetailsComplete()} onClick={addDetail} className="outline-btn"  > <FontAwesomeIcon icon={faPlusCircle} /> Add Detail </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setOpen(false)} className="outline-btn">  Cancel </button>
                            <button onClick={handleSubmit} className="btn" disabled={isSubmitDisabled} > Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmationPopup && (

                <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>

                    <p>Are there any attachments to upload?</p>
                    <div className="btnContainer">

                        <button type='button' className='outline-btn' onClick={() => handleConfirmation(false)}>No Attachments</button>
                        <button type='button' className='btn' onClick={() => handleConfirmation(true)}>Attachments</button>
                    </div>
                </div>
            )}

            {/* Attachment Upload Modal */}
            {showAttachmentModal && (
                <div className="modal-overlay">
                    <div className="leavemodal-content">
                        <div className="title">
                            Upload Documents
                            <button onClick={() => setShowAttachmentModal(false)} className="close-button"> X </button>
                        </div>
                        <div className="leave-containers">
                            <div
                                {...getRootProps()}
                                style={{
                                    border: isDragging ? "2px solid #00f" : "2px dashed #ccc",
                                    padding: "20px",
                                    textAlign: "center",
                                    justifyContent: 'center',
                                }}
                            >
                                <input {...getInputProps()} />
                                <FaInbox className="upload-icon" />
                                <p>Drag & drop some files here, or click to select files</p>
                            </div>
                            <div className="file-list-section">
                                {/* Display the selected files */}
                                {Object.keys(files).length > 0 ? (
                                    <ul className="file-list">
                                        {Object.keys(files).map((key) => (
                                            <li key={key} className="file-item">
                                                {files[key] && files[key].file ? (
                                                    <>
                                                        <div className="file-preview-circle">
                                                            {/* {files[key].file.name.split('.').pop().toUpperCase()} */}
                                                            {files[key].file.type.startsWith("image/") ? (
                                                                <img
                                                                    src={URL.createObjectURL(files[key].file)}
                                                                    alt="Preview"
                                                                    className="file-preview-img"
                                                                />
                                                            ) : (
                                                                <span className="file-icon">📄</span>
                                                            )}
                                                        </div>
                                                        <span className="file-name">{files[key].file.name}</span>
                                                        <button
                                                            type="button"
                                                            className="cross-btn"
                                                            onClick={() => handleRemoveFile(key)}
                                                        >
                                                            &#10005; {/* Cross symbol */}
                                                        </button>                                                    </>
                                                ) : (
                                                    <span>No file available</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No files selected yet.</p>
                                )}
                                <button type="button" className="outline-btn" onClick={handleBack}>Back</button>
                                {/* Add the upload button */}
                                <button type="button" className="outline-btn" onClick={() => handleUploadFiles(expenseManagement.id)}>Upload Files</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}




        </div>
    );
};
export default CreateExpenseManagement;

