import "./datatablelist.css";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { deleteDoc, doc, collection, getDoc, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { auth, db } from "../../firebase";
import DeleteModal from "../deleteModal/DeleteModal";
import { MenuItem, Select, TextField, InputLabel, FormControl } from "@mui/material";

const DatatableList = ({ entity, tableTitle, entityColumns }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedColumn, setSelectedColumn] = useState(entityColumns[0]?.field || ''); // Default to first column
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
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
  }, [entity]);

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  const handleColumnChange = (event) => {
    setSelectedColumn(event.target.value);
    setFilterText(''); // Clear filter text when column changes
  };

  const filteredData = data.filter((row) =>
    selectedColumn
      ? row[selectedColumn]?.toString().toLowerCase().startsWith(filterText.toLowerCase())
      : true
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteConfirm = () => {
    // Perform logout logic (e.g., clear auth token)
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async (id) => {
    setIsDeleteModalOpen(true);
    try {
      const entityDocRef = doc(db, entity, id);
      const entityDocSnapshot = await getDoc(entityDocRef);
      const entityData = entityDocSnapshot.data();
      
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
      
      const userClassesRef = collection(db, "userClasses");
      const q = query(userClassesRef, where(queryField, "==", id));
      const querySnapshot = await getDocs(q);
    
      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        const userClassDocRef = doc(db, "userClasses", doc.id);
        deletePromises.push(deleteDoc(userClassDocRef));
      });
      
      await Promise.all(deletePromises);
    
      await deleteDoc(entityDocRef);
    
      if (entity === "users") {
        await deleteUser(auth, entityData.userId);
      }
    
      console.log("Delete successful");
    } catch (err) {
      setData(data.filter((item) => item.id !== id));
      console.log(err);
    }
  };

  const handleView = (id, rowData) => {
    navigate(`/${entity}/${id}`, { state: { rowData } });
  };

  const actionColumn = [
    { field: "action",
      headerName: "",
      width: 130,
      renderCell: (params) => {
        return (
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
      }
    }
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {tableTitle}
        <Link to={`/${entity}/new`} style={{ textDecoration: "none" }} className="linkdt">
          Add New
        </Link>
      </div>
      
      <div className="filterSection">
        <FormControl variant="outlined">
          <InputLabel>Filter by</InputLabel>
          <Select
            value={selectedColumn}
            onChange={handleColumnChange}
            label="Filter by"
          >
            <MenuItem value="">None</MenuItem>
            {entityColumns.map((column) => (
              <MenuItem key={column.field} value={column.field}>
                {column.headerName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Filter text"
          variant="outlined"
          value={filterText}
          onChange={handleFilterChange}
          style={{ flex: 1, maxWidth: '500px', marginLeft: '20px' }}
        />
      </div>

      <DataGrid
        disableFiltersSelector
        disableColumnFilter
        disableDensitySelector
        rows={filteredData}
        columns={[...entityColumns, ...actionColumn]}
        pagination={false}  // Disable pagination
        slots={{ toolbar: GridToolbar }}
      />

      {isDeleteModalOpen && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}

export default DatatableList;
