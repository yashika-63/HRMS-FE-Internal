

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ITAsset.css';
import { DatePicker } from "antd";
import { strings } from '../../string';
const UserUndertaking = () => {
    const [formData, setFormData] = useState({ sapUserId: '', name: '', date: '', signature: '' });
    const { id, EmployeeId } = useParams(); // Get the employee ID from the URL parameters


    // Function to fetch employee details by ID
    const fetchEmployeeDetails = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/employees/EmployeeById/${id}`);
            const employee = response.data; // Assuming the response is an object containing employee details
            // Update the form data with the employee's name
            setFormData({ ...formData, name: `${employee.firstName} ${employee.middleName}  ${employee.lastName}` });
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };
    useEffect(() => {
        fetchEmployeeDetails();
    }, [id]); // Fetch employee details when the id parameter changes

    const fetchsapDetails = async () => {
      try {
        const response = await axios.get(`http://${strings.localhost}/undertaking/GetAllUndertakingDataByEmployeeID/${id}`);
        const sapData = response.data;
  
        // console.log('Response data:', sapData);
  
        if (sapData.content && sapData.content.length > 0) {
          const firstSap = sapData.content[0]; // Get the first asset from the content array
  
          // Update the form data with the employee's details
          setFormData({
            ...formData,
            sapUserId: firstSap.sapUserId,
            name: firstSap.name,
            date: firstSap.date,
            signature: firstSap.signature
           
          });
        } else {
        //   console.log('No SAP Data found for this employee');
          // Handle case when no assets are found
        }
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };
  
    useEffect(() => {
      fetchsapDetails();
    }, [id]);
   
    const handlePrint = () => {
        window.print();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

    };

    const saveUndertaking = async () => {
        try {
            // Make POST request to save the undertaking data
            await axios.post(`http://52.66.137.154:5557/Undertaking-save-for-employee?employeeId=${id}`, formData);
            alert('Undertaking saved successfully!');
        } catch (error) {
            console.error('Error saving undertaking:', error);
            alert('Failed to save undertaking. Please try again later.');
        }
    };

    return (
        <div onSubmit={fetchsapDetails} className="undertaking-container">
            
            <div className="undertaking-header">
                <p>UNDERTAKING FOR SAP USER ID</p>
            </div>
            <div className="undertaking-content">
                <p className="undertaking-paragraph">
                    <div className="undertaking-label"></div>
                    <div>
                        I <span style={{ marginLeft: "30px", borderBottom: "0px", width: "auto", display: "inline-block" }}>{formData.name}</span>
                        {/* I <input style={{ marginLeft: "30px", borderBottom: "0px", width: "auto", display: "inline-block" }}></input> */}
                    </div>
                    hereby undertake that the below mentioned SAP User ID allotted to me is wholly & solely used by me.
                    I do not share my ID & Password to anyone.
                    If I share this details to anyone I am wholly responsible for all entries/changes made in the SAP system through my ID and liable for payment of fine imposed on me by company.
                </p>
                <div className="undertaking-details">
                    <div className="undertaking-row">
                        <div className="undertaking-label">SAP User ID:</div>
                        <div>
                                <input id='sapUserId' type="s-text" name="sapUserId"  style={{ width: "500px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px" ,marginLeft: "50px"}} value={formData.sapUserId} readOnly />

                            {/* <input name="sapUserId" type="text" style={{ width: "500px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px" }} onChange={handleChange} /> */}
                        </div>
                    </div>
                    <div className="undertaking-row">
                        <div className="undertaking-label">Name:</div>
                        <div>
                            {/* <span style={{ marginTop: "15px", marginLeft: "40px", display: "inline-block", width: "500px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formData.name}</span> */}
                            <input name="name" type="text" style={{ marginLeft: "10%", width: "500px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px", marginBottom: "30px", marginTop: "20px" }} value={formData.name} readOnly />

                        </div>
                    </div>
                    <div className="undertaking-row">
                        <div className="undertaking-label">Date:</div>
                        <div>

                            <input name="date"  id="date" type="I-text" placeholder="YYYY-MM-DD"  style={{ marginLeft: "10%", width: "500px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px", marginBottom: "30px" }} value={formData.date ? formData.date.substring(0, 10) : ''} onChange={handleChange} readOnly />
                        </div>
                    </div>
                    {/* <div className="input-row">
                        <div>
                            <label htmlFor="Signature">Signature: </label>
                            <input name="Signature" type="text" style={{ marginLeft: "10%", width: "200px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px", marginBottom: "30px" }} onChange={handleChange} />

                            <textarea
                                className="SignatureInputBox"
                                rows="5"
                                id="Signature"
                                name="signature"
                                style={{ width: "400px", height: "50px", resize: "none", backgroundColor: "#f2f2f2" }} // Fixed width and height
                                value={formData.signature}
                                onChange={handleChange}
                            ></textarea> 
                        </div>
                    </div> */}

                    <div className="undertaking-row">
                        <div className="undertaking-label">Signature:</div>
                        <div>
                            <input name="signature" type="text" style={{ marginLeft: "10%", width: "500px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px", marginBottom: "30px" }} value={formData.signature} readOnly />
                        </div>
                    </div>
                </div>
            </div>
            {/* <button className='btn1' onClick={saveUndertaking} style={{ marginBottom: "10px" }}> Save</button>
            <button className="btn1" onClick={handlePrint} >Print </button> */}
            {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <button className='btn1' onClick={saveUndertaking} >Save</button>
                <button className="btn1" onClick={handlePrint}>Print</button>
            </div> */}
        </div>
    );
};

export default UserUndertaking;
