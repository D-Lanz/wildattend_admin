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

        if (exportType === 'selected') {
            // Export for selected date
            exportData = attendanceData.students.map(student => ({
                User: `${student.lastName}, ${student.firstName}`,
                Status: student.status,
                TimeIn: student.timeIn || 'N/A',
                TimeOut: student.timeOut || 'N/A',
            }));
        } else if (exportType === 'range') {
            // Fetch all attendance records for the specified class
            const attendanceRef = collection(db, "attendRecord");
            const attendanceSnapshot = await getDocs(attendanceRef);

            // Filter records for the specific class and date range
            const filteredRecords = attendanceSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() })) // Include document ID if needed
                .filter(record => 
                    record.classId === id &&
                    record.timeIn >= new Date(startDate) &&
                    record.timeIn <= new Date(endDate)
                );

            // Create a set to collect unique dates for the specified range
            const uniqueDates = [];
            filteredRecords.forEach(record => {
                const formattedDate = format(record.timeIn.toDate(), 'yyyy-MM-dd'); // Adjust format as needed
                if (!uniqueDates.includes(formattedDate)) {
                    uniqueDates.push(formattedDate); // Collect unique dates
                }

                // Update exportData structure
                let studentEntry = exportData.find(entry => entry.User === `${record.lastName}, ${record.firstName}`);
                if (!studentEntry) {
                    studentEntry = { User: `${record.lastName}, ${record.firstName}` };
                    exportData.push(studentEntry);
                }

                studentEntry[formattedDate] = record.status; // Set attendance status for the date
            });

            // Handle dates with no attendance (default to 'Absent')
            const defaultStatus = 'Absent';
            attendanceData.students.forEach(student => {
                if (!exportData.find(entry => entry.User === `${student.lastName}, ${student.firstName}`)) {
                    const entry = { User: `${student.lastName}, ${student.firstName}` };
                    uniqueDates.forEach(date => {
                        entry[date] = defaultStatus; // Default to 'Absent'
                    });
                    exportData.push(entry);
                }
            });

            // Ensure all entries have the same set of unique dates
            exportData.forEach(entry => {
                uniqueDates.forEach(date => {
                    if (!entry[date]) {
                        entry[date] = defaultStatus; // Default to 'Absent'
                    }
                });
            });
        } else if (exportType === 'all') {
            // Existing logic for exporting all class days
            const days = {}; // Stores attendance data by user

            // Create a set to collect unique dates
            const uniqueDates = new Set();

            attendanceData.students.forEach(student => {
                // Initialize the user entry if it doesn't exist
                if (!days[student.userId]) {
                    days[student.userId] = { User: `${student.lastName}, ${student.firstName}` };
                }

                // Process the timeIn value for date collection
                if (student.timeIn) {
                    try {
                        const timeInDate = student.timeIn.toDate(); // Convert Firestore Timestamp to JS Date object
                        const attendanceDate = format(timeInDate, 'MMM. dd, yyyy'); // Format the date
                        uniqueDates.add(attendanceDate); // Add the formatted date to the set

                        // Store the attendance status by formatted date
                        days[student.userId][attendanceDate] = student.status;
                    } catch (error) {
                        console.error("Error formatting date:", error);
                        days[student.userId]['Invalid Date'] = student.status; // Handle invalid date
                    }
                } else {
                    // If timeIn is missing, use a placeholder for the date
                    days[student.userId]['No Time In'] = student.status;
                }
            });

            // Create an array of column headers from the unique dates
            const headerColumns = Array.from(uniqueDates).sort(); // Sort dates
            headerColumns.unshift("User"); // Add "User" as the first column

            // Prepare the final export data
            exportData = Object.values(days).map(userEntry => {
                const entry = { User: userEntry.User };

                // Populate the entry with the attendance status for each unique date
                headerColumns.slice(1).forEach(date => {
                    entry[date] = userEntry[date] || 'Absent'; // Default to 'Absent' if no record
                });

                return entry;
            });
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
                  <p>{classDetails.Ongoing ? "Ongoing" : "Not Ongoing"}</p>
                  <hr/>
                  <p>User Count: {userCount}</p>
                  <p>Students: {studentCount}</p>
                  <p>Faculty: {facultyCount}</p>
                </>
              ) : (
                <p>Loading class details...</p>
              )}
            </div>

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