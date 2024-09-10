import { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import SearchBar from "../../components/searchBar/SearchBar";
import WidgetSched from "../../components/widgetSched/widgetSched";
import "./schedule.css";
import FacultyTimeTable from "../../components/facultyTimeTable/facultyTimeTable";

const Schedule = () => {
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
    <div className="sched">
      <Sidebar />
      <div className="schedContainer">
        <Navbar />

        {/* CLASSES DEPENDE SA WEEKDAY */}
        <div>
          <h2>Today's Classes</h2>
          <p>{formattedDateTime}</p>
          <p>Time in Cebu City, Cebu</p>
          
          <div className="widgets">
            <WidgetSched />
          </div>
        </div>
        
        {/* RECENT TIME INS OF A FACULTY MEMBER */}
        <div className="tableSched">
          <FacultyTimeTable/>
        </div>
        

      </div>
    </div>
  );
};

export default Schedule;
