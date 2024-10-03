import "./pageNotFound.css";
import meow from "./meow.png"; // Import the logo image
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigate back to the last page
  };

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="contentContainer"> {/* New div below the Navbar */}
          <br/><br/><br/><br/><br/>
          <ArrowBackIcon onClick={handleBack} className="backButton" />
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for might have been removed or is temporarily unavailable.</p>
          <img src={meow} alt="Meow" className="img404" />
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
