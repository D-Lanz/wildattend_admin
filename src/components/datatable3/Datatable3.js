import "./datatable3.css"
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import RemoveModal from "../removeModal/RemoveModal";

const Datatable3 = ({entity, tableTitle, entityColumns, id, entityAssign}) => {
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
      } else if (location.pathname.startsWith("/accessPoints/")) {
        queryField = "accessPointID";
        queryValue = id;
      } else {
        console.error("Invalid URL path:", location.pathname);
        return;
      }
    
      try {
        if (queryField === "accessPointID") {
          // Fetch rooms based on accessPointID
          const accessPointRoomsRef = collection(db, "accessPointRooms");
          const q = query(accessPointRoomsRef, where(queryField, "==", queryValue));
          const querySnapshot = await getDocs(q);
          const fetchedData = [];
    
          for (const docSnap of querySnapshot.docs) {
            const accessPointRoomData = docSnap.data();
            const roomID = accessPointRoomData.roomID;
    
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
          // Fetch accessPoints based on accessPointID
          const accessPointRoomsRef = collection(db, "accessPointRooms");
          const q = query(accessPointRoomsRef, where(queryField, "==", queryValue));
          const querySnapshot = await getDocs(q);
          const fetchedData = [];
    
          for (const docSnap of querySnapshot.docs) {
            const accessPointRoomData = docSnap.data();
            const accessPointID = accessPointRoomData.accessPointID;
    
            // Fetch accessPoint data from "accessPoints" collection based on accessPointID
            const accessPointDocRef = doc(db, "accessPoints", accessPointID);
            const accessPointDocSnapshot = await getDoc(accessPointDocRef);
    
            if (accessPointDocSnapshot.exists()) {
              const accessPointData = accessPointDocSnapshot.data();
              const rowData = {
                id: accessPointID,
                ...accessPointData // Add other fields as needed
              };
              fetchedData.push(rowData);
            } else {
              console.error(`Document with ID ${accessPointID} does not exist`);
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

  // once the "Remove" button is deleted, it will delete the "accessPointRooms" document
  const handleRemove = async (params) => {
    setIsRemoveModalOpen(true);
    try {
      let roomID, accessPointID, targetField;
      if (location.pathname.startsWith("/rooms/")) {
        roomID = id; // Assuming id is roomID
        accessPointID = params.row.id; // Assuming params.row.id is accessPointID
        targetField = "accessPointID";
      } else if (location.pathname.startsWith("/accessPoints/")) {
        accessPointID = id; // Assuming id is accessPointID
        roomID = params.row.id; // Assuming params.row.id is roomID
        targetField = "roomID";
      } else {
        console.error("Invalid URL path:", location.pathname);
        return;
      }
  
      // Check if roomID and accessPointID are defined
      if (!roomID || !accessPointID) {
        console.error("room ID or accessPoint ID is undefined");
        return;
      }
  
      // Query the "accessPointRooms" collection for the provided roomID and accessPointID
      const accessPointRoomQuery = query(collection(db, "accessPointRooms"), where("roomID", "==", roomID), where("accessPointID", "==", accessPointID));
      const accessPointRoomSnapshot = await getDocs(accessPointRoomQuery);
  
      if (!accessPointRoomSnapshot.empty) {
        // If documents are found, delete the first one found
        const accessPointRoomDocSnap = accessPointRoomSnapshot.docs[0];
        await deleteDoc(doc(db, "accessPointRooms", accessPointRoomDocSnap.id));
        console.log("accessPointRoom document deleted successfully!");
      } else {
        console.error(`No accessPointRoom document found with roomID ${roomID} and accessPointID ${accessPointID}`);
      }
    } catch (error) {
      console.error("Error removing room accessPoint document:", error);
    }
  };
  
  const handleView = async (params) => {
    try {
      let roomID, accessPointID, targetField;
      if (location.pathname.startsWith("/rooms/")) {
        roomID = id; // Assuming id is roomID
        accessPointID = params.row.id; // Assuming params.row.id is accessPointID
        targetField = "accessPointID";
      } else if (location.pathname.startsWith("/accessPoints/")) {
        accessPointID = id; // Assuming id is accessPointID
        roomID = params.row.id; // Assuming params.row.id is roomID
        targetField = "roomID";
      } else {
        console.error("Invalid URL path:", location.pathname);
        return;
      }
  
      // Check if roomID and accessPointID are defined
      if (!roomID || !accessPointID) {
        console.error("room ID or accessPoint ID is undefined");
        return;
      }
  
      // Query the "accessPointRooms" collection for the provided roomID and accessPointID
      const accessPointRoomQuery = query(collection(db, "accessPointRooms"), where("roomID", "==", roomID), where("accessPointID", "==", accessPointID));
      const accessPointRoomSnapshot = await getDocs(accessPointRoomQuery);
  
      if (!accessPointRoomSnapshot.empty) {
        // If documents are found, navigate to the first one found
        const accessPointRoomDocSnap = accessPointRoomSnapshot.docs[0];
        navigate(`/accessPointRooms/${accessPointRoomDocSnap.id}`, { state: { rowData: { id: params.row[targetField] } } });
      } else {
        console.error(`No accessPointRoom document found with roomID ${roomID} and accessPointID ${accessPointID}`);
      }
    } catch (error) {
      console.error("Error fetching room accessPoint documents:", error);
    }
  };
  
  const actionColumn = [
    { field: "action",
      headerName: "Action",
      width: 200,
      renderCell:(params) => {
        return(
          <div accessPointName="cellAction">
            {/* <div accessPointName="viewButton" onClick={() => handleView(params)}>
              View
            </div> */}
            <div accessPointName="removeButton" onClick={() => handleRemove(params)}>
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
    <div accessPointName="datatable3">
      <div accessPointName="datatable3Title">
        {tableTitle}
        {/* MODIFY THIS ASSIGN BUTTON */}
        <Link to={`/${entityAssign}/${id}/select`} style={{ textDecoration: "none" }} accessPointName="linkdt">
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

export default Datatable3;