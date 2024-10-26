import "./tableUserClasses.css";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import { FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";

const TableUserClasses = ({ entity, tableTitle, entityColumns }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        // Fetch the role of the current user
        const userSnapshot = await getDocs(query(collection(db, "users"), where("__name__", "==", currentUser.uid)));
        const userRole = userSnapshot.docs[0]?.data()?.role;

        const parts = window.location.pathname.split("/");
        const entityId = parts[parts.length - 2];

        // Fetch userClasses to check existing associations
        const userClassesSnapshot = await getDocs(collection(db, "userClasses"));

        const associatedIDs = userClassesSnapshot.docs
          .filter(doc => window.location.pathname.startsWith("/users/") ?
            doc.data().userID === entityId :
            doc.data().classID === entityId
          )
          .map(doc => window.location.pathname.startsWith("/users/") ?
            doc.data().classID :
            doc.data().userID
          );

        let fetchedData = [];
        
        if (window.location.pathname.startsWith("/users/")) {
          if (userRole === "Admin") {
            // Admin: Show all classes except those already associated
            const entitySnapshot = await getDocs(collection(db, "classes"));
            fetchedData = entitySnapshot.docs
              .filter(doc => !associatedIDs.includes(doc.id))
              .map(doc => ({ id: doc.id, ...doc.data() }));
          } else if (userRole === "Faculty") {
            // Faculty: Show only classes handled by the faculty
            const facultyClassesQuery = query(collection(db, "userClasses"), where("userID", "==", currentUser.uid));
            const facultyClassesSnapshot = await getDocs(facultyClassesQuery);
            const facultyClassIDs = facultyClassesSnapshot.docs.map(doc => doc.data().classID);

            const entitySnapshot = await getDocs(collection(db, "classes"));
            fetchedData = entitySnapshot.docs
              .filter(doc => facultyClassIDs.includes(doc.id) && !associatedIDs.includes(doc.id))
              .map(doc => ({ id: doc.id, ...doc.data() }));
          }
        } else if (window.location.pathname.startsWith("/classes/")) {
          // If URL starts with /classes/, show all users except those already enrolled
          const entitySnapshot = await getDocs(collection(db, "users"));
          fetchedData = entitySnapshot.docs
            .filter(doc => !associatedIDs.includes(doc.id))
            .map(doc => ({ id: doc.id, ...doc.data() }));
        }

        setData(fetchedData);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [entity, window.location.pathname]);

  const handleColumnChange = (event) => {
    setSelectedColumn(event.target.value);
    setFilterText(""); // Clear filter text when changing the column
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  const filteredData = data.filter((row) => {
    // If no column is selected, return all data
    if (!selectedColumn) return true;

    // Normalize the filter text for case-insensitivity
    const normalizedFilterText = filterText.toLowerCase();
    const cellValue = String(row[selectedColumn]).toLowerCase();

    // Check if the cell value starts with the filter text
    return cellValue.startsWith(normalizedFilterText);
  });

  const handleAdd = async (params) => {
    try {
      let userID, classID, targetField;

      const parts = window.location.pathname.split("/");
      const entityId = parts[parts.length - 2];

      if (window.location.pathname.startsWith("/users/")) {
        userID = entityId;
        classID = params.row.id;
        targetField = "classID";
      } else if (window.location.pathname.startsWith("/classes/")) {
        classID = entityId;
        userID = params.row.id;
        targetField = "userID";
      } else {
        console.error("Invalid URL path:", window.location.pathname);
        return;
      }

      if (!userID || !classID) {
        console.error("User ID or class ID is undefined");
        return;
      }

      const enrollDate = new Date();

      const userClassRef = await addDoc(collection(db, "userClasses"), {
        classID: classID,
        userID: userID,
        enrollDate: enrollDate,
        attendance: []
      });

      console.log("New userClass document added with ID: ", userClassRef.id);

      navigate(`/userClasses/${userClassRef.id}`, { state: { rowData: { id: params.row[targetField] } } });
    } catch (error) {
      console.error("Error adding user class document:", error);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div className="viewButton" onClick={() => handleAdd(params)}>
              Add
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="tableUserClasses">
      <div className="tableUserClassesTitle">{tableTitle}</div>
      <div className="filterSection">
        <FormControl variant="outlined">
          <InputLabel>Filter by</InputLabel>
          <Select value={selectedColumn} onChange={handleColumnChange} label="Filter by">
            <MenuItem value="">None</MenuItem>
            {entityColumns.map((column) => (
              <MenuItem key={column.field} value={column.field}>
                {column.headerName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Filter text"
          variant="outlined"
          value={filterText}
          onChange={handleFilterChange}
          style={{ flex: 1, maxWidth: '500px', marginLeft: '20px' }}
        />
      </div>

      {loading ? (
        <div>Loading...</div> // Show loading indicator or placeholder
      ) : (
        <DataGrid
          disableFiltersSelector
          disableColumnFilter
          disableDensitySelector
          rows={filteredData}
          columns={[...entityColumns, ...actionColumn]}
          pagination={false} // Disable pagination
          slots={{ toolbar: GridToolbar }}
        />
      )}
    </div>
  );
};

export default TableUserClasses;
