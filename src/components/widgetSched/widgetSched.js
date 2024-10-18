import { useEffect, useState } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage"; // For fetching the class image
import { Link } from 'react-router-dom';
import { db, storage } from "../../firebase"; // Ensure auth is not needed here unless you use it later
import { FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import "./widgetSched.css";

const Widget2 = () => {
  const [classes, setClasses] = useState([]); // To store classes from Firestore
  const [loading, setLoading] = useState(true); // To handle loading state
  const [filterText, setFilterText] = useState(""); // Search text
  const [selectedFilter, setSelectedFilter] = useState(""); // Selected filter type

  // Get the current day of the week
  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayIndex = new Date().getDay(); // getDay() returns 0 for Sunday, 1 for Monday, etc.
    return days[currentDayIndex];
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const q = query(collection(db, "classes"));
        const querySnapshot = await getDocs(q);
        const currentDay = getCurrentDay(); // Get the current day
        const classData = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Check if the current day is set to true in the "days" map
          if (data.days && data.days[currentDay]) {
            // Fetch the class image from Firebase Storage
            let classImageUrl = "";
            if (data.img) {
              const imageRef = ref(storage, data.img); // Assuming classImage is the image path
              classImageUrl = await getDownloadURL(imageRef);
            }

            return {
              id: doc.id, // classDocumentId
              ...data,
              classImageUrl,
            };
          }
          return null; // If the class does not meet the condition, return null
        }));

        // Filter out any null entries (classes that don't meet the day condition)
        const filteredClasses = classData.filter(classItem => classItem !== null);
        
        setClasses(filteredClasses); // Set the filtered data
        setLoading(false); // Set loading to false after data is loaded
      } catch (error) {
        console.error("Error fetching classes:", error);
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

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
      case 'classCode':
        return classItem.classCode.toLowerCase().includes(searchText);
      case 'classSec':
        return classItem.classSec.toLowerCase().includes(searchText);
      case 'classDesc':
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
        <FormControl variant="outlined" style={{ marginBottom: '20px' }}>
          <InputLabel>Filter by</InputLabel>
          <Select
            value={selectedFilter}
            onChange={handleFilterSelectChange}
            label="Filter by"
          >
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
          style={{ flex: 1, maxWidth: '500px', marginLeft: '0px', marginTop: '-20px' }}
        />
      </div>
      <div className="widgetSched">
        {filteredClasses.length === 0 ? (
          <div>No classes for today.</div>
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
                <span className="wtitleS">{classItem.classCode} - {classItem.classSec}</span>
                <span className="counter">{classItem.classDesc}</span>
                <span className={`ongoingTag ${classItem.Ongoing ? 'ongoing' : 'notOngoing'}`}>
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
