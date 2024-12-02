import "./facultyAttendance.css";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FormControl, InputLabel, Select, MenuItem, TextField} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FacultyAttendanceExport from "./facultyAttendanceExport";

const FacultyAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [filterText, setFilterText] = useState("");
  const [filterDate, setFilterDate] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchFacultyAttendance = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const facultyData = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.role === "Faculty");

        const attendanceSnapshot = await getDocs(collection(db, "attendRecord"));
        const allAttendanceRecords = attendanceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const classesSnapshot = await getDocs(collection(db, "classes"));
        const classesData = classesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const combinedRecords = allAttendanceRecords
          .filter((record) => facultyData.some((faculty) => faculty.id === record.userId))
          .map((record) => {
            const faculty = facultyData.find((f) => f.id === record.userId);
            const associatedClass = classesData.find((cls) => cls.id === record.classId);

            const classFormatted = associatedClass
              ? `${associatedClass.classCode}-${associatedClass.classSec} (${associatedClass.classType}|${associatedClass.schoolYear}, ${associatedClass.semester})`
              : "N/A";

            return {
              id: record.id,
              date: record.timeIn?.toDate().toLocaleDateString("default", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) || "N/A",
              rawDate: record.timeIn?.toDate() || null, // Store raw date for filtering
              idNum: faculty.idNum || "N/A",
              name: `${faculty.lastName || "N/A"}, ${faculty.firstName || "N/A"}`,
              classInfo: classFormatted,
              ongoing: associatedClass ? associatedClass.ongoing || false : false,
              status: record.status || "N/A",
              timeIn: record.timeIn
                ? record.timeIn.toDate().toLocaleTimeString("default", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A",
              timeOut: record.timeOut
                ? record.timeOut.toDate().toLocaleTimeString("default", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A",
            };
          });

        setAttendanceRecords(combinedRecords);
        setFilteredRecords(combinedRecords); // Initialize filtered records
      } catch (error) {
        console.error("Error fetching faculty attendance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyAttendance();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesSnapshot = await getDocs(collection(db, "classes"));
        const classesData = classesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setClasses(classesData);

        // Other fetch logic
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle column selection
  const handleColumnChange = (event) => {
    setSelectedColumn(event.target.value);
    setFilterDate(null); // Clear date filter if column changes
  };

  // Handle filter text change
  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  // Apply filter
  const applyFilter = () => {
    if (!selectedColumn && !filterDate) {
      setFilteredRecords(attendanceRecords);
      return;
    }
  
    let filtered = [...attendanceRecords];
  
    // Apply column filter
    if (selectedColumn) {
      if (selectedColumn === "ongoing" && filterText) {
        const filterValue = filterText === "true"; // Convert "true"/"false" string to boolean
        filtered = filtered.filter((record) => record.ongoing === filterValue);
      } else if (selectedColumn === "status" && filterText) {
        filtered = filtered.filter((record) => record.status === filterText);
      } else if (filterText) {
        filtered = filtered.filter((record) =>
          String(record[selectedColumn]).toLowerCase().includes(filterText.toLowerCase())
        );
      }
    }
  
    // Apply date filter
    if (filterDate) {
      const selectedDate = new Date(filterDate).setHours(0, 0, 0, 0); // Normalize to midnight
      filtered = filtered.filter(
        (record) => record.rawDate && record.rawDate.setHours(0, 0, 0, 0) === selectedDate
      );
    }
  
    setFilteredRecords(filtered);
  };
  
  // Clear filter
  const clearFilter = () => {
    setSelectedColumn("");
    setFilterText("");
    setFilterDate(null);
    setFilteredRecords(attendanceRecords);
  };

  // Define columns for the DataGrid
  const columns = [
    { field: "date", headerName: "Date", width: 150 },
    { field: "idNum", headerName: "ID Number", width: 150 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "classInfo", headerName: "Class", width: 300 },
    { field: "ongoing", headerName: "Ongoing", width: 100, type: "boolean" },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        let backgroundColor = "";
        let color = "#fff"; // Default text color
  
        if (params.value === "Absent") {
          backgroundColor = "red";
        } else if (params.value === "Late") {
          backgroundColor = "yellow";
          color = "#000"; // Dark text for yellow background
        } else if (params.value === "On-Time") {
          backgroundColor = "green";
        }
  
        return (
          <div
            style={{
              backgroundColor,
              color,
              padding: "5px 10px",
              width: "100%",
              height: "100%",
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    { field: "timeIn", headerName: "Time In", width: 130 },
    { field: "timeOut", headerName: "Time Out", width: 130 },
  ];

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="contentContainer">
          <div className="datatable">
            <div className="datatableTitle">
              Faculty Attendance
              <div style={{ textDecoration: "none" }} className="linkdt" onClick={() => setIsExportModalOpen(true)}>
                Export
              </div>
            </div>
            {/* FILTERING and SEARCHING */}
            <div className="filterSection">
              <FormControl variant="outlined" style={{ minWidth: 150 }}>
                <InputLabel>Filter by</InputLabel>
                <Select value={selectedColumn} onChange={handleColumnChange} label="Filter by">
                  <MenuItem value="">None</MenuItem>
                  {columns.map((column) => (
                    <MenuItem key={column.field} value={column.field}>
                      {column.headerName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedColumn === "status" && (
                <FormControl variant="outlined" style={{ minWidth: 150, marginLeft: "20px" }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={filterText} onChange={(e) => setFilterText(e.target.value)} label="Status">
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="On-Time">On-Time</MenuItem>
                    <MenuItem value="Late">Late</MenuItem>
                    <MenuItem value="Absent">Absent</MenuItem>
                  </Select>
                </FormControl>
              )}
              {selectedColumn === "ongoing" && (
                <FormControl variant="outlined" style={{ minWidth: 150, marginLeft: "20px" }}>
                  <InputLabel>Ongoing</InputLabel>
                  <Select value={filterText} onChange={(e) => setFilterText(e.target.value)} label="Ongoing">
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">True</MenuItem>
                    <MenuItem value="false">False</MenuItem>
                  </Select>
                </FormControl>
              )}
              {selectedColumn !== "status" && selectedColumn !== "ongoing" && selectedColumn !== "date" && (
                <TextField
                  label="Filter text"
                  variant="outlined"
                  value={filterText}
                  onChange={handleFilterChange}
                  style={{ flex: 1, maxWidth: "500px", marginLeft: "20px" }}
                />
              )}
              {selectedColumn === "date" && (
                <DatePicker
                  selected={filterDate}
                  onChange={(date) => setFilterDate(date)}
                  placeholderText="Select a date"
                  style={{ marginLeft: "20px" }}
                  dateFormat="MMMM d, yyyy"
                />
              )}
              <div className="customButton" onClick={applyFilter}>
                Apply
              </div>
              <div className="customButton" onClick={clearFilter}>
                Clear
              </div>
            </div>

            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={filteredRecords}
                columns={columns}
                pageSize={10}
                loading={loading}
                components={{ Toolbar: GridToolbar }}
                initialState={{
                  sorting: {
                    sortModel: [{ field: "date", sort: "desc" }],
                  },
                }}
                disableSelectionOnClick
              />
            </div>
          </div>
        </div>
      </div>
      <FacultyAttendanceExport
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        records={attendanceRecords}
        classes={classes} // Pass classes as a prop
      />


    </div>
  );
};

export default FacultyAttendance;
