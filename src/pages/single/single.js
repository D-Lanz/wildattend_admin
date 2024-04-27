import "./single.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import Datatable from "../../components/datatable/Datatable";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore"; // Import getDoc and doc from Firestore
import { db } from "../../firebase"; // Import db from firebase


const Single = ({ entityColumns, entity }) => {
  const { id } = useParams(); // Access the ID parameter from the URL
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let fetchedData = null;
        if (entity) { // Add a conditional check for entity
          switch (entity) {
            case "users":
              const userDocRef = doc(db, 'users', idNum);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                fetchedData = userDocSnap.data();
              }
              break;
            case "classes":
              const classDocRef = doc(db, 'classes', id);
              const classDocSnap = await getDoc(classDocRef);
              if (classDocSnap.exists()) {
                fetchedData = classDocSnap.data();
              }
              break;
            // Add cases for other collections as needed
            default:
              console.log("Unknown entity:", entity);
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
  
    fetchData();
  }, [id, entity]); // Make sure to include entity in the dependency array
  

  console.log("entityColumns:", entityColumns); // Add this debug statement
  console.log("entity:", entity); // Add this debug statement
  console.log("id:", id); // Add this debug statement
  console.log("data:", data); // Add this debug statement


  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="tops">
          <div className="lefts">
            <div className="editButtons">Edit Account</div>
            <h1 className="titles">Information</h1>
            <div className="items">
              <img
                src="https://img.game8.co/3619988/99ba4ee9abf0e4a88d54da22b63455ee.png/show"
                className="itemImgs"
              />
              <div className="detailss">
                {entityColumns.map((column) => (
                  <div className="detailItems" key={column.field}>
                    <span className="itemKeys">{column.headerName}:</span>
                    <span className="itemValues">
                      {data}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* <div className="deleteButtons">Delete Account</div> */}
          </div>
          <div className="rights">
            <form>
              <label htmlFor="courses">Course:</label>
              <select id="courses" name="courses">
                <option value="CSIT111">CSIT111</option>
                <option value="CSIT222">CSIT222</option>
                <option value="CSIT333">CSIT333</option>
                <option value="CSIT444">CSIT444</option>
              </select>
              <label htmlFor="status">Status:</label>
              <select id="status" name="courses">
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
              </select>
              <input type="submit" />
            </form>
            <Chart aspect={3 / 1} title="Attendance" />
          </div>
        </div>

        <div className="bottom">
          {/* <Datatable title="Classes Attended"/> */}
          <p>Classes Attended table</p>
        </div>
      </div>
    </div>
  );
};

export default Single;