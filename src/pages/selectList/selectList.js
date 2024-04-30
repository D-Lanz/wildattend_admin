import "./selectList.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DatatableSelect from "../../components/datatableSelect/DatatableSelect";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";

const SelectList = ({title, entity, tableTitle, entityColumns}) => {
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
          <DatatableSelect 
            title={title}
            entity={entity}
            tableTitle={tableTitle}
            entityColumns={entityColumns}
          />
        </div>
    </div>
  )
}

export default SelectList;