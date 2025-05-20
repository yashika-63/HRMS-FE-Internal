import React, { useState, useEffect, useCallback } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import '../CommonCss/AddEmp.css'
import { strings } from '../../string';
import debounce from 'lodash.debounce';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable';
import { useNavigate } from 'react-router-dom';
import AssignEmp from '../Employees/AssignEmployee';
import ListProject from '../Project/ListProject';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { fetchDataByKey, fetchValueByKey, showToast } from '../../Api.jsx';
import { faList, faPlus, faTasks } from '@fortawesome/free-solid-svg-icons';

const Project = () => {
  const [formData, setFormData] = useState({
    id: '',
    clientName: '',
    proId: '',
    projectName: '',
    projectLead: '',
    deliveryLead: '',
    projectType: '',
    industry: '',
    technologies: '',
    assign: '',
    projectStatus: '',
    cityLocation: '',
    currentPhase: '',
    deallocate: '',
    description: '',
    totalEffort: '',
    actualStartDate: null,
    expectedEndDate: null,
    startDate: null,
    endDate: null,
    totalCost: '',
    shift: '',
    workType: ''
  });

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setFormData(prevData => ({
  //     ...prevData,
  //     [name]: type === 'checkbox' ? checked : value
  //   }));
  // };

  const [activePage, setActivePage] = useState('Add Project'); // State to track active page
  const [activeSection, setActiveSection] = useState(1); // State to track active section
  const [projectLeadId, setProjectLeadId] = useState(null);
  const [deliveryLeadId, setDeliveryLeadId] = useState(null);
  const [dropdownError, setDropdownError] = useState('');
  const [errors, setError] = useState('');
  const [projectStatusOptions, setProjectStatusOptions] = useState([]);
  const [effortError, setEffortError] = useState('');
  const [costError, setCostError] = useState('');
  const [projectLeadInput, setProjectLeadInput] = useState('');
  const [deliveryLeadInput, setDeliveryLeadInput] = useState('');
  const [projectLeadResults, setProjectLeadResults] = useState([]);
  const [deliveryLeadResults, setDeliveryLeadResults] = useState([]);
  const [projectLeadError, setProjectLeadError] = useState(null);
  const [deliveryLeadError, setDeliveryLeadError] = useState(null);
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);

  const navigate = useNavigate();
  const [dropdownData, setDropdownData] = useState({
    projectstatus: [],
    worktype: [],
    shifttype: [],
    industry: [],
    currentPhase: [],
    projecttype: [],
    technologies: [],
    clientName: [],
  });


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


  const handleTechnologiesChange = (selectedOptions) => {
    const selectedValues = Array.isArray(selectedOptions)
      ? selectedOptions.map(option => option.value)
      : [];
    setFormData({ ...formData, technologies: selectedValues });
  };

  // Handle changes for Client Name (single selection)
  const handleClientChange = (selectedOption) => {
    setFormData({
      ...formData,
      clientName: selectedOption ? selectedOption.value : '',
    });
  };




  const handleChange = (selectedOption) => {
    setFormData(prevData => ({ ...prevData, clientName: selectedOption ? selectedOption.value : '' }));
  };
  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    // Clear errors when input is empty
    if (value === '') {
      if (name === 'totalEffort') {
        setEffortError('');
      }
      if (name === 'totalCost') {
        setCostError('');
      }
    }

    // Handle numeric validation for totalEffort and totalCost
    if (name === 'totalEffort' || name === 'totalCost') {
      const numericValue = parseFloat(value); // Convert to float for validation

      if (isNaN(value) || parseFloat(value) < 0) {
        // Check if the input is not a number
        if (name === 'totalEffort') {
          setEffortError('Project Duration must be a valid number.');
        }
        if (name === 'totalCost') {
          setCostError('Total cost must be a valid number.');
        }

        else {
          setCostError(''); // Clear the error if valid
        }
      }

      // Specific validation for totalEffort


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


  // const handleDateChange = (date, name) => {
  //   setFormData({
  //     ...formData,
  //     [name]: date,
  //   });
  // };
  const handleClearAll = () => {
    const confirmClear = window.confirm('Are you sure you want to clear all fields?');
    if (confirmClear) {
      const clearedFormData = {
        id: '',
        clientName: '',
        projectName: '',
        projectLead: '',
        deliveryLead: '',
        projectType: '',
        industry: '',
        technologies: '',
        assign: '',
        startDate: '',
        endDate: '',
        projectStatus: '',
        cityLocation: '',
        currentPhase: '',
        deallocate: '',
        description: '',
        totalEffort: '',
        actualStartDate: '',
        expectedEndDate: '',
        totalCost: '',
      };
      setFormData(clearedFormData);
    }
  };

  const [dateErrors, setDateErrors] = useState({
    expectedEndDate: '',
    endDate: '',
    startDate: '',
    actualStartDate: ''
  });

  const handleDateChange = (date, name) => {
    let errors = { ...dateErrors };

    // Handle the actual start date or planned start date
    if (name === 'actualStartDate' || name === 'startDate') {
      setFormData({ ...formData, [name]: date });

      // Reset errors for related dates
      if (formData.expectedEndDate && date && formData.expectedEndDate < date) {
        errors.expectedEndDate = 'Completion date cannot be before actual start date or planned start date.';
      } else {
        errors.expectedEndDate = '';
      }

      if (formData.endDate && date && formData.endDate < date) {
        errors.endDate = 'Due date cannot be before actual start date or planned start date.';
      } else {
        errors.endDate = '';
      }
    } else if (name === 'expectedEndDate') {
      if (date && ((formData.actualStartDate && date < formData.actualStartDate) || (formData.startDate && date < formData.startDate))) {
        errors.expectedEndDate = 'Completion date cannot be before actual start date or planned start date.';
      } else {
        errors.expectedEndDate = '';
      }
      setFormData({ ...formData, [name]: date });
    } else if (name === 'endDate') {
      if (date && ((formData.actualStartDate && date < formData.actualStartDate) || (formData.startDate && date < formData.startDate))) {
        errors.endDate = 'Due date cannot be before actual start date or planned start date.';
      } else {
        errors.endDate = '';
      }
      setFormData({ ...formData, [name]: date });
    }

    setDateErrors(errors);
  };


  const companyId = localStorage.getItem("companyId")
  const validateForm = () => {
    let errors = [];



    // Check for numeric errors
    if (!formData.totalEffort || isNaN(formData.totalEffort)) {
      errors.push('Total Effort must be a valid number.');
    } else if (formData.totalEffort < 0) {
      errors.push('Total Effort cannot be negative.');
    }

    if (!formData.totalCost || isNaN(formData.totalCost)) {
      errors.push('Total Cost must be a valid number.');
    } else if (formData.totalCost < 0) {
      errors.push('Total Cost cannot be negative.');
    }

    // Date validations
    if (dateErrors.startDate) errors.push(dateErrors.startDate);
    if (dateErrors.endDate) errors.push(dateErrors.endDate);

    return errors;
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return; // Prevent form submission
    }
    if (
      costError ||
      effortError ||
      deliveryLeadError ||
      projectLeadError ||
      dateErrors.endDate ||
      dateErrors.expectedEndDate
    ) {
      showToast('Please correct all errors before submitting.', 'warn');
      return; // Exit the function if there are errors
    }
    const technologiesString = formData.technologies.join(',');

    const token = localStorage.getItem('token');
    axios.post(`http://${strings.localhost}/project/saveone/${companyId}/${projectLeadId}/${deliveryLeadId}`, {
      ...formData, technologies: technologiesString
    },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    )
      .then(response => {
        showToast('Project generated successfully', 'success');
        console.log('projectData', response.data);
        setTimeout(() => {
          navigate('/Listproject');
        }, 1000);

      })
      .catch(error => {
        console.error("Error:", error);
        showToast('Failed to generate project. Please try again.', 'error');
      });
  };



  const fetchEmployeeDetails = async (clientName) => {
    try {
      const response = await axios.get(`http://${strings.localhost}/project/searchProjectsByClientName/${clientName}`);
      const project = response.data; // Assuming the response is an object containing employee details
      // Update the form data with the employee's name
      // console.log(response.data);
      setFormData({
        ...formData,
        name: project.clientName,

      });
    }
    catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };
  useEffect(() => {
    fetchEmployeeDetails();
  }, []);

  const handleButtonClick = (pageName) => {
    setActivePage(pageName);
    setActiveSection(1);
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
  const fetchClientNames = useCallback(
    debounce(async (inputValue) => {
      if (inputValue.length < 3) return; // Prevent API calls for short input

      try {
        setLoadingProjects(true);
        const response = await axios.get(`http://${strings.localhost}/project/searchProjectsByClientName/${inputValue}`);
        const data = response.data;


        // Extract the 'content' array from the response
        const projects = data.content || [];

        // Ensure projects is an array
        if (Array.isArray(projects)) {
          setClientOptions(projects.map(project => ({
            value: project.clientName,
            label: project.clientName
          })));
        } else {
          console.error('API response is not an array:', projects);
          setClientOptions([]); // Clear options if the response is not as expected
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error('API endpoint not found:', error.message);
        } else {
          console.error('Error fetching client names:', error.message);
        }
        setClientOptions([]); // Clear options on error
      } finally {
        setLoadingProjects(false);
      }
    }, 300), // Debounce delay
    []
  );

  const handleChangeSelect = (selectedOption) => {
    handleChange(selectedOption);
  };
  const handleInputChange = (inputValue) => {
    setFormData({
      ...formData,
      clientName: inputValue,
    });
  };


  const handletechnologychange = (e) => {
    const { options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setSelectedTechnologies(selectedValues);
  };

  const removeTechnology = (value) => {
    setSelectedTechnologies(prevSelected => prevSelected.filter(item => item !== value));
  };

  // const handleClientNameChange = (selectedOption) => {
  //   if (selectedOption) {
  //     setFormData({ ...formData, clientName: selectedOption.value, projectName: '' });
  //     fetchProjectsByClientName(selectedOption.value);
  //   } else {
  //     setFormData({ ...formData, clientName: '', projectName: '' });
  //     setProjectOptions([]);
  //   }
  // };


  // const handleProjectNameChange = (selectedOption) => {
  //   if (selectedOption) {
  //     setFormData({ ...formData, projectName: selectedOption.value });
  //   } else {
  //     setFormData({ ...formData, projectName: '' });
  //   }
  // };
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Check if formData has unsaved changes
      if (Object.values(formData).some(value => value !== '')) {
        event.preventDefault();
        event.returnValue = ''; // For Chrome, Firefox, and other modern browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData]);

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
    <div className='coreContainer' >
      <form className='form2' onSubmit={handleSubmit}>
        <div className="form-title"> Project Data</div>

        <div>
          <div className='addform'>
            <button type="button" className={activePage === 'Add Project' ? 'active' : ''} onClick={() => handleButtonClick('Add Project')}>
              <FontAwesomeIcon className="icon" icon={faPlus} />
              Add Project
            </button>
            <button type="button" className={activePage === 'Project List' ? 'active' : ''} onClick={() => handleButtonClick('Project List')}>
              <FontAwesomeIcon className="icon" icon={faList} />
              Project List
            </button>

            <button type="button" className={activePage === 'Assigned Projects' ? 'active' : ''} onClick={() => handleButtonClick('Assigned Projects')}>
              <FontAwesomeIcon className="icon" icon={faTasks} />
              Assign Projects
            </button>
          </div>
        </div>
        <div className='page-content'>
          {activePage === 'Add Project' &&
            (
              <>
                <div className="data-container project-info1-box">

                  <div className='input-row'>

                    {/* <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                      <label htmlFor="clientName">Client Name</label>
                      <CreatableSelect
                        styles={{ minWidth: '200px', minHeight: '10px' }}
                        value={clientOptions.find(option => option.value === formData.clientName)}
                        onChange={handleClientChange}
                        onInputChange={handleInputChange}
                        options={clientOptions}
                        isSearchable
                        isClearable
                        loading={loadingProjects}
                        createOptionPosition="first"
                        required
                      />
                    </div>  */}

                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="proId">Project Id</label>
                      <input type="text" id="proId" name="proId" value={formData.proId} onChange={handleFieldChange} required />

                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="clientName">Client Name</label>
                      <input type="text" id="clientName" name="clientName" value={formData.clientName} onChange={handleFieldChange} required />

                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="projectName">Project Name</label>
                      <input type="text" id="projectName" name="projectName" value={formData.projectName} onChange={handleFieldChange} required />

                    </div>

                    {/* <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                    <label htmlFor="projectName">Project Name:</label>
                    <Select
                      value={{ value: formData.projectName, label: formData.projectName }}
                      onChange={searchProjects}
                      options={projectOptions}
                      isSearchable
                      isLoading={loadingProjects}
                    />
                  </div> */}

                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="projectLead">Project Lead</label>
                      <input
                        type="text"
                        id="projectLead"
                        name="projectLead"
                        value={projectLeadInput}
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

                    {/* <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                        <label htmlFor="projectType">Project Type:</label>
                        <input placeholder="Enter Project Type" type="p-text" id="projectType" name="projectType" value={formData.projectType} onChange={handleChange} required />
                      </div> */}
                  </div>
                  <div className='input-row'>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="projectType"> Project Type</label>
                      <select className='selectIM' id="projectType" name="projectType" value={formData.projectType} onChange={handleFieldChange} >
                        <option value="" selected disabled hidden></option>
                        {dropdownData.projecttype && dropdownData.projecttype.length > 0 ? (
                          dropdownData.projecttype.map(option => (
                            <option key={option.masterId} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No Project types available</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="deliveryLead">Delivery Lead</label>
                      <input
                        type="text"
                        id="deliveryLead"
                        name="deliveryLead"
                        value={deliveryLeadInput}
                        onChange={handleDeliveryLeadChange}
                        required
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
                      <span className="required-marker">*</span>
                      <label htmlFor="industry"> Industry</label>
                      <select className='selectIM' id="industry" name="industry" value={formData.industry} onChange={handleFieldChange} >
                        <option value="" selected disabled hidden></option>
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
                      <span className="required-marker">*</span>
                      <label htmlFor="projectStatus"> Project Status</label>
                      <select className='selectIM' id="projectStatus" name="projectStatus" value={formData.projectStatus} onChange={handleFieldChange} >
                        <option value="" selected disabled hidden></option>
                        {dropdownData.projectstatus && dropdownData.projectstatus.length > 0 ? (
                          dropdownData.projectstatus.map(option => (
                            <option key={option.masterId} value={option.data}>
                              {option.data}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No Project Statuses available</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
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
                </div>

                <div className='data-container project-info2-box'>

                  <div className='input-row'>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="totalEffort">Project Duration(In Months)</label>
                      <input type="text" id="totalEffort" name="totalEffort" value={formData.totalEffort} onChange={handleFieldChange} required />
                      {effortError && <div style={{ color: 'red' }}>{effortError}</div>}

                    </div>
                    <div style={{ marginTop: '1.5%', height: '96%' }}>
                      <div style={{ position: 'relative', height: '49%' }}>
                        <span className="required-marker">*</span>
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
                            required
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
                    </div>

                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="cityLocation">City Location</label>
                      <input type="text" id="cityLocation" name="cityLocation" value={formData.cityLocation} onChange={handleFieldChange} required />
                    </div>
                  </div>
                  {/* <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', top: -4, left: -7, color: 'red' }}>*</span>
                          <label htmlFor="currentPhase">Current Phase:</label>
                          <input placeholder="Enter Current Phase" type="p-text" id="currentPhase" name="currentPhase" value={formData.currentPhase} onChange={handleChange} required />
                        </div> */}
                  <div className='input-row'>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="currentPhase"> Current Phase</label>
                      <select className='selectIM' id="currentPhase" name="currentPhase" value={formData.currentPhase} onChange={handleFieldChange} >
                        <option value="" selected disabled hidden></option>
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
                      <span className="required-marker">*</span>
                      <label htmlFor="workType"> Work Type</label>
                      <select
                        className='selectIM'
                        id="workType"
                        name="workType"
                        value={formData.workType}
                        onChange={handleFieldChange}

                      >
                        <option value="" selected disabled hidden></option>
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
                      <span className="required-marker">*</span>
                      <label htmlFor="shift"> Shift</label>
                      <select
                        className='selectIM'
                        id="shift"
                        name="shift"
                        value={formData.shift}
                        onChange={handleFieldChange}

                      >
                        <option value="" selected disabled hidden></option>
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
                <div className='data-container project-info3-box'>
                  <div className="input-row">
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="startDate">Planned Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate || ''}
                        onChange={e => handleDateChange(e.target.value, 'startDate')}
                        required
                      />
                    </div>
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="endDate">Due Date</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate || ''}
                        onChange={e => handleDateChange(e.target.value, 'endDate')}
                        required
                      />
                      {dateErrors.endDate && <div className='error-message'>{dateErrors.endDate}</div>}
                    </div>
                    <div>
                      <label htmlFor="actualStartDate">Actual Start Date</label>
                      <input
                        type="date"
                        id="actualStartDate"
                        name="actualStartDate"
                        value={formData.actualStartDate || ''}
                        onChange={e => handleDateChange(e.target.value, 'actualStartDate')}
                      />
                    </div>
                    <div>
                      <label htmlFor="expectedEndDate">Completion Date</label>
                      <input
                        type="date"
                        id="expectedEndDate"
                        name="expectedEndDate"
                        value={formData.expectedEndDate || ''}
                        onChange={e => handleDateChange(e.target.value, 'expectedEndDate')}
                      />
                      {dateErrors.expectedEndDate && <div style={{ color: 'red' }}>{dateErrors.expectedEndDate}</div>}
                    </div>
                  </div>
                </div>

                <div className='data-container project-info4-box'>
                  <div className="input-row">
                    <div>
                      <span className="required-marker">*</span>
                      <label htmlFor="description">Description</label>
                      <textarea className="description" type="text" id="description" name="description" value={formData.description} onChange={handleFieldChange} required ></textarea>
                    </div>
                  </div>

                </div>


                {/* </td>
            </tr>
          </tbody>
        </table> */}
                <div className='btnContainer'>
                  <button className='btn' type="submit">Add Project</button>
                  <button className='outline-btn' type="button" onClick={handleClearAll}>Clear All</button>

                </div>
              </>
            )}
        </div>
      </form>
      <div>
        {activePage === 'Project List' && (
          <div>
            <ListProject />
          </div>
        )}
      </div>
      <div>
        {activePage === 'Assigned Projects' && (
          <div>
            <AssignEmp />
          </div>
        )}
      </div>

    </div>

  );
};

export default Project;
