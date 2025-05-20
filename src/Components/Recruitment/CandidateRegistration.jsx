// // CandidateRegistration.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import * as XLSX from 'xlsx';
// import { showToast } from '../../Api.jsx';
// import { strings } from '../../string.jsx';

// const CandidateRegistration = () => {
//     const { id } = useParams();
//     const companyId = localStorage.getItem("companyId");
//     const jobDescriptionId = id;
//     const [excelData, setExcelData] = useState([]);
//     const [candidates, setCandidates] = useState([]);
//     const [selectedCandidates, setSelectedCandidates] = useState({});
//     const [isExcelEditable, setIsExcelEditable] = useState(true);
//     const [showForm, setShowForm] = useState(false);
//     const [excelErrors, setExcelErrors] = useState({});

//     const [formData, setFormData] = useState({
//         firstName: '',
//         middelName: '',
//         lastName: '',
//         email: '',
//         phoneNumber: '',
//         highestQualification: '',
//         yearsOfExperience: '',
//         skills: '',
//         jobTitle: ''
//     });
//     const [errors, setErrors] = useState({});

//     const handleExcelUpload = (e) => {
//         const file = e.target.files[0];
//         const reader = new FileReader();

//         reader.onload = () => {
//             const workbook = XLSX.read(event.target.result, { type: 'binary' });
//             const sheetName = workbook.SheetNames[0];
//             const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//             const expectedFields = [
//                 'firstName',
//                 'middelName',
//                 'lastName',
//                 'email',
//                 'phoneNumber',
//                 'highestQualification',
//                 'yearsOfExperience',
//                 'skills',
//                 'jobTitle'
//             ];

//             const filteredData = rawData.map(row => {
//                 const formattedRow = {};
//                 expectedFields.forEach(field => {
//                     formattedRow[field] = row[field] ? row[field] : 'NA';
//                 });
//                 return formattedRow;
//             });

//             setExcelData(filteredData);
//         };

//         reader.readAsBinaryString(file);
//     };

//     const validateExcelRow = (row) => {
//         const nameRegex = /^[A-Z][a-zA-Z\s]*$/;
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         const phoneRegex = /^\d{10}$/;
    
//         const errors = [];
    
//         if (!nameRegex.test(row.firstName)) errors.push('First name must start with a capital letter');
//         if (!nameRegex.test(row.middelName)) errors.push('Middle name must start with a capital letter');
//         if (!nameRegex.test(row.lastName)) errors.push('Last name must start with a capital letter');
//         if (!emailRegex.test(row.email)) errors.push('Invalid email format');
//         if (!phoneRegex.test(row.phoneNumber)) errors.push('Phone number must be numeric and 10 digits');
//         if (!row.highestQualification.trim()) errors.push('Highest Qualification is required');
//         if (!row.yearsOfExperience.trim() || isNaN(row.yearsOfExperience)) errors.push('Years of experience must be a number');
//         if (!row.skills.trim()) errors.push('Skills are required');
//         if (!row.jobTitle.trim()) errors.push('Job Title is required');
    
//         return errors;
//     };
    
//     const handleToggleSelectAll = () => {
//         const allSelected = Object.keys(selectedCandidates).length === (candidates.length + excelData.length);
    
//         if (allSelected) {
//             setSelectedCandidates({});
//         } else {
//             const all = {};
//             [...candidates, ...excelData].forEach((row, index) => {
//                 const key = `${row.email}-${index}`;
//                 all[key] = row;
//             });
//             setSelectedCandidates(all);
//         }
//     };
    


//     const handleSaveExcelEdits = () => {
//         const invalidRows = [];
//         const newErrors = {};
    
//         excelData.forEach((row, index) => {
//             const errors = validateExcelRow(row);
//             if (errors.length > 0) {
//                 invalidRows.push(index);
//                 newErrors[index] = errors;
//             }
//         });
    
//         if (invalidRows.length > 0) {
//             setExcelErrors(newErrors);
//             showToast('Please fix errors in Excel data before saving.', 'error');
//             return;
//         }
    
//         setExcelErrors({});
//         setIsExcelEditable(false);
//         showToast('Excel data validated and saved. Fields locked for now.', 'success');
//     };
    


//     const handleEditExcelData = () => {
//         setIsExcelEditable(true);
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//         validateField(name, value);
//     };

//     const validateField = (name, value) => {
//         let error = '';
//         const nameRegex = /^[A-Z][a-zA-Z\s]*$/; // Starts with uppercase, only letters and spaces

//         switch (name) {
//             case 'firstName':
//             case 'middelName':
//             case 'lastName':
//                 if (!value.trim()) {
//                     error = `${name} is required`;
//                 } else if (!nameRegex.test(value)) {
//                     error = `${name} must start with a capital letter and contain only letters`;
//                 }
//                 break;
//             case 'email':
//                 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
//                     error = 'Invalid email';
//                 }
//                 break;
//             case 'phoneNumber':
//                 if (!/^\d{10}$/.test(value)) {
//                     error = 'Invalid phone number';
//                 }
//                 break;
//             case 'yearsOfExperience':
//                 if (!/^\d+$/.test(value)) {
//                     error = 'Only numbers allowed';
//                 }
//                 break;
//             default:
//                 if (!value.trim()) {
//                     error = `${name} is required`;
//                 }
//         }

//         setErrors((prev) => ({ ...prev, [name]: error }));
//     };


//     const isFormValid = () => {
//         const newErrors = {};
//         Object.entries(formData).forEach(([k, v]) => validateField(k, v));
//         return Object.values(errors).every(err => !err);
//     };

//     const formatName = (name) => {
//         return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
//     };

//     const handleFormSubmit = async () => {
//         if (!isFormValid()) {
//             showToast('Please fix form errors.', 'error');
//             return;
//         }

//         const formattedData = {
//             ...formData,
//             firstName: formatName(formData.firstName),
//             middelName: formatName(formData.middelName),
//             lastName: formatName(formData.lastName),
//         };

//         try {
//             const response = await axios.post(
//                 `http://${strings.localhost}/api/candidate/saveAll/${jobDescriptionId}/${companyId}`,
//                 [formattedData]
//             );
//             showToast("Candidate registered successfully!", "success");
//             fetchCandidates();
//             setShowForm(false);
//             setFormData({
//                 firstName: '',
//                 middelName: '',
//                 lastName: '',
//                 email: '',
//                 phoneNumber: '',
//                 highestQualification: '',
//                 yearsOfExperience: '',
//                 skills: '',
//                 jobTitle: ''
//             });
//         } catch (error) {
//             console.error("Error:", error);
//             showToast("Failed to register candidate", "error");
//         }
//     };


//     const fetchCandidates = async () => {
//         try {
//             const response = await axios.get(`http://${strings.localhost}/api/candidate/filter`, {
//                 params: {
//                     jobDescriptionId,
//                     status: true,
//                     shortListed: false,
//                     finalizedForInterview: false,
//                     selectedCandidate: false
//                 }
//             });

//             const data = response.data;

//             // Normalize fields with fallback 'NA' if missing
//             const normalized = data.map(candidate => ({
//                 firstName: candidate.firstName || 'NA',
//                 middelName: candidate.middelName || 'NA',
//                 lastName: candidate.lastName || 'NA',
//                 email: candidate.email || 'NA',
//                 phoneNumber: candidate.phoneNumber || 'NA',
//                 highestQualification: candidate.highestQualification || 'NA',
//                 yearsOfExperience: candidate.yearsOfExperience || 'NA',
//                 skills: candidate.skills || 'NA',
//                 jobTitle: candidate.jobTitle || 'NA'
//             }));

//             setCandidates(normalized);
//         } catch (error) {
//             console.error("Error fetching candidates:", error);
//             showToast("Failed to load candidates", "error");
//         }
//     };

//     useEffect(() => {
//         fetchCandidates();
//     }, [jobDescriptionId]);

//     const handleSaveSelected = async () => {
//         const candidatesToSave = Object.values(selectedCandidates);
//         if (candidatesToSave.length === 0) {
//             showToast("No candidates selected!", "warning");
//             return;
//         }

//         try {
//             const response = await axios.post(
//                 `http://${strings.localhost}/api/candidate/saveAll/${jobDescriptionId}/${companyId}`,
//                 candidatesToSave
//             );
//             showToast("Selected candidates saved successfully!", "success");
//             setSelectedCandidates({}); // Clear after save
//         } catch (error) {
//             console.error("Error saving selected candidates:", error);
//             showToast("Failed to save selected candidates", "error");
//         }
//     };

//     const getRandomColor = () => {
//         const letters = '0123456789ABCDEF';
//         let color = '#';
//         for (let i = 0; i < 6; i++) {
//             color += letters[Math.floor(Math.random() * 16)];
//         }
//         return color;
//     };


//     return (
//         <div className="coreContainer">
//             {/* <h2>Candidate Registration</h2> */}

//             <div className="form-controls">
//                 <label htmlFor="excelUpload" className="btn">Upload Excel</label>
//                 <input
//                     type="file"
//                     id="excelUpload"
//                     accept=".xlsx, .xls"
//                     style={{ display: 'none' }}
//                     onChange={handleExcelUpload}
//                 />
//                 <button className="btn" onClick={() => setShowForm(true)}>Register Candidate</button>
//             </div>
          
//             {(excelData.length > 0 || candidates.length > 0) && (
//                         <table className='recruitment-table'>
//                             <thead>
//                                 <tr>
//                                     <th>Select</th>
//                                     <th>Initials</th>
//                                     {[
//                                         { key: 'firstName', label: 'First Name' },
//                                         { key: 'middelName', label: 'Middle Name' },
//                                         { key: 'lastName', label: 'Last Name' },
//                                         { key: 'email', label: 'Email' },
//                                         { key: 'phoneNumber', label: 'Phone Number' },
//                                         { key: 'highestQualification', label: 'Highest Qualification' },
//                                         { key: 'yearsOfExperience', label: 'Years of Experience' },
//                                         { key: 'skills', label: 'Skills' },
//                                         { key: 'jobTitle', label: 'Job Title' }
//                                     ].map((column, index) => (
//                                         <th key={index}>{column.label}</th>
//                                     ))}
//                                 </tr>
//                             </thead>

//                             <tbody>
//                                 {candidates.map((row, index) => {
//                                     const candidateKey = `${row.email}-cand-${index}`;
//                                     const getInitials = (name) => name ? name[0].toUpperCase() : '';
//                                     return (
//                                         <tr key={candidateKey}>
//                                             <td>
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={!!selectedCandidates[candidateKey]}
//                                                     onChange={() =>
//                                                         setSelectedCandidates(prev => ({
//                                                             ...prev,
//                                                             [candidateKey]: prev[candidateKey] ? null : row
//                                                         }))
//                                                     }
//                                                 />
//                                             </td>
//                                             <td className="avatar" style={{ backgroundColor: getRandomColor() }}>
//                                                 {getInitials(row.firstName)}
//                                             </td>
//                                             {[
//                                                 'firstName', 'middelName', 'lastName', 'email', 'phoneNumber',
//                                                 'highestQualification', 'yearsOfExperience', 'skills', 'jobTitle'
//                                             ].map((fieldKey, i) => (
//                                                 <td key={i}>{row[fieldKey]}</td>
//                                             ))}
//                                         </tr>
//                                     );
//                                 })}

// {excelData.map((row, index) => {
//     const candidateKey = `${row.email}-excel-${index}`;
//     const getInitials = (name) => name ? name[0].toUpperCase() : '';
//     return (
//         <tr key={candidateKey}>
//             <td>
//                 <input
//                     type="checkbox"
//                     checked={!!selectedCandidates[candidateKey]}
//                     onChange={() =>
//                         setSelectedCandidates(prev => ({
//                             ...prev,
//                             [candidateKey]: prev[candidateKey] ? null : row
//                         }))
//                     }
//                 />
//             </td>
//             <td className="avatar" style={{ backgroundColor: getRandomColor() }}>
//                 {getInitials(row.firstName)}
//             </td>
//             {[
//                 'firstName', 'middelName', 'lastName', 'email', 'phoneNumber',
//                 'highestQualification', 'yearsOfExperience', 'skills', 'jobTitle'
//             ].map((fieldKey, i) => (
//                 <td key={i}>
//                     <input
//                         type="text"
//                         value={row[fieldKey]}
//                         onChange={(e) => {
//                             const updated = [...excelData];
//                             updated[index] = { ...updated[index], [fieldKey]: e.target.value };
//                             setExcelData(updated);
//                         }}
//                         readOnly={!isExcelEditable}
//                         style={{
//                             width: '100%',
//                             padding: '4px',
//                             backgroundColor: isExcelEditable
//                                 ? (row[fieldKey] === 'NA' ? '#fff3cd' : 'white')
//                                 : '#f4f4f4',
//                             border: isExcelEditable ? '1px solid #ccc' : 'none',
//                         }}
//                     />
//                     {excelErrors[index] && excelErrors[index].includes(`${fieldKey} is required`) && (
//                         <small className="error">This field is required</small>
//                     )}
//                 </td>
//             ))}
//         </tr>
//     );
// })}

//                             </tbody>
//                         </table> 
//             )}
     
//             {excelData.length > 0 && (
//                 <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
//                     {isExcelEditable ? (
//                         <button className="btn" onClick={handleSaveExcelEdits}>
//                             Save All Excel Edits
//                         </button>
//                     ) : (
//                         <button className="outline-btn" onClick={handleEditExcelData}>
//                             Edit Excel Data
//                         </button>
//                     )}

//                     {Object.keys(selectedCandidates).length > 0 && (
//                         <button className="btn" onClick={handleSaveSelected}    disabled={Object.keys(selectedCandidates).length === 0}>
//                             Save Selected Candidates
//                         </button>
//                     )}
//                     <button className="btn" onClick={handleSaveSelected} disabled={Object.keys(selectedCandidates).length === 0}>
//     Save Details
// </button>

//                     <button className="outline-btn" onClick={handleToggleSelectAll}>
//                         {Object.keys(selectedCandidates).length === (candidates.length + excelData.length) ? "Deselect All" : "Select All"}
//                     </button>

//                 </div>
//             )}


//             {showForm && (
//                 <div className="add-popup">
//                     <h3 className='centerText'>Register Candidate</h3>
//                     <div className='popup-content'>
//                         <div className='input-row'>
//                             <div>
//                                 <span className="required-marker">*</span>
//                                 <label>First Name:</label>
//                                 <input
//                                     type="text"
//                                     name="firstName"
//                                     value={formData.firstName}
//                                     onChange={handleInputChange} required
//                                 />
//                                 {errors.firstName && <small className="error">{errors.firstName}</small>}
//                             </div>
//                             <div>
//                                 <span className="required-marker">*</span>
//                                 <label>Middle Name:</label>
//                                 <input
//                                     type="text"
//                                     name="middelName"
//                                     value={formData.middelName}
//                                     onChange={handleInputChange} required
//                                 />
//                                 {errors.middelName && <small className="error">{errors.middelName}</small>}
//                             </div>
//                         </div>
//                         <div className='input-row'>
//                             <div>
//                                 <span className="required-marker">*</span>
//                                 <label>Last Name:</label>
//                                 <input
//                                     type="text"
//                                     name="lastName"
//                                     value={formData.lastName}
//                                     onChange={handleInputChange} required
//                                 />
//                                 {errors.lastName && <small className="error">{errors.lastName}</small>}
//                             </div>
//                             <div>
//                                 <span className="required-marker">*</span>
//                                 <label>Email:</label>
//                                 <input
//     type="email"
//     name="email"
//     value={row.email}  // Ensure this value is directly bound to the state.
//     onChange={(e) => {
//         const updated = [...excelData];
//         updated[index] = { ...updated[index], email: e.target.value };  // Properly update the email value in the state.
//         setExcelData(updated);
//     }}
//     readOnly={!isExcelEditable}  // Ensure this is handled properly.
//     style={{
//         width: '100%',
//         padding: '4px',
//         backgroundColor: isExcelEditable
//             ? (row.email === 'NA' ? '#fff3cd' : 'white')
//             : '#f4f4f4',
//         border: isExcelEditable ? '1px solid #ccc' : 'none',
//     }}
// />

//                                 {errors.email && <small className="error">{errors.email}</small>}
//                             </div>
//                         </div>
//                         <div className='input-row' >
//                             <div>
//                                 <span className="required-marker">*</span>
//                                 <label>Phone Number:</label>
//                                 <input
//                                     type="text"
//                                     name="phoneNumber"
//                                     value={formData.phoneNumber}
//                                     onChange={handleInputChange} required
//                                 />
//                                 {errors.phoneNumber && <small className="error">{errors.phoneNumber}</small>}
//                             </div>
//                             <div>
//                                 <span className="required-marker">*</span>
//                                 <label>Highest Qualification:</label>
//                                 <input
//                                     type="text"
//                                     name="highestQualification"
//                                     value={formData.highestQualification}
//                                     onChange={handleInputChange} required
//                                 />
//                                 {errors.highestQualification && <small className="error">{errors.highestQualification}</small>}
//                             </div>
//                         </div>
//                         <div className='input-row'>
//                             <div>
//                                 <span className="required-marker">*</span>
//                                 <label>Years of Experience:</label>
//                                 <input
//                                     className='selectIM'
//                                     type="number"
//                                     name="yearsOfExperience"
//                                     value={formData.yearsOfExperience}
//                                     onChange={handleInputChange} required
//                                 />
//                                 {errors.yearsOfExperience && <small className="error">{errors.yearsOfExperience}</small>}
//                             </div>
//                             <div>
//                                 <span className="required-marker">*</span>
//                                 <label>Job Title:</label>
//                                 <input
//                                     type="text"
//                                     name="jobTitle"
//                                     value={formData.jobTitle}
//                                     onChange={handleInputChange} required
//                                 />
//                                 {errors.jobTitle && <small className="error">{errors.jobTitle}</small>}
//                             </div>
//                         </div>
//                         <div className='input-row'>
//                             <div>
//                                 <span className="required-marker">*</span>
//                                 <label>Skills:</label>
//                                 <textarea
//                                     type="text"
//                                     name="skills"
//                                     value={formData.skills}
//                                     onChange={handleInputChange} required
//                                 />
//                                 {errors.skills && <small className="error">{errors.skills}</small>}
//                             </div>
//                         </div>
//                     </div>

//                     <div className="btnContainer">
//                         <button className="btn" onClick={handleFormSubmit}>Register</button>
//                         <button className="outline-btn" onClick={() => setShowForm(false)}>Cancel</button>
//                     </div>

//                 </div>
//             )}
//         </div>
//     );
// };

// export default CandidateRegistration;

















import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../../Api.jsx';
import { strings } from '../../string.jsx';

const CandidateRegistration = () => {
    const { id } = useParams();
    const companyId = localStorage.getItem("companyId");
    const jobDescriptionId = id;
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedCandidates, setSelectedCandidates] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [jobDescription, setJobDescription] = useState(null);
    const [shortlistedResponse, setShortlistedResponse] = useState([]);

    const [showShortlistPopup, setShowShortlistPopup] = useState(false);
    const [shortlistCount, setShortlistCount] = useState('');

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

    // Handle input change for registration form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const handleShortlistCandidates = async () => {
        if (!shortlistCount || isNaN(shortlistCount) || shortlistCount <= 0) {
            showToast("Please enter a valid number of candidates.", "warning");
            return;
        }

        try {
            const response = await axios.post(`http://${strings.localhost}/api/ai/shortlist-candidates`, {
                // jobDescriptionId,
                // companyId,
                topN: parseInt(shortlistCount),
                candidates: candidates, // send normalized candidates as formData
                requirement: jobDescription // send jobDescription of first entry

            });

            if (response.data && Array.isArray(response.data)) {
                setShortlistedResponse(response.data);
                showToast("Shortlisted candidates successfully!", "success");
                fetchCandidates(); // reload the list
            } else {
                showToast("Unexpected response from server", "error");
            }

            setShortlistCount('');
        } catch (error) {
            console.error("Error shortlisting candidates:", error);
            showToast("Failed to shortlist candidates", "error");
        }
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

    const isFormValid = () => {
        const newErrors = {};
        // Validate each field and store errors
        Object.entries(formData).forEach(([key, value]) => {
            validateField(key, value);
            if (!value.trim()) {
                newErrors[key] = `${key} is required`;
            }
        });

        // If there are errors, return false
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.values(newErrors).every((err) => !err); // Returns true if no errors
    };


    const formatName = (name) => {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    };

    const handleFormSubmit = async () => {
        if (!isFormValid()) {
            showToast('Please fill in all required fields.', 'error'); // Show error toast if form is invalid
            return;
        }

        const formattedData = {
            ...formData,
            firstName: formatName(formData.firstName),
            middelName: formatName(formData.middelName),
            lastName: formatName(formData.lastName),
        };

        try {
            const response = await axios.post(
                `http://${strings.localhost}/api/candidate/saveAll/${jobDescriptionId}/${companyId}`,
                [formattedData]
            );
            showToast("Candidate registered successfully!", "success");
            fetchCandidates();
            setShowForm(false);
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
            showToast("Failed to register candidate", "error");
        }
    };

    // Fetch candidates from API
    const fetchCandidates = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/candidate/filter`, {
                params: {
                    jobDescriptionId,
                    status: true,
                    shortListed: false,
                    finalizedForInterview: false,
                    selectedCandidate: false
                }
            });

            const data = response.data;

            if (data.length > 0 && data[0].jobDescription) {
                const { jobDesc, jobTitle, requiredSkills, requiredExperience } = data[0].jobDescription;

                const jobDescriptionString = `Looking for a ${jobTitle} with ${requiredSkills} and at least ${requiredExperience} years experience. ${jobDesc}`;

                setJobDescription(jobDescriptionString);
            }



            // Normalize fields with fallback 'NA' if missing
            const normalized = data.map(candidate => ({
                id: candidate.id,
                firstName: candidate.firstName || 'NA',
                middelName: candidate.middelName || 'NA',
                lastName: candidate.lastName || 'NA',
                email: candidate.email || 'NA',
                phoneNumber: candidate.phoneNumber || 'NA',
                highestQualification: candidate.highestQualification || 'NA',
                yearsOfExperience: candidate.yearsOfExperience || 'NA',
                skills: candidate.skills || 'NA',
                jobTitle: candidate.jobTitle || 'NA'
              
            }));

            setCandidates(normalized);
        } catch (error) {
            console.error("Error fetching candidates:", error);
            showToast("Failed to load candidates", "error");
        }
    };

    // Select/Deselect all candidates
    const handleToggleSelectAll = () => {
        const allSelected = Object.keys(selectedCandidates).length === candidates.length;

        if (allSelected) {
            setSelectedCandidates({});
        } else {
            const all = {};
            candidates.forEach((row, index) => {
                const key = `${row.email}-cand-${index}`;
                all[key] = row;
            });
            setSelectedCandidates(all);
        }
    };

    const handleSaveSelected = async () => {
        const candidatesToSave = Object.values(selectedCandidates);
        console.log("candidatesToSave", candidatesToSave);
    
        if (candidatesToSave.length === 0) {
            showToast("No candidates selected!", "warning");
            return;
        }
    
        const candidatesWithShortlisted = candidatesToSave.map(candidate => ({
            id: candidate.id,        
            shortListed: true
        }));
    
        try {
            const response = await axios.put(
                `http://${strings.localhost}/api/candidate/updateMultiple`,
                candidatesWithShortlisted
            );
            showToast("Selected candidates saved successfully!", "success");
            setSelectedCandidates({});
            fetchCandidates();
        } catch (error) {
            console.error("Error saving selected candidates:", error);
            showToast("Failed to save selected candidates", "error");
        }
    };

    const saveShortlistedCandidates = async (candidates) => {
        const candidatesWithShortlisted = candidates.map(candidate => ({
            id: candidate.id,
            shortListed: true
        }));
    
        try {
            const response = await axios.put(
                `http://${strings.localhost}/api/candidate/updateMultiple`,
                candidatesWithShortlisted
            );
            if (response.data) {
                showToast("Selected candidates saved successfully!", "success");
                setShortlistedResponse([]); // Clear the shortlisted candidates after saving
                fetchCandidates(); // Reload the candidates list
            } else {
                showToast("Failed to save selected candidates", "error");
            }
        } catch (error) {
            console.error("Error saving shortlisted candidates:", error);
            showToast("Failed to save selected candidates", "error");
        }
    };
    
    

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // Fetch candidates on mount
    useEffect(() => {
        fetchCandidates();
    }, [jobDescriptionId]);


    const handleSelectCandidate = (candidate) => {
        setSelectedCandidate(candidate); // Set the selected candidate
    };

    const handleCloseDetailPopup = () => {
        setSelectedCandidate(null); // Close the detail popup
    };

    return (
        <div className="coreContainer">
            <div className="form-controls">
                <button className="btn" onClick={() => setShowForm(true)}>Register Candidate</button>
            </div>
            <div class="table-wrapper">


                {candidates.length > 0 && (
                    <table className='recruitment-table'>
                        <thead>
                            <tr>
                             
                                <th></th>
                                {['Name', 'Email', 'Mobile Number', 'Highest Qualification'].map((column, index) => (
                                    <th key={index}>{column}</th>
                                ))}
                                   <th>Select</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((row, index) => {
                                const candidateKey = `${row.email}-cand-${index}`;
                                const getInitials = (name) => name ? name[0].toUpperCase() : '';
                                const fullName = `${row.firstName} ${row.middelName} ${row.lastName}`;
                                return (
                                    <tr key={candidateKey}>

                                       
                                        <td className="Ravatar"  onClick={() => handleSelectCandidate(row)} style={{cursor: 'pointer'}}>
                                            {getInitials(row.firstName)}
                                        </td>
                                        <td  onClick={() => handleSelectCandidate(row)} style={{cursor: 'pointer'}}>{fullName}</td>
                                        {['email', 'phoneNumber', 'highestQualification'].map((fieldKey, i) => (
                                            <td key={i}>{row[fieldKey]}</td>
                                        ))}
                                         <td>
                                            <input
                                                type="checkbox"
                                                checked={!!selectedCandidates[candidateKey]}
                                                onChange={() =>
                                                    setSelectedCandidates(prev => ({
                                                        ...prev,
                                                        [candidateKey]: prev[candidateKey] ? null : row
                                                    }))
                                                }
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            {candidates.length > 0 && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button className="btn" onClick={handleSaveSelected} disabled={Object.keys(selectedCandidates).length === 0}>
                        Save Selected Candidates
                    </button>
                    <button className="outline-btn" onClick={handleToggleSelectAll}>
                        {Object.keys(selectedCandidates).length === candidates.length ? "Deselect All" : "Select All"}
                    </button>
                </div>
            )}
  <div className='form-controls'>
       <div>
  <button className="ai-button" onClick={() => setShowShortlistPopup(true)}>
    <span className="sparkle">✨</span>
    AI Shortlist Candidates
  </button>
</div>
</div>

            {showForm && (
                <div className="add-popup">
                    <h3 className='centerText'>Register Candidate</h3>
                    <div className='popup-content'>
                        {/* Registration form inputs */}
                        <div className='input-row'>
                            <div>
                                <span className="required-marker">*</span>
                                <label>First Name:</label>
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
                                <label>Middle Name:</label>
                                <input
                                    type="text"
                                    name="middelName"
                                    value={formData.middelName}
                                    onChange={handleInputChange} required
                                />
                                {errors.middelName && <small className="error">{errors.middelName}</small>}
                            </div>
                        </div>
                        <div className='input-row'>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Last Name:</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange} required
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
                                    onChange={handleInputChange} required
                                />
                                {errors.email && <small className="error">{errors.email}</small>}
                            </div>
                        </div>
                        <div className='input-row'>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Phone Number:</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange} required
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
                                    onChange={handleInputChange} required
                                />
                                {errors.highestQualification && <small className="error">{errors.highestQualification}</small>}
                            </div>
                        </div>
                        <div className='input-row'>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Years of Experience:</label>
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
                                <label>Job Title:</label>
                                <input
                                    type="text"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleInputChange} required
                                />
                                {errors.jobTitle && <small className="error">{errors.jobTitle}</small>}
                            </div>
                        </div>
                        <div className='input-row'>
                            <div>
                                <span className="required-marker">*</span>
                                <label>Skills:</label>
                                <textarea
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleInputChange} required
                                />
                                {errors.skills && <small className="error">{errors.skills}</small>}
                            </div>
                        </div>
                    </div>

                    <div className="btnContainer">
                        <button className="btn" onClick={handleFormSubmit}>Register</button>
                        <button className="outline-btn" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}
            {selectedCandidate && (
                <div className="add-popup">
                    <h3 className='centerText'>Candidate Details</h3>
                    <div>
                            <div><strong> Name:  </strong>{`${selectedCandidate.firstName} ${selectedCandidate.middelName} ${selectedCandidate.lastName}`}</div>
                            <br/>
                            <div><strong>Email: </strong>{selectedCandidate.email}</div>  <br/>
                            <div><strong>Phone Number: </strong>{selectedCandidate.phoneNumber}</div>  <br/>
                            <div><strong>Highest Qualification: </strong>{selectedCandidate.highestQualification}</div>  <br/>
                            <div><strong>Years of Experience: </strong>{selectedCandidate.yearsOfExperience}</div>  <br/>
                            <div><strong>Skills: </strong>{selectedCandidate.skills}</div>  <br/>
                            <div><strong>Job Title: </strong>{selectedCandidate.jobTitle}</div>  <br/>
                            <div className='btnContainer'>
                        <button className="outline-btn" onClick={handleCloseDetailPopup}>Close</button>
                    </div>
                    </div>
                </div>
            )}

            {showShortlistPopup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button type='button' className='close-btn' onClick={() => { setShowShortlistPopup(false) }}>X</button>
                        <h3 className='centerText'>Shortlist Candidates Using AI</h3>
                        <div className='row'>
                            <input
                            className='selectIM'
                                type="number"
                                placeholder="Number of candidates to shortlist"
                                value={shortlistCount}
                                onChange={(e) => setShortlistCount(e.target.value)}
                            />
                        </div>
                        <div className='btnContainer'>
                            <button className="ai-button" onClick={handleShortlistCandidates}>Shortlist</button>
                            <button className="outline-btn" onClick={() => {
                                setShowShortlistPopup(false);
                                setShortlistedResponse([]);
                                setShortlistCount('');
                            }}>Cancel</button>
                        </div>

                        {shortlistedResponse.length > 0 && (
                            <div>
                                <h4 className='underlineText'>Shortlisted Candidates:</h4>
                                <table className='interview-table'>
                                    <thead>
                                        <tr>
                                            <th>First Name</th>
                                            <th>Middle Name</th>
                                            <th>Last Name</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shortlistedResponse.map((candidate, index) => (
                                            <tr key={index}>
                                                <td> {candidate.firstName} </td>
                                                <td>{candidate.middelName}</td>
                                                <td>{candidate.lastName}</td>
                                                <td>{candidate.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
<div className='form-controls'> 
    <button type='button' className="ai-button"   onClick={() => saveShortlistedCandidates(shortlistedResponse)} >Shortlist</button>
</div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CandidateRegistration;












































// // CandidateRegistration.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import * as XLSX from 'xlsx';
// import { showToast } from '../../Api.jsx';
// import { strings } from '../../string.jsx';

// const CandidateRegistration = () => {
//     const { id } = useParams();
//     const companyId = localStorage.getItem("companyId");
//     const jobDescriptionId = id;
//     const shownFieldErrors = React.useRef({});

//     const [excelData, setExcelData] = useState([]);
//     const [candidates, setCandidates] = useState([]);
//     const [selectedCandidates, setSelectedCandidates] = useState({});
//     const [isExcelEditable, setIsExcelEditable] = useState(true);
//     const [showForm, setShowForm] = useState(false);
//     const [formData, setFormData] = useState(initialFormState());

//     function initialFormState() {
//         return {
//             firstName: '', middelName: '', lastName: '', email: '',
//             phoneNumber: '', highestQualification: '', yearsOfExperience: '',
//             skills: '', jobTitle: ''
//         };
//     }

//     useEffect(() => {
//         fetchCandidates();
//     }, [jobDescriptionId]);

//     const validateField = (field, value) => {
//         const nameRegex = /^[A-Z][a-zA-Z\s]*$/;
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         const phoneRegex = /^\d{10}$/;

//         switch (field) {
//             case 'firstName':
//             case 'middelName':
//             case 'lastName':
//                 return !nameRegex.test(value) ? 'Must start with a capital letter and contain only letters' : '';
//             case 'email':
//                 return !emailRegex.test(value) ? 'Invalid email' : '';
//             case 'phoneNumber':
//                 return !phoneRegex.test(value) ? 'Must be 10 digit numeric' : '';
//             case 'highestQualification':
//             case 'skills':
//             case 'jobTitle':
//                 return !value.trim() ? 'Required' : '';
//             case 'yearsOfExperience':
//                 return isNaN(value) || !value.trim() ? 'Must be a number' : '';
//             default:
//                 return '';
//         }
//     };

//     const validateRow = (row) => {
//         const errors = {};
//         Object.entries(row).forEach(([key, value]) => {
//             const err = validateField(key, value);
//             if (err) errors[key] = err;
//         });
//         return errors;
//     };

//     const handleExcelUpload = (e) => {
//         const file = e.target.files[0];
//         const reader = new FileReader();

//         reader.onload = (event) => {
//             const workbook = XLSX.read(event.target.result, { type: 'binary' });
//             const sheet = workbook.Sheets[workbook.SheetNames[0]];
//             const raw = XLSX.utils.sheet_to_json(sheet);

//             const formatted = raw.map(row => ({
//                 firstName: row.firstName || '',
//                 middelName: row.middelName || '',
//                 lastName: row.lastName || '',
//                 email: row.email || '',
//                 phoneNumber: row.phoneNumber || '',
//                 highestQualification: row.highestQualification || '',
//                 yearsOfExperience: row.yearsOfExperience || '',
//                 skills: row.skills || '',
//                 jobTitle: row.jobTitle || '',
//                 source: 'excel'
//             }));

//             setExcelData(formatted);
//         };

//         reader.readAsBinaryString(file);
//     };

//     const handleFieldChange = (index, field, value) => {
//         const updated = [...excelData];
//         updated[index][field] = value;
//         setExcelData(updated);
//     };

//     const handleFormInput = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
    
//         const error = validateField(name, value);
//         if (error && !shownFieldErrors.current[`form-${name}`]) {
//             showToast(`${name}: ${error}`, 'error');
//             shownFieldErrors.current[`form-${name}`] = true;
//         } else if (!error) {
//             delete shownFieldErrors.current[`form-${name}`];
//         }
//     };
    

//     const handleFormSubmit = async () => {
//         const errors = validateRow(formData);
//         if (Object.keys(errors).length > 0) {
//             showToast(Object.values(errors).join(', '), 'error');
//             return;
//         }

//         try {
//             await axios.post(`http://${strings.localhost}/api/candidate/saveAll/${jobDescriptionId}/${companyId}`, [formData]);
//             showToast("Candidate registered successfully!", "success");
//             fetchCandidates();
//             setFormData(initialFormState());
//             setShowForm(false);
//         } catch {
//             showToast("Failed to register candidate", "error");
//         }
//     };

//     const fetchCandidates = async () => {
//         try {
//             const res = await axios.get(`http://${strings.localhost}/api/candidate/filter`, {
//                 params: {
//                     jobDescriptionId,
//                     status: true,
//                     shortListed: false,
//                     finalizedForInterview: false,
//                     selectedCandidate: false
//                 }
//             });

//             const cleaned = res.data.map(c => ({
//                 ...c,
//                 source: 'db'
//             }));

//             setCandidates(cleaned);
//         } catch {
//             showToast("Failed to load candidates", "error");
//         }
//     };

//     const handleSaveSelected = async () => {
//         const selected = Object.values(selectedCandidates);
//         if (selected.length === 0) return;

//         try {
//             await axios.post(`http://${strings.localhost}/savecheckedcandidate/${companyId}`, selected);
//             showToast("Candidates saved successfully", "success");
//             setSelectedCandidates({});
//         } catch {
//             showToast("Failed to save selected", "error");
//         }
//     };

//     const toggleAllSelection = () => {
//         const allRows = [...candidates, ...excelData];
//         if (Object.keys(selectedCandidates).length === allRows.length) {
//             setSelectedCandidates({});
//         } else {
//             const selected = {};
//             allRows.forEach((row, i) => {
//                 selected[`${row.email}-${i}`] = row;
//             });
//             setSelectedCandidates(selected);
//         }
//     };

//     const exportToExcel = () => {
//         const dataToExport = [...candidates, ...excelData].map(row => {
//             const { source, ...exportRow } = row;
//             return exportRow;
//         });
//         const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
//         XLSX.writeFile(workbook, "Candidate_List.xlsx");
//     };

//     const deleteExcelRow = (index) => {
//         const updated = [...excelData];
//         updated.splice(index, 1);
//         setExcelData(updated);
//     };
//     const indexOfExcelData = (index) => index - candidates.length;

//     return (
//         <div className="coreContainer">
//             <div className="form-controls">
//                 <label htmlFor="excelUpload" className="btn">Upload Excel</label>
//                 <input id="excelUpload" type="file" accept=".xlsx, .xls" style={{ display: 'none' }} onChange={handleExcelUpload} />
//                 <button className="btn" onClick={() => setShowForm(true)}>Register Manually</button>
//             </div>

//             <div className="recruitment-table-container">
//                 <table className="recruitment-table">
//                     <thead>
//                         <tr>
//                             <th>Select</th>
//                             <th>Initial</th>
//                             {Object.keys(formData).map((field, i) => (
//                                 <th key={i}>{field}</th>
//                             ))}
//                             <th>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {[...candidates, ...excelData].map((row, index) => {
//                             const isExcel = row.source === 'excel';
//                             const rowKey = `${row.email}-${index}`;
//                             const rowErrors = isExcel ? validateRow(row) : {};
//                             return (
//                                 <tr key={rowKey} style={{ backgroundColor: isExcel ? '#eaf4ff' : 'white' }}>
//                                     <td>
//                                         <input
//                                             type="checkbox"
//                                             checked={!!selectedCandidates[rowKey]}
//                                             onChange={() => {
//                                                 setSelectedCandidates(prev => ({
//                                                     ...prev,
//                                                     [rowKey]: prev[rowKey] ? null : row
//                                                 }));
//                                             }}
//                                         />
//                                     </td>
//                                     <td>{row.firstName?.[0]?.toUpperCase()}</td>
//                                     {Object.keys(formData).map((field, i) => (
//                                         <td key={i}>
//                                             {isExcel ? (
//                                                 <input
//                                                     type="text"
//                                                     value={row[field]}
//                                                     onChange={e => handleFieldChange(indexOfExcelData(index), field, e.target.value)}
//                                                     className={rowErrors[field] ? 'input-error' : ''}
//                                                 />
//                                             ) : row[field]}
//                                         </td>
//                                     ))}
//                                     <td>
//                                         {isExcel && (
//                                             <button onClick={() => deleteExcelRow(index - candidates.length)} className="delete-btn">Delete</button>
//                                         )}
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>

//             <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
//                 <button className="btn" onClick={toggleAllSelection}>
//                     {Object.keys(selectedCandidates).length === (candidates.length + excelData.length) ? 'Deselect All' : 'Select All'}
//                 </button>
//                 <button className="btn" onClick={handleSaveSelected}>Save Selected</button>
//                 <button className="btn" onClick={exportToExcel}>Export to Excel</button>
//             </div>

//             {showForm && (
//                 <div className="add-popup">
//                     <h3>Register Candidate</h3>
//                     <div className="popup-content">
//                         {Object.entries(formData).map(([field, value], i) => (
//                             <div key={i} style={{ marginBottom: 10 }}>
//                                 <label>{field}:</label>
//                                 <input
//                                     type="text"
//                                     name={field}
//                                     value={value}
//                                     onChange={handleFormInput}
//                                     className={validateField(field, value) ? 'input-error' : ''}
//                                 />
//                             </div>
//                         ))}
//                     </div>
//                     <div className="btnContainer">
//                         <button className="btn" onClick={handleFormSubmit}>Register</button>
//                         <button className="outline-btn" onClick={() => setShowForm(false)}>Cancel</button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CandidateRegistration;
