import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import './ITAsset.css';
import { strings } from '../../string';
const ITRecruitment = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    section: '',
    designation: '',
    responsibilities: '',
    newJoining: false,
    transfer: false,

    pcRequirement: 'false',
    laptopRequirement: 'false',
    macRequirement: 'false',
    vpnRequirement: 'false',
    serverIdRequirement: 'false',
    emailIdRequirement: 'false',
    sapUserIdRequirement: 'false',
    hrSimCardRequirement: 'false',

    plantNo: '',
    remark: '',
  });

  //const [id, setId] = useState("");
  const { id, EmployeeId } = useParams(); // Get the employee ID from the URL parameters

  // Function to handle changes in form input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to handle changes in checkbox inputs
  // const handleCheckboxChange = (e) => {
  //   const { name, checked } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: checked,
  //   });
  // };

  // Function to handle changes in radio button inputs
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Update the formData directly with the radio button value
    }));
  };


  // useEffect(() => {
  //   const fetchedData = {  // Replace this with your actual fetched data
  //     pcRequirement: 'true',
  //     laptopRequirement: 'false',
  //     vpnRequirement: 'true',
  //     macRequirement: 'false',
  //     serverIdRequirement: 'true',
  //     emailIdRequirement: 'false',
  //     sapUserIdRequirement: 'true',
  //     hrSimCardRequirement: 'false',
  //     remarks: 'Some remarks'  // If you have remarks saved too
  //   };
  //   setFormData(fetchedData);
  // }, []);
  //   const fetchEmployeeDetails = async () => {
  //     try {
  //         const response = await Axios.get(`http://52.66.137.154:5557/employees/EmployeeById/${id}`);
  //         const employee = response.data; // Assuming the response is an object containing employee details
  //         // Update the form data with the employee's name
  //         setFormData({ ...formData, name: `${employee.firstName} ${employee.lastName} ${employee.middleName} `,
  //         contactNo: employee.contactNo,
  //         department: employee.department,
  //         designation: employee.designation,

  //        });
  //     } 
  //     catch (error) {
  //         console.error('Error fetching employee details:', error);
  //     }
  // };
  // useEffect(() => {
  //   fetchEmployeeDetails();
  // }, [id]); // Fetch employee details when the id parameter changes



  const fetchChecklistDetails = async () => {
    try {
      const response = await Axios.get(`http://${strings.localhost}/recruitment/GetAllItRecrutmentDataByEmployeeID/${id}`);
      const checklistData = response.data;

      // console.log('Response data:', checklistData);

      if (checklistData.content && checklistData.content.length > 0) {
        const firstAsset = checklistData.content[0]; // Get the first asset from the content array

        // Update the form data with the employee's details
        setFormData({
          name: firstAsset.name,
          mobileNumber: firstAsset.contactNo,
          section: firstAsset.department,
          designation: firstAsset.designation,
          responsibilities: firstAsset.role,
          pcRequirement: String(firstAsset.pcRequirement),
          laptopRequirement: String(firstAsset.laptopRequirement),
          macRequirement: String(firstAsset.macRequirement),
          vpnRequirement: String(firstAsset.vpnRequirement),
          serverIdRequirement: String(firstAsset.serverIdRequirement),
          emailIdRequirement: String(firstAsset.emailIdRequirement),
          sapUserIdRequirement: String(firstAsset.sapUserIdRequirement),
          hrSimCardRequirement: String(firstAsset.hrSimCardRequirement),
          plantNo: firstAsset.plantNo,
          remark: firstAsset.remark,
        });
      } else {
        // console.log('No assets found for this employee');
        // Handle case when no assets are found
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  useEffect(() => {
    fetchChecklistDetails();
  }, [id]);

  // const saveRecruitment = async () => {
  //   try {
  //       // Make POST request to save the undertaking data
  //       await Axios.post(`http://52.66.137.154:5557/RecrutmentSaveForEmployee?employeeId=${id}`, formData);
  //       alert('Recruitment Checklist saved successfully!');
  //   } catch (error) {
  //       console.error('Error saving undertaking:', error);
  //       alert('Failed to save Recruitment Cecklist. Please try again later.');
  //   }
  // };

  // Function to handle save button click
  // const handleSaveClick = async () => {
  //   try {
  //     // Send request to save data for the specified employee ID
  //     const response = await Axios.post(`http://52.66.137.154:5557/RecrutmentSaveForEmployee?employeeId=${id}`);
  //     console.log(response.data); // Handle response if needed
  //     alert('Data saved successfully!');
  //   } catch (error) {
  //     console.error('Error saving data:', error);
  //     alert('Failed to save data. Please try again.');
  //   }
  // };
  return (
    <div className="A4-page">
      <div className='table-container'>
        <div className='headline'>
          <img src="/logo.png" alt="Spectrum Logo" width={130} height={90} />


          <h2 className='table-header'>SPECTRUM ELECTRICAL INDUSTRIES LIMITED</h2>
        </div>
        <div className='content'>
          <p>Registered & Corporate Office: GAT No. 139/1 & 139/2 ,UMALE</p>
          <p>Jalgaon - 425003, Maharashtra, India, Telephone: 0257-2210192</p>
          <p>CIN: L28100MH2008PLC185764, GSTIN: 27AAUCS2152E1Z7</p>
        </div>


      </div>
      <h2 className="title">FORMAT FOR ISSUE OF FACILITY - EMAIL ID AND SAP USER ID</h2>



      <div className='table-container'>

        <div className='page'>
          <table className="employee-details">
            <thead>
              <tr>
                <th>Field</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Name Of Employee</td>
                <td><input type="I-text" value={formData.name} readOnly /></td>
              </tr>
              <tr>
                <td>Mobile Number</td>
                <td><input type="I-text" value={formData.contactNo} /></td>
              </tr>
              <tr>
                <td>Section / Department</td>
                <td><input type="I-text" value={formData.department} /></td>
              </tr>
              <tr>
                <td>Designation</td>
                <td><input type="I-text" value={formData.designation} /></td>
              </tr>
              <tr>
                <td>Roles & Responsibilities</td>
                <td><input type="I-text" value={formData.role} /></td>
              </tr>
              <tr>
                <td>Status Of Employee</td>
                <table>
                  <tr>
                    <td className='td1-fields'><label>New Joining: Yes/ No </label></td>
                    <td className='td-fields' > <label>Transfer: Yes/ No</label>
                    </td>

                    <td className='td2-fields' value={formData.remark}> <label>Remark</label></td>
                  </tr>
                </table>
              </tr>

              <tr>
                <td>Requirement</td>



                <table className='nested-table'>
                  <tr>
                    <td>PC:</td>

                    <td><label><input type="radio" id="pcRequirement" name="pcRequirement" value="true" checked={formData.pcRequirement === "true"} onChange={handleRadioChange} /> Yes</label></td>
                    <td><label><input type="radio" id="pcRequirement" name="pcRequirement" value="false" checked={formData.pcRequirement === "false"} onChange={handleRadioChange} /> No</label></td>
                    <td><input className='remark-fields' value={formData.remarks} onChange={handleInputChange} name="remarks" /></td>
                  </tr>
                  <tr>
                    <td>laptop:</td>
                    <td><label><input type="radio" id="laptopRequirement" name="laptopRequirement" value="true" checked={formData.laptopRequirement === "true"} onChange={handleRadioChange} /> Yes</label></td>
                    <td> <label><input type="radio" id="laptopRequirement" name="laptopRequirement" value="false" checked={formData.laptopRequirement === "false"} onChange={handleRadioChange} /> No</label></td>
                    <td><input className='remark-fields'></input></td>
                  </tr>
                  <tr>
                    <td>VPN:</td>
                    <td><label><input type="radio" id="vpnRequirement" name="vpnRequirement" value="true" checked={formData.vpnRequirement === "true"} onChange={handleRadioChange} /> Yes</label></td>
                    <td> <label><input type="radio" id="vpnRequirement" name="vpnRequirement" value="false" checked={formData.vpnRequirement === "false"} onChange={handleRadioChange} /> No</label></td>
                    <td><input className='remark-fields'></input></td>
                  </tr>
                  <tr>
                    <td>MAC (Host):</td>
                    <td><label><input type="radio" id="macRequirement" name="macRequirement" value="true" checked={formData.macRequirement === "true"} onChange={handleRadioChange} /> Yes</label></td>
                    <td> <label><input type="radio" id="macRequirement" name="macRequirement" value="false" checked={formData.macRequirement === "false"} onChange={handleRadioChange} /> No</label></td>
                    <td><input className='remark-fields'></input></td>
                  </tr>
                  <tr>
                    <td>Server Id:</td>
                    <td><label><input type="radio" id="serverIdRequirement" name="serverIdRequirement" value="true" checked={formData.serverIdRequirement === "true"} onChange={handleRadioChange} /> Yes</label></td>
                    <td> <label><input type="radio" id="serverIdRequirement" name="serverIdRequirement" value="false" checked={formData.serverIdRequirement === "false"} onChange={handleRadioChange} /> No</label></td>
                    <td><input className='remark-fields'></input></td>
                  </tr>
                  <tr>
                    <td>Email Id:</td>
                    <td><label><input type="radio" id="emailIdRequirement" name="emailIdRequirement" value="true" checked={formData.emailIdRequirement === "true"} onChange={handleRadioChange} /> Yes</label></td>
                    <td> <label><input type="radio" id="emailIdRequirement" name="emailIdRequirement" value="false" checked={formData.emailIdRequirement === "false"} onChange={handleRadioChange} /> No</label></td>
                    <td><input className='remark-fields'></input></td>
                  </tr>
                  <tr>
                    <td>SAP User Id:</td>
                    <td><label><input type="radio" id="sapUserIdRequirement" name="sapUserIdRequirement" value="true" checked={formData.sapUserIdRequirement === "true"} onChange={handleRadioChange} /> Yes</label></td>
                    <td> <label><input type="radio" id="sapUserIdRequirement" name="sapUserIdRequirement" value="false" checked={formData.sapUserIdRequirement === "false"} onChange={handleRadioChange} /> No</label></td>
                    <td><input className='remark-fields'></input></td>
                  </tr>
                  <tr>
                    <td>HR SIM Card:</td>
                    <td><label><input type="radio" id="hrSimCardRequirement" name="hrSimCardRequirement" value="true" checked={formData.hrSimCardRequirement === "true"} onChange={handleRadioChange} /> Yes</label></td>
                    <td> <label><input type="radio" id="hrSimCardRequirement" name="hrSimCardRequirement" value="false" checked={formData.hrSimCardRequirement === "false"} onChange={handleRadioChange} /> No</label></td>
                    <td><input className='remark-fields'></input></td>

                  </tr>

                </table>

              </tr>
              <tr>
                <td>Plant No.</td>
                <td><input type="I-text" value={formData.plantNo} /></td>
              </tr>
              <tr>
                <td>Remark By IT Dept.</td>
                <td><input type="I-text" value={formData.remark} /></td>
              </tr>

            </tbody>

          </table>

          {/* <div class="table-footer" style={{marginTop: "160px"}}>
        <div>
          <input type="text" />
          <div>User</div>
        </div>
        <div>
          <input type="text" />
          <div>HOD</div>
        </div>
        <div>
          <input type="text" />
          <div>A.G.M/G.M</div>
        </div>
        <div>
          <input type="text" />
          <div>G.M / HR</div>
        </div>
        <div>
          <input type="text" />
          <div>MD</div>
        </div>
      </div> */}
          {/* <button className='btn1' style={{ marginLeft: "600px", marginTop: "5px", fontSize: "16px" }}>Send</button>
      <button className='btn1' onClick={fetchitassetDetails} style={{ marginLeft: "600px", marginTop: "5px", fontSize: "16px" }}>Save</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <button className='btn1' onClick={fetchitassetDetails} >Save</button>
                <button className="btn1" onClick={handlePrint}>Print</button>
            </div> */}
        </div>
      </div>
    </div>

  );
};
export default ITRecruitment;
