import "./datatableSelect2.css";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const DatatableSelect2 = ({ entity, tableTitle, entityColumns }) => {
  const navigate = useNavigate(); // Access to the navigate function
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
  
        // Extract the IDs of rooms/classs already associated with the specific class/room
        const associatedIDs = classRoomsSnapshot.docs
          .filter(doc => {
            return location.pathname.startsWith("/classs/") ?
              doc.data().classID === entityId :
              doc.data().roomID === entityId;
          })
          .map(doc => {
            return location.pathname.startsWith("/classs/") ?
              doc.data().roomID :
              doc.data().classID;
          });
  
        // Query the entity collection (rooms/classs) to get all the documents
        const entitySnapshot = await getDocs(collection(db, entity));
  
        // Filter the data to exclude the rooms/classs that are already associated
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
        classID = entityId; // Assuming the second last part of the URL is classID
        roomID = params.row.id; // Assuming params.row.id is roomID
        targetField = "roomID";
      } else if (location.pathname.startsWith("/rooms/")) {
        roomID = entityId; // Assuming the second last part of the URL is roomID
        classID = params.row.id; // Assuming params.row.id is classID
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
      console.log("room ID:", roomID);
      console.log("class ID:", classID);

  
      // Get the current timestamp for enrollDate
      const enrollDate = new Date();
  
      // Add a new document to the "classRooms" collection
      const roomRoomRef = await addDoc(collection(db, "classRooms"), {
        roomID: roomID,
        classID: classID,
        enrollDate: enrollDate,
        attendance: [] // Add an empty array called "attendance"
      });
  
      console.log("New roomRoom document added with ID: ", roomRoomRef.id);
  
      // // Navigate to the newly created roomRoom document
      // navigate(`/classRooms/${roomRoomRef.id}`, { state: { rowData: { id: params.row[targetField] } } });
      navigate(-1);
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
          <div roomName="cellAction">
            <div roomName="viewButton" onClick={() => handleAdd(params)}>
              Add
            </div>
          </div>
        );
  }} ];

  return (
    <div roomName="datatableSelect2">
      <div roomName="datatableSelect2Title">
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

export default DatatableSelect2;