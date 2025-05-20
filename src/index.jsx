import React from 'react';
import ReactDOM from 'react-dom/client'; // Import createRoot from react-dom/client
import './index.css';
import App from './App.jsx'; // Import the App component

// Use createRoot to render the app
const root = ReactDOM.createRoot(document.getElementById('root')); // Make sure 'root' matches the id in index.html

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

