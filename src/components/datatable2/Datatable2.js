import "./datatable2.css";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const Datatable2 = ({entity, tableTitle, entityColumns}) => {
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

  // WILL REMOVE 
  // IF "CLASSES", IT WILL REMOVE STUDENTS, NOT DELETE
  // IF "USERS", IT WILL REMOVE CLASSES ENROLLED,
  const handleRemove = async (id) => {
    try {
      
    } catch (err) {
      
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
        <Link to={`/${entity}/select`} style={{ textDecoration: "none" }} className="linkdt">
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