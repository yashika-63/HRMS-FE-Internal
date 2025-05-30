import React, { useState, useEffect } from "react";
import axios from "axios";
import { strings } from "../../string";

const OfferLetter = ({ offer }) => {
    const [ctcData, setCtcData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [templateData, setTemplateData] = useState(null);
    const [logo, setLogo] = useState(null);
    const companyId = localStorage.getItem('companyId');
    const currentDate = new Date().toISOString().split('T')[0];
    const firstName = localStorage.getItem('firstName');
    const name = localStorage.getItem('name');

    const totalVariableAmount = (ctcData?.offerVariableCTCBreakdowns?.reduce((sum, item) => sum + item.amount, 0) || 0);
    const totalStaticAmount = (ctcData?.offerStaticCTCBreakdowns?.reduce((sum, item) => sum + item.amount, 0) || 0);
    const totalAmount = totalVariableAmount + totalStaticAmount;

    const handlePrint = () => {
        window.print();
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

    const handleDownload = () => {
        const element = document.createElement("a");
        const content = document.querySelector('.offerContainer').innerHTML;
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "OfferLetter.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    useEffect(() => {
        const fetchCtcData = async () => {
            try {
                const response = await axios.get(`http://${strings.localhost}/api/offerCTC/byOfferGeneration/${offer.id}`);
                setCtcData(response.data[0]);
            } catch (err) {
                setError("Failed to fetch CTC data");
            } finally {
                setLoading(false);
            }
        };

        if (offer?.id) {
            fetchCtcData();
        }
    }, [offer.id]);
    useEffect(() => {
        const fetchLogo = async () => {
            const documentIdentityKey = 'CompanyLogo';

            try {
                const response = await axios.get(
                    `http://${strings.localhost}/api/company-document/view/activenew?companyId=${companyId}&documentIdentityKey=${documentIdentityKey}`,
                    { responseType: 'arraybuffer' } // Fetching as an array buffer (binary data)
                );
                // Convert the binary data to Base64
                const base64Logo = arrayBufferToBase64(response.data);
                // Set the logo in state with data:image/png;base64, prepended to the Base64 string
                setLogo(`data:image/png;base64,${base64Logo}`);
            } catch (error) {
                console.error('Error fetching logo:', error);
                setLogo(null);
            }
        };

        // Helper function to convert binary data (array buffer) to Base64
        const arrayBufferToBase64 = (buffer) => {
            const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
            return window.btoa(binary); // Convert binary to Base64
        };

        fetchLogo();
    }, []);
    return (
        <div className="coreContainer">
            <div className='offerLetterContainer'>
            <h1 className='centerText'>Offer Letter</h1>
                <div className="offer-header">
                    <img
                        className="HRMSNew"
                        src={logo}
                        alt="Company Logo"
                        width={120}
                        height={30}
                    />
                </div>
           
                {templateData ? (
                    <>
                        <div className="date">
                            <p>Date: {templateData.date}</p>
                        </div>

                        <div className="address">
                            <p>{offer.company.companyName}</p>
                            <p>{offer?.company?.companyAddress ||'Company Address'}</p>
                            <p>{`${offer?.company?.city || 'City'}, ${offer?.company?.state || 'State'}, ${offer?.company?.postalCode || 'PostalCode'}`}</p>
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

                        {/* <div className="details">
                            <p><strong>Employee Type:</strong> {offer.employeeType}</p>
                            <p><strong>Work Category:</strong> {offer.workCategory}</p>
                            <p><strong>Region:</strong> {offer.region}</p>
                            <p><strong>Department:</strong> {offer.department}</p>
                            <p><strong>Working Hours:</strong> {offer.workingHours} hours per day</p>
                            <p><strong>State:</strong> {offer.workState}</p>
                            <p><strong>Overtime Applicable:</strong> {offer.overtimeApplicable ? "Yes" : "No"}</p>
                            <p><strong>Allowable Overtime Days:</strong> {offer.allowableOvertimedays}</p>
                        </div> */}
                        <div className="letterdetails">

                            <p>
                                We are pleased to offer you an opportunity to join <strong>{offer.company.companyName}</strong> as a <strong>{offer.employeeType}</strong>
                                in the <strong>{offer.department}</strong> department. You allocated to  <strong>{offer.region}</strong> office in <strong>{offer.workState}</strong>.
                                The expected working schedule is <strong>{offer.workingHours} hours per day</strong>.
                                {offer.overtimeApplicable && offer.allowableOvertimedays > 0 ? (
                                    <> Overtime will be applicable, with up to <strong>{offer.allowableOvertimedays}</strong> allowable overtime day(s).</>
                                ) : (
                                    <> Please note that overtime is not applicable for this role.</>
                                )}
                                We are excited about the potential you bring and hope you will consider joining our growing team.
                            </p>


                        </div>
                        <div className="signature">
                            <p>Best regards,</p>
                            <p>HR Team,</p>
                            {/* <p>[Your Position]</p> */}
                            <p>{offer.company.companyName}</p>
                        </div>
                    </>
                ) : (
                    <p>Loading template...</p>
                )}
            </div>
            <div className="offerLetterContainer">
                <h2 className="centerText">Annexure</h2>
                <div className="offer-header">
                    <img
                        className="HRMSNew"
                        src={logo}
                        alt="Company Logo"
                        width={120}
                        height={30}
                    />
                </div>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <div>

                        <h3 className="underlineText">CTC Breakdown</h3>

                        {/* <p><strong>Total CTC Amount:</strong> {ctcData?.ctcAmount || "N/A"}</p>
                        <p><strong>Basic Amount:</strong> {ctcData?.basicAmount || "N/A"}</p> */}

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
    );
};

export default OfferLetter;
