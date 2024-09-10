import "./widgetSched.css";
import { useEffect, useState } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage"; // For fetching the class image
import { Link } from 'react-router-dom';
import { db, storage } from "../../firebase"; // Ensure auth is not needed here unless you use it later

const Widget2 = () => {
  const [classes, setClasses] = useState([]); // To store classes from Firestore
  const [loading, setLoading] = useState(true); // To handle loading state

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

  if (loading) {
    return <div>Loading...</div>; // Handle loading state
  }

  return (
    <div className="widgetSched">
      {classes.length === 0 ? (
        <div>No classes for today.</div>
      ) : (
        classes.map((classItem) => (
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
              <Link className="linkwS" to={`/classes/${classItem.id}`}>
                <span className="linkwS">Link to {classItem.className}</span>
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Widget2;
