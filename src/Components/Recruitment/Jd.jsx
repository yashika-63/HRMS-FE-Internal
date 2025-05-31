import React, { useState } from "react";
import axios from "axios";
import { showToast } from "../../Api.jsx";
import JdList from "./JdList";
import { strings } from "../../string";
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

    return (
        <div className="coreContainer">
            <div className="form-controls">
                <div>
                    <select value={statusFilter} onChange={handleStatusChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
                <button className="btn" onClick={handleOpenPopup}>Create</button>
            </div>

            <JdList statusFilter={statusFilter} />

            {showPopup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <CreateJobDescription onClose={handleClosePopup} source="jd"/>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jd;
