import React, { useState } from 'react';

const SuggestionBox = () => {
  const [suggestions, setSuggestions] = useState([
    { suggestion: 'Improve the cafeteria menu.' },
    { suggestion: 'Provide more flexible working hours.' },
  ]);

  return (
    <div className="suggestion-box">
      <h3>Employee Suggestions</h3>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index}>
            <p>{suggestion.suggestion}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestionBox;
