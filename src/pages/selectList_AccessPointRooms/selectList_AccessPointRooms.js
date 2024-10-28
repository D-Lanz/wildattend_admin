import "./selectList_AccessPointRooms.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import TableAccessPointRooms from "../../components/tableAccessPointRooms/tableAccessPointRooms";

const SelectListAccessPointRooms = ({title, entity, tableTitle, entityColumns}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigate back to the last page
  };

  return(
    <div className="selectlist3">
        <Sidebar/>
        <div className="selectlist3Container">
          <Navbar/>
          <ArrowBackIcon onClick={handleBack} className="backButton" />
          <TableAccessPointRooms
            title={title}
            entity={entity}
            tableTitle={tableTitle}
            entityColumns={entityColumns}
          />
        </div>
    </div>
  )
}

export default SelectListAccessPointRooms;