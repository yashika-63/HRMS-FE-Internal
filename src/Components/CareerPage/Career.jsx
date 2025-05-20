import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { strings } from '../../string';
import '../CommonCss/Career.css';
 
const Career = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        middelName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        highestQualification: '',
        yearsOfExperience: '',
        skills: '',
        jobTitle: ''
    });
    const [errors, setErrors] = useState({});
    const [companyId, setCompanyId] = useState();
    const [jobDescriptionID, setJobDescriptionId] = useState();
    const [jobDescription, setJobDescription] = useState(null);
    const { jobkey } = useParams();
    const [logo, setLogo] = useState(null);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
 
    const arrayBufferToBase64 = (buffer) => {
        const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
        return window.btoa(binary);
    };
    useEffect(() => {
        const fetchJobDescription = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/jobdescription/getByJobKey/${jobkey}`);
                setJobDescription(response.data);
                setCompanyId(response.data.companyId);
                setJobDescriptionId(response.data.JobDescriptionId);
                alert(`Fetched job: ${response.data.jobTitle}`);
            } catch (error) {
                console.error("Error fetching job description:", error);
                const errorMessage =
                    error.response?.data?.message ||
                    error.response?.data ||
                    error.message ||
                    'Failed to fetch job description.';
                setHasError(true);
                setErrorMessage(errorMessage);
                alert(errorMessage);
            }
        };
        fetchJobDescription();
    }, []);
 
 
 
    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await axios.get(
                    `http://${strings.localhost}/api/company-document/view/activenew?companyId=${companyId}&documentIdentityKey=CompanyLogo`,
                    { responseType: "arraybuffer" }
                );
                const base64Logo = arrayBufferToBase64(response.data);
                setLogo(`data:image/png;base64,${base64Logo}`);
            } catch (error) {
                console.error("Error fetching logo:", error);
            }
        };
 
        if (companyId) fetchLogo();
    }, [companyId]);
 
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };
 
    const handleFormSubmit = async () => {
        if (!isFormValid()) {
            alert('Please fill in all required fields.');
            return;
        }
 
        const formattedData = {
            ...formData,
            firstName: formatName(formData.firstName),
            middelName: formatName(formData.middelName),
            lastName: formatName(formData.lastName),
            jobTitle: jobDescription?.jobTitle || formData.jobTitle,
        };
 
        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/candidate/saveAll/${jobDescriptionID}/${companyId}`,
                [formattedData]
            );
            alert("Candidate registered successfully!");
            setFormData({
                firstName: '',
                middelName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                highestQualification: '',
                yearsOfExperience: '',
                skills: '',
                jobTitle: ''
            });
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to register candidate");
        }
    };
 
    const isFormValid = () => {
        const newErrors = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'jobTitle') {
                validateField(key, value);
                if (!value.trim()) {
                    newErrors[key] = `${key} is required`;
                }
            }
        });
 
 
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.values(newErrors).every((err) => !err);
    };
 
    const formatName = (name) => {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    };
 
    const validateField = (name, value) => {
        let error = '';
        const nameRegex = /^[A-Z][a-zA-Z\s]*$/;
 
        switch (name) {
            case 'firstName':
            case 'middelName':
            case 'lastName':
                if (!value.trim()) {
                    error = `${name} is required`;
                } else if (!nameRegex.test(value)) {
                    error = `${name} must start with a capital letter and contain only letters`;
                }
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Invalid email';
                }
                break;
            case 'phoneNumber':
                if (!/^\d{10}$/.test(value)) {
                    error = 'Invalid phone number';
                }
                break;
            case 'yearsOfExperience':
                if (!/^\d+$/.test(value)) {
                    error = 'Only numbers allowed';
                }
                break;
            default:
                if (!value.trim()) {
                    error = `${name} is required`;
                }
        }
 
        setErrors((prev) => ({ ...prev, [name]: error }));
    };
    if (hasError) {
        return (
            <div className="coreContainer">
                <div className="careerPage">
                    <div className="formContainer" style={{ textAlign: 'center', padding: '40px' }}>
                        <h2>Best of luck for next time!</h2>
                        <p>{errorMessage}</p>
                    </div>
                </div>
            </div>
        );
    }
 
    return (
        <div className='coreContainer'>
 
 
            <div className='careerPage'>
                <div className="jobHeader">
 
                    <img src={logo} alt="Company Logo" width={120} height={30} /><br />
                    <p><strong>Date: </strong>{jobDescription?.date}</p>
 
                    <div className="jobInfo">
                        <h2 className='centerText'>{jobDescription?.companyName}</h2>
                        <h2 className='centerText'>{jobDescription?.jobTitle}</h2>
                    </div>
                    {jobDescription && (
                        <div className="jobdescription">
                            <ul>
 
                                <li><strong>Contact Person: </strong>{jobDescription.contactPerson}</li>
                                <li><strong>Email Id: </strong>{jobDescription.contactPersonEmail}</li>
                            </ul>
                        </div>
 
                    )}
                </div>
                {jobDescription && (
                    <div className="jobdescriptionDetails">
                        <ul>
                            <li><strong>Job Description: </strong>{jobDescription.jobDesc}</li><br />
                            <li><strong>Skills: </strong>{jobDescription.requiredSkills}</li>
                            <li><strong>Experience: </strong>{jobDescription.requiredExperience}</li>
 
                        </ul>
                    </div>
 
                )}
                <div className='formContainer'>
                    <div className="input-row">
                        <div>
                            <span className="required-marker">*</span>
                            <label>First Name:</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.firstName && <small className="error">{errors.firstName}</small>}
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Middle Name:</label>
                            <input
                                type="text"
                                name="middelName"
                                value={formData.middelName}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.middelName && <small className="error">{errors.middelName}</small>}
                        </div>
                    </div>
                    <div className="input-row">
                        <div>
                            <span className="required-marker">*</span>
                            <label>Last Name:</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.lastName && <small className="error">{errors.lastName}</small>}
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.email && <small className="error">{errors.email}</small>}
                        </div>
                    </div>
 
                    <div className="input-row">
                        <div>
                            <span className="required-marker">*</span>
                            <label>Mobile Number:</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.phoneNumber && <small className="error">{errors.phoneNumber}</small>}
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Highest Qualification:</label>
                            <input
                                type="text"
                                name="highestQualification"
                                value={formData.highestQualification}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.highestQualification && <small className="error">{errors.highestQualification}</small>}
                        </div>
                    </div>
 
                    <div className="input-row">
                        <div>
                            <span className="required-marker">*</span>
                            <label>Years of Experience:</label>
                            <input
                                className='selectIM'
                                type="number"
                                name="yearsOfExperience"
                                value={formData.yearsOfExperience}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.yearsOfExperience && <small className="error">{errors.yearsOfExperience}</small>}
                        </div>
                        <div>
                            <span className="required-marker">*</span>
                            <label>Job Title:</label>
                            <input
                                className='readonly'
                                type="text"
                                name="jobTitle"
                                value={jobDescription?.jobTitle || formData.jobTitle}
                                readOnly
 
                            />
                        </div>
                    </div>
                    <div className="input-row">
                        <div>
                            <span className="required-marker">*</span>
                            <label>Skills:</label>
                            <textarea
                                name="skills"
                                value={formData.skills}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.skills && <small className="error">{errors.skills}</small>}
                        </div>
                    </div>
                    <div className="btnContainer">
                        <button className="jobbtn" onClick={handleFormSubmit}>Register</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default Career;