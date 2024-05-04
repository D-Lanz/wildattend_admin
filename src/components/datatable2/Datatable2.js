import "./datatable2.css";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const Datatable2 = ({entity, tableTitle, entityColumns, id, entityAssign, entityConnect}) => {
  const navigate = useNavigate(); // Access to the navigate function
  const location = useLocation(); // Access to the current location
  const [data, setData] = useState([]);
  
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

  const handleView = (id, rowData) => {
    // Navigate to the appropriate URL with both id and rowData
    navigate(`/${entityConnect}/${id}`, { state: { rowData } });
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