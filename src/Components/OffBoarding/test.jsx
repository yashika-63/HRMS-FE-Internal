import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash, FaTimes, FaCheck, FaEye, FaUser, FaIdCard, FaGlobe, FaCalendarAlt, FaTasks, FaChalkboardTeacher, FaBuilding, FaUserTie, FaStickyNote, FaPlus, FaMinus, FaFileUpload, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFileAlt } from "react-icons/fa";
import { faTrashAlt, faEdit, faUserPlus, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import '../CommonCss/Sidebar.css';
import './AllTrainings.css';
import { fetchDataByKey, showToast } from '../../Api.jsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { strings } from "../../string.jsx";

const AllTrainings = () => {
    const companyId = localStorage.getItem("companyId");
    const employeeId = localStorage.getItem("employeeId");
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewType, setPreviewType] = useState('');
    const [previewFilename, setPreviewFilename] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [selectAll, setSelectAll] = useState(false);

    const [formData, setFormData] = useState({
        heading: '',
        type: 'Safety',
        description: '',
        region: '',
        department: '',
        question: [],
        documents: [],
        regionId: '',
        date: new Date().toISOString()
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentTrainingId, setCurrentTrainingId] = useState(null);
    const [viewMode, setViewMode] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [newDocument, setNewDocument] = useState({ name: '', file: null });
    const [trainings, setTrainings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dropdownData, setDropdownData] = useState({
        region: []
    });
    const [dropdownDesignation, setDropdownDesignation] = useState({
        designation: []
    });
    const [dropdownDepartment, setDropdownDepartment] = useState({
        department: []
    });

    const [showAssignPopup, setShowAssignPopup] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState({
        id: '',
        employeeId: '',
        trainingId: '',
        description: '',
        employeeFirstName: '',
        employeeLastName: '',
        heading: ''
    });
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [hasPendingDocument, setHasPendingDocument] = useState(false);
    const [hasPendingQuestion, setHasPendingQuestion] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        description: '',
        heading: '',
        regionId: '',
        departmentId: '',
        page: 0,
        size: 10,
        sortBy: 'id',
        direction: 'asc'
    });

    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 0
    });

    const [selectedFilters, setSelectedFilters] = useState({
        regionId: '',
        departmentId: '',
        designationId: ''
    });
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    const handleAssign = (trainingId, heading) => {
        setSelectedEmployee(prev => ({
            ...prev,
            trainingId: trainingId,
            heading: heading
        }));
        toggleDropdown(null);
        setShowAssignPopup(true);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSelectedFilters(prev => ({
            ...prev,
            [name]: value
        }));

        setSelectAll(false);
        setSelectedEmployees([]);
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
                    `http://localhost/employees/EmployeeById/${value}?companyId=${companyId}`
                );
                const employee = response.data;
                setSelectedEmployee(prev => ({
                    ...prev,
                    id: employee.id,
                    employeeFirstName: employee.firstName,
                    employeeLastName: employee.lastName || ''
                }));
                setError(null);
            } catch (error) {
                console.error('Error fetching employee:', error);
                setError('Employee not found');
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
            setError(null);
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
                setSearchResults(response.data);
                setError(null);
            } catch (error) {
                console.error('Error searching employees:', error);
                setError('Error searching employees');
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
            setError(null);
        }
    };

    const handleSelectEmployee = (employee) => {
        const mappedEmployee = {
            id: employee.id,
            employee: {
                id: employee.id,
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName || ''
            },
            department: employee.department || 'N/A',
            departmentId: employee.deptId || '',
            designation: employee.designation || 'N/A',
            designationId: employee.designationId || '',
            region: employee.region || 'N/A',
            regionId: employee.regionId || '',
            employeeType: employee.employeeType || 'N/A',
            workCategory: employee.workCategory || 'N/A'
        };

        const isAlreadyAdded = filteredEmployees.some(emp => emp.id === employee.id);

        if (!isAlreadyAdded) {
            setFilteredEmployees(prev => [...prev, mappedEmployee]);
        }

        if (!selectedEmployees.includes(employee.id)) {
            setSelectedEmployees(prev => [...prev, employee.id]);
        }
        setSelectedEmployee({
            employeeId: employee.id,
            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName || '',
            trainingId: selectedEmployee.trainingId,
            heading: selectedEmployee.heading
        });

        setSearchResults([]);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedEmployees([]);
        } else {
            const allEmployeeIds = filteredEmployees.map(emp => emp.id);
            setSelectedEmployees(allEmployeeIds);
        }
        setSelectAll(!selectAll);
    };

    const handleEmployeeSelection = (employeeId) => {
        setSelectedEmployees(prev => {
            const newSelected = prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId];

            setSelectAll(newSelected.length === filteredEmployees.length);

            return newSelected;
        });
    };

    const fetchFilteredEmployees = async () => {
        try {
            const { regionId, departmentId, designationId } = selectedFilters;
            let url = `http://${strings.localhost}/employees/filter?companyId=${companyId}`;

            if (regionId) url += `&regionId=${regionId}`;
            if (departmentId) url += `&departmentId=${departmentId}`;
            if (designationId) url += `&designationId=${designationId}`;

            if (!regionId && !departmentId && !designationId) {
                setFilteredEmployees([]);
                return;
            }

            const response = await axios.get(url);

            const mappedEmployees = response.data.map(emp => ({
                id: emp.id,
                employee: {
                    id: emp.employee?.id,
                    employeeId: emp.employee?.employeeId,
                    firstName: emp.employee?.firstName,
                    lastName: emp.employee?.lastName,
                    designation: emp.designation,
                    designationId: emp.designationId,
                },
                department: emp.department,
                departmentId: emp.deptId,
                region: emp.region,
                regionId: emp.region_id,
                employeeType: emp.employeeType,
                workCategory: emp.workCategory
            }));

            setFilteredEmployees(mappedEmployees);
        } catch (error) {
            console.error('Error fetching filtered employees:', error);
            setFilteredEmployees([]);
        }
    };

    useEffect(() => {
        fetchFilteredEmployees();
    }, [selectedFilters.regionId, selectedFilters.departmentId, selectedFilters.designationId]);

    useEffect(() => {
        if (employeeSearch.trim()) {
            const searchTerm = employeeSearch.toLowerCase();
            setFilteredEmployees(prev =>
                prev.filter(emp =>
                    emp.employee?.firstName?.toLowerCase().includes(searchTerm) ||
                    emp.employee?.lastName?.toLowerCase().includes(searchTerm) ||
                    emp.employee?.employeeId?.toLowerCase().includes(searchTerm)
                )
            );

        } else {
            fetchFilteredEmployees();
        }
    }, [employeeSearch]);

    const handleAssignTraining = async () => {
        setIsAssigning(true);
        try {
            const employeeIds = selectedEmployees.map(id => {
                const employee = filteredEmployees.find(emp => emp.id === id);
                return employee?.employee?.id;
            }).filter(id => id);

            if (employeeIds.length === 0) {
                showToast('No valid employees selected');
                return;
            }

            const employeeIdsParam = employeeIds.join(',');
            const currentDate = new Date().toISOString().split('T')[0];

            await axios.post(
                `http://${strings.localhost}/api/assign-trainings/assign`,
                null,
                {
                    params: {
                        employeeIds: employeeIdsParam,
                        trainingId: selectedEmployee.trainingId,
                        assignedById: employeeId,
                        compId: companyId,
                        assignDate: currentDate,
                        status: true,
                        expiryStatus: false,
                        completionStatus: false
                    }
                }
            );

            showToast('Training assigned successfully');
            setShowAssignPopup(false);
            setSelectedEmployees([]);
            setSelectAll(false);
        } catch (error) {
            console.error('Error assigning training:', error);
            showToast('Failed to assign training');
        } finally {
            setIsAssigning(false);
        }
    };


    const fetchTrainings = async (page) => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `http://${strings.localhost}/api/training/active/${companyId}?page=${page}&size=${filters.size}`
            );
            const transformedData = response.data.content.map(item => ({
                id: item.id,
                heading: item.heading || 'No Heading',
                type: item.type === 1 ? "Mandatory" : "Non-Mandatory",
                region: item.region || 'No Region',
                department: item.department || 'No Department',
                date: item.date || item.createdAt || new Date().toISOString(),
                status: item.status,
                description: item.description || '',
                question: item.questions || [],
                documents: item.documents || []
            }));

            setTrainings(transformedData);
            setPagination({
                totalItems: response.data.totalElements,
                totalPages: response.data.totalPages,
                currentPage: response.data.number
            });
        } catch (error) {
            console.error('Fetch Error:', error);
            setTrainings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNew = () => {
        setIsPopupOpen(true);
        setCurrentStep(1);
        setIsEditMode(false);
        setViewMode(false);
        setFormData({
            heading: '',
            type: '',
            description: '',
            region: '',
            question: [],
            documents: [],
            date: new Date().toISOString()
        });
    };

    const handleEdit = async (training) => {
        toggleDropdown(null);
        setIsPopupOpen(true);
        setCurrentStep(1);
        setIsEditMode(true);
        setViewMode(false);
        setCurrentTrainingId(training.id);

        try {
            const trainingResponse = await axios.get(
                `http://${strings.localhost}/api/training/${training.id}`
            );
            const trainingData = trainingResponse.data;

            const typeValue = training.type === "Mandatory" ? "Safety" : "Orientation";

            const selectedRegion = dropdownData.region.find(
                r => r.data === training.region
            );

            const selectedDepartment = dropdownDepartment.department.find(
                r => r.data === training.department
            );

            // First set the basic form data
            const formDataUpdate = {
                heading: training.heading || '',
                type: typeValue,
                description: training.description || '',
                region: training.region || '',
                department: training.department || '',
                question: [], // Initialize as empty array
                documents: [], // Initialize as empty array
                regionId: selectedRegion ? selectedRegion.masterId : '',
                departmentId: selectedDepartment ? selectedDepartment.masterId : '',
                date: trainingData.date || trainingData.createdAt || new Date().toISOString(),
                companyId: parseInt(companyId),
                createdByEmployeeId: parseInt(employeeId),
            };

            setFormData(formDataUpdate);

            // Then fetch questions separately
            try {
                const questionsResponse = await axios.get(`http://${strings.localhost}/api/acknowledges/training/${training.id}`);
                let questions = [];

                if (questionsResponse.data && Array.isArray(questionsResponse.data)) {
                    questions = questionsResponse.data.map(q => ({
                        id: q.id,
                        question: q.question,
                        rating: q.rating || 0,
                        termAndCondition: q.termAndCondition || false
                    }));
                }

                // Fetch documents separately
                const documentsResponse = await axios.get(`http://${strings.localhost}/api/documentTraining/view/Training/${training.id}`);
                const documents = documentsResponse.data && Array.isArray(documentsResponse.data)
                    ? documentsResponse.data
                    : [];

                // Update formData with both questions and documents
                setFormData(prev => ({
                    ...prev,
                    question: questions,
                    documents: documents
                }));

            } catch (error) {
                console.error('Error fetching questions or documents:', error);
                // If error, use whatever questions we have from the training object
                setFormData(prev => ({
                    ...prev,
                    question: training.question || [],
                    documents: training.documents || []
                }));
            }
        } catch (error) {
            console.error('Error setting edit data:', error);
            toast.error('Failed to load training for editing');

            // Fallback to basic data if API fails
            const typeValue = training.type === "Mandatory" ? "Safety" : "Orientation";
            const selectedRegion = dropdownData.region.find(
                r => r.data === training.region
            );

            const selectedDepartment = dropdownDepartment.department.find(
                r => r.data === training.department
            );

            setFormData({
                heading: training.heading || '',
                type: typeValue,
                description: training.description || '',
                region: training.region || '',
                department: training.department || '',
                question: training.question || [],
                documents: training.documents || [],
                regionId: selectedRegion ? selectedRegion.masterId : '',
                departmentId: selectedDepartment ? selectedDepartment.masterId : '',
                date: training.date || new Date().toISOString(),
                companyId: parseInt(companyId),
                createdByEmployeeId: parseInt(employeeId),
            });
        }
    };

    const handleView = async (training) => {
        try {
            toggleDropdown(null);
            setIsPopupOpen(true);
            setCurrentStep(1);
            setIsEditMode(false);
            setViewMode(true);
            setCurrentTrainingId(training.id);

            const typeValue = training.type === "Mandatory" ? "Safety" : "Orientation";

            const selectedRegion = dropdownData.region.find(
                r => r.data === training.region
            );

            const selectedDepartment = dropdownDepartment.department.find(
                r => r.data === training.department
            );

            const formDataUpdate = {
                heading: training.heading || '',
                type: typeValue,
                description: training.description || '',
                region: training.region || '',
                department: training.department || '',
                question: [],
                documents: [],
                regionId: selectedRegion ? selectedRegion.masterId : '',
                departmentId: selectedDepartment ? selectedDepartment.masterId : ''
            };
            setFormData(formDataUpdate);
            try {
                const questionsResponse = await axios.get(`http://${strings.localhost}/api/acknowledges/training/${training.id}`);
                const questions = questionsResponse.data && Array.isArray(questionsResponse.data)
                    ? questionsResponse.data.map(q => q.question || q)
                    : [];

                const documentsResponse = await axios.get(`http://${strings.localhost}/api/documentTraining/view/Training/${training.id}`);
                const documents = documentsResponse.data && Array.isArray(documentsResponse.data)
                    ? documentsResponse.data
                    : [];
                setFormData(prev => ({
                    ...prev,
                    question: Array.isArray(questions) ?
                        questions.map(q => q.question || q) : [],
                    documents: Array.isArray(documents) ? documents : []
                }));

            } catch (error) {
                console.error('Error fetching questions or documents:', error);
                // Fallback to whatever data we have in the training object
                setFormData(prev => ({
                    ...prev,
                    question: training.question || [],
                    documents: training.documents || []
                }));
            }
        } catch (error) {
            console.error('Error setting view data:', error);
        }
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setFormData({
            heading: '',
            type: '',
            description: '',
            region: '',
            question: [],
            documents: []
        });
        setViewMode(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuestionChange = (e) => {
        setNewQuestion(e.target.value);
        setHasPendingQuestion(e.target.value.trim() !== '');
    };

    const handleAddQuestion = () => {
        if (newQuestion.trim()) {
            setFormData(prev => ({
                ...prev,
                question: [...prev.question, {
                    question: newQuestion.trim(),
                    rating: 0,
                    termAndCondition: false
                }]
            }));
            setNewQuestion('');
            setHasPendingQuestion(false);
        }
    };

    const handleRemoveQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            question: prev.question.filter((_, i) => i !== index)
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewDocument({ ...newDocument, file });
            setHasPendingDocument(true);
        }
    };

    const handleRemoveDocument = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await axios.delete(`http://${strings.localhost}/api/documentTraining/delete/${documentId}`);
            setFormData(prev => ({
                ...prev,
                documents: prev.documents.filter(doc => doc.id !== documentId)
            }));
            toast.success('Document deleted successfully');
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document. Please try again.');
        }
    };

    const handleSaveBasicInfo = async () => {
        try {
            let response;
            if (isEditMode) {
                const existingTraining = await axios.get(
                    `http://${strings.localhost}/api/training/${currentTrainingId}`
                );

                const payload = {
                    ...existingTraining.data,
                    heading: formData.heading,
                    type: formData.type === 'Safety' ? 1 : 0,
                    description: formData.description,
                    region: formData.region,
                    regionId: formData.regionId,
                    department: formData.department,
                    departmentId: formData.deptId,
                    companyId: parseInt(companyId),
                    createdByEmployeeId: parseInt(employeeId),
                    createdAt: formData.date || existingTraining.data.createdAt || new Date().toISOString(),
                    status: true,
                };

                response = await axios.put(
                    `http://${strings.localhost}/api/training/${currentTrainingId}`,
                    payload
                );

                setTrainings(prev => prev.map(ind =>
                    ind.id === currentTrainingId ? {
                        ...ind,
                        heading: formData.heading,
                        type: formData.type === 'Safety' ? "Mandatory" : "Non-Mandatory",
                        description: formData.description,
                        department: formData.department,
                        region: formData.region,
                        regionId: formData.regionId,
                        companyId: parseInt(companyId),
                        createdByEmployeeId: parseInt(employeeId),
                        date: formData.date || new Date().toISOString(),
                    } : ind
                ));
            } else {
                response = await axios.post(
                    `http://${strings.localhost}/api/training/save-with-employee/${companyId}/${employeeId}`,
                    payload
                );

                if (!response.data.id) {
                    throw new Error("No training ID returned from server");
                }

                setCurrentTrainingId(response.data.id);
                toast.success('New training created successfully!');

                setTrainings(prev => [...prev, {
                    id: response.data.id,
                    heading: formData.heading,
                    type: formData.type === 'Safety' ? "Mandatory" : "Non-Mandatory",
                    region: formData.region,
                    regionId: formData.regionId,
                    department: formData.department,
                    date: formData.date || new Date().toISOString(),
                    description: formData.description,
                    question: formData.question,
                    documents: formData.documents,
                    status: true,
                    companyId: parseInt(companyId),
                    createdByEmployeeId: parseInt(employeeId),
                }]);
            }

            setCurrentStep(2);
            return response.data.id;
        } catch (error) {
            console.error('Error saving basic info:', error);
            toast.error(`Failed to save training details: ${error.message}`);
            throw error;
        }
    };


    const handleSaveQuestions = async () => {
        try {
            if (!currentTrainingId) {
                throw new Error("No training ID available");
            }

            if (isEditMode) {
                try {
                    await axios.delete(`http://${strings.localhost}/api/acknowledges/training/${currentTrainingId}`);
                } catch (error) {
                    console.error('Error deleting existing questions:', error);
                }
            }

            if (formData.question.length > 0) {
                const acknowledges = formData.question.map(q => ({
                    question: typeof q === 'string' ? q : q.question,
                    trainingId: currentTrainingId,
                    rating: typeof q === 'string' ? 0 : q.rating || 0,
                    termAndCondition: typeof q === 'string' ? false : q.termAndCondition || false
                }));

                const response = await axios.post(
                    `http://${strings.localhost}/api/acknowledges/bulk/${currentTrainingId}`,
                    acknowledges
                );
                console.log('Saved acknowledges:', response.data);
            } else {
                toast.warning('No questions added to save');
            }

            setCurrentStep(3);
        } catch (error) {
            console.error('Error saving questions:', error);
            showToast('Failed to save questions. Please try again.', 'error');
        }
    };

    const handleAddDocument = async () => {
        if (!newDocument.file) {
            toast.error('Please select a file to upload');
            return;
        }
        // Check file size (10MB limit)
        if (newDocument.file.size > 10 * 1024 * 1024) {
            toast.warning('File size should be less than 10MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', newDocument.file);
        formData.append('traininngId', currentTrainingId);

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/documentTraining/${currentTrainingId}/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            const newDoc = response.data;

            setFormData(prev => ({
                ...prev,
                documents: [...prev.documents, {
                    id: newDoc.id,
                    name: newDocument.file.name,
                    url: newDoc.filePath || newDoc.url
                }]
            }));
            await fetchDocumentsForInduction(currentTrainingId);

            setNewDocument({ name: '', file: null });
            setHasPendingDocument(false);
            showToast('Document uploaded successfully!', 'success');

        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Document upload failed: ${error.message}`);
        }
    };

    const handleSaveNext = async () => {
        if (hasPendingDocument) {
            toast.error('Please upload the selected document before saving');
            return;
        }

        if (hasPendingQuestion) {
            toast.error('Please add the typed question before saving');
            return;
        }

        try {
            if (currentStep < 3) {
                if (currentStep === 1) {
                    const { heading, type, description, region, department } = formData;

                    if (!heading.trim() || !type.trim() || !description.trim() || !region.trim() || !department.trim()) {
                        toast.warn('Please fill in all reuired fields', 'warn');
                        return;
                    }
                    const trainingId = await handleSaveBasicInfo();
                    setCurrentTrainingId(trainingId);
                    setCurrentStep(2);
                } else if (currentStep === 2) {
                    if (!currentTrainingId) {
                        throw new Error("No training ID available for saving questions");
                    }
                    await handleSaveQuestions();
                    setCurrentStep(3);
                    toast.success('Proceeding to documents step');
                }
            } else {
                await fetchTrainings();
                handleClosePopup();
                toast.success('Training process completed successfully!');
                fetchTrainings();
            }
        } catch (error) {
            console.error('Error in save process:', error);
            toast.error(`Save failed: ${error.message}`);
        }
    };

    const toggleDropdown = (id) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown')) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const regions = await fetchDataByKey('region');
                setDropdownData({
                    region: regions
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        const fetchDropdownDesignation = async () => {
            try {
                const designations = await fetchDataByKey('designation');
                setDropdownDesignation({
                    designation: designations
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownDesignation();
    }, []);

    useEffect(() => {
        const fetchDropdownDepartment = async () => {
            try {
                const departments = await fetchDataByKey('department');
                setDropdownDepartment({
                    department: departments
                });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownDepartment();
    }, []);


    const getFileIcon = (type) => {
        if (!type) return <FaFileAlt className="file-icon" />;

        const typeStr = String(type || '');
        const extension = typeStr.includes('.')
            ? typeStr.split('.').pop().toLowerCase()
            : typeStr.toLowerCase();

        switch (extension) {
            case 'pdf': return <FaFilePdf className="file-icon" />;
            case 'doc':
            case 'docx': return <FaFileWord className="file-icon" />;
            case 'xls':
            case 'xlsx': return <FaFileExcel className="file-icon" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return <FaFileImage className="file-icon" />;
            default: return <FaFileAlt className="file-icon" />;
        }
    };

    const steps = [
        {
            title: "Basic Information",
            fields: [
                { name: "heading", label: "Heading", type: "text", required: true },
                { name: "type", label: "Type", type: "text", required: true },
                { name: "description", label: "Description", type: "text", required: true },
                {
                    name: "region",
                    label: "Region",
                    type: "select",
                    options: ["North", "South", "East", "West"],
                    required: true
                }
            ]
        },
        {
            title: "Training Details",
            fields: []
        },
        {
            title: "Documents",
            fields: []
        }
    ];

    const fetchFilteredTrainings = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                ...filters,
                companyId: companyId
            });

            const response = await axios.get(
                `http://${strings.localhost}/api/training/search?${params.toString()}`
            );

            const transformedData = response.data.content.map(item => ({
                id: item.id,
                heading: item.heading || 'No Heading',
                type: item.type === 1 ? "Mandatory" : "Non-Mandatory",
                region: item.region || 'No Region',
                department: item.department || 'No Department',
                date: item.date || item.createdAt || new Date().toISOString(),
                status: item.status,
                description: item.description || '',
                question: item.questions || [],
                documents: item.documents || []
            }));

            setTrainings(transformedData);
            setPagination({
                totalItems: response.data.totalElements,
                totalPages: response.data.totalPages,
                currentPage: response.data.number
            });
        } catch (error) {
            console.error('Filter Error:', error);
            setTrainings([]);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSearchInputChange = (event) => {
        setFilters(prev => ({
            ...prev,
            heading: event.target.value,
            page: 0
        }))
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
            region: e.target.value,
            regionId: selectedRegion ? selectedRegion.masterId : '',
            page: 0
        }));

        setFormData(prev => ({
            ...prev,
            region: e.target.value,
            regionId: selectedRegion ? selectedRegion.masterId : '',
        }));
    };

    const handleDepartmentChange = (e) => {
        const selectedDepartment = dropdownDepartment.department.find(
            r => r.data === e.target.value
        );

        const deptId = selectedDepartment ? selectedDepartment.masterId : '';
        setFormData(prev => ({
            ...prev,
            department: e.target.value,
            deptId
        }));
        setFilters(prev => ({
            ...prev,
            departmentId: deptId,
            page: 0
        }));
    };

    const areFiltersApplied = () => {
        const { heading, regionId, departmentId, year } = filters;
        return heading || regionId || departmentId || year !== new Date().getFullYear().toString();
    };

    const handlePageChange = (newPage) => {
        if (newPage < 0 || newPage >= pagination.totalPages) return;  // Don't allow out-of-bounds page changes
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const PaginationControls = () => (
        <div className="form-controls">
            <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
                type="button"
                className='pagination-btn'
            >
                Previous
            </button>
            <span>
                {pagination.currentPage + 1} of {pagination.totalPages}
            </span>
            <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
                type="button"
                className='pagination-btn'
            >
                Next
            </button>
        </div>
    );

    useEffect(() => {
        // Check if filters are applied, otherwise fetch active training data
        if (areFiltersApplied()) {
            fetchFilteredTrainings();
        } else {
            fetchTrainings(filters.page); // Call active API with page
        }
    }, [filters, companyId]);

    const generateYearRange = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 3; i > 0; i--) {
            years.push(currentYear - i);
        }
        years.push(currentYear);
        return years;
    };

    const fetchDocumentsForInduction = async () => {
        if (!currentTrainingId) return;

        try {
            const response = await axios.get(`http://${strings.localhost}/api/documentTraining/view/Training/${currentTrainingId}`);
            const docs = response.data;

            if (!Array.isArray(docs)) {
                toast.error("Unexpected document response format");
                return;
            }

            setFormData(prev => ({
                ...prev,
                documents: docs.map(doc => ({
                    id: doc.documentId || doc.id,
                    documentId: doc.documentId,
                    name: doc.name || doc.fileName,
                    fileName: doc.fileName,
                    url: doc.filePath || doc.url
                }))
            }));
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast.error("Failed to load training documents");
        }
    };

    const handleViewDocument = async (id, doc) => {
        const fileName = doc.fileName || "document";

        try {
            const response = await axios.get(`http://${strings.localhost}/api/documentTraining/view/${doc.documentId}`, {
                responseType: 'blob',
            });

            const extension = fileName.split('.').pop().toLowerCase();
            const fileType = extension === 'pdf'
                ? 'pdf'
                : ['jpg', 'jpeg', 'png'].includes(extension)
                    ? 'image'
                    : 'unsupported';

            const fileBlob = new Blob([response.data], {
                type: response.headers['content-type'] || (fileType === 'pdf' ? 'application/pdf' : 'application/octet-stream'),
            });

            const fileUrl = URL.createObjectURL(fileBlob);

            setPreviewType(fileType);
            setPreviewUrl(fileUrl);
            setPreviewFilename(fileName);
            setShowPreviewModal(true);
        } catch (error) {
            console.error("Error fetching document:", error);
            showToast("Failed to load document preview", "error");
        }
    };

    const editDropdownMenu = (training) => (
        <div className="dropdown">
            <button className="dots-button" >
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content" >
                <button className="dropdown-item" onClick={() => handleEdit(training)} >
                    <FaEdit /> Update
                </button>
                <div>
                    <button onClick={() => handleAssign(training.id, training.heading)}>
                        <FontAwesomeIcon className="ml-2" icon={faUserPlus} />Assign</button>
                </div>
                <button onClick={() => handleView(training)} >
                    <FaEye /> View
                </button>
            </div>
        </div>
    );

    // if (isLoading) {
    //     return <div className='coreContainer'>Loading...</div>;
    // }

    return (
        <div className='coreContainer'>
            <h1 className="title">List of all active Trainings</h1>

            <div className="filters">
                <div className="search-bar">
                    <input
                        placeholder="Search by heading or ID..."
                        value={filters.heading}
                        onChange={handleSearchInputChange}
                    />
                    <FaSearch className="search-icon" />
                </div>

                <select value={filters.year} onChange={handleYearChange}>
                    <option value="">All Years</option>
                    {generateYearRange().map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <select value={formData.region} onChange={handleRegionChange}>
                    <option value="">All Regions</option>
                    {dropdownData.region && dropdownData.region.length > 0 ? (
                        dropdownData.region.map(option => (
                            <option key={option.masterId} value={option.data}>
                                {option.data}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>Training Region Not available</option>
                    )}
                </select>

                <select value={formData.department} onChange={handleDepartmentChange}>
                    <option value="">Departments</option>
                    {dropdownDepartment.department && dropdownDepartment.department.length > 0 ? (
                        dropdownDepartment.department.map(option => (
                            <option key={option.masterId} value={option.data}>
                                {option.data}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>Training department Not available</option>
                    )}
                </select>

                <button type='button' className='btn' onClick={handleAddNew}>Add New</button>
            </div>

            {isPopupOpen && (
                <div className="popup-overlayin">
                    <div className={`induction-popup ${viewMode ? 'view-mode-popup' : ''}`}>
                        <div className="popup-header">
                            <h3>{viewMode ? 'View Training' : (isEditMode ? 'Edit Training' : 'Add New Training')}</h3>
                            <button className="close-popup" onClick={handleClosePopup}>
                                <FaTimes />
                            </button>
                        </div>

                        {!viewMode && (
                            <div className="step-indicator1">
                                <div
                                    className={`steps ${currentStep > 1 ? 'completed' : 'active'}`}
                                    onClick={() => setCurrentStep(1)}
                                >
                                    {currentStep > 1 ? '✅' : '1'}
                                </div>
                                <div className="steps-line"></div>
                                <div
                                    className={`steps ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}
                                    onClick={() => setCurrentStep(2)}
                                >
                                    {currentStep > 2 ? '✅' : '2'}
                                </div>
                                <div className="steps-line"></div>
                                <div
                                    className={`steps ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}
                                    onClick={() => setCurrentStep(3)}
                                >
                                    {currentStep > 3 ? '✅' : '3'}
                                </div>
                            </div>
                        )}

                        <div className="popup-contentin">
                            <form>
                                <div className="form-fields">
                                    {/* Show all steps in view mode, or current step in edit/add mode */}
                                    {(viewMode || currentStep === 1) && (
                                        <div className="popup-group">
                                            <label>
                                                Heading
                                                {!viewMode && <span className="required-marker">*</span>}
                                            </label>
                                            <input
                                                type="text"
                                                name="heading"
                                                value={formData.heading}
                                                onChange={handleInputChange}
                                                required
                                                readOnly={viewMode}
                                                className={viewMode ? 'read-only-input' : ''}
                                                placeholder={viewMode ? '' : "Enter Training heading"}
                                            />

                                            <div className="input-row">
                                                <div className="half-width">
                                                    <label htmlFor="region">Region{!viewMode && <span className="required">*</span>}</label>
                                                    {viewMode ? (
                                                        <input
                                                            type="text"
                                                            value={formData.region}
                                                            readOnly
                                                            className="read-only-input"
                                                        />
                                                    ) : (
                                                        <select
                                                            name="region"
                                                            value={formData.region}
                                                            className="selectIM"
                                                            onChange={(e) => {
                                                                const selectedRegion = dropdownData.region.find(
                                                                    r => r.data === e.target.value
                                                                );
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    region: e.target.value,
                                                                    regionId: selectedRegion ? selectedRegion.masterId : ''
                                                                }));
                                                            }}
                                                            required
                                                            disabled={isLoading}
                                                        >
                                                            <option value="">Select Region</option>
                                                            {dropdownData.region && dropdownData.region.length > 0 ? (
                                                                dropdownData.region.map(option => (
                                                                    <option key={option.masterId} value={option.data}>
                                                                        {option.data}
                                                                    </option>
                                                                ))
                                                            ) : (
                                                                <option value="" disabled>Training Region Not available</option>
                                                            )}
                                                        </select>
                                                    )}
                                                </div>

                                                <div className="half-width">
                                                    <label htmlFor="department">Department{!viewMode && <span className="required">*</span>}</label>
                                                    {viewMode ? (
                                                        <input
                                                            type="text"
                                                            value={formData.department}
                                                            readOnly
                                                            className="read-only-input"
                                                        />
                                                    ) : (
                                                        <select
                                                            name="department"
                                                            value={formData.department}
                                                            className="selectIM"
                                                            onChange={(e) => {
                                                                const selectedDepartment = dropdownDepartment.department.find(
                                                                    r => r.data === e.target.value
                                                                );
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    department: e.target.value,
                                                                    deptId: selectedDepartment ? selectedDepartment.masterId : ''
                                                                }));
                                                            }}
                                                            required
                                                            disabled={isLoading}
                                                        >
                                                            <option value="">Select Department</option>
                                                            {dropdownDepartment.department && dropdownDepartment.department.length > 0 ? (
                                                                dropdownDepartment.department.map(option => (
                                                                    <option key={option.masterId} value={option.data}>
                                                                        {option.data}
                                                                    </option>
                                                                ))
                                                            ) : (
                                                                <option value="" disabled>Training Department Not available</option>
                                                            )}
                                                        </select>
                                                    )}
                                                </div>

                                                <div className="half-width">
                                                    <label htmlFor="type">Type{!viewMode && <span className="required">*</span>}</label>
                                                    {viewMode ? (
                                                        <input
                                                            type="text"
                                                            value={formData.type}
                                                            readOnly
                                                            className="read-only-input"
                                                        />
                                                    ) : (
                                                        <select
                                                            name="type"
                                                            value={formData.type}
                                                            onChange={handleInputChange}
                                                            className="selectIM"
                                                            required
                                                        >
                                                            <option value="">Select Type</option>
                                                            <option value="Safety">Mandatory</option>
                                                            <option value="Orientation">Non Mandatory</option>
                                                        </select>
                                                    )}
                                                </div>
                                            </div>

                                            <label>
                                                Description
                                                {!viewMode && <span className="required">*</span>}
                                            </label>
                                            {viewMode ? (
                                                <div className="read-only-textarea">
                                                    {formData.description || 'No description'}
                                                </div>
                                            ) : (
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    rows={4}
                                                    required
                                                    placeholder="Enter detailed description of the training"
                                                />
                                            )}
                                        </div>
                                    )}

                                    {(viewMode || currentStep === 2) && (
                                        <div className="popup-group questions-section">
                                            <label>Training Questions</label>
                                            <div className="questions-list">
                                                {formData.question.length > 0 ? (
                                                    formData.question.map((item, index) => (
                                                        <div key={item.id || index} className="question-item">
                                                            <span>{typeof item === 'string' ? item : item.question}</span>
                                                            {!viewMode && (
                                                                <button
                                                                    type="button"
                                                                    className="remove-question-btn"
                                                                    onClick={() => handleRemoveQuestion(index)}
                                                                >
                                                                    <FaMinus />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="no-questions">No questions added</div>
                                                )}
                                            </div>
                                            {!viewMode && (
                                                <div className="add-question-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Add new question..."
                                                        value={newQuestion}
                                                        onChange={(e) => setNewQuestion(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn"
                                                        onClick={handleAddQuestion}
                                                    >
                                                        <FaPlus /> Add Question
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {(viewMode || currentStep === 3) && (
                                        <div className="popup-group documents-section">
                                            <label>Documents</label>
                                            <div className="documents-list">
                                                {formData.documents.length > 0 ? (
                                                    formData.documents.map((doc) => {
                                                        const fileName = doc.name || doc.fileName || '';
                                                        const fileExt = fileName.includes('.')
                                                            ? fileName.split('.').pop().toLowerCase()
                                                            : '';

                                                        return (
                                                            <div key={doc.id || fileName} className="input-row">
                                                                <div className="document-info">
                                                                    {getFileIcon(fileExt)}
                                                                    <span>{fileName}</span>
                                                                </div>
                                                                <div className="document-actions">
                                                                    <a
                                                                        href="#"
                                                                        className="preview-btn"
                                                                        onClick={(e) => {
                                                                            handleViewDocument(doc.id, doc)
                                                                        }}
                                                                    >
                                                                        Preview
                                                                    </a>

                                                                    {!viewMode && (
                                                                        <button
                                                                            type="button"
                                                                            className="remove-document-btn"
                                                                            onClick={() => handleRemoveDocument(doc.id)}
                                                                        >
                                                                            <FaMinus />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="no-documents">No documents added</div>
                                                )}
                                            </div>

                                            {!viewMode && (
                                                <div className="add-document-container">
                                                    <div className="file-upload-wrapper">
                                                        <label className="file-upload-btn">
                                                            <FaFileUpload className="upload-icon" />
                                                            <span>{newDocument.file ? newDocument.file.name : 'Choose File'}</span>
                                                            <input
                                                                type="file"
                                                                onChange={handleFileChange}
                                                                style={{ display: 'none' }}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className="btnContainer">
                                                        <button
                                                            type="button"
                                                            className="btn"
                                                            onClick={handleAddDocument}
                                                            disabled={!newDocument.file}
                                                        >
                                                            <FaPlus /> Upload Document
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="btnContainer">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                >
                                    Previous
                                </button>
                            )}

                            {!viewMode && (
                                <button
                                    type="submit"
                                    className="btn"
                                    onClick={handleSaveNext}
                                >
                                    {currentStep === steps.length ? 'Save' : 'Save & Next'}
                                </button>
                            )}
                            <button
                                type="button"
                                className="outline-btn"
                                onClick={handleClosePopup}
                            >
                                Close
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {showAssignPopup && (
                <div className='modal-overlay'>
                    <div className='modal'>

                        <div className="modal-header">
                            <div className='form-title'>Assign Training</div>
                            <button className="button-close" onClick={() => setShowAssignPopup(false)}>x</button>
                        </div>

                        <div className="modal-body">
                            {/* Training Info and Assign Button */}
                            <div className="input-row">
                                <div>
                                    <label>Training ID:</label>
                                    <input
                                        type='text'
                                        className='readonly'
                                        value={selectedEmployee.trainingId}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label>Training Name:</label>
                                    <input
                                        type='text'
                                        className='readonly'
                                        value={selectedEmployee.heading}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label htmlFor="empName">Search:</label>
                                    <div className="search-bar1">
                                        <input
                                            type="text"
                                            name="name"
                                            id="empName"
                                            value={selectedEmployee.employeeFirstName}
                                            onChange={handleEmployeeNameChange}
                                            required
                                            className="search-input1"
                                        />
                                        <FaSearch className="search-icon1" />
                                        {error && <div className="error-message">{error}</div>}
                                        {searchResults.length > 0 && (
                                            <ul className="dropdown2">
                                                {searchResults.map((employee) => (
                                                    <li
                                                        key={employee.id}
                                                        onClick={() => handleSelectEmployee(employee)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {`${employee.firstName} ${employee.lastName} (${employee.employeeId})`}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="input-row">
                                <div>
                                    <label>Region:</label>
                                    <select
                                        name="regionId"
                                        value={selectedFilters.regionId}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Regions</option>
                                        {dropdownData.region.map(region => (
                                            <option key={region.masterId} value={region.masterId}>{region.data}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Department:</label>
                                    <select
                                        name="departmentId"
                                        value={selectedFilters.departmentId}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Departments</option>
                                        {dropdownDepartment.department.map(dept => (
                                            <option key={dept.masterId} value={dept.masterId}>{dept.data}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Designation:</label>
                                    <select
                                        name="designationId"
                                        value={selectedFilters.designationId}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Designations</option>
                                        {dropdownDesignation.designation.map(designation => (
                                            <option key={designation.masterId} value={designation.masterId}>{designation.data}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Employees Table */}
                            <div>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Employee ID</th>
                                            <th>Name</th>
                                            <th>Department</th>
                                            <th>Designation</th>
                                            <th>Region</th>
                                            <th style={{ width: "5%" }}>Select</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployees.length > 0 ? (
                                            filteredEmployees.map(employee => (
                                                <tr key={employee.id}>
                                                    <td>{employee.employee?.employeeId || 'N/A'}</td>
                                                    <td>{`${employee.employee?.firstName || ''} ${employee.employee?.lastName || ''}`}</td>
                                                    <td>{employee.department || 'N/A'}</td>
                                                    <td>{employee.designation || 'N/A'}</td>
                                                    <td>{employee.region || 'N/A'}</td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedEmployees.includes(employee.id)}
                                                            onChange={() => handleEmployeeSelection(employee.id)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="no-results">
                                                    {selectedFilters.regionId || selectedFilters.deptId || selectedFilters.designationId || selectedEmployee.employeeFirstName
                                                        ? "No employees found matching your criteria"
                                                        : "Please select at least one filter to see results"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="form-controls">
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={handleSelectAll}
                                    >
                                        {selectAll ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div className='btnContainer'>
                            <button
                                type='button'
                                className='btn'
                                onClick={handleAssignTraining}
                                disabled={selectedEmployees.length === 0 || isAssigning}
                            >
                                {isAssigning ? (
                                    <div className="loading-spinner"></div>
                                ) : (
                                    `Assign to Selected Employees (${selectedEmployees.length})`
                                )}
                            </button>

                            <button
                                type='button'
                                className='outline-btn'
                                onClick={() => setShowAssignPopup(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <table className="interview-table">
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Heading</th>
                            <th>Type</th>
                            <th>Region</th>
                            <th>Created Date</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th style={{ width: "5%" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainings.length > 0 ? (
                            trainings.map((training, index) => (
                                <tr key={training.id}>
                                    <td>{index + 1}</td>
                                    <td>{training.heading}</td>
                                    <td>{training.type ? "Mandatory" : "Non-Mandatory"}</td>
                                    <td>{training.region}</td>
                                    <td>{training.date ? new Date(training.date).toLocaleDateString() : 'N/A'}</td>
                                    <td>{training.department}</td>
                                    <td>
                                        <span className={`status-confirmationBadge ${training.status ? 'confirmed' : 'terminated'}`}>
                                            {training.status ? "Active" : "Inactive"}
                                        </span>
                                    </td>



                                    <td>
                                        {editDropdownMenu(training)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">No trainings found matching your criteria</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {showPreviewModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="close-button" onClick={() => setShowPreviewModal(false)}>X</button>
                            <h3>Preview: {previewFilename}</h3>

                            {previewType === 'pdf' && (
                                <iframe src={previewUrl} title="PDF Preview" width="100%" height="500px" />
                            )}
                            {previewType === 'image' && (
                                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '500px' }} />
                            )}
                            {previewType === 'unsupported' && (
                                <p>Preview not available for this file type.</p>
                            )}

                            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                <a href={previewUrl} download={previewFilename} className="btn">
                                    Download File
                                </a>
                            </div>
                        </div>
                    </div>
                )}
                <PaginationControls />
            </div>
        </div>
    );
};

export default AllTrainings;