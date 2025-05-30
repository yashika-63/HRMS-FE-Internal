import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import '../CommonCss/AddEmp.css'
import { strings } from '../../string';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const EmployeeOverview = () => {
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    middleName: '',
    motherName: '',
    gender: '',
    nationality: '',
    contactNo: '',
    email: '',
    designation: '',
    alternateContactNo: '',
    panNo: '',
    adhaarNo: '',
    department: '',
    abscondDate: null,
    joiningDate: null,
    exitDate: null,
    experience: '',
    presence: '',
    resign: '',
    priorId: '',
    division: '',
    employeeType: '',
    maritalStatus: '',
    documents: [],
    educationalDetails: [{}],
    c: [{}],
    currentAddress: {
      currentHouseNo: '',
      currentStreet: '',
      currentCity: '',
      currentState: '',
      currentPostelcode: '',
      currentCountry: '',
    },
    permanentAddress: {
      permanentHouseNo: '',
      permanentStreet: '',
      permanentCity: '',
      permanentState: '',
      permanentPostelcode: '',
      permanentCountry: ''
    }
  });
  const [documents, setDocuments] = useState([]);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    bankBranch: '',
    accountHolderName: '',
    accountNumber: '',
    bankCode: '',
    branchCode: '',
    bankAddress: '',
    accountType: '',
    iban: '',
    bic: '',
    contactNumber: '',
    email: ''
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const fetchProfilePhoto = async () => {
    setLoading(true);
    try {
      const response = await Axios.get(`http://${strings.localhost}/api/DocumentProfile/view/active?employeeId=${id}`, {
        responseType: 'blob',
      });

      if (response.data.size === 0) {
        // No image returned
        setPhoto(null);
        setLoading(false);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = function () {
        const base64data = reader.result;
        setPhoto(base64data); // Set the photo
      };
      reader.readAsDataURL(response.data); // Convert blob to base64
    } catch (error) {
      console.error('Error fetching profile photo:', error);
      setPhoto(null); // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };


  const fetchDocuments = async () => {
    try {
      const response = await Axios.get(`http://${strings.localhost}/api/documents/view/employee/${id}`);
      if (response.data) {
        // Extract file names from filePath and set the documents array
        const extractedDocuments = response.data.map(doc => {
          const fileName = doc.filePath.split("\\").pop(); // Extracts the file name from the full filePath
          return {
            ...doc,
            fileName: fileName
          };
        });
        setDocuments(extractedDocuments);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Function to fetch basic employee details
  const fetchEmployeeDetails = async () => {
    try {
      const response = await Axios.get(`http://${strings.localhost}/employees/EmployeeById/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee details:', error);
      return {};
    }
  };

  // Function to fetch educational details
  const fetchEducationalDetails = async () => {
    try {
      const response = await Axios.get(`http://${strings.localhost}/education/getByEmployeeId/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching educational details:', error);
      return [];
    }
  };

  // Function to fetch bank details
  const fetchBankDetails = async () => {
    try {
      const response = await Axios.get(`http://${strings.localhost}/BankDetails/getByEmployeeId?employeeId=${id}`);
      if (response.data && response.data.length > 0) {
        const latestBankDetail = response.data[response.data.length - 1];
        setBankDetails(latestBankDetail);
      } else {
        setBankDetails({}); // Set default empty object if no bank details are found
      }
    } catch (error) {
      console.error('Error fetching Bank Details:', error);
      setBankDetails({}); // Set default empty object on error
    }
  };

  const fetchHistoryById = async () => {
    try {
      const response = await Axios.get(`http://${strings.localhost}/api/employeement-history/getByEmployeeId/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Employee History:', error);
      return [];
    }
  };
  const fetchproject = async () => {
    try {
      const response = await Axios.get(`http://${strings.localhost}/api/employee/${id}/projects`);
      return response.data; // Return the project data directly
    } catch (error) {
      console.error('Error fetching Employee projects:', error);
      return []; // Return an empty array on error
    }
  };



  // Function to aggregate all data fetching
  const fetchAllDetails = async () => {
    try {
      const [employee, educationalDetails, bankDetails, employeeDetails, projectdetails] = await Promise.all([
        fetchEmployeeDetails(),
        fetchEducationalDetails(),
        fetchBankDetails(),
        fetchHistoryById(),
        fetchproject()
      ]);

      setFormData({
        ...employee,
        educationalDetails: educationalDetails || [],
        employeeDetails: employeeDetails || [],
        projectdetails: Array.isArray(projectdetails) ? projectdetails : []  // Ensure it's an array
      });
    } catch (error) {
      console.error('Error fetching all details:', error);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchAllDetails();
      fetchDocuments();
      fetchProfilePhoto();
    }
  }, [id]);



  const handlePrint = () => {
    window.print();
  };
  const handleBack = () => {
    navigate(`/ListEmp`);
  };

  if (!formData.id) {
    return <p>Loading...</p>;
  }
  return (
    <div className="coreContainer">
      <h1 className="form-title">Employee Overview</h1>

      <div className='overviewcard-container'>
        <div className="overviewcard small-width">
          <div className='section'>
            <h3 >Profile</h3>
            <div>
              <div className="profile-photo">
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  photo ? (
                    <img
                      src={photo}
                      alt="Profile"
                      className="profile-img"
                    />
                  ) : (
                    <div>
                      <p className='no-data'>
                        No profile photo for this employee
                      </p>
                    </div>
                  )
                )}
              </div>

            </div>

          </div>
        </div>

        <div className="overviewcard large-width">
          <div className='section'>
            <h3 >Personal Information</h3>
            <div className='fields-wrapper'>
              <div className="field"><span className="label">ID:</span> <span className="data">{formData.employeeId}</span></div>
              <div className="field"><span className="label">First Name:</span> <span className="data">{formData.firstName}</span></div>
              <div className="field"><span className="label">Last Name:</span> <span className="data">{formData.lastName}</span></div>
              <div className="field"><span className="label">Middle Name:</span> <span className="data">{formData.middleName}</span></div>
              <div className="field"><span className="label">Mother's Name:</span> <span className="data">{formData.motherName}</span></div>
              <div className="field"><span className="label">Gender:</span> <span className="data">{formData.gender}</span></div>
              <div className="field"><span className="label">Nationality:</span> <span className="data">{formData.nationality}</span></div>
              <div className="field"><span className="label">Contact No:</span> <span className="data">{formData.contactNo}</span></div>
              <div className="field"><span className="label">Email:</span> <span className="data">{formData.email}</span></div>
              <div className="field"><span className="label">Date of Birth:</span> <span className="data">{formData.dateOfBirth}</span></div>
              <div className="field"><span className="label">Age:</span> <span className="data">{formData.age}</span></div>
              <div className="field"><span className="label">Alternate Contact No:</span> <span className="data">{formData.alternateContactNo}</span></div>
              <div className="field"><span className="label">Alternate Email:</span> <span className="data">{formData.alternateEmail}</span></div>
              <div className="field"><span className="label">Designation:</span> <span className="data">{formData.designation}</span></div>
              <div className="field"><span className="label">Division:</span> <span className="data">{formData.division}</span></div>
              <div className="field"><span className="label">PAN No:</span> <span className="data">{formData.panNo}</span></div>
              <div className="field"><span className="label">Aadhaar No:</span> <span className="data">{formData.adhaarNo}</span></div>
              <div className="field"><span className="label">Department:</span> <span className="data">{formData.department}</span></div>
              <div className="field"><span className="label">Experience:</span> <span className="data">{formData.experience}</span></div>
              <div className="field"><span className="label">Joining Date:</span> <span className="data">{formData.joiningDate}</span></div>
              <div className="field"><span className="label">Prior ID:</span> <span className="data">{formData.priorId}</span></div>
              <div className="field"><span className="label">Employee Type:</span> <span className="data">{formData.employeeType}</span></div>
              <div className="field"><span className="label">Marital Status:</span> <span className="data">{formData.maritalStatus}</span></div>
            </div>
          </div>
        </div>

        <div className="overviewcard">
          <div className='section'>
            <h3 >Current Address</h3>
            <div>
              <div className="field"><span className="label">House Number & Complex:</span> <span className="data">{formData.currentHouseNo}</span></div>
              <div className="field"><span className="label">Street:</span> <span className="data">{formData.currentStreet}</span></div>
              <div className="field"><span className="label">City:</span> <span className="data">{formData.currentCity}</span></div>
              <div className="field"><span className="label">State:</span> <span className="data">{formData.currentState}</span></div>
              <div className="field"><span className="label">Postal Code:</span> <span className="data">{formData.currentPostelcode}</span></div>
              <div className="field"><span className="label">Country:</span> <span className="data">{formData.currentCountry}</span></div>
              {/* <div style={{ textAlign: 'center', marginLeft: '50%', fontSize: '14px' }}> */}
            </div>

          </div>

        </div>
        <div className='overviewcard'>
          <div className='section'>
            <h3 >Permanent Address</h3>
            <div className="field"><span className="label">House Number & Complex:</span> <span className="data">{formData.permanentHouseNo}</span></div>
            <div className="field"><span className="label">Street:</span> <span className="data">{formData.permanentStreet}</span></div>
            <div className="field"><span className="label">City:</span> <span className="data">{formData.permanentCity}</span></div>
            <div className="field"><span className="label">State:</span> <span className="data">{formData.permanentState}</span></div>
            <div className="field"><span className="label">Postal Code:</span> <span className="data">{formData.permanentPostelcode}</span></div>
            <div className="field"><span className="label">Country:</span> <span className="data">{formData.permanentCountry}</span></div>
          </div>
        </div>
        <div className="overviewcard medium-width">

          <div className='section'>
            <h3 >Educational Details</h3>
            <div className='fields-wrapper'>
              {formData.educationalDetails.map((edu, index) => (
                <div key={index} >
                  <div className="field"><span className="label">Institute:</span> <span className="data">{edu.institute}</span></div>
                  <div className="field"><span className="label">University:</span> <span className="data">{edu.university}</span></div>
                  <div className="field"><span className="label">Branch:</span> <span className="data">{edu.branch}</span></div>
                  <div className="field"><span className="label">Type of Study:</span> <span className="data">{edu.typeOfStudy}</span></div>
                  <div className="field"><span className="label">Year of Admission:</span> <span className="data">{edu.yearOfAddmisstion}</span></div>
                  <div className="field"><span className="label">Year of Passing:</span> <span className="data">{edu.yearOfPassing}</span></div>
                  <div className="field"><span className="label">Score:</span> <span className="data">{edu.score}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>




        <div className="overviewcard small-width">

          <div className='section'>
            <h3 >Employment History</h3>
            <div className='fields-wrapper'>
              {formData.employeeDetails.map((job, index) => (
                <div key={index} >

                  <div className="field"><span className="label">Company Name:</span> <span className="data">{job.companyName}</span></div>
                  <div className="field"><span className="label">Job Role:</span> <span className="data">{job.jobRole || 'N/A'}</span></div>
                  <div className="field"><span className="label">Responsibilities:</span> <span className="data">{job.responsibilities || 'N/A'}</span></div>
                  <div className="field"><span className="label">Start Date:</span> <span className="data">{job.startDate || 'N/A'}</span></div>
                  <div className="field"><span className="label">End Date:</span> <span className="data">{job.endDate || 'N/A'}</span></div>
                  <div className="field"><span className="label">Job Duration:</span> <span className="data">{job.jobDuration || 'N/A'}</span></div>
                  <div className="field"><span className="label">Latest CTC (In Lakhs):</span> <span className="data">{job.latestCtc || 'N/A'}</span></div>
                  <div className="field"><span className="label">Latest Monthly Gross:</span> <span className="data">{job.latestMonthGross || 'N/A'}</span></div>
                  <div className="field"><span className="label">Supervisor Contact:</span> <span className="data">{job.supervisorContact || 'N/A'}</span></div>
                  <div className="field"><span className="label">Achievements:</span> <span className="data">{job.achievements || 'N/A'}</span></div>
                  <div className="field"><span className="label">Employee Type:</span> <span className="data">{job.employeementType || 'N/A'}</span></div>
                  <div className="field"><span className="label">Location:</span> <span className="data">{job.location || 'N/A'}</span></div>
                  <div className="field"><span className="label">Industry:</span> <span className="data">{job.industry || 'N/A'}</span></div>
                  <div className="field"><span className="label">Company Size:</span> <span className="data">{job.companySize || 'N/A'}</span></div>
                  <div className="field"><span className="label">Reason for Leaving:</span> <span className="data">{job.reasonOfLeaving || 'N/A'}</span></div>
                </div>

              ))}
            </div>
          </div>
        </div>
        <div className="overviewcard small-width">

          <div className='section'>
            <h3>Assigned Projects</h3>
            {formData.projectdetails.length === 0 ? (
              <div className="field">
                <span >No projects assigned</span>
              </div>
            ) : (
              formData.projectdetails.map((projectName, index) => (
                <div key={index} className="field">
                  <span className="label">Project Name:</span>
                  <span className="data">{projectName}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="overviewcard medium-width ">

          <div className='section'  >
            <h3 >Bank Details</h3>
            <div className="field"><span className="label">Bank Name:</span> <span className="data">{bankDetails.bankName} </span></div>
            <div className="field"><span className="label">Account Number:</span> <span className="data">{bankDetails.accountNumber}</span></div>
            <div className="field"><span className="label">IFSC Code:</span> <span className="data">{bankDetails.accountifscCode}</span></div>
            <div className="field"><span className="label">Branch Address:</span> <span className="data">{bankDetails.branchAdress}</span></div>
            <div className="field"><span className="label">Account Holder Name:</span> <span className="data">{bankDetails.accountHolderName}</span></div>
            <div className="field"><span className="label">Branch Code:</span> <span className="data">{bankDetails.branchCode}</span></div>
            <div className="field"><span className="label">Account Type:</span> <span className="data">{bankDetails.accountType}</span></div>
            <div className="field"><span className="label">Linked Contact Number:</span> <span className="data">{bankDetails.linkedContactNo}</span></div>
            <div className="field"><span className="label">Linked Email:</span> <span className="data">{bankDetails.linkedEmail}</span></div>
          </div>
        </div>



        <div className='overviewcard small-width'>
          <div className='section'>
            <h3>Documents</h3>
            <div className='fields-wrapper'>
              {documents.length === 0 ? (
                <div>No documents uploaded</div>
              ) : (
                documents.map((doc, index) => (
                  <div key={index} style={{ marginLeft: '10px' }}>
                    <span>{index + 1} . </span>
                    <button style={{ border: 'none' }} onClick={() => window.open(doc.downloadUrl, '_blank')}>
                      {doc.fileName}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='btnContainer'>
        {/* <button type="button" className="outline-btn" onClick={handleBack} >Back</button> */}
        <button className='btn' type='button' onClick={handlePrint}>Print</button>

      </div>


    </div>
  );
};

export default EmployeeOverview;
