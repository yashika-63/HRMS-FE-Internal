import React, { useState, useEffect } from 'react';
import '../CommonCss/style.css'; // Import your CSS for the spinner

const SpinnerPage = () => {
  const [isLoading, setIsLoading] = useState(true);  // Set loading state to true to show spinner

  useEffect(() => {
    // Simulate some loading or async operation
    const timeout = setTimeout(() => {
      setIsLoading(false);  // After 10 seconds, set loading to false
    }, 10000);

    // Clean up timeout when the component is unmounted
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="coreContainer">
      {isLoading ? (
        <div className="loading-spinner-dots" >
         <div></div>
         <div></div>
         <div></div>
        </div>
      ) : (
        <p>Loading complete!</p> // Display after 10 seconds
      )}
    </div>
  );
};

export default SpinnerPage;



































 