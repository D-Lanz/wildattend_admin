import "./datatable.css";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns, userRows } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const Datatable = ({title}) => {

  const [data, setData] = useState([]);

  useEffect(()=>{
    const fetchData = async () => {
      let list = []
      try{
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data()})
        });
        setData(list)
        console.log(list)
      } catch(err) {
        console.log(err)
      }
    };
    fetchData()
  },[]);

  console.log(data)

  const hadnleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  }

  const actionColumn = [
    { field: "action",
      headerName: "Action",
      width: 200,
      renderCell:(params) => {
        return(
          <div className="cellAction">
            <Link to="/users/test" style={{ textDecoration:"none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div className="deleteButton">Remove</div>
          </div>
        );
  }} ];

  return(
    <div className="datatable">
      <div className="titlec">{title}</div>
      <div className="datatableTitle">
        Add New User
        <Link to="/users/new" style={{ textDecoration:"none" }} className="linkdt">
          Add New
        </Link>
      </div>
      <DataGrid
        rows={data}
        columns={userColumns.concat(actionColumn)}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 8 },
          },
        }}
        pageSizeOptions={[10, 10]}
        checkboxSelection
      />
    </div>
  )
}

export default Datatable;