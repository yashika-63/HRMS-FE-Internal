import React from 'react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';


const Calendar = () => {
  const events = [
    { title: 'John Doe Birthday', start: new Date(2024, 10, 8), end: new Date(2024, 10, 8) },
    { title: 'Project X Completion', start: new Date(2024, 10, 9), end: new Date(2024, 10, 9) },
  ];

  return (
    <div className="calendar">
        events={events}
        defaultDate={new Date()}
        style={{ height: 500 }}
    </div>
  );
};

export default Calendar;
