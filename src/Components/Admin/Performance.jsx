import React from 'react';

const Performance = () => {
  const performanceData = [
    { employee: 'John Doe', performance: 'Excellent', rating: 4.8 },
    { employee: 'Jane Smith', performance: 'Good', rating: 4.2 },
  ];

  return (
    <div className="performance">
      <h3>Employee Performance</h3>
      <ul>
        {performanceData.map((data, index) => (
          <li key={index}>
            <p>{data.employee}: {data.performance} (Rating: {data.rating})</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Performance;
