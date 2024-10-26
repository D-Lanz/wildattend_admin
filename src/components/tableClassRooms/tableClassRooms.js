import "./tableClassRooms.css";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const TableClassRooms = ({ entity, tableTitle, entityColumns }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parts = location.pathname.split("/");
        const entityId = parts[parts.length - 2];

        const classRoomsSnapshot = await getDocs(collection(db, "classRooms"));

        const associatedIDs = classRoomsSnapshot.docs
          .filter(doc => {
            return location.pathname.startsWith("/classes/") ?
              doc.data().classID === entityId :
              doc.data().roomID === entityId;
          })
          .map(doc => {
            return location.pathname.startsWith("/classes/") ?
              doc.data().roomID :
              doc.data().classID;
          });

        const entitySnapshot = await getDocs(collection(db, entity));

        const filteredData = entitySnapshot.docs.filter(doc => !associatedIDs.includes(doc.id))
          .map(doc => ({ id: doc.id, ...doc.data() }));

        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [entity, location.pathname]);

  const handleAdd = async (params) => {
    try {
      let classID, roomID, targetField;

      const parts = location.pathname.split("/");
      const entityId = parts[parts.length - 2];

      if (location.pathname.startsWith("/classes/")) {
        classID = entityId;
        roomID = params.row.id;
        targetField = "roomID";
      } else if (location.pathname.startsWith("/rooms/")) {
        roomID = entityId;
        classID = params.row.id;
        targetField = "classID";
      } else {
        console.error("Invalid URL path:", location.pathname);
        return;
      }

      if (!classID || !roomID) {
        console.error("Class ID or room ID is undefined");
        return;
      }

      const enrollDate = new Date();

      const roomRoomRef = await addDoc(collection(db, "classRooms"), {
        roomID: roomID,
        classID: classID,
        enrollDate: enrollDate,
        attendance: []
      });

      console.log("New classRoom document added with ID: ", roomRoomRef.id);

      navigate(-1);
    } catch (error) {
      console.error("Error adding class room document:", error);
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

  // Filtering logic based on selected column and filter text
  const filteredData = data.filter((row) => {
    if (!selectedColumn) return true; // If no column is selected, return all data

    const normalizedFilterText = filterText.toLowerCase();
    const cellValue = String(row[selectedColumn]).toLowerCase();

    return cellValue.startsWith(normalizedFilterText); // Only include rows where cell value starts with filter text
  });

  return (
    <div className="tableClassRooms">
      <div className="tableClassRoomsTitle">{tableTitle}</div>
      <div className="filterSection">
        <FormControl variant="outlined" style={{ minWidth: 120 }}>
          <InputLabel>Filter by</InputLabel>
          <Select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} label="Filter by">
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
          onChange={(e) => setFilterText(e.target.value)}
          style={{ flex: 1, maxWidth: '500px', marginLeft: '20px' }}
        />
      </div>
      <DataGrid
        rows={filteredData} // Use filtered data for display
        columns={[...entityColumns, ...actionColumn]}
        pageSize={5}
      />
    </div>
  );
};

export default TableClassRooms;
