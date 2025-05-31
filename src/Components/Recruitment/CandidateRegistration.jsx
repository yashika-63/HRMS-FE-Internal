import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { fetchDataByKey, showToast } from "../../Api.jsx";
import { strings } from "../../string.jsx";

const emptyFormData = {
    firstName: "",
    middelName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    highestQualification: "",
    yearsOfExperience: "",
    jobTitle: "",
    dateOfBirth: "",
    maritalStatus: "",
    linkedinProfile: "",
    githubPortfolio: "",
    resume: null,
    photo: null,
    graduationUniversity: "",
    graduationStream: "",
    postGraduationStream: "",
    certifications: "",
    totalExperience: "",
    relevantExperience: "",
    previousCompanies: "",
    designationLastJob: "",
    employmentGaps: "",
    reasonsForLeaving: "",
    experienceWithTools: "",
    currentSalary: "",
    expectedSalary: "",
    negotiable: "",
    noticePeriod: "",
    lastWorkingDay: "",
    preferredJobLocation: "",
    openToRelocation: "",
    skills: '',
};

const CandidateRegistration = ({ onClose }) => {
    const { id } = useParams();
    const companyId = localStorage.getItem("companyId");
    const jobDescriptionId = id;

    const [formData, setFormData] = useState(emptyFormData);
    const [errors, setErrors] = useState({});
    const [languagesList, setLanguagesList] = useState([]);
    const [skillsList, setSkillsList] = useState([]);
    const [currentLanguage, setCurrentLanguage] = useState("");
    const [currentSkill, setCurrentSkill] = useState("");
    const [showUploadPopup, setShowUploadPopup] = useState(false);

    // Utility: Capitalize first letter helper
    const formatName = (name) =>
        name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";

    const [dropdownData, setDropdownData] = useState({
        maritalstatus: [],

    });
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const maritalstatus = await fetchDataByKey('maritalstatus');
                setDropdownData({ maritalstatus });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
                console.log('Response:', error.response.data);
            }
        };

        fetchDropdownData();
    }, []);

    const validateField = (name, value) => {
        switch (name) {
            case 'firstName':
            case 'lastName':
            case 'middelName':
                if (!value.trim()) return 'This field is required.';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'Only alphabets allowed.';
                break;

            case 'email':
                if (!value.trim()) return 'Email is required.';
                if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email format.';
                break;

            case 'phoneNumber':
                if (!value.trim()) return 'Phone number is required.';
                if (!/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit phone number.';
                break;

            case 'highestQualification':
            case 'graduationUniversity':
            case 'graduationStream':
            case 'postGraduationStream':
            case 'designationLastJob':
            case 'previousCompanies':
                if (value && value.length > 100) return 'Too long.';
                break;

            case 'yearsOfExperience':
            case 'totalExperience':
            case 'relevantExperience':
            case 'currentSalary':
            case 'expectedSalary':
            case 'noticePeriod':
                if (value < 0) return 'Cannot be negative.';
                break;

            case 'dateOfBirth':
                if (!value) return 'Date of birth is required.';
                const dob = new Date(value);
                const today = new Date();
                if (dob > today) return 'Date of Birth cannot be in the future.';
                const age = calculateAge(value);
                if (isNaN(age) || age < 18) return 'Candidate must be at least 18 years old.';
                break;

            case 'maritalStatus':
                if (!value) return 'Select a marital status.';
                break;

            case 'linkedinProfile':
            case 'githubPortfolio':
                if (value && !/^https?:\/\/.+\..+/.test(value)) return 'Invalid URL.';
                break;

            case 'negotiable':
            case 'openToRelocation':
                if (value === "") return 'Please select an option.';
                break;

            case 'skillInput':
                if (!value.trim()) return 'Please enter a skill.';
                break;

            default:
                break;
        }

        return '';
    };

    // Calculate age from DOB
    const calculateAge = (dobString) => {
        if (!dobString) return NaN;

        const dob = new Date(dobString);
        const today = new Date();

        if (isNaN(dob.getTime())) return NaN;
        if (dob > today) return NaN;

        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        return age;
    };


    const validateForm = () => {
        const errors = {};
        const requiredFields = [
            "firstName", "middelName", "lastName", "email", "phoneNumber",
            "highestQualification", "yearsOfExperience", "dateOfBirth",
            "maritalStatus", "currentSalary", "expectedSalary",
            "negotiable", "preferredJobLocation", "openToRelocation", "skills"
        ];

        for (let field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === "") {
                errors[field] = "This field is required.";
            }
        }

        // Email format
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Invalid email format.";
        }

        // Phone number
        if (formData.phoneNumber && !/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = "Enter valid 10-digit phone number.";
        }

        // DOB & Age validation
        if (formData.dateOfBirth) {
            const age = calculateAge(formData.dateOfBirth);
            if (age < 18) {
                errors.dateOfBirth = "Candidate must be at least 18 years old.";
            }
        }

        // Skills required
        if (skillsList.length === 0) {
            errors.skillInput = "Please enter at least one skill.";
        }

        return errors;
    };


    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        let valToSet = value;

        if (type === "checkbox") {
            valToSet = checked;
        } else if (type === "file") {
            valToSet = files[0] || null;
        } else if (["firstName", "middelName", "lastName"].includes(name)) {
            valToSet = formatName(value);
        } else if (["negotiable", "openToRelocation"].includes(name)) {
            valToSet = value === "true"; // Convert string to boolean
        }

        const updatedFormData = { ...formData, [name]: valToSet };

        // If DOB is changed, calculate age and update it
        if (name === "dateOfBirth") {
            const age = calculateAge(valToSet);
            updatedFormData.age = !isNaN(age) ? `${age} years` : "";
        }

        // Real-time field validation
        const errorMessage = validateField(name, valToSet);
        setErrors((prev) => ({ ...prev, [name]: errorMessage }));

        setFormData(updatedFormData);
    };



    const handleFileChange = (e) => {
  const { name, files } = e.target;
  const file = files[0];

  if (!file) return;

  const maxSizes = {
    resume: 10 * 1024 * 1024, // 10 MB
    photo: 7 * 1024 * 1024,   // 7 MB
  };

  const allowedTypes = {
    resume: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    photo: ["image/jpeg", "image/png", "image/jpg", "image/gif"],
  };

  const fileType = file.type;
  const fileSize = file.size;

  // Validate file type
  if (!allowedTypes[name]?.includes(fileType)) {
    showToast(`Invalid file type for ${name}.`, "error");
    return;
  }

  // Validate file size
  if (fileSize > maxSizes[name]) {
    const mbLimit = name === "resume" ? 10 : 7;
    showToast(`${name.charAt(0).toUpperCase() + name.slice(1)} must be less than ${mbLimit}MB.`, "error");
    return;
  }

  // Set valid file
  setFormData((prev) => ({ ...prev, [name]: file }));
};



    // Add language tag on Enter
    const handleLanguageKeyDown = (e) => {
        if (e.key === "Enter" && currentLanguage.trim()) {
            e.preventDefault();
            if (!languagesList.includes(currentLanguage.trim())) {
                setLanguagesList((prev) => [...prev, currentLanguage.trim()]);
            }
            setCurrentLanguage("");
            setErrors((prev) => ({ ...prev, languagesKnown: "" }));
        }
    };

    const removeLanguage = (index) => {
        setLanguagesList((prev) => prev.filter((_, i) => i !== index));
    };

    // Add skill tag on Enter
    const handleSkillKeyDown = (e) => {
        if (e.key === "Enter" && currentSkill.trim()) {
            e.preventDefault();
            if (!skillsList.includes(currentSkill.trim())) {
                setSkillsList((prev) => [...prev, currentSkill.trim()]);
            }
            setCurrentSkill("");
            setErrors((prev) => ({ ...prev, skills: "" }));
        }
    };

    const removeSkill = (index) => {
        setSkillsList((prev) => prev.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast("Please fill all required fields correctly.", "error");

            // Scroll to first error
            const firstErrorField = Object.keys(validationErrors)[0];
            const el = document.querySelector(`[name="${firstErrorField}"]`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        // Prepare final form data to send (including languages & skills arrays)
        const payload = {
            ...formData,
            firstName: formatName(formData.firstName),
            middelName: formatName(formData.middelName),
            lastName: formatName(formData.lastName),
            languagesKnown: languagesList.join(", "),
            skills: skillsList.join(", "),
        };

        try {
            await axios.post(
                `http://${strings.localhost}/api/candidate/saveAll/${jobDescriptionId}/${companyId}`,
                [payload]
            );
            showToast("Candidate registered successfully!", "success");
            setShowUploadPopup(true);

            // Reset everything after success
            setFormData(emptyFormData);
            setLanguagesList([]);
            setSkillsList([]);
            setErrors({});
        } catch (error) {
            console.error(error);
            showToast("Failed to register candidate.", "error");
        }
    };


    const handleUpload = async () => {
        if (!selectedCandidate?.id || (!formData.resume && !formData.photo)) {
            showToast("Please select a file to upload.", "warning");
            return;
        }

        const uploadData = new FormData();
        if (formData.resume) uploadData.append("resume", formData.resume);
        if (formData.photo) uploadData.append("photo", formData.photo);

        try {
            await axios.post(
                `http://${strings.localhost}/api/candidate/upload/${selectedCandidate.id}`,
                uploadData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            showToast("Files uploaded successfully!", "success");
            setFormData(prev => ({ ...prev, resume: null, photo: null }));
        } catch (error) {
            showToast("Failed to upload files", "error");
        }
    };

    return (
        <div className="coreContainer">
            <div className="modal-overlay">
                <div className='modal-content'>
                    <button type="button" className="close-btn" onClick={onClose}>X</button>
                    <h3 className='centerText'>Candidate Request</h3>
                    <div className='input-row'>
                        <div>
                            <span className="required-marker">*</span>
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange} required
                            />
                            {errors.firstName && <small className="error">{errors.firstName}</small>}
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Middle Name</label>
                            <input
                                type="text"
                                name="middelName"
                                value={formData.middelName}
                                onChange={handleInputChange} required
                            />
                            {errors.middelName && <small className="error">{errors.middelName}</small>}
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange} required
                            />
                            {errors.lastName && <small className="error">{errors.lastName}</small>}
                        </div>
                    </div>
                    <div className='input-row'>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange} required
                            />
                            {errors.email && <small className="error">{errors.email}</small>}
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange} required
                                maxLength={10}
                            />
                            {errors.phoneNumber && <small className="error">{errors.phoneNumber}</small>}
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Highest Qualification</label>
                            <input
                                type="text"
                                name="highestQualification"
                                value={formData.highestQualification}
                                onChange={handleInputChange} required
                            />
                            {errors.highestQualification && <small className="error">{errors.highestQualification}</small>}
                        </div>
                    </div>
                    <div className='input-row'>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Years of Experience</label>
                            <input
                                className='selectIM'
                                type="number"
                                name="yearsOfExperience"
                                value={formData.yearsOfExperience}
                                onChange={handleInputChange} required
                            />
                            {errors.yearsOfExperience && <small className="error">{errors.yearsOfExperience}</small>}
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                className='selectIM'
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.dateOfBirth && <small className="error">{errors.dateOfBirth}</small>}
                        </div>
                        <div>
                            <label>Age</label>
                            <input type="text" name="age" value={formData.age} readOnly className="readonly" />
                        </div>
                    </div>
                    <div className='input-row'>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Marital Status</label>
                            <select name="maritalStatus" className='selectIM' value={formData.maritalStatus} onChange={handleInputChange} required>
                                <option value="" disabled hidden>Select</option>
                                {dropdownData.maritalstatus && dropdownData.maritalstatus.length > 0 ? (
                                    dropdownData.maritalstatus.map((option) => (
                                        <option key={option.masterId} value={option.data}>
                                            {option.data}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Marital Status Not available</option>
                                )}
                            </select>
                            {errors.maritalStatus && <span className="error">{errors.maritalStatus}</span>}
                        </div>
                        <div>
                            <label>Graduation University/College</label>
                            <input
                                type="text"
                                name="graduationUniversity"
                                value={formData.graduationUniversity}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Graduation Stream</label>
                            <input
                                type="text"
                                name="graduationStream"
                                value={formData.graduationStream}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className='input-row'>
                        <div>
                            <label>Post-Graduation Stream</label>
                            <input
                                type="text"
                                name="postGraduationStream"
                                value={formData.postGraduationStream}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>

                            <label>Total Experience (Years)</label>
                            <input
                                type="number"
                                name="totalExperience"
                                value={formData.totalExperience}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </div>
                        <div>
                            <label>Relevant Experience (Years)</label>
                            <input
                                type="number"
                                name="relevantExperience"
                                value={formData.relevantExperience}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </div>
                    </div>
                    <div className='input-row'>
                        <div>
                            <label>Previous Company</label>
                            <input
                                type="text"
                                name="previousCompanies"
                                value={formData.previousCompanies}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Designation in Last Job</label>
                            <input
                                type="text"
                                name="designationLastJob"
                                value={formData.designationLastJob}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Employment Gaps (if any)</label>
                            <input
                                type="text"
                                name="employmentGaps"
                                value={formData.employmentGaps}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className='input-row'>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Current Salary (CTC)</label>
                            <input
                                type="number"
                                className='selectIM'
                                name="currentSalary"
                                value={formData.currentSalary}
                                onChange={handleInputChange}
                                min="0"
                                required
                            />
                            {errors.currentSalary && <span className="error">{errors.currentSalary}</span>}
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Expected Salary (CTC)</label>
                            <input
                                type="number"
                                className="selectIM"
                                name="expectedSalary"
                                value={formData.expectedSalary}
                                onChange={handleInputChange}
                                min="0"
                                required
                            />
                            {errors.expectedSalary && <span className="error">{errors.expectedSalary}</span>}
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Negotiable</label>
                            <select
                                name="negotiable"
                                className="selectIM"
                                value={formData.negotiable}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="" disabled >Select</option>
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </select>
                            {errors.negotiable && (<span className="error">{errors.negotiable}</span>)}
                        </div>

                    </div>
                    <div className='input-row'>
                        <div>
                            <label>Notice Period (Days)</label>
                            <input
                                type="number"
                                name="noticePeriod"
                                value={formData.noticePeriod}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </div>
                        <div>
                            <label>Last Working Day (if serving)</label>
                            <input
                                type="date"
                                name="lastWorkingDay"
                                value={formData.lastWorkingDay}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Preferred Job Location</label>
                            <input
                                type="text"
                                name="preferredJobLocation"
                                value={formData.preferredJobLocation}
                                onChange={handleInputChange} required
                            />
                        </div>
                    </div>
                    <div className='input-row'>
                        <div>
                            <span className="required-marker">*</span>
                            <label> Open to relocate</label>
                            <select
                                name="openToRelocation"
                                className="selectIM"
                                value={formData.openToRelocation}
                                onChange={handleInputChange}
                                required
                            >
                                <option value='' disabled>Select</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                            {errors.openToRelocation && <span className="error">{errors.openToRelocation}</span>}
                        </div>
                        <div>
                            <label>LinkedIn Profile</label>
                            <input
                                type="url"
                                name="linkedinProfile"
                                value={formData.linkedinProfile}
                                onChange={handleInputChange}
                                placeholder="https://linkedin.com/in/username"
                            />
                            {errors.linkedinProfile && <small className="error">{errors.linkedinProfile}</small>}
                        </div>
                        <div>
                            <label>GitHub / Portfolio</label>
                            <input
                                type="url"
                                name="githubPortfolio"
                                value={formData.githubPortfolio}
                                onChange={handleInputChange}
                                placeholder="https://github.com/username"
                            />
                            {errors.githubPortfolio && <small className="error">{errors.githubPortfolio}</small>}
                        </div>
                    </div>
                    <div className='input-row'>
                        <div>
                            <label>Reason for Leaving</label>
                            <textarea
                                type="text"
                                name="reasonsForLeaving"
                                value={formData.reasonsForLeaving}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Languages Known</label>
                        <input
                            type="text"
                            name="skillInput"
                            value={currentLanguage}
                            onChange={(e) => setCurrentLanguage(e.target.value)}
                            onKeyDown={handleLanguageKeyDown}
                            placeholder="Type language and press Enter"
                        />
                        {languagesList.length > 0 && (
                            <ul className="skill-list">
                                {languagesList.map((lang, i) => (
                                    <li key={i}>
                                        {lang}{" "}
                                        <button type="button" onClick={() => removeLanguage(i)} className="remove-question-btn">
                                            &times;
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className='input-row'>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Skills</label>
                            <input
                                type="text"
                                name="skillInput"
                                value={currentSkill}
                                onChange={(e) => setCurrentSkill(e.target.value)}
                                onKeyDown={handleSkillKeyDown}
                                placeholder="Type skill and press Enter"
                                required
                            />
                            {errors.skills && <small className="error">{errors.skills}</small>}
                            {skillsList.length > 0 && (
                                <ul className="skill-list">
                                    {skillsList.map((skill, i) => (
                                        <li key={i}>
                                            {skill}{" "}
                                            <button type="button" onClick={() => removeSkill(i)} className="remove-question-btn">
                                                &times;
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="btnContainer">
                        <button className="btn" onClick={handleFormSubmit} >Register</button>
                        <button className="outline-btn" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>

            {showUploadPopup && selectedCandidate && (
                <div className='add-popup'>
                    <div className='popup-content'>
                        <label>Resume</label>
                        <input
                            type="file"
                            name="resume"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                        />
                        <label>Photo</label>
                        <input
                            type="file"
                            name="photo"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <button
                            className="btn"
                            onClick={handleUpload}
                        >
                            Upload
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateRegistration;

