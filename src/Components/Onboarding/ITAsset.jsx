import React, { useState, useEffect } from 'react';
import '../CommonCss/ITAsset.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { strings } from '../../string';
function AssetDeclaration() {
  const [formData, setFormData] = useState({

    deviceSN: '',
    assetNo: '',
    model: '',
    acAdapterSN: '',
    useMouse: '',
    laptopUser: '',
    userPassword: '',
    internetAcssesLink: '',
    internetUser: '',
    internetPassword: '',
    vpnUser: '',
    vpnPassword: '',
    userEmail: '',
    userContact: '',
    emailPassword: '',
    signatureOfEmployee: '',
    sapUserName: '',
    signatureOfItDepartmant: '',
    signatureOfHrDepartmant: '',
    assetDate: '',

  });
  // const[id]=useState();
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await axios.post(`http://52.66.137.154:5557/ItAssetSaveForEmployee?employeeId=${id}`, formData);
  //     console.log('Response:', response.data);
  //     alert('Data saved successfully!');
  //   } catch (error) {
  //     console.error('Error saving data:', error);
  //     alert('Error occurred while saving data.');
  //   }
  // };
  const { id } = useParams();

  //   const saveAsset = async () => {
  //     try {
  //         // Make POST request to save the undertaking data
  //         await axios.post(`http://52.66.137.154:5557/ItAssetSaveForEmployee?employeeId=${id}`, formData);
  //         alert('Asset saved successfully!');
  //     } catch (error) {
  //         console.error('Error saving Asset:', error);
  //         alert('Failed to save Asset. Please try again later.');
  //     }
  // };
  const handleSaveClick = async () => {
    // console.log(formData);
    try {
      // Send request to save data for the specified employee ID
      const response = await axios.post(`http://${strings.localhost}/Asset/ItAssetSaveForEmployee?employeeId=${id}`, formData);
      // console.log(response.data); // Handle response if needed
      alert('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePrint = () => {
    window.print();
  };
  return (

    <div className="container-asset">

      <div className="headline">
        <img src="/logo.png" alt="Spectrum Logo" width={130} height={60} />
        <div>
          <h2 className='forms-headline'>SPECTRUM ELECTRICAL INDUSTRIES LIMITED</h2>
          <p className='forms-headline2'>Registered & Corporate Office: GAT No. 139/1 & 139/2, Umale,Jalgaon – 425003, Maharashtra, India, Telephone: 0257-2210192<br />
            CIN: L28100MH2008PLC185764, GSTIN: 27AAUCS2512E1Z7</p>
        </div>
      </div>
      <h2 className="title">DECLARATION CUM UNDERTAKING FOR ISSUE OF IT ASSET</h2>
      <form className="form-asset">
        <div className="user-info">
          <label>
            User Name, working at Plant No. Plant No, as a Designation has been issued Company’s Laptop, along with necessary accessories, with the following specification, details:</label>
        </div>
        <table className="info-table">
          <tbody>
            <tr>
              <td>Device S/N:</td>
              <td> <input type="I-text" id="deviceSN" name="deviceSN" value={formData.deviceSN} onChange={handleInputChange} /> </td>

              <td>Asset No.</td>
              <td> <input type="I-text" id="assetNo" name="assetNo" value={formData.assetNo} onChange={handleInputChange} /> </td>
              <td>Model</td>
              <td> <input type="I-text" id="model" name="model" value={formData.model} onChange={handleInputChange} /> </td>
            </tr>
            <tr>
              <td>AC Adapter S/N:</td>
              <td> <input type="I-text" id="acAdapterSN" name="acAdapterSN" value={formData.acAdapterSN} onChange={handleInputChange} /> </td>
              <td>USB Mouse:</td>
              <td> <input type="I-text" id="useMouse" name="useMouse" value={formData.useMouse} onChange={handleInputChange} /> </td>
              <td>Laptop User</td>
              <td> <input type="I-text" id="laptopUser" name="laptopUser" value={formData.laptopUser} onChange={handleInputChange} /> </td>
            </tr>
            <tr>
              <td>User Password</td>
              <td> <input type="I-text" id="userPassword" name="userPassword" value={formData.userPassword} onChange={handleInputChange} /> </td>
              <td>Internet Access Link</td>
              <td> <input type="I-text" id="internetAcssesLink" name="internetAcssesLink" value={formData.internetAcssesLink} onChange={handleInputChange} /> </td>
              <td>Internet User</td>
              <td> <input type="I-text" id="internetUser" name="internetUser" value={formData.internetUser} onChange={handleInputChange} /> </td>
            </tr>
            <tr>
              <td>Internet Password</td>
              <td> <input type="I-text" id="internetPassword" name="internetPassword" value={formData.internetPassword} onChange={handleInputChange} /> </td>
              <td>VPN User</td>
              <td> <input type="I-text" id="vpnUser" name="vpnUser" value={formData.vpnUser} onChange={handleInputChange} /> </td>
              <td>VPN Password:</td>
              <td> <input type="I-text" id="vpnPassword" name="vpnPassword" value={formData.vpnPassword} onChange={handleInputChange} /> </td>
            </tr>
            <tr>
              <td>User's Contact</td>
              <td> <input type="I-text" id="userContact" name="userContact" value={formData.userContact} onChange={handleInputChange} /> </td>
              <td>Email Password</td>
              <td> <input type="I-text" id="emailPassword" name="emailPassword" value={formData.emailPassword} onChange={handleInputChange} /> </td>

              <td>Email Address</td>
              <td> <input type="I-text" id="userEmail" name="userEmail" value={formData.userEmail} onChange={handleInputChange} /> </td>
            </tr>
            <tr>

              <td>SAP User</td>
              <td> <input type="I-text" id="sapUserName" name="sapUserName" value={formData.sapUserName} onChange={handleInputChange} /> </td>
            </tr>
          </tbody>
        </table>
        <div> <p>The laptop has been issued to the said employee with the below mentioned understanding:</p> </div>
        <p>1) The laptop, email issued for the official purpose only . <br />

          2) The employee shall be fully accountable for theft, loss or damage of the property .<br />

          3) The laptop requisition form has to be signed before taking possession of the Laptop. <br />

          4) Employee can mention necessary specifications required for his job function before taking Laptop from the IT Department. <br />

          5) Any additional software or hardware required by the employee (before or after taking handover) should be clearly communicated through mail to the IT Department. <br />

          6) Management is at the sole discretion on approving such requests. <br />

          7) In case of any malfunction, employee is required to report the same to the IT department. <br />

          8) Employee shall not install any licensed software in Laptop without written approval of the IT department.  Piracy is strictly prohibited. <br />

          9) Employee shall not take the Laptop for repair to any external agency or vendor at any point of time. <br />

          10) The Laptop should be returned to the IT Department in case of leaving the organization or if they do not intend to use it for reason. <br />

          11) The employee shall be liable to replace or pay an equivalent amount to the organization in case of theft, loss or damage to the Laptop & its accessories. The organization retains the right to deduct the same from the salary in case of such an event. <br />

          12) User Name & Password is non-transferable and user is not allowed let other people use his/her account password at his/her account shall be kept confidential at any time. <br />

          13) In case user require additional authorization or access of related system, please put a request as per support procedure along with the necessary details. <br />

          14)User should be maintain his own stored official data at his own Device or path on regular basis.<br />
          <p>I,(name) have read and understood the terms and conditions laid by Spectrum Electrical Industries Limited and declare to abide by them. </p>
        </p>

        <div className='table-content'> Approval </div>
        <br />
        <div class="table-footer">
          <div>
            <td> <input type="I-text" id="signatureOfEmployee" name="signatureOfEmployee" value={formData.signatureOfEmployee} onChange={handleInputChange} /> </td>
            <div>Signature Of Employee</div>
            <br />

          </div>
          <div>
            <td> <input type="I-text" id="assetDate" name="assetDate" placeholder="YYYY-MM-DD" value={formData.assetDate} onChange={handleInputChange} /> </td>
            <div>Date</div>
          </div>
          <div>
            <td> <input type="I-text" id="signatureOfItDepartmant" name="signatureOfItDepartmant" value={formData.signatureOfItDepartmant} onChange={handleInputChange} /> </td>
            <div>IT Department</div>
          </div>
          <div>
            <td> <input type="I-text" id="signatureOfHrDepartmant" name="signatureOfHrDepartmant" value={formData.signatureOfHrDepartmant} onChange={handleInputChange} /> </td>
            <div>HR Department</div>
          </div>

        </div>
        <div className='btnContainer'>
          {/* <button className='btn1' style={{ marginLeft: "700px", marginTop: "150px" }} onClick={handlePrint}>Print</button>

          <button className='btn1'   onClick={handleSaveClick} style={{ marginRight: "600px" , marginTop: "-20px" }}>Save</button> */}
          <button className='btn' onClick={handlePrint} > Print</button>
          <button className='btn' onClick={handleSaveClick}  >Save</button>
          <Link to={`/SAPUndertaking/${id}`}>
            <button className='btn'>Next</button>
          </Link>
        </div>

      </form>
      {/* <div>
        <a href='/ITRecruitment'><button className='btn' style={{ marginTop: "5px" }}>Next</button></a>
      </div> */}
    </div>
  );
}

export default AssetDeclaration;
