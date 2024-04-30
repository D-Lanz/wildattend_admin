import "./datatableSelect.css";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const DatatableSelect = ({entity, tableTitle, entityColumns, id, entityAssign}) => {
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

  return(
    <div className="datatableSelect">
      <div className="datatableSelectTitle">
        {tableTitle}
        {/* MODIFY THIS AADD BUTTON */}
        <div style={{ textDecoration: "none" }} className="linkdt">
          Add
        </div>
      </div>
      <DataGrid
        rows={data}
        // columns={[...entityColumns, ...actionColumn]}
        columns={[...entityColumns]}
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

export default DatatableSelect;