import "./datatableSelect.css";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../../firebase";

const DatatableSelect = ({ entity, tableTitle, entityColumns, id, entityAssign }) => {
  const navigate = useNavigate(); // Access to the navigate function
  const [data, setData] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]); // Track the selected row ids

  useEffect(() => {
    //LISTEN (REALTIME)
    console.log(entity); // Inspect the value of entity
    const unsub = onSnapshot(collection(db, entity), (snapShot) => {
      let list = [];
      snapShot.docs.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setData(list);
    }, (error) => {
      console.log(error);
    });
    return () => {
      unsub();
    };
  }, []);

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
      width: 200,
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
    <div className="datatableSelect">
      <div className="datatableSelectTitle">
        {tableTitle}
        {/* ADD BUTTON */}
        {/* <button
          style={{ textDecoration: "none", cursor: "pointer" }}
          className="linkdt"
          onClick={handleAdd}
          disabled={selectedRowIds.length === 0} // Disable button if no row is selected
        >
          Add
        </button> */}
      </div>
      <DataGrid
        rows={data}
        columns={[...entityColumns, ...actionColumn]}
        pageSize={5}
        // checkboxSelection
        // onSelectionModelChange={(newSelection) => {
        //   setSelectedRowIds(newSelection.selectionModel); // Track the selected row ids
        //   console.log("Selected Row Ids:", newSelection.selectionModel); // Log selected row ids
        // }}
      />

    </div>
  );
};

export default DatatableSelect;