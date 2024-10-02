import "./datatableSelect1.css";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom"; // Import useLocation
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const DatatableSelect1 = ({ entity, tableTitle, entityColumns }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parts = location.pathname.split("/");
        const entityId = parts[parts.length - 2];

        const userClassesSnapshot = await getDocs(collection(db, "userClasses"));

        const associatedIDs = userClassesSnapshot.docs
          .filter(doc => {
            return location.pathname.startsWith("/users/") ?
              doc.data().userID === entityId :
              doc.data().classID === entityId;
          })
          .map(doc => {
            return location.pathname.startsWith("/users/") ?
              doc.data().classID :
              doc.data().userID;
          });

        const entitySnapshot = await getDocs(collection(db, entity));

        const filteredData = entitySnapshot.docs.filter(doc => !associatedIDs.includes(doc.id))
          .map(doc => ({ id: doc.id, ...doc.data() }));

        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [entity, location.pathname]);

  const handleAdd = async (params) => {
    try {
      let userID, classID, targetField;

      const parts = location.pathname.split("/");
      const entityId = parts[parts.length - 2];

      if (location.pathname.startsWith("/users/")) {
        userID = entityId;
        classID = params.row.id;
        targetField = "classID";
      } else if (location.pathname.startsWith("/classes/")) {
        classID = entityId;
        userID = params.row.id;
        targetField = "userID";
      } else {
        console.error("Invalid URL path:", location.pathname);
        return;
      }

      if (!userID || !classID) {
        console.error("User ID or class ID is undefined");
        return;
      }

      const enrollDate = new Date();

      const userClassRef = await addDoc(collection(db, "userClasses"), {
        classID: classID,
        userID: userID,
        enrollDate: enrollDate,
        attendance: []
      });

      console.log("New userClass document added with ID: ", userClassRef.id);

      navigate(`/userClasses/${userClassRef.id}`, { state: { rowData: { id: params.row[targetField] } } });
    } catch (error) {
      console.error("Error adding user class document:", error);
    }
  };

  const actionColumn = [
    { field: "action",
      headerName: "Action",
      width: 100,
      renderCell:(params) => {
        return(
          <div className="cellAction">
            <div className="viewButton" onClick={() => handleAdd(params)}>
              Add
            </div>
          </div>
        );
  }} ];

  return (
    <div className="datatableSelect1">
      <div className="datatableSelect1Title">
        {tableTitle}
      </div>
      <DataGrid
        rows={data}
        columns={[...entityColumns, ...actionColumn]}
        pageSize={5}
      />
    </div>
  );
};

export default DatatableSelect1;
