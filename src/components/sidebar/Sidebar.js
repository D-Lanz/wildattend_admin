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
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [role, setRole] = useState(null); // State to store the user's role
  const [lastname, setLastname] = useState(''); // State for user's lastname
  const [firstname, setFirstname] = useState(''); // State for user's firstname
  const [idNum, setIdNum] = useState(''); // State for user's idNum
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
              <span>Attendance Records</span>
            </li>
          </Link>
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
          
          {/* Conditionally render the Manage Rooms and Access Points links based on the role */}
          {role === 'Admin' && (
            <>
            <p className="title">MANAGE</p>
              <Link to="/rooms" style={{ textDecoration: "none" }}>
                <li>
                  <RoomIcon className="icon" />
                  <span>Manage Rooms</span>
                </li>
              </Link>
              <Link to="/accessPoints" style={{ textDecoration: "none" }}>
                <li>
                  <RouterIcon className="icon" />
                  <span>Manage Access Points</span>
                </li>
              </Link>
            </>
          )}
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
