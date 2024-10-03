import "./single.css";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import Datatable1 from "../../components/datatable1/Datatable1";
import Datatable2 from "../../components/datatable2/Datatable2";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { getDoc, doc, collection, query, where, getDocs } from "firebase/firestore"; // Import getDocs
import { db } from "../../firebase"; // Import db from firebase

const Single = ({ entitySingle, entity, entityTable, tableTitle, entityColumns, entityAssign, entityConnect }) => {
  const { id } = useParams(); // User's document ID
  const [data, setData] = useState(null);
  const location = useLocation();
  const { rowData } = location.state || {};
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]); // For storing attendance records
  const [classesData, setClassesData] = useState([]); // For storing classes information
  const [selectedClassID, setSelectedClassID] = useState(""); // For selected class ID

  const handleBack = () => {
    navigate(-1); // Navigate back to the last page
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
        console.error('Error fetching document:', error);
      }
    };
  
    // Fetch attendance records based on the user ID
    const fetchAttendanceData = async () => {
      if (!id) return;
  
      try {
        const q = query(collection(db, "attendRecords"), where("userID", "==", id));
        const querySnapshot = await getDocs(q);
        const attendance = {};
  
        querySnapshot.forEach((doc) => {
          const record = doc.data();
          const classID = record.classID;
          const status = record.status; // "On-Time", "Late", "Absent"
  
          if (!attendance[classID]) {
            attendance[classID] = { "On-Time": 0, "Late": 0, "Absent": 0 };
          }
  
          attendance[classID][status] += 1;
        });
  
        console.log("Fetched attendance records:", attendance); // Add this log to see the attendance data
  
        // Convert attendance object to an array and store classID data
        const attendanceArray = Object.entries(attendance).map(([classID, statusCounts]) => ({
          classID,
          ...statusCounts,
        }));
  
        console.log("Attendance array for dropdown:", attendanceArray); // Add this log to see the formatted array
  
        // Ensure unique classIDs are stored in the state
        setAttendanceData(attendanceArray);
        if (attendanceArray.length > 0) {
          setSelectedClassID(attendanceArray[0].classID); // Set default selection to first class
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
  
    fetchData();
    fetchAttendanceData();
  }, [id, entity]);  

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!id) return;

      try {
        // Fetch attendance records
        const attendanceQuery = query(collection(db, "attendRecords"), where("userID", "==", id));
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const attendance = {};

        attendanceSnapshot.forEach((doc) => {
          const record = doc.data();
          const classID = record.classID;
          const timeIn = record.timeIn?.toDate(); // Convert Firestore timestamp to JS Date

          if (!attendance[classID]) {
            attendance[classID] = [];
          }

          attendance[classID].push({
            status: record.status, // "On-Time", "Late", "Absent"
            timeIn: format(timeIn, 'MM/dd/yy') // Format date
          });
        });

        console.log("Fetched attendance records:", attendance);

        const attendanceArray = Object.entries(attendance).map(([classID, records]) => ({
          classID,
          records,
        }));

        setAttendanceData(attendanceArray);
        if (attendanceArray.length > 0) {
          setSelectedClassID(attendanceArray[0].classID);
        }

        // Now fetch class details based on attendance
        const classIDs = attendanceArray.map(item => item.classID);
        const classDataPromises = classIDs.map(classID => getDoc(doc(db, "classes", classID)));

        const classDocs = await Promise.all(classDataPromises);
        const classesDetails = classDocs.map(doc => {
          if (doc.exists()) {
            const classData = doc.data();
            return {
              classID: doc.id,
              classCode: classData.classCode,
              classSec: classData.classSec,
              classType: classData.classType,
            };
          }
          return null;
        }).filter(item => item !== null); // Filter out null entries

        console.log("Fetched classes details:", classesDetails);
        setClassesData(classesDetails);

      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchAttendanceData();
  }, [id]);

  // Determine the title based on the entity
  let title;
  if (entity === 'users') {
    title = `${data?.lastName || ''}, ${data?.firstName || ''}`;
  } else if (entity === 'classes') {
    title = data?.classDesc || '';
  } else if (entity === 'rooms') {
    title = `${data?.building || ''}${data?.roomNum || ''}`;
  } else if (entity === 'accessPoints') {
    title = data?.macAddress || '';
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
                {entity === 'classes' && (
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
                        dataS.field === "days" ? (
                          Object.entries(data[dataS.field])
                            .reverse() // Reverse the array of days
                            .map(([day, checked], index, array) => (
                              <span key={day} className="itemValues">
                                {checked && `${day}${index !== array.length - 1 ? ', ' : ''}`}
                              </span>
                            ))
                        ) : (
                          data[dataS.field]
                        )
                      ) : (
                        "Loading..." // or any other placeholder
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {(entity === 'classes' || entity === 'users') && (
            <div className="rights">
              <Chart
                aspect={3 / 1}
                title="Attendance"
                data={classesData} // Pass the class data to Chart
                selectedClassID={selectedClassID}
                onClassSelect={setSelectedClassID} // Update the selected classID
                attendanceData={attendanceData} // Pass attendance data for the chart
              />
            </div>
          )}
        </div>

        <div className="bottom">
        {(entity === 'users' || entity === 'classes') ? (
          <Datatable1
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
