import { useState, useEffect } from "react";
import "./schedule.css";

import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import SearchBar from "../../components/searchBar/SearchBar";
import WidgetSched from "../../components/widgetSched/widgetSched";
import FacultyTimeTable from "../../components/facultyTimeTable/facultyTimeTable";
import DateTimeWidget from "../../components/dateTimeWidget/dateTimeWidget";

const Schedule = () => {
  return (
    <div className="sched">
      <Sidebar />
      <div className="schedContainer">
        <Navbar />

        {/* CLASSES DEPENDE SA WEEKDAY */}
        <div>
          <h2>Today's Classes</h2>
          <DateTimeWidget/>
          
          <div className="widgets">
            <WidgetSched />
          </div>
        </div>
        
        {/* RECENT TIME INS OF A FACULTY MEMBER */}
        <div className="tableSched">
          <FacultyTimeTable />
        </div>
      </div>
    </div>
  );
};

export default Schedule;