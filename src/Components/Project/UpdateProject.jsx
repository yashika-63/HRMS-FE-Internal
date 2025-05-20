import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import '../CommonCss/AddEmp.css'
import axios from 'axios';
import { strings } from '../../string';
import CreatableSelect from 'react-select/creatable';
import { fetchDataByKey, fetchValueByKey , showToast } from '../../Api.jsx';
import {toast } from 'react-toastify';

const UpdateProj = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    id: '',
    clientName: '',
    projectName: '',
    projectLead: '',
    deliveryLead: '',
    projectType: '',
    industry: '',
    technologies: '',
    assign: '',
    currency_code: '',
    currencyCode: '',
    projectStatus: '',
    cityLocation: '',
    currentPhase: '',
    deallocate: '',
    description: '',
    totalEffort: '',
    totalCost: '',
    workType: '',
    shifttype: '',
    actualStartDate: null,
    expectedEndDate: null,
    startDate: null,
    endDate: null
  });

  const [dropdownData, setDropdownData] = useState({
    projectstatus: [],
    technologies: [],
    projecttype: [],
    worktype: [],
    shifttype: [],
    industry: [],
    currency_code: [],
    currentPhase: []
  });

  const companyId = localStorage.getItem("companyId");
  const [projectLeadInput, setProjectLeadInput] = useState('');
  const [projectLeadError, setProjectLeadError] = useState(null);
  const [projectLeadResults, setProjectLeadResults] = useState([]);
  const [deliveryLeadInput, setDeliveryLeadInput] = useState('');
  const [deliveryLeadError, setDeliveryLeadError] = useState(null);
  const [deliveryLeadResults, setDeliveryLeadResults] = useState([]);
  const [projectLeadId, setProjectLeadId] = useState(null);
  const [deliveryLeadId, setDeliveryLeadId] = useState(null);
  const [effortError, setEffortError] = useState('');
  const [costError, setCostError] = useState('');
  const [dateErrors, setDateErrors] = useState({
    expectedEndDate: '',
    endDate: '',
  });

  const fetchProjectById = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.get(
        `http://${strings.localhost}/project/getProjectById/${id}`,
        config
      );
      console.log("fetched data", response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching project by ID:', error);
    }
  };



  const handleProjectLeadChange = (event) => {
    const value = event.target.value;
    setProjectLeadInput(value);
    handleLeadSearch('projectLead', value);
  };

  const handleDeliveryLeadChange = (event) => {
    const value = event.target.value;
    setDeliveryLeadInput(value);
    handleLeadSearch('deliveryLead', value);
  };

  const handleLeadSearch = async (type, value) => {
    if (value.trim() === '') {
      if (type === 'projectLead') {
        setProjectLeadResults([]);
        setProjectLeadError(null);
      } else {
        setDeliveryLeadResults([]);
        setDeliveryLeadError(null);
      }
      return;
    }

    try {
      const response = await axios.get(`http://${strings.localhost}/employees/search`, {
        params: {
          companyId,
          searchTerm: value.trim(),
        }
      });

      if (type === 'projectLead') {
        setProjectLeadResults(response.data);
        setProjectLeadError(null);
      } else {
        setDeliveryLeadResults(response.data);
        setDeliveryLeadError(null);
      }
    } catch (error) {
      console.error('Error searching leads:', error);
      if (type === 'projectLead') {
        setProjectLeadError('Error fetching project leads.');
        setProjectLeadResults([]);
      } else {
        setDeliveryLeadError('Error fetching delivery leads.');
        setDeliveryLeadResults([]);
      }
    }
  };
  const handleSelectLead = (lead, type) => {
    if (type === 'projectLead') {
      setProjectLeadInput(`${lead.firstName} ${lead.lastName}`);
      setProjectLeadId(lead.id); // Store the ID
      setFormData({ ...formData, projectLead: `${lead.firstName} ${lead.lastName}`, projectLeadId: lead.id });
      setProjectLeadResults([]);
    } else {
      setDeliveryLeadInput(`${lead.firstName} ${lead.lastName}`);
      setDeliveryLeadId(lead.id); // Store the ID
      setFormData({ ...formData, deliveryLead: `${lead.firstName} ${lead.lastName}`, deliveryLeadId: lead.id });
      setDeliveryLeadResults([]);
    }
  };

  useEffect(() => {
    fetchProjectById();
  }, [id]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const projectstatus = await fetchDataByKey('projectstatus');
        const worktype = await fetchDataByKey('worktype');
        const shifttype = await fetchDataByKey('shifttype');
        const industry = await fetchDataByKey('industry');
        const currentPhase = await fetchDataByKey('currentPhase');
        const projecttype = await fetchDataByKey('projecttype');
        const technologies = await fetchDataByKey('technologies');
        const currency_code = await fetchValueByKey('currency_code');
        setDropdownData({
          projectstatus: projectstatus,
          worktype: worktype,
          shifttype: shifttype,
          currency_code: currency_code,
          industry: industry,
          currentPhase: currentPhase,
          projecttype: projecttype,
          technologies: technologies

        });
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'totalEffort' || name === 'totalCost') {
      if (isNaN(value) || parseFloat(value) < 0) {
        if (name === 'totalEffort') {
          setEffortError('Project duration cannot be negative or non-numeric.');
        }
        if (name === 'totalCost') {
          setCostError('Total cost cannot be negative or non-numeric And add full cost.');
        }

      } else {
        if (name === 'totalEffort') {
          setEffortError('');
        }
        if (name === 'totalCost') {
          setCostError('');
        }
      }
    }
    setFormData({ ...formData, [name]: value });
  };


  const handleDateChange = (e, name) => {
    const { value } = e.target; // Get the date value from the event
    const date = value;
    let errors = { ...dateErrors };
    if (name === 'actualStartDate' || name === 'startDate') {
      setFormData(prevFormData => ({ ...prevFormData, [name]: date }));
      if (formData.expectedEndDate && date && formData.expectedEndDate < date) {
        errors.expectedEndDate = 'Due date cannot be before actual start date or plan start date.';
      } else {
        errors.expectedEndDate = '';
      }
      if (formData.endDate && date && formData.endDate < date) {
        errors.endDate = 'Completion date cannot be before actual start date or plan start date.';
      } else {
        errors.endDate = '';
      }
    } else if (name === 'expectedEndDate') {
      if (date && ((formData.actualStartDate && date < formData.actualStartDate) || (formData.startDate && date < formData.startDate))) {
        errors.expectedEndDate = 'Due date cannot be before actual start date or plan start date.';
      } else {
        errors.expectedEndDate = '';
      }
      setFormData(prevFormData => ({ ...prevFormData, [name]: date }));
    } else if (name === 'endDate') {
      if (date && ((formData.actualStartDate && date < formData.actualStartDate) || (formData.startDate && date < formData.startDate))) {
        errors.endDate = 'Completion date cannot be before actual start date or plan start date.';
      } else {
        errors.endDate = '';
      }
      setFormData(prevFormData => ({ ...prevFormData, [name]: date }));
    }
    setDateErrors(errors);
  };

  const handledateChange = (date, dateString) => {
    setFormData({ ...formData, actualStartDate: dateString });
    setFormData({ ...formData, expectedEndDate: dateString });
    setFormData({ ...formData, startDate: dateString });
    setFormData({ ...formData, endDate: dateString });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (effortError || costError || Object.values(dateErrors).some(error => error)) {
      showToast("Please fix the errors before submitting the form.",'warn');
      return;
    }
    if (projectLeadError || deliveryLeadError) {
      showToast("Please fix the errors before submitting the form.",'warn');
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
  
      // Ensure technologies is an array before calling .join
      const technologiesArray = Array.isArray(formData.technologies) ? formData.technologies : [];
      const technologiesString = technologiesArray.join(',');
  
      console.log("Data sent for update:", {
        ...formData,
        technologies: technologiesString,
      });
  
      await axios.put(
        `http://${strings.localhost}/project/ProjectUpdateById/${id}`,
        { ...formData, technologies: technologiesString },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
  
      showToast("Project updated successfully",'success');
  
      setTimeout(() => {
        window.location.href = '/ListProject';
      }, 1000);
  
    } catch (error) {
      console.error("Error:", error);
    }
  };
  

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    if (value === '') {
      if (name === 'totalEffort') {
        setEffortError('');
      }
      if (name === 'totalCost') {
        setCostError('');
      }
    }
    if (name === 'totalEffort' || name === 'totalCost') {
      const numericValue = parseFloat(value); // Convert to float for validation

      if (value !== '' && isNaN(numericValue)) {
        // Check if the input is not a number
        if (name === 'totalEffort') {
          setEffortError('Project Duration must be a valid number.');
        }
        if (name === 'totalCost') {
          setCostError('Total cost must be a valid number.');
        }
        return; // Exit early to prevent updating the state with invalid value
      }

      // Specific validation for totalEffort
      if (name === 'totalEffort') {
        if (numericValue < 1 || numericValue > 12) {
          setEffortError('Project Duration must be between 1 and 12 months.');
        } else {
          setEffortError(''); // Clear the error if valid
        }
      }

      // Specific validation for totalCost
      if (name === 'totalCost') {
        if (numericValue < 0) {
          setCostError('Total cost cannot be negative.');
        } else {
          setCostError(''); // Clear the error if valid
        }
      }
    }

    // Update state for the input field
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const formatDateForInput = (date) => {
    return date ? moment(date).format('YYYY-MM-DD') : ''; // Convert to 'YYYY-MM-DD' format
  };

  const handleTechnologiesChange = (selectedOptions) => {
    const selectedValues = Array.isArray(selectedOptions)
      ? selectedOptions.map(option => option.value)
      : [];
    setFormData({ ...formData, technologies: selectedValues });
  };

  const CustomInput = (props) => {
    return (
      <input
        type='text'
        style={{
          border: 'none',
          borderBlock: 'none',
          outline: 'none',
          alignContent: 'center',
          marginBottom: '10px'
        }}
        {...props}
      />
    );
  };

  return (
    <div className='coreContainer'>
      <form className='form2' onSubmit={handleSubmit}>
        <div className="form-title">Update Project Data</div>

        <div className='page-content'>
          <div className="data-container project-info1-box">

            <div className='input-row'>
              <div>
                <label htmlFor="proId">Project ID</label>
                <input type="text" id="proId" name="proId" value={formData.proId} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="clientName">Client Name</label>
                <input placeholder="Enter Client Name" type="text" id="clientName" name="clientName" value={formData.clientName} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="projectName">Project Name</label>
                <input placeholder="Enter Project Name" type="text" id="projectName" name="projectName" value={formData.projectName} onChange={handleChange} />
              </div>
              <div>
                <span className="required-marker">*</span>
                <label htmlFor="projectLead">Project Lead</label>
                <input
                  type="text"
                  id="projectLead"
                  name="projectLead"
                  value={projectLeadInput || formData.projectLead || ''}
                  onChange={handleProjectLeadChange}
                  required
                />
                {projectLeadError && <div className="toast"><span style={{ color: 'red' }}>{projectLeadError}</span></div>}
                {projectLeadResults.length > 0 && (
                  <ul className="dropdown2">
                    {projectLeadResults.map((lead) => (
                      <li
                        key={lead.id}
                        onClick={() => handleSelectLead(lead, 'projectLead')}
                        style={{ cursor: 'pointer' }}
                      >
                        {`${lead.firstName} ${lead.lastName}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className='input-row'>

              <div>
                <label htmlFor="deliveryLead">Delivery Lead</label>
                <input
                  type="text"
                  id="deliveryLead"
                  name="deliveryLead"
                  value={deliveryLeadInput || formData.deliveryLead || ''}
                  onChange={handleDeliveryLeadChange}

                />
                {deliveryLeadError && <div className="toast"><span style={{ color: 'red' }}>{deliveryLeadError}</span></div>}
                {deliveryLeadResults.length > 0 && (
                  <ul className="dropdown2">
                    {deliveryLeadResults.map((lead) => (
                      <li
                        key={lead.id}
                        onClick={() => handleSelectLead(lead, 'deliveryLead')}
                        style={{ cursor: 'pointer' }}
                      >
                        {`${lead.firstName} ${lead.lastName}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label htmlFor="projecttype">  Project Type</label>
                <select className='selectIM' type="text" id="projectType" name="projectType" value={formData.projectType} onChange={handleChange} >
                  <option value="" selected disabled hidden>Select project</option>
                  {dropdownData.projecttype && dropdownData.projecttype.length > 0 ? (
                    dropdownData.projecttype.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Project Types Not available</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="industry"> Industry</label>
                <select className='selectIM' id="industry" name="industry" value={formData.industry} onChange={handleChange} >
                  <option value="" selected disabled hidden>Select Industry</option>
                  {dropdownData.industry && dropdownData.industry.length > 0 ? (
                    dropdownData.industry.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Industries Not available</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="projectstatus">  Project Status</label>
                <select className='selectIM' id="projectStatus" name="projectStatus" value={formData.projectStatus} onChange={handleChange} >
                  <option value="" selected disabled hidden>Select project Status</option>
                  {dropdownData.projectstatus && dropdownData.projectstatus.length > 0 ? (
                    dropdownData.projectstatus.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Project Status Not available</option>
                  )}
                </select>
              </div>
            </div>
        
          </div>
          <div className='data-container project-info2-box'>
            <div>
              <label>Technologies</label>
              <CreatableSelect
                isMulti
                options={dropdownData.technologies.map(tech => ({
                  value: tech.data,
                  label: tech.data,
                }))}
                onChange={handleTechnologiesChange}
                value={(Array.isArray(formData.technologies) ? formData.technologies : []).map(tech => ({
                  value: tech,
                  label: tech,
                }))}
                components={{ Input: CustomInput }} // Use custom input component

                styles={{
                  control: (base) => ({
                    ...base,
                    width: '100%', // Adjust to your layout
                    height: 'auto'
                  }),
                  mtext: (base) => ({
                    ...base,
                    alignContent: 'centre'
                  }),
                  indicatorSeparator: (base) => ({
                    ...base,
                    height: '20px', // Set your desired height
                    margin: '10 10px', // Optional: adjust margins
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    display: 'flex',
                    alignItems: 'center', // Center vertically
                    marginBottom: '25px'
                  }),
                }}
              />
            </div>
          </div>
          <div className='data-container project-info3-box'>

            <div className='input-row'>
              <div>
                <label htmlFor="totalEffort">Project Duration(In Months)</label>
                <input placeholder="Enter Total Effort" type="text" id="totalEffort" name="totalEffort" value={formData.totalEffort} onChange={handleChange} />
                {effortError && <div style={{ color: 'red' }}>{effortError}</div>}

              </div>
              <div style={{ position: 'relative', height: '49%', marginTop: '5px' }}>
                <label htmlFor="totalCost">Total Cost</label>

                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', height: '100%', outline: 'none' }}>

                  <select
                    className='text'
                    id="currencyCode"
                    name="currencyCode"
                    value={formData.currencyCode}
                    onChange={handleFieldChange}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: 'inherit',
                      paddingRight: '10px',
                      paddingLeft: '10px',
                      width: '100px',
                      flexGrow: 1,
                      margin: '0'
                    }}

                  >
                    <option value="" selected disabled hidden></option>
                    {dropdownData.currency_code && dropdownData.currency_code.length > 0 ? (
                      dropdownData.currency_code.map(option => (
                        <option key={option.id} value={option.data}>
                          {option.data}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>currency code Not available</option>
                    )}
                  </select>
                  <input
                    type="number"
                    id="totalCost"
                    name="totalCost"
                    value={formData.totalCost}
                    onChange={handleFieldChange}
                    style={{
                      border: 'none',
                      fontSize: 'inherit',
                      paddingLeft: '10px',
                      flexGrow: 2,
                      outline: 'none'
                    }}
                    required
                  />
                </div>
                {costError && <div style={{ color: 'red', position: 'absolute' }}>{costError}</div>}
              </div>
              <div>
                <label htmlFor="cityLocation">City Location</label>
                <input placeholder="Enter City Location" type="text" id="cityLocation" name="cityLocation" value={formData.cityLocation} onChange={handleChange} />
              </div>

            </div>

            <div className="input-row">
              <div>
                <label htmlFor="currentPhase"> Current Phase</label>
                <select className='selectIM' id="currentPhase" name="currentPhase" value={formData.currentPhase} onChange={handleChange} >
                  <option value="" selected disabled hidden>Select Current Phase</option>
                  {dropdownData.currentPhase && dropdownData.currentPhase.length > 0 ? (
                    dropdownData.currentPhase.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No phases available</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="workType"> Work Type</label>
                <select
                  className='selectIM'
                  id="workType"
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                >
                  <option value="" selected disabled hidden>Select Work Type</option>
                  {dropdownData.worktype && dropdownData.worktype.length > 0 ? (
                    dropdownData.worktype.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No Work Types available</option>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="shift">Shift</label>
                <select
                  className='selectIM'
                  id="shift"
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                >
                  <option value="" selected disabled hidden>Select shift</option>
                  {dropdownData.shifttype && dropdownData.shifttype.length > 0 ? (
                    dropdownData.shifttype.map(option => (
                      <option key={option.masterId} value={option.data}>
                        {option.data}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No shift available</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className='data-container project-info4-box' >
            <div className="input-row">
              <div>
                <label style={{ marginLeft: '10px' }}> Planned Start Date</label>
                <input
                  type='date'
                  className="datePicker"
                  id="startDate"
                  name="startDate"
                  value={formatDateForInput(formData.startDate)} // Format date for display
                  onChange={(e) => handleDateChange(e, "startDate")}

                />
              </div>

              <div>
                <label style={{ marginLeft: '10px' }}>Due Date</label>
                <input
                  type='date'
                  className="datePicker"
                  id="endDate"
                  name="endDate"
                  value={formatDateForInput(formData.endDate)} // Format date for display
                  onChange={(e) => handleDateChange(e, "endDate")}

                />
                {dateErrors.endDate && <div style={{ color: 'red' }}>{dateErrors.endDate}</div>}
              </div>

              <div>
                <label style={{ marginLeft: '10px' }}>Actual Start Date</label>
                <input
                  type='date'
                  className="datePicker"
                  id="actualStartDate"
                  name="actualStartDate"
                  value={formatDateForInput(formData.actualStartDate)} // Format date for display
                  onChange={(e) => handleDateChange(e, "actualStartDate")}

                />
              </div>
              <div>
                <label style={{ marginLeft: '10px' }}>Completion Date</label>
                <input
                  type='date'
                  className="datePicker"
                  id="expectedEndDate"
                  name="expectedEndDate"
                  value={formatDateForInput(formData.expectedEndDate)} // Format date for display
                  onChange={(e) => handleDateChange(e, "expectedEndDate")}

                />
                {dateErrors.expectedEndDate && <div style={{ color: 'red' }}>{dateErrors.expectedEndDate}</div>}

              </div>
            </div>

          </div>

          <div className='data-container project-info4-box'>
            <div className="row">
              <div>
                <label htmlFor="description">Description</label>
                <textarea className="description" type="text" id="description" name="description" value={formData.description} onChange={handleChange}  ></textarea>
              </div>
            </div>
          </div>
          {/* </td>
            </tr>
          </tbody>
        </table> */}
          <div className='form-controls'>
          <button className='btn' onSubmit={handleSubmit} type="submit">Update</button>
            <button className='outline-btn' type="button" onClick={() => window.location.href = '/ListProject'}>Cancel</button>
          </div>
        </div>
      </form>
   
    </div>

  );
};

export default UpdateProj;
