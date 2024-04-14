import "./sidebar.css";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ClassIcon from '@mui/icons-material/Class';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';


const Sidebar = () => {

  return (
    <div className="sidebar">
      <div className="top">
        <ManageAccountsIcon/>
        <span className="logo">Admin</span>
      </div>
      <hr/>
      <div className="center">
        <ul>
          <p className="title">MAIN</p>
          <li>
            <DashboardIcon className="icon"/>
            <span>Dashboard</span>
          </li>
          <p className="title">LISTS</p>
          <li>
            <PeopleAltIcon className="icon"/>
            <span>Manage Users</span>
          </li>
          <li>
            <ClassIcon className="icon"/>
            <span>Manage Courses</span>
          </li>

          <p className="title">ASSESSMENTS</p>
          <li>
            <ReceiptLongIcon className="icon"/>
            <span>Attendance Records</span>
          </li>
          <li>
            <AssessmentIcon className="icon"/>
            <span>Generate Reports</span>
          </li>

          <p className="title">USER</p>
          <li>
            <LogoutIcon className="icon"/>
            <span>Logout</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;