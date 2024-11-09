import "./single.css";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Datatable1 from "../../components/datatable1/Datatable1";
import Datatable2 from "../../components/datatable2/Datatable2";
import Datatable3 from "../../components/datatable3/Datatable3";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Single = ({ entitySingle, entity, entityTable, tableTitle, entityColumns, entityAssign, entityConnect }) => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [statusSummary, setStatusSummary] = useState({ "On-Time": 0, Late: 0, Absent: 0 });
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClassUserClassId, setSelectedClassUserClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let fetchedData = null;
        if (entity && id) {
          const docRef = doc(db, entity, id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            fetchedData = docSnap.data();
          }
        }

        if (fetchedData) {
          setData(fetchedData);
        } else {
          console.log(`No such document found for ${entity} with ID:`, id);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    // Fetch associated classes for users or dates for classes
    const fetchClassOrDateOptions = async () => {
      if (entity === "users") {
        // Fetch associated classes for the user
        const userClassesQuery = query(
          collection(db, "userClasses"),
          where("userID", "==", id)
        );
        const userClassesSnapshot = await getDocs(userClassesQuery);

        const classes = await Promise.all(
          userClassesSnapshot.docs.map(async (docSnap) => {
            const { classID } = docSnap.data();
            const classDoc = await getDoc(doc(db, "classes", classID));
            return classDoc.exists() ? { id: classID, userClassId: docSnap.id, ...classDoc.data() } : null;
          })
        );

        setClassOptions(classes.filter((c) => c !== null));
      } else if (entity === "classes") {
        // Fetch unique attendance dates for classes
        const attendanceQuery = query(
          collection(db, "attendRecord"),
          where("classId", "==", id)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);

        const uniqueDates = new Set();
        attendanceSnapshot.forEach((docSnap) => {
          const timeIn = docSnap.data().timeIn?.toDate();
          if (timeIn) {
            uniqueDates.add(new Date(timeIn.setHours(0, 0, 0, 0))); // Normalize to start of day
          }
        });

        setAttendanceDates([...uniqueDates]);
      }
    };

    fetchData();
    fetchClassOrDateOptions();
  }, [id, entity]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!id) return;

      try {
        // Filter attendance records based on selected class or date
        let attendanceQuery;
        if (entity === "users" && selectedClass) {
          attendanceQuery = query(
            collection(db, "attendRecord"),
            where("userId", "==", id),
            where("classId", "==", selectedClass)
          );
        } else if (entity === "classes" && selectedDate) {
          const startDate = new Date(selectedDate);
          const endDate = new Date(selectedDate);
          endDate.setDate(endDate.getDate() + 1);
          attendanceQuery = query(
            collection(db, "attendRecord"),
            where("classId", "==", id),
            where("timeIn", ">=", startDate),
            where("timeIn", "<", endDate)
          );
        } else {
          attendanceQuery = query(
            collection(db, "attendRecord"),
            where(entity === "users" ? "userId" : "classId", "==", id)
          );
        }

        const attendanceSnapshot = await getDocs(attendanceQuery);
        const counts = { "On-Time": 0, Late: 0, Absent: 0 };

        attendanceSnapshot.forEach((doc) => {
          const { status } = doc.data();
          if (counts[status] !== undefined) {
            counts[status] += 1;
          }
        });

        setStatusSummary(counts);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchAttendanceData();
  }, [id, entity, selectedClass, selectedDate]);

  // Determine the title based on the entity
  let title;
  if (entity === "users") {
    title = `${data?.lastName || ""}, ${data?.firstName || ""}`;
  } else if (entity === "classes") {
    title = `${data?.classDesc || ""} - ${data?.classType || ""}`;
  } else if (entity === "rooms") {
    title = `${data?.building || ""}${data?.roomNum || ""}`;
  } else if (entity === "accessPoints") {
    title = data?.macAddress || "";
  }

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="tops">
          <div className="lefts">
            <div className="navWrapper">
              <ArrowBackIcon onClick={handleBack} className="backButton" />
              <div className="editButtonWrapper">
                <Link to={`/${entity}/${id}/edit`} className="editButtons">Edit</Link>
                {entity === "classes" && (
                  <Link to={`/schedule/${id}`} className="editButtons">Attendance</Link>
                )}
              </div>
            </div>
            <h1 className="titles">Information</h1>
            <div className="items">
              {data && data.img ? (
                <img src={data.img} className="itemImgs" alt="Item" />
              ) : (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"
                  className="itemImgs"
                  alt="Placeholder"
                />
              )}
              <div className="detailss">
                <h1 className="itemTitles">{title}</h1>
                {entitySingle.map((dataS) => (
                  <div className="detailItems" key={dataS.field}>
                    <span className="itemKeys">{dataS.headerName}:</span>
                    <span className="itemValues">
                      {data && data[dataS.field] ? (
                        typeof data[dataS.field] === "object" && dataS.field === "days" ? (
                          Object.keys(data[dataS.field])
                            .filter(day => data[dataS.field][day])
                            .join(", ")
                        ) : (
                          data[dataS.field]
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

          <div className="rights">
            <h2>Status Summary</h2>
            {entity === "users" && (
              <>
                <select
                  onChange={(e) => {
                    const selected = classOptions.find(c => c.id === e.target.value);
                    setSelectedClass(e.target.value);
                    setSelectedClassUserClassId(selected ? selected.userClassId : "");
                  }}
                  value={selectedClass}
                >
                  <option value="">Select Class</option>
                  {classOptions.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.classDesc || "Class"} - {classItem.classCode || "Code"}
                    </option>
                  ))}
                </select>
                {selectedClassUserClassId && (
                  <button
                    className="connectButton"
                    onClick={() => navigate(`/userClasses/${selectedClassUserClassId}`)}
                  >
                    View
                  </button>
                )}
              </>
            )}
            {entity === "classes" && (
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                highlightDates={attendanceDates}
                placeholderText="Select a date"
                dateFormat="MMMM d, yyyy"
                inline
              />
            )}
            <p>On-Time: {statusSummary["On-Time"]}</p>
            <p>Late: {statusSummary.Late}</p>
            <p>Absent: {statusSummary.Absent}</p>
          </div>
        </div>

        <div className="bottom">
          {(entity === "users" || entity === "classes") ? (
            <Datatable1
              title={title}
              entity={entityTable}
              tableTitle={tableTitle}
              entityColumns={entityColumns}
              id={id}
              entityAssign={entityAssign}
              entityConnect={entityConnect}
            />
          ) : entity === "accessPoints" ? (
            <Datatable3 
              title={title}
              entity={entityTable}
              tableTitle={tableTitle}
              entityColumns={entityColumns}
              id={id}
              entityAssign={entityAssign}
              entityConnect={entityConnect}
            />
          ) : (
            <Datatable2
              title={title}
              entity={entityTable}
              tableTitle={tableTitle}
              entityColumns={entityColumns}
              id={id}
              entityAssign={entityAssign}
              entityConnect={entityConnect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Single;
