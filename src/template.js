import "./template.css";

import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";

const Template = () => {
  // functions here
  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="contentContainer"> {/* New div below the Navbar */}
          

          
        </div>
      </div>
    </div>
  );
};

export default Template;
