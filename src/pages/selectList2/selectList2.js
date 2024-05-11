import "./selectList2.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DatatableSelect2 from "../../components/datatableSelect2/DatatableSelect2";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";

const SelectList2 = ({title, entity, tableTitle, entityColumns}) => {
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
          <DatatableSelect2 
            title={title}
            entity={entity}
            tableTitle={tableTitle}
            entityColumns={entityColumns}
          />
        </div>
    </div>
  )
}

export default SelectList2;