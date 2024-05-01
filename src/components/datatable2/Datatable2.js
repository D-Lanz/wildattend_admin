import "./datatable2.css";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const Datatable2 = ({entity, tableTitle, entityColumns, id, entityAssign}) => {
  const navigate = useNavigate(); // Access to the navigate function
  const [data, setData] = useState([]);
  
  console.log(entity)

  useEffect(() => {
    const entityRef = doc(db, entityAssign, id); // Assuming "entity" is your collection name
    const unsub = onSnapshot(entityRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const entityData = docSnapshot.data();
        if (entityAssign === "users") {
          const classRefs = entityData.classes;
          if (classRefs && classRefs.length > 0) {
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
                setData([]);
              });
          } else {
            console.warn("User has no classes.");
            setData([]);
          }
        } else if (entityAssign === "classes") {
          const studentRefs = entityData.studentsEnrolled;
          if (studentRefs && studentRefs.length > 0) {
            Promise.all(studentRefs.map(studentRef => getDoc(studentRef)))
              .then(studentSnapshots => {
                const studentsData = studentSnapshots.map(studentSnapshot => ({
                  id: studentSnapshot.id,
                  ...studentSnapshot.data()
                }));
                setData(studentsData);
              })
              .catch(error => {
                console.error("Error fetching students:", error);
                setData([]);
              });
          } else {
            console.warn("Class has no enrolled students.");
            setData([]);
          }
        }
      } else {
        console.error(`${entityAssign} document does not exist`);
        setData([]);
      }
    }, (error) => {
      console.error(`Error fetching ${entityAssign} document:`, error);
      setData([]);
    });
  
    return () => {
      unsub();
    };
  }, [id, entity]);
  
  
  

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