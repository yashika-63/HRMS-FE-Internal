import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faEye, faHandshake, faTicket } from '@fortawesome/free-solid-svg-icons';
import { showToast } from "../../Api.jsx";
import "../CommonCss/PreRegistraion.css";
import CTC from "./CTC.jsx";
import Offer from "./Offer.jsx";
import { strings } from "../../string.jsx";
import ViewOfferHR from "./ViewOfferHR.jsx";

const PreRegistration = () => {

    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isEmployeeDataModalOpen, setIsEmployeeDataModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showOfferConfirmation, setShowOfferConfirmation] = useState(false);
    const [candidateNameForConfirmation, setCandidateNameForConfirmation] = useState('');
    const [showOfferPage, setShowOfferPage] = useState(false);
    const [open, setOpen] = useState(false);
    const [completedSteps, setCompletedSteps] = useState({ 1: false, 2: false, 3: false });
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        email: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const companyId = localStorage.getItem("companyId");
    const employeeId = localStorage.getItem('employeeId');
    const [expandedColumns, setExpandedColumns] = useState({
        Active: true,
        Pending: true,
        Offered: true
    });

    const fetchEmployees = async () => {
        const employeeList = [];

        // Fetch Active
        try {
            const pendingResponse = await axios.get(
                `http://${strings.localhost}/api/preregistration/getByCompanyAndStatus?companyId=${companyId}&status=true`
            );
            console.log("Active employees:", pendingResponse.data);
            employeeList.push(
                ...pendingResponse.data.map(emp => ({ ...emp, status: 'Active' }))
            );
        } catch (error) {
            console.error(" Failed to fetch Active employees:", error);
            showToast("Failed to fetch Active employees", "warning");
        }

        // Fetch Offered
        try {
            const ongoingResponse = await axios.get(
                `http://${strings.localhost}/api/preregistration/getByCompanyOfferMade?companyId=${companyId}`
            );
            console.log(" Offered employees:", ongoingResponse.data);
            employeeList.push(
                ...ongoingResponse.data.map(emp => ({ ...emp, status: 'Offered' }))
            );
        } catch (error) {
            console.error(" Failed to fetch Offered employees:", error);
            showToast("Failed to fetch Offered employees", "warning");
        }

        // Fetch Not Offered
        try {
            const completeResponse = await axios.get(
                `http://${strings.localhost}/api/preregistration/getByCompanyOfferNotMade?companyId=${companyId}`
            );
            console.log(" Pending employees (Not Offered):", completeResponse.data);
            employeeList.push(
                ...completeResponse.data.map(emp => ({ ...emp, status: 'Pending' }))
            );
        } catch (error) {
            console.error("Failed to fetch Pending (Not Offered) employees:", error);
            showToast("Failed to fetch Pending (Offer Not Made) employees", "warning");
        }
        setEmployees(employeeList);
    };

    useEffect(() => {
        fetchEmployees();
    }, [companyId]);


    const handleOfferClick = () => setIsOfferModalOpen(true);
    const handleCloseModal = () => setIsOfferModalOpen(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleCTCSuccess = (employee) => {
        setCandidateNameForConfirmation(`${employee.firstName} ${employee.lastName}`);
        setShowOfferConfirmation(true);
    };
    
    const handleCardClick = (employee) => {
        setSelectedEmployee(employee);
        setIsEmployeeDataModalOpen(true);
        setShowOfferPage(true);
    };
    const handleGnrateTicket = (employee) => {
        setSelectedEmployee(employee);
        handleGenerateTicket(employee.id)
    };

    const closeEmployeeDataModal = () => {
        setSelectedEmployee(null);
        setIsEmployeeDataModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const validate = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = "First Name is required.";
        if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required.";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid.";
        }

        const nameRegex = /^[A-Z][a-zA-Z]*$/;

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First Name is required.";
        } else if (!nameRegex.test(formData.firstName)) {
            newErrors.firstName = "First Name must start with a capital letter and contain only alphabets.";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last Name is required.";
            if (!formData.email.trim()) {
                newErrors.email = "Email is required.";
            }
        } else if (!nameRegex.test(formData.lastName)) {
            newErrors.lastName = "Last Name must start with a capital letter and contain only alphabets.";
        }
        if (!nameRegex.test(formData.middleName)) {
            newErrors.middleName = "Middle Name must start with a capital letter and contain only alphabets.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        const assignByFirstName = localStorage.getItem('firstName') || '';
        const assignByLastName = localStorage.getItem('lastName') || '';
        const payload = {
            ...formData,
            assignByFirstName,
            assignByLastName
        };
    
        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/preregistration/save/${companyId}/${employeeId}`,
                payload
            );
            if (response.data) {
                showToast("Registration successful", "success");
                fetchEmployees();
                setFormData({ firstName: '', lastName: '', middleName: '', email: '' });
                setIsModalOpen(false);
            }
        } catch (error) {
            showToast(error.response?.data || "An error occurred. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    const getInitials = (firstName, lastName) => {
        if (!firstName || !lastName) {
            return '';
        }
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };
    const getInitialsColorSet = (index) => {
        const colorSets = [
            ['#0057A3', '#FBB03B'],  // Blue & Yellow
            ['#FF66B2', '#00BFFF'],  // Pink & Sky Blue
            ['#FF6347', '#4682B4'],  // Tomato Red & Steel Blue
            ['#32CD32', '#FFD700'],  // Lime Green & Gold
            ['#FF1493', '#00FA9A'],  // Deep Pink & Medium Spring Green
            ['#8A2BE2', '#00FFFF'],  // Blue Violet & Cyan
            ['#FF4500', '#2E8B57'],  // Orange Red & Sea Green
            ['#D2691E', '#8B0000'],  // Chocolate & Dark Red
            ['#9932CC', '#FF8C00'],  // Dark Orchid & Dark Orange
            ['#A52A2A', '#20B2AA'],  // Brown & Light Sea Green
            ['#8B4513', '#F0E68C'],  // Saddle Brown & Khaki
            ['#DCDCDC', '#8B008B'],  // Gainsboro & Dark Magenta
            ['#B0E0E6', '#FF6347'],  // Powder Blue & Tomato Red
            ['#ADFF2F', '#8A2BE2'],  // Green Yellow & Blue Violet
            ['#F08080', '#3CB371'],  // Light Coral & Medium Sea Green
        ];
        return colorSets[index % colorSets.length];
    };

    const groupedEmployees = {
        Active: employees.filter(emp => emp.status === 'Active'),
        Pending: employees.filter(emp => emp.status === 'Pending'),
        Offered: employees.filter(emp => emp.status === 'Offered')
    };

    const handleGenerateTicket = async (preRegistrationId) => {
        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/verification/create?companyId=${companyId}&reportingPersonId=${employeeId}&preRegistrationId=${preRegistrationId}`
            );

            if (response.status === 200) {
                showToast("Ticket generated successfully.", 'success');
            } else {
                showToast("Failed to generate ticket.", 'error');
            }
        } catch (error) {
            showToast("An error occurred while generating the ticket.", 'error');
            console.error("Error generating ticket:", error);
        }
    };

    const editDropdown = (employee) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">

                <div>
                    <button
                        type='button'
                        onClick={() => handleCardClick(employee)}
                    >
                        <FontAwesomeIcon icon={faEye} />  View
                    </button>
                </div>

                {employee.status !== "Active" && (
                    <div>
                        <button
                            type='button'
                            onClick={() => {
                                setSelectedEmployee({
                                    ...employee,
                                    offerData: employee.offerData
                                });
                                handleOfferClick();
                            }}
                        >
                            <FontAwesomeIcon icon={faHandshake} /> Offer
                        </button>
                    </div>
                )}

                {employee.status === "Active" && (
                    <div>
                        <button
                            type='button'
                            onClick={() => handleGnrateTicket(employee)}
                        >
                            <FontAwesomeIcon icon={faTicket} /> Generate Ticket
                        </button>
                    </div>
                )}

            </div>
        </div>
    );

    return (
        <div className="coreContainer">
            <div>
                <div className="title">Candidate List</div>
                <div className="form-controls">
                    <button type="button" onClick={openModal} className="btn">Add Candidate</button>
                </div>
                <div className="kanban-container">
                    {["Active", "Pending", "Offered"].map((status, index) => {
                        const isExpanded = expandedColumns[status];
                        const employeeCount = groupedEmployees[status].length;

                        return (
                            <div key={status} className={`kanban-column ${status} ${!isExpanded ? 'collapsed' : ''}`}>
                                <div className="column-header">
                                    <h3>{status}</h3>
                                    <div className="header-controls">
                                        <span className="badge">{employeeCount}</span>
                                        <button
                                            className="toggle-btn"
                                            onClick={() =>
                                                setExpandedColumns((prev) => ({
                                                    ...prev,
                                                    [status]: !prev[status],
                                                }))
                                            }
                                        >
                                            {isExpanded ? "-" : "+"}
                                        </button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="card-list">
                                        {employeeCount > 0 ? (
                                            groupedEmployees[status].map((emp, index) => {
                                                const [color1, color2] = getInitialsColorSet(index);
                                                return (
                                                    <div key={emp.id} className="kanban-card">
                                                        <div className="initials-container">
                                                            <div className="initial-circle" style={{ backgroundColor: color1 }}>
                                                                {getInitials(emp.firstName, emp.lastName)}
                                                            </div>
                                                            <div className="initial-circle" style={{ backgroundColor: color2 }}>
                                                                {getInitials(emp.assignByFirstName, emp.assignByLastName)}
                                                            </div>
                                                        </div>
                                                        <div className="details">
                                                            <h4>{emp.firstName} {emp.lastName}</h4>
                                                            <hr />
                                                            <p><strong>Email:</strong> {emp.email}</p>
                                                            <p><strong>Date:</strong> {emp.date}</p>
                                                            <p>
                                                                <strong className="textbutton">Offer Send to Candidate:</strong>{" "}
                                                                {emp.offerGenerated ? "Completed" : "Pending"}
                                                            </p>
                                                        </div>
                                                        <div className="options-container">
                                                            {editDropdown(emp)}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="error-message">No data available</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>

            {isEmployeeDataModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button type="button" onClick={closeEmployeeDataModal} className="close-button">X</button>
                        <h3 className="centerText">Employee Details</h3>

                        {showOfferPage ? (
                            <ViewOfferHR selectedEmployee={selectedEmployee} onClose={closeEmployeeDataModal} />
                        ) : (
                            <>
                                <p><strong>ID:</strong> {selectedEmployee.id}</p>
                                <p><strong>Name:</strong> {selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                                <p><strong>Status:</strong> {selectedEmployee.status}</p>
                                <p><strong>Email:</strong> {selectedEmployee.email}</p>
                                <p><strong>Date:</strong> {selectedEmployee.date}</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="add-popup">
                    <div>
                        <button type="button" onClick={closeModal} className="close-button">X</button>
                        <form onSubmit={handleSubmit}>
                            <div className="centerText">Candidate Pre-Onboarding Form</div>
                            <div>
                                <span className="required-marker">*</span>
                                <label>First Name:</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName || ""}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (errors.firstName && e.target.value.trim()) {
                                            setErrors((prevErrors) => ({ ...prevErrors, firstName: "" }));
                                        }
                                    }}
                                    required
                                />
                                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                            </div>

                            <div>
                                <span className="required-marker">*</span>
                                <label>Last Name:</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName || ""}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (errors.lastName && e.target.value.trim()) {
                                            setErrors((prevErrors) => ({ ...prevErrors, lastName: "" }));
                                        }
                                    }}
                                    required
                                />
                                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                            </div>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Middle Name:</label>
                                <input
                                    type="text"
                                    name="middleName"
                                    value={formData.middleName || ""}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (errors.middleName && e.target.value.trim()) {
                                            setErrors((prevErrors) => ({ ...prevErrors, middleName: "" }));
                                        }
                                    }}
                                    required
                                />
                                {errors.middleName && <span className="error-message">{errors.middleName}</span>}
                            </div>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (errors.email && /\S+@\S+\.\S+/.test(e.target.value)) {
                                            setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
                                        }
                                    }}
                                    required
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                            <div className="btnContainer">
                                <button type="submit" className="btn" disabled={isLoading}>
                                    {isLoading ? "Submitting..." : "Submit"}
                                </button>
                                <button type="button" className="outline-btn" onClick={closeModal}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isOfferModalOpen && (
                <div className="modal-overlay">
                    <div className="offermodal-content">
                        {currentStep === 1 && (
                            <Offer
                                selectedEmployee={selectedEmployee}
                                offerData={selectedEmployee?.offerData}
                                open={open}
                                onClose={handleCloseModal}
                            />
                        )}
                        {currentStep === 2 && completedSteps[1] && (
                            <CTC
                                selectedEmployee={selectedEmployee}
                                offerData={selectedEmployee?.offerData}
                                setCurrentStep={setCurrentStep}
                                setCompletedSteps={setCompletedSteps}
                                open={open}
                                onClose={handleCloseModal}
                                onCTCSuccess={handleCTCSuccess}
                            />
                        )}
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default PreRegistration;
