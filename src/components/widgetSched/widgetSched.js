import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage"; // For fetching the class image
import { Link } from "react-router-dom";
import { db, storage, auth } from "../../firebase"; // Ensure auth is included
import { onAuthStateChanged } from "firebase/auth";
import { FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import "./widgetSched.css";

const Widget2 = () => {
  const [classes, setClasses] = useState([]); // To store classes from Firestore
  const [loading, setLoading] = useState(true); // To handle loading state
  const [filterText, setFilterText] = useState(""); // Search text
  const [selectedFilter, setSelectedFilter] = useState(""); // Selected filter type

  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()]; // Get current day
  };

  const fetchClassesForFaculty = async (userId) => {
    // Fetch userClasses documents where the userID matches the current user
    const q = query(collection(db, "userClasses"), where("userID", "==", userId));
    const querySnapshot = await getDocs(q);
    const classIDs = querySnapshot.docs.map((doc) => doc.data().classID);
    // Now fetch the class documents based on these class IDs
    const classQuery = query(collection(db, "classes"), where("__name__", "in", classIDs));
    return await getDocs(classQuery);
  };

  const fetchAllClasses = async () => {
    const q = query(collection(db, "classes"));
    return await getDocs(q);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // Set loading state
      if (user) {
        try {
          // Fetch the user's role from the Firestore `users` collection
          const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", user.uid)));
          const userData = userDoc.docs[0]?.data(); // Assuming the document exists
          if (!userData) throw new Error("User data not found.");

          let querySnapshot;
          if (userData.role === "Faculty") {
            // Fetch classes associated with the faculty user
            querySnapshot = await fetchClassesForFaculty(user.uid);
          } else if (userData.role === "Admin") {
            // Fetch all classes if the user is an Admin
            querySnapshot = await fetchAllClasses();
          } else {
            throw new Error("Unauthorized role");
          }

          const currentDay = getCurrentDay();
          const classData = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
              const data = doc.data();

              if (data.days?.[currentDay]) {
                let classImageUrl = data.img || ""; // Default to empty if no image URL
                if (data.img && !data.img.startsWith("http")) {
                  // Only fetch from Firebase Storage if the URL is not external
                  try {
                    const imageRef = ref(storage, data.img);
                    classImageUrl = await getDownloadURL(imageRef);
                  } catch (error) {
                    console.error(`Error fetching image for class ${doc.id}:`, error);
                  }
                }

                return {
                  id: doc.id,
                  ...data,
                  classImageUrl,
                };
              }
              return null;
            })
          );

          const filteredClasses = classData.filter((classItem) => classItem !== null);
          setClasses(filteredClasses);
        } catch (error) {
          console.error("Error fetching classes:", error);
        } finally {
          setLoading(false); // Ensure loading is set to false
        }
      } else {
        console.error("No authenticated user found.");
        setLoading(false); // Stop loading if no user
      }
    });

    return () => unsubscribe(); // Cleanup
  }, []); // Correct placement of dependency array

  // Handle filter text change
  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  // Handle filter dropdown change
  const handleFilterSelectChange = (event) => {
    setSelectedFilter(event.target.value);
  };

  // Filter classes based on search text and selected filter type
  const filteredClasses = classes.filter((classItem) => {
    const searchText = filterText.toLowerCase();
    switch (selectedFilter) {
      case "classCode":
        return classItem.classCode.toLowerCase().includes(searchText);
      case "classSec":
        return classItem.classSec.toLowerCase().includes(searchText);
      case "classDesc":
        return classItem.classDesc.toLowerCase().includes(searchText);
      default:
        return (
          classItem.classCode.toLowerCase().includes(searchText) ||
          classItem.classSec.toLowerCase().includes(searchText) ||
          classItem.classDesc.toLowerCase().includes(searchText)
        );
    }
  });

  if (loading) {
    return <div>Loading...</div>; // Handle loading state
  }

  return (
    <div>
      <div className="filterSection2">
        <FormControl variant="outlined" style={{ marginBottom: "20px" }}>
          <InputLabel>Filter by</InputLabel>
          <Select value={selectedFilter} onChange={handleFilterSelectChange} label="Filter by">
            <MenuItem value="">None</MenuItem>
            <MenuItem value="classCode">Class Code</MenuItem>
            <MenuItem value="classSec">Class Section</MenuItem>
            <MenuItem value="classDesc">Class Description</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Search"
          variant="outlined"
          value={filterText}
          onChange={handleFilterChange}
          style={{ flex: 1, maxWidth: "500px", marginLeft: "0px", marginTop: "-20px" }}
        />
      </div>
      <div className="widgetSched">
        {filteredClasses.length === 0 ? (
          <div className="noClass">No classes for today.</div>
        ) : (
          filteredClasses.map((classItem) => (
            <div key={classItem.id} className="classItemS">
              <div className="leftwS">
                {classItem.classImageUrl ? (
                  <img src={classItem.classImageUrl} alt={classItem.classDesc} className="classImageCircle" />
                ) : (
                  <div>No Image Available</div>
                )}
              </div>
              <div className="rightwS">
                <span className="wtitleS">
                  {classItem.classCode} - {classItem.classSec} ({classItem.classType})
                </span>
                <span className="counter">{classItem.classDesc}</span>
                <span className={`ongoingTag ${classItem.Ongoing ? "ongoing" : "notOngoing"}`}>
                  {classItem.Ongoing ? "Ongoing" : "Not Ongoing"}
                </span>
                <Link className="linkwS" to={`/schedule/${classItem.id}`}>
                  <span className="linkwS">View Schedule {classItem.className}</span>
                </Link>
                <Link className="linkwS" to={`/classes/${classItem.id}`}>
                  <span className="linkwS">View Details {classItem.className}</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Widget2;
