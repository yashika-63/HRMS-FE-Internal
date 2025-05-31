import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../Api.jsx";
import JdList from "./JdList";
import { strings } from "../../string";
import { FaMinus } from "react-icons/fa";

const CreateJobDescription = ({ onClose, source = "jd" }) => {
    const companyId = localStorage.getItem("companyId");
    const firstName = localStorage.getItem("firstName");
    const employeeId = localStorage.getItem("employeeId");
    const [statusFilter, setStatusFilter] = useState("true");
    const [skillsList, setSkillsList] = useState([]);
    const [currentSkill, setCurrentSkill] = useState("");
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [workflowOptions, setWorkflowOptions] = useState([]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
    const [jobDescriptionId, setJobDescriptionId] = useState(null);
    const [requestStatus, setRequestStatus] = useState("");

    const [formData, setFormData] = useState({
        jobTitle: "",
        jobDesc: "",
        requiredExperience: "",
        relevantExperience: "",
        createdBy: employeeId || "",
        status: true,
        contactPerson: "",
        contactPersonEmail: "",
        noOfRequirement: "",
        qualificationCriteria: [""],
        qualificationCriteriaInput: "",
        location: "",
        modeOfJob: "",
    });

    // ---------- Handlers for form fields ----------

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };

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
            default:
                break;
        }

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            showToast("Please fill all required fields and fix validation errors.", "error");
            return;
        }

        const payload = {
            ...formData,
            requiredSkills: skillsList.join("\n"),
            createdBy: employeeId || "",
        };

        try {
            const endpoint = source === "team"
                ? `http://${strings.localhost}/api/jobdescription/save/PendingForApproval/${companyId}/${employeeId}`
                : `http://${strings.localhost}api/jobdescription/save/DirectApproved/${companyId}/${employeeId}`;

            const response = await axios.post(endpoint, payload);
            showToast("Job description saved successfully.", "success");

            if (source === "team") {
                const savedId = response?.data?.id;
                const status = response?.data?.requestStatus;
                setRequestStatus(status);
                setJobDescriptionId(savedId);
                if (status === "PENDING") {
                    setShowWorkflowModal(true);
                }
                console.log("setJobDescriptionId", response.data.id);
            } else {
                window.location.reload();
            }

        } catch {
            showToast("Failed to save job description.", "error");
        }
    };




    const handleSave = async (e) => {
        e.preventDefault();

        if (!selectedWorkflowId) {
            showToast("Please select a workflow.", "error");
            return;
        }

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/jobdescriptionApproval/saveApproval/${companyId}/${selectedWorkflowId}/${jobDescriptionId}`
            );
            showToast("Workflow linked successfully.", "success");
            setShowWorkflowModal(false);
            onClose(); // Close popup after successful save
        } catch (error) {
            showToast("Failed to save workflow approval.", "error");
        }
    };


    // ----------------Fetching --------------


    useEffect(() => {
        const fetchWorkflowIds = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/workflow/names/${companyId}`);
                setWorkflowOptions(response.data);
            } catch (error) {
                console.error('Error fetching workflow names', error);
            }
        };

        if (showWorkflowModal) {
            fetchWorkflowIds(); // Only fetch when modal is triggered
        }
    }, [showWorkflowModal]);


    // ---------------- Render ----------------

    return (
        <div className="coreContainer">
            <div className="modal-overlay">
                <div className="modal-content">
                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        X
                    </button>
                    <h2 className="centerText">Create Job Description</h2>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="input-row">
                            <div>
                                <span className="required-marker">*</span>
                                <label>Job Title :</label>
                                <input
                                    type="text"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={(e) => updateField("jobTitle", e.target.value)} required
                                />
                                {errors.jobTitle && <small className="error">{errors.jobTitle}</small>}
                            </div>

                            <div>
                                <span className="required-marker">*</span>
                                <label>Location :</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={(e) => updateField("location", e.target.value)} required
                                />
                                {errors.location && <small className="error">{errors.location}</small>}
                            </div>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Mode of Job :</label>
                                <select
                                    name="modeOfJob"
                                    className="selectIM"
                                    value={formData.modeOfJob}
                                    onChange={(e) => updateField("modeOfJob", e.target.value)} required
                                >
                                    <option value="" disabled>Select Mode</option>
                                    <option value="On-site">On-site</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                                {errors.modeOfJob && <small className="error">{errors.modeOfJob}</small>}
                            </div>
                        </div>

                        <div className="input-row">
                            <div>
                                <span className="required-marker">*</span>
                                <label>Total Experience :</label>
                                <input
                                    type="number"
                                    name="requiredExperience"
                                    value={formData.requiredExperience}
                                    onChange={(e) => updateField("requiredExperience", e.target.value)} required
                                />
                                {errors.requiredExperience && <small className="error">{errors.requiredExperience}</small>}
                            </div>

                            <div>
                                <span className="required-marker">*</span>
                                <label>Relevant Experience :</label>
                                <input
                                    type="number"
                                    name="relevantExperience"
                                    value={formData.relevantExperience}
                                    onChange={(e) => updateField("relevantExperience", e.target.value)} required
                                />
                                {errors.relevantExperience && <small className="error">{errors.relevantExperience}</small>}
                            </div>


                            <div>
                                <span className="required-marker">*</span>
                                <label>No of requirement :</label>
                                <input
                                    type="number"
                                    name="noOfRequirement"
                                    value={formData.noOfRequirement}
                                    onChange={(e) => updateField("noOfRequirement", e.target.value)} required
                                />
                                {errors.noOfRequirement && <small className="error">{errors.noOfRequirement}</small>}
                            </div>
                        </div>

                        <div className="input-row">
                            <div>
                                <label>Created By:</label>
                                <input type="text" value={firstName} readOnly className="readonly" />
                            </div>

                            <div>
                                <span className="required-marker">*</span>
                                <label>Contact Person :</label>
                                <input
                                    type="text"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleContactPersonChange}
                                    autoComplete="off"
                                    required
                                />
                                {error && <div className="toast"><span style={{ color: 'red' }}>{error}</span></div>}
                                {searchResults.length > 0 && (
                                    <ul className="dropdown2">
                                        {searchResults.map((emp) => (
                                            <li
                                                key={emp.id}
                                                onClick={() => selectContactPerson(emp)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {emp.firstName} {emp.lastName}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors.contactPerson && <small className="error">{errors.contactPerson}</small>}
                            </div>

                            <div>
                                <label>Contact Person Email :</label>
                                <input
                                    type="text"
                                    name="contactPersonEmail"
                                    value={formData.contactPersonEmail}
                                    readOnly
                                    className="readonly"
                                />
                                {errors.contactPersonEmail && <small className="error">{errors.contactPersonEmail}</small>}
                            </div>
                        </div>

                        <div>
                            <span className="required-marker">*</span>
                            <label>Required Skills :</label>
                            <input
                                type="text"
                                name="skillInput"
                                value={currentSkill}
                                onChange={handleSkillInputChange}
                                onKeyDown={handleSkillKeyDown}
                                placeholder="Type skill and press Enter"
                                required
                            />
                            {skillsList.length > 0 && (
                                <ul className="skill-list">
                                    {skillsList.map((skill, i) => (
                                        <li key={i}>
                                            {skill}{" "}
                                            <button type="button" onClick={() => removeSkill(i)} className="remove-question-btn">
                                                <FaMinus />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {skillsList.length === 0 && <small className="no-data">At least one skill is required.</small>}
                        </div>



                        <div>
                            <span className="required-marker">*</span>
                            <label>Qualification Criteria:</label>
                            {formData.qualificationCriteria.map((qual, idx) => (
                                <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                                    <input
                                        type="text"
                                        value={qual}
                                        onChange={(e) => updateQualification(idx, e.target.value)}
                                        placeholder={`Qualification criteria ${idx + 1}`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeQualification(idx)}
                                        disabled={formData.qualificationCriteria.length === 1}
                                        className="remove-question-btn"
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))}

                            <input
                                type="text"
                                value={formData.qualificationCriteriaInput}
                                onChange={handleQualificationInputChange}
                                onKeyDown={handleQualificationInputKeyDown}
                                placeholder="Add new qualification"
                            />

                            <button type="button" onClick={addQualification} className="btn">
                                + Add More
                            </button>
                        </div>

                        <div>
                            <span className="required-marker">*</span>
                            <label>Job Description :</label>
                            <textarea
                                name="jobDesc"
                                value={formData.jobDesc}
                                onChange={(e) => updateField("jobDesc", e.target.value)} required
                            />
                            {errors.jobDesc && <small className="error">{errors.jobDesc}</small>}
                        </div>

                        <div className="btnContainer">
                            <button type="submit" className="btn" disabled={!isFormValid()}>
                                Submit
                            </button>
                            <button
                                type="button"
                                className="outline-btn"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {showWorkflowModal && requestStatus === "PENDING" && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4 className="ceneterText">Select Workflow</h4>

                        <div>
                            <span className="required-marker">*</span>
                            <label htmlFor='workflowId'>Workflow</label>
                            <select
                                className='selectIM'
                                name='workflowId'
                                value={selectedWorkflowId}
                                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                                required
                            >
                                <option value=''>Select Workflow</option>
                                {workflowOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.workflowName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="btnContainer">
                            <button type="button" className="btn" onClick={handleSave}>Save</button>
                            <button type="button" className="outline-btn" onClick={() => {
                                setShowWorkflowModal(false);
                                onClose();
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default CreateJobDescription;
