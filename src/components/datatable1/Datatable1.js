import "./datatable1.css";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import RemoveModal from "../removeModal/RemoveModal";
import ImportModal from "../importModal/importModal";
//DATATABLE1 IS FOR SINGLE.JS (USERS AND CLASSES)

const Datatable1 = ({entity, tableTitle, entityColumns, id, entityAssign}) => {
  const navigate = useNavigate(); // Access to the navigate function
  const location = useLocation(); // Access to the current location
  const [data, setData] = useState([]);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // New state for the modal
  
  console.log(entity)

  useEffect(() => {
    const fetchData = async () => {
      let queryField, queryValue;
      if (location.pathname.startsWith("/users/")) {
        queryField = "userID";
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
          // Fetch users based on classID
          const userClassesRef = collection(db, "userClasses");
          const q = query(userClassesRef, where(queryField, "==", queryValue));
          const querySnapshot = await getDocs(q);
          const fetchedData = [];
    
          for (const docSnap of querySnapshot.docs) {
            const userClassData = docSnap.data();
            const userID = userClassData.userID;
    
            // Fetch user data from "users" collection based on userID
            const userDocRef = doc(db, "users", userID);
            const userDocSnapshot = await getDoc(userDocRef);
    
            if (userDocSnapshot.exists()) {
              const userData = userDocSnapshot.data();
              const rowData = {
                id: userID,
                ...userData // Add other fields as needed
              };
              fetchedData.push(rowData);
            } else {
              console.error(`Document with ID ${userID} does not exist`);
            }
          }
    
          setData(fetchedData);
          console.log("Fetched Data:", fetchedData); // Console.log the fetched data
        } else {
          // Fetch classes based on classID
          const userClassesRef = collection(db, "userClasses");
          const q = query(userClassesRef, where(queryField, "==", queryValue));
          const querySnapshot = await getDocs(q);
          const fetchedData = [];
    
          for (const docSnap of querySnapshot.docs) {
            const userClassData = docSnap.data();
            const classID = userClassData.classID;
    
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

  // once the "Remove" button is deleted, it will delete the "userClasses" document
  const handleRemove = async (params) => {
    setIsRemoveModalOpen(true);
    try {
      let userID, classID, targetField;
      if (location.pathname.startsWith("/users/")) {
        userID = id; // Assuming id is userID
        classID = params.row.id; // Assuming params.row.id is classID
        targetField = "classID";
      } else if (location.pathname.startsWith("/classes/")) {
        classID = id; // Assuming id is classID
        userID = params.row.id; // Assuming params.row.id is userID
        targetField = "userID";
      } else {
        console.error("Invalid URL path:", location.pathname);
        return;
      }
  
      // Check if userID and classID are defined
      if (!userID || !classID) {
        console.error("User ID or class ID is undefined");
        return;
      }
  
      // Query the "userClasses" collection for the provided userID and classID
      const userClassQuery = query(collection(db, "userClasses"), where("userID", "==", userID), where("classID", "==", classID));
      const userClassSnapshot = await getDocs(userClassQuery);
  
      if (!userClassSnapshot.empty) {
        // If documents are found, delete the first one found
        const userClassDocSnap = userClassSnapshot.docs[0];
        await deleteDoc(doc(db, "userClasses", userClassDocSnap.id));
        console.log("UserClass document deleted successfully!");
      } else {
        console.error(`No userClass document found with userID ${userID} and classID ${classID}`);
      }
    } catch (error) {
      console.error("Error removing user class document:", error);
    }
  };
  
  const handleView = async (params) => {
    try {
      let userID, classID, targetField;
      if (location.pathname.startsWith("/users/")) {
        userID = id; // Assuming id is userID
        classID = params.row.id; // Assuming params.row.id is classID
        targetField = "classID";
      } else if (location.pathname.startsWith("/classes/")) {
        classID = id; // Assuming id is classID
        userID = params.row.id; // Assuming params.row.id is userID
        targetField = "userID";
      } else {
        console.error("Invalid URL path:", location.pathname);
        return;
      }
  
      // Check if userID and classID are defined
      if (!userID || !classID) {
        console.error("User ID or class ID is undefined");
        return;
      }
  
      // Query the "userClasses" collection for the provided userID and classID
      const userClassQuery = query(collection(db, "userClasses"), where("userID", "==", userID), where("classID", "==", classID));
      const userClassSnapshot = await getDocs(userClassQuery);
  
      if (!userClassSnapshot.empty) {
        // If documents are found, navigate to the first one found
        const userClassDocSnap = userClassSnapshot.docs[0];
        navigate(`/userClasses/${userClassDocSnap.id}`, { state: { rowData: { id: params.row[targetField] } } });
      } else {
        console.error(`No userClass document found with userID ${userID} and classID ${classID}`);
      }
    } catch (error) {
      console.error("Error fetching user class documents:", error);
    }
  };

    // Function to open the custom modal
    const handleOpenImportModal = () => {
      setIsImportModalOpen(true);
    };
  
    // Function to close the custom modal
    const handleCloseImportModal = () => {
      setIsImportModalOpen(false);
    };
  
  const actionColumn = [
    { field: "action",
      headerName: "Action",
      width: 200,
      renderCell:(params) => {
        return(
          <div className="cellAction">
            <div className="viewButton" onClick={() => handleView(params)}>
              View
            </div>
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
    <div className="datatable1">
      <div className="datatable1Title">
        {tableTitle}
        {/* MODIFY THIS ASSIGN BUTTON */}
        <Link to={`/${entityAssign}/${id}/select`} style={{ textDecoration: "none" }} className="linkdt">
          Assign
        </Link>
        
        {/* Check if the current path is /classes/ and render a button for the modal */}
        {location.pathname.startsWith('/classes/') && (
          <Link onClick={handleOpenImportModal} className="linkdt" style={{ textDecoration: "none" }}>
            Import (.csv)
          </Link>
        )}
      </div>

      <DataGrid
        rows={data}
        columns={[...entityColumns, ...actionColumn]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 }, // Updated default pageSize to 10
          },
        }}
        pageSizeOptions={[5, 10]}
      //   checkboxSelection
      />
      
      {isRemoveModalOpen && (
        <RemoveModal
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* Custom modal for /classes/ */}
      {isImportModalOpen && (
        <ImportModal 
          onClose={handleCloseImportModal} 
          classID={id} // Pass the classID to the ImportModal
        />
      )}

    </div>
  )
}

export default Datatable1;