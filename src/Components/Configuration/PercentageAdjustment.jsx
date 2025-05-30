
// import React, { useState, useEffect } from 'react';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import '../CommonCss/Project.css';

// const PercentageAdjustment = () => {
//     const [annualCTC, setAnnualCTC] = useState('');
//     const [percentages, setPercentages] = useState({
//         basic: 40,
//         da: 10,
//         conveyance: 5,
//         medical: 5,
//         hra: 20,
//         providentFundEE: 12,
//         otherAllowance: 3,
//         lunchAllowance: 2,
//         gratuity: 4,
//         providentFundER: 12,
//         performanceBonus: 5,
//         retentionBonus: 3,
//     });

//     const [breakdown, setBreakdown] = useState({
//         basic: 0,
//         da: 0,
//         conveyance: 0,
//         medical: 0,
//         providentFundEE: 0,
//         otherAllowance: 0,
//         lunchAllowance: 0,
//         hra: 0,
//         gross: 0,
//         mediclaim: 0,
//         gratuity: 0,
//         providentFundER: 0,
//         performanceBonus: 0,
//         retentionBonus: 0,
//     });

//     const [error, setError] = useState('');

//     useEffect(() => {
//         // Calculate gross based on breakdown components whenever they are generated
//         const total = Object.values(breakdown).reduce((sum, value) => sum + Number(value), 0);
//         setBreakdown(prev => ({ ...prev, gross: total }));
//     }, [breakdown]);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;

//         // Validate individual components
//         if (name !== 'mediclaim' && (Number(value) < 0 || Number(value) > annualCTC)) {
//             setError(`${name} must be between 0 and the annual CTC.`);
//             return;
//         }

//         setBreakdown(prev => ({ ...prev, [name]: Number(value) }));
//     };

//     const handlePercentageChange = (e) => {
//         const { name, value } = e.target;
//         const newPercentages = { ...percentages, [name]: Number(value) };
//         const totalPercentage = Object.values(newPercentages).reduce((sum, val) => sum + val, 0);

//         if (totalPercentage > 100) {
//             setError("Total percentage cannot exceed 100%.");
//         } else {
//             setError('');
//             setPercentages(newPercentages);
//         }
//     };

//     const handleCTCChange = (e) => {
//         const value = e.target.value;
//         setAnnualCTC(value);
//         if (value < 100000) {
//             setError("Annual CTC must be greater than 1 lakh.");
//         } else {
//             setError("");
//         }
//     };

//     const handleGenerateCTC = () => {
//         if (annualCTC < 100000) {
//             setError("Annual CTC must be greater than 1 lakh.");
//             return;
//         }

//         const newBreakdown = {
//             basic: (annualCTC * (percentages.basic / 100)).toFixed(2),
//             da: (annualCTC * (percentages.da / 100)).toFixed(2),
//             conveyance: (annualCTC * (percentages.conveyance / 100)).toFixed(2),
//             medical: (annualCTC * (percentages.medical / 100)).toFixed(2),
//             hra: (annualCTC * (percentages.hra / 100)).toFixed(2),
//             providentFundEE: (annualCTC * (percentages.providentFundEE / 100)).toFixed(2),
//             otherAllowance: (annualCTC * (percentages.otherAllowance / 100)).toFixed(2),
//             lunchAllowance: (annualCTC * (percentages.lunchAllowance / 100)).toFixed(2),
//             gratuity: (annualCTC * (percentages.gratuity / 100)).toFixed(2),
//             providentFundER: (annualCTC * (percentages.providentFundER / 100)).toFixed(2),
//             performanceBonus: (annualCTC * (percentages.performanceBonus / 100)).toFixed(2),
//             retentionBonus: (annualCTC * (percentages.retentionBonus / 100)).toFixed(2),
//             mediclaim: 0, // Default value
//         };

//         setBreakdown(newBreakdown);
//         setError('');
//     };

//     const handleReset = () => {
//         setAnnualCTC('');
//         setBreakdown({
//             basic: 0,
//             da: 0,
//             conveyance: 0,
//             medical: 0,
//             providentFundEE: 0,
//             otherAllowance: 0,
//             lunchAllowance: 0,
//             hra: 0,
//             gross: 0,
//             mediclaim: 0,
//             gratuity: 0,
//             providentFundER: 0,
//             performanceBonus: 0,
//             retentionBonus: 0,
//         });
//         setPercentages({
//             basic: 40,
//             da: 10,
//             conveyance: 5,
//             medical: 5,
//             hra: 20,
//             providentFundEE: 12,
//             otherAllowance: 3,
//             lunchAllowance: 2,
//             gratuity: 4,
//             providentFundER: 12,
//             performanceBonus: 5,
//             retentionBonus: 3,
//         });
//         setError('');
//     };

//     const handleExportCSV = () => {
//         const csvData = [
//             ['Component', 'Amount'],
//             ...Object.entries(breakdown).map(([key, value]) => [key, value]),
//             ['Total CTC', annualCTC]
//         ];

//         const csvContent = 'data:text/csv;charset=utf-8,' + csvData.map(e => e.join(',')).join('\n');
//         const encodedUri = encodeURI(csvContent);
//         const link = document.createElement('a');
//         link.setAttribute('href', encodedUri);
//         link.setAttribute('download', 'ctc_breakdown.csv');
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     const handleExportPDF = () => {
//         const doc = new jsPDF();
//         doc.text("CTC Breakdown", 14, 16);
//         doc.autoTable({
//             head: [['Component', 'Amount']],
//             body: Object.entries(breakdown).map(([key, value]) => [key, value]),
//         });
//         doc.text(`Total CTC: ${annualCTC}`, 14, doc.lastAutoTable.finalY + 10);
//         doc.save('ctc_breakdown.pdf');
//     };

//     const handleExportExcel = () => {
//         const data = [
//             ['Component', 'Amount'],
//             ...Object.entries(breakdown).map(([key, value]) => [key, value]),
//             ['Total CTC', annualCTC]
//         ];

//         const worksheet = XLSX.utils.aoa_to_sheet(data);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, 'CTC Breakdown');
//         XLSX.writeFile(workbook, 'ctc_breakdown.xlsx');
//     };

//     return (
//         <div className='box-container'>
//             <h2 className='header'>CTC Breakdown</h2>

//             {/* Annual CTC Input */}
//             <div  className='input-row'>
//                 <label>Enter Annual CTC:</label>
//                 <input
//                     type="number"
//                     placeholder="Enter Annual CTC"
//                     value={annualCTC}
//                     onChange={handleCTCChange}
//                 />
//             </div>

//             {/* Buttons Section */}
//             <div className="button-group">
//                 <button className='btn' onClick={handleGenerateCTC}>Generate CTC</button>
//                 <button className='btn' onClick={handleReset}>Reset</button>
//                 <button className='btn' onClick={handleExportCSV}>Export to CSV</button>
//                 <button className='btn' onClick={handleExportPDF}>Export to PDF</button>
//                 <button className='btn' onClick={handleExportExcel}>Export to Excel</button>
//             </div>

//             {/* Error Display */}
//             {error && <p style={{ color: 'red' }}>{error}</p>}

//             {/* CTC Breakdown - Separate Components */}
//             <h3 className='educational-info-box'>CTC Components</h3>
//             <div className='input-row'>
//                 {/* Basic Input */}
//                 <div className="breakdown-field">
//                     <label>Basic:</label>
//                     <input
//                         type="number"
//                         name="basic"
//                         value={breakdown.basic}
//                         onChange={handleInputChange}
//                         title="Enter Basic"
//                     />
//                 </div>

//                 {/* DA Input */}
//                 <div className="breakdown-field">
//                     <label>DA:</label>
//                     <input
//                         type="number"
//                         name="da"
//                         value={breakdown.da}
//                         onChange={handleInputChange}
//                         title="Enter DA"
//                     />
//                 </div>

//                 {/* Conveyance Input */}
//                 <div className="breakdown-field">
//                     <label>Conveyance:</label>
//                     <input
//                         type="number"
//                         name="conveyance"
//                         value={breakdown.conveyance}
//                         onChange={handleInputChange}
//                         title="Enter Conveyance"
//                     />
//                 </div>

//                 {/* Medical Input */}
//                 <div className="breakdown-field">
//                     <label>Medical:</label>
//                     <input
//                         type="number"
//                         name="medical"
//                         value={breakdown.medical}
//                         onChange={handleInputChange}
//                         title="Enter Medical"
//                     />
//                 </div>
//             </div>
//             <div className='input-row'>
//                 {/* HRA Input */}
//                 <div className="breakdown-field">
//                     <label>HRA:</label>
//                     <input
//                         type="number"
//                         name="hra"
//                         value={breakdown.hra}
//                         onChange={handleInputChange}
//                         title="Enter HRA"
//                     />
//                 </div>

//                 {/* Provident Fund EE Input */}
//                 <div className="breakdown-field">
//                     <label>Provident Fund EE:</label>
//                     <input
//                         type="number"
//                         name="providentFundEE"
//                         value={breakdown.providentFundEE}
//                         onChange={handleInputChange}
//                         title="Enter Provident Fund EE"
//                     />
//                 </div>

//                 {/* Other Allowance Input */}
//                 <div className="breakdown-field">
//                     <label>Other Allowance:</label>
//                     <input
//                         type="number"
//                         name="otherAllowance"
//                         value={breakdown.otherAllowance}
//                         onChange={handleInputChange}
//                         title="Enter Other Allowance"
//                     />
//                 </div>

//                 {/* Lunch Allowance Input */}
//                 <div className="breakdown-field">
//                     <label>Lunch Allowance:</label>
//                     <input
//                         type="number"
//                         name="lunchAllowance"
//                         value={breakdown.lunchAllowance}
//                         onChange={handleInputChange}
//                         title="Enter Lunch Allowance"
//                     />
//                 </div>
//             </div>
//             <div className='input-row'>
//                 {/* Gratuity Input */}
//                 <div className="breakdown-field">
//                     <label>Gratuity:</label>
//                     <input
//                         type="number"
//                         name="gratuity"
//                         value={breakdown.gratuity}
//                         onChange={handleInputChange}
//                         title="Enter Gratuity"
//                     />
//                 </div>

//                 {/* Provident Fund ER Input */}
//                 <div className="breakdown-field">
//                     <label>Provident Fund ER:</label>
//                     <input
//                         type="number"
//                         name="providentFundER"
//                         value={breakdown.providentFundER}
//                         onChange={handleInputChange}
//                         title="Enter Provident Fund ER"
//                     />
//                 </div>

//                 {/* Performance Bonus Input */}
//                 <div className="breakdown-field">
//                     <label>Performance Bonus:</label>
//                     <input
//                         type="number"
//                         name="performanceBonus"
//                         value={breakdown.performanceBonus}
//                         onChange={handleInputChange}
//                         title="Enter Performance Bonus"
//                     />
//                 </div>

//                 {/* Retention Bonus Input */}
//                 <div className="breakdown-field">
//                     <label>Retention Bonus:</label>
//                     <input
//                         type="number"
//                         name="retentionBonus"
//                         value={breakdown.retentionBonus}
//                         onChange={handleInputChange}
//                         title="Enter Retention Bonus"
//                     />
//                 </div>
//             </div>
//             <div className='input-row'>
//                 {/* Gross Salary */}
//                 <div>
//                     <strong>Gross: {breakdown.gross}</strong>
//                 </div>

//                 {/* Total CTC */}
//                 <div>
//                     <strong>Total CTC: {annualCTC}</strong>
//                 </div>
//             </div>

//             <h3 className='educational-info-box'>Adjust Percentages</h3>

//             {Object.keys(percentages).map((key, index) => {
//                 // Start a new row every 4 fields
//                 if (index % 4 === 0) {
//                     return (
//                         <div key={index} className="input-row">
//                             <div className="percentage-field">
//                                 <label>{key.replace(/([A-Z])/g, ' $1').toUpperCase()} (%):</label>
//                                 <input
//                                     type="number"
//                                     name={key}
//                                     value={percentages[key]}
//                                     onChange={handlePercentageChange}
//                                 />
//                             </div>
//                             {/* Render the next three fields in the same row */}
//                             {Object.keys(percentages)
//                                 .slice(index + 1, index + 4)
//                                 .map((nextKey, nextIndex) => (
//                                     <div key={nextIndex + 1} className="percentage-field">
//                                         <label>{nextKey.replace(/([A-Z])/g, ' $1').toUpperCase()} (%):</label>
//                                         <input
//                                             type="number"
//                                             name={nextKey}
//                                             value={percentages[nextKey]}
//                                             onChange={handlePercentageChange}
//                                         />
//                                     </div>
//                                 ))}
//                         </div>
//                     );
//                 }
//                 return null; // Prevents rendering extra divs after every row group
//             })}


//         </div>
//     );
// };

// export default PercentageAdjustment;

























import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../CommonCss/Project.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { strings } from '../../string';
// import * as XLSX from 'xlsx';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PercentageAdjustment = () => {
    const [annualCTC, setAnnualCTC] = useState('');
    const [previousCTC, setPreviousCTC] = useState('');
    const [error, setError] = useState('');
    const [components, setComponents] = useState([]);  // Initialize with empty array
    const [percentages, setPercentages] = useState({});
    const [breakdown, setBreakdown] = useState({});
    const companyId = localStorage.getItem('companyId');
    // Function for currency formatting
    const formatCurrency = (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Fetch components and percentages when the component mounts
    useEffect(() => {
        const fetchCTCDetails = async () => {
            try {
                const response = await fetch(`http://${strings.localhost}/api/ctcMaster/company/${companyId}/category/Static`);
                const data = await response.json();

                if (data) {
                    const { components, percentages } = data;
                    setComponents(components || []);  // Ensure components is always an array
                    setPercentages(percentages || {});  // Ensure percentages is always an object

                    // Initialize breakdown with zero values
                    const initialBreakdown = (components || []).reduce((acc, component) => {
                        acc[component] = 0;
                        return acc;
                    }, {});
                    setBreakdown(initialBreakdown);
                }
            } catch (error) {
                setError('Error fetching data from API');
            }
        };

        fetchCTCDetails();
    }, [companyId]);

    // Recalculate total CTC distribution based on updated percentages
    useEffect(() => {
        if (annualCTC && components.length > 0) {
            const totalPercentage = Object.values(percentages).reduce((sum, val) => sum + val, 0);
            if (totalPercentage > 100) {
                setError('Total percentage cannot exceed 100%');
            } else {
                // Calculate the breakdown based on percentages
                const newBreakdown = (components || []).reduce((acc, component) => {
                    acc[component] = (annualCTC * (percentages[component] / 100)).toFixed(2);
                    return acc;
                }, {});
                setBreakdown(newBreakdown);
                setError('');
            }
        }
    }, [percentages, annualCTC, components]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (Number(value) < 0 || Number(value) > annualCTC) {
            setError(`${name} must be between 0 and the annual CTC.`);
            return;
        }

        setBreakdown(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handlePercentageChange = (e) => {
        const { name, value } = e.target;
        let newPercentages = { ...percentages, [name]: Number(value) };

        // Validation for individual percentage component
        if (newPercentages[name] < 0 || newPercentages[name] > 100) {
            setError(`${name} percentage must be between 0% and 100%`);
            return;
        }

        // Check if total percentage exceeds 100%
        const totalPercentage = Object.values(newPercentages).reduce((sum, val) => sum + val, 0);
        if (totalPercentage > 100) {
            setError("Total percentage cannot exceed 100%.");
        } else {
            // Adjust other components automatically to maintain 100% total
            const remainingPercentage = 100 - totalPercentage;
            const remainingComponents = (components || []).filter(component => component !== name);

            remainingComponents.forEach((component) => {
                const adjustedPercentage = (remainingPercentage / remainingComponents.length);
                newPercentages[component] = adjustedPercentage;
            });

            setError('');
            setPercentages(newPercentages);
        }
    };

    const handleCTCChange = (e) => {
        const value = e.target.value;
        setAnnualCTC(value);
        if (value < 100000) {
            setError("Annual CTC must be greater than 1 lakh.");
        } else {
            setError('');
        }
    };

    const handlePreviousCTCChange = (e) => {
        const value = e.target.value;
        setPreviousCTC(value);
    };

    const handleGenerateCTC = () => {
        if (annualCTC < 100000) {
            setError("Annual CTC must be greater than 1 lakh.");
            return;
        }

        const newBreakdown = {};
        (components || []).forEach((component) => {
            newBreakdown[component] = (annualCTC * (percentages[component] / 100)).toFixed(2);
        });

        setBreakdown(newBreakdown);
        setError('');
    };

    const handleReset = () => {
        setAnnualCTC('');
        setBreakdown((components || []).reduce((acc, component) => {
            acc[component] = 0;
            return acc;
        }, {}));
        setPercentages((components || []).reduce((acc, component) => {
            acc[component] = 0;
            return acc;
        }, {}));
        setError('');
    };

    const handleExportCSV = () => {
        const csvData = [
            ['Component', 'Amount'],
            ...Object.entries(breakdown).map(([key, value]) => [key, formatCurrency(value)]),
            ['Total CTC', formatCurrency(annualCTC)]
        ];

        const csvContent = 'data:text/csv;charset=utf-8,' + csvData.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'ctc_breakdown.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("CTC Breakdown", 14, 16);
        doc.autoTable({
            head: [['Component', 'Amount']],
            body: Object.entries(breakdown).map(([key, value]) => [key, formatCurrency(value)]),
        });

        // Summary Section
        const summary = (components || []).map(component => ({
            component: component,
            amount: breakdown[component] || 0
        }));

        doc.text('Summary:', 14, doc.lastAutoTable.finalY + 10);
        doc.autoTable({
            head: [['Component', 'Amount']],
            body: summary.map(item => [item.component, formatCurrency(item.amount)]),
            startY: doc.lastAutoTable.finalY + 10
        });

        doc.text(`Total CTC: ${formatCurrency(annualCTC)}`, 14, doc.lastAutoTable.finalY + 10);
        doc.save('ctc_breakdown_with_summary.pdf');
    };

    // const handleExportExcel = () => {
    //     const data = [
    //         ['Component', 'Amount'],
    //         ...Object.entries(breakdown).map(([key, value]) => [key, formatCurrency(value)]),
    //         ['Total CTC', formatCurrency(annualCTC)]
    //     ];

    //     const worksheet = XLSX.utils.aoa_to_sheet(data);
    //     const workbook = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(workbook, worksheet, 'CTC Breakdown');
    //     XLSX.writeFile(workbook, 'ctc_breakdown.xlsx');
    // };

    // CTC Comparison Chart
    const comparisonData = {
        labels: components,
        datasets: [
            {
                label: 'Current Year',
                data: (components || []).map(component => breakdown[component] || 0),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            previousCTC && {
                label: 'Previous Year',
                data: (components || []).map(component => previousCTC * (percentages[component] / 100) || 0),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            }
        ].filter(Boolean)
    };

    return (
        <div className="adjustment-container">
            <h2>Percentage Adjustment for CTC Breakdown</h2>
            <div>
                <input
                    type="number"
                    placeholder="Enter Annual CTC"
                    value={annualCTC}
                    onChange={handleCTCChange}
                />
            </div>
            <div>
                <input
                    type="number"
                    placeholder="Enter Previous CTC"
                    value={previousCTC}
                    onChange={handlePreviousCTCChange}
                />
            </div>
            <div>
                {error && <div className="error-message">{error}</div>}
            </div>

            {/* Render breakdown components only if they exist */}
            {components.length > 0 && (
                <div>
                    {components.map(component => (
                        <div key={component}>
                            <label>{component}</label>
                            <input
                                type="number"
                                name={component}
                                value={breakdown[component]}
                                onChange={handleInputChange}
                            />
                            <input
                                type="number"
                                name={component}
                                value={percentages[component]}
                                onChange={handlePercentageChange}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Display bar chart only if there is breakdown data */}
            {Object.keys(breakdown).length > 0 && (
                <Bar data={comparisonData} options={{ responsive: true }} />
            )}
            <div className='form-controls'>
                <button type='button' className='btn' onClick={handleGenerateCTC}>Generate CTC</button>
                <button type='button' className='btn' onClick={handleReset}>Reset</button>
                <button type='button' className='btn' onClick={handleExportCSV}>Export as CSV</button>
                <button type='button' className='btn' onClick={handleExportPDF}>Export as PDF</button>
                {/* <button type='button' className='btn' onClick={handleExportExcel}>Export as Excel</button> */}
            </div>
        </div>
    );
};

export default PercentageAdjustment;
