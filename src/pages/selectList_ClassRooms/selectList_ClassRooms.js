import "./selectList_ClassRooms.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import TableClassRooms from "../../components/tableClassRooms/tableClassRooms";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";


const SelectListClassRooms = ({title, entity, tableTitle, entityColumns}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigate back to the last page
  };

  return(
    <div className="selectlist2">
        <Sidebar/>
        <div className="selectlist2Container">
          <Navbar/>
          <ArrowBackIcon onClick={handleBack} className="backButton" />
          <TableClassRooms
            title={title}
            entity={entity}
            tableTitle={tableTitle}
            entityColumns={entityColumns}
          />
        </div>
    </div>
  )
}

export default SelectListClassRooms;