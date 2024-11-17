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

  const handleBack = () => {
    navigate(-1);
  };

  const getScheduledDates = (days, startDate, endDate) => {
    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const activeDays = Object.keys(days).filter(day => days[day]); // Extract active days (e.g., Monday, Wednesday)
  
    const dates = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= endDate) {
      // Check if the current day is an active day
      if (activeDays.some(day => dayMap[day] === currentDate.getDay())) {
        dates.push(new Date(currentDate)); // Add the date if it matches
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
  
    return dates;
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
  
      console.log(
        selectedClass
          ? `Fetching attendance data for class: ${selectedClass}`
          : "Fetching overall attendance data for user"
      );
  
      try {
        const counts = { "On-Time": 0, Late: 0, Absent: 0 };
        let expectedDates = [];
  
        if (selectedClass) {
          // Fetch attendance for the selected class
          const classDoc = await getDoc(doc(db, "classes", selectedClass));
          if (!classDoc.exists()) {
            console.warn(`Class with ID ${selectedClass} does not exist.`);
            return;
          }
  
          const { days, startTime, endTime } = classDoc.data(); // Include startTime and endTime from class details
          console.log("Class schedule details:", { days, startTime, endTime });
  
          const userClassRef = doc(db, "userClasses", selectedClassUserClassId);
          const userClassDocSnap = await getDoc(userClassRef);
          if (!userClassDocSnap.exists()) {
            console.warn("User-Class relationship not found.");
            return;
          }
  
          const classStartDate = new Date(userClassDocSnap.data().enrollDate?.toDate());
          const currentDate = new Date();
          expectedDates = getScheduledDates(days, classStartDate, currentDate);
  
          const attendanceQuery = query(
            collection(db, "attendRecord"),
            where("userId", "==", id),
            where("classId", "==", selectedClass),
            orderBy("timeIn", "desc")
          );
          const attendanceSnapshot = await getDocs(attendanceQuery);
          console.log("Fetched attendance records for selected class:", attendanceSnapshot.docs.length);
  
          const attendanceByDate = new Map();
          attendanceSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const dateKey = data.timeIn?.toDate().toDateString();
            attendanceByDate.set(dateKey, {
              id: doc.id,
              timeIn: data.timeIn ? data.timeIn.toDate() : null,
              status: data.status,
            });
          });
  
          expectedDates.forEach((date) => {
            const dateString = date.toDateString();
  
            // Calculate class's end time for the current date
            const classEndDateTime = new Date(date);
            const [endHours, endMinutes] = endTime.split(":").map(Number);
            classEndDateTime.setHours(endHours, endMinutes, 0, 0);
  
            const record = attendanceByDate.get(dateString);
  
            if (record) {
              const timeIn = record.timeIn;
              if (timeIn && timeIn <= classEndDateTime) {
                counts["On-Time"] += 1;
              } else {
                counts["Late"] += 1;
              }
            } else if (currentDate >= classEndDateTime) {
              // Mark as "Absent" only if the current time is past the class's end time
              counts["Absent"] += 1;
            }
          });
        } else {
          // Fetch overall attendance across all classes
          const classIdsToInclude = classOptions.map((classItem) => classItem.id);
          console.log("Class IDs to include for overall summary:", classIdsToInclude);
  
          const attendanceQuery = query(
            collection(db, "attendRecord"),
            where("userId", "==", id),
            where("classId", "in", classIdsToInclude),
            orderBy("timeIn", "desc")
          );
          const attendanceSnapshot = await getDocs(attendanceQuery);
          console.log("Fetched overall attendance records:", attendanceSnapshot.docs.length);
  
          const attendanceByDate = new Map();
          attendanceSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const dateKey = data.timeIn?.toDate().toDateString();
            attendanceByDate.set(dateKey, {
              id: doc.id,
              timeIn: data.timeIn ? data.timeIn.toDate() : null,
              status: data.status,
            });
          });
  
          classOptions.forEach((classItem) => {
            const { days, startTime, endTime } = classItem;
            const classStartDate = new Date(classItem.enrollDate?.toDate());
            const classExpectedDates = getScheduledDates(days, classStartDate, new Date());
  
            classExpectedDates.forEach((date) => {
              const dateString = date.toDateString();
  
              // Calculate class's end time for the current date
              const classEndDateTime = new Date(date);
              const [endHours, endMinutes] = endTime.split(":").map(Number);
              classEndDateTime.setHours(endHours, endMinutes, 0, 0);
  
              const record = attendanceByDate.get(dateString);
  
              if (record) {
                const timeIn = record.timeIn;
                if (timeIn && timeIn <= classEndDateTime) {
                  counts["On-Time"] += 1;
                } else {
                  counts["Late"] += 1;
                }
              } else if (currentDate >= classEndDateTime) {
                // Mark as "Absent" only if the current time is past the class's end time
                counts["Absent"] += 1;
              }
            });
          });
        }
  
        console.log("Final status summary counts:", counts);
        setStatusSummary(counts);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
  
    fetchAttendanceData();
  }, [id, selectedClass, selectedClassUserClassId, classOptions]);  

  let title = ""; // Initialize to an empty string
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
                  <option value="">Overall Attendance</option>
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
