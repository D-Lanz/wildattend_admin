import { useState, useEffect } from "react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../../firebase"; // Ensure you import db from your Firebase configuration
import "./facultyTimeTable.css";

const FacultyTimeTable = () => {
  const [facultyRecords, setFacultyRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyRecords = async () => {
      try {
        // Fetch users with role "Faculty"
        const usersQuery = query(collection(db, "users"), where("role", "==", "Faculty"));
        const usersSnapshot = await getDocs(usersQuery);
        const facultyIds = usersSnapshot.docs.map(doc => doc.id);

        // Fetch attendRecord for these faculty members
        const attendRecordQuery = query(collection(db, "attendRecord"), where("userId", "in", facultyIds));
        const attendRecordSnapshot = await getDocs(attendRecordQuery);

        const records = attendRecordSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setFacultyRecords(records);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching faculty records:", error);
        setLoading(false);
      }
    };

    fetchFacultyRecords();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="facultyTimeTable">
      <h2>Faculty Time Table</h2>
      <table>
        <thead>
          <tr>
            <th>Class Name</th>
            <th>Time In</th>
            <th>Time Out</th>
          </tr>
        </thead>
        <tbody>
          {facultyRecords.length === 0 ? (
            <tr>
              <td colSpan="3">No records available.</td>
            </tr>
          ) : (
            facultyRecords.map(record => (
              <tr key={record.id}>
                <td>{record.className}</td>
                <td>{record.timeIn ? new Date(record.timeIn.toDate()).toLocaleTimeString() : "N/A"}</td>
                <td>{record.timeOut ? new Date(record.timeOut.toDate()).toLocaleTimeString() : "N/A"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FacultyTimeTable;
