import "./datatablerecord.css";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const DatatableRecord = ({ entity, tableTitle, entityColumns, id }) => {
  const navigate = useNavigate(); // Access to the navigate function
  const location = useLocation(); // Access to the current location
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch data from Firestore
      const userClassesRef = doc(db, "userClasses", id);
      const userClassesDoc = await getDoc(userClassesRef);
      if (userClassesDoc.exists()) {
        const attendanceIds = userClassesDoc.data().attendance;
        if (attendanceIds && attendanceIds.length > 0) {
          const attendancePromises = attendanceIds.map(async (attendanceId) => {
            const attendanceDocRef = doc(db, "attendRecords", attendanceId);
            const attendanceDocSnap = await getDoc(attendanceDocRef);
            return attendanceDocSnap.data();
          });
          const attendanceData = await Promise.all(attendancePromises);
          setData(attendanceData);
        } else {
          console.log("Attendance data is empty!");
        }
      } else {
        console.log("No such document!");
      }
    };
  
    fetchData();
  }, [id]);
  

  const handleView = (id, rowData) => {
    // Navigate to the appropriate URL with both id and rowData
    // navigate(`/${entityConnect}/${id}`, { state: { rowData } });
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div className="viewButton" onClick={() => handleView(params.row.id)}>
              View
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatablerecord">
      <div className="datatablerecordTitle">{tableTitle}</div>
      <DataGrid
        rows={data}
        columns={[...entityColumns, ...actionColumn]}
        pageSize={5}
        checkboxSelection
      />
    </div>
  );
};

export default DatatableRecord;
