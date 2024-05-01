import "./datatableSelect.css";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
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

  const handleAdd = async () => {
    try {
      if (selectedRowIds.length === 0) {
        console.log("Please select a row");
        return;
      }
  
      const userRef = doc(db, 'users', id); // Assuming 'id' is the ID of the current user
      const classesToAdd = selectedRowIds.map(rowId => {
        const selectedRow = data.find(row => row.id === rowId);
        return { id: selectedRow.id, ...selectedRow };
      });
  
      // Update the user document to add the selected classes to the classes array
      await updateDoc(userRef, {
        classes: [...entityAssign, ...classesToAdd]
      });
  
      // Retrieve the updated user document to confirm the update
      const userDoc = await doc(db, 'users', id).get();
      const updatedClasses = userDoc.data().classes;
      console.log("Updated classes array:", updatedClasses);
      
      console.log("Classes added to user's classes array:", classesToAdd);
    } catch (error) {
      console.error("Error adding classes to user's classes array:", error);
    }
  };
  
  

  return (
    <div className="datatableSelect">
      <div className="datatableSelectTitle">
        {tableTitle}
        {/* ADD BUTTON */}
        <button
          style={{ textDecoration: "none", cursor: "pointer" }}
          className="linkdt"
          onClick={handleAdd}
          disabled={selectedRowIds.length === 0} // Disable button if no row is selected
        >
          Add
        </button>
      </div>
      <DataGrid
        rows={data}
        columns={entityColumns}
        pageSize={5}
        checkboxSelection
        onSelectionModelChange={(newSelection) => {
          setSelectedRowIds(newSelection.selectionModel); // Track the selected row ids
          console.log("Selected Row Ids:", newSelection.selectionModel); // Log selected row ids
        }}
      />

    </div>
  );
};

export default DatatableSelect;