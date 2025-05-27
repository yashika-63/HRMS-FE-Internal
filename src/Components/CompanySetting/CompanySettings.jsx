import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './companysettings.css';
import { strings } from "../../string";

const CompanySettings = () => {
  const accountId = localStorage.getItem('accountId');
  const companyId = localStorage.getItem('companyId');
  const [companyDetails, setCompanyDetails] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    type: '',
    website: ''
  });

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleModule = async (moduleId) => {
    try {
      // Find the module to get its current status and name
      const moduleToUpdate = modules.find(module => module.id === moduleId);
      if (!moduleToUpdate) return;

      // Prepare the payload for the API
      const payload = {
        module_name: moduleToUpdate.name,
        status: !moduleToUpdate.enabled, // This will be the new status
        company_id: companyId
      };

      // Make the API call to update the status
      await axios.put(
        `http://localhost:5558/api/workflow-configuration/update-company-setting/${moduleId}`,
        payload
      );

      // Update the local state only if the API call succeeds
      setModules(modules.map(module =>
        module.id === moduleId ? { ...module, enabled: !module.enabled } : module
      ));
    } catch (error) {
      console.error("Error updating module status:", error);
      // You might want to show an error message to the user here
    }
  };

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const companyResponse = await axios.get(
          `http://localhost:5558/api/CompanyRegistartion/GetCompanyById?id=${companyId}`
        );
        const company = companyResponse.data;
        if (company) {
          setCompanyDetails({
            name: company.companyName || 'Not available',
            address: company.companyAddress || 'Not available',
            email: company.email || 'Not available',
            phone: company.phone || 'Not available',
            type: company.companyType || 'Not available',
            website: company.website || 'Not available'
          });
        }
      } catch (error) {
        console.error("Error fetching company details:", error.message);
      }
    };

    const fetchWorkflowConfiguration = async () => {
  try {
    const response = await axios.get(
      `http://localhost:5558/api/workflow-configuration/by-company/${companyId}`
    );
    
    // Transform the API response into the format your component expects
    const fetchedModules = response.data.map((module) => {
      // Convert the status to boolean
      // Assuming 0x01 is true and anything else is false
      const isEnabled = module.status === 0x01 || module.status === true;
      
      return {
        id: module.id, // Use the actual ID from the database
        name: module.module_name || module.moduleName || `Module ${module.id}`,
        enabled: isEnabled
      };
    });
    
    setModules(fetchedModules);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching workflow configuration:", error.message);
    setError("Failed to load module configuration");
    setLoading(false);
  }
};

    fetchCompanyDetails();
    fetchWorkflowConfiguration();
  }, [companyId]);

  return (
    <div className="company-settings-container">
      {/* Company Details Section */}
      <div className="company-details">
        <h2>Company Information</h2>
        <div className="details-grid">
          <div className="input-row">
            <span className="detail-label">Company Name:</span>
            <span>{companyDetails.name}</span>
          </div>
          <div className="input-row">
            <span className="detail-label">Company Type:</span>
            <span>{companyDetails.type}</span>
          </div>
          <div className="input-row">
            <span className="detail-label">Address:</span>
            <span>{companyDetails.address}</span>
          </div>
          <div className="input-row">
            <span className="detail-label">Email:</span>
            <span>{companyDetails.email}</span>
          </div>
          <div className="input-row">
            <span className="detail-label">Phone:</span>
            <span>{companyDetails.phone}</span>
          </div>
          <div className="input-row">
            <span className="detail-label">Website:</span>
            <span>{companyDetails.website}</span>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="modules-section">
        <h2>Module Settings</h2>
        {loading ? (
          <div>Loading modules...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : modules.length > 0 ? (
  <div className="modules-list">
    {modules.map(module => (
      <div key={module.id} className="module-item">
        <span className="module-name">{module.name}</span>
        <div className="toggle-container">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={module.enabled} 
              onChange={() => toggleModule(module.id)} 
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-status">
            {module.enabled ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    ))}
  </div>
) : (
  <div>No modules configured for this company</div>
)}
      </div>
    </div>
  );
};

export default CompanySettings;