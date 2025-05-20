import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import BasicInfoStep from './BasicInfoStep';
import HandoverStep from './HandoverStep';
import ExitInterviewStep from './ExitInterviewStep';
import { toast } from 'react-toastify';
import { showToast } from '../../Api.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { strings } from '../../string.jsx';
import AssetStep from './AssetStep.jsx';

const OffboardingForm = ({
    companyId,
    employeeId,
    onClose,
    fetchOffboardingData,
    dropdownData = { department: [], reason: [] },
    editingRecord
}) => {
    const [currentStep, setCurrentStep] = useState(editingRecord?.isCompleteMode ? 2 : 1);
    const [offboardingId, setOffboardingId] = useState(editingRecord?.id || null);
    const [showOtherReason, setShowOtherReason] = useState(false);
    const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
    const [managerSearchResults, setManagerSearchResults] = useState([]);
    const [employeeError, setEmployeeError] = useState(null);
    const [managerError, setManagerError] = useState(null);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState({});
    const [isAssigning, setIsAssigning] = useState(false);
    useEffect(() => {
        if (editingRecord) {
            setOffboardingId(editingRecord.id);
            try {
                console.log('Processing editing record:', editingRecord);
                const newFormData = {
                    basicInfo: {
                        name: editingRecord.employeeName || editingRecord.name || '',
                        department: editingRecord.department || '',
                        lastDate: editingRecord.lastDate || editingRecord.lastWorkingDate || '',
                        reason: editingRecord.reason || '',
                        other: editingRecord.other || '',
                        deptId: editingRecord.deptId || '',
                        reportingManagerName: editingRecord.reportingManagerId || ''
                    },
                    handovers: Array.isArray(editingRecord.handovers)
                        ? editingRecord.handovers.map(handover => ({
                            title: handover.title || '',
                            description: handover.description || '',
                            employee: {
                                id: handover.employeeToId || handover.employee?.id || '',
                                employeeId: handover.employee?.employeeId || '',
                                employeeFirstName: handover.employee?.firstName || '',
                                employeeLastName: handover.employee?.lastName || ''
                            }
                        }))
                        : [{
                            title: '',
                            description: '',
                            employee: {
                                id: '',
                                employeeId: '',
                                employeeFirstName: '',
                                employeeLastName: ''
                            }
                        }],
                    exitInterview: editingRecord.exitInterview ? {
                        interviewDate: editingRecord.exitInterview.interviewDate || '',
                        employeeTitle: editingRecord.exitInterview.title || '',
                        supervisorName: editingRecord.exitInterview.supervisorName || '',
                        supervisorTitle: editingRecord.exitInterview.supervisorTitle || '',
                        lengthOfService: editingRecord.exitInterview.lengthOfService || '',
                        leavingReason: editingRecord.exitInterview.reason || '',
                    } : {
                        interviewDate: '',
                        employeeTitle: '',
                        supervisorName: '',
                        supervisorTitle: '',
                        lengthOfService: '',
                        leavingReason: '',
                    }
                };
                setFormData(newFormData);
                if (editingRecord.employee) {
                    setSelectedEmployee({
                        id: editingRecord.employee.id || '',
                        employeeId: editingRecord.employee.employeeId || '',
                        employeeFirstName: editingRecord.employee.firstName || '',
                        employeeLastName: editingRecord.employee.lastName || ''
                    });
                }
                if (editingRecord.reportingManager) {
                    setSelectedManager({
                        id: editingRecord.reportingManager.id || '',
                        employeeId: editingRecord.reportingManager.employeeId || '',
                        employeeFirstName: editingRecord.reportingManager.firstName || '',
                        employeeLastName: editingRecord.reportingManager.lastName || ''
                    });
                }

                if (editingRecord.isCompleteMode) {
                    setCurrentStep(2);
                }

            } catch (error) {
                console.error('Error processing editing record:', error);
                toast.error('Failed to load record data');
            }
        }
    }, [editingRecord]);



    const [formData, setFormData] = useState({
        basicInfo: {
            name: '',
            department: '',
            lastDate: '',
            reason: '',
            customReason: '',
            other: '',
            deptId: ''
        },
        handovers: [{
            title: '',
            responsiblePerson: '',
            responsiblePersonId: '',
            description: '',
            employee: {
                id: '',
                employeeId: '',
                employeeFirstName: '',
                employeeLastName: ''
            }
        }],
        items: [{
            id: 1,
            itemName: '',
            itemType: '',
            condition: ''
        }],
        exitInterview: {
            interviewDate: '',
            employeeTitle: '',
            supervisorName: '',
            supervisorTitle: '',
            lengthOfService: '',
            leavingReason: '',
            resignationReasons: [],
            resignationOtherReason: '',
            laidOffReasons: [],
            laidOffOtherReason: '',
            otherReason: '',
            feedback: ''
        }
    });

    const [selectedManager, setSelectedManager] = useState({
        id: '',
        employeeId: '',
        employeeFirstName: '',
        employeeLastName: ''
    });

    const [selectedEmployee, setSelectedEmployee] = useState({
        id: '',
        employeeId: '',
        employeeFirstName: '',
        employeeLastName: ''
    });

    const handleNextStep = async (e) => {
        setIsAssigning(true);
        e.preventDefault();

        try {
            if (currentStep === 1) {
                const basicInfoResponse = await saveBasicInfo(formData.basicInfo);
                setOffboardingId(basicInfoResponse.id);
                setCurrentStep(currentStep + 1);
            } else if (currentStep === 2) {
                if (!offboardingId) {
                    toast.error("Offboarding ID is missing");
                }
                if (!selectedEmployee.id) {
                    toast.error("Employee ID is missing");
                }
                const handoverPromises = formData.handovers.map(handover => {
                    if (!handover.employee.id) {
                        throw new Error("Please select a valid employee for all handovers");
                    }

                    return axios.post(
                        `http://${strings.localhost}/api/knowledgeTransfer/save?offBoardingId=${offboardingId}&employeeById=${selectedEmployee.id}`,
                        [{
                            employeeToId: handover.employee.id,
                            title: handover.title,
                            description: handover.description,
                            completionStatus: false
                        }],
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                });
                await Promise.all(handoverPromises);
                setCurrentStep(currentStep + 1);
                toast.success("Handover saved successfully.")
            } else if (currentStep === 3) {
                setCurrentStep(4);
            }
        } catch (error) {
            if (error.message === "This employee has already applied for offboarding") {
                toast.error(error.message);
                onClose();
            } else {
                toast.error(`Failed to proceed to next step. Please try again. Error: ${error.message}`);
            }
        } finally {
            setIsAssigning(false);
        }
    };

    useEffect(() => {
        if (editingRecord) {
            setFormData(prev => ({
                ...prev,
                basicInfo: {
                    ...prev.basicInfo,
                    name: editingRecord.employeeName,
                    department: editingRecord.department,
                    lastDate: editingRecord.lastDate,
                }
            }));

            if (editingRecord.isCompleteMode) {
                setCurrentStep(2);
            }
        }
    }, [editingRecord]);

    const handleDateChange = (event, name) => {
        const dateValue = event.target.value;
        const formattedDate = dateValue ? moment(dateValue).format('YYYY-MM-DD') : '';

        if (name === 'interviewDate') {
            setFormData(prev => ({
                ...prev,
                exitInterview: {
                    ...prev.exitInterview,
                    interviewDate: formattedDate
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                basicInfo: {
                    ...prev.basicInfo,
                    [name]: formattedDate
                }
            }));
        }
    };

    const handleBasicInfoChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('resignationReasons') || name.startsWith('laidOffReasons')) {
            const reasonType = name.startsWith('resignationReasons') ? 'resignationReasons' : 'laidOffReasons';
            const currentReasons = formData.exitInterview[reasonType] || [];

            setFormData(prev => ({
                ...prev,
                exitInterview: {
                    ...prev.exitInterview,
                    [reasonType]: checked
                        ? [...currentReasons, value]
                        : currentReasons.filter(reason => reason !== value)
                }
            }));
        } else if (name in formData.basicInfo) {
            setFormData(prev => ({
                ...prev,
                basicInfo: {
                    ...prev.basicInfo,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                exitInterview: {
                    ...prev.exitInterview,
                    [name]: type === 'checkbox' ? checked : value
                }
            }));
        }
    };

    const handleEmployeeSelect = async (event) => {
        const { value } = event.target;
        setSelectedEmployee(prev => ({
            ...prev,
            employeeId: value
        }));

        if (value.trim() !== '') {
            try {
                const response = await axios.get(
                    `http://${strings.localhost}/employees/EmployeeById/${value}?companyId=${companyId}`
                );
                const employee = response.data;
                setSelectedEmployee({
                    id: employee.id,
                    employeeId: employee.employeeId,
                    employeeFirstName: employee.firstName,
                    employeeLastName: employee.lastName || ''
                });
                setEmployeeError(null);
            } catch (error) {
                toast.error('Error fetching employee:', error);
                setEmployeeError('Employee not found');
                setSelectedEmployee(prev => ({
                    ...prev,
                    id: '',
                    employeeFirstName: '',
                    employeeLastName: ''
                }));
            }
        } else {
            setSelectedEmployee(prev => ({
                ...prev,
                id: '',
                employeeFirstName: '',
                employeeLastName: ''
            }));
            setEmployeeError(null);
        }
    };

    const handleEmployeeNameChange = async (event) => {
        const { value } = event.target;
        setSelectedEmployee(prev => ({
            ...prev,
            employeeFirstName: value
        }));

        if (value.trim() !== '') {
            try {
                const response = await axios.get(
                    `http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${value.trim()}`
                );
                setEmployeeSearchResults(response.data);
                setEmployeeError(null);
            } catch (error) {
                toast.error('Error searching employees:', error);
                setEmployeeError('Error searching employees');
                setEmployeeSearchResults([]);
            }
        } else {
            setEmployeeSearchResults([]);
            setEmployeeError(null);
        }
    };

    const handleSelectEmployee = (employee) => {
        setSelectedEmployee({
            id: employee.id,
            employeeId: employee.employeeId,
            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName || ''
        });
        setEmployeeSearchResults([]);

        setFormData(prev => ({
            ...prev,
            basicInfo: {
                ...prev.basicInfo,
                employeeId: employee.id
            }
        }));
    };

    const handleManagerNameChange = async (event) => {
        const { value } = event.target;
        setSelectedManager(prev => ({
            ...prev,
            employeeFirstName: value
        }));

        if (value.trim() !== '') {
            try {
                const response = await axios.get(
                    `http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${value.trim()}`
                );
                setManagerSearchResults(response.data);
                setManagerError(null);
            } catch (error) {
                toast.error('Error searching managers:', error);
                setManagerError('Error searching managers');
                setManagerSearchResults([]);
            }
        } else {
            setManagerSearchResults([]);
            setManagerError(null);
        }
    };

    const handleSelectManager = (employee) => {
        setSelectedManager({
            id: employee.id,
            employeeId: employee.employeeId,
            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName || ''
        });
        setManagerSearchResults([]);
    };

    const handleHandoverChange = (handoverIndex, e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedHandovers = [...prev.handovers];
            updatedHandovers[handoverIndex] = {
                ...updatedHandovers[handoverIndex],
                [name]: value
            };
            return { ...prev, handovers: updatedHandovers };
        });
    };

    const handleHandoverEmployeeSelect = async (handoverIndex, event) => {
        const { value } = event.target;
        const updatedHandovers = [...formData.handovers];

        updatedHandovers[handoverIndex] = {
            ...updatedHandovers[handoverIndex],
            employee: {
                ...updatedHandovers[handoverIndex].employee,
                employeeId: value
            }
        };

        setFormData(prev => ({ ...prev, handovers: updatedHandovers }));

        if (value.trim() !== '') {
            try {
                const response = await axios.get(
                    `http://${strings.localhost}/employees/EmployeeById/${value}?companyId=${companyId}`
                );
                const employee = response.data;

                const updatedHandovers = [...formData.handovers];
                updatedHandovers[handoverIndex] = {
                    ...updatedHandovers[handoverIndex],
                    employee: {
                        id: employee.id,
                        employeeId: employee.employeeId,
                        employeeFirstName: employee.firstName,
                        employeeLastName: employee.lastName || ''
                    }
                };

                setFormData(prev => ({ ...prev, handovers: updatedHandovers }));
                setError(null);
            } catch (error) {
                toast.error('Error fetching employee:', error);
                setError('Employee not found');

                const updatedHandovers = [...formData.handovers];
                updatedHandovers[handoverIndex] = {
                    ...updatedHandovers[handoverIndex],
                    employee: {
                        id: '',
                        employeeId: value,
                        employeeFirstName: '',
                        employeeLastName: ''
                    }
                };
                setFormData(prev => ({ ...prev, handovers: updatedHandovers }));
            }
        }
    };

    const handleHandoverEmployeeNameChange = async (handoverIndex, event) => {
        const { value } = event.target;
        setFormData(prev => {
            const updatedHandovers = [...prev.handovers];
            updatedHandovers[handoverIndex] = {
                ...updatedHandovers[handoverIndex],
                employee: {
                    ...updatedHandovers[handoverIndex].employee,
                    employeeFirstName: value,
                    id: '',
                    employeeId: '',
                    employeeLastName: ''
                }
            };
            return { ...prev, handovers: updatedHandovers };
        });

        if (value.trim() !== '') {
            try {
                const response = await axios.get(
                    `http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${value.trim()}`
                );
                setSearchResults({
                    ...searchResults,
                    [handoverIndex]: response.data
                });
                setError(null);
            } catch (error) {
                toast.error('Error searching employees:', error);
                setError('Error searching employees');
                setSearchResults({
                    ...searchResults,
                    [handoverIndex]: []
                });
            }
        } else {
            setSearchResults({
                ...searchResults,
                [handoverIndex]: []
            });
            setError(null);
        }
    };

    const handleSelectHandoverEmployee = (handoverIndex, employee) => {
        setFormData(prev => {
            const updatedHandovers = [...prev.handovers];
            updatedHandovers[handoverIndex] = {
                ...updatedHandovers[handoverIndex],
                employee: {
                    id: employee.id,
                    employeeId: employee.employeeId,
                    employeeFirstName: employee.firstName,
                    employeeLastName: employee.lastName || ''
                }
            };
            return { ...prev, handovers: updatedHandovers };
        });

        setSearchResults(prev => ({
            ...prev,
            [handoverIndex]: []
        }));
    };

    const saveBasicInfo = async (basicInfoData) => {
        setIsAssigning(true);
        try {
            if (!selectedManager.id) {
                toast.error("Please select a valid manager");
            }
            const finalReason = basicInfoData.reason === "other" 
            ? basicInfoData.customReason 
            : basicInfoData.reason;

            const response = await axios.post(
                `http://${strings.localhost}/api/offboarding/save/${companyId}/${selectedEmployee.id}/${selectedManager.id}/${employeeId}`,
                {
                    name: `${selectedEmployee.employeeFirstName} ${selectedEmployee.employeeLastName || ''}`,
                    department: basicInfoData.department,
                    deptId: basicInfoData.deptId,
                    lastWorkingDate: basicInfoData.lastDate,
                    reason: finalReason,
                    other: basicInfoData.other,
                    date: new Date().toISOString(),
                    applied: true,
                    reportingManagerName: selectedManager.id,
                    completionStatus: true,
                    status: true
                }
            );
            setOffboardingId(response.data.id);
            fetchOffboardingData();
            toast.success("Offboarding created successfully");
            return response.data;
        } catch (error) {
            if (error.response && error.response.data && error.response.data.details === "Employee Has Applied") {
                throw new Error("This employee has already applied for offboarding");
            }
            toast.error('Error saving basic info:', error);
            throw error;
        } finally {
            setIsAssigning(false);
        }
    };

    const saveExitInterview = async () => {
        try {
            console.log("Offboarding ID:", offboardingId);
            console.log("Selected Employee ID:", selectedEmployee?.id);
            if (!offboardingId || !selectedEmployee?.id) {
                throw new Error("Missing required IDs for exit interview");
            }
            const exitInterviewData = {
                interviewDate: formData.exitInterview.interviewDate,
                lastDateOfWork: formData.basicInfo.lastDate,
                lengthOfService: parseFloat(formData.exitInterview.lengthOfService) || 0,
                name: `${selectedEmployee.employeeFirstName} ${selectedEmployee.employeeLastName || ''}`,
                reason: formData.basicInfo.reason,
                supervisorName: formData.exitInterview.supervisorName,
                title: formData.exitInterview.employeeTitle,
                employeeId: selectedEmployee.id,
                offBoardingId: offboardingId,
                assigned: true,
                status: false
            };

            console.log("Exit interview data: ", exitInterviewData); 
            const response = await axios.post(
                `http://${strings.localhost}/api/exit-interviews/employee/${selectedEmployee.id}/exitInterview/${offboardingId}`,
                exitInterviewData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("Exit Interview saved successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error saving exit interview:", error);
            toast.error(`Error saving exit interview: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
            throw error; 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsAssigning(true);

        try {
            console.log("Submitting form. Current step:", currentStep);
            if (currentStep === 1) {
                console.log("Saving basic info...");

                const basicInfoResponse = await saveBasicInfo(formData.basicInfo);
                console.log("Basic Info Response:", basicInfoResponse);
                if (basicInfoResponse && basicInfoResponse.id) {
                    setOffboardingId(basicInfoResponse.id); 
                    console.log("Offboarding ID set to:", basicInfoResponse.id);
                } else {
                    console.error("Offboarding ID not returned from saveBasicInfo.");
                    toast.error("Failed to get offboarding ID.");
                    return;
                }
                setCurrentStep(currentStep + 1); 
                toast.success("Basic info saved successfully!");
                return;
            }
            if (currentStep === 2) {
                console.log("Saving handovers...");

                if (!offboardingId) {
                    toast.error("Offboarding ID is missing.");
                    return;
                }

                if (!selectedEmployee.id) {
                    toast.error("Employee ID is missing.");
                    return;
                }

                const handoverPromises = formData.handovers.map(handover => {
                    if (!handover.employee.id) {
                        throw new Error("Please select a valid employee for all handovers.");
                    }

                    return axios.post(
                        `http://${strings.localhost}/api/knowledgeTransfer/save?offBoardingId=${offboardingId}&employeeById=${selectedEmployee.id}`,
                        [{
                            employeeToId: handover.employee.id,
                            title: handover.title,
                            description: handover.description,
                            completionStatus: false
                        }],
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                });
                await Promise.all(handoverPromises);
                setCurrentStep(currentStep + 1);
                toast.success("Handovers saved successfully!");
                return;
            }
            if (currentStep === 3) {
                setCurrentStep(4);
                return;
            }
            if (currentStep === 4) {
                console.log("Saving exit interview...");
                console.log("Offboarding ID before saving:", offboardingId);
                console.log("Selected Employee ID before saving:", selectedEmployee?.id);

                if (!offboardingId || !selectedEmployee.id) {
                    toast.error("Missing required IDs for exit interview");
                    return;
                }

                const exitInterviewData = {
                    interviewDate: formData.exitInterview.interviewDate,
                    lastDateOfWork: formData.basicInfo.lastDate,
                    lengthOfService: parseFloat(formData.exitInterview.lengthOfService) || 0,
                    name: `${selectedEmployee.employeeFirstName} ${selectedEmployee.employeeLastName || ''}`,
                    reason: formData.basicInfo.reason,
                    supervisorName: formData.exitInterview.supervisorName,
                    title: formData.exitInterview.employeeTitle,
                    employeeId: selectedEmployee.id,
                    offBoardingId: offboardingId,
                    assigned: true,
                    status: false
                };

                console.log("Exit interview data: ", exitInterviewData);
                const response = await axios.post(
                    `http://${strings.localhost}/api/exit-interviews/employee/${selectedEmployee.id}/exitInterview/${offboardingId}`,
                    exitInterviewData,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log("Exit Interview saved successfully:", response.data);
                toast.success("Exit Interview saved successfully!");
            }
            setFormData({
                basicInfo: { name: '', department: '', lastDate: '', reason: '', other: '', deptId: '' },
                handovers: [{
                    title: '',
                    responsiblePerson: '',
                    responsiblePersonId: '',
                    description: '',
                    employee: { id: '', employeeId: '', employeeFirstName: '', employeeLastName: '' }
                }],
                items: [{ id: 1, itemName: '', itemType: '', condition: '' }],
                exitInterview: {
                    interviewDate: '',
                    employeeTitle: '',
                    supervisorName: '',
                    supervisorTitle: '',
                    lengthOfService: '',
                    leavingReason: '',
                    resignationReasons: [],
                    resignationOtherReason: '',
                    laidOffReasons: [],
                    laidOffOtherReason: '',
                    otherReason: '',
                    feedback: ''
                }
            });
            setSelectedEmployee({
                id: '',
                employeeId: '',
                employeeFirstName: '',
                employeeLastName: ''
            });

            setSelectedManager({
                id: '',
                employeeId: '',
                employeeFirstName: '',
                employeeLastName: ''
            });
            toast.success('Offboarding process started successfully!');
            onClose();
        } catch (error) {
            if (error.message === "This employee has already applied for offboarding") {
                toast.error(error.message);
            } else {
                toast.error(`Error submitting form: ${error.message}`);
            }
        } finally {
            setIsAssigning(false); 
        }
    };



    return (
        <div className='coreContainer'>
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h2>{editingRecord?.isCompleteMode ? 'Complete Offboarding Process' : 'New Offboarding Process'}</h2>
                        <button className="button-close" onClick={() => {
                            onClose();
                            setCurrentStep(1);
                        }}>×</button>
                    </div>

                    <div className="step-indicator1">
                        <div className="step-container">
                            <div
                                className={`steps ${currentStep > 1 ? 'completed' : 'active'}`}
                                onClick={() => setCurrentStep(1)}
                            >
                                {currentStep > 1 ? '✅' : '1'}
                            </div>
                            <div className="step-name">Basic Info</div>
                        </div>

                        <div className="steps-line"></div>

                        <div className="step-container">
                            <div
                                className={`steps ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(2)}
                            >
                                {currentStep > 2 ? '✅' : '2'}
                            </div>
                            <div className="step-name">Handover</div>
                        </div>

                        <div className="steps-line"></div>

                        <div className="step-container">
                            <div
                                className={`steps ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(3)}
                            >
                                {currentStep > 3 ? '✅' : '3'}
                            </div>
                            <div className="step-name">Assets</div>
                        </div>

                        <div className="steps-line"></div>

                        <div className="step-container">
                            <div
                                className={`steps ${currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(4)}
                            >
                                {currentStep > 4 ? '✅' : '4'}
                            </div>
                            <div className="step-name">Exit Interview</div>
                        </div>
                    </div>

                    {currentStep === 1 && (
                        <BasicInfoStep
                            companyId={companyId}
                            formData={formData}
                            setFormData={setFormData}
                            selectedEmployee={selectedEmployee}
                            setSelectedEmployee={setSelectedEmployee}
                            selectedManager={selectedManager}
                            setSelectedManager={setSelectedManager}
                            dropdownData={dropdownData}
                            setShowOtherReason={setShowOtherReason}
                            handleDateChange={handleDateChange}
                            handleBasicInfoChange={handleBasicInfoChange}
                            handleEmployeeSelect={handleEmployeeSelect}
                            handleEmployeeNameChange={handleEmployeeNameChange}
                            handleSelectEmployee={handleSelectEmployee}
                            handleManagerNameChange={handleManagerNameChange}
                            handleSelectManager={handleSelectManager}
                            employeeError={employeeError}
                            setEmployeeError={setEmployeeError}
                            managerError={managerError}
                            setManagerError={setManagerError}
                            employeeSearchResults={employeeSearchResults}
                            setEmployeeSearchResults={setEmployeeSearchResults}
                            managerSearchResults={managerSearchResults}
                            setManagerSearchResults={setManagerSearchResults}
                            onClose={onClose}
                            setCurrentStep={setCurrentStep}
                            currentStep={currentStep}
                            offboardingId={offboardingId}
                            setOffboardingId={setOffboardingId}
                            handleNextStep={handleNextStep}
                            isReadOnly={editingRecord?.isCompleteMode}
                            isAssigning={isAssigning}
                            setIsAssigning={setIsAssigning}
                        />
                    )}

                    {currentStep === 2 && (
                        <HandoverStep
                            formData={formData}
                            setFormData={setFormData}
                            companyId={companyId}
                            error={error}
                            setError={setError}
                            searchResults={searchResults}
                            setSearchResults={setSearchResults}
                            currentStep={currentStep}
                            handleNextStep={handleNextStep}
                            setCurrentStep={setCurrentStep}
                            handleHandoverChange={handleHandoverChange}
                            handleHandoverEmployeeSelect={handleHandoverEmployeeSelect}
                            handleHandoverEmployeeNameChange={handleHandoverEmployeeNameChange}
                            handleSelectHandoverEmployee={handleSelectHandoverEmployee}
                            isAssigning={isAssigning}
                            setIsAssigning={setIsAssigning}
                        />
                    )}
                    {currentStep === 3 && (
                        <AssetStep
                            employeeId={selectedEmployee.id}
                            setCurrentStep={setCurrentStep}
                            handleNextStep={handleNextStep}
                        />
                    )}
                    {currentStep === 4 && (
                        <ExitInterviewStep
                            formData={formData}
                            setFormData={setFormData}
                            handleBasicInfoChange={handleBasicInfoChange}
                            handleDateChange={handleDateChange}
                            // offboardingId={offboardingId}
                            // setOffboardingId={setOffboardingId}
                            setCurrentStep={setCurrentStep}
                            handleSubmit={handleSubmit}
                            isAssigning={isAssigning}
                            setIsAssigning={setIsAssigning}
                        />
                    )}


                </div>
            </div>
        </div>
    );
};

export default OffboardingForm;