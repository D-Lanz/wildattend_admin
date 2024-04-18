
import "./datatable.css"
import { DataGrid } from '@mui/x-data-grid';
import {userColumns, userRows} from "../../datatablesource";
import { Link } from "react-router-dom";


const Datatable = ({title}) => {

  const actionColumn = [
    { field: "action",
      headerName: "Action",
      width: 200,
      renderCell:() => {
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
        rows={userRows}
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