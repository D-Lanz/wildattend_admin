import "./edit2.css"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; 
import { db, storage } from "../../firebase"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UpdateModal from "../../components/updateModal/UpdateModal";

const Edit2 = ({inputs, title, entityType }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  console.log(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let collectionName;
  
        switch (entityType) {
          case "user":
            collectionName = "users";
            break;
          case "class":
            collectionName = "classes";
            break;
          case "room":
            collectionName = "rooms";
            break;
          case "accessPoint":
            collectionName = "accessPoints";
            break;
          default:
            throw new Error("Invalid entityType");
        }
  
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
      }
    };
  
    fetchData();
  }, [id, entityType]);
  

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    // Update data state correctly
    setData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };
  

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Add logic to differentiate between user and class
      let collectionName, documentId;
  
      switch (entityType) {
        case "user":
          collectionName = "users";
          documentId = id; // Use the existing user ID
          break;
        case "class":
          collectionName = "classes";
          documentId = id; // Use the existing class ID
          break;
        case "room":
          collectionName = "rooms";
          documentId = id;
          break;
        case "accessPoint":
          collectionName = "accessPoints";
          documentId = id;
          break;
        default:
          throw new Error("Invalid entityType");
      }
  
      // Update document in Firestore using the existing document ID
      await setDoc(doc(db, collectionName, documentId), {
        ...data,
        timeStamp: serverTimestamp()
      });
  
      console.log("ID:", documentId);
      navigate(-1); // Navigate back after successful update
    } catch (err) {
      console.log(err);
    }
  };
  
  const handleBack = () => {
    navigate(-1); // Navigate back to the last page
  };

  const handleUpdateClick = () => {
    setShowModal(true);
  };
  
  return(
    <div className="edit">
      <Sidebar/>
      <div className="editContainer">
        <Navbar/>
        <div className="topn">
          <ArrowBackIcon onClick={handleBack} className="backButton" />
          <h2 className="titlen">{title}</h2>
        </div>
        <div className="bottomn">
          <div className="leftn">
          </div>
          <div className="rightn">
            <form className="formn" onSubmit={handleUpdate}>
              <div className="formInput">
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label className="labeln" htmlFor={input.id}>{input.label}</label>
                  {input.type === "dropdown" ? (
                    <select
                      className="inputn"
                      id={input.id}
                      onChange={handleInput}
                      required
                      value={data[input.id] || ''}
                    >
                      {input.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="inputn"
                      id={input.id}
                      type={input.type}
                      placeholder={input.placeholder}
                      pattern={input.pattern}
                      onChange={handleInput}
                      required
                      value={data[input.id] || ''}
                      disabled={input.id === "email" || input.id === "password" || input.id === "idNum"}
                    />
                  )}
                </div>
              ))}

              <button
                onClick={handleUpdateClick}
                className="buttonn"
                type="submit"
              >
                Update
              </button>
            </form>
          </div>
          {showModal && (
          <UpdateModal/>
          )}
        </div>
      </div>
    </div>
  );
};

export default Edit2;
