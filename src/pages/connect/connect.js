import "./connect.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc, collection, query, where, getDocs } from "firebase/firestore"; // Import Firestore functions
import { db } from "../../firebase"; // Import db from firebase
import DatatableRecord from "../../components/datatableRecord/DatatableRecord";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

const Connect = ({ userColumns, classColumns, entityColumns, entityTable, tableTitle }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [classData, setClassData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          // Fetch userClass document
          const userClassRef = doc(db, "userClasses", id);
          const userClassDocSnap = await getDoc(userClassRef);
    
          if (userClassDocSnap.exists()) {
            const userClassDoc = userClassDocSnap.data();
            const userID = userClassDoc.userID;
    
            // Fetch user data
            const userDocRef = doc(db, "users", userID);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setUserData(userDocSnap.data());
            }
    
            // Fetch class data
            const classDocRef = doc(db, "classes", userClassDoc.classID);
            const classDocSnap = await getDoc(classDocRef);
            if (classDocSnap.exists()) {
              setClassData(classDocSnap.data());
            }
    
            console.log("User data:", userData);
            console.log("Class data:", classData);
          } else {
            console.error('Document does not exist with id:', id);
          }
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };
    
    fetchData();
  }, [id]);

  const handleBack = () => {
    navigate(-1); // Navigate back to the last page
  };

  return (
    <div className="connect">
      <Sidebar />
      <div className="connectContainer">
        <Navbar />
        <div className="tops">
          {/* USER VIEW */}
          <div className="lefts">
            <ArrowBackIcon onClick={handleBack} className="backButton" />
            <h1 className="titles">User</h1>
            <div className="items">
              {/* Render user data */}
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

          {/* CLASS VIEW */}
          <div className="rights">
            <h1 className="titles">Class</h1>
            <div className="items">
              {/* Render class data */}
              {classData && (
                <>
                  <img src={classData.img || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"} className="itemImgs" alt="Item" />
                  <div className="detailss">
                    <h1 className="itemTitles">{classData.classDesc || ''}</h1>
                    {classColumns.map(column => (
                      <div className="detailItems" key={column.field}>
                        <span className="itemKeys">{column.headerName}:</span>
                        <span className="itemValues">{classData[column.field]}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bottom">
          {/* Place your datatable components here */}
          {/* <Datatable title="Classes Attended"/> */}
          <DatatableRecord
            entity={entityTable}
            tableTitle={tableTitle}
            entityColumns={entityColumns}/>
        </div>
      </div>
    </div>
  );
};

export default Connect;
