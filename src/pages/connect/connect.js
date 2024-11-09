import "./connect.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import DatatableRecord from "../../components/datatableRecord/DatatableRecord";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const Connect = ({ userColumns, classColumns, entityColumns, entityTable, tableTitle }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [attendRecords, setAttendRecords] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ "On-Time": 0, Late: 0, Absent: 0 });

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    };
    return new Date(date).toLocaleString(undefined, options);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const userClassRef = doc(db, "userClasses", id);
          const userClassDocSnap = await getDoc(userClassRef);

          if (userClassDocSnap.exists()) {
            const userClassDoc = userClassDocSnap.data();
            const userID = userClassDoc.userID;
            const classID = userClassDoc.classID;

            const userDocSnap = await getDoc(doc(db, "users", userID));
            const classDocSnap = await getDoc(doc(db, "classes", classID));
            if (userDocSnap.exists()) setUserData(userDocSnap.data());
            if (classDocSnap.exists()) setClassData(classDocSnap.data());

            const attendRecordQuery = query(
              collection(db, "attendRecord"),
              where("userId", "==", userID),
              where("classId", "==", classID),
              orderBy("timeIn", "desc")
            );

            const attendRecordSnapshot = await getDocs(attendRecordQuery);
            const records = attendRecordSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                timeIn: data.timeIn ? formatDateTime(data.timeIn.toDate()) : "N/A",
                timeOut: data.timeOut ? formatDateTime(data.timeOut.toDate()) : "N/A",
                status: data.status,
              };
            });

            setAttendRecords(records);

            // Calculate the counts for each status and use "On-Time" instead of "Present"
            const counts = records.reduce((acc, record) => {
              const statusKey = record.status === "Present" ? "On-Time" : record.status;
              acc[statusKey] = (acc[statusKey] || 0) + 1;
              return acc;
            }, { "On-Time": 0, Late: 0, Absent: 0 });
            setStatusCounts(counts);
          }
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  // Prepare summary data for DataGrid
  const summaryRows = [
    {
      id: 1,
      "On-Time": statusCounts["On-Time"],
      Late: statusCounts.Late,
      Absent: statusCounts.Absent,
    },
  ];

  const summaryColumns = [
    { field: "On-Time", headerName: "On-Time", width: 100 },
    { field: "Late", headerName: "Late", width: 100 },
    { field: "Absent", headerName: "Absent", width: 100 },
  ];

  return (
    <div className="connect">
      <Sidebar />
      <div className="connectContainer">
        <Navbar />
        <div className="tops">
          <div className="leftc">
            <ArrowBackIcon onClick={handleBack} className="backButton" />
            <h1 className="titles">User</h1>
            <div className="items">
              {userData && (
                <>
                  <img src={userData.img || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"} className="itemImgs" alt="Item" />
                  <div className="detailss">
                    <h1 className="itemTitles">{`${userData.lastName || ''}, ${userData.firstName || ''}`}</h1>
                    {userColumns.map(column => (
                      <div className="detailItems" key={column.field}>
                        <span className="itemKeys">{column.headerName}:</span>
                        <span className="itemValues">{userData[column.field]}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rightc">
            <h1 className="titles">Class</h1>
            <div className="items">
              {classData && classData.img ? (
                <img src={classData.img} className="itemImgs" alt="Item" />
              ) : (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"
                  className="itemImgs"
                  alt="Placeholder"
                />
              )}
              <div className="detailss">
                <h1 className="itemTitles">{classData ? classData.classDesc : ''}</h1>
                {classColumns.map((dataS) => (
                  <div className="detailItems" key={dataS.field}>
                    <span className="itemKeys">{dataS.headerName}:</span>
                    <span className="itemValues">
                      {classData && classData[dataS.field] ? (
                        dataS.field === "days" ? (
                          Object.entries(classData[dataS.field])
                            .reverse()
                            .map(([day, checked], index, array) => (
                              <span key={day} className="itemValues">
                                {checked && `${day}${index !== array.length - 1 ? ', ' : ''}`}
                              </span>
                            ))
                        ) : (
                          classData[dataS.field]
                        )
                      ) : (
                        "Loading..."
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bottomc">
          <div className="gridContainer">
            {/* Status Summary Grid */}
            <div className="statustable">
              <h2 className="datatablerecordTitle">Status Summary</h2>
              <DataGrid
                rows={summaryRows}
                columns={summaryColumns.map(column => ({ ...column, minWidth: 100 }))}
                pageSize={1}
                hideFooter
                autoHeight
                sx={{ width: '100%' }}
              />
            </div>

            {/* Attendance Records Table */}
            <div className="datatablerecord">
              <h2 className="datatablerecordTitle">{tableTitle}</h2>
              <DataGrid
                rows={attendRecords}
                columns={entityColumns.map(column => ({ ...column, minWidth: 100 }))}
                pageSize={5}
                disableSelectionOnClick
                components={{ Toolbar: GridToolbar }}
                sx={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;
