import "./connect.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
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

  const getScheduledDates = (days, startDate, endDate) => {
    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const activeDays = Object.keys(days).filter(day => days[day]);

    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (activeDays.some(day => dayMap[day] === currentDate.getDay())) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("Starting data fetch for userClasses ID:", id); // Initial log
      try {
        if (id) {
          const userClassRef = doc(db, "userClasses", id);
          const userClassDocSnap = await getDoc(userClassRef);
  
          if (userClassDocSnap.exists()) {
            console.log("userClass document found:", userClassDocSnap.data());
            const userClassDoc = userClassDocSnap.data();
            const userID = userClassDoc.userID;
            const classID = userClassDoc.classID;
  
            const userDocSnap = await getDoc(doc(db, "users", userID));
            const classDocSnap = await getDoc(doc(db, "classes", classID));
  
            if (userDocSnap.exists()) {
              console.log("User data fetched:", userDocSnap.data());
              setUserData(userDocSnap.data());
            } else {
              console.warn("No user data found for userID:", userID);
            }
  
            if (classDocSnap.exists()) {
              console.log("Class data fetched:", classDocSnap.data());
              setClassData(classDocSnap.data());
            } else {
              console.warn("No class data found for classID:", classID);
            }
  
            const classData = classDocSnap.data();
            const { days, startTime, endTime } = classData;
            const classStartDate = new Date(userClassDoc.enrollDate?.toDate());
            const currentDate = new Date();
  
            console.log("Class schedule days:", days);
            console.log("Enrollment start date:", classStartDate);
  
            // Calculate expected attendance dates
            const expectedDates = getScheduledDates(days, classStartDate, currentDate);
            console.log("Expected attendance dates calculated:", expectedDates);
  
            const attendRecordQuery = query(
              collection(db, "attendRecord"),
              where("userId", "==", userID),
              where("classId", "==", classID),
              orderBy("timeIn", "desc")
            );
            const attendRecordSnapshot = await getDocs(attendRecordQuery);
            console.log("Attendance records fetched:", attendRecordSnapshot.docs.length);
  
            // Map attendance records by date string
            const attendanceByDate = new Map();
            attendRecordSnapshot.docs.forEach((doc) => {
              const data = doc.data();
              const dateKey = data.timeIn?.toDate().toDateString();
              console.log(`Record for ${dateKey}:`, data);
              attendanceByDate.set(dateKey, {
                id: doc.id,
                timeIn: data.timeIn ? data.timeIn.toDate() : null,
                timeOut: data.timeOut ? data.timeOut.toDate() : null,
                status: data.status,
                date: data.timeIn ? data.timeIn.toDate() : dateKey,
              });
            });
  
            // Populate records including absences
            const records = expectedDates.map((date) => {
              const dateString = date.toDateString();
  
              // Calculate class's start and end time for the current date
              const classStartDateTime = new Date(date);
              const [startHours, startMinutes] = startTime.split(":").map(Number);
              classStartDateTime.setHours(startHours, startMinutes, 0, 0);
  
              const classEndDateTime = new Date(date);
              const [endHours, endMinutes] = endTime.split(":").map(Number);
              classEndDateTime.setHours(endHours, endMinutes, 0, 0);
  
              const record = attendanceByDate.get(dateString);
  
              if (record) {
                const timeIn = record.timeIn;
                if (timeIn && timeIn <= classEndDateTime) {
                  record.status = "On-Time";
                } else {
                  record.status = "Late";
                }
              } else if (currentDate >= classEndDateTime) {
                // Mark as "Absent" only if the current time is past the class's end time
                return {
                  id: dateString,
                  timeIn: "N/A",
                  timeOut: "N/A",
                  status: "Absent",
                  date: date, // Store as a Date object for sorting
                };
              }
  
              return record || null;
            }).filter(record => record !== null); // Remove null values
  
            setAttendRecords(records);
  
            // Calculate the counts for each status
            const counts = records.reduce((acc, record) => {
              const statusKey = record.status === "Present" ? "On-Time" : record.status;
              acc[statusKey] = (acc[statusKey] || 0) + 1;
              return acc;
            }, { "On-Time": 0, Late: 0, Absent: 0 });
  
            console.log("Final status counts:", counts);
            setStatusCounts(counts);
          } else {
            console.warn("No userClasses document found for ID:", id);
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

  const entityColumnsWithDate = [
    { field: 'date', headerName: 'Date', width: 200, type: 'date',
      sortComparator: (a, b) => new Date(a) - new Date(b), // Sort by date value
      valueFormatter: (params) => {
        // Format date to readable string if it's a Date object
        const date = params.value;
        return date instanceof Date ? date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' }) : date;
      },
    },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'timeIn', headerName: 'Time In', width: 300 },
    { field: 'timeOut', headerName: 'Time Out', width: 300 },
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
                columns={entityColumnsWithDate.map(column => ({ ...column, minWidth: 100 }))}
                pageSize={5}
                disableSelectionOnClick
                components={{ Toolbar: GridToolbar }}
                sortModel={[
                  {
                    field: 'date', // Make sure this matches the field name used in entityColumnsWithDate
                    sort: 'desc', // Set to descending order
                  },
                ]}
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
