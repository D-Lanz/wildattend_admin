import "./attendRecord.css";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"; // Correct imports
import { db } from "../../firebase"; // Import your Firestore instance
import { format } from 'date-fns'; // Import date-fns for date formatting


const AttendRecord = () => {
  const today = format(new Date(), 'yyyy-MM-dd'); // Get today's date in 'yyyy-MM-dd' format
  const [date, setDate] = useState(today); // Initialize with today's date
  const [attendanceData, setAttendanceData] = useState([]);
  const [classDetails, setClassDetails] = useState(null); 
  const [userCount, setUserCount] = useState(0); 
  const [studentCount, setStudentCount] = useState(0); // State for student count
  const [facultyCount, setFacultyCount] = useState(0); // State for faculty count
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
          setClassDetails(classData); // Set class details
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
    
        // Fetch user classes based on the classID
        const userClassesRef = collection(db, "userClasses");
        const userClassesQuery = query(userClassesRef, where("classID", "==", id));
        const userClassesSnapshot = await getDocs(userClassesQuery);
    
        // Get all userIDs from userClasses
        const userIDs = userClassesSnapshot.docs.map(doc => doc.data().userID);
    
        // Fetch users based on collected userIDs
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
    
        // Count users based on roles
        usersSnapshot.forEach(doc => {
          const userData = doc.data();
          const userID = doc.id; // Assuming the document ID is the userID
    
          if (userIDs.includes(userID)) {
            if (userData.role === "Student") {
              studentCount++;
            } else if (userData.role === "Faculty") {
              facultyCount++;
            }
          }
        });
    
        setUserCount(userClassesSnapshot.size); // Total user count
        setStudentCount(studentCount); // Set student count
        setFacultyCount(facultyCount); // Set faculty count
      } catch (error) {
        console.error("Error fetching user counts:", error);
      }
    };
    
    const fetchAttendanceData = async () => {
      try {
        const attendanceRef = collection(db, "attendRecord");
        const attendanceQuery = query(attendanceRef, where("classID", "==", id));
        const attendanceSnapshot = await getDocs(attendanceQuery);
    
        console.log("Attendance Snapshot:", attendanceSnapshot.docs.length);
    
        const attendanceRecords = [];
    
        // Create a map for attendance data
        attendanceSnapshot.forEach(doc => {
          const attendanceData = doc.data();
          attendanceRecords.push({
            userID: attendanceData.userID, // Use userID instead of id
            timeIn: attendanceData.timeIn.toDate(), 
            timeOut: attendanceData.timeOut ? attendanceData.timeOut.toDate() : null,
            status: attendanceData.status,
          });
        });
    
        console.log("Attendance Records:", attendanceRecords);
    
        const userIDs = attendanceRecords.map(record => record.userID); // Get userIDs
        console.log("User IDs:", userIDs);
    
        if (userIDs.length > 0) {
          const usersRef = collection(db, "users");
          const usersQuery = query(usersRef, where("userID", "in", userIDs));
          const usersSnapshot = await getDocs(usersQuery);
    
          console.log("Users Snapshot:", usersSnapshot.docs.length);
    
          const usersMap = {};
          usersSnapshot.forEach(doc => {
            const userData = doc.data();
            usersMap[doc.id] = { 
              firstName: userData.firstName, 
              lastName: userData.lastName, 
              role: userData.role 
            };
          });
    
          console.log("Users Map:", usersMap);
    
          const studentRecords = [];
          const facultyRecords = [];
    
          attendanceRecords.forEach(record => {
            const userData = usersMap[record.userID]; // Use userID here
            if (userData) {
              const fullRecord = {
                userID: record.userID,
                firstName: userData.firstName,
                lastName: userData.lastName,
                timeIn: record.timeIn ? record.timeIn.toLocaleString() : "--",
                timeOut: record.timeOut ? record.timeOut.toLocaleString() : "--",
                status: record.status,
              };
    
              if (userData.role === "Student") {
                studentRecords.push(fullRecord);
              } else if (userData.role === "Faculty") {
                facultyRecords.push(fullRecord);
              }
            } else {
              console.warn(`User ID ${record.userID} not found in usersMap`); // Warn if userID is not found
            }
          });
    
          console.log("Student Records:", studentRecords);
          console.log("Faculty Records:", facultyRecords);
    
          setAttendanceData({ students: studentRecords, faculty: facultyRecords });
        } else {
          console.log("No User IDs found.");
          setAttendanceData({ students: [], faculty: [] });
        }
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
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={handleDateChange}
              fullWidth
            />
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