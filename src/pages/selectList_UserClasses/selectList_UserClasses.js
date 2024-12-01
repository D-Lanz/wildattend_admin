import "./selectList_UserClasses.css";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import TableUserClasses from "../../components/tableUserClasses/tableUserClasses";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const SelectListUserClasses = ({ tableTitle, entityColumns, entitySingle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userID, classID } = useParams();
  const [data, setData] = useState(null);
  const [title, setTitle] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  // Get `entityId` and `entitySingle` from state, fallback to params
  const id = userID || classID || location.state?.entityId;
  const entity = location.state?.entitySingle || "users"; // Default to "users" if not passed
  const entityOpposite = entity === "users" ? "classes" : entity === "classes" ? "users" : null; // Determine the opposite entity

  const handleBack = () => {
    console.log("Navigating back to the previous page...");
    navigate(-1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        if (!id || !entity) {
          console.warn("No entityId or entitySingle provided.");
          return;
        }
  
        console.log(`Current entity: ${entity}, Opposite entity: ${entityOpposite}`);
        console.log(`Fetching data for entity: ${entity}, id: ${id}`);
  
        // Attempt to fetch from the current entity
        let docRef = doc(db, entity, id);
        let docSnap = await getDoc(docRef);
  
        // If the document is not found, try fetching from the opposite entity
        if (!docSnap.exists() && entityOpposite) {
          console.warn(`No document found in ${entity}. Attempting ${entityOpposite}...`);
          docRef = doc(db, entityOpposite, id);
          docSnap = await getDoc(docRef);
        }
  
        if (docSnap.exists()) {
          const docData = docSnap.data();
          console.log("Fetched Document Data:", docData); // Log the document data
  
          setData(docData);
  
          // Set the title based on the fetched entity
          if (entityOpposite === "classes") {
            const classDesc = docData.classDesc || "Unknown Class Description";
            const classType = docData.classType || "Unknown Class Type";
            console.log(`Setting title for class: ${classDesc} - ${classType}`); // Debug log
            setTitle(`${classDesc} - ${classType}`);
          } else if (entityOpposite === "users") {
            const lastName = docData.lastName || "Unknown Last Name";
            const firstName = docData.firstName || "Unknown First Name";
            console.log(`Setting title for user: ${lastName}, ${firstName}`); // Debug log
            setTitle(`${lastName}, ${firstName}`);
          } else {
            console.log("Setting generic title: Entity Details");
            setTitle("Entity Details");
          }
        } else {
          console.error("No document found in either collection for the provided ID.");
          setTitle("No Data Available");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        setTitle("Error Loading Data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, entity, entityOpposite]);
  

  return (
    <div className="selectlist">
      <Sidebar />
      <div className="selectlistContainer">
        <Navbar />
        <div className="contentWrapper">
          {/* Left section to display user or class details */}
          <div className="leftsl">
            <div className="navWrapper">
              <ArrowBackIcon onClick={handleBack} className="backButton" />
            </div>
            <h1 className="titles">Information</h1>
            <div className="itemsl">
              {data && data.img ? (
                <img src={data.img} className="itemImgs" alt="Item" />
              ) : (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"
                  className="itemImgs"
                  alt="Placeholder"
                />
              )}
              <br />
              <div className="detailss">
                <h1 className="itemTitles">{title}</h1>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  entitySingle.map((dataS) => (
                    <div className="detailItems" key={dataS.field}>
                      <span className="itemKeys">{dataS.headerName}:</span>
                      <span className="itemValues">
                        {data && data[dataS.field] ? (
                          typeof data[dataS.field] === "object" &&
                          dataS.field === "days" ? (
                            Object.keys(data[dataS.field])
                              .filter((day) => data[dataS.field][day])
                              .join(", ")
                          ) : (
                            data[dataS.field]
                          )
                        ) : (
                          "No Data Available"
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Table section to display user classes */}
          <div className="tableContaineruc">
            <TableUserClasses
              entity={entity}
              tableTitle={tableTitle}
              entityColumns={entityColumns}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectListUserClasses;
