import { useState, useEffect } from "react";
import { collection, query, getDocs, where, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase"; // Ensure you import auth and db from Firebase config
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import "./facultyTimeTable.css";
// Utility function to format date into "August 30, 2024 at 2:21:41 AM UTC+8"
const formatDateTime = (date) => {
  if (!date) return "N/A";
  
    const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    timeZone: 'Asia/Manila',
    timeZoneName: 'short',
  };
  
    return new Intl.DateTimeFormat('en-US', options).format(date);
};
const FacultyTimeTable = () => {
  const [facultyRecords, setFacultyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFacultyRecords = async () => {
      try {
        // Get the currently authenticated user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error("No authenticated user");
          return;
        }
        // Get the current user's role from the "users" collection
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (!userDocSnapshot.exists()) {
          console.error("No user document found");
          return;
        }
        const userData = userDocSnapshot.data();
        const userRole = userData.role; // Get the current user's role
        let attendRecordQuery;
        // If user is "Faculty", fetch only their own time-in records
        if (userRole === "Faculty") {
          attendRecordQuery = query(
            collection(db, "attendRecord"),
            where("userId", "==", currentUser.uid) // Fetch records for the current user
          );
        } 
        // If user is "Admin", fetch all faculty time-in records
        else if (userRole === "Admin") {
          // Fetch users with role "Faculty"
          const facultyQuery = query(collection(db, "users"), where("role", "==", "Faculty"));
          const facultySnapshot = await getDocs(facultyQuery);
          const facultyIds = facultySnapshot.docs.map(doc => doc.id);
          attendRecordQuery = query(
            collection(db, "attendRecord"),
            where("userId", "in", facultyIds) // Fetch records for all faculty members
          );
        }
        // Execute the query and get the records
        const attendRecordSnapshot = await getDocs(attendRecordQuery);
        const records = attendRecordSnapshot.docs.map(doc => {
          const data = doc.data();
          const user = userMap.get(data.userId) || {};
          return {
            id: doc.id,
            className: data.className,
            timeIn: data.timeIn ? formatDateTime(new Date(data.timeIn.toDate())) : "N/A",
            timeOut: data.timeOut ? formatDateTime(new Date(data.timeOut.toDate())) : "N/A",
            name: `${user.lastName || ""}, ${user.firstName || ""}`.trim(),
            status: data.status,
          };
        });
        setFacultyRecords(records);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching faculty records:", error);
        setLoading(false);
      }
    };
    fetchFacultyRecords();
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }
  const handleViewClick = (id) => {
    // Handle view button click
    console.log("View button clicked for ID:", id);
    // Implement the functionality for viewing details here
  };
  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'className', headerName: 'Class Name', width: 150 },
    { field: 'timeIn', headerName: 'Time In', width: 300 },
    { field: 'timeOut', headerName: 'Time Out', width: 300 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: "action",
      headerName: "",
      width: 130,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div
              className="viewButton"
              onClick={() => handleViewClick(params.row.id)}
            >View</div>
          </div>
        );
      }
    },
  ];
  return (
    <div className="facultyTimeTable">
      <h2>Faculty Time Table</h2>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={facultyRecords}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          checkboxSelection={false}
          pagination={false}  // Disable pagination
          slots={{ toolbar: GridToolbar }}
          disableFiltersSelector
          disableColumnFilter
          disableDensitySelector
        />
      </div>
    </div>
  );
};
export default FacultyTimeTable;