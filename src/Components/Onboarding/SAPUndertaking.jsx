import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import '../CommonCss/ITAsset.css'
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
            setFormData({ ...formData, name: `${employee.firstName} ${employee.middleName} ${employee.lastName}` });
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };

    useEffect(() => {
        fetchEmployeeDetails();
    }, [id]); // Fetch employee details when the id parameter changes

    const handlePrint = () => {
        window.print();
    };

        const handleChange = (e, name) => {
            const formattedDate = e.target.value;
            setFormData({
              ...formData,
              [name]: formattedDate,
            });
          };
          const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
          };
        
    const saveUndertaking = async () => {
        // console.log(formData);
        try {
            // Make POST request to save the undertaking data
            await axios.post(`http://${strings.localhost}/undertaking/Undertaking-save-for-employee?employeeId=${id}`, formData);
            alert('Undertaking saved successfully!');
        } catch (error) {
            console.error('Error saving undertaking:', error);
            alert('Failed to save undertaking. Please try again later.');
        }
    };

    return (
        <div className="undertaking-container" onSubmit={saveUndertaking}>
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
                            {/* <input name="sapUserId" type="s-text" style={{ marginLeft: "10%", width: "400px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px", marginBottom: "30px" }} onChange={handleChange} /> */}
                            <input  type="s-text" id="sapUserId" name="sapUserId" style={{ marginLeft: "10%", width: "400px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px", marginBottom: "30px" }}  value={formData.sapUserId}  onChange={handleInputChange} required  />

                        </div>
                    </div>
                    <div className="undertaking-row">
                        <div className="undertaking-label">Name:</div>
                        <div>
                            {/* <span style={{ marginTop: "15px", marginLeft: "40px", display: "inline-block", width: "500px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formData.name}</span> */}
                            <input name="name" type="s-text" style={{ marginLeft: "10%",marginTop: "10px", width: "400px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px", marginBottom: "30px" }} value={formData.name} readOnly />

                        </div>
                    </div>
                    <div className="undertaking-row">
                        <div className="undertaking-label">Date:</div>
                        <div>

                        <input className='datepicker' type="date" id="date" name="date"    style={{ marginLeft: "10%", width: "400px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px", marginBottom: "30px" }}  value={formData.date}  onChange={handleInputChange} required />
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
                        <input  type="s-text" id="signature" name="signature" style={{ marginLeft: "10%", width: "400px", border: "none", background: "transparent", outline: "0", borderBottom: "1px solid gray", borderRadius: "0px", marginBottom: "30px" }}  value={formData.signature} onChange={handleInputChange} required />
                        </div>
                    </div>
                </div>
            </div>
            <div className='btncontainer'>
                <button className='btn' onClick={saveUndertaking}>Save</button>
                <button className="btn" onClick={handlePrint}>Print</button>
                <Link to={`/OnBordingPortal`}>
            <button className='btn'>Next</button>
          </Link>

            </div>

        </div>
    );
};

export default UserUndertaking;
