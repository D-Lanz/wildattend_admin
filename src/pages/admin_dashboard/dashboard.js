import Navbar from "../../components/navbar/Navbar"
import Sidebar from "../../components/sidebar/Sidebar"
import Widget from "../../components/widget/widget"
import "./dashboard.css"

const AdminDashboard = () => {
  return(
    <div className="home">
        <Sidebar/>
        <div className="homeContainer">
          <Navbar/>
          <div className="widgets">
            <Widget/>
            <Widget/>
            <Widget/>
            <Widget/>
            <Widget/>
          </div>
        </div>
    </div>
  )
}

export default AdminDashboard