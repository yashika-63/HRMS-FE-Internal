import React, { useState } from 'react';
import axios from 'axios';
import '../CommonCss/Payslip.css';
import { showToast } from '../../Api.jsx';
import { strings } from '../../string.jsx';

const AiTdsCalculator = ({ ctcData, isOpen, onClose }) => {
    const [entries, setEntries] = useState([{ label: '', amount: '', type: 'Income' }]);
    const [response, setResponse] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    if (!isOpen) return null;

    const handleEntryChange = (index, field, value) => {
        const updatedEntries = [...entries];
        updatedEntries[index][field] = value;
        setEntries(updatedEntries);
    };

    const handleAddMore = () => {
        setEntries([...entries, { label: '', amount: '', type: 'Income' }]);
    };

    const generatePrompt = (ctcData, entries) => {
        const formatAmount = (amt) => {
            const num = Number(amt);
            return num;
        };

        const breakdowns = [
            ...(ctcData.staticCTCBreakdowns || []),
            ...(ctcData.variableCTCBreakdowns || [])
        ]
            .map(item => `${formatAmount(item.amount)} ${item.label}`)
            .join(', ');

        const custom = entries
            .filter(e => e.label && e.amount)
            .map(e => `${formatAmount(e.amount)} ${e.label} (${e.type})`)
            .join(', ');

        const allParts = [breakdowns, custom].filter(Boolean).join(', ');

        return `${ctcData.name} has the following salary components and declarations: ${allParts}. Calculate yearly TDS under the old regime for FY 2024-25.`;
    };

    const handleSubmit = async () => {
        const prompt = generatePrompt(ctcData, entries);
        setIsSubmitting(true);


        try {
            const res = await axios.post(`http://${strings.localhost}/api/incomeTax/calculate-tds`, { prompt });

            if (res.data.totalTDS !== undefined) {
                setResponse(res.data);
            } else {
                const textValue = res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                const amountOnly = textValue.replace(/[^\d]/g, '');
                setResponse({ amount: parseInt(amountOnly, 10), raw: res.data });
            }

            showToast("TDS Calculation Submitted Successfully", "success");
            // alert("TDS Calculation Submitted Successfully!");
        } catch (error) {
            showToast("Error submitting TDS data", "error");


        }
        finally {
            setIsSubmitting(false);
        }
    };

    const handleSave = async () => {
        if (!response?.totalTDS) {
            showToast("No valid TDS amount to save.", 'error');
            return;
        }

        setIsSaving(true);
        try {
<<<<<<< HEAD
            const employeeId = ctcData.employeeId || 2;
            const ctcBreakdownId = ctcData.ctcBreakdownId || 3;
=======
            const employeeId = ctcData?.employee?.id;
            const ctcBreakdownId = ctcData?.id;

>>>>>>> 8a5f66f (merging code)
            const incomeTaxAmount = response.totalTDS;

            await axios.post(`http://${strings.localhost}/api/incomeTax/save`, null, {
                params: { employeeId, ctcBreakdownId, incomeTaxAmount }
            });

            showToast(`Saved income tax amount ₹${incomeTaxAmount} successfully.`, 'suceess');
            onClose();
        } catch (error) {
            console.error("Error saving income tax:", error);
            showToast("Failed to save income tax data", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const labels = {
        grossIncome: "Gross Income",
        totalExemptions: "Total Exemptions",
        totalDeductions: "Total Deductions",
        taxableIncome: "Taxable Income",
        incomeTax: "Income Tax",
        surcharge: "Surcharge",
        cess: "Cess",
        rebate: "Rebate",
        totalTDS: "Total TDS"
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content scrollable-modal">
                <h3 className='form-title'>{ctcData.companyName}</h3>
                <p>{ctcData.companyAddress}</p>

                <table className="interview-table">
                    <thead>
                        <tr>
                            <th>Label</th>
                            <th>Amount</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="text"
                                        value={entry.label}
                                        onChange={(e) => handleEntryChange(index, 'label', e.target.value)}
                                        placeholder="Label"
                                    />
                                </td>
                                <td>
                                    <input
                                        className='selectIM'
                                        type="number"
                                        value={entry.amount}
                                        onChange={(e) => handleEntryChange(index, 'amount', e.target.value)}
                                        placeholder="Amount"
                                    />
                                </td>
                                <td>
                                    <select
                                        className='selectIM'
                                        value={entry.type}
                                        onChange={(e) => handleEntryChange(index, 'type', e.target.value)}
                                    >
                                        <option value="Income">Income</option>
                                        <option value="Deduction">Deduction</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button className="btn" onClick={handleAddMore} style={{ marginTop: '10px' }}>
                    + Add More
                </button>

                <div className="form-controls" style={{ marginTop: '20px' }}>
                    <button className="btn" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Submit'}
                    </button>
                    <button className="outline-btn" onClick={onClose}>Cancel</button>
                </div>

                {response && (
                    <div className="response-modal">
                        <h4>TDS Calculation Summary:</h4>
                        <table className="interview-table">
                            <thead>
                                <tr>
                                    <th>Component</th>
                                    <th>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(response).map(([key, value]) => (
                                    key !== "calculationBreakdown" && (
                                        <tr key={key}>
                                            <td>{labels[key] || key}</td>
                                            <td>
                                                {key === 'totalTDS' ? (
                                                    <input
                                                        type="number"
                                                        value={value}
                                                        onChange={(e) =>
                                                            setResponse({ ...response, totalTDS: parseInt(e.target.value, 10) || 0 })
                                                        }
                                                    />
                                                ) : (
                                                    value
                                                )}
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>

                        <p style={{ fontSize: '12px', color: '#b33a3a', marginTop: '10px' }}>
                            ⚠️ This is an AI-generated response. Please verify the values before relying on them.
                        </p>

                        {response.calculationBreakdown && (
                            <>
                                <h5 style={{ marginTop: '15px' }}>Calculation Breakdown:</h5>
                                <table className="response-table">
                                    <thead>
                                        <tr>
                                            <th>Component</th>
                                            <th>Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {response.calculationBreakdown.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.component}</td>
                                                <td>{item.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        <button className="btn" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Data'}
                        </button>
                    </div>
                )}

                {isSubmitting && (
                    <div className="spinner-container">
                        <img src="/Pristine-logo.png" alt="Loading..." className="spinner-image" />
                        <p className='textbutton'>Pristine Ai Working for your request...</p>
                    </div>

                )}

            </div>
        </div>
    );
};

export default AiTdsCalculator;
