import "./single2.css"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import Datatable2 from "../../components/datatable2/Datatable2";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore"; // Import getDoc and doc from Firestore
import { db } from "../../firebase"; // Import db from firebase

const Single2 = ({ entitySingle, entity, entityTable, tableTitle, entityColumns, entityAssign, entityConnect }) => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  
  const location = useLocation();
  const { rowData } = location.state || {};
  
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigate back to the last page
  };

  console.log("ID: ", id)

  useEffect(() => {
    const fetchData = async () => {
      try {
        let fetchedData = null;
        if (entity && id) {
          const docRef = doc(db, entity, id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            fetchedData = docSnap.data();
          }
        }

        console.log("Fetched data:", fetchedData);

        if (fetchedData) {
          setData(fetchedData);
        } else {
          console.log(`No such document found for ${entity} with ID:`, id);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };

    fetchData();
  }, [id, entity]);

  // Determine the title based on the entity
  let title;
  if (entity === 'users') {
    title = `${data?.lastName || ''}, ${data?.firstName || ''}`;
  } else if (entity === 'classes') {
    title = data?.classDesc || '';
  } else if (entity === 'rooms') {
    title = `${data?.building || ''}${data?.roomNum || ''}`;
  } else if (entity === 'accessPoints') {
    title = data?.macAddress || '';
  }

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="tops">
          <div className="lefts">
          <ArrowBackIcon onClick={handleBack} className="backButton" />
          <Link to={`/${entity}/${id}/edit`} className="editButtons">Edit</Link>
            <h1 className="titles">Information</h1>
            <div className="items">
              <div className="detailss">
                <h1 className="itemTitles">{title}</h1>
                {entitySingle.map((dataS) => (
                  <div className="detailItems" key={dataS.field}>
                    <span className="itemKeys">{dataS.headerName}:</span>
                    <span className="itemValues">
                      {data && data[dataS.field]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* <div className="rights">
            <Chart aspect={3 / 1} title="Attendance" />
          </div> */}
        </div>

        <div className="bottom">
          {/* <Datatable title="Classes Attended"/> */}
          <Datatable2
            title={title}
            entity={entityTable}
            tableTitle={tableTitle}
            entityColumns={entityColumns}
            id={id}
            entityAssign={entityAssign}
            entityConnect={entityConnect}
          />
        </div>
      </div>
    </div>
  );
};

export default Single2;