// src/components/dateTimeWidget/DateTimeWidget.js
import { useState, useEffect } from "react";
import "./dateTimeWidget.css";

const DateTimeWidget = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update the date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // Cleanup the timer when component unmounts
  }, []);

  // Format the time and date in the specified format
  const options = { 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true, 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    timeZoneName: 'short' 
  };
  const formattedDateTime = new Intl.DateTimeFormat('en-US', options).format(currentDateTime);

  return (
    <div className="dateTimeWidget">
      <p>{formattedDateTime}</p>
      <p>Time in Cebu City, Cebu</p>
    </div>
  );
};

export default DateTimeWidget;
