import "./template.css";

import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";

const Template = () => {
  // functions here
  return (
    <div className="main">
      <Sidebar />
      <div className="tempContainer">
        <Navbar />

        {/* Body contains here */}
        
      </div>
    </div>
  );
};

export default Template;
