import "./selectList_UserClasses.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import TableUserClasses from "../../components/tableUserClasses/tableUserClasses";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";

const SelectListUserClasses = ({title, entity, tableTitle, entityColumns}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigate back to the last page
  };

  return(
    <div className="selectlist">
        <Sidebar/>
        <div className="selectlistContainer">
          <Navbar/>
          <ArrowBackIcon onClick={handleBack} className="backButton" />
          <TableUserClasses
            title={title}
            entity={entity}
            tableTitle={tableTitle}
            entityColumns={entityColumns}
          />
        </div>
    </div>
  )
}

export default SelectListUserClasses;