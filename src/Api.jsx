// Api.js
import axios from 'axios';
import { strings } from './string';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState , useEffect } from 'react';
// Function to play sound for a specific type (success, error, warn, etc.) for 2 seconds
// const playSound = (type) => {
//   let audio;

//   // Determine which sound to play based on type
//   switch (type) {
//     case 'success':
//       audio = new Audio('/Audio/success.mp3'); 
//       break;
//     case 'error':
//       audio = new Audio('/Audio/error.ogg'); 
//       break;
//     case 'warn':
//       audio = new Audio('/Audio/warn.wav'); 
//       break;
//     default:
//       break;
//   }

//   if (audio) {
//     audio.currentTime = 0; // Start at the beginning
//     audio.play(); // Play the audio

//     // Stop the audio after 2 seconds (2000ms)
//     setTimeout(() => {
//       audio.pause(); // Pause the audio after 2 seconds
//     }, 500); // 2000ms = 2 seconds
//   }
// };

// // Example of how you can call the playSound function for all 3 sounds
// const playAllSounds = () => {
//   playSound('success');  // Play success sound for 2 seconds
//   playSound('error');    // Play error sound for 2 seconds
//   playSound('warn');     // Play warn sound for 2 seconds
// };

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
};

export const fetchDataByKey = async (keyvalue) => {
  try {
    const response = await axios.get(`http://${strings.localhost}/api/master1/GetDataByKey/${keyvalue}`, getConfig());
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(item => ({
        masterId: item.masterId,
        data: item.data || ''
      }));
    }
    console.error(`Invalid data structure or empty response for ${keyvalue}`);
    return [];
  } catch (error) {
    console.error(`Error fetching data for ${keyvalue}:`, error);
    throw error;
  }
};

export const fetchValueByKey = async (keyvalue) => {
  try {
    const response = await axios.get(`http://${strings.localhost}/api/master/GetDataByKey/${keyvalue}`, getConfig());
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(item => ({
        masterId: item.masterId,
        data: item.data || ''
      }));
    }
    console.error(`Invalid data structure or empty response for ${keyvalue}`);
    return [];
  } catch (error) {
    console.error(`Error fetching data for ${keyvalue}:`, error);
    throw error;
  }
};

// Updated showToast function
export const showToast = (message, type) => {
  // setTimeout(() => {
  //   toast.dismiss();
  // }, 3000);

  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else if (type === 'warn') {
    toast.warn(message);
  } else if (type === 'info') {
    toast.info(message);
  }
};
const arrayBufferToBase64 = (buffer) => {
  const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
  return window.btoa(binary);
};

export const useCompanyLogo = (companyId) => {
  const [logo, setLogo] = useState(null);

  useEffect(() => {
      const fetchLogo = async () => {
          try {
              const response = await axios.get(
                  `http://${strings.localhost}/api/company-document/view/activenew?companyId=${companyId}&documentIdentityKey=CompanyLogo`,
                  { responseType: "arraybuffer" }
              );
              const base64Logo = arrayBufferToBase64(response.data);
              setLogo(`data:image/png;base64,${base64Logo}`);
          } catch (error) {
              console.error("Error fetching logo:", error);
          }
      };

      if (companyId) fetchLogo();
  }, [companyId]);

  return logo;
};

