import "./datatable2.css";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const Datatable2 = ({entity, tableTitle, entityColumns, id, entityAssign}) => {
  const navigate = useNavigate(); // Access to the navigate function
  const [data, setData] = useState([]);

  useEffect(() => {
    // Listen to changes in the user's classes array references
    const userRef = doc(db, "users", id); // Assuming "users" is your collection name for user documents
    const unsub = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const classRefs = userData.classes; // Assuming "classes" is the field containing array references to classes documents
        if (classRefs && classRefs.length > 0) {
          // Fetch data for each class reference
          Promise.all(classRefs.map(classRef => getDoc(classRef)))
            .then(classSnapshots => {
              const classesData = classSnapshots.map(classSnapshot => ({
                id: classSnapshot.id,
                ...classSnapshot.data()
              }));
              setData(classesData);
            })
            .catch(error => {
              console.error("Error fetching classes:", error);
            });
        } else {
          // If the user has no classes, setData to an empty array
          setData([]);
        }
      } else {
        // Handle case where user document doesn't exist
        console.error("User document does not exist");
      }
    }, (error) => {
      console.error("Error fetching user document:", error);
    });
  
    return () => {
      unsub();
    };
  }, [id]);
  

  // WILL REMOVE 
  // IF "CLASSES", IT WILL REMOVE STUDENTS, NOT DELETE
  // IF "USERS", IT WILL REMOVE CLASSES ENROLLED,
  const handleRemove = async (id) => {
    try {
      
    } catch (err) {
      
    }
  }

  const handleAssign = (id) => {
    
  };

  const actionColumn = [
    { field: "action",
      headerName: "Action",
      width: 200,
      renderCell:(params) => {
        return(
          <div className="cellAction">
              <div
                className="viewButton"
                onClick={() => handleView(params.row.id)}
              >View</div>
            <div
              className="removeButton"
              onClick={() => handleRemove(params.row.id)}
            >
              Remove
            </div>
          </div>
        );
  }} ];

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
        checkboxSelection
      />
    </div>
  )
}

export default Datatable2;