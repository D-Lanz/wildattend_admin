import "./tableClassRooms.css";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const TableClassRooms = ({ entity, tableTitle, entityColumns }) => {
  const navigate = useNavigate(); 
  const location = useLocation(); // Access location using useLocation hook
  const [data, setData] = useState([]);

  useEffect(() => {
    console.log(entity); // Inspect the value of entity
  
    const fetchData = async () => {
      try {
        // Extract the entity ID from the URL
        const parts = location.pathname.split("/");
        const entityId = parts[parts.length - 2]; // Get the second last part of the URL
  
        // Query the "classRooms" collection to get all the documents
        const classRoomsSnapshot = await getDocs(collection(db, "classRooms"));
  
        // Extract the IDs of rooms/classes already associated with the specific class/room
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
  
        // Query the entity collection (rooms/classes) to get all the documents
        const entitySnapshot = await getDocs(collection(db, entity));
  
        // Filter the data to exclude the rooms/classes that are already associated
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
  
      // Extract the entity ID from the URL
      const parts = location.pathname.split("/");
      const entityId = parts[parts.length - 2]; // Get the second last part of the URL
  
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
  
      // Check if classID and roomID are defined
      if (!classID || !roomID) {
        console.error("Class ID or room ID is undefined");
        return;
      }

      // Log the roomID and classID
      console.log("Room ID:", roomID);
      console.log("Class ID:", classID);
  
      const enrollDate = new Date();
  
      // Add a new document to the "classRooms" collection
      const roomRoomRef = await addDoc(collection(db, "classRooms"), {
        roomID: roomID,
        classID: classID,
        enrollDate: enrollDate,
        attendance: []
      });
  
      console.log("New classRoom document added with ID: ", roomRoomRef.id);
  
      navigate(-1); // Navigate back
    } catch (error) {
      console.error("Error adding class room document:", error);
    }
  };
  
  const actionColumn = [
    { field: "action",
      headerName: "Action",
      width: 100,
      renderCell:(params) => {
        return(
          <div className="cellAction">
            <div className="viewButton" onClick={() => handleAdd(params)}>
              Add
            </div>
          </div>
        );
  }} ];

  return (
    <div className="tableClassRooms">
      <div className="tableClassRoomsTitle">
        {tableTitle}
      </div>
      <DataGrid
        rows={data}
        columns={[...entityColumns, ...actionColumn]}
        pageSize={5}
      />
    </div>
  );
};

export default TableClassRooms;
