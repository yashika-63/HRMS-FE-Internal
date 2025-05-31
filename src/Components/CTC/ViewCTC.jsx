import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { strings } from '../../string';
import '../CommonCss/Payslip.css';
import { showToast, useCompanyLogo } from '../../Api.jsx';
import AiTdsCalculator from './AiTdsCalculator.jsx';

const ViewCTC = () => {
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [ctcData, setCtcData] = useState([]);
    const { id: employeeId } = useParams();
    const navigate = useNavigate();
    const [selectedCtc, setSelectedCtc] = useState({
        staticCTCBreakdowns: [],
        variableCTCBreakdowns: [],
        ctcAmount: 0,
    });
    const [activeCtcData, setActiveCtcData] = useState(null);
    const [isActive, setIsActive] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDetailPopUp, setShowDetailPopUp] = useState(false);
    const companyId = localStorage.getItem('companyId');
    const logo = useCompanyLogo(companyId);
    const accountId = localStorage.getItem('accountId');
    const [companyAssignId, setCompanyAssignId] = useState('');
    // Fetch Company Details


    const handleClosePopup = () => {

    };

    const handleOpenModal = () => {
        setShowDetailPopUp(true);

    }



    useEffect(() => {
        const fetchCtcData = async () => {
            const status = isActive ? 'True' : 'False';
            console.log(`Fetching CTC data with status: ${status}`);

            try {
                const response = await axios.get(
                    `http://${strings.localhost}/api/ctcmain/byEmployee/ctcStatus${status}/${employeeId}`
                );
                console.log('Fetched CTC Data:', response.data);

                if (response.data) {
                    if (isActive) {
                        const ctcRecord = response.data; // Active record
                        console.log('Static Breakdown:', ctcRecord.staticCTCBreakdowns);
                        console.log('Variable Breakdown:', ctcRecord.variableCTCBreakdowns);

                        // Set both CTC breakdowns and employee data
                        setSelectedCtc({
                            staticCTCBreakdowns: ctcRecord.staticCTCBreakdowns,
                            variableCTCBreakdowns: ctcRecord.variableCTCBreakdowns,
                            ctcAmount: ctcRecord.ctcAmount,
                            name: `${ctcRecord.employee.firstName} ${ctcRecord.employee.middleName} ${ctcRecord.employee.lastName}`,
                            department: ctcRecord.employee.department,
                            designation: ctcRecord.employee.designation,
                            companyName: ctcRecord.company.companyName,
                            companyAddress: `${ctcRecord.company.companyName}, ${ctcRecord.company.companyType}`
                        });
                        setCompanyAssignId(ctcRecord.company.companyAssignId);
                        setSelectedCtc(ctcRecord);
                        setActiveCtcData(ctcRecord);
                    } else {
                        // Set inactive CTC records for display
                        setCtcData(response.data); // Assuming response contains multiple inactive records
                    }
                } else {
                    console.log('No CTC records found for the given status');
                    setCtcData([]);
                    showToast("No CTC found for this employee", 'error');
                }
            } catch (error) {
                console.error('Error fetching CTC data:', error);
            }
        };

        if (employeeId) {
            fetchCtcData();
        }
    }, [isActive, employeeId]);

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            if (!companyAssignId) {
                console.log("No companyAssignId, skipping company fetch.");
                return;
            }

            try {
                const companyResponse = await axios.get(
                    `http://${strings.localhost}/api/CompanyRegistartion/GetCompanyByIds?companyAssignId=${companyAssignId}&accountId=${accountId}`
                );
                console.log("Company Response:", companyResponse.data);

                const company = companyResponse.data[0];
                if (company) {
                    setCompanyName(company.companyName);
                    setCompanyAddress(company.address);

                } else {
                    console.log("No company found.");
                }
            } catch (error) {
                console.error('Error fetching company details:', error);
            }
        };

        fetchCompanyDetails();
    }, [companyAssignId, accountId]);

    useEffect(() => {
        const fetchCtcData = async () => {
            const status = isActive ? 'True' : 'False';
            console.log(`Fetching CTC data with status: ${status}`);

            try {
                const response = await axios.get(
                    `http://${strings.localhost}/api/ctcmain/byEmployee/ctcStatus${status}/${employeeId}`
                );
                console.log('Fetched CTC Data:', response.data);

                if (response.data) {
                    const ctcRecord = response.data; // Active record
                    console.log('Static Breakdown:', ctcRecord.staticCTCBreakdowns);
                    console.log('Variable Breakdown:', ctcRecord.variableCTCBreakdowns);

                    // Set both CTC breakdowns and employee data
                    setSelectedCtc({
                        staticCTCBreakdowns: ctcRecord.staticCTCBreakdowns,
                        variableCTCBreakdowns: ctcRecord.variableCTCBreakdowns,
                        ctcAmount: ctcRecord.ctcAmount,
                        name: `${ctcRecord.employee.firstName} ${ctcRecord.employee.middleName} ${ctcRecord.employee.lastName}`,
                        department: ctcRecord.employee.department,
                        designation: ctcRecord.employee.designation,
                        companyName: ctcRecord.company.companyName,
                        companyAddress: `${ctcRecord.company.companyName}, ${ctcRecord.company.companyType}`
                    });
                    setCompanyAssignId(ctcRecord.company.companyAssignId);
                } else {
                    console.log('No CTC records found for inactive status');
                    setCtcData([]);
                    showToast("No active CTC found for this employee", 'error');
                }
            } catch (error) {
                console.error('Error fetching CTC data:', error);
            }
        };

        if (employeeId) {
            fetchCtcData();
        }
    }, [isActive, employeeId]);

    // Handle Record Click for Inactive CTC
    const handleRecordClick = async (ctcRecord) => {
        console.log("Handling record click for CTC record:", ctcRecord);
        setSelectedCtc(ctcRecord);
        if (ctcRecord) {
            // await fetchEmployeeDetails();
            setIsModalOpen(true);
        } else {
            console.error("CTC record is null or undefined");
        }
    };

    const handlePrint = () => {
        console.log("Initiating print...");
        window.print();
    };

    // Calculate Totals for CTC Breakdown
    const calculateTotals = (breakdowns) => {
        let monthlyTotal = 0;
        let annualTotal = 0;
        breakdowns.forEach(item => {
            monthlyTotal += item.amount / 12;
            annualTotal += item.amount;
        });
        console.log("Calculated Monthly Total:", monthlyTotal);
        console.log("Calculated Annual Total:", annualTotal);
        return { monthlyTotal, annualTotal };
    };

    const staticTotals = calculateTotals(selectedCtc.staticCTCBreakdowns);
    const variableTotals = calculateTotals(selectedCtc.variableCTCBreakdowns);

    const totalMonthly = staticTotals.monthlyTotal + variableTotals.monthlyTotal;
    const totalAnnual = staticTotals.annualTotal + variableTotals.annualTotal;

    console.log("Total Monthly CTC:", totalMonthly);
    console.log("Total Annual CTC:", totalAnnual);

    const handleBack = () => {
        navigate(`/ListEmp`);
    };

    return (
        <div className="coreContainer">
            <div className="switch-container">
                <label className="switch">
                    <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} />
                    <span className="slider"></span>
                </label>
                <span>{isActive ? 'Active CTC' : 'Inactive CTC'}</span>
            </div>
            {isActive && selectedCtc && selectedCtc.staticCTCBreakdowns && selectedCtc.variableCTCBreakdowns ? (
                <div className="container-asset">
                    <img className='HRMSNew' src="/SpectrumLogo.png" alt="Pristine Logo" width={120} height={30} />
                    <h3 className='form-title'>{companyName}</h3>
                    <p>{companyAddress}</p>

                    <table className="ctc-details-table">
                        <tbody>
                            <tr>
                                <td>Employee Name</td>
                                <td style={{ textAlign: 'right' }}>{selectedCtc.name}</td>
                            </tr>
                            <tr>
                                <td>Department</td>
                                <td style={{ textAlign: 'right' }}>{selectedCtc.department}</td>
                            </tr>
                            <tr>
                                <td>Designation</td>
                                <td style={{ textAlign: 'right' }}>{selectedCtc.designation}</td>
                            </tr>
                            <tr>
                                <td><strong>Total CTC</strong></td>
                                <td style={{ textAlign: 'right' }}><strong>{selectedCtc.ctcAmount}</strong></td>
                            </tr>
                        </tbody>
                    </table>

                    <table className="ctc-breakdown-table">
                        <thead>
                            <tr>
                                <th>Label</th>
                                <th style={{ textAlign: 'right' }}>Monthly Amount</th>
                                <th style={{ textAlign: 'right' }}>Annual Amount</th>
                            </tr>
                        </thead>
                        <tbody >
                            {selectedCtc.staticCTCBreakdowns.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.label}</td>
                                    <td style={{ textAlign: "right" }}>{(item.amount / 12).toFixed(0)}</td>
                                    <td style={{ textAlign: 'right' }}>{item.amount}</td>
                                </tr>
                            ))}
                            {selectedCtc.variableCTCBreakdowns.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.label}</td>
                                    <td style={{ textAlign: 'right' }}>{(item.amount / 12).toFixed(0)}</td>
                                    <td style={{ textAlign: 'right' }}>{item.amount}</td>
                                </tr>
                            ))}
                            <tr>
                                <td><strong>Total</strong></td>
                                <td style={{ textAlign: 'right' }}><strong>{totalMonthly.toFixed(0)}</strong></td>
                                <td style={{ textAlign: 'right' }}><strong>{totalAnnual.toFixed(0)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                    <div className='form-controls'>
                        <button className='btn' type='button' onClick={handlePrint}>Print</button>
                        {activeCtcData && (
                            <>
                                <button className='ai-button' type='button' onClick={handleOpenModal}>
                                    <span className="sparkle">✨</span>
                                    AI TDS Calculator
                                </button>
                                <AiTdsCalculator
                                    ctcData={activeCtcData}
                                    isOpen={showDetailPopUp}
                                    onClose={() => setShowDetailPopUp(false)}
                                />
                            </>
                        )}

                        {/* <button type="button" className="outline-btn" onClick={handleBack} >Back</button> */}
                    </div>
                </div>
            ) : (
                <table className="ctc-table">
                    <thead>
                        <tr>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ctcData.length === 0 ? (
                            <tr>
                                <td colSpan="3">No Inactive CTC for this employee</td>
                            </tr>
                        ) : (
                            ctcData.map((record) => (
                                <tr key={record.id} onClick={() => handleRecordClick(record)}>
                                    <td>{record.effectiveFromDate}</td>
                                    <td>{record.effectiveToDate}</td>
                                    <td className='textbutton'>{record.ctcStatus ? 'Active' : 'Inactive'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <div>
                        {/* <button type="button" className="outline-btn" onClick={handleBack} >Back</button> */}
                    </div>
                </table>

            )}

            {isModalOpen && selectedCtc && (
                <div className="ctc-modal">
                    <div className="ctc-content">
                        <h3 className='form-title'>{companyName}</h3>
                        <p>{companyAddress}</p>
                        <img className='HRMSNew' src={logo} alt="Pristine Logo" width={120} height={30} />
                        <table className="employee-details-table">
                            <tbody>
                                <tr>
                                    <td>Employee Name</td>
                                    <td style={{ textAlign: 'right' }}> {selectedCtc.employee.firstName} {selectedCtc.employee.middleName} {selectedCtc.employee.lastName}</td>
                                </tr>
                                <tr>
                                    <td>Department</td>
                                    <td style={{ textAlign: 'right' }}>{selectedCtc.employee.department}</td>
                                </tr>
                                <tr>
                                    <td>Designation</td>
                                    <td style={{ textAlign: 'right' }}>{selectedCtc.employee.designation}</td>
                                </tr>
                                <tr>
                                    <td>Total CTC</td>
                                    <td style={{ textAlign: 'right' }}>{selectedCtc.ctcAmount}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="ctc-breakdown-table">
                            <thead>
                                <tr>
                                    <th>Label</th>
                                    <th>Monthly Amount</th>
                                    <th>Annual Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedCtc.staticCTCBreakdowns.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.label}</td>
                                        <td style={{ textAlign: 'right' }}>{(item.amount / 12).toFixed(0)}</td>
                                        <td style={{ textAlign: 'right' }}>{item.amount}</td>
                                    </tr>
                                ))}
                                {selectedCtc.variableCTCBreakdowns.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.label}</td>
                                        <td style={{ textAlign: 'right' }}>{(item.amount / 12).toFixed(0)}</td>
                                        <td style={{ textAlign: 'right' }}>{item.amount}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td><strong>Total</strong></td>
                                    <td style={{ textAlign: 'right' }}><strong>{totalMonthly.toFixed(0)}</strong></td>
                                    <td style={{ textAlign: 'right' }}><strong>{totalAnnual.toFixed(0)}</strong></td>
                                </tr>
                            </tbody>

                        </table>
                        <div className="form-controls">
                            <button className="btn" onClick={() => window.print()}>Print</button>
                            <button className="outline-btn" onClick={() => setIsModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ViewCTC;

















































// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { strings } from '../../string';
// import '../CommonCss/Payslip.css';
// import { showToast } from '../../Api.jsx';

// const ViewCTC = () => {
//     const { id: employeeIdFromUrl } = useParams(); // Get employeeId from URL params
//     const [employeeId, setEmployeeId] = useState(employeeIdFromUrl || localStorage.getItem('employeeId')); // If URL param is not available, fallback to localStorage
//     const navigate = useNavigate();

//     const [companyName, setCompanyName] = useState('');
//     const [companyAddress, setCompanyAddress] = useState('');
//     const [ctcData, setCtcData] = useState([]);
//     const [selectedCtc, setSelectedCtc] = useState({
//         staticCTCBreakdowns: [],
//         variableCTCBreakdowns: [],
//         ctcAmount: 0,
//     });
//     const [isActive, setIsActive] = useState(true);
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     const companyId = localStorage.getItem('companyId');
//     const accountId = localStorage.getItem('accountId');
//     const [companyAssignId, setCompanyAssignId] = useState('');

//     // Fetch CTC Data based on employeeId
//     useEffect(() => {
//         const fetchCtcData = async () => {
//             const status = isActive ? 'True' : 'False';
//             console.log(`Fetching CTC data with status: ${status}`);

//             try {
//                 const response = await axios.get(
//                     `http://${strings.localhost}/api/ctcmain/byEmployee/ctcStatus${status}/${employeeId}`
//                 );
//                 console.log('Fetched CTC Data:', response.data);

//                 if (response.data) {
//                     if (isActive) {
//                         const ctcRecord = response.data; // Active record
//                         console.log('Static Breakdown:', ctcRecord.staticCTCBreakdowns);
//                         console.log('Variable Breakdown:', ctcRecord.variableCTCBreakdowns);

//                         // Set both CTC breakdowns and employee data
//                         setSelectedCtc({
//                             staticCTCBreakdowns: ctcRecord.staticCTCBreakdowns,
//                             variableCTCBreakdowns: ctcRecord.variableCTCBreakdowns,
//                             ctcAmount: ctcRecord.ctcAmount,
//                             name: `${ctcRecord.employee.firstName} ${ctcRecord.employee.middleName} ${ctcRecord.employee.lastName}`,
//                             department: ctcRecord.employee.department,
//                             designation: ctcRecord.employee.designation,
//                             companyName: ctcRecord.company.companyName,
//                             companyAddress: `${ctcRecord.company.companyName}, ${ctcRecord.company.companyType}`
//                         });
//                         setCompanyAssignId(ctcRecord.company.companyAssignId);
//                     } else {
//                         // Set inactive CTC records for display
//                         setCtcData(response.data); // Assuming response contains multiple inactive records
//                     }
//                 } else {
//                     console.log('No CTC records found for the given status');
//                     setCtcData([]);
//                     showToast("No CTC found for this employee", 'error');
//                 }
//             } catch (error) {
//                 console.error('Error fetching CTC data:', error);
//             }
//         };

//         if (employeeId) {
//             fetchCtcData();
//         }
//     }, [isActive, employeeId]);

//     // Fetch Company Details
//     useEffect(() => {
//         const fetchCompanyDetails = async () => {
//             if (!companyAssignId) {
//                 console.log("No companyAssignId, skipping company fetch.");
//                 return;
//             }

//             try {
//                 const companyResponse = await axios.get(
//                     `http://${strings.localhost}/api/CompanyRegistartion/GetCompanyByIds?companyAssignId=${companyAssignId}&accountId=${accountId}`
//                 );
//                 console.log("Company Response:", companyResponse.data);

//                 const company = companyResponse.data[0];
//                 if (company) {
//                     setCompanyName(company.companyName);
//                     setCompanyAddress(company.address);
//                 } else {
//                     console.log("No company found.");
//                 }
//             } catch (error) {
//                 console.error('Error fetching company details:', error);
//             }
//         };

//         fetchCompanyDetails();
//     }, [companyAssignId, accountId]);

//     // Handle Record Click for Inactive CTC
//     const handleRecordClick = async (ctcRecord) => {
//         console.log("Handling record click for CTC record:", ctcRecord);
//         setSelectedCtc(ctcRecord);
//         if (ctcRecord) {
//             setIsModalOpen(true);
//         } else {
//             console.error("CTC record is null or undefined");
//         }
//     };

//     const handlePrint = () => {
//         console.log("Initiating print...");
//         window.print();
//     };

//     const calculateTotals = (breakdowns) => {
//         let monthlyTotal = 0;
//         let annualTotal = 0;
//         breakdowns.forEach(item => {
//             monthlyTotal += item.amount / 12;
//             annualTotal += item.amount;
//         });
//         return { monthlyTotal, annualTotal };
//     };

//     const staticTotals = calculateTotals(selectedCtc.staticCTCBreakdowns);
//     const variableTotals = calculateTotals(selectedCtc.variableCTCBreakdowns);

//     const totalMonthly = staticTotals.monthlyTotal + variableTotals.monthlyTotal;
//     const totalAnnual = staticTotals.annualTotal + variableTotals.annualTotal;

//     const handleBack = () => {
//         navigate(`/ListEmp`);
//     };

//     return (
//         <div className="coreContainer">
//             <div className="switch-container">
//                 <label className="switch">
//                     <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} />
//                     <span className="slider"></span>
//                 </label>
//                 <span>{isActive ? 'Active CTC' : 'Inactive CTC'}</span>
//             </div>

//             {/* Active CTC Table */}
//             {isActive && selectedCtc && selectedCtc.staticCTCBreakdowns && selectedCtc.variableCTCBreakdowns ? (
//                 <div className="container-asset">
//                     <img className='HRMSNew' src="/SpectrumLogo.png" alt="Pristine Logo" width={120} height={30} />
//                     <h3 className='form-title'>{companyName}</h3>
//                     <p>{companyAddress}</p>

//                     <table className="ctc-details-table">
//                         <tbody>
//                             <tr>
//                                 <td>Employee Name</td>
//                                 <td style={{ textAlign: 'right' }}>{selectedCtc.name}</td>
//                             </tr>
//                             <tr>
//                                 <td>Department</td>
//                                 <td style={{ textAlign: 'right' }}>{selectedCtc.department}</td>
//                             </tr>
//                             <tr>
//                                 <td>Designation</td>
//                                 <td style={{ textAlign: 'right' }}>{selectedCtc.designation}</td>
//                             </tr>
//                             <tr>
//                                 <td><strong>Total CTC</strong></td>
//                                 <td style={{ textAlign: 'right' }}><strong>{selectedCtc.ctcAmount}</strong></td>
//                             </tr>
//                         </tbody>
//                     </table>

//                     <table className="ctc-breakdown-table">
//                         <thead>
//                             <tr>
//                                 <th>Label</th>
//                                 <th style={{ textAlign: 'right' }}>Monthly Amount</th>
//                                 <th style={{ textAlign: 'right' }}>Annual Amount</th>
//                             </tr>
//                         </thead>
//                         <tbody >
//                             {selectedCtc.staticCTCBreakdowns.map((item) => (
//                                 <tr key={item.id}>
//                                     <td>{item.label}</td>
//                                     <td style={{ textAlign: "right" }}>{(item.amount / 12).toFixed(0)}</td>
//                                     <td style={{ textAlign: 'right' }}>{item.amount}</td>
//                                 </tr>
//                             ))}
//                             {selectedCtc.variableCTCBreakdowns.map((item) => (
//                                 <tr key={item.id}>
//                                     <td>{item.label}</td>
//                                     <td style={{ textAlign: 'right' }}>{(item.amount / 12).toFixed(0)}</td>
//                                     <td style={{ textAlign: 'right' }}>{item.amount}</td>
//                                 </tr>
//                             ))}
//                             <tr>
//                                 <td><strong>Total</strong></td>
//                                 <td style={{ textAlign: 'right' }}><strong>{totalMonthly.toFixed(0)}</strong></td>
//                                 <td style={{ textAlign: 'right' }}><strong>{totalAnnual.toFixed(0)}</strong></td>
//                             </tr>
//                         </tbody>
//                     </table>
//                     <div className='form-controls'>
//                         <button className='btn' type='button' onClick={handlePrint}>Print</button>
//                         <button type="button" className="outline-btn" onClick={handleBack} >Back</button>
//                     </div>
//                 </div>
//             ) : (
//                 // Inactive CTC Table
//                 <table className="ctc-table">
//                     <thead>
//                         <tr>
//                             <th>From Date</th>
//                             <th>To Date</th>
//                             <th>Status</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {ctcData.length === 0 ? (
//                             <tr>
//                                 <td colSpan="3">No Inactive CTC for this employee</td>
//                             </tr>
//                         ) : (
//                             ctcData.map((record) => (
//                                 <tr key={record.id} onClick={() => handleRecordClick(record)}>
//                                     <td>{record.effectiveFromDate}</td>
//                                     <td>{record.effectiveToDate}</td>
//                                     <td className='textbutton'>{record.ctcStatus ? 'Active' : 'Inactive'}</td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                     <div>
//                         <button type="button" className="outline-btn" onClick={handleBack} >Back</button>
//                     </div>
//                 </table>
//             )}

//             {isModalOpen && selectedCtc && (
//                 <div className="ctc-modal">
//                     <div className="ctc-content">
//                         <h3 className='form-title'>{companyName}</h3>
//                         <p>{companyAddress}</p>
//                         <img className='HRMSNew' src="/SpectrumLogo.png" alt="Pristine Logo" width={120} height={30} />
//                         <table className="employee-details-table">
//                             <tbody>
//                                 <tr>
//                                     <td>Employee Name</td>
//                                     <td>{selectedCtc.name}</td>
//                                 </tr>
//                                 <tr>
//                                     <td>Department</td>
//                                     <td>{selectedCtc.department}</td>
//                                 </tr>
//                                 <tr>
//                                     <td>Designation</td>
//                                     <td>{selectedCtc.designation}</td>
//                                 </tr>
//                                 <tr>
//                                     <td><strong>Total CTC</strong></td>
//                                     <td>{selectedCtc.ctcAmount}</td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                         <div className="ctc-close-button">
//                             <button type="button" className="outline-btn" onClick={() => setIsModalOpen(false)}>Close</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ViewCTC;
