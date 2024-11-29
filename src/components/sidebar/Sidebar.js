import "./sidebar.css";
import logo from "./logo.png"; // Import the logo image
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import { doc, getDoc } from 'firebase/firestore'; // Firestore functions
import { db } from "../../firebase"; // Import db and storage from firebase
import LogoutConfirmation from './LogoutConfirmation'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ClassIcon from '@mui/icons-material/Class';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import LogoutIcon from '@mui/icons-material/Logout';
import RoomIcon from '@mui/icons-material/Room';
import RouterIcon from '@mui/icons-material/Router';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [role, setRole] = useState(null); // State to store the user's role
  const [lastname, setLastname] = useState(''); // State for user's lastname
  const [firstname, setFirstname] = useState(''); // State for user's firstname
  const [idNum, setIdNum] = useState(''); // State for user's idNum
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [profileImg, setProfileImg] = useState('https://cdn-icons-png.flaticon.com/512/201/201818.png'); // Default profile image
  const [currentTime, setCurrentTime] = useState(""); // State for current time
  const [currentDate, setCurrentDate] = useState(""); // State for current date

  // Fetch user data from Firestore
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true); // Start loading
        const userDoc = doc(db, 'users', user.uid); // Assumes user info is stored under 'users' collection
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setRole(userData.role); // Fetch and set the role
          setLastname(userData.lastName); // Fetch and set the last name
          setFirstname(userData.firstName); // Fetch and set the first name
          setIdNum(userData.idNum); // Fetch and set the ID number
        if (userData.img) {
          setProfileImg(userData.img); // Fetch and set the profile image
        }
        } else {
          console.log('No such document!');
        }
        setLoading(false); // End loading
      } else {
        // Handle the case where the user is not logged in or no user is detected
        setRole(null);
        setFirstname('');
        setLastname('');
        setIdNum('');
        setLoading(false); // End loading
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);

  // Update current date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };

      setCurrentTime(now.toLocaleTimeString('en-US', timeOptions)); // Update time
      setCurrentDate(now.toLocaleDateString('en-US', dateOptions)); // Update date
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);


  // Show the logout confirmation modal
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  // Handle the logout process
  const handleLogoutConfirm = () => {
    // Clear auth token and session data
    localStorage.removeItem('authToken'); 
    window.localStorage.clear();
    window.sessionStorage.clear();

    // Prevent navigation back to the protected pages
    window.history.replaceState(null, '', window.location.href);

    // Redirect to login page
    window.location.replace('/login');
  };

  // Close the modal without logging out
  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <div className="logo-container">
            <img
              src={logo}
              alt="App Logo"
              className="logo-image"
            />
          </div>
        </Link>
      </div>
      
      <br/>
      {/* Profile Picture */}
      <div className="profile-picture">
        {loading ? (
          <div className="loading-placeholder-circle"></div>
        ) : (
          <img
            src={profileImg}
            alt="Profile"
            className="profile-img-circle"
          />
        )}
      </div>
  
      {/* User Info */}
      {/* Display the user’s name, idNum, and role with loading placeholders */}
      <div className="user-info">
        {loading ? (
          // Placeholder for loading
          <>
            <span className="loading-placeholder">Loading name...</span><br />
            <span className="loading-placeholder">Loading role...</span>
          </>
        ) : (
          <>
            <span>{lastname}, {firstname} ({idNum})</span><br/>
            <span>{role}</span>
          </>
        )}
      </div>

      <div className="center">
        <ul>
          <p className="title">MAIN</p>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <li>
              <DashboardIcon className="icon" />
              <span>Dashboard</span>
            </li>
          </Link>
          <Link to="/schedule" style={{ textDecoration: "none" }}>
            <li>
              <ReceiptLongIcon className="icon" />
              <span>Class Attendance</span>
            </li>
          </Link>
          {role === 'Admin' && (
            <>
              <Link to="/facultyAttendance" style={{ textDecoration: "none" }}>
                <li>
                  <SwitchAccountIcon className="icon" />
                  <span>Faculty Attendance</span>
                </li>
              </Link>
            </>
          )}
          <p className="title">LISTS</p>
          <Link to="/users" style={{ textDecoration: 'none' }}>
            <li>
              <PeopleAltIcon className="icon" />
              <span>Manage Users</span>
            </li>
          </Link>
          <Link to="/classes" style={{ textDecoration: 'none' }}>
            <li>
              <ClassIcon className="icon" />
              <span>Manage Classes</span>
            </li>
          </Link>
        
          <p className="title">USER</p>
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <li>
              <ContactEmergencyIcon className="icon" />
              <span>My Profile</span>
            </li>
          </Link>
          <li onClick={handleLogoutClick}>
            <LogoutIcon className="icon" />
            <span>Logout</span>
          </li>
        </ul>
      </div>
      
      {/* Current Date and Time */}
      <div className="current-datetime">
        {loading ? (
          <>
            <span className="time">00:00AM/PM</span><br/>
            <span className="date">MTWTHF, MM/DD/YYYY</span>
          </>
        ) : (
          <>
            <span className="time">{currentTime}</span>
            <span className="date">{currentDate}</span>
          </>
        )}
      </div>
  
      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <LogoutConfirmation
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}
    </div>
  );
};

export default Sidebar;
