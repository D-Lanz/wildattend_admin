import "./selectList1.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DatatableSelect1 from "../../components/datatableSelect1/DatatableSelect1";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";

const SelectList1 = ({title, entity, tableTitle, entityColumns}) => {
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
          <DatatableSelect1 
            title={title}
            entity={entity}
            tableTitle={tableTitle}
            entityColumns={entityColumns}
          />
        </div>
    </div>
  )
}

export default SelectList1;