import "./attendRecord.css";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { format, addDays } from 'date-fns';
import * as XLSX from 'xlsx'; // Import xlsx library
import ClassAttendanceExportModal from "./classAttendanceExport";

const AttendRecord = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);  
  const [attendanceData, setAttendanceData] = useState({ faculty: [], students: [] });
  const [classDetails, setClassDetails] = useState(null); 
  const [userCount, setUserCount] = useState(0); 
  const [studentCount, setStudentCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // Modal state

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

    const fetchUserCounts = async () => {
      try {
        let studentCount = 0;
        let facultyCount = 0;
    
        const userClassesRef = collection(db, "userClasses");
        const userClassesQuery = query(userClassesRef, where("classID", "==", id));
        const userClassesSnapshot = await getDocs(userClassesQuery);
    
        const userIds = userClassesSnapshot.docs.map(doc => doc.data().userID);
    
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
    
        usersSnapshot.forEach(doc => {
          const userData = doc.data();
          const userID = doc.id;
    
          if (userIds.includes(userID)) {
            if (userData.role === "Student") {
              studentCount++;
            } else if (userData.role === "Faculty") {
              facultyCount++;
            }
          }
        });
    
        setUserCount(userClassesSnapshot.size);
        setStudentCount(studentCount);
        setFacultyCount(facultyCount);
      } catch (error) {
        console.error("Error fetching user counts:", error);
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
    fetchUserCounts();
    fetchAttendanceData(); 
  }, [id, date]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  // New handle functions for the date range
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
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
          Status: user.status,
          TimeIn: user.timeIn || 'N/A',
          TimeOut: user.timeOut || 'N/A',
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
    { field: 'status', headerName: 'Status', width: 150 },
  ];

  const formatTime = (time) => {
    if (!time) return "";
    
    const [hours, minutes] = time.split(':');
    const hours12 = hours % 12 || 12; 
    const ampm = hours < 12 ? 'AM' : 'PM';
    
    return `${hours12}:${minutes} ${ampm}`;
  };

    // Static data for demonstration purposes
    const attendanceChartData = [
      { name: 'On-Time', value: 8 },
      { name: 'Late', value: 2 },
      { name: 'Absent', value: 5 },
    ];

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
                  {/* <hr/>
                  <p>User Count: {userCount}</p>
                  <p>Students: {studentCount}</p>
                  <p>Faculty: {facultyCount}</p> */}
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
                <FileDownloadIcon className="exportButton1" onClick={() => exportAttendance('selected')}/>
              </div>
              <hr/>
              <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setIsExportModalOpen(true)}
                  style={{ marginLeft: "10px" }}
                >
                  More Export Options
                </Button>
            </div>

          </div>

          <div className="rightColumn">
            <h2>Faculty ({facultyCount})</h2>
            <div className="dataTable2">
              <DataGrid
                rows={attendanceData.faculty || []}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
              />
            </div>
            <h2>Students ({studentCount})</h2>
            <div className="dataTable">
              <DataGrid
                rows={attendanceData.students || []}
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