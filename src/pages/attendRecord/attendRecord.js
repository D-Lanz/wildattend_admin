import "./attendRecord.css";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { format, addDays } from 'date-fns';
import * as XLSX from 'xlsx'; // Import xlsx library
import AttendancePieChart from "../../components/attendancePieChart/attendancePieChart";

const AttendRecord = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);  
  const [attendanceData, setAttendanceData] = useState([]);
  const [classDetails, setClassDetails] = useState(null); 
  const [userCount, setUserCount] = useState(0); 
  const [studentCount, setStudentCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);
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
        // 1. Fetch all user IDs (students and faculty) enrolled in the class
        const userClassesRef = collection(db, "userClasses");
        const userClassesQuery = query(userClassesRef, where("classId", "==", id));
        const userClassesSnapshot = await getDocs(userClassesQuery);
    
        console.log("userClassesSnapshot size:", userClassesSnapshot.size);
        userClassesSnapshot.docs.forEach((doc) => console.log("userClasses doc:", doc.data()));
    
        const allUserIds = userClassesSnapshot.docs.map(doc => doc.data().userId); // All enrolled user IDs
        console.log("All enrolled user IDs:", allUserIds);
    
        // 2. Fetch attendance records for those who have timed in
        const attendanceRef = collection(db, "attendRecord");
        const attendanceQuery = query(attendanceRef, where("classId", "==", id));
        const attendanceSnapshot = await getDocs(attendanceQuery);
    
        const attendanceRecords = {
          faculty: [],
          students: [],
        };
    
        const userIdsWithAttendance = attendanceSnapshot.docs.map(doc => doc.data().userId); // Users with attendance records
        const userIdsWithoutAttendance = allUserIds.filter(userId => !userIdsWithAttendance.includes(userId)); // Users without attendance
    
        console.log("User IDs with attendance records:", userIdsWithAttendance);
        console.log("User IDs without attendance records:", userIdsWithoutAttendance);
    
        // 3. Fetch user details for users with attendance records
        const usersPromisesWithAttendance = userIdsWithAttendance.map(userId => getDoc(doc(db, "users", userId)));
        const usersSnapshotsWithAttendance = await Promise.all(usersPromisesWithAttendance);
    
        const usersMapWithAttendance = {};
        usersSnapshotsWithAttendance.forEach(userDoc => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            usersMapWithAttendance[userDoc.id] = {
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role,
            };
          }
        });
    
        // 4. Process attendance records for those who have timed in
        attendanceSnapshot.forEach(doc => {
          const attendanceData = doc.data();
          const userId = attendanceData.userId;
          const userData = usersMapWithAttendance[userId];
    
          const timeInDate = attendanceData.timeIn ? attendanceData.timeIn.toDate() : null;
          const formattedTimeInDate = timeInDate ? format(timeInDate, 'yyyy-MM-dd') : null;
    
          if (formattedTimeInDate === date) {
            const record = {
              id: doc.id,
              userId: userId,
              firstName: userData ? userData.firstName : "--",
              lastName: userData ? userData.lastName : "--",
              role: userData ? userData.role : "--",
              timeIn: attendanceData.timeIn ? format(attendanceData.timeIn.toDate(), 'hh:mm a') : "--",
              timeOut: attendanceData.timeOut ? format(attendanceData.timeOut.toDate(), 'hh:mm a') : "--",
              status: attendanceData.status || "Absent",
            };
    
            if (userData && userData.role === "Faculty") {
              attendanceRecords.faculty.push(record);
            } else if (userData && userData.role === "Student") {
              attendanceRecords.students.push(record);
            }
          }
        });
    
        console.log("Attendance records after processing timed-in users:", attendanceRecords.students);
    
        // 5. Fetch user details for users without attendance records (from userClasses)
        if (userIdsWithoutAttendance.length > 0) {
          const usersPromisesWithoutAttendance = userIdsWithoutAttendance.map(userId => getDoc(doc(db, "users", userId)));
          const usersSnapshotsWithoutAttendance = await Promise.all(usersPromisesWithoutAttendance);
    
          usersSnapshotsWithoutAttendance.forEach(userDoc => {
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const record = {
                id: userDoc.id, // No attendRecord ID, so using user ID here
                userId: userDoc.id,
                firstName: userData.firstName || "--",
                lastName: userData.lastName || "--",
                role: userData.role || "--",
                timeIn: "--", // No timeIn (haven't timed in yet)
                timeOut: "--", // No timeOut
                status: "Absent", // Default to Absent for those without attendance records
              };
    
              if (userData.role === "Faculty") {
                attendanceRecords.faculty.push(record);
              } else if (userData.role === "Student") {
                attendanceRecords.students.push(record); // Ensure students are pushed to the array
              }
            }
          });
    
          console.log("Attendance records after adding users without attendance:", attendanceRecords.students);
        }
    
        // 6. Update state with attendance records
        setAttendanceData(attendanceRecords); // This should now include students with and without attendRecords
        console.log("Final attendance data set:", attendanceRecords);
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
              {/* Render the pie chart with static data
              <AttendancePieChart data={attendanceChartData} /> */}
            </div>

            {/* HAS START AND END DATE */}
            <div className="dateFilter">
              <p>Selected Date Range</p>
              {/* New date range selectors */}
              <div className="dateRangeContainer">
                <TextField
                  id="startDate"
                  label="Start Date"
                  type="date"
                  value={startDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={handleStartDateChange}
                />
                <TextField
                  id="endDate"
                  label="End Date"
                  type="date"
                  value={endDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={handleEndDateChange}
                />
                <FileDownloadIcon className="exportButton1" onClick={() => exportAttendance('range')}/>
              </div>


              {/* Export buttons */}
              <div className="exportButtons">
                <button className="exportButton2" onClick={() => exportAttendance('all')}>
                  Export Attendance for All Class Days
                </button>
              </div>
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
    </div>
  );
};

export default AttendRecord; 