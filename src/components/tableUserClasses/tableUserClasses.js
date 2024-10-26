import "./tableUserClasses.css";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";

const TableUserClasses = ({ entity, tableTitle, entityColumns }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
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
          .filter(doc => window.location.pathname.startsWith("/users/") ?
            doc.data().userID === entityId :
            doc.data().classID === entityId
          )
          .map(doc => window.location.pathname.startsWith("/users/") ?
            doc.data().classID :
            doc.data().userID
          );

        let filteredData = [];
        
        if (window.location.pathname.startsWith("/users/")) {
          if (userRole === "Admin") {
            // Admin: Show all classes except those already associated
            const entitySnapshot = await getDocs(collection(db, "classes"));
            filteredData = entitySnapshot.docs
              .filter(doc => !associatedIDs.includes(doc.id))
              .map(doc => ({ id: doc.id, ...doc.data() }));
          } else if (userRole === "Faculty") {
            // Faculty: Show only classes handled by the faculty
            const facultyClassesQuery = query(collection(db, "userClasses"), where("userID", "==", currentUser.uid));
            const facultyClassesSnapshot = await getDocs(facultyClassesQuery);
            const facultyClassIDs = facultyClassesSnapshot.docs.map(doc => doc.data().classID);
            
            const entitySnapshot = await getDocs(collection(db, "classes"));
            filteredData = entitySnapshot.docs
              .filter(doc => facultyClassIDs.includes(doc.id) && !associatedIDs.includes(doc.id))
              .map(doc => ({ id: doc.id, ...doc.data() }));
          }
        } else if (window.location.pathname.startsWith("/classes/")) {
          // If URL starts with /classes/, show all users except those already enrolled
          const entitySnapshot = await getDocs(collection(db, "users"));
          filteredData = entitySnapshot.docs
            .filter(doc => !associatedIDs.includes(doc.id))
            .map(doc => ({ id: doc.id, ...doc.data() }));
        }

        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [entity, window.location.pathname]);

  const handleAdd = async (params) => {
    try {
      let userID, classID, targetField;

      const parts = window.location.pathname.split("/");
      const entityId = parts[parts.length - 2];

      if (window.location.pathname.startsWith("/users/")) {
        userID = entityId;
        classID = params.row.id;
        targetField = "classID";
      } else if (window.location.pathname.startsWith("/classes/")) {
        classID = entityId;
        userID = params.row.id;
        targetField = "userID";
      } else {
        console.error("Invalid URL path:", window.location.pathname);
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
    <div className="tableUserClasses">
      <div className="tableUserClassesTitle">{tableTitle}</div>
      <DataGrid
        rows={data}
        columns={[...entityColumns, ...actionColumn]}
        pageSize={5}
      />
    </div>
  );
};

export default TableUserClasses;
