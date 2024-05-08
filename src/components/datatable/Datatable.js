import "./datatable.css";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { deleteDoc, doc, collection, getDoc, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { auth, db } from "../../firebase";


const Datatable = ({entity, tableTitle, entityColumns}) => {
  const navigate = useNavigate(); // Access to the navigate function
  const [data, setData] = useState([]);

  useEffect(()=>{
    //LISTEN (REALTIME)
    console.log(entity); // Inspect the value of entity
    const unsub = onSnapshot(collection(db, entity), (snapShot) => {
      let list = [];
      snapShot.docs.forEach((doc)=>{
        list.push({id:doc.id, ...doc.data()});
      }); 
      setData(list);
    },(error)=>{
      console.log(error);
    });
    return () => {
      unsub();
    };
  },[]);

  // const handleDelete = async (id) => {
  //   try {
  //     await deleteDoc(doc(db, entity, id)); // Change {entity} to entity
  //     console.log("Delete successful");
  //   } catch (err) {
  //     setData(data.filter((item) => item.id !== id));
  //     console.log(err);
  //   }
  // }

  const handleDelete = async (id) => {
    try {
      // Fetch user or class data to determine the type of entity and corresponding field name
      const entityDocRef = doc(db, entity, id);
      const entityDocSnapshot = await getDoc(entityDocRef);
      const entityData = entityDocSnapshot.data();
      
      // Determine the field name based on the entity type (users or classes)
      let queryField;
      if (entity === "users") {
        queryField = "userID";
      } else if (entity === "classes") {
        queryField = "classID";
      } else if (entity === "rooms") {
        queryField = "roomID";
      } else if (entity === "accessPoints") {
        queryField = "accessPointID";
      } else {
        console.error("Invalid entity type:", entity);
        return;
      }
      
      // Fetch associated userClasses documents
      const userClassesRef = collection(db, "userClasses");
      const q = query(userClassesRef, where(queryField, "==", id));
      const querySnapshot = await getDocs(q);
    
      // Delete each associated userClasses document
      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        //const userClassDocRef = doc(db, "userClasses", doc.id); // Change `doc(db, ...)` to `doc(userClassesRef, ...)`
        const userClassDocRef = doc(db, "userClasses", doc.id);
        deletePromises.push(deleteDoc(userClassDocRef));
      });
      
      // Wait for all delete operations to complete
      await Promise.all(deletePromises);
    
      // Delete the user or class document
      await deleteDoc(entityDocRef);
    
      // If entity is users, also delete the user account from Firebase Authentication
      if (entity === "users") {
        await deleteUser(auth, entityData.userId);
      }
    
      console.log("Delete successful");
    } catch (err) {
      setData(data.filter((item) => item.id !== id));
      console.log(err);
    }
  }

  const handleView = (id, rowData) => {
    // Navigate to the appropriate URL with both id and rowData
    navigate(`/${entity}/${id}`, { state: { rowData } });
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
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
  }} ];

  return(
    <div className="datatable">
      <div className="datatableTitle">
        {tableTitle}
        <Link to={`/${entity}/new`} style={{ textDecoration: "none" }} className="linkdt">
          Add New
        </Link>
      </div>
      <DataGrid
        rows={data}
        columns={[...entityColumns, ...actionColumn]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 8 },
          },
        }}
        pageSizeOptions={[8, 10]}
        // checkboxSelection
      />
    </div>
  )
}

export default Datatable;