import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { strings } from '../../string';
const SavedAsset = () => {
  const { id } = useParams(); // Get the employee ID from the URL parameters
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
    sapUserName: '',
    signatureOfEmployee: '',
    signatureOfItDepartmant: '',
    signatureOfHrDepartmant: '',
    assetDate: ''
  });

  // Function to handle changes in form input fields
  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //   });
  // };
  const fetchitassetDetails = async () => {
    try {
      const response = await axios.get(`http://${strings.localhost}/Asset/GetAllItAssetDataByEmployeeID/${id}`);
      const itassetData = response.data;

      // console.log('Response data:', itassetData);

      if (itassetData.content && itassetData.content.length > 0) {
        const firstAsset = itassetData.content[0]; // Get the first asset from the content array

        // Update the form data with the employee's details
        setFormData({
          ...formData,
          deviceSN: firstAsset.deviceSN,
          assetNo: firstAsset.assetNo,
          model: firstAsset.model,
          acAdapterSN: firstAsset.acAdapterSN,
          useMouse: firstAsset.useMouse,
          laptopUser: firstAsset.laptopUser,
          userPassword: firstAsset.userPassword,
          internetAcssesLink: firstAsset.internetAcssesLink,
          internetUser: firstAsset.internetUser,
          internetPassword: firstAsset.internetPassword,
          vpnUser: firstAsset.vpnUser,
          vpnPassword: firstAsset.vpnPassword,
          userEmail: firstAsset.userEmail,
          userContact: firstAsset.userContact,
          emailPassword: firstAsset.emailPassword,
          sapUserName: firstAsset.sapUserName,
          signatureOfEmployee: firstAsset.signatureOfEmployee,
          signatureOfItDepartmant: firstAsset.signatureOfItDepartmant,
          signatureOfHrDepartmant: firstAsset.signatureOfHrDepartmant,
          assetDate: firstAsset.assetDate
        });
      } else {
        // console.log('No assets found for this employee');
        // Handle case when no assets are found
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      // console.log(formData);
    }
  };

  useEffect(() => {
    fetchitassetDetails();
  }, [id]);


  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await Axios.get(`http://52.66.137.154:5557/GetAllUndertakingDataByEmployeeID/${id}`);
  //       setFormData(response.data); // Assuming response.data contains form data
  //     } catch (error) {
  //       console.error('Error fetching form data:', error);
  //     }
  //   };
  //   fetchData();
  // }, [id]);
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
  return (
    // onSubmit={SavedAsset}
    <div   className="container-asset" >
      <div className="headline">
        <img src="/logo.png" alt="Spectrum Logo" width={130} height={60} />
        <div>
          <h2>SPECTRUM ELECTRICAL INDUSTRIES LIMITED</h2>
          <p>Registered & Corporate Office: Plot No. V – 195, MIDC Area, Jalgaon – 425003, Maharashtra, India, Telephone: 0257-2210192<br />
            CIN: U28100MH2008PLC185764, GSTIN: 27AAUCS2512E1Z7</p>
        </div>
      </div>
      <h2 className="title">DECLARATION CUM UNDERTAKING For Issue of IT Asset</h2>
      <form className="form-asset">
        <div className="user-info">
          <label>
            User Name, working at Plant No. Plant No, as a Designation has been issued Company’s Laptop, along with necessary accessories, with the following specification, details:</label>
        </div>
        <table className="info-table">
          <tbody>
            <tr>
              <td>Device S/N:</td>
              <td><input name="deviceSN" id='deviceSN' type="text" value={formData.deviceSN} readOnly /></td>
              <td>Asset No.</td>
              <td><input name="assetNo" id='assetNo' type="text" value={formData.assetNo} readOnly /></td>
              <td>Model</td>
              <td><input name="model" id='model' type="text" value={formData.model} readOnly /></td>
            </tr>
            <tr>
              {/* <td>Other Asset</td> */}
              <td>AC Adapter S/N:</td>
              <td><input name="acAdapterSN" id='acAdapterSN' type="text" value={formData.acAdapterSN} readOnly /></td>
              <td>USB Mouse:</td>
              <td><input name="useMouse" id='useMouse' type="text" value={formData.useMouse} readOnly /></td>
              <td>Laptop User</td>
              <td><input name="laptopUser" id='laptopUser' type="text" value={formData.laptopUser} readOnly /></td>
            </tr>
            <tr>

              <td>User Password</td>
              <td><input name="userPassword" id='userPassword' type="text" value={formData.userPassword} readOnly /></td>
              <td>Internet Access Link</td>
              <td><input name="internetAcssesLink" id='internetAcssesLink' type="text" value={formData.internetAcssesLink} readOnly /></td>
              <td>Internet User</td>
              <td><input name="internetUser" type="text" value={formData.internetUser} readOnly /></td>
            </tr>
            <tr>
              <td>Internet Password</td>
              <td><input name="internetPassword" type="text" value={formData.internetPassword} readOnly /></td>
              <td>VPN User</td>
              <td><input name="vpnUser" type="text" value={formData.vpnUser} readOnly /></td>
              <td>VPN Password:</td>
              <td><input name="vpnPassword" type="text" value={formData.vpnPassword} readOnly /></td>
            </tr>
            <tr>
              <td>User's Contact</td>
              <td><input name="userContact" type="text" value={formData.userContact} readOnly /></td>
              <td>Email Password</td>
              <td><input name="emailPassword" type="text" value={formData.emailPassword} readOnly /></td>

              <td>Email Address</td>
              <td><input name="userEmail" type="text" value={formData.userEmail} readOnly /></td>
            </tr>
            <tr>

              <td>SAP User</td>
              <td><input name="sapUserName" type="text" value={formData.sapUserName} readOnly /></td>
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
            <td><input name="signatureOfEmployee" type="text" value={formData.signatureOfEmployee} readOnly /></td>
            <div>Signature Of Employee</div>
           </div>
            <div>
            <td><input name="assetDate"  type="text" value={formData.assetDate} readOnly /></td>
            <div>Date</div>
          </div>
          <div>
            <td><input name="signatureOfItDepartmant" type="text" value={formData.signatureOfItDepartmant} readOnly /></td>
            <div>IT Department</div>
          </div>
          <div>
            <td><input name="signatureOfHrDepartmant" type="text" value={formData.signatureOfHrDepartmant} readOnly /></td>
            <div>HR Department</div>
          </div>

        </div>
        <div>
           {/* <button className='btn1' style={{ marginLeft: "700px", marginTop: "100px" }}>Send</button> */}
          {/* <button className='btn1' type="submit" onClick={saveAsset}>Save</button>  */}
        </div>

      </form>
    </div>


  );
};

export default SavedAsset;


