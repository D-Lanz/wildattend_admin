import "./single.css";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Datatable1 from "../../components/datatable1/Datatable1";
import Datatable2 from "../../components/datatable2/Datatable2";
import Datatable3 from "../../components/datatable3/Datatable3";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDoc, doc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AuthContext } from "../../context/AuthContext";

const Single = ({ entitySingle, entity, entityTable, tableTitle, entityColumns, entityAssign, entityConnect }) => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext); 
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

  const getScheduledDays = (days) => {
    const weekdays = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    return Object.keys(days).filter((day) => days[day] === true).map((day) => weekdays[day]);
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
          console.log(`No document found for ${entity} with ID:`, id);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    const fetchClassOptions = async () => {
      try {
        const userRoleDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", currentUser.uid)));
        const userRoleData = userRoleDoc.docs[0]?.data();

        if (!userRoleData) {
          console.error("No role data found for the logged-in user.");
          return;
        }

        if (userRoleData.role === "Admin") {
          const userClassesQuery = query(collection(db, "userClasses"), where("userID", "==", id));
          const userClassesSnapshot = await getDocs(userClassesQuery);

          const fetchedClasses = await Promise.all(
            userClassesSnapshot.docs.map(async (docSnap) => {
              const { classID } = docSnap.data();
              const classDocRef = doc(db, "classes", classID);
              const classDocSnapshot = await getDoc(classDocRef);

              if (classDocSnapshot.exists()) {
                return {
                  id: classID,
                  userClassId: docSnap.id,
                  ...classDocSnapshot.data(),
                };
              } else {
                console.error(`Class with ID ${classID} does not exist`);
                return null;
              }
            })
          );

          setClassOptions(fetchedClasses.filter((classItem) => classItem !== null));
        } else if (userRoleData.role === "Faculty") {
          const facultyClassesQuery = query(collection(db, "userClasses"), where("userID", "==", currentUser.uid));
          const facultyClassesSnapshot = await getDocs(facultyClassesQuery);
          const facultyClassIDs = facultyClassesSnapshot.docs.map((doc) => doc.data().classID);

          const selectedUserClassesQuery = query(collection(db, "userClasses"), where("userID", "==", id));
          const selectedUserClassesSnapshot = await getDocs(selectedUserClassesQuery);
          const mutualClassIDs = selectedUserClassesSnapshot.docs
            .map((doc) => doc.data().classID)
            .filter((classID) => facultyClassIDs.includes(classID));

          const fetchedMutualClasses = await Promise.all(
            mutualClassIDs.map(async (classID) => {
              const classDocRef = doc(db, "classes", classID);
              const classDocSnapshot = await getDoc(classDocRef);

              if (classDocSnapshot.exists()) {
                return {
                  id: classID,
                  userClassId: selectedUserClassesSnapshot.docs.find((doc) => doc.data().classID === classID)?.id,
                  ...classDocSnapshot.data(),
                };
              } else {
                console.error(`Class with ID ${classID} does not exist`);
                return null;
              }
            })
          );

          setClassOptions(fetchedMutualClasses.filter((classItem) => classItem !== null));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setClassOptions([]);
      }
    };

    fetchData();
    fetchClassOptions();
  }, [id, currentUser.uid]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!id) return;

      try {
        let attendanceQuery;
        const counts = { "On-Time": 0, Late: 0, Absent: 0 };
        let expectedAttendanceDays = [];

        if (entity === "users" && selectedClass) {
          attendanceQuery = query(
            collection(db, "attendRecord"),
            where("userId", "==", id),
            where("classId", "==", selectedClass)
          );

          const classDoc = await getDoc(doc(db, "classes", selectedClass));
          if (classDoc.exists()) {
            const { days, startTime, endTime } = classDoc.data();
            expectedAttendanceDays = getScheduledDays(days);
          }
        } else if (entity === "users" && !selectedClass) {
          const classIdsToInclude = classOptions.map((classItem) => classItem.id);
          attendanceQuery = query(
            collection(db, "attendRecord"),
            where("userId", "==", id),
            where("classId", "in", classIdsToInclude)
          );

          for (const classItem of classOptions) {
            const { days, startTime, endTime } = classItem;
            expectedAttendanceDays = [
              ...expectedAttendanceDays,
              ...getScheduledDays(days),
            ];
          }
        } else if (entity === "classes" && selectedDate) {
          const startDate = new Date(selectedDate);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 1);

          attendanceQuery = query(
            collection(db, "attendRecord"),
            where("classId", "==", id),
            where("timeIn", ">=", startDate),
            where("timeIn", "<", endDate)
          );
        } else if (entity === "classes") {
          attendanceQuery = query(
            collection(db, "attendRecord"),
            where("classId", "==", id)
          );
        }

        const attendanceSnapshot = await getDocs(attendanceQuery);

        attendanceSnapshot.forEach((doc) => {
          const { status } = doc.data();
          if (counts[status] !== undefined) {
            counts[status] += 1;
          }
        });

        if ((entity === "users" && !selectedClass) || (entity === "users" && selectedClass)) {
          const today = new Date();
          expectedAttendanceDays.forEach((weekday) => {
            const absenceDate = new Date(today);
            absenceDate.setDate(today.getDate() + ((7 + weekday - today.getDay()) % 7));

            const hasAttendanceRecord = attendanceSnapshot.docs.some(
              (doc) =>
                doc.data().timeIn?.toDate().toDateString() === absenceDate.toDateString()
            );

            if (!hasAttendanceRecord) counts["Absent"] += 1;
          });
        }

        setStatusSummary(counts);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchAttendanceData();
  }, [id, entity, selectedClass, selectedDate, classOptions]);

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
