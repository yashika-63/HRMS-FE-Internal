import React, { useState, useEffect } from "react";
import axios from "axios";
import { strings } from "../../string.jsx";
import { showToast, useCompanyLogo } from "../../Api.jsx";

const ViewOfferHR = ({ selectedEmployee, onClose }) => {
    const [offerList, setOfferList] = useState([]);
    const [templateData, setTemplateData] = useState(null);

    const [selectedOfferDetails, setSelectedOfferDetails] = useState(null);
    const [ctcData, setCtcData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const companyId = localStorage.getItem("companyId");
    const logo = useCompanyLogo(companyId);
    const currentDate = new Date().toISOString().split('T')[0];
    const name = localStorage.getItem('firstName');



    const fetchOfferData = async () => {
        if (selectedEmployee) {
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


    const handleOfferClick = (offer) => {
        setSelectedOfferDetails(offer);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedOfferDetails(null);
        setCtcData(null);
    };

    useEffect(() => {
        if (selectedEmployee) {
            fetchOfferData();
        }
    }, [selectedEmployee]);

    const totalVariableAmount = (ctcData?.offerVariableCTCBreakdowns?.reduce((sum, item) => sum + item.amount, 0) || 0);
    const totalStaticAmount = (ctcData?.offerStaticCTCBreakdowns?.reduce((sum, item) => sum + item.amount, 0) || 0);
    const totalAmount = totalVariableAmount + totalStaticAmount;

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
        <div className="offer-list">
            <div className="form-controls">
                <button onClick={onClose} className="cross-btn" type="button">X</button>
            </div>
            <h4>Existing Offers</h4>
            {offerList && offerList.length > 0 ? (
                <table className="appraisal-table">
                    <thead>
                        <tr>
                            <th>Employee Name</th>
                            <th>Employee Type</th>
                            <th>Region</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offerList.map((offerData) => (
                            <tr key={offerData.id}>
                                <td>{`${offerData.firstName} ${offerData.lastName}`}</td>
                                <td>{offerData.employeeType || 'Not Available'}</td>
                                <td>{offerData.region || 'Not Available'}</td>
                                <td>{offerData.department || 'Not Available'}</td>
                                <td className={
                                    offerData.actionTakenByCandidate
                                        ? 'status-completed'
                                        : (offerData.sendForApproval ? 'status-completed' : 'status-pending')
                                }>
                                    {
                                        offerData.actionTakenByCandidate ? (
                                            offerData.acceptedByCandidate ? 'Accepted by Candidate'
                                                : offerData.rejectedByCandidate ? 'Rejected by Candidate'
                                                    : offerData.remarkedByCandidate ? 'Remarked by Candidate'
                                                        : 'Action Taken by Candidate'
                                        ) : (
                                            offerData.sendForApproval ? 'Send to Candidate' : 'Pending'
                                        )
                                    }
                                </td>

                                {/* <td
                                    style={{
                                        backgroundColor: offerData.sendForApproval ? '#3498db' : '#f1c40f',
                                        color: offerData.sendForApproval ? '#fff' : '#000',
                                        padding: '4px 5px',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        verticalAlign:'middle',
                               
                                    }}
                                >
                                    {offerData.sendForApproval ? 'Send to Candidate' : 'Pending'}
                                </td> */}
                                <td>
                                    <button type="button" className="textbutton" onClick={() => handleOfferClick(offerData)}>View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="error-message">No existing offers</p>
            )}

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
                            <div className="offer-header">
                                <img
                                    className="HRMSNew"
                                    src={logo}
                                    alt="Company Logo"
                                    width={60}
                                    height={50}
                                />
                            </div>
                            <h1 className='centerText'>Offer Letter</h1>

                            {templateData ? (
                                <>
                                    <div className="date">
                                        <p>Date: {templateData.date}</p>
                                    </div>

                                    <div className="address">
                                        <p>{templateData.company.companyName}</p>
                                        <p>{templateData?.company?.companyAddress || 'Company Address'}</p>
                                        <p>{`${templateData?.company?.city || 'City'}, ${templateData?.company?.state || 'State'}, ${templateData?.company?.postalCode || 'PostalCode'}`}</p>
                                    </div>

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

                                <p >
                                    We are pleased to offer you an opportunity to join <strong>{templateData.company.companyName}</strong> as a <strong>{templateData.employeeType}</strong>
                                    in the <strong>{templateData.department}</strong> department. You allocated to <strong>{templateData.region}</strong> office in <strong>{templateData.workState}</strong>.
                                    The expected working schedule is <strong>{templateData.workingHours} hours per day</strong>.
                                    {templateData.overtimeApplicable && templateData.allowableOvertimedays > 0 ? (
                                        <> Overtime will be applicable, with up to <strong>{templateData.allowableOvertimedays}</strong> allowable overtime day(s).</>
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
                    </div>

                </div>

            )}

        </div>
    );
};

export default ViewOfferHR;
