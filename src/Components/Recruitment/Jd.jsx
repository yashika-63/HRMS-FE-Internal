import React, { useState } from "react";
import axios from "axios";
import { showToast } from "../../Api.jsx";
import JdList from "./JdList";
import { strings } from "../../string";
<<<<<<< HEAD

const Jd = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [statusFilter, setStatusFilter] = useState("true");
    const companyId = localStorage.getItem('companyId');
    const firstName = localStorage.getItem("firstName");
    const employeeId = localStorage.getItem("employeeId");

    const [formData, setFormData] = useState({
        jobTitle: "",
        jobDesc: "",
        requiredSkills: "",
=======
import { FaMinus } from "react-icons/fa";
import CreateJobDescription from "./CreateJobDescription.jsx";

const Jd = () => {
    const companyId = localStorage.getItem("companyId");
    const firstName = localStorage.getItem("firstName");
    const employeeId = localStorage.getItem("employeeId");

    const [showPopup, setShowPopup] = useState(false);
    const [statusFilter, setStatusFilter] = useState("true");
    const [skillsList, setSkillsList] = useState([]);
    const [currentSkill, setCurrentSkill] = useState("");
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");

    const [searchResults, setSearchResults] = useState([]);
    const [formData, setFormData] = useState({
        jobTitle: "",
        jobDesc: "",
>>>>>>> 8a5f66f (merging code)
        requiredExperience: "",
        relevantExperience: "",
        createdBy: employeeId || "",
        status: true,
        contactPerson: "",
<<<<<<< HEAD
        contactPersonEmail: ""
    });

    const [errors, setErrors] = useState({});
    const [selectedEmployee, setSelectedEmployee] = useState({
        employeeFirstName: "",
        employeeLastName: "",
        employeeEmail: "",
    });
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState("");
=======
        contactPersonEmail: "",
        noOfRequirement: "",
        qualificationCriteria: [""],
        qualificationCriteriaInput: "",
        location: "",
        modeOfJob: "",
    });

    // ---------- Handlers for form fields ----------
>>>>>>> 8a5f66f (merging code)

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };

<<<<<<< HEAD
    // Validation logic for both 'requiredExperience' and 'relevantExperience'
    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "jobTitle":
                if (!value.trim()) {
                    error = "Job title is required.";
                } else if (value[0] !== value[0].toUpperCase()) {
                    error = "First letter must be capital.";
                }
                break;

            case "jobDesc":
                if (!value.trim()) {
                    error = "Job description is required.";
                }
                break;

            case "requiredSkills":
                if (!value.trim()) {
                    error = "Required skills are mandatory.";
                }
                break;

            case "requiredExperience":
            case "relevantExperience":
                if (!value.trim()) {
                    error = `${name.replace(/([A-Z])/g, ' $1').toLowerCase()} is required.`;
                } else if (!/^[0-9]+$/.test(value)) {
                    error = "Only positive numbers are allowed for experience.";
                }
                break;

            case "contactPerson":
                if (!value.trim()) {
                    error = "Contact person is required.";
                }
                break;

            case "contactPersonEmail":
                if (!value.trim()) {
                    error = "Contact person email is required.";
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    error = "Invalid email format.";
                }
                break;

=======
    const updateField = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    // ---------- Validation ----------

    const validateField = (name, value) => {
        let errorMsg = "";

        switch (name) {
            case "jobTitle":
                if (!value.trim()) errorMsg = "Job title is required.";
                else if (value[0] !== value[0].toUpperCase()) errorMsg = "First letter must be capital.";
                break;
            case "jobDesc":
                if (!value.trim()) errorMsg = "Job description is required.";
                break;
            case "requiredExperience":
            case "relevantExperience":
            case "noOfRequirement":
                if (!value.trim()) errorMsg = `${name} is required.`;
                else if (!/^\d+$/.test(value)) errorMsg = "Only positive numbers allowed.";
                break;
            case "contactPerson":
                if (!value.trim()) errorMsg = "Contact person is required.";
                break;
            case "contactPersonEmail":
                if (!value.trim()) errorMsg = "Contact person email is required.";
                else if (!/\S+@\S+\.\S+/.test(value)) errorMsg = "Invalid email format.";
                break;
            case "location":
                if (!value.trim()) errorMsg = "Job location is required.";
                break;
            case "modeOfJob":
                if (!value) errorMsg = "Mode of job is required.";
                break;
>>>>>>> 8a5f66f (merging code)
            default:
                break;
        }

<<<<<<< HEAD
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update form data
        setFormData({ ...formData, [name]: value });

        // Validate the field
        validateField(name, value);
    };

    // Searching for employees by name
    const handleEmployeeNameChange = async (event) => {
        const { value } = event.target;
        setSelectedEmployee((prevEmployee) => ({
            ...prevEmployee,
            employeeFirstName: value,
        }));

        if (value.trim() !== '') {
            try {
                const response = await axios.get(`http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${value.trim()}`);
                setSearchResults(response.data);
                setError(null);
            } catch (error) {
                console.error('Error searching employee:', error);
                setError('Error searching for employees.');
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
            setError(null);
        }
    };

    const handleSelectEmployee = (employee) => {
        setSelectedEmployee({
            employeeId: employee.id,
            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName,
            employeeEmail: employee.email,
        });

        // Set the contact person's email automatically when the employee is selected
        setFormData((prevData) => ({
            ...prevData,
            contactPersonEmail: employee.email
        }));

        setSearchResults([]); // Clear search results
    };

    // Searching for contact person by name (similar to employee search)
    const handleContactPersonChange = async (event) => {
        const { value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            contactPerson: value
        }));

        if (value.trim() !== '') {
            try {
                const response = await axios.get(`http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${value.trim()}`);
                setSearchResults(response.data);
                setError(null);
            } catch (error) {
                console.error('Error searching employee:', error);
                setError('Error searching for employees.');
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
            setError(null);
        }
    };

    const handleSelectContactPerson = (employee) => {
        setFormData((prevData) => ({
            ...prevData,
            contactPerson: `${employee.firstName} ${employee.lastName}`,
            contactPersonEmail: employee.email,
        }));

        setSearchResults([]); // Clear search results
    };

    const isFormValid = () => {
        const requiredFields = ['jobTitle', 'jobDesc', 'requiredSkills', 'requiredExperience', 'relevantExperience', 'contactPerson', 'contactPersonEmail'];
        const formHasErrors = Object.values(errors).some((error) => error);
        const emptyFields = requiredFields.some((key) => {
            const val = formData[key];
            return typeof val === 'string' && !val.trim();
        });

        return !formHasErrors && !emptyFields;
    };

=======
        setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    };

    // ---------- Skills handling ----------

    const handleSkillInputChange = (e) => {
        setCurrentSkill(e.target.value);
    };

    const addSkill = () => {
        const skill = currentSkill.trim();
        if (skill && !skillsList.includes(skill)) {
            setSkillsList((prev) => [...prev, skill]);
        }
        setCurrentSkill("");
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addSkill();
        }
    };

    const removeSkill = (index) => {
        setSkillsList((prev) => prev.filter((_, i) => i !== index));
    };

    // ---------- Qualification Criteria Handling ----------

    const updateQualification = (index, value) => {
        const updated = [...formData.qualificationCriteria];
        updated[index] = value;
        setFormData((prev) => ({ ...prev, qualificationCriteria: updated }));
    };

    const removeQualification = (index) => {
        if (formData.qualificationCriteria.length === 1) return; // prevent removing last
        const updated = formData.qualificationCriteria.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, qualificationCriteria: updated }));
    };

    const addQualification = () => {
        setFormData((prev) => ({
            ...prev,
            qualificationCriteria: [...prev.qualificationCriteria, ""],
        }));
    };

    const handleQualificationInputChange = (e) => {
        setFormData((prev) => ({ ...prev, qualificationCriteriaInput: e.target.value }));
    };

    const handleQualificationInputKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const newQual = formData.qualificationCriteriaInput.trim();
            if (newQual && !formData.qualificationCriteria.includes(newQual)) {
                setFormData((prev) => ({
                    ...prev,
                    qualificationCriteria: [...prev.qualificationCriteria, newQual],
                    qualificationCriteriaInput: "",
                }));
            } else {
                setFormData((prev) => ({ ...prev, qualificationCriteriaInput: "" }));
            }
        }
    };

    // ---------- Contact Person Search ----------

    const handleContactPersonChange = async (e) => {
        const value = e.target.value;
        updateField("contactPerson", value);

        if (!value.trim()) {
            setSearchResults([]);
            setError("");
            return;
        }

        try {
            const response = await axios.get(`http://${strings.localhost}/employees/search?companyId=${companyId}&searchTerm=${value.trim()}`);
            setSearchResults(response.data);
            setError("");
        } catch {
            setError("Error searching for employees.");
            setSearchResults([]);
        }
    };

    const selectContactPerson = (employee) => {
        setFormData((prev) => ({
            ...prev,
            contactPerson: `${employee.firstName} ${employee.lastName}`,
            contactPersonEmail: employee.email,
        }));
        setSearchResults([]);
    };

    // ---------- Form Validation before submit ----------

    const isFormValid = () => {
        const requiredFields = [
            "jobTitle",
            "jobDesc",
            "requiredExperience",
            "relevantExperience",
            "contactPerson",
            "contactPersonEmail",
            "location",
            "modeOfJob",
        ];

        // Check if any required field is empty or has error
        const emptyFieldExists = requiredFields.some((key) => !formData[key] || !formData[key].toString().trim());
        const errorExists = Object.values(errors).some((err) => err);

        return !emptyFieldExists && !errorExists && skillsList.length > 0;
    };

    // ---------- Submit ----------

>>>>>>> 8a5f66f (merging code)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
<<<<<<< HEAD
            showToast("Please fill in all required fields and fix validation errors before submitting.", "error");
            return;
        }

        try {
            const response = await axios.post(`http://${strings.localhost}/api/jobdescription/save/${companyId}`, formData);
            console.log("Response:", response.data);
            showToast("Job description saved successfully.", 'success');
            window.location.reload();
            setShowPopup(false);
            setFormData({
                jobTitle: "",
                jobDesc: "",
                requiredSkills: "",
                requiredExperience: "",
                relevantExperience: "",
                createdBy: employeeId || "",
                contactPerson: "",
                contactPersonEmail: ""
            });
            setErrors({});
        } catch (error) {
            console.error("Error:", error);
            showToast("Failed to save job description.", 'error');
        }
    };

=======
            showToast("Please fill all required fields and fix validation errors.", "error");
            return;
        }

        const payload = {
            ...formData,
            requiredSkills: skillsList.join("\n"),
            createdBy: employeeId || "",
        };

        try {
            await axios.post(`http://${strings.localhost}/api/jobdescription/save/${companyId}`, payload);
            showToast("Job description saved successfully.", "success");
            window.location.reload();
        } catch {
            showToast("Failed to save job description.", "error");
        }
    };

    const handleOpenPopup = () => {
        setShowPopup(true);
    }
    const handleClosePopup = () => {
        setShowPopup(false);
        setErrors({});
    };
    // ---------------- Render ----------------

>>>>>>> 8a5f66f (merging code)
    return (
        <div className="coreContainer">
            <div className="form-controls">
                <div>
<<<<<<< HEAD
                    <button>
                        <select value={statusFilter} onChange={handleStatusChange}>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </button>
                </div>
                <button type="button" className="btn" onClick={() => setShowPopup(true)}>Create</button>
=======
                    <select value={statusFilter} onChange={handleStatusChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
                <button className="btn" onClick={handleOpenPopup}>Create</button>
>>>>>>> 8a5f66f (merging code)
            </div>

            <JdList statusFilter={statusFilter} />

            {showPopup && (
<<<<<<< HEAD
                <div className="add-popup">
                    <div className="popup-fields">
                        <h2 className="centerText">Create Job Description</h2>
                        <form onSubmit={handleSubmit} noValidate>
                            <div>
                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Job Title:</label>
                                    <input
                                        type="text"
                                        name="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.jobTitle && <small className="error">{errors.jobTitle}</small>}
                                </div>

                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Job Description:</label>
                                    <textarea
                                        name="jobDesc"
                                        value={formData.jobDesc}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.jobDesc && <small className="error">{errors.jobDesc}</small>}
                                </div>

                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Required Skills:</label>
                                    <input
                                        type="text"
                                        name="requiredSkills"
                                        value={formData.requiredSkills}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.requiredSkills && <small className="error">{errors.requiredSkills}</small>}
                                </div>

                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Required Experience:</label>
                                    <input
                                        type="text"
                                        name="requiredExperience"
                                        value={formData.requiredExperience}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.requiredExperience && <small className="error">{errors.requiredExperience}</small>}
                                </div>

                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Relevant Experience:</label>
                                    <input
                                        type="text"
                                        name="relevantExperience"
                                        value={formData.relevantExperience}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.relevantExperience && <small className="error">{errors.relevantExperience}</small>}
                                </div>

                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Contact Person:</label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleContactPersonChange}
                                        required
                                    />
                                    {error && <div className="toast"><span style={{ color: 'red' }}>{error}</span></div>}
                                    {searchResults.length > 0 && (
                                        <ul className="dropdown1">
                                            {searchResults.map((employee) => (
                                                <li
                                                    key={employee.id}
                                                    onClick={() => handleSelectContactPerson(employee)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {`${employee.firstName} ${employee.lastName}`}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {errors.contactPerson && <small className="error">{errors.contactPerson}</small>}
                                </div>

                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Contact Person Email:</label>
                                    <input
                                    className="readonly"
                                        type="text"
                                        name="contactPersonEmail"
                                        value={formData.contactPersonEmail}
                                        onChange={handleChange}
                                        required 
                                        readOnly
                                    />
                                    {errors.contactPersonEmail && <small className="error">{errors.contactPersonEmail}</small>}
                                </div>

                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Created By:</label>
                                    <input
                                        type="text"
                                        name="createdBy"
                                        value={firstName}
                                        readOnly
                                        className="readonly"
                                    />
                                </div>

                                <div className="btnContainer">
                                    <button
                                        type="submit"
                                        className="btn"
                                        disabled={!isFormValid()}
                                    >
                                        Submit
                                    </button>
                                    <button
                                        type="button"
                                        className="outline-btn"
                                        onClick={() => {
                                            setShowPopup(false);
                                            setErrors({});
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </form>
=======
                <div className="modal-overlay">
                    <div className="modal-content">
                        <CreateJobDescription onClose={handleClosePopup} source="jd"/>
>>>>>>> 8a5f66f (merging code)
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jd;
