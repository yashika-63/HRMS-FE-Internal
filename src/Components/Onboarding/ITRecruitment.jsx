// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import Axios from 'axios';
// import './ITAsset.css';
// import { strings } from '../string';
// import { Link } from 'react-router-dom';
// const ITRecruitment = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     contactNo: '',
//     section: '',
//     designation: '',
//     role: '',
//     pcRequirement: '',

//     laptopRequirement: '',
//     macRequirement: '',
//     vpnRequirement: '',
//     serverIdRequirement: '',
//     emailIdRequirement: '',
//     sapUserIdRequirement: '',
//     hrSimCardRequirement: '',

//     plantNo: '',
//     remark: '',
//   });
//   // const { id } = useParams();

//   //const [id, setId] = useState("");
//   const { id, EmployeeId } = useParams(); // Get the employee ID from the URL parameters

//   // Function to handle changes in form input fields
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };
//   const handlePrint = () => {
//     window.print();
//   };
//   // Function to handle changes in checkbox inputs
//   const handleCheckboxChange = (e) => {
//     const { name, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: checked,
//     });
//   };

//   // Function to handle changes in radio button inputs
//   // const handleRadioChange = (e) => {
//   //   const { name, value } = e.target;
//   //   setFormData({
//   //     ...formData,
//   //     requirement: {
//   //       ...formData.requirement,
//   //       [name]: value,
//   //     },
//   //   });
//   // };
//   const fetchEmployeeDetails = async () => {
//     try {
//       const response = await Axios.get(`http://${strings.localhost}/employees/EmployeeById/${id}`);
//       const employee = response.data; // Assuming the response is an object containing employee details
//       // Update the form data with the employee's name
//       console.log(response.data);
//       setFormData({
//         ...formData, name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
//         contactNo: employee.contactNo,
//         department: employee.department,
//         designation: employee.designation

//       });
//     }
//     catch (error) {
//       console.error('Error fetching employee details:', error);
//     }
//   };
//   useEffect(() => {
//     fetchEmployeeDetails();
//   }, [id]); // Fetch employee details when the id parameter changes



//   // const saveRecruitment = async () => {
//   //   try {
//   //     // Log the form data being sent to the backend
//   //     console.log("Data being sent to backend:", formData);

//   //     // Make POST request to save the recruitment data
//   //     await Axios.post(`http://52.66.137.154:5557/RecrutmentSaveForEmployee?employeeId=${id}`, formData);
//   //     alert('Recruitment Checklist saved successfully!');
//   //   } catch (error) {
//   //     console.error('Error saving recruitment:', error);
//   //     alert('Failed to save Recruitment Checklist. Please try again later.');
//   //   }
//   // };



//   // Function to handle save button click
//   const handleSaveClick = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await Axios.post(`http://${strings.localhost}/recruitment/RecrutmentSaveForEmployee?employeeId=${id}`, formData);
//       console.log(response.data); // Handle response if needed
//       alert('Data saved successfully!');
//     } catch (error) {
//       console.error('Error saving data:', error);
//       alert('Failed to save data. Please try again.');
//     }
//   };


//   return (
//     <div className="A4-page">
//       <div className="table-container">
//         <div className='headline'>
//           <img src="/logo.png" alt="Spectrum Logo" width={130} height={90} />


//           <h2 className='table-header'>SPECTRUM ELECTRICAL INDUSTRIES LIMITED</h2>
//         </div>
//         <div className='content'>
//           <p>Registered & Corporate Office: GAT No. 139/1 & 139/2 ,UMALE</p>
//           <p>Jalgaon - 425003, Maharashtra, India, Telephone: 0257-2210192</p>
//           <p>CIN: L28100MH2008PLC185764, GSTIN: 27AAUCS2152E1Z7</p>
//         </div>


//       </div>
//       <h2 className="title">FORMAT FOR ISSUE OF FACILITY - EMAIL ID AND SAP USER ID</h2>



//       <div className='table-container'>
//         {/* <div>
//           <div className="table-header">SPECTRUM ELECTRICAL INDUSTRIES LIMITED
//           </div>
//           <div className='content'>
//             <p>Registered & Corporate Office: GAT No. 139/1 & 139/2 ,UMALE</p>
//             <p>Jalgaon - 425003, Maharashtra, India, Telephone: 0257-2210192</p>
//             <p>CIN: L28100MH2008PLC185764, GSTIN: 27AAUCS2152E1Z7</p>
//           </div>
//         </div>
//         <div>
//           <img src="/logo.png" alt="Spectrum Logo" width={160} height={90} style={{ marginTop: "20px" }} />


//           <div className="undertaking" >FORMAT FOR ISSUE OF FACILITY - EMAIL ID AND SAP USER ID</div>
//         </div> */}
//         <div className='page'>
//           <form onSubmit={handleSaveClick}>
//             <table className="employee-details" >
//               <thead>
//                 <tr>
//                   <th>Field</th>
//                   <th>Details</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td>Name Of Employee</td>
//                   <td><input type="Itext" id="name" name='name' value={formData.name} onChange={handleInputChange} /></td>
//                 </tr>
//                 <tr>
//                   <td>Mobile Number</td>
//                   <td><input type="Itext" id="contactNo" name='contactNo' value={formData.contactNo} onChange={handleInputChange} /></td>
//                 </tr>
//                 <tr>
//                   <td>Section / Department</td>
//                   <td><input type="Itext" id="department" name='department' value={formData.department} onChange={handleInputChange} /></td>
//                 </tr>
//                 <tr>
//                   <td>Designation</td>
//                   <td><input type="Itext" id="designation" name='designation' value={formData.designation} onChange={handleInputChange} /></td>
//                 </tr>
//                 <tr>
//                   <td>Roles & Responsibilities</td>
//                   <td> <input type="Itext" id="role" name="role" value={formData.role} onChange={handleInputChange} /> </td>

//                 </tr>
//                 <tr>
//                   <td>Status Of Employee</td>
//                   <table>
//                     <tr>
//                       <td className='td1-fields'><label>New Joining: Yes/ No </label></td>
//                       <td className='td-fields' > <label>Transfer: Yes/ No</label>
//                       </td>

//                       <td className='td2-fields' value={formData.remark}> <label>Remark</label></td>
//                     </tr>
//                   </table>
//                 </tr>

//                 <tr>
//                   <td >Requirement</td>




//                   <table className='nested-table'>
//                     <tr>
//                       <td >PC:</td>

//                       <td><label><input type="radio" id="pcRequirement" name="pcRequirement" value="true" checked={formData.pcRequirement === "true"} onChange={handleInputChange} /> Yes</label></td>
//                       <td> <label><input type="radio" id="pcRequirement" name="pcRequirement" value="false" checked={formData.pcRequirement === "false"} onChange={handleInputChange} /> No</label></td>
//                       <td><input className='remark-fields'></input></td>
//                     </tr>
//                     <tr>
//                       <td>laptop:</td>
//                       <td><label><input type="radio" id="laptopRequirement" name="laptopRequirement" value="true" checked={formData.laptopRequirement === "true"} onChange={handleInputChange} /> Yes</label></td>
//                       <td> <label><input type="radio" id="laptopRequirement" name="laptopRequirement" value="false" checked={formData.laptopRequirement === "false"} onChange={handleInputChange} /> No</label></td>
//                       <td><input className='remark-fields'></input></td>
//                     </tr>
//                     <tr>
//                       <td>VPN:</td>
//                       <td><label><input type="radio" id="vpnRequirement" name="vpnRequirement" value="true" checked={formData.vpnRequirement === "true"} onChange={handleInputChange} /> Yes</label></td>
//                       <td> <label><input type="radio" id="vpnRequirement" name="vpnRequirement" value="false" checked={formData.vpnRequirement === "false"} onChange={handleInputChange} /> No</label></td>
//                       <td><input className='remark-fields'></input></td>
//                     </tr>
//                     <tr>
//                       <td>MAC (Host):</td>
//                       <td><label><input type="radio" id="macRequirement" name="macRequirement" value="true" checked={formData.macRequirement === "true"} onChange={handleInputChange} /> Yes</label></td>
//                       <td> <label><input type="radio" id="macRequirement" name="macRequirement" value="false" checked={formData.macRequirement === "false"} onChange={handleInputChange} /> No</label></td>
//                       <td><input className='remark-fields'></input></td>
//                     </tr>
//                     <tr>
//                       <td>Server Id:</td>
//                       <td><label><input type="radio" id="serverIdRequirement" name="serverIdRequirement" value="true" checked={formData.serverIdRequirement === "true"} onChange={handleInputChange} /> Yes</label></td>
//                       <td> <label><input type="radio" id="serverIdRequirement" name="serverIdRequirement" value="false" checked={formData.serverIdRequirement === "false"} onChange={handleInputChange} /> No</label></td>
//                       <td><input className='remark-fields'></input></td>
//                     </tr>
//                     <tr>
//                       <td>Email Id:</td>
//                       <td><label><input type="radio" id="emailIdRequirement" name="emailIdRequirement" value="true" checked={formData.emailIdRequirement === "true"} onChange={handleInputChange} /> Yes</label></td>
//                       <td> <label><input type="radio" id="emailIdRequirement" name="emailIdRequirement" value="false" checked={formData.emailIdRequirement === "false"} onChange={handleInputChange} /> No</label></td>
//                       <td><input className='remark-fields'></input></td>
//                     </tr>
//                     <tr>
//                       <td>SAP User Id:</td>
//                       <td><label><input type="radio" id="sapUserIdRequirement" name="sapUserIdRequirement" value="true" checked={formData.sapUserIdRequirement === "true"} onChange={handleInputChange} /> Yes</label></td>
//                       <td> <label><input type="radio" id="sapUserIdRequirement" name="sapUserIdRequirement" value="false" checked={formData.sapUserIdRequirement === "false"} onChange={handleInputChange} /> No</label></td>
//                       <td><input className='remark-fields'></input></td>
//                     </tr>
//                     <tr>
//                       <td>HR SIM Card:</td>
//                       <td><label><input type="radio" id="hrSimCardRequirement" name="hrSimCardRequirement" value="true" checked={formData.hrSimCardRequirement === "true"} onChange={handleInputChange} /> Yes</label></td>
//                       <td> <label><input type="radio" id="hrSimCardRequirement" name="hrSimCardRequirement" value="false" checked={formData.hrSimCardRequirement === "false"} onChange={handleInputChange} /> No</label></td>
//                       <td><input className='remark-fields'></input></td>

//                     </tr>

//                   </table>

//                 </tr>
//                 <tr>
//                   <td>Plant No.</td>
//                   <td> <input type="Itext" id="plantNo" name="plantNo" value={formData.plantNo} onChange={handleInputChange} /> </td>
//                 </tr>
//                 <tr>
//                   <td>Remark By IT Dept.</td>
//                   <td> <input type="Itext" id="remark" name="remark" value={formData.remark} onChange={handleInputChange} /> </td>
//                 </tr>

//               </tbody>

//             </table>
//             <div className='table-content'> Approval </div>

//             <div class="table-footer" >
//               <div>
//                 <td> <input type="I-text" /> </td>
//                 <div>User</div>
//               </div>
//               <div>
//                 <td> <input type="I-text" /> </td>
//                 <div>HOD</div>
//               </div>
//               <div>
//                 <td> <input type="I-text" /> </td>
//                 <div>A.G.M/G.M</div>
//               </div>
//               <div>
//                 <td> <input type="I-text" /> </td>
//                 <div>G.M / HR</div>
//               </div>
//               <div>
//                 <td> <input type="I-text" /> </td>
//                 <div>MD</div>
//               </div>
//             </div>

//         <div className='btnContainer'>
//           <button className='btn' onClick={handlePrint}> Print</button>
//           <button className='btn' type='submit' onSubmit={handleSaveClick} >Save</button>
//           <Link to={`/ITAsset/${id}`}>
//             <button className='btn'>Next</button>
//           </Link>
//         </div>
//         </form>
//         </div>





//     </div>

//     </div >

//   );
// };
// export default ITRecruitment;





import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Axios from 'axios';
import '../CommonCss/ITAsset.css'
import { strings } from '../../string';

const ITRecruitment = () => {
  const [formData, setFormData] = useState({
    name: '',
    contactNo: '',
    section: '',
    designation: '',
    role: '',
    pcRequirement: '',
    laptopRequirement: '',
    macRequirement: '',
    vpnRequirement: '',
    serverIdRequirement: '',
    emailIdRequirement: '',
    sapUserIdRequirement: '',
    hrSimCardRequirement: '',
    plantNo: '',
    remark: '',
  });

  const { id } = useParams(); // Get the employee ID from the URL parameters

  // Function to handle changes in form input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to handle changes in checkbox inputs
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const fetchEmployeeDetails = async () => {
    try {
      const response = await Axios.get(`http://${strings.localhost}/employees/EmployeeById/${id}`);
      const employee = response.data;
      setFormData({
        ...formData,
        name: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
        contactNo: employee.contactNo,
        section: employee.section,
        designation: employee.designation,
        department: employee.department
      });
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const handleSaveClick = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios.post(`http://${strings.localhost}/recruitment/RecrutmentSaveForEmployee?employeeId=${id}`, formData);
      alert('Data saved successfully!');
    } catch (error) {
      alert('Failed to save data. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };
  const [dropdownData, setDropdownData] = useState({

    statusOfEmployee: []
  });
  const [dropdownError, setDropdownError] = useState('');

  return (
    <div>
      <h2 className="title">FORMAT FOR ISSUE OF FACILITY - EMAIL ID AND SAP USER ID</h2>
      <div>
        {/* <div className="input-row">
          <div className="form-group">
            <label htmlFor="name">Employee Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} readOnly />
          </div>
          <div className="form-group">
            <label htmlFor="contactNo">Mobile Number</label>
            <input type="text" id="contactNo" name="contactNo" value={formData.contactNo} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="designation">Employee Designation</label>
            <input type="text" id="designation" name="designation" value={formData.designation} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="section">Employee Section</label>
            <input type="text" id="section" name="section" value={formData.section} onChange={handleInputChange} required />
          </div>
        </div> */}

        <form onSubmit={handleSaveClick} className='box-container personal-info-box'>
        <div className="input-row">
          <div className="form-group">
            <label htmlFor="name">Employee Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} readOnly />
          </div>
          <div className="form-group">
            <label htmlFor="contactNo">Mobile Number</label>
            <input type="text" id="contactNo" name="contactNo" value={formData.contactNo} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="designation">Employee Designation</label>
            <input type="text" id="designation" name="designation" value={formData.designation} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="department"> Section / Department</label>
            <input type="text" id="department" name="department" value={formData.department} onChange={handleInputChange} required />
          </div>
         
        </div>
          <div className='input-row'>
          <div className="dropdown-group">
              <label htmlFor="statusOfEmployee">Status of Employee</label>
              <select
                id="statusOfEmployee"
                name="statusOfEmployee"
                value={formData.statusOfEmployee}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select</option>
                <option value="true">New Joining</option>
                <option value="false">Transfer</option>
              </select>
            </div>
            <div>
              <label htmlFor="plantNo">Plant No</label>
              <input type="text" id="plantNo" name="plantNo" value={formData.plantNo} onChange={handleInputChange} />
            </div>
          </div>
          <div className="input-row">
            <div className="dropdown-group">
              <label htmlFor="pcRequirement">PC:</label>
              <select
                id="pcRequirement"
                name="pcRequirement"
                value={formData.pcRequirement}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="dropdown-group">
              <label htmlFor="laptopRequirement">Laptop:</label>
              <select
                id="laptopRequirement"
                name="laptopRequirement"
                value={formData.laptopRequirement}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="dropdown-group">
              <label htmlFor="vpnRequirement">VPN:</label>
              <select
                id="vpnRequirement"
                name="vpnRequirement"
                value={formData.vpnRequirement}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="dropdown-group">
              <label htmlFor="macRequirement">MAC (Host):</label>
              <select
                id="macRequirement"
                name="macRequirement"
                value={formData.macRequirement}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div className='input-row'>
            <div className="dropdown-group">
              <label htmlFor="serverIdRequirement">Server Id:</label>
              <select
                id="serverIdRequirement"
                name="serverIdRequirement"
                value={formData.serverIdRequirement}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="dropdown-group">
              <label htmlFor="emailIdRequirement">Email Id:</label>
              <select
                id="emailIdRequirement"
                name="emailIdRequirement"
                value={formData.emailIdRequirement}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="dropdown-group">
              <label htmlFor="sapUserIdRequirement">SAP User Id:</label>
              <select
                id="sapUserIdRequirement"
                name="sapUserIdRequirement"
                value={formData.sapUserIdRequirement}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="dropdown-group">
              <label htmlFor="hrSimCardRequirement">HR SIM Card:</label>
              <select
                id="hrSimCardRequirement"
                name="hrSimCardRequirement"
                value={formData.hrSimCardRequirement}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div className='btnContainer'>
            <button className='btn' type="button" onClick={handlePrint}>Print</button>
            <button className='btn' type='submit'>Save</button>
            <Link to={`/ITAsset/${id}`}>
              <button className='btn'>Next</button>
            </Link>
          </div>

        </form>
      </div>
    </div >
  );
};

export default ITRecruitment;
