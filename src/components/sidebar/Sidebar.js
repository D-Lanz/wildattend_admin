import "./sidebar.css";
import logo from "./logo.png"; // Import the logo image
import React, { useState } from 'react';
import LogoutConfirmation from './LogoutConfirmation'; // Import your confirmation component
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
