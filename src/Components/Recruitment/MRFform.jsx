import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';

const MRFform = () => {
    const [formData, setFormData] = useState({
        requestorName: '',
        department: '',
        position: '',
        contactEmail: '',
        contactPhone: '',
        jobTitle: '',
        numberOfPositions: '',
        reasonForRequest: '',
        durationType: '',
        startDate: '',
        endDate: '',
        technologies: [], // Technologies selected by the user
        qualifications: '',
        budgetSalary: '',
        approval: '',
    });

    const [errors, setErrors] = useState({
        requestorName: '',
        department: '',
        position: '',
        contactEmail: '',
        contactPhone: '',
        jobTitle: '',
        numberOfPositions: '',
        reasonForRequest: '',
        durationType: '',
        startDate: '',
        endDate: '',
        technologies: '',
        qualifications: '',
        approval: '',
    });

    const [dropdownData, setDropdownData] = useState({
        technologies: [],
    });

    // Fetch dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const technologies = await fetchDataByKey('technologies');
                setDropdownData({ technologies });
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };

        fetchDropdownData();
    }, []);

    // Handle changes in technologies selection
    const handleTechnologiesChange = (selectedOptions) => {
        const selectedValues = Array.isArray(selectedOptions)
            ? selectedOptions.map((option) => option.value)
            : [];
        setFormData({ ...formData, technologies: selectedValues });
    };

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Validate individual fields
    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'requestorName':
                if (!/^[a-zA-Z\s]+$/.test(value)) {
                    newErrors.requestorName = 'Name should only contain letters and spaces';
                } else {
                    newErrors.requestorName = '';
                }
                break;
            case 'contactEmail':
                if (!/\S+@\S+\.\S+/.test(value)) {
                    newErrors.contactEmail = 'Please enter a valid email address';
                } else {
                    newErrors.contactEmail = '';
                }
                break;
            case 'contactPhone':
                if (!/^\d{10}$/.test(value)) {
                    newErrors.contactPhone = 'Phone number must be 10 digits';
                } else {
                    newErrors.contactPhone = '';
                }
                break;
            case 'numberOfPositions':
                if (value <= 0 || !Number.isInteger(Number(value))) {
                    newErrors.numberOfPositions = 'Number of positions must be a positive integer';
                } else {
                    newErrors.numberOfPositions = '';
                }
                break;
            case 'endDate':
                if (formData.startDate && value && value < formData.startDate) {
                    newErrors.endDate = 'End date should not be before the start date';
                } else {
                    newErrors.endDate = '';
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Check if the form is valid
        if (Object.values(errors).every((error) => error === '')) {
            console.log('Form Submitted:', formData);
        } else {
            console.log('Form has errors.');
        }
    };

    return (
        <div className='coreContainer'>
            <h1>Manpower Request Form</h1>
            <form onSubmit={handleSubmit}>
                <h2>Requestor Information</h2>
                <div className='input-row'>
                    <div>
                        <label>Name:</label>
                        <input type="text" name="requestorName" value={formData.requestorName} onChange={handleChange} required />
                        {errors.requestorName && <p className="error">{errors.requestorName}</p>}
                    </div>
                    <div>
                        <label>Department:</label>
                        <input type="text" name="department" value={formData.department} onChange={handleChange} required />
                        {errors.department && <p className="error">{errors.department}</p>}
                    </div>
                    <div>
                        <label>Position/Title:</label>
                        <input type="text" name="position" value={formData.position} onChange={handleChange} required />
                        {errors.position && <p className="error">{errors.position}</p>}
                    </div>
                </div>
                <div className='input-row'>
                    <div>
                        <label>Contact Email:</label>
                        <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required />
                        {errors.contactEmail && <p className="error">{errors.contactEmail}</p>}
                    </div>
                    <div>
                        <label>Contact Phone:</label>
                        <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required />
                        {errors.contactPhone && <p className="error">{errors.contactPhone}</p>}
                    </div>
                    </div>
                    <h2>Job Information</h2>
                    <div>
                        <label>Job Title/Role:</label>
                        <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />
                        {errors.jobTitle && <p className="error">{errors.jobTitle}</p>}
                    </div>
                    <div>
                        <label>Number of Positions:</label>
                        <input type="number" name="numberOfPositions" value={formData.numberOfPositions} onChange={handleChange} required />
                        {errors.numberOfPositions && <p className="error">{errors.numberOfPositions}</p>}
                    </div>
                    <div>
                        <label>Reason for Request:</label>
                        <textarea name="reasonForRequest" value={formData.reasonForRequest} onChange={handleChange} required />
                        {errors.reasonForRequest && <p className="error">{errors.reasonForRequest}</p>}
                    </div>
           
                <h2>Technologies</h2>
                <div>
                    <label>Technologies</label>
                    <CreatableSelect
                        isMulti
                        options={dropdownData.technologies.map((tech) => ({
                            value: tech.data,
                            label: tech.data,
                        }))}
                        onChange={handleTechnologiesChange}
                        value={(Array.isArray(formData.technologies) ? formData.technologies : []).map((tech) => ({
                            value: tech,
                            label: tech,
                        }))}
                        styles={{
                            control: (base) => ({
                                ...base,
                                width: '100%',
                                height: 'auto',
                            }),
                            mtext: (base) => ({
                                ...base,
                                alignContent: 'center',
                            }),
                            indicatorSeparator: (base) => ({
                                ...base,
                                height: '20px',
                                margin: '10px 10px',
                            }),
                            indicatorsContainer: (base) => ({
                                ...base,
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '25px',
                            }),
                        }}
                    />
                </div>

                <h2>Employment Duration</h2>
                <div>
                    <label>Duration Type (Permanent/Temporary/Contract):</label>
                    <input type="text" name="durationType" value={formData.durationType} onChange={handleChange} required />
                    {errors.durationType && <p className="error">{errors.durationType}</p>}
                </div>
                <div>
                    <label>Start Date:</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                    {errors.startDate && <p className="error">{errors.startDate}</p>}
                </div>
                <div>
                    <label>End Date:</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                    {errors.endDate && <p className="error">{errors.endDate}</p>}
                </div>

                <h2>Skills & Qualifications Required</h2>
                <div>
                    <label>Qualifications:</label>
                    <input type="text" name="qualifications" value={formData.qualifications} onChange={handleChange} required />
                    {errors.qualifications && <p className="error">{errors.qualifications}</p>}
                </div>

                <h2>Budget/Salary</h2>
                <div>
                    <label>Estimated Salary/Salary Range:</label>
                    <input type="text" name="budgetSalary" value={formData.budgetSalary} onChange={handleChange} />
                </div>

                <h2>Approval</h2>
                <div>
                    <label>Approval Signature/Confirmation:</label>
                    <input type="text" name="approval" value={formData.approval} onChange={handleChange} required />
                    {errors.approval && <p className="error">{errors.approval}</p>}
                </div>

                <div>
                    <button type="submit">Submit Request</button>
                </div>
            </form>
        </div>
    );
};

export default MRFform;
