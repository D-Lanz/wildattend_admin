import "./datatable2.css";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import RemoveModal from "../removeModal/RemoveModal";
// DATATABLE 2 IS FOR SINGLE2.JS ROOMS AND ACCESS POINTS

const Datatable2 = ({entity, tableTitle, entityColumns, id, entityAssign}) => {
  const navigate = useNavigate(); // Access to the navigate function
  const location = useLocation(); // Access to the current location
  const [data, setData] = useState([]);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  
  console.log(entity)

  useEffect(() => {
    const fetchData = async () => {
      let queryField, queryValue;
      if (location.pathname.startsWith("/rooms/")) {
        queryField = "roomID";
        queryValue = id;
      } else if (location.pathname.startsWith("/classes/")) {
        queryField = "classID";
        queryValue = id;
      } else {
        console.error("Invalid URL path:", location.pathname);
        return;
      }
    
      try {
        if (queryField === "classID") {
          // Fetch rooms based on classID
          const classRoomsRef = collection(db, "classRooms");
          const q = query(classRoomsRef, where(queryField, "==", queryValue));
          const querySnapshot = await getDocs(q);
          const fetchedData = [];
    
          for (const docSnap of querySnapshot.docs) {
            const roomClassData = docSnap.data();
            const roomID = roomClassData.roomID;
    
            // Fetch room data from "rooms" collection based on roomID
            const roomDocRef = doc(db, "rooms", roomID);
            const roomDocSnapshot = await getDoc(roomDocRef);
    
            if (roomDocSnapshot.exists()) {
              const roomData = roomDocSnapshot.data();
              const rowData = {
                id: roomID,
                ...roomData // Add other fields as needed
              };
              fetchedData.push(rowData);
            } else {
              console.error(`Document with ID ${roomID} does not exist`);
            }
          }
    
          setData(fetchedData);
          console.log("Fetched Data:", fetchedData); // Console.log the fetched data
        } else {
          // Fetch classes based on classID
          const classRoomsRef = collection(db, "classRooms");
          const q = query(classRoomsRef, where(queryField, "==", queryValue));
          const querySnapshot = await getDocs(q);
          const fetchedData = [];
    
          for (const docSnap of querySnapshot.docs) {
            const roomClassData = docSnap.data();
            const classID = roomClassData.classID;
    
            // Fetch class data from "classes" collection based on classID
            const classDocRef = doc(db, "classes", classID);
            const classDocSnapshot = await getDoc(classDocRef);
    
            if (classDocSnapshot.exists()) {
              const classData = classDocSnapshot.data();
              const rowData = {
                id: classID,
                ...classData // Add other fields as needed
              };
              fetchedData.push(rowData);
            } else {
              console.error(`Document with ID ${classID} does not exist`);
            }
          }
    
          setData(fetchedData);
          console.log("Fetched Data:", fetchedData); // Console.log the fetched data
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      }
    };
    

  fetchData();
}, [id, location.pathname]);

  // once the "Remove" button is deleted, it will delete the "classRooms" document
  const handleRemove = async (params) => {
    setIsRemoveModalOpen(true);
    try {
      let roomID, classID, targetField;
      if (location.pathname.startsWith("/rooms/")) {
        roomID = id; // Assuming id is roomID
        classID = params.row.id; // Assuming params.row.id is classID
        targetField = "classID";
      } else if (location.pathname.startsWith("/classes/")) {
        classID = id; // Assuming id is classID
        roomID = params.row.id; // Assuming params.row.id is roomID
        targetField = "roomID";
      } else {
        console.error("Invalid URL path:", location.pathname);
        return;
      }
  
      // Check if roomID and classID are defined
      if (!roomID || !classID) {
        console.error("room ID or class ID is undefined");
        return;
      }
  
      // Query the "classRooms" collection for the provided roomID and classID
      const roomClassQuery = query(collection(db, "classRooms"), where("roomID", "==", roomID), where("classID", "==", classID));
      const roomClassSnapshot = await getDocs(roomClassQuery);
  
      if (!roomClassSnapshot.empty) {
        // If documents are found, delete the first one found
        const roomClassDocSnap = roomClassSnapshot.docs[0];
        await deleteDoc(doc(db, "classRooms", roomClassDocSnap.id));
        console.log("roomClass document deleted successfully!");
      } else {
        console.error(`No roomClass document found with roomID ${roomID} and classID ${classID}`);
      }
    } catch (error) {
      console.error("Error removing room class document:", error);
    }
  };
  
  const handleView = async (params) => {
    try {
      let roomID, classID, targetField;
      if (location.pathname.startsWith("/rooms/")) {
        roomID = id; // Assuming id is roomID
        classID = params.row.id; // Assuming params.row.id is classID
        targetField = "classID";
      } else if (location.pathname.startsWith("/classes/")) {
        classID = id; // Assuming id is classID
        roomID = params.row.id; // Assuming params.row.id is roomID
        targetField = "roomID";
      } else {
        console.error("Invalid URL path:", location.pathname);
        return;
      }
  
      // Check if roomID and classID are defined
      if (!roomID || !classID) {
        console.error("room ID or class ID is undefined");
        return;
      }
  
      // Query the "classRooms" collection for the provided roomID and classID
      const roomClassQuery = query(collection(db, "classRooms"), where("roomID", "==", roomID), where("classID", "==", classID));
      const roomClassSnapshot = await getDocs(roomClassQuery);
  
      if (!roomClassSnapshot.empty) {
        // If documents are found, navigate to the first one found
        const roomClassDocSnap = roomClassSnapshot.docs[0];
        navigate(`/classRooms/${roomClassDocSnap.id}`, { state: { rowData: { id: params.row[targetField] } } });
      } else {
        console.error(`No roomClass document found with roomID ${roomID} and classID ${classID}`);
      }
    } catch (error) {
      console.error("Error fetching room class documents:", error);
    }
  };
  
  const actionColumn = [
    { field: "action",
      headerName: "Action",
      width: 200,
      renderCell:(params) => {
        return(
          <div className="cellAction">
            {/* <div className="viewButton" onClick={() => handleView(params)}>
              View
            </div> */}
            <div className="removeButton" onClick={() => handleRemove(params)}>
              Remove
            </div>
          </div>
        );
  }} ];

  const handleDeleteConfirm = () => {
    // Perform logout logic (e.g., clear auth token)
  };

  const handleDeleteCancel = () => {
    setIsRemoveModalOpen(false);
  };

  return(
    <div className="datatable2">
      <div className="datatable2Title">
        {tableTitle}
        {/* MODIFY THIS ASSIGN BUTTON */}
        <Link to={`/${entityAssign}/${id}/select`} style={{ textDecoration: "none" }} className="linkdt">
          Assign
        </Link>
      </div>
      <DataGrid
        rows={data}
        columns={[...entityColumns, ...actionColumn]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        // checkboxSelection
      />
      {isRemoveModalOpen && (
        <RemoveModal
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  )
}

export default Datatable2;