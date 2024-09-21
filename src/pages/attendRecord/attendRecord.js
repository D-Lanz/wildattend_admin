import "./attendRecord.css";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { getStorage, ref, getDownloadURL } from "firebase/storage"; // Import Firebase Storage functions
import { db } from "../../firebase"; // Import your Firestore instance

const AttendRecord = () => {
  const [date, setDate] = useState(null); 
  const [attendanceData, setAttendanceData] = useState([]);
  const [classDetails, setClassDetails] = useState(null); // State to hold class details
  const [classImageUrl, setClassImageUrl] = useState(""); // State for class image URL
  const { id } = useParams(); // Use 'id' instead of 'classID'
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch class details
    const fetchClassDetails = async () => {
      try {
        console.log("Fetching details for classID:", id); // Debug the id (classID)
        if (!id) {
          throw new Error("classID is undefined or null");
        }

        // Fetch class document from Firestore
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

    fetchClassDetails();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
    // Add logic to fetch data based on selected date
  };

  const columns = [
    { field: 'userID', headerName: 'User ID', width: 150 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'timeIn', headerName: 'Time In', width: 150 },
    { field: 'timeOut', headerName: 'Time Out', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
  ];

  const formatTime = (time) => {
    if (!time) return "";
    
    const [hours, minutes] = time.split(':');
    const hours12 = hours % 12 || 12; // Convert to 12-hour format, treating 0 as 12
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
              {/* Display class details */}
              {classDetails ? (
                <>
                  {classDetails.img && (
                    <img src={classDetails.img} alt="Class" className="classImage" />
                  )}

                  <h2>{classDetails.classCode} - {classDetails.classSec} ({classDetails.schoolYear} {classDetails.semester} Sem)</h2>
                  <p>{formatTime(classDetails.startTime)} - {formatTime(classDetails.endTime)}</p>
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
                onChange={handleDateChange}
                fullWidth
              />
            </div>
          </div>
          <div className="rightColumn">
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
