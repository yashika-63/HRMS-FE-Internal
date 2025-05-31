import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash, FaTimes, FaCheck, FaEye, FaUser, FaIdCard, FaGlobe, FaCalendarAlt, FaTasks, FaChalkboardTeacher, FaBuilding, FaUserTie, FaStickyNote, FaPlus, FaMinus, FaFileUpload, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFileAlt, FaSchool, FaList } from "react-icons/fa";
import { faTrashAlt, faEdit, faUserPlus, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AllTrainings.css';
import * as XLSX from 'xlsx';
import { fetchDataByKey, showToast } from "../../../Api.jsx";
import { strings } from "../../../string.jsx";

const TrainingHR = () => {
    const companyId = localStorage.getItem("companyId");
    const employeeId = localStorage.getItem("employeeId");
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewType, setPreviewType] = useState('');
    const [previewFilename, setPreviewFilename] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [assignments, setAssignments] = useState([]);
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
    const [currentTrainingId, setCurrentTrainingId] = useState(null);
    const [viewMode, setViewMode] = useState(false);
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
                date: item.date || item.created_at || new Date().toISOString(),
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

    const handleView = async (training) => {
        try {
            toggleDropdown(null);
            setIsPopupOpen(true);
            setCurrentStep(1);
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
        if (newPage < 0 || newPage >= pagination.totalPages) return;
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const fetchAssignments = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/assign-trainings/assigned/company/${companyId}`);
            console.log('Assignments API response:', response.data);
            const assignmentsData = response.data.content || [];
            setAssignments(assignmentsData);
        } catch (error) {
            // toast.error('Failed to load induction assignments!');
            console.error('Error fetching assignments:', error);
            setAssignments([]);
        }
    };

    const getTrainingStatus = (trainingId) => {
        try {
            const assignment = assignments.find(a =>
                a.trainingHRMS?.id == trainingId
            );

            if (!assignment) return {
                completionStatus: { text: 'N/A' },
                expiryStatus: { text: 'N/A' }
            };

            const isCompleted = assignment.completionStatus === '0x01' ||
                assignment.completionStatus === true ||
                assignment.completed === true;

            const isExpired = assignment.expiryStatus === '0x01' ||
                assignment.expiryStatus === true ||
                assignment.expired === true;

            return {
                completionStatus: {
                    text: isCompleted ? 'Completed' : 'Pending',
                    className: isCompleted ? 'green-text' : 'orange-text'
                },
                expiryStatus: {
                    text: isExpired ? 'Expired' : 'Active',
                    className: isExpired ? 'orange-text' : 'green-text'
                }

            };
        } catch (error) {
            console.error('Error getting training status:', error);
            return {
                completionStatus: { text: 'Error', className: 'red-text' },
                expiryStatus: { text: 'Error', className: 'red-text' }
            };
        }
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
        if (areFiltersApplied()) {
            fetchFilteredTrainings();
        } else {
            fetchTrainings(filters.page);
            fetchAssignments();
        }
    }, [filters, companyId]);

    const exportToExcel = () => {
        const dataForExport = trainings.map((training, index) => {
            const status = getTrainingStatus(training.id);
            return {
                'Sr.No': index + 1,
                'Heading': training.heading || 'N/A',
                'Type': training.type || 'N/A',
                'Region': training.region || 'N/A',
                'Created Date': new Date(training.date).toLocaleDateString(),
                'Completion Status': status.completionStatus.text,
                'Expiry Status': status.expiryStatus.text,
                'Status': training.status ? "Active" : "Inactive"
            };
        });
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Trainings");
        const fileName = `Trainings_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const generateYearRange = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 3; i > 0; i--) {
            years.push(currentYear - i);
        }
        years.push(currentYear);
        return years;
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
                <button onClick={() => handleView(training)} >
                    <FaEye /> View
                </button>
            </div>
        </div>
    );

    return (
        <div className='coreContainer'>
            <h1 className="title">List of all Trainings</h1>

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

                <button
                    onClick={exportToExcel}
                    className="btn"
                    disabled={trainings.length === 0}
                >
                    <FaFileExcel />
                    Export to Excel
                </button>
            </div>

            {isPopupOpen && (
                <div className="modal-overlay">
                    <div className="modal-content1">
                        <div className="form-controls">
                            <button type="button" className="close-btn" onClick={handleClosePopup}>
                                <FaTimes />
                            </button>
                        </div>
                        <h3 className='centerText'>View Training</h3>

                        <div className="popup-contentin">
                            <div className="view-mode-container">
                                <div>
                                    <div className="view-mode-section">
                                        <h4><FaUser /> Basic Information</h4>
                                        {(viewMode || currentStep === 1) && (
                                            <div className="view-mode-fields">
                                                <div className="view-mode-field">
                                                    <label><FaUser className="icon" />Heading</label>
                                                    <div className="view-mode-value">{formData.heading}</div>
                                                </div>
                                                <div className="view-mode-field">
                                                    <label><FaGlobe className="icon" />Region</label>
                                                    <div className="view-mode-value">{formData.region}</div>
                                                </div>
                                                <div className="view-mode-field">
                                                    <label><FaSchool className="icon" />Department</label>
                                                    <div className="view-mode-value">{formData.department}</div>
                                                </div>

                                                <div className="view-mode-field">
                                                    <label><FaIdCard className="icon" />Type</label>
                                                    <div className="view-mode-value">{formData.type}</div>
                                                </div>

                                                <div className="view-mode-field">
                                                    <label><FaList className="icon" />Description</label>
                                                    <div className="view-mode-value">{formData.description}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {(viewMode || currentStep === 2) && (
                                        <div className="view-mode-section">
                                            <h4><FaCalendarAlt />Training Details</h4>
                                            <div className="view-mode-fields">
                                                <div className="view-mode-field full-width">
                                                    <div className="input-row">
                                                        {formData.question.length > 0 ? (
                                                            formData.question.map((question, index) => (
                                                                <div key={index} >
                                                                    <span>{index+ 1}  </span>
                                                                    <span> {question}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="no-questions">No questions added</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(viewMode || currentStep === 3) && (
                                        <div className="view-mode-section">
                                            <h4><FaBuilding /> Documents</h4>
                                            <div >
                                                <div>
                                                    <div>
                                                        {formData.documents.length > 0 ? (
                                                            <ul className="documents-list-view">
                                                                {formData.documents.map((doc , index) => {
                                                                    const fileName = doc.name || doc.fileName || '';
                                                                    const fileExt = fileName.includes('.')
                                                                        ? fileName.split('.').pop().toLowerCase()
                                                                        : '';

                                                                    return (
                                                                        <div key={doc.id || fileName} className="input-row">
                                                                            <div>
                                                                                <span>{index+ 1 }. </span>
                                                                                {getFileIcon(fileExt)}
                                                                                <span>{fileName}</span>
                                                                            </div>
                                                                            <div>
                                                                                <a
                                                                                    href="#"
                                                                                    className="preview-btn"
                                                                                    onClick={(e) => {
                                                                                        handleViewDocument(doc.id, doc)
                                                                                    }}
                                                                                >
                                                                                    Preview
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </ul>
                                                        ) : (
                                                            <div className="no-documents">No documents added</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="form-controls" style={{ justifyContent: 'flex-end' }}>
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
                    </div>
                </div>
            )
            }

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
                            <th>Completion Status</th>
                            <th>Expiry Status</th>
                            <th>Status</th>
                            <th style={{ width: "5%" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainings.length > 0 ? trainings.map((training, index) => {
                            const status = getTrainingStatus(training.id);
                            return (
                                <tr key={training.id}>
                                    <td>{index + 1}</td>
                                    <td>{training.heading}</td>
                                    <td>{training.type ? "Mandatory" : "Non-Mandatory"}</td>
                                    <td>{training.region}</td>
                                    <td>{training.date ? new Date(training.date).toLocaleDateString() : 'N/A'}</td>
                                    <td>{training.department}</td>
                                    <td>
                                        <span className={status.completionStatus.className}>
                                            {status.completionStatus.text}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={status.expiryStatus.className}>
                                            {status.expiryStatus.text}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-confirmationBadge ${training.status ? 'confirmed' : 'terminated'}`}>
                                            {training.status ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        {editDropdownMenu(training)}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="6" className="no-data1">No trainings found matching your criteria</td>
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
        </div >
    );
};

export default TrainingHR;