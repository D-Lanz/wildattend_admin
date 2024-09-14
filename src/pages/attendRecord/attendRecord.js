import "./attendRecord.css";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import { DataGrid } from '@mui/x-data-grid'; // Ensure you have installed @mui/x-data-grid
import { useState } from "react";
import { TextField, Button } from "@mui/material"; // Importing Material UI components

const AttendRecord = () => {
  const [date, setDate] = useState(null); // State for selected date
  const [attendanceData, setAttendanceData] = useState([]); // State for attendance data

  // Example columns for DataGrid
  const columns = [
    { field: 'userID', headerName: 'User ID', width: 150 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'timeIn', headerName: 'Time In', width: 150 },
    { field: 'timeOut', headerName: 'Time Out', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    // { field: 'action', headerName: 'Action', width: 100 }
  ];

  // Example function to handle date change
  const handleDateChange = (event) => {
    setDate(event.target.value);
    // Add logic to fetch data based on selected date
  };

  return (
    <div className="main">
      <Sidebar />
      <div className="tempContainer">
        <Navbar />
        <div className="tempCon">
          <div className="leftColumn">
            <div className="classDetails">
              {/* Add classID details here */}
              <h2>Class ID: 12345</h2> {/* Example Class ID */}
            </div>

            <div className="dateFilter">
              {/* Date filter component */}
              <TextField
                id="date"
                label="Select Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                onChange={handleDateChange}
                fullWidth
              />
            </div>
          </div>
          <div className="rightColumn">
            {/* DataGrid component */}
            <div className="dataTable">
              <DataGrid
                rows={attendanceData}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendRecord;
