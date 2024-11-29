import { useState, useEffect } from "react";
import "./schedule.css";

import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import SearchBar from "../../components/searchBar/SearchBar";
import WidgetSched from "../../components/widgetSched/widgetSched";
import FacultyTimeTable from "../../components/facultyTimeTable/facultyTimeTable";
import DateTimeWidget from "../../components/dateTimeWidget/dateTimeWidget";

const Schedule = () => {
  const [currentWeekday, setCurrentWeekday] = useState("");

  useEffect(() => {
    // Get the current weekday
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    setCurrentWeekday(days[today.getDay()]);
  }, []);

  return (
    <div className="sched">
      <Sidebar />
      <div className="schedContainer">
        <Navbar />

        {/* CLASSES DEPENDE SA WEEKDAY */}
        <div>
          <p className="schedTitle">Today's Classes</p>
          <p className="currentWeekday">{currentWeekday}</p>
          <div className="widgets">
            <WidgetSched />
          </div>
          {/* Display Current Weekday */}
          
        </div>

        {/* RECENT TIME INS OF A FACULTY MEMBER */}
        {/* <div className="tableSched">
          <FacultyTimeTable />
        </div> */}
      </div>
    </div>
  );
};

export default Schedule;
