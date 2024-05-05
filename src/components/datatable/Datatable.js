import "./datatable.css";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns, classColumns } from "../../datatablesource";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const Datatable = ({entity, tableTitle, entityColumns}) => {
  const navigate = useNavigate(); // Access to the navigate function
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, entity, id)); // Change {entity} to entity
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