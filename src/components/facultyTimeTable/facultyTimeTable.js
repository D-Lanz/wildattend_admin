import { useState, useEffect } from "react";
import { collection, query, getDocs, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Ensure you import db from your Firebase configuration
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Button from "@mui/material/Button";
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
        // Fetch users with role "Faculty"
        const usersQuery = query(collection(db, "users"), where("role", "==", "Faculty"));
        const usersSnapshot = await getDocs(usersQuery);
        const facultyIds = usersSnapshot.docs.map(doc => doc.id);
        const userMap = new Map();

        // Fetch user details for the faculty members
        await Promise.all(facultyIds.map(async (id) => {
          const userDoc = doc(db, "users", id);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            userMap.set(id, userSnapshot.data());
          }
        }));

        // Fetch attendRecord for these faculty members
        const attendRecordQuery = query(collection(db, "attendRecord"), where("userId", "in", facultyIds));
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
              onClick={() => handleView(params.row.id)}
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
