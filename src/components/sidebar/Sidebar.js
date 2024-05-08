import "./sidebar.css";
import React, { useState } from 'react';
import LogoutConfirmation from './LogoutConfirmation'; // Import your confirmation component
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ClassIcon from '@mui/icons-material/Class';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import LogoutIcon from '@mui/icons-material/Logout';
import RoomIcon from '@mui/icons-material/Room';
import RouterIcon from '@mui/icons-material/Router';
import {Link} from "react-router-dom"

const Sidebar = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    // Perform logout logic (e.g., clear auth token)
    localStorage.removeItem('authToken'); // Assuming you store auth token in localStorage
    window.location.href = '/login'; // Redirect to login page
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span className="logo">Admin</span>
        </Link>
      </div>
      <hr />
      <div className="center">
        <ul>
          <p className="title">MAIN</p>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <li>
              <DashboardIcon className="icon" />
              <span>Dashboard</span>
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
          </Link><p className="title">MANAGE</p>
          <Link to="/rooms" style={{ textDecoration:"none" }}>
            <li>
              <RoomIcon className="icon"/>
              <span>Manage Rooms</span>
            </li>
          </Link>
          <Link to="/accessPoints" style={{ textDecoration:"none" }}>
            <li>
              <RouterIcon className="icon"/>
              <span>Manage Access Points</span>
            </li>
          </Link>
          <p className="title">ASSESSMENTS</p>
          <Link to="/" style={{ textDecoration:"none" }}>
            <li>
              <ReceiptLongIcon className="icon"/>
              <span>Attendance Records</span>
            </li>
          </Link>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <li>
              <AssessmentIcon className="icon" />
              <span>Generate Reports</span>
            </li>
          </Link>
          <p className="title">USER</p>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <li>
              <ContactEmergencyIcon className="icon" />
              <span>My Profile</span>
            </li>
          </Link>
          <li onClick={handleLogoutClick}>
            <LogoutIcon className="icon"  />
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
