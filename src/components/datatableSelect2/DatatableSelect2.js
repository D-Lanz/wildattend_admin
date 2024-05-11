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
  
        // Query the "userClasses" collection to get all the documents
        const userClassesSnapshot = await getDocs(collection(db, "userClasses"));
  
        // Extract the IDs of classes/users already associated with the specific user/class
        const associatedIDs = userClassesSnapshot.docs
          .filter(doc => {
            return location.pathname.startsWith("/users/") ?
              doc.data().userID === entityId :
              doc.data().classID === entityId;
          })
          .map(doc => {
            return location.pathname.startsWith("/users/") ?
              doc.data().classID :
              doc.data().userID;
          });
  
        // Query the entity collection (classes/users) to get all the documents
        const entitySnapshot = await getDocs(collection(db, entity));
  
        // Filter the data to exclude the classes/users that are already associated
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
      let userID, classID, targetField;
  
      // Extract the entity ID from the URL
      const parts = location.pathname.split("/");
      const entityId = parts[parts.length - 2]; // Get the second last part of the URL
  
      if (location.pathname.startsWith("/users/")) {
        userID = entityId; // Assuming the second last part of the URL is userID
        classID = params.row.id; // Assuming params.row.id is classID
        targetField = "classID";
      } else if (location.pathname.startsWith("/classes/")) {
        classID = entityId; // Assuming the second last part of the URL is classID
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

      // Log the classID and userID
      console.log("Class ID:", classID);
      console.log("User ID:", userID);

  
      // Get the current timestamp for enrollDate
      const enrollDate = new Date();
  
      // Add a new document to the "userClasses" collection
      const userClassRef = await addDoc(collection(db, "userClasses"), {
        classID: classID,
        userID: userID,
        enrollDate: enrollDate,
        attendance: [] // Add an empty array called "attendance"
      });
  
      console.log("New userClass document added with ID: ", userClassRef.id);
  
      // Navigate to the newly created userClass document
      navigate(`/userClasses/${userClassRef.id}`, { state: { rowData: { id: params.row[targetField] } } });
    } catch (error) {
      console.error("Error adding user class document:", error);
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
    <div className="datatableSelect2">
      <div className="datatableSelect2Title">
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