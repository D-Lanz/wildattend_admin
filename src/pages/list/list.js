import "./list.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Datatable from "../../components/datatable/Datatable";


const List = ({title, entity, tableTitle, entityColumns}) => {
  console.log(entityColumns);
  return(
    <div className="list">
        <Sidebar/>
        <div className="listContainer">
          <Navbar/>
          <Datatable 
            title={title}
            entity={entity}
            tableTitle={tableTitle}
            entityColumns={entityColumns}
          />
        </div>
    </div>
  )
}

export default List;