<<<<<<< HEAD

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../string.jsx';
import { fetchDataByKey , showToast } from '../../Api.jsx';
=======
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { strings } from '../../string.jsx';
import { fetchDataByKey, showToast } from '../../Api.jsx';
>>>>>>> 8a5f66f (merging code)
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';

const CtcGenration = () => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [distributedAmounts, setDistributedAmounts] = useState([]);
  const [percentages, setPercentages] = useState([]);
  const [error, setError] = useState('');
  const [effectiveFromDate, setEffectiveFromDate] = useState('');
  const [effectiveToDate, setEffectiveToDate] = useState('');
<<<<<<< HEAD
  const navigate = useNavigate();
  const [dropdownData, setDropdownData] = useState({
    CtcCategory: [],
=======
  const [customAttributes, setCustomAttributes] = useState([]);
  const [showNewRow, setShowNewRow] = useState(false);
  const [newCustomAttr, setNewCustomAttr] = useState({
    label: '',
    percentage: '',
    amount: '',
  });

  const navigate = useNavigate();
  const [dropdownData, setDropdownData] = useState({
    CtcCategory: [],
    customeAttribute: []
>>>>>>> 8a5f66f (merging code)
  });

  const companyId = localStorage.getItem('companyId');
  const { id: employeeId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    designation: '',
    department: '',
    employeeName: '',
  })

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

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const CtcCategory = await fetchDataByKey('CtcCategory');
<<<<<<< HEAD
        setDropdownData({
          CtcCategory: CtcCategory,
=======
        const customeAttribute = await fetchDataByKey("customeattribute");
        console.log("Fetched CtcCategory:", CtcCategory);
        console.log("Fetched Custom Attributes:", customeAttribute);
        setDropdownData({
          CtcCategory: CtcCategory,
          customeAttribute: customeAttribute
>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
=======

>>>>>>> 8a5f66f (merging code)
    }
  }, [amount, category]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${employeeId}`);
      const employee = response.data;
      setFormData(prevFormData => ({
        ...prevFormData,
        name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
        id: employee.id,
        department: employee.department,
        designation: employee.designation,
        employeeName: employee.name,
        employeeId: employee.employeeId
      }));
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };
  useEffect(() => {
    fetchEmployeeDetails();
  }, [employeeId]);

<<<<<<< HEAD


=======
>>>>>>> 8a5f66f (merging code)
  const fetchAttributes = async (CtcCategory) => {
    const companyId = localStorage.getItem('companyId');
    if (!companyId) {
      console.error('Company ID is missing');
      return;
    }
<<<<<<< HEAD

=======
>>>>>>> 8a5f66f (merging code)
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

        // Set attributes
        setAttributes(uniqueAttributes);

        // Step 1: Identify flat amounts (percentValue >= 100) and keep them as is
        const flatAmounts = uniqueAttributes.filter(attr => attr.percentValue > 100);
        console.log('Flat Amounts (percentValue > 100):', flatAmounts);

        // Sum of all flat amounts (treated as fixed)
        const sumOfFlatAmounts = flatAmounts.reduce((acc, attr) => acc + (attr.percentValue || 0), 0);
        console.log('Sum of Flat Amounts:', sumOfFlatAmounts);

        // Step 2: The remaining amount will be the same as the entered amount
        const remainingAmount = amount;

        if (remainingAmount < 0) {
          console.log('Remaining amount is negative. Resetting values.');
          setError("Remaining amount cannot be negative.");
          setAmount(null);
          setDistributedAmounts([]);
          return;
        }

        // Step 3: Distribute remaining amount based on Basic Salary percentage
        const basicSalary = uniqueAttributes.find(attr => attr.label === 'Basic');
        if (!basicSalary) {
          console.error('Basic salary not found in the attributes');
          return;
        }

        const basicSalaryPercentage = basicSalary.percentValue || 0;
        const basicSalaryAmount = (remainingAmount * basicSalaryPercentage / 100);
        console.log('Basic Salary Amount:', basicSalaryAmount);

        // Step 4: Distribute the remaining amount to other attributes based on their percentage relative to Basic Salary
        const recalculatedAmounts = uniqueAttributes.map((attr) => {
          if (attr.percentValue > 100) {
            // For flat amounts, return their original value (no distribution)
            console.log(`Flat Amount for ${attr.label}:`, attr.percentValue);
            return attr.percentValue;
          } else if (attr.label === 'Basic') {
            // For Basic Salary, return the calculated amount directly
            console.log(`Basic Salary for ${attr.label}:`, basicSalaryAmount);
            return basicSalaryAmount;
          } else {
            // For other components, distribute based on Basic Salary Percentage
            const percentage = attr.percentValue || 0;
            const calculatedAmount = (basicSalaryAmount * (percentage / 100));

            // Log the calculation for this attribute
            console.log(`Calculated Amount for ${attr.label} (Percentage: ${percentage}% of Basic Salary):`, calculatedAmount);

            return isNaN(calculatedAmount) ? 0 : calculatedAmount;
          }
        });

        // Step 5: Log the recalculated amounts
        console.log('Recalculated Amounts (Flat amounts fixed, remaining distributed by percentage):', recalculatedAmounts);

        // Step 6: Log the sum of recalculated amounts to ensure it's distributed correctly
        const totalDistributedAmount = recalculatedAmounts.reduce((acc, value) => acc + value, 0);
        console.log('Total Distributed Amount (Flat + Percentage Calculated):', totalDistributedAmount);

        // Set the updated distributed amounts
        setDistributedAmounts(recalculatedAmounts);

        // Step 7: Recalculate percentages based on the new amounts
        const calculatedPercentages = uniqueAttributes.map((attr, index) => {
          return (attr.percentValue !== null && attr.percentValue !== undefined)
            ? attr.percentValue
            : (percentages[index] || defaultPercentages[attr.label] || 0);
        });

        // Round percentages to 3 decimal places
        const roundedPercentages = calculatedPercentages.map(percentage => parseFloat(percentage.toFixed(3)));
<<<<<<< HEAD

=======
>>>>>>> 8a5f66f (merging code)
        // Ensure total percentage sums to 100
        const totalPercentage = roundedPercentages.reduce((acc, value) => acc + value, 0);
        const difference = 100 - totalPercentage;
        if (difference !== 0) {
          roundedPercentages[roundedPercentages.length - 1] += difference;
        }
<<<<<<< HEAD

=======
>>>>>>> 8a5f66f (merging code)
        // Set the final percentages
        setPercentages(roundedPercentages);
        console.log('Updated Percentages:', roundedPercentages);

      } else {
        console.error('No attributes found for the selected category');
      }
    } catch (error) {
      console.error('Error fetching attributes:', error);
    }
  };

<<<<<<< HEAD

=======
>>>>>>> 8a5f66f (merging code)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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

      // Step 1: Identify flat amounts (percentValue >= 100) and keep them as is
      const flatAmounts = attributes.filter(attr => attr.percentValue > 100);

      // Sum of all flat amounts (treated as fixed)
      const sumOfFlatAmounts = flatAmounts.reduce((acc, attr) => acc + (attr.percentValue || 0), 0);

      // Step 2: The remaining amount will be the same as the entered amount
      const remainingAmount = newAmount;

      if (remainingAmount < 0) {
        setError("Amount is not sufficient to distribute.");
        setAmount(null);
        setDistributedAmounts([]);
        return;
      }
<<<<<<< HEAD

=======
>>>>>>> 8a5f66f (merging code)
      // Step 3: Assign Basic Salary value based on its percentage, directly use newAmount for Basic Salary
      const basicSalaryIndex = attributes.findIndex(attr => attr.label === 'Basic');
      const basicSalaryPercentage = basicSalaryIndex !== -1 ? percentages[basicSalaryIndex] : 0;
      const basicSalaryAmount = (newAmount * basicSalaryPercentage / 100);

      // Step 4: Distribute remaining amount based on Basic Salary Percentage
      const recalculatedAmounts = attributes.map((attr, index) => {
        if (attr.percentValue > 100) {
          // For flat amounts, return their original value (no distribution)
          console.log(`Flat Amount for ${attr.label}:`, attr.percentValue);
          return attr.percentValue;
        } else if (attr.label === 'Basic') {
          // For Basic Salary, set the value directly from basicSalaryAmount
          console.log(`Basic Salary for ${attr.label}:`, basicSalaryAmount);
          return basicSalaryAmount;
        } else {
          // For other attributes, distribute based on Basic Salary Amount and the associated percentage
          const percentage = (attr.percentValue !== null && attr.percentValue !== undefined)
            ? attr.percentValue
            : (percentages[index] || defaultPercentages[attr.label] || 0);

          // Calculate the amount relative to the Basic Salary amount (percentage of Basic Salary)
          const calculatedAmount = (basicSalaryAmount * (percentage / 100));

          console.log(`Calculated Amount for ${attr.label} based on Basic Salary (Percentage: ${percentage}%):`, calculatedAmount);
          return isNaN(calculatedAmount) ? 0 : calculatedAmount;
        }
      });

      // Step 5: Set the updated distributed amounts
      setDistributedAmounts(recalculatedAmounts);

    }
  }

<<<<<<< HEAD






=======
>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
        updatedAmounts[specialAllowanceIndex] += remainingAmount; // Add remaining to special allowance
      }
    }

    // Update the distributed amounts state
    setDistributedAmounts(updatedAmounts);
  };



=======
        updatedAmounts[specialAllowanceIndex] += remainingAmount;
      }
    }
    setDistributedAmounts(updatedAmounts);
  };
  const handleCustomAttributeChange = (index, newValue) => {
    if (newValue === '') {
      const updated = [...customAttributes];
      updated[index].amount = '';
      setCustomAttributes(updated);
      return;
    }

    const numberPattern = /^\d*\.?\d{0,2}$/;
    if (numberPattern.test(newValue)) {
      const updated = [...customAttributes];
      updated[index].amount = newValue;
      setCustomAttributes(updated);
    }
  };
>>>>>>> 8a5f66f (merging code)


  const handleSave = async () => {
    if (!effectiveFromDate || !effectiveToDate || !category) {
<<<<<<< HEAD
      showToast('Please fill in all required fields.' ,'warn');
      return;
    }
  
    // const basicSalaryIndex = attributes.findIndex(attr => attr.label === 'Basic');
    // if (basicSalaryIndex !== -1) {
    //   const basicSalaryPercentage = percentages[basicSalaryIndex];
    //   if (basicSalaryPercentage < 40 || basicSalaryPercentage > 50) {
    //     toast.error('Basic Salary percentage must be between 40% and 50%.');
    //     return;
    //   }
    // }
  
    // Ensure total percentage is 100%
    const totalPercentage = percentages.reduce((acc, value) => acc + value, 0);
    if (Math.abs(totalPercentage - 100) > 0.10) {
      showToast('Total percentage must be 100%. Please adjust the percentages.' , 'warn');
      return;
    }
  
=======
      showToast('Please fill in all required fields.', 'warn');
      return;
    }
    const totalPercentage = percentages.reduce((acc, value) => acc + value, 0);
    if (Math.abs(totalPercentage - 100) > 0.10) {
      showToast('Total percentage must be 100%. Please adjust the percentages.', 'warn');
      return;
    }

>>>>>>> 8a5f66f (merging code)
    let hasError = false;
    attributes.forEach((attr, index) => {
      const attributePercentage = percentages[index];
      const attributeAmount = distributedAmounts[index];
<<<<<<< HEAD
  
      // Check if attribute percentage is within the valid range
      // if (attr.label === 'Basic' && (attributePercentage < 40 || attributePercentage > 50)) {
      //   toast.error('Basic Salary percentage must be between 40% and 50%.');
      //   hasError = true;
      // }
      const userDefinedPercentage = (distributedAmounts[index] / amount) * 100;
      if (Math.abs(attributeAmount - (amount * userDefinedPercentage / 100)) > 0.01) {
        showToast(`${attr.label} has an incorrect distributed amount. Expected: ${(amount * userDefinedPercentage / 100).toFixed(2)}, but got: ${attributeAmount}` , 'error');
        hasError = true;
      }
  
    });
  
    if (hasError) return;
    const totalCTCAmount = parseFloat(distributedAmounts.reduce((acc, amount) => acc + amount, 0).toFixed(2));

    const staticData = [];
    const variableData = [];
=======
      const userDefinedPercentage = (distributedAmounts[index] / amount) * 100;
      if (Math.abs(attributeAmount - (amount * userDefinedPercentage / 100)) > 0.01) {
        showToast(`${attr.label} has an incorrect distributed amount. Expected: ${(amount * userDefinedPercentage / 100).toFixed(2)}, but got: ${attributeAmount}`, 'error');
        hasError = true;
      }

    });

    if (hasError) return;
    const totalCTCAmount = parseFloat([...distributedAmounts, ...customAttributes.map(a => parseFloat(a.amount))].reduce((acc, amount) => acc + amount, 0).toFixed(2));
    const staticData = [];
    const variableData = [];
    const annualdata = [];
>>>>>>> 8a5f66f (merging code)
    const basicSalaryAmount = distributedAmounts.find((amount, index) => attributes[index]?.label === 'Basic') || 0;

    attributes.forEach((attr, index) => {
      const data = {
        label: attr.label,
        amount: distributedAmounts[index],
      };
<<<<<<< HEAD
  
      if (attr.label === 'Basic') {
        // Make sure Basic Salary is treated as a variable component
=======

      if (attr.label === 'Basic') {
>>>>>>> 8a5f66f (merging code)
        variableData.push(data);
      } else if (attr.type === 'Static') {
        staticData.push(data);
      } else if (attr.type === 'Variable') {
        variableData.push(data);
<<<<<<< HEAD
      }
    });
  
=======
      } else if (attr.type === 'Annual') {
        annualdata.push(data);
      }
    });
    customAttributes.forEach(attr => {
      const matched = dropdownData.customeAttribute.find(opt => opt.data === attr.label);
      const type = (matched?.category || '').toLowerCase();

      const data = {
        label: attr.label,
        amount: parseFloat(attr.amount),
      };

      if (attr.label === 'Basic') {
        variableData.push(data);
      } else if (type === 'static') {
        staticData.push(data);
      } else if (type === 'variable') {
        variableData.push(data);
      } else if (type === 'annual') {
        annualdata.push(data);
      } else {
        console.warn(`-> Unknown category for custom attribute "${attr.label}"`);
      }
    });


    customAttributes.forEach(attr => {
      if (!attr.label || !attr.amount) {
        showToast(`Custom attribute ${attr.label || 'Unnamed'} is invalid.`, 'error');
        hasError = true;
      }
    });

>>>>>>> 8a5f66f (merging code)
    const dataToSend = {
      header: {
        effectiveFromDate,
        effectiveToDate,
        ctcAmount: totalCTCAmount,
<<<<<<< HEAD
        basicAmount:basicSalaryAmount,
      },
      staticBreakdowns: staticData,
      variableBreakdowns: variableData,
    };
  
    try {
      const response = await axios.post(`http://${strings.localhost}/api/ctcmain/header/save/${employeeId}/${companyId}`, dataToSend);
      console.log('datasend', dataToSend);
      showToast('CTC Distribution saved successfully' , 'success');
=======
        basicAmount: basicSalaryAmount,
      },
      staticBreakdowns: staticData,
      variableBreakdowns: variableData,
      annualBreakdowns: annualdata,
    };

    try {
      const response = await axios.post(`http://${strings.localhost}/api/ctcmain/header/save/${employeeId}/${companyId}`, dataToSend);
      console.log('datasend', dataToSend);
      showToast('CTC Distribution saved successfully', 'success');
>>>>>>> 8a5f66f (merging code)
    } catch (error) {
      console.error('Error saving data:', error);
      showToast('Error while saving.', 'error');
    }
  };
<<<<<<< HEAD
  

=======
>>>>>>> 8a5f66f (merging code)

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'CtcCategory') {
      setCategory(value);
    } else if (name === 'effectiveFromDate') {
      setEffectiveFromDate(value);
    } else if (name === 'effectiveToDate') {
      const fromDate = new Date(effectiveFromDate);
      const toDate = new Date(value);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      if (toDate < fromDate) {
        showToast('To Date must be after From Date', 'warn');
      } else if ((toDate - fromDate) < (30 * 24 * 60 * 60 * 1000)) {
<<<<<<< HEAD
        showToast('To Date must be at least one month after From Date' , 'warn');
      } else {
        setEffectiveToDate(value); 
=======
        showToast('To Date must be at least one month after From Date', 'warn');
      } else {
        setEffectiveToDate(value);
>>>>>>> 8a5f66f (merging code)
      }
    }
  };

  const handleBack = () => {
    navigate(`/EnrollmentDashboard`);
  };
  return (
    <div className='coreContainer'>
<<<<<<< HEAD
      
=======
>>>>>>> 8a5f66f (merging code)
      <div className='data-container project-info1-box'>
        <h3>CTC Calculation</h3>
        <table className="ctc-details-table">
          <tbody>
            <tr>
              <td>Employee Name</td>
              <td>{formData.name}</td>
            </tr>
            <tr>
              <td>Department</td>
              <td>{formData.department}</td>
            </tr>
            <tr>
              <td>Designation</td>
              <td>{formData.designation}</td>
            </tr>
          </tbody>
        </table>
        <div className='input-row' >
          <div>
            <span className="required-marker">*</span>
            <label>From Date</label>
            <input className='selectIM' type="date" name="effectiveFromDate" value={effectiveFromDate} onChange={handleChange} required />
          </div>
          <div>
            <span className="required-marker">*</span>
            <label>To date</label>
            <input className='selectIM' type="date" name="effectiveToDate" value={effectiveToDate} onChange={handleChange} required />
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
<<<<<<< HEAD
            <input  type="text" value={amount} onChange={handleAmountChange} placeholder="Enter amount " />
            {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
          </div>
        </div>

=======
            <input type="text" value={amount} onChange={handleAmountChange} placeholder="Enter amount " />
            {error && <p className='no-data'>{error}</p>}
          </div>
        </div>
>>>>>>> 8a5f66f (merging code)
        {attributes.length > 0 && (
          <div>
            <table className='Attendance-table'>
              <thead>
                <tr>
                  <th>Attribute Name</th>
                  <th>Standard Percentage</th>
                  <th>Distributed Amount</th>
<<<<<<< HEAD
                  {/* <th>Percentage of Total Amount</th> */}
=======
>>>>>>> 8a5f66f (merging code)
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
<<<<<<< HEAD
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
=======
                        <input type='text'
                          value={distributedAmounts[index] || ""}
                          onChange={(e) => handleEditChange(index, e.target.value)}
                        />
                      ) : (
                        <span>{(distributedAmounts[index] || 0).toFixed(2)}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {customAttributes.map((attr, idx) => (
                  <tr key={`custom-${idx}`}>
                    <td>{attr.label}</td>
                    <td>{attr.percentage ? `${attr.percentage}% of Basic` : 'Manual Entry'}</td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={attr.amount || ''}
                          onChange={(e) => handleCustomAttributeChange(idx, e.target.value)}
                          inputMode="decimal"
                          placeholder="Amount"
                        />
                      ) : (
                        <span>{parseFloat(attr.amount || 0).toFixed(2)}</span>
                      )}
                      <button
                        type="button"
                        className="remove-question-btn"
                        onClick={() => {
                          const updated = customAttributes.filter((_, i) => i !== idx);
                          setCustomAttributes(updated);
                        }}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}

              </tbody>

>>>>>>> 8a5f66f (merging code)
              <tfoot>
                <tr>
                  <td><strong>Total CTC</strong></td>
                  <td><strong></strong></td>
<<<<<<< HEAD
                  <td><strong>{distributedAmounts.reduce((acc, amount) => acc + amount, 0).toFixed(2)}</strong></td>
                  {/* <td><strong>{((distributedAmounts.reduce((acc, amount) => acc + amount, 0) / amount) * 100).toFixed(2)}%</strong></td> */}
                </tr>
                {/* <tr>
                  <td><strong>Remaining Amount</strong></td>
                  <td colSpan="3" style={{ textAlign: 'right', color: 'red' }}>
                    <strong>
                      {(amount - distributedAmounts.reduce((acc, amount) => acc + amount, 0).toFixed(2))}
                    </strong>
                  </td>
                </tr> */}
              </tfoot>
=======
                  <td>
                    <strong>
                      {(
                        distributedAmounts.reduce((acc, amount) => acc + amount, 0) +
                        customAttributes.reduce((acc, attr) => acc + parseFloat(attr.amount || 0), 0)
                      ).toFixed(2)}
                    </strong>
                  </td>
                </tr>

              </tfoot>
              <tr>
                <td colSpan="3">
                  <button className="btn" onClick={() => setShowNewRow(true)}>+ Add Custom Attribute</button>
                </td>
              </tr>
              {showNewRow && (
                <>
                  <tr>
                    <td>
                      <select
                        value={newCustomAttr.label}
                        onChange={(e) =>
                          setNewCustomAttr({ ...newCustomAttr, label: e.target.value })
                        }
                      >
                        <option value="">Select Attribute</option>
                        {dropdownData.customeAttribute?.map((option) => (
                          <option key={option.masterId} value={option.data}>
                            {option.data}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="% of Basic"
                        value={newCustomAttr.percentage}
                        onChange={(e) => {
                          const perc = e.target.value;
                          const basicAmount =
                            distributedAmounts.find(
                              (amount, index) => attributes[index]?.label === "Basic"
                            ) || 0;
                          const calculatedAmount = ((basicAmount * perc) / 100).toFixed(2);
                          setNewCustomAttr({
                            ...newCustomAttr,
                            percentage: perc,
                            amount: calculatedAmount,
                          });
                        }}
                       
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newCustomAttr.amount}
                        onChange={(e) =>
                          setNewCustomAttr({
                            ...newCustomAttr,
                            amount: e.target.value,
                          })
                        }
                      
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3">
                      <button
                        className="btn"
                        onClick={() => {
                          if (!newCustomAttr.label || !newCustomAttr.amount) {
                            showToast("Please provide label and amount", "warn");
                            return;
                          }
                          setCustomAttributes([...customAttributes, newCustomAttr]);
                          setShowNewRow(false);
                          setNewCustomAttr({ label: "", percentage: "", amount: "" });
                        }}
                      >
                        ✔
                      </button>
                    </td>
                  </tr>
                </>
              )}
>>>>>>> 8a5f66f (merging code)

            </table>
            <div className='form-controls'>
              <button type='button' className='btn' onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Lock Distribution' : 'Edit Distribution'}
              </button>
<<<<<<< HEAD

=======
>>>>>>> 8a5f66f (merging code)
              <button className='btn' onClick={handleSave}>Save</button>
              <button type="button" className="outline-btn" onClick={handleBack} >Back</button>
            </div>
          </div>
        )}
<<<<<<< HEAD
      
=======

>>>>>>> 8a5f66f (merging code)
      </div>
    </div>
  );
};
<<<<<<< HEAD

=======
>>>>>>> 8a5f66f (merging code)
export default CtcGenration;
