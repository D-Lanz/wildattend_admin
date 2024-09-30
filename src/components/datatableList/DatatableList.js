import "./datatablelist.css";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { deleteDoc, doc, collection, getDoc, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase";
import DeleteModal from "../CRUDmodals/DeleteModal";
import { MenuItem, Select, TextField, InputLabel, FormControl } from "@mui/material";
import { getAuth, deleteUser as deleteAuthUser, onAuthStateChanged } from "firebase/auth"; // Ensure this import is included

const DatatableList = ({ entity, tableTitle, entityColumns }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedColumn, setSelectedColumn] = useState(entityColumns[0]?.field || '');
  const [filterText, setFilterText] = useState('');
  const queryParams = new URLSearchParams(location.search);
  const roleFilter = queryParams.get('role');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // Store the ID of the item to delete

  useEffect(() => {
    const unsub = onSnapshot(collection(db, entity), (snapShot) => {
      let list = [];
      snapShot.docs.forEach((doc) => {
        const data = doc.data();
        if (entity === 'users' && roleFilter) {
          if (data.role === roleFilter) {
            list.push({ id: doc.id, ...data });
          }
        } else {
          list.push({ id: doc.id, ...data });
        }
      });
      setData(list);
    }, (error) => {
      console.log(error);
    });
    return () => {
      unsub();
    };
  }, [entity, roleFilter]);

  useEffect(() => {
    if (roleFilter && entityColumns.some(col => col.field === 'role')) {
      setSelectedColumn('role');
      setFilterText(roleFilter);
    }
  }, [roleFilter, entityColumns]);

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  const handleColumnChange = (event) => {
    setSelectedColumn(event.target.value);
    setFilterText('');
  };

  const filteredData = data.filter((row) =>
    selectedColumn
      ? row[selectedColumn]?.toString().toLowerCase().startsWith(filterText.toLowerCase())
      : true
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated
        console.log("User is authenticated");
      } else {
        // User is not authenticated
        console.log("User is not authenticated");
      }
    });
  
    return unsubscribe;
  }, [auth]);

  const handleDelete = (id) => {
    setItemToDelete(id); // Store the ID of the item to delete
    console.log(id)
    setIsDeleteModalOpen(true); // Open the delete confirmation modal
  };

  const handleDeleteConfirm = async () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated, proceed with deletion
        try {
          async function deleteEntity() {
            const entityDocRef = doc(db, entity, itemToDelete);
            const entityDocSnapshot = await getDoc(entityDocRef);
            const entityData = entityDocSnapshot.data();
  
            if (!entityData) {
              console.error("Entity data not found.");
              return;
            }
  
            // Only delete if the user is the one being deleted
            if (entity === "users" && user.uid === entityData.userId) {
              await deleteDoc(entityDocRef); // Delete the Firestore document
              await deleteAuthUser(user); // Delete the user from Firebase Authentication
              console.log("User account deleted successfully from Firebase Authentication.");
            } else {
              console.error("You are not authorized to delete this account.");
              return;
            }
  
            // Delete userClasses documents associated with the user
            const userClassesRef = collection(db, "userClasses");
            const q = query(userClassesRef, where("userID", "==", itemToDelete));
            const querySnapshot = await getDocs(q);
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
  
            console.log("Delete successful");
            setData(data.filter((item) => item.id !== itemToDelete));
          }
          deleteEntity();
        } catch (err) {
          console.error("Error deleting:", err);
        } finally {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }
      } else {
        console.error("User is not authenticated.");
      }
    });
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false); // Close the modal on cancel
    setItemToDelete(null); // Clear the itemToDelete state
  };

  const handleView = (id, rowData) => {
    navigate(`/${entity}/${id}`, { state: { rowData } });
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "",
      width: 130,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div className="viewButton" onClick={() => handleView(params.row.id)}>
              View
            </div>
            <div className="deleteButton" onClick={() => handleDelete(params.row.id)}>
              Delete
            </div>
          </div>
        );
      },
    },
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
          <Select value={selectedColumn} onChange={handleColumnChange} label="Filter by">
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
        pagination={false} // Disable pagination
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