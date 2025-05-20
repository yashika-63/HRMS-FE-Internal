import React from 'react';

const CompanyEvents = () => {
  const events = [
    { title: 'Project X Completion', date: '2024-11-09' },
    { title: 'Employee of the Month', date: '2024-11-10' },
  ];

  return (
    <div className="company-events">
      <h3>Company Events</h3>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            <p>{event.title} - {event.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompanyEvents;
