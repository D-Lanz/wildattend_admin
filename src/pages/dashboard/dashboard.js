import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Widget from "../../components/widget/widget";
import SearchBar from "../../components/searchBar/SearchBar"; // Import the SearchBar component
import "./dashboard.css";
import DateTimeWidget from "../../components/dateTimeWidget/dateTimeWidget";
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "../../firebase"; // Firebase db import

const Dashboard = () => {
  const [lastname, setLastname] = useState(''); // State for user's lastname
  const [firstname, setFirstname] = useState(''); // State for user's firstname
  const [idNum, setIdNum] = useState(''); // State for user's idNum
  const [role, setRole] = useState(''); // State for user's role
  const [loading, setLoading] = useState(true); // State to handle loading state

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true); // Start loading
        const userDoc = doc(db, 'users', user.uid); // Assumes user info is stored under 'users' collection
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setLastname(userData.lastName); // Set last name
          setFirstname(userData.firstName); // Set first name
          setIdNum(userData.idNum); // Set ID number
          setRole(userData.role); // Set role
        } else {
          console.log('No such document!');
        }
        setLoading(false); // End loading
      } else {
        // If no user is logged in, clear the data
        setLastname('');
        setFirstname('');
        setIdNum('');
        setRole('');
        setLoading(false);
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        
        {/* Display user information with loading state */}
        {loading ? (
          <p>Loading user information...</p>
        ) : (
          <p>Welcome {firstname} {lastname} ({idNum})!</p>
        )}
        
        <SearchBar />
        <DateTimeWidget/>
        
        <div className="widgets">
          <Widget type="user" />
          <Widget type="student" />
          <Widget type="faculty" />
        </div>
        
        <div className="widgets">
          <Widget type="class" />
          
          {/* Conditionally render room and access point widgets based on user role */}
          {role === 'Admin' && (
            <>
              <Widget type="room" />
              <Widget type="accesspt" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
