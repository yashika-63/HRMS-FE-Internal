import React, { useState, useEffect, useCallback } from 'react';
import './MasterPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faUserPlus, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { strings } from '../../string';
import {  toast } from 'react-toastify';
import { showToast } from '../../Api.jsx';

const Login = () => {
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [masterIdToDelete, setMasterIdToDelete] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://${strings.localhost}/api/master1/GetAllData`);
      setProjects(standardizeData(response.data));
    } catch (error) {
      console.error('Error fetching all data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://${strings.localhost}/api/master1/SearchMasterData`, {
        params: { searchText: query }
      });
      setSearchResults(standardizeData(response.data));
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError(`No Data Found`);
    } finally {
      setLoading(false);
    }
  };

  const standardizeData = (data) => {
    return data.map(item => ({
      masterId: item.masterId || item.id,
      keyvalue: item.keyvalue || item.key,
      data: item.data || item.value,
      category: item.category || item.type
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isUpdateMode) {
        await handleUpdate(formData.masterId); // Pass keyvalue to handleUpdate
      } else {
        if (!formData.keyvalue) {
          return;
        }
        await axios.post(`http://${strings.localhost}/api/masternew/MasterDataSave`, formData);
        showToast("Added Successfully.",'success');
        fetchAllData();
        setShowAddPopup(false);
        setFormData({});
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('An error occurred. Please try again.','error');
    }
  };

  const handleUpdate = async (masterId) => {
    try {
      await axios.put(`http://${strings.localhost}/api/master1/MasterDataUpadteByID/${masterId}`, formData);
      showToast("Updated Successfully",'success');
      fetchAllData();
      setShowAddPopup(false);
      setFormData({});
    } catch (error) {
      console.error('Update Error:', error);
      showToast('An error occurred during update. Please try again.','error');
    }
  };

  const handleDelete = async () => {
    try {
      if (masterIdToDelete) {
        await axios.delete(`http://${strings.localhost}/api/master1/deleteMasterData/${masterIdToDelete}`);
        showToast("Deleted Successfully.",'success');
        setTimeout(() => {
          window.location.reload();
        },1000);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error deleting master data:', error);
      showToast('An error occurred during deletion. Please try again.','error');
    } finally {
      setShowConfirmation(false);
    }
  };
  const handleDeleteConfirmation = (masterId) => {
    setMasterIdToDelete(masterId);
    setShowConfirmation(true);
  };
  const cancelDelete = () => {
    setShowConfirmation(false);
  };
  const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setError(null);
    debounceFetchSearchResults(e.target.value);
  };

  const debounceFetchSearchResults = useCallback(debounce((query) => {
    if (query) {
      fetchSearchResults(query);
    } else {
      setSearchResults([]);
    }
  }, 500), []);

  const handleSearch = () => {
    if (searchQuery) {
      fetchSearchResults(searchQuery);
    }
  };

  const editDropdownMenu = (master) => (
    <div className="dropdown">
      <button className="dots-button">
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      <div className="dropdown-content">
        <div>
          <button
            type="button"
            onClick={() => {
              setFormData(master);
              setIsUpdateMode(true);
              setShowAddPopup(true);
            }} >
            <FontAwesomeIcon icon={faEdit} /> Update
          </button>
        </div>
        <div>
          <button type='button' onClick={() => handleDeleteConfirmation(master.masterId)}>
            <FontAwesomeIcon className='ml-2' icon={faTrashAlt} /> Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mastercontainer">
      <form onSubmit={handleSubmit}>
        <div className="form-title">
          Master Data Management
        </div>
        <div className="form-controls">
          <div className="search-bar">
            <input placeholder="Search..." value={searchQuery} onChange={handleSearchInputChange} />
            <FaSearch className="search-icon" onClick={handleSearch} />
          </div>
          <button type="button" className="btn" onClick={() => {
            setFormData({});
            setIsUpdateMode(false);
            setShowAddPopup(true);
          }}
          >
            Add New
          </button>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        <table className='interview-table'>
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Key</th>
              <th>Data</th>
              <th>Category</th>
              <th style={{ width: "5%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(searchResults.length > 0 ? searchResults : projects).map((master , index) => (
              <tr key={master.masterId}>
                <td>{index+1}</td>
                <td>{master.keyvalue}</td>
                <td>{master.data}</td>
                <td>{master.category}</td>
                <td>
                  {editDropdownMenu(master)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddPopup && (
          <div className="add-popup">
            <div className="close-btn" onClick={() => setShowAddPopup(false)}>×</div>
            <div>
              <div>
                <div>
                  <label htmlFor='keyvalue'>Key:</label>
                  <input type="text" name="keyvalue" id="keyvalue" onChange={handleChange} value={formData.keyvalue || ''} />
                </div>
                <div>
                  <label htmlFor="data">Data:</label>
                  <input type="text" name="data" id="data" onChange={handleChange} value={formData.data || ''} />
                </div>
                <div>
                  <label htmlFor="category">Category:</label>
                  <input type="text" name="category" id="category" onChange={handleChange} value={formData.category || ''} />
                </div>
              </div>
            </div>
            <div className="popup-buttons">
              <div className="btnContainer">
                <button
                  className='btn'
                  type="button"
                  onClick={handleSubmit}
                >
                  {isUpdateMode ? 'Update' : 'Add'}
                </button>
                <button className='outline-btn' onClick={() => setShowAddPopup(false)}>Cancel</button>

              </div>
            </div>
          </div>
        )}
        {showConfirmation && (
          <div className="add-popup" style={{ height: "120px", textAlign: "center" }}>
            <p>Are you sure you want to delete this item?</p>
            <div className='btnContainer'>
              <button type='button' className='btn' onClick={handleDelete}>Yes</button>
              <button type='button' className='outline-btn' onClick={cancelDelete}>No</button>
            </div>
          </div>
        )}

      </form>
      
    </div>
  );
};

export default Login;
