import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './companysettings.css';
import { strings } from "../../string";

const CompanySettings = () => {
  const accountId = localStorage.getItem('accountId');
  const [companyDetails, setCompanyDetails] = useState({
    name: 'Acme Corporation',
    address: '123 Business Park, Suite 456, New York, NY 10001',
    email: 'contact@acme.com',
    phone: '(555) 123-4567'
  });

  const [modules, setModules] = useState([
    { id: 1, name: 'User Management', enabled: true },
    { id: 2, name: 'Inventory System', enabled: false },
    { id: 3, name: 'Billing Module', enabled: true },
    { id: 4, name: 'Reporting Dashboard', enabled: false },
    { id: 5, name: 'Customer Portal', enabled: true },
    { id: 6, name: 'HR Management', enabled: false },
  ]);

  const toggleModule = (moduleId) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, enabled: !module.enabled } : module
    ));
  };

    useEffect(() => {
    const fetchCompanyDetails = async () => {
    //   if (!companyAssignId || !accountId) return;
      if (!accountId) return;
 
      try {
        const companyResponse = await axios.get(
        //   `http://${strings.localhost}/api/CompanyRegistartion/GetCompanyByIds?companyAssignId=${companyAssignId}&accountId=${accountId}`
          `http://${strings.localhost}/api/CompanyRegistartion/GetCompanyByIds?accountId=${accountId}`
        );
        const company = companyResponse.data[0];
        if (company) {
          setCompanyName(company.companyName);
          setCompanyAdress(company.companyAdress);
        }
      } catch (error) {
        console.error("Error fetching company details:", error.message);
      }
    };
 
    fetchCompanyDetails();
//   }, [companyAssignId, accountId]);
  }, [ accountId]);
 

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
        </div>
      </div>

      {/* Modules Section */}
      <div className="modules-section">
        <h2>Module Settings</h2>
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
      </div>
    </div>
  );
};

export default CompanySettings;