
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../string.jsx';
import { fetchDataByKey, showToast } from '../../Api.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';

const CTC = ({ onClose, offerId, selectedEmployee, offerdata }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSendingOffer, setIsSendingOffer] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({ 1: false, 2: false, 3: false });
  const [distributedAmounts, setDistributedAmounts] = useState([]);
  const [percentages, setPercentages] = useState([]);
  const [error, setError] = useState('');
  const [effectiveFromDate, setEffectiveFromDate] = useState('');
  const [effectiveToDate, setEffectiveToDate] = useState('');
  const companyId = localStorage.getItem('companyId');
  const defaultPercentages = {
    BasicSalary: 40,
    HRA: 30,
    Bonus: 10,
    ProvidentFund: 12,
    Gratuity: 8,
    MedicalAllowance: 2,
    SpecialAllowance: 5,
    ConveyanceAllowance: 3,
    MealAllowance: 2,
    OvertimePay: 2,
    Insurance: 1,
    StockOptions: 5,
    RetirementBenefits: 2,
    PerformanceIncentives: 5,
    EducationAssistance: 2,
    FlexibleBenefits: 2,
    RelocationAllowance: 2,
    SeverancePay: 2,
    HolidayPay: 2,
  };
  const [dropdownData, setDropdownData] = useState({
    CtcCategory: [],
  });
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const CtcCategory = await fetchDataByKey('CtcCategory');
        setDropdownData({
          CtcCategory: CtcCategory,
        });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (category && amount >= 1000) {
      fetchAttributes(category);
    }
  }, [amount, category]);

  const fetchAttributes = async (CtcCategory) => {
    const companyId = localStorage.getItem('companyId');
    if (!companyId) {
      console.error('Company ID is missing');
      return;
    }

    try {
      const response = await axios.get(`http://${strings.localhost}/api/ctcMaster/company/${companyId}/category/${encodeURIComponent(CtcCategory)}`);

      if (response.data && Array.isArray(response.data)) {
        const uniqueAttributes = [];
        const seenLabels = new Set();

        // Remove duplicate labels
        response.data.forEach((attr) => {
          if (!seenLabels.has(attr.label)) {
            uniqueAttributes.push(attr);
            seenLabels.add(attr.label);
          }
        });
        setAttributes(uniqueAttributes);
        const flatAmounts = uniqueAttributes.filter(attr => attr.percentValue > 100);
        console.log('Flat Amounts (percentValue > 100):', flatAmounts);
        const sumOfFlatAmounts = flatAmounts.reduce((acc, attr) => acc + (attr.percentValue || 0), 0);
        console.log('Sum of Flat Amounts:', sumOfFlatAmounts);
        const remainingAmount = amount;

        if (remainingAmount < 0) {
          console.log('Remaining amount is negative. Resetting values.');
          setError("Remaining amount cannot be negative.");
          setAmount(null);
          setDistributedAmounts([]);
          return;
        }
        const basicSalary = uniqueAttributes.find(attr => attr.label === 'Basic');
        if (!basicSalary) {
          console.error('Basic salary not found in the attributes');
          return;
        }
        const basicSalaryPercentage = basicSalary.percentValue || 0;
        const basicSalaryAmount = (remainingAmount * basicSalaryPercentage / 100);
        console.log('Basic Salary Amount:', basicSalaryAmount);
        const recalculatedAmounts = uniqueAttributes.map((attr) => {
          if (attr.percentValue > 100) {
            console.log(`Flat Amount for ${attr.label}:`, attr.percentValue);
            return attr.percentValue;
          } else if (attr.label === 'Basic') {
            console.log(`Basic Salary for ${attr.label}:`, basicSalaryAmount);
            return basicSalaryAmount;
          } else {
            const percentage = attr.percentValue || 0;
            const calculatedAmount = (basicSalaryAmount * (percentage / 100));
            console.log(`Calculated Amount for ${attr.label} (Percentage: ${percentage}% of Basic Salary):`, calculatedAmount);
            return isNaN(calculatedAmount) ? 0 : calculatedAmount;
          }
        });
        console.log('Recalculated Amounts (Flat amounts fixed, remaining distributed by percentage):', recalculatedAmounts);
        const totalDistributedAmount = recalculatedAmounts.reduce((acc, value) => acc + value, 0);
        console.log('Total Distributed Amount (Flat + Percentage Calculated):', totalDistributedAmount);
        setDistributedAmounts(recalculatedAmounts);
        const calculatedPercentages = uniqueAttributes.map((attr, index) => {
          return (attr.percentValue !== null && attr.percentValue !== undefined)
            ? attr.percentValue
            : (percentages[index] || defaultPercentages[attr.label] || 0);
        });
        const roundedPercentages = calculatedPercentages.map(percentage => parseFloat(percentage.toFixed(3)));
        const totalPercentage = roundedPercentages.reduce((acc, value) => acc + value, 0);
        const difference = 100 - totalPercentage;
        if (difference !== 0) {
          roundedPercentages[roundedPercentages.length - 1] += difference;
        }
        setPercentages(roundedPercentages);
        console.log('Updated Percentages:', roundedPercentages);

      } else {
        console.error('No attributes found for the selected category');
      }
    } catch (error) {
      console.error('Error fetching attributes:', error);
    }
  };


  const handleAmountChange = (e) => {
    const newAmount = parseFloat(e.target.value);

    if (e.target.value === "") {
      setAmount(null);
      setDistributedAmounts([]);
      setError("");
    } else if (isNaN(newAmount) || newAmount < 1000) {
      setError("Amount must be greater than or equal to 1000");
      setAmount(null);
      setDistributedAmounts([]);
    } else {
      setError("");
      setAmount(newAmount);
      const flatAmounts = attributes.filter(attr => attr.percentValue > 100);
      const sumOfFlatAmounts = flatAmounts.reduce((acc, attr) => acc + (attr.percentValue || 0), 0);
      const remainingAmount = newAmount;
      if (remainingAmount < 0) {
        setError("Amount is not sufficient to distribute.");
        setAmount(null);
        setDistributedAmounts([]);
        return;
      }
      const basicSalaryIndex = attributes.findIndex(attr => attr.label === 'Basic');
      const basicSalaryPercentage = basicSalaryIndex !== -1 ? percentages[basicSalaryIndex] : 0;
      const basicSalaryAmount = (newAmount * basicSalaryPercentage / 100);
      const recalculatedAmounts = attributes.map((attr, index) => {
        if (attr.percentValue > 100) {
          console.log(`Flat Amount for ${attr.label}:`, attr.percentValue);
          return attr.percentValue;
        } else if (attr.label === 'Basic') {
          console.log(`Basic Salary for ${attr.label}:`, basicSalaryAmount);
          return basicSalaryAmount;
        } else {
          const percentage = (attr.percentValue !== null && attr.percentValue !== undefined)
            ? attr.percentValue
            : (percentages[index] || defaultPercentages[attr.label] || 0);
          const calculatedAmount = (basicSalaryAmount * (percentage / 100));

          console.log(`Calculated Amount for ${attr.label} based on Basic Salary (Percentage: ${percentage}%):`, calculatedAmount);
          return isNaN(calculatedAmount) ? 0 : calculatedAmount;
        }
      });
      setDistributedAmounts(recalculatedAmounts);

    }
  }

  const handleEditChange = (index, newAmount) => {
    let parsedAmount = newAmount === "" ? 0 : parseFloat(newAmount);

    if (isNaN(parsedAmount)) {
      return;
    }
    const updatedAmounts = [...distributedAmounts];
    updatedAmounts[index] = parsedAmount;
    const totalDistributed = updatedAmounts.reduce((acc, curr) => acc + curr, 0);
    const remainingAmount = amount - totalDistributed;

    if (remainingAmount > 0) {
      const specialAllowanceIndex = attributes.findIndex(attr => attr.label === 'Special Allowances');
      if (specialAllowanceIndex !== -1) {
        updatedAmounts[specialAllowanceIndex] += remainingAmount;
      }
    }
    setDistributedAmounts(updatedAmounts);
  };

  const handleSave = async () => {
    if (!effectiveFromDate || !effectiveToDate || !category) {
      showToast('Please fill in all required fields.', 'warn');
      return;
    }
    if (!offerId) {
      showToast('Offer ID is missing. Please save the offer details first.', 'error');
      return;
    }
    const totalPercentage = percentages.reduce((acc, value) => acc + value, 0);
    if (Math.abs(totalPercentage - 100) > 0.10) {
      showToast('Total percentage must be 100%. Please adjust the percentages.', 'warn');
      return;
    }

    let hasError = false;
    attributes.forEach((attr, index) => {
      const attributePercentage = percentages[index];
      const attributeAmount = distributedAmounts[index];
      const userDefinedPercentage = (distributedAmounts[index] / amount) * 100;
      if (Math.abs(attributeAmount - (amount * userDefinedPercentage / 100)) > 0.01) {
        showToast(`${attr.label} has an incorrect distributed amount. Expected: ${(amount * userDefinedPercentage / 100).toFixed(2)}, but got: ${attributeAmount}`, 'error');
        hasError = true;
      }

    });

    if (hasError) return;
    const totalCTCAmount = parseFloat(distributedAmounts.reduce((acc, amount) => acc + amount, 0).toFixed(2));

    const staticData = [];
    const variableData = [];
    const basicSalaryAmount = distributedAmounts.find((amount, index) => attributes[index]?.label === 'Basic') || 0;

    attributes.forEach((attr, index) => {
      const data = {
        label: attr.label,
        amount: distributedAmounts[index],
      };

      if (attr.label === 'Basic') {
        // Make sure Basic Salary is treated as a variable component
        variableData.push(data);
      } else if (attr.type === 'Static') {
        staticData.push(data);
      } else if (attr.type === 'Variable') {
        variableData.push(data);
      }
    });

    const dataToSend = {

      effectiveFromDate,
      effectiveToDate,
      ctcAmount: totalCTCAmount,
      basicAmount: basicSalaryAmount,
      offerStaticCTCBreakdowns: staticData,
      offerVariableCTCBreakdowns: variableData,
    };

    try {
      const response = await axios.post(`http://${strings.localhost}/api/offerCTC/save/${companyId}/${offerId}`, dataToSend);
      console.log('datasend', dataToSend);
      showToast('CTC Distribution saved successfully', 'success');
      setShowConfirmation(true);
      setCompletedSteps((prev) => ({ ...prev, [currentStep]: true }));

      // setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error saving data:', error);
      showToast('Error while saving.', 'error');
    }
  };

  const handleSendOffer = async () => {
    if (!offerId) return;

    setIsSendingOffer(true);
    try {
      const response = await axios.put(`http://${strings.localhost}/api/offerGeneration/update-status/${offerId}`);
      if (response.data) {
        showToast("Offer sent successfully", "success");
        window.location.reload();
        setShowConfirmation(false); 
       onClose();

      }
    } catch (error) {
      showToast(error?.response?.data || "An error occurred while sending the offer.", "error");
    } finally {
      setIsSendingOffer(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
  
    if (name === 'CtcCategory') {
      setCategory(value);
    } else if (name === 'effectiveFromDate') {
      const selectedFromDate = new Date(value);
      selectedFromDate.setHours(0, 0, 0, 0);
  
      if (selectedFromDate < today) {
        showToast('From Date cannot be in the past', 'warn');
      } else {
        setEffectiveFromDate(value);
        // Also clear the ToDate if it's already invalid
        const toDate = new Date(effectiveToDate);
        if (effectiveToDate && (toDate < selectedFromDate || (toDate - selectedFromDate) < (30 * 24 * 60 * 60 * 1000))) {
          setEffectiveToDate('');
        }
      }
    } else if (name === 'effectiveToDate') {
      const fromDate = new Date(effectiveFromDate);
      const toDate = new Date(value);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
  
      if (!effectiveFromDate) {
        showToast('Please select a From Date first', 'warn');
      } else if (toDate < fromDate) {
        showToast('To Date must be after From Date', 'warn');
      } else if ((toDate - fromDate) < (30 * 24 * 60 * 60 * 1000)) {
        showToast('To Date must be at least one month after From Date', 'warn');
      } else {
        setEffectiveToDate(value);
      }
    }
  };
  

  return (
    <div className='coreContainer'>

      {currentStep === 2 &&
        <div className='data-container project-info1-box'>
          <h3>CTC Calculation</h3>
          <table className="ctc-details-table">
          </table>

          <div className='input-row' >
            <div>
              <span className="required-marker">*</span>
              <label>From Date</label>
              <input className='selectIM' type="date" name="effectiveFromDate" value={effectiveFromDate} onChange={handleChange}  min={new Date().toISOString().split("T")[0]}  required />
            </div>
            <div>
              <span className="required-marker">*</span>
              <label>To date</label>
              <input className='selectIM' type="date" name="effectiveToDate" value={effectiveToDate} onChange={handleChange}  min={effectiveFromDate}  required />
            </div>
            <div>
              <span className="required-marker">*</span>
              <label htmlFor="CtcCategory">Category</label>
              <select className='selectIM' id="CtcCategory" name="CtcCategory" value={category} onChange={handleChange} required>
                <option value="" disabled hidden>Select Category</option>
                {dropdownData.CtcCategory && dropdownData.CtcCategory.length > 0 ? (
                  dropdownData.CtcCategory.map(option => (
                    <option key={option.masterId} value={option.data}>{option.data}</option>
                  ))
                ) : (
                  <option value="" disabled>Category Not available</option>
                )}
              </select>
            </div>
            <div>
              <label>Enter Yearly Basic Amount: </label>
              <input type="text" value={amount} onChange={handleAmountChange} placeholder="Enter amount " />
              {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
            </div>
          </div>

          {attributes.length > 0 && (
            <div>
              <table className='Attendance-table'>
                <thead>
                  <tr>
                    <th>Attribute Name</th>
                    <th>Standard Percentage</th>
                    <th>Distributed Amount</th>
                    {/* <th>Percentage of Total Amount</th> */}
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((attr, index) => (
                    <tr key={attr.id}>
                      <td>{attr.label}</td>
                      {attr.percentValue <= 100 && !attr.isFlatAmount ? (
                        <td>{(attr.percentValue).toFixed(2)}%</td>
                      ) : (
                        <td>{(distributedAmounts[index] || 0).toFixed(2)} (Flat Amount)</td>
                      )}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={distributedAmounts[index] || ""}
                            onChange={(e) => handleEditChange(index, e.target.value)}
                          />
                        ) : (distributedAmounts[index] || 0).toFixed(2)}
                      </td>
                      {/* <td>
                      {(distributedAmounts[index] !== null && distributedAmounts[index] !== undefined && amount !== 0) ?
                        ((distributedAmounts[index] / amount) * 100).toFixed(2) + '%' : '0.00%'}
                    </td> */}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>Total CTC</strong></td>
                    <td><strong></strong></td>
                    <td><strong>{distributedAmounts.reduce((acc, amount) => acc + amount, 0).toFixed(2)}</strong></td>
                    {/* <td><strong>{((distributedAmounts.reduce((acc, amount) => acc + amount, 0) / amount) * 100).toFixed(2)}%</strong></td> */}
                  </tr>

                </tfoot>

              </table>
              <div className='form-controls'>
                <button type='button' className='btn' onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Lock Distribution' : 'Edit Distribution'}
                </button>

                <button className='btn' onClick={handleSave}>Save </button>
                <button type="button" className="outline-btn" onClick={onClose} >Close</button>
              </div>
            </div>
          )}

        </div>
      }
      {showConfirmation && (
        <div className="add-popup">
          <div>
            <p style={{ textAlign: 'center' }}>Do you want to send the offer to the employee?</p>
            <div className="btnContainer">
              {isSendingOffer && <div className="loading-spinner"></div>}
              <button className="btn" onClick={handleSendOffer} disabled={isSendingOffer}>
                {isSendingOffer ? 'Sending...' : 'Yes'}
              </button>
              <button className="outline-btn" onClick={() => setShowConfirmation(false)} disabled={isSendingOffer}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CTC;
