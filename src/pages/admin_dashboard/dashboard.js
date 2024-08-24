import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Widget from "../../components/widget/widget";
import SearchBar from "../../components/searchBar/SearchBar"; // Import the SearchBar component
import "./dashboard.css";

const AdminDashboard = () => {
  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <SearchBar /> {/* Add the SearchBar here */}
        <div className="widgets">
          <Widget type="user" />
          <Widget type="student" />
          <Widget type="faculty" />
        </div>
        <div className="widgets">
          <Widget type="class" />
          <Widget type="room" />
          <Widget type="accesspt" />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
