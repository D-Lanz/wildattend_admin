import "./attendRecord.css";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonIcon from '@mui/icons-material/Person';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from "react";
import { TextField, div } from "@mui/material";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from 'date-fns';
import * as XLSX from 'xlsx'; // Import xlsx library
import ClassAttendanceExportModal from "./classAttendanceExport";

const AttendRecord = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [attendanceData, setAttendanceData] = useState({ faculty: [], students: [] });
  const [classDetails, setClassDetails] = useState(null); 
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState("All");
  const [selectedStudentFilter, setSelectedStudentFilter] = useState("All");
  const [facultyCounts, setFacultyCounts] = useState({ all: 0, onTime: 0, late: 0, absent: 0 });
  const [studentCounts, setStudentCounts] = useState({ all: 0, onTime: 0, late: 0, absent: 0 });
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { id } = useParams(); 
  const navigate = useNavigate();


  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        if (!id) throw new Error("classId is undefined or null");

        const classDocRef = doc(db, "classes", id);
        const classDocSnap = await getDoc(classDocRef);

        if (classDocSnap.exists()) {
          const classData = classDocSnap.data();
          setClassDetails(classData);
        } else {
          console.error("No such class document!");
        }
      } catch (error) {
        console.error("Error fetching class details:", error);
      }
    };

    const fetchAttendanceData = async () => {
      try {
        const userClassesSnapshot = await getDocs(
          query(collection(db, "userClasses"), where("classID", "==", id))
        );

        const allUserIds = userClassesSnapshot.docs.map((doc) => doc.data().userID);

        const usersSnapshot = await getDocs(collection(db, "users"));
        const allUsers = usersSnapshot.docs.map((doc) => ({
          userId: doc.id,
          ...doc.data(),
        }));

        const enrolledUsers = allUsers.filter((user) => allUserIds.includes(user.userId));

        const attendanceSnapshot = await getDocs(
          query(collection(db, "attendRecord"), where("classId", "==", id))
        );

        const attendanceMap = attendanceSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          const timeInDate = data.timeIn ? data.timeIn.toDate() : null;
          const formattedDate = timeInDate ? format(timeInDate, "yyyy-MM-dd") : null;

          if (formattedDate === date) {
            acc[data.userId] = {
              timeIn: data.timeIn ? format(data.timeIn.toDate(), "hh:mm a") : "--",
              timeOut: data.timeOut ? format(data.timeOut.toDate(), "hh:mm a") : "--",
              status: data.status || "Absent",
            };
          }
          return acc;
        }, {});

        const faculty = [];
        const students = [];

        enrolledUsers.forEach((user) => {
          const attendance = attendanceMap[user.userId] || {
            timeIn: "--",
            timeOut: "--",
            status: "Absent",
          };

          const record = {
            id: user.userId,
            lastName: user.lastName || "--",
            firstName: user.firstName || "--",
            timeIn: attendance.timeIn,
            timeOut: attendance.timeOut,
            status: attendance.status,
          };

          if (user.role === "Faculty") {
            faculty.push(record);
          } else if (user.role === "Student") {
            students.push(record);
          }
        });

        setAttendanceData({ faculty, students });
        setFacultyCount(faculty.length);
        setStudentCount(students.length);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
    
    fetchClassDetails();
    fetchAttendanceData(); 
  }, [id, date]);

  useEffect(() => {
    const calculateCounts = (data) => {
      const counts = { all: data.length, onTime: 0, late: 0, absent: 0 };
      data.forEach((row) => {
        if (row.status === "On-Time") counts.onTime++;
        else if (row.status === "Late") counts.late++;
        else if (row.status === "Absent") counts.absent++;
      });
      return counts;
    };
  
    setFacultyCounts(calculateCounts(attendanceData.faculty));
    setStudentCounts(calculateCounts(attendanceData.students));
    setFilteredFaculty(attendanceData.faculty);
    setFilteredStudents(attendanceData.students);
  }, [attendanceData]);
  
  const handleFacultyFilter = (status) => {
    setSelectedFacultyFilter(status); // Update selected filter
    if (status === "All") {
      setFilteredFaculty(attendanceData.faculty);
    } else {
      setFilteredFaculty(attendanceData.faculty.filter((row) => row.status === status));
    }
  };
  
  const handleStudentFilter = (status) => {
    setSelectedStudentFilter(status); // Update selected filter
    if (status === "All") {
      setFilteredStudents(attendanceData.students);
    } else {
      setFilteredStudents(attendanceData.students.filter((row) => row.status === status));
    }
  };  

  const handleBack = () => {
    navigate(-1);
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const exportAttendance = async (exportType) => {
    try {
      let exportData = [];
  
      // Set the file name based on export type
      let fileName;
      if (exportType === 'selected') {
        const formattedDate = format(new Date(date), 'yyyy-MM-dd');
        fileName = `${classDetails.classCode}${classDetails.classSec}_${classDetails.schoolYear}_Attendance_${formattedDate}.xlsx`;
      } else if (exportType === 'range') {
        fileName = `${classDetails.classCode}${classDetails.classSec}_${classDetails.schoolYear}_SelectedDateAttendance.xlsx`;
      } else if (exportType === 'all') {
        fileName = `${classDetails.classCode}${classDetails.classSec}_${classDetails.schoolYear}_AllDaysAttendance.xlsx`;
      }
  
      // Fetch attendance data for both students and faculty
      if (exportType === 'selected') {
        // Export for selected date
        exportData = [...attendanceData.students, ...attendanceData.faculty].map((user) => ({
          User: `${user.lastName}, ${user.firstName}`,
          TimeIn: user.timeIn || 'N/A',
          TimeOut: user.timeOut || 'N/A',
          Status: user.status,
        }));
      } else if (exportType === 'all') {
        // Fetch all attendance records for the specified class
        const attendanceRef = collection(db, "attendRecord");
        const attendanceSnapshot = await getDocs(attendanceRef);
  
        // Create a mapping of userId to names for both students and faculty
        const userMap = {};
        [...attendanceData.students, ...attendanceData.faculty].forEach((user) => {
          userMap[user.userId] = `${user.lastName}, ${user.firstName}`;
        });
  
        // Initialize attendance map for both students and faculty
        const userAttendanceMap = {};
        [...attendanceData.students, ...attendanceData.faculty].forEach((user) => {
          const userName = `${user.lastName}, ${user.firstName}`;
          userAttendanceMap[userName] = { User: userName };
        });
  
        // Initialize a set to store unique attendance dates
        const uniqueDates = new Set();
  
        // Process attendance records
        attendanceSnapshot.docs.forEach((doc) => {
          const record = doc.data();
          if (record.classId === id) {
            const timeInDate = record.timeIn ? record.timeIn.toDate() : null;
            const formattedDate = timeInDate ? format(timeInDate, 'yyyy-MM-dd') : null;
  
            if (formattedDate) {
              uniqueDates.add(formattedDate);
  
              // Update the attendance status for the user
              const userName = userMap[record.userId] || 'Unknown User';
              if (userAttendanceMap[userName]) {
                userAttendanceMap[userName][formattedDate] = record.status || 'Absent';
              }
            }
          }
        });
  
        // Convert the set to an array and sort the dates
        const dateArray = Array.from(uniqueDates).sort();
  
        // Prepare the final export data
        Object.entries(userAttendanceMap).forEach(([userName, attendance]) => {
          dateArray.forEach((date) => {
            // If there's no attendance record for the date, default to 'Absent'
            if (!attendance.hasOwnProperty(date)) {
              attendance[date] = 'Absent';
            }
          });
          exportData.push(attendance);
        });
  
        // Add the headers (User + unique dates)
        const headers = { User: 'User', ...Object.fromEntries(dateArray.map((date) => [date, date])) };
        exportData.unshift(headers);
      }
  
      // Write to Excel file
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
  
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting attendance:", error);
    }
  };
  
  const columns = [
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'timeIn', headerName: 'Time In', width: 150 },
    { field: 'timeOut', headerName: 'Time Out', width: 150 },
    { field: 'status', headerName: 'Status', width: 130 },
    {
      field: 'details',
      headerName: 'Actions',
      width:120,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="iconButton" onClick={() => navigate(`/users/${params.row.id}`)}>
            <PersonIcon />
          </div>
          <div className="iconButton" 
            onClick={async () => {
              try {
                const userClassesRef = collection(db, "userClasses");
                const userClassQuery = query(
                  userClassesRef,
                  where("classID", "==", id), // Current classID
                  where("userID", "==", params.row.id) // userID from the row
                );
                const userClassSnapshot = await getDocs(userClassQuery);
  
                if (!userClassSnapshot.empty) {
                  const userClassID = userClassSnapshot.docs[0].id; // Get the ID of the first matching document
                  navigate(`/userClasses/${userClassID}`);
                } else {
                  console.error("No matching userClass document found!");
                }
              } catch (error) {
                console.error("Error fetching userClassID:", error);
              }
            }}
          > <FolderSharedIcon /> </div>
        </div>
      ),
    },
  ];

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const hours12 = hours % 12 || 12; 
    const ampm = hours < 12 ? 'AM' : 'PM';
    return `${hours12}:${minutes} ${ampm}`;
  };

  return (
    <div className="main">
      <Sidebar />
      <div className="tempContainer">
        <Navbar />
        <div className="tempCon">
          <div className="leftColumn">
            <ArrowBackIcon onClick={handleBack} className="backButton" />
            <div className="classDetails">
              {classDetails ? (
                <>
                  {classDetails.img && (
                    <img src={classDetails.img} alt="Class" className="classImage" />
                  )}
                  <h2>{classDetails.classCode} - {classDetails.classSec} ({classDetails.schoolYear} {classDetails.semester} Sem)</h2>
                  <p>{formatTime(classDetails.startTime)} - {formatTime(classDetails.endTime)} ({classDetails.classType})</p>
                  <p>{classDetails.Ongoing ? "Ongoing" : "Not Ongoing"}</p>
                  {/* Can you add the map of classDetails.days? where days={Monday: true, Tuesday: true, Wednesday: false} */}
                </>
              ) : (
                <p>Loading class details...</p>
              )}
            </div>
            
            {/* ONLY HAS ONE DATE */}
            <div className="dateFilter">
              {/* Existing date selector */}
              <p>Select Date</p>
              <div className="selectedContainer">
                <TextField
                  id="date"
                  label="Select Date"
                  type="date"
                  value={date}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={handleDateChange}
                />
                <FileDownloadIcon className="iconButton" onClick={() => exportAttendance('selected')}/>
              </div>
              <hr/>
              <div className="customButton" onClick={() => setIsExportModalOpen(true)}> More Export Options </div>
            </div>

          </div>

          <div className="rightColumn">
            <div className="flexRow">
              <h3>
                Faculty - {selectedFacultyFilter} (
                {selectedFacultyFilter === "All"
                  ? facultyCounts.all
                  : selectedFacultyFilter === "On-Time"
                  ? facultyCounts.onTime
                  : selectedFacultyFilter === "Late"
                  ? facultyCounts.late
                  : facultyCounts.absent}
                )
              </h3>
              <div className="filterButtons">
                <div className="customButton" variant={selectedFacultyFilter === "All" ? "contained" : "outlined"} onClick={() => handleFacultyFilter("All")}>
                  All
                </div>
                <div className="customButton" variant={selectedFacultyFilter === "On-Time" ? "contained" : "outlined"} onClick={() => handleFacultyFilter("On-Time")}>
                  On-Time
                </div>
                <div className="customButton" variant={selectedFacultyFilter === "Late" ? "contained" : "outlined"} onClick={() => handleFacultyFilter("Late")}>
                  Late
                </div>
                <div className="customButton" variant={selectedFacultyFilter === "Absent" ? "contained" : "outlined"} onClick={() => handleFacultyFilter("Absent")}>
                  Absent
                </div>
              </div>
            </div>
            <div className="dataTable2">
            <DataGrid
              rows={filteredFaculty || []}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
            />

            </div>
            <div className="flexRow">
              <h3>
                Students - {selectedStudentFilter} (
                {selectedStudentFilter === "All" ? studentCounts.all
                  : selectedStudentFilter === "On-Time" ? studentCounts.onTime
                  : selectedStudentFilter === "Late" ? studentCounts.late
                  : studentCounts.absent}
                )
              </h3>
              <div className="filterButtons">
                <div className="customButton" variant={selectedStudentFilter === "All" ? "contained" : "outlined"} onClick={() => handleStudentFilter("All")}>
                  All
                </div>
                <div className="customButton" variant={selectedStudentFilter === "On-Time" ? "contained" : "outlined"} onClick={() => handleStudentFilter("On-Time")}>
                  On-Time
                </div>
                <div className="customButton" variant={selectedStudentFilter === "Late" ? "contained" : "outlined"} onClick={() => handleStudentFilter("Late")}>
                  Late
                </div>
                <div className="customButton" variant={selectedStudentFilter === "Absent" ? "contained" : "outlined"} onClick={() => handleStudentFilter("Absent")}>
                  Absent
                </div>
              </div>
            </div>

            <div className="dataTable">
            <DataGrid
              rows={filteredStudents || []}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
            />
            </div>
          </div>
        </div>
      </div>
      <ClassAttendanceExportModal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        attendanceData={attendanceData || { faculty: [], students: [] }}
        classDetails={classDetails}
      />
    </div>
  );
};

export default AttendRecord; 