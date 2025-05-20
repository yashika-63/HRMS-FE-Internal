import React from 'react';

const EmployeeEvents = () => {
  const events = [
    { type: 'Birthday', name: 'John Doe', date: '2024-11-08' },
    { type: 'Anniversary', name: 'Jane Smith', date: '2024-11-08' },
  ];

  return (
    <div className="employee-events">
      <h3>Employee Birthdays & Anniversaries</h3>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            <p>{event.type}: {event.name} - {event.date}</p>
            <button>Send Wishes</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeEvents;
