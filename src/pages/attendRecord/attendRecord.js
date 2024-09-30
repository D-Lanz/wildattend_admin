import "./attendRecord.css";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from 'date-fns';
import * as XLSX from 'xlsx'; // Import xlsx library

const AttendRecord = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
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
        if (!id) throw new Error("classID is undefined or null");

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
    
        const userIDs = userClassesSnapshot.docs.map(doc => doc.data().userID);
    
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
    
        usersSnapshot.forEach(doc => {
          const userData = doc.data();
          const userID = doc.id;
    
          if (userIDs.includes(userID)) {
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
        const attendanceRef = collection(db, "attendRecord");
        const attendanceQuery = query(attendanceRef, where("classID", "==", id));
        const attendanceSnapshot = await getDocs(attendanceQuery);
    
        const attendanceRecords = {
          faculty: [],
          students: [],
        };
    
        const userIDs = attendanceSnapshot.docs.map(doc => doc.data().userID);
    
        if (userIDs.length > 0) {
          const usersPromises = userIDs.map(userID => getDoc(doc(db, "users", userID)));
          const usersSnapshots = await Promise.all(usersPromises);
    
          const usersMap = {};
          usersSnapshots.forEach(userDoc => {
            if (userDoc.exists()) {
              const userData = userDoc.data();
              usersMap[userDoc.id] = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
              };
            }
          });
    
          attendanceSnapshot.forEach(doc => {
            const attendanceData = doc.data();
            const userID = attendanceData.userID;
            const userData = usersMap[userID];
    
            const timeInDate = attendanceData.timeIn ? attendanceData.timeIn.toDate() : null;
            const formattedTimeInDate = timeInDate ? format(timeInDate, 'yyyy-MM-dd') : null;
    
            if (formattedTimeInDate === date) {
              const record = {
                id: doc.id,
                userID: userID,
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
        }
    
        setAttendanceData(attendanceRecords);
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

  // Export attendance as Excel file
  const exportAttendance = async (exportType) => {
    try {
      let exportData = [];
      
      // Format the date for the file name
      const formattedDate = exportType === 'selected' ? format(new Date(date), 'yyyy-MM-dd') : 'All_Days';
      
      // Construct the file name based on class details
      const fileName = `${classDetails.classCode}${classDetails.classSec}_${classDetails.schoolYear}_Attendance_${formattedDate}.xlsx`;
  
      if (exportType === 'selected') {
        // Export for selected date
        exportData = attendanceData.students.map(student => ({
          User: `${student.lastName}, ${student.firstName}`,
          Status: student.status,
          TimeIn: student.timeIn || 'N/A', // Provide default value if timeIn is missing
        }));
      } else if (exportType === 'all') {
        // Export for all class days
        const days = {}; // Stores attendance data by day
  
        attendanceData.students.forEach(student => {
          // Initialize the user entry if it doesn't exist
          if (!days[student.userID]) {
            days[student.userID] = { User: `${student.lastName}, ${student.firstName}` };
          }
  
          // Use the existing timeIn for formatting
          if (student.timeIn) {
            try {
              const timeInDate = student.timeIn.toDate(); // Convert Firestore Timestamp to JS Date object
              const attendanceDate = format(timeInDate, 'MMM. dd, yyyy'); // Format the date
              
              // Store the formatted attendance date as the key
              days[student.userID][attendanceDate] = student.status;
            } catch (error) {
              console.error("Error formatting date:", error);
              days[student.userID]['Invalid Date'] = student.status; // Handle invalid date
            }
          } else {
            // If timeIn is missing, use a placeholder for the date
            days[student.userID]['No Time In'] = student.status;
          }
        });
  
        exportData = Object.values(days); // Convert the object into an array for export
      }
  
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
  
      XLSX.writeFile(workbook, fileName); // Use the generated fileName for saving
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
                  <p>{formatTime(classDetails.startTime)} - {formatTime(classDetails.endTime)}</p>
                  <hr/>
                  <p>Total Enrolled: {userCount}</p>
                  <p>Students: {studentCount}</p>
                  <p>Faculty: {facultyCount}</p>
                </>
              ) : (
                <p>Loading class details...</p>
              )}
            </div>

            <div className="dateFilter">
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
              
              {/* Export buttons placed inside the same div */}
              <div className="exportButtons">
                <button className="exportButton1" onClick={() => exportAttendance('selected')}>
                  Export Attendance for Selected Date
                </button>
                <button className="exportButton2" onClick={() => exportAttendance('all')}>
                  Export Attendance for All Class Days
                </button>
              </div>
            </div>
          </div>

          <div className="rightColumn">
            <h2>Faculty</h2>
            <div className="dataTable2">
              <DataGrid
                rows={attendanceData.faculty || []}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
              />
            </div>
            <h2>Students</h2>
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