import "./tableUserClasses.css";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import { FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import UserClassesConfirm from "./userClassesConfirm";
import UserClassesModal from "./userClassesModal";

const TableUserClasses = ({ entity, tableTitle, entityColumns }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isUserClassesModalOpen, setIsUserClassesModalOpen] = useState(false);

  const [confirmData, setConfirmData] = useState({});
  const [modalData, setModalData] = useState({
    userIdNum: "",
    classCode: "",
    classSec: "",
    classType: "",
    semester: "",
    schoolYear: "",
    userClassId: "",
  });

  const fetchData = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      // Fetch the role of the current user
      const userSnapshot = await getDocs(query(collection(db, "users"), where("__name__", "==", currentUser.uid)));
      const userRole = userSnapshot.docs[0]?.data()?.role;

      const parts = window.location.pathname.split("/");
      const entityId = parts[parts.length - 2];

      // Fetch userClasses to check existing associations
      const userClassesSnapshot = await getDocs(collection(db, "userClasses"));

      const associatedIDs = userClassesSnapshot.docs
        .filter(doc =>
          window.location.pathname.startsWith("/users/") ? doc.data().userID === entityId : doc.data().classID === entityId
        )
        .map(doc => (window.location.pathname.startsWith("/users/") ? doc.data().classID : doc.data().userID));

      let fetchedData = [];

      if (window.location.pathname.startsWith("/users/")) {
        if (userRole === "Admin") {
          // Admin: Show all classes except those already associated
          const entitySnapshot = await getDocs(collection(db, "classes"));
          fetchedData = entitySnapshot.docs
            .filter(doc => !associatedIDs.includes(doc.id))
            .map(doc => ({ id: doc.id, ...doc.data() }));
        } else if (userRole === "Faculty") {
          // Faculty: Show only classes handled by the faculty
          const facultyClassesQuery = query(collection(db, "userClasses"), where("userID", "==", currentUser.uid));
          const facultyClassesSnapshot = await getDocs(facultyClassesQuery);
          const facultyClassIDs = facultyClassesSnapshot.docs.map(doc => doc.data().classID);

          const entitySnapshot = await getDocs(collection(db, "classes"));
          fetchedData = entitySnapshot.docs
            .filter(doc => facultyClassIDs.includes(doc.id) && !associatedIDs.includes(doc.id))
            .map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } else if (window.location.pathname.startsWith("/classes/")) {
        // If URL starts with /classes/, show all users except those already enrolled
        const entitySnapshot = await getDocs(collection(db, "users"));
        fetchedData = entitySnapshot.docs
          .filter(doc => !associatedIDs.includes(doc.id))
          .map(doc => ({ id: doc.id, ...doc.data() }));
      }

      setData(fetchedData);
      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [entity, window.location.pathname]);

  const handleAdd = async (params) => {
    try {
      const parts = window.location.pathname.split("/");
      const entityId = parts[parts.length - 2];

      let userId, classId;
      let userData = {};
      let classData = {};

      if (window.location.pathname.startsWith("/users/")) {
        userId = entityId;
        classId = params.row.id;

        const classDoc = await getDoc(doc(db, "classes", classId));
        classData = classDoc.exists() ? classDoc.data() : {};
      } else if (window.location.pathname.startsWith("/classes/")) {
        classId = entityId;
        userId = params.row.id;

        const userDoc = await getDoc(doc(db, "users", userId));
        userData = userDoc.exists() ? userDoc.data() : {};
      }

      setConfirmData({
        userId,
        classId,
        firstName: userData.firstName || params.row.firstName || "N/A",
        lastName: userData.lastName || params.row.lastName || "N/A",
        classCode: classData.classCode || params.row.classCode || "N/A",
        classSec: classData.classSec || params.row.classSec || "N/A",
        classType: classData.classType || params.row.classType || "N/A",
        semester: classData.semester || params.row.semester || "N/A",
        schoolYear: classData.schoolYear || params.row.schoolYear || "N/A",
      });

      setIsConfirmModalOpen(true);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const handleConfirm = async () => {
    try {
      const { userId, classId, idNum, classCode, classSec, classType, semester, schoolYear } = confirmData;

      const userClassRef = await addDoc(collection(db, "userClasses"), {
        classID: classId,
        userID: userId,
        enrollDate: new Date(),
        attendance: [],
      });

      setModalData({
        userIdNum: idNum,
        classCode,
        classSec,
        classType,
        semester,
        schoolYear,
        userClassId: userClassRef.id,
      });

      setIsConfirmModalOpen(false); // Close the confirm modal
      setIsUserClassesModalOpen(true); // Open the success modal
    } catch (error) {
      console.error("Error enrolling user to class:", error);
    }
  };

  const handleUserClassesModalClose = () => {
    setIsUserClassesModalOpen(false);
    fetchData(); // Refresh the table
  };

  const handleColumnChange = (event) => {
    setSelectedColumn(event.target.value);
    setFilterText("");
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  const filteredData = data.filter((row) => {
    if (!selectedColumn) return true;
    const normalizedFilterText = filterText.toLowerCase();
    const cellValue = String(row[selectedColumn]).toLowerCase();
    return cellValue.startsWith(normalizedFilterText);
  });

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div className="viewButton" onClick={() => handleAdd(params)}>
              Add
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatableUC">
      <div className="datatableTitle">{tableTitle}</div>

      {/* Confirmation Modal */}
      <UserClassesConfirm
        isOpen={isConfirmModalOpen}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmModalOpen(false)}
        firstName={confirmData.firstName}
        lastName={confirmData.lastName}
        classCode={confirmData.classCode}
        classSec={confirmData.classSec}
        classType={confirmData.classType}
        semester={confirmData.semester}
        schoolYear={confirmData.schoolYear}
      />

      {/* Success Modal */}
      <UserClassesModal
        isOpen={isUserClassesModalOpen}
        onClose={handleUserClassesModalClose}
        {...modalData}
      />

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
          style={{ flex: 1, maxWidth: "500px", marginLeft: "20px" }}
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataGrid
          disableFiltersSelector
          disableColumnFilter
          disableDensitySelector
          rows={filteredData}
          columns={[...entityColumns, ...actionColumn]}
          pagination={false}
          slots={{ toolbar: GridToolbar }}
        />
      )}
    </div>
  );
};

export default TableUserClasses;
