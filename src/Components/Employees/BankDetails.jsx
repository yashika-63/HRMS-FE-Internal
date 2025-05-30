
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../CommonCss/AddEmp.css'
import { strings } from '../../string';
import { fetchDataByKey } from '../../Api.jsx';
import { showToast } from '../../Api.jsx';
const BankDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the ID from URL params

  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    branch: '',
    accountHolderName: '',
    accountNumber: '',
    bankCode: '',
    branchCode: '',
    branchAdress: '',
    accountType: '',
    accountifscCode: '',
    linkedContactNo: '',
    linkedEmail: ''
  });

  const [errors, setErrors] = useState({
    contactNumber: '',
    email: '',
    accountNumber: '',
    bankName: '',
    branchl: '',
    accountHolderName: ''
  });
  const [emailError, setEmailError] = useState('');
  const [dropdownError, setDropdownError] = useState('');

  const [dropdownData, setDropdownData] = useState({
    AccountType: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update the bank details state
    setBankDetails(prevDetails => ({ ...prevDetails, [name]: value }));

    // Handle validation for bank name, branch, and account holder name
    if (name === 'bankName' || name === 'branch' || name === 'accountHolderName') {
      // Check if the input contains non-alphabetic characters
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: 'Only alphabetic characters are allowed.'
        }));
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: '' // Clear error if valid
        }));
      }
    }

    // Handle validation for contact number (both fields)
    if (name === 'contactNumber' || name === 'linkedContactNo') {
      const numericContact = value.replace(/\D/g, ''); // Remove non-numeric characters
      setBankDetails(prevDetails => ({ ...prevDetails, [name]: numericContact }));

      if (value.length > 0 && /[a-zA-Z]/.test(value)) {
        setErrors(prevErrors => ({
          ...prevErrors,
          contactNumber: 'Alphabets are not allowed in the contact number.'
        }));
      } else if (numericContact.length === 10 || numericContact === '') {
        setErrors(prevErrors => ({
          ...prevErrors,
          contactNumber: '' // Clear error if valid or empty
        }));
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          contactNumber: 'Contact number must be exactly 10 digits long.'
        }));
      }
    }

    // Handle validation for account number
    if (name === 'accountNumber') {
      setErrors(prevErrors => ({
        ...prevErrors,
        accountNumber: /^\d*$/.test(value) ? '' : 'Account number must be numeric.'
      }));
    }

    // Handle validation for email
    if (name === 'email' || name === 'linkedEmail') {
      if (value === '') {
        // Clear error if input is empty
        if (name === 'email') {
          setEmailError('');
        } else {
          setErrors(prevErrors => ({
            ...prevErrors,
            linkedEmail: ''
          }));
        }
      } else if (!validateEmail(value)) {
        // Set error if email is invalid
        if (name === 'email') {
          setEmailError('Please enter a valid email address');
        } else {
          setErrors(prevErrors => ({
            ...prevErrors,
            linkedEmail: 'Please enter a valid email address'
          }));
        }
      } else {
        // Clear error if email is valid
        if (name === 'email') {
          setEmailError('');
        } else {
          setErrors(prevErrors => ({
            ...prevErrors,
            linkedEmail: ''
          }));
        }
      }
    }

    // Handle validation for IFSC code
    if (name === 'accountifscCode') {
      const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/; // Standard IFSC format
      if (!ifscPattern.test(value)) {
        setErrors(prevErrors => ({
          ...prevErrors,
          accountifscCode: 'Invalid IFSC code format. Example: ABCD0123456'
        }));
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          accountifscCode: '' // Clear error if valid
        }));
      }
    }
  };



  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Updated regex for more flexibility
    return regex.test(email);
  };

  const validateForm = () => {
    return Object.values(errors).every(error => error === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please correct the errors before submitting.', 'warn');
      return;
    }

    // Wrap bankDetails in an array
    const dataToSend = [bankDetails];
    if (emailError) {
      showToast('Please correct the Email before submitting.', 'warn');
      return; // Exit if there are validation errors
    }
    try {
      const response = await axios.post(
        `http://${strings.localhost}/BankDetails/saveForEmployee?employeeId=${id}`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      showToast('Bank details saved successfully', 'success');
      setTimeout(() => {
        navigate(`/ListEmp`);
      }, 2000);

    } catch (error) {
      console.error('Error saving bank details:', error);
      showToast('Failed to save bank details', 'error');
    }
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const AccountType = await fetchDataByKey('AccountType');
        setDropdownData({
          AccountType: AccountType
        });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);

  const handleNext = () => {
    navigate(`/Assets/${id}`);
  };

  return (
    <form className="coreContainer" onSubmit={handleSubmit} autoComplete="off">
      <div className='box-container educational-info-box'>
        <h4 className='underlineText'>Bank  Details</h4>
        <div className='input-row'>
          <div>
            <span className="required-marker">*</span>
            <label>Bank Name</label>
            <input type="text" name="bankName" value={bankDetails.bankName} onChange={handleChange} required autoComplete="off" />
            {errors.bankName && <span style={{ color: 'red' }}>{errors.bankName}</span>}

          </div>
          <div>
            <span className="required-marker">*</span>
            <label>Bank Branch</label>
            <input type="text" name="branch" value={bankDetails.branch} onChange={handleChange} required autoComplete="off" />
            {errors.branch && <span style={{ color: 'red' }}>{errors.branch}</span>}

          </div>
          <div>
            <span className="required-marker">*</span>
            <label>Account Holder Name</label>
            <input type="text" name="accountHolderName" value={bankDetails.accountHolderName} onChange={handleChange} required autoComplete="off" />
            {errors.accountHolderName && <span style={{ color: 'red' }}>{errors.accountHolderName}</span>}

          </div>
          <div>
            <span className="required-marker">*</span>
            <label>Account Number</label>
            <input type="text" name="accountNumber" value={bankDetails.accountNumber} onChange={handleChange} maxLength={20} required autoComplete="off" />
            {errors.accountNumber && <span style={{ color: 'red' }}>{errors.accountNumber}</span>}
          </div>
        </div>
        <div className='input-row'>
          <div>
            <span className="required-marker">*</span>
            <label>IFSC Code</label>
            <input
              type="text"
              name="accountifscCode"
              value={bankDetails.accountifscCode}
              onChange={handleChange}
              required
              autoComplete="off"
            />
            {errors.accountifscCode && <span style={{ color: 'red' }} >{errors.accountifscCode}</span>}
          </div>

          <div>
            <label>Branch Code</label>
            <input type="text" name="branchCode" value={bankDetails.branchCode} onChange={handleChange} autoComplete="off" />
          </div>
          <div>
            <label>Bank Address</label>
            <input type="text" name="branchAdress" value={bankDetails.branchAdress} onChange={handleChange} autoComplete="off" />
          </div>
          <div >
            <span className="required-marker">*</span>
            <label htmlFor="AccountType"> Account Type</label>
            <select className='selectIM' id="accountType" name="accountType" value={bankDetails.accountType} onChange={handleChange} autoComplete="off" required>
              <option value="" disabled hidden></option>
              {dropdownData.AccountType && dropdownData.AccountType.length > 0 ? (
                dropdownData.AccountType.map(option => (
                  <option key={option.masterId} value={option.data}>
                    {option.data}
                  </option>
                ))
              ) : (
                <option value="" disabled>Industries Not available</option>
              )}
            </select>
          </div>
        </div>
        <div className='input-row'>
          <div>
            <span className="required-marker">*</span>
            <label>Linked Contact Number</label>
            <input type="text" name="linkedContactNo" value={bankDetails.linkedContactNo} onChange={handleChange} maxLength={10} autoComplete="new-password" required />
            {errors.contactNumber && <span style={{ color: 'red' }}>{errors.contactNumber}</span>}
          </div>
          <div>
            <span className="required-marker">*</span>
            <label>Linked Email</label>
            <input type="text" name="linkedEmail" value={bankDetails.linkedEmail} onChange={handleChange} autoComplete="new-password" required />
            {errors.linkedEmail && <span style={{ color: 'red' }}>{errors.linkedEmail}</span>}
            {emailError && <span style={{ color: 'red' }}>{emailError}</span>}
          </div>
        </div>
        <div className='btnContainer'>
          <button type="button" className='outline-btn' onClick={() => navigate(`/EmployeeHistory/${id}`)}>
            Previous
          </button>
          <button className='btn' >Submit</button>
          <button type="button" className='outline-btn' onClick={handleNext}> Next   </button>

        </div>
      </div>

    </form>
  );
};

export default BankDetails;
