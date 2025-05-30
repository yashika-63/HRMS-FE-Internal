import React, { useState, useEffect } from "react";
import axios from "axios";
import CTC from './CTC.jsx';
import { fetchDataByKey, showToast, useCompanyLogo } from "../../Api.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { strings } from "../../string.jsx";

const Offer = ({ selectedEmployee, offerData, onClose }) => {
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [templateData, setTemplateData] = useState(null);
    const [ctcData, setCtcData] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedOfferDetails, setSelectedOfferDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [offerList, setOfferList] = useState([]);
    const currentDate = new Date().toISOString().split('T')[0];
    const [error, setError] = useState(null);
    const [offerId, setofferId] = useState(null);
    const steps = ["Offer Details", "CTC Generation"];
    const name = localStorage.getItem("firstName");
    const [completedSteps, setCompletedSteps] = useState({ 1: false, 2: false });
    const [offerDetails, setOfferDetails] = useState({
        firstName: "",
        lastName: "",
        MiddleName: "",
        employeeType: "",
        workingHours: "",
        workStateCode: "",
        workState: "",
        workCategoryCode: "",
        workCategory: "",
        overtimeDays: "",
        regionId: "",
        region: "",
        departmentId: "",
        department: "",
        overtimeApplicable: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOfferId, setSelectedOfferId] = useState(null);
    const companyId = localStorage.getItem("companyId");
    const logo = useCompanyLogo(companyId);
    const employeeId = localStorage.getItem('employeeId');
    const [dropdownData, setDropdownData] = useState({
        employeeType: [],
        state: [],
        employeeDayOffCategory: [],
        department: [],
        region: []
    });
    const handleCreateNewOffer = () => {
        setOfferDetails({
            firstName: "",
            lastName: "",
            MiddleName: "",
            employeeType: "",
            workingHours: "",
            workStateCode: "",
            workState: "",
            workCategoryCode: "",
            workCategory: "",
            overtimeDays: "",
            regionId: "",
            region: "",
            departmentId: "",
            department: "",
            overtimeApplicable: false
        });
        setCurrentStep(1);
    };
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const employeeType = await fetchDataByKey('employeeType');
                const state = await fetchDataByKey('state');
                const employeeDayOffCategory = await fetchDataByKey('employeeDayOffCategory');
                const department = await fetchDataByKey('department');
                const region = await fetchDataByKey('region');

                setDropdownData({ employeeType, state, employeeDayOffCategory, department, region });
            } catch (error) {
                console.error("Error fetching dropdown data", error);
            }
        };

        fetchDropdownData();
    }, []);


    // Validation Functions
    const validateName = (name, field) => {
        if (!/^[A-Z][a-zA-Z]*$/.test(name)) {
            return `Invalid ${field}. Must start with a capital letter and contain only alphabets.`;
        }
        return "";
    };

    const validateNumber = (num, field) => {
        if (!/^[1-9][0-9]*$/.test(num)) {
            return `Invalid ${field}. Must be a positive number.`;
        }
        return "";
    };

    const validateOvertimeRate = (rate) => {
        if (!/^[0-9]+(\.[0-9]+)?$/.test(rate)) {
            return "Invalid Overtime Rate. Must be a number.";
        }
        return "";
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOfferDetails((prev) => ({ ...prev, [name]: value }));

        let errorMsg = "";

        if (["firstName", "lastName", "MiddleName"].includes(name)) {
            errorMsg = validateName(value, name);
        } else if (name === "workingHours") {
            errorMsg = validateNumber(value, name);
        } else if ((name === "overtimeDays" || name === "overtimeRate") && offerDetails.overtimeApplicable) {
            if (name === "overtimeRate") {
                errorMsg = validateOvertimeRate(value);
            } else {
                errorMsg = validateNumber(value, name);
            }
        }

        setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    };

    // Handle Checkbox Toggle
    const handleToggle = () => {
        setOfferDetails((prevState) => ({ ...prevState, overtimeApplicable: !prevState.overtimeApplicable }));
    };

    // Validate Offer Details
    const validateOfferDetails = () => {
        const errors = {};
        const nameRegex = /^[A-Z][a-zA-Z]*$/;
        const hoursRegex = /^[1-9][0-9]*$/;
        const rateRegex = /^[0-9]+(\.[0-9]+)?$/;

        // Skip validation for firstName, lastName, and MiddleName if they are pre-filled
        // if (!selectedEmployee.firstName || offerDetails.firstName.trim()) {
        //     if (!offerDetails.firstName.trim()) {
        //         errors.firstName = "First Name is required.";
        //     } else if (!nameRegex.test(offerDetails.firstName)) {
        //         errors.firstName = "First Name must start with a capital letter and contain only alphabets.";
        //     }
        // }

        // if (!selectedEmployee.lastName || offerDetails.lastName.trim()) {
        //     if (!offerDetails.lastName.trim()) {
        //         errors.lastName = "Last Name is required.";
        //     } else if (!nameRegex.test(offerDetails.lastName)) {
        //         errors.lastName = "Last Name must start with a capital letter and contain only alphabets.";
        //     }
        // }

        // if (!selectedEmployee.MiddleName || offerDetails.MiddleName.trim()) {
        //     if (!offerDetails.MiddleName.trim()) {
        //         errors.MiddleName = "Middle Name is required.";
        //     } else if (!nameRegex.test(offerDetails.MiddleName)) {
        //         errors.MiddleName = "Middle Name must start with a capital letter and contain only alphabets.";
        //     }
        // }

        if (!offerDetails.workingHours.trim()) {
            errors.workingHours = "Working Hours is required.";
        } else if (!hoursRegex.test(offerDetails.workingHours)) {
            errors.workingHours = "Working Hours must be a positive number.";
        }

        if (!offerDetails.employeeType) {
            errors.employeeType = "Employee Type is required.";
        }

        if (!offerDetails.departmentId) {
            errors.departmentId = "Department is required.";
        }

        if (!offerDetails.regionId) {
            errors.regionId = "Region is required.";
        }

        if (!offerDetails.workStateCode) {
            errors.workStateCode = "State is required.";
        }

        if (!offerDetails.workCategoryCode) {
            errors.workCategoryCode = "Category is required.";
        }
        if (offerDetails.overtimeApplicable) {
            if (!offerDetails.overtimeDays.trim()) {
                errors.overtimeDays = "Overtime Days is required.";
            } else if (!hoursRegex.test(offerDetails.overtimeDays)) {
                errors.overtimeDays = "Overtime Days must be a positive number.";
            }

            if (!offerDetails.overtimeRate?.trim()) {
                errors.overtimeRate = "Overtime Rate is required.";
            } else if (!rateRegex.test(offerDetails.overtimeRate)) {
                errors.overtimeRate = "Overtime Rate must be a valid number.";
            }
        }
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };


    // Handle Save Offer Details
    const handleSaveOfferDetails = async () => {
        if (!validateOfferDetails()) {
            const allFieldsEmpty = Object.values(offerDetails).every(value => value === "" || value === false);
            if (allFieldsEmpty) {
                showToast("Please fill all required fields first.", 'info');
            } else {
                showToast("Please fix the errors before saving.", 'error');
            }
            return;
        }

        const payload = {
            firstName: selectedEmployee?.firstName || offerDetails.firstName,
            lastName: selectedEmployee?.lastName || offerDetails.lastName,
            MiddleName: selectedEmployee?.middleName || offerDetails.MiddleName,
            workingHours: offerDetails.workingHours,
            overtimeApplicable: offerDetails.overtimeApplicable,
            employeeType: offerDetails.employeeType,
            workState: offerDetails.workStateCode,
            workStateCode: dropdownData.state.find(option => option.data === offerDetails.workStateCode)?.masterId || "",
            region: offerDetails.regionId,
            regionId: dropdownData.region.find(option => option.data === offerDetails.regionId)?.masterId || "",
            department: offerDetails.departmentId,
            departmentId: dropdownData.department.find(option => option.data === offerDetails.departmentId)?.masterId || "",
            workCategory: offerDetails.workCategoryCode,
            workCategoryCode: dropdownData.employeeDayOffCategory.find(option => option.data === offerDetails.workCategoryCode)?.masterId || "",
        };

        try {
            const response = await axios.post(`http://${strings.localhost}/api/offerGeneration/saveMain/${employeeId}/${companyId}/${selectedEmployee.id}`, payload);
            if (response.data) {
                showToast("Offer details saved successfully", 'success');
                setofferId(response.data.id);
                setCompletedSteps((prev) => ({ ...prev, [currentStep]: true }));
                setCurrentStep(currentStep + 1);
            }
        } catch (error) {
            showToast(error.response?.data || "An error occurred while saving offer details.");
        }
    };


    const closeOfferModal = () => {
        setIsOfferModalOpen(false);
        setCurrentStep(1);
    }

    const fetchCtcData = async (offerId) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://${strings.localhost}/api/offerCTC/byOfferGeneration/${offerId}`);
            setCtcData(response.data[0]);
        } catch (err) {
            setError("NO  CTC data");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (selectedOfferDetails?.id) {
            fetchCtcData(selectedOfferDetails.id);
        }
    }, [selectedOfferDetails]);


    const totalVariableAmount = (ctcData?.offerVariableCTCBreakdowns?.reduce((sum, item) => sum + item.amount, 0) || 0);
    const totalStaticAmount = (ctcData?.offerStaticCTCBreakdowns?.reduce((sum, item) => sum + item.amount, 0) || 0);
    const totalAmount = totalVariableAmount + totalStaticAmount;

    const handleViewDetails = (offer) => {
        setSelectedOfferDetails(offer);
        setIsDetailsModalOpen(true);
    };
    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedOfferDetails(null);
    };

    const fetchOfferData = async () => {
        if (selectedEmployee && !selectedEmployee.offerData) {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/offerGeneration/getByPreRegId?preRegistrationId=${selectedEmployee.id}`);

                if (response.data && response.data.length === 0) {
                    showToast("No offers found for the given pre-registration ID.", "info");
                } else {
                    setOfferList(response.data);
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    showToast(error.response.data, "error");
                }
            }
        }
    };

    useEffect(() => {
        if (selectedEmployee) {
            fetchOfferData();
        }
    }, [selectedEmployee]);


    const editDropdown = (offerData) => (
        <div className="dropdown">
            <button className="dots-button">
                <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            <div className="dropdown-content">
                <div>
                    <button type='button' onClick={() => handleViewDetails(offerData)}> View </button>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={() => handleSendOffer(offerData.id)}
                        disabled={isLoading && offerData.id === selectedOfferId}
                        style={{
                            backgroundColor: isLoading && offerData.id === selectedOfferId ? '#d3d3d3' : '',
                            color: isLoading && offerData.id === selectedOfferId ? '#6c757d' : '',
                            cursor: isLoading && offerData.id === selectedOfferId ? 'not-allowed' : 'pointer',

                        }}
                    >
                        {isLoading && offerData.id === selectedOfferId ? (
                            <div className="loading-spinner"></div>
                        ) : null}
                        {isLoading ? "Sending..." : "Send Offer"}


                    </button>
                </div>

            </div>
        </div >
    );


    const handleSendOffer = async (id) => {
        setIsLoading(true);
        setSelectedOfferId(id);
        try {
            const response = await axios.put(`http://${strings.localhost}/api/offerGeneration/update-status/${id}`);
            if (response.data) {
                showToast("Offer sent successfully", "success");
                closeOfferModal();
                onclose();
            }
        } catch (error) {
            showToast(error.response.data || "An error occurred while sending the offer.", "error");
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        const fetchTemplateData = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/letter-template/active?companyId=${companyId}&templateIdentityKey=Offer`);
                setTemplateData(response.data);
            } catch (err) {
                console.error("Failed to fetch offer letter template", err);
            }
        };

        if (companyId) {
            fetchTemplateData();
        }
    }, [companyId]);

    return (
        <div>
            <div className="modal-overlay">
                {loading && <div className="loading-spinner"></div>}
                <div className="offermodal-content">
                    {/* <button type="button" onClick={onclose} className="cross-btn">X</button> */}
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
                    </div>
                    {currentStep === 1 && (
                        <div className="offer-list">
                            <div className="offer-list">
                                <div className="form-controls">
                                    <button onClick={onClose} className="cross-btn" type="button">X</button>
                                </div>
                                <h4>Existing Offers</h4>
                                {offerList && offerList.filter(offer => !offer.sendForApproval).length > 0 ? (
                                    <table className="appraisal-table">
                                        <thead>
                                            <tr>
                                                <th> Employee Name</th>
                                                <th>Employee Type</th>
                                                <th>Region</th>
                                                <th>Department</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {offerList
                                                .filter((offerData) => offerData.sendForApproval === false)
                                                .map((offerData) => (
                                                    <tr key={offerData.id}>
                                                        <td>{`${offerData.firstName} ${offerData.lastName}`}</td>

                                                        <td>{offerData.employeeType || 'Not Available'}</td>
                                                        <td>{offerData.region || 'Not Available'}</td>
                                                        <td>{offerData.department || 'Not Available'}</td>
                                                        <td>{offerData.sendForApproval ? 'Send to Candidate' : 'Pending'}</td>

                                                        <td>{editDropdown(offerData, isLoading)}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="error-message">No existing offers available for approval.</p>
                                )}

                            </div>


                            {isDetailsModalOpen && selectedOfferDetails && (
                                <div className="modal-overlay">
                                    <div className="modal-content" id="printable-content">

                                        <button
                                            type="button"
                                            onClick={closeDetailsModal}
                                            className="close-button">
                                            X
                                        </button>
                                        <div className="offerLetterContainer">
                                            <h1 className='centerText'>Offer Letter</h1>
                                            <div className="offer-header">
                                                <img
                                                    className="HRMSNew"
                                                    src={logo}
                                                    alt="Company Logo"
                                                    width={60}
                                                    height={50}
                                                />
                                            </div>
                                            <div className="date">
                                                <p>Date: {templateData.date}</p>
                                            </div>
                                            <div className="address">
                                                <p>{templateData.company.companyName}</p>
                                                <p>{templateData?.company?.companyAddress || 'Company Address'}</p>
                                                <p>{`${templateData?.company?.city || 'City'}, ${templateData?.company?.state || 'State'}, ${templateData?.company?.postalCode || 'PostalCode'}`}</p>
                                            </div>



                                            {templateData ? (
                                                <>



                                                    <div className="subject">
                                                        <p>Subject : {templateData.subject}</p>
                                                    </div>

                                                    <div className="salutation">
                                                        <p>Dear Mr./Ms. {name},</p>
                                                    </div>

                                                    <div className="body">
                                                        <p>{templateData.body}</p>
                                                    </div>


                                                </>
                                            ) : (
                                                <p>Loading template...</p>
                                            )}
                                            <div className="letterdetails">

                                                <p>
                                                    We are pleased to offer you an opportunity to join <strong>{selectedOfferDetails.company.companyName}</strong> as a <strong>{selectedOfferDetails.employeeType}</strong>
                                                    in the <strong>{selectedOfferDetails.department}</strong> department. You allocated to <strong>{selectedOfferDetails.region}</strong> office in <strong>{selectedOfferDetails.workState}</strong>.
                                                    The expected working schedule is <strong>{selectedOfferDetails.workingHours} hours per day</strong>.
                                                    {selectedOfferDetails.overtimeApplicable && selectedOfferDetails.allowableOvertimedays > 0 ? (
                                                        <> Overtime will be applicable, with up to <strong>{selectedOfferDetails.allowableOvertimedays}</strong> allowable overtime day(s).</>
                                                    ) : (
                                                        <> Please note that overtime is not applicable for this role.</>
                                                    )}
                                                    We are excited about the potential you bring and hope you will consider joining our growing team.
                                                </p>


                                            </div>

                                            <div className="signature">
                                                <p>Best regards,</p>
                                                <p>HR Team</p>

                                                <p>{selectedOfferDetails.company.companyName}</p>
                                            </div>
                                        </div>
                                        <div className="offerLetterContainer">
                                            <div className="ctc-breakdown">
                                                <div className="offer-header">
                                                    <img
                                                        className="HRMSNew"
                                                        src={logo}
                                                        alt="Company Logo"
                                                        width={60}
                                                        height={50}
                                                    />
                                                </div>
                                                <h2 className="centerText">Annexure</h2>
                                                {loading ? (
                                                    <p>Loading...</p>
                                                ) : error ? (
                                                    <p>{error}</p>
                                                ) : (
                                                    <div>
                                                        <h3>CTC Breakdown</h3>
                                                        <br />
                                                        {ctcData?.offerVariableCTCBreakdowns?.length > 0 || ctcData?.offerStaticCTCBreakdowns?.length > 0 ? (
                                                            <table className="ctc-breakdown-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Particulars</th>
                                                                        <th style={{ textAlign: 'right' }}>Monthly Amount</th>
                                                                        <th style={{ textAlign: 'right' }}>Annual Amount</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {ctcData.offerVariableCTCBreakdowns?.map((item) => (
                                                                        <tr key={item.id}>
                                                                            <td>{item.label}</td>
                                                                            <td style={{ textAlign: 'right' }}>{(item.amount / 12).toFixed(0)}</td>
                                                                            <td style={{ textAlign: 'right' }}>{item.amount}</td>
                                                                        </tr>
                                                                    ))}
                                                                    {ctcData.offerStaticCTCBreakdowns?.map((item) => (
                                                                        <tr key={item.id}>
                                                                            <td>{item.label}</td>
                                                                            <td style={{ textAlign: 'right' }}>{(item.amount / 12).toFixed(0)}</td>
                                                                            <td style={{ textAlign: 'right' }}>{item.amount}</td>
                                                                        </tr>
                                                                    ))}
                                                                    <tr>
                                                                        <td><strong>Total CTC</strong></td>
                                                                        <td style={{ textAlign: 'right' }}>
                                                                            <strong>{(totalAmount / 12).toFixed(0)}</strong>
                                                                        </td>
                                                                        <td style={{ textAlign: 'right' }}>
                                                                            <strong>{totalAmount.toFixed(0)}</strong>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        ) : (
                                                            <p>No CTC breakdowns available.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="btnContainer">
                                            <button
                                                type="button"
                                                onClick={() => handleSendOffer(selectedOfferDetails.id)}
                                                disabled={isLoading && selectedOfferDetails.id === selectedOfferId}
                                                style={{
                                                    backgroundColor: isLoading && selectedOfferDetails.id === selectedOfferId ? '#d3d3d3' : '',
                                                    color: isLoading && selectedOfferDetails.id === selectedOfferId ? '#6c757d' : '',
                                                    cursor: isLoading && selectedOfferDetails.id === selectedOfferId ? 'not-allowed' : 'pointer',
                                                }}
                                                className="btn"
                                            >
                                                {isLoading && selectedOfferDetails.id === selectedOfferId ? (
                                                    <div className="loading-spinner" style={{ marginRight: "8px", display: "inline-block" }}></div>
                                                ) : null}
                                                {isLoading && selectedOfferDetails.id === selectedOfferId ? "Sending..." : "Send Offer"}
                                            </button>
                                        </div>

                                    </div>

                                </div>

                            )}
                            <button onClick={handleCreateNewOffer} className="btn">Create New Offer </button>
                        </div>
                    )}
                    {currentStep === 1 && (

                        <div>
                            <h3 className="centerText">Offer Details</h3>
                            <div className="input-row">
                                <div>
                                    <span className="required-marker">*</span>
                                    <label>First Name:</label>
                                    <input
                                        className="readonly"
                                        type="text"
                                        name="firstName"
                                        value={selectedEmployee?.firstName || ''}
                                        onChange={handleInputChange}
                                        required
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Last Name:</label>
                                    <input
                                        className="readonly"
                                        type="text"
                                        name="lastName"
                                        value={selectedEmployee?.lastName || ''}
                                        onChange={handleInputChange}
                                        required
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Middle Name:</label>
                                    <input
                                        className="readonly"
                                        type="text"
                                        name="MiddleName"
                                        value={selectedEmployee?.middleName || ''}
                                        onChange={handleInputChange}
                                        required
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="input-row">
                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Working Hours:</label>
                                    <input
                                        type="number"
                                        name="workingHours"
                                        className="selectIM"
                                        value={offerDetails.workingHours}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.workingHours && <span className="error-message">{errors.workingHours}</span>}
                                </div>
                                <div>
                                    <span className="required-marker">*</span>
                                    <label>State</label>
                                    <select name="workStateCode" className="selectIM" value={offerDetails.workStateCode} onChange={handleInputChange} required>
                                        <option value=""></option>
                                        {dropdownData.state && dropdownData.state.length > 0 ? (
                                            dropdownData.state.map(option => (
                                                <option key={option.masterId} value={option.data}>
                                                    {option.data}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No states available</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Category:</label>
                                    <select name="workCategoryCode" className="selectIM" value={offerDetails.workCategoryCode} onChange={handleInputChange} required>
                                        <option value=""></option>
                                        {dropdownData.employeeDayOffCategory && dropdownData.employeeDayOffCategory.length > 0 ? (
                                            dropdownData.employeeDayOffCategory.map(option => (
                                                <option key={option.masterId} value={option.data}>
                                                    {option.data}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Category Not available</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="input-row">
                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Employee Type:</label>
                                    <select name="employeeType" className="selectIM" value={offerDetails.employeeType} onChange={handleInputChange} required>
                                        <option value=""></option>
                                        {dropdownData.employeeType && dropdownData.employeeType.length > 0 ? (
                                            dropdownData.employeeType.map(option => (
                                                <option key={option.masterId} value={option.data}>
                                                    {option.data}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>employeeType Not available</option>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Department:</label>
                                    <select name="departmentId" className="selectIM" value={offerDetails.departmentId} onChange={handleInputChange} required>
                                        <option value=""></option>
                                        {dropdownData.department && dropdownData.department.length > 0 ? (
                                            dropdownData.department.map(option => (
                                                <option key={option.masterId} value={option.data}>
                                                    {option.data}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No departments available</option>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <span className="required-marker">*</span>
                                    <label>Region:</label>
                                    <select name="regionId" className="selectIM" value={offerDetails.regionId} onChange={handleInputChange} required>
                                        <option value=""></option>
                                        {dropdownData.region && dropdownData.region.length > 0 ? (
                                            dropdownData.region.map(option => (
                                                <option key={option.masterId} value={option.data}>
                                                    {option.data}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No regions available</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="input-row">
                                <div>
                                    <label>Overtime Applicable:</label>
                                    <input type="checkbox" checked={offerDetails.overtimeApplicable} onChange={() => setOfferDetails({ ...offerDetails, overtimeApplicable: !offerDetails.overtimeApplicable })} />
                                </div>
                                {offerDetails.overtimeApplicable && (
                                    <>
                                        <div>
                                            <label>Allowable Overtime Days:</label>
                                            <input
                                                type="number"
                                                name="overtimeDays"
                                                className="selectIM"
                                                value={offerDetails.overtimeDays}
                                                onChange={handleInputChange}

                                            />
                                            {errors.overtimeDays && <span className="error-message">{errors.overtimeDays}</span>}
                                        </div>
                                        <div>
                                            <label>Overtime Rate:</label>
                                            <input
                                                type="text"
                                                name="overtimeRate"
                                                className="selectIM"
                                                value={offerDetails.overtimeRate}
                                                onChange={handleInputChange}

                                            />
                                            {errors.overtimeRate && <span className="error-message">{errors.overtimeRate}</span>}
                                        </div>
                                    </>
                                )}

                            </div>
                            <div className="form-controls">
                                <button type="button" className="btn" onClick={handleSaveOfferDetails}>Save & Next</button>
                                <button onClick={onClose} className="outline-btn">Close</button>
                            </div>
                        </div>
                    )}
                    {currentStep === 2 && (

                        <div>
                            <div className="form-controls">
                                <button className="cross-btn" onClick={onClose}>X</button>
                            </div>
                            <CTC offerId={offerId}
                                onClose={onClose} />
                        </div>
                    )}
                    {/* {currentStep === 3 && (
                        <div>
                            <CTCAttribute offerId={offerId} />
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
};

export default Offer;
