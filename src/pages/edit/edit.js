import "./edit.css"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; 
import { db, storage } from "../../firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import UpdateModal from '../../components/CRUDmodals/UpdateModal';
import SuccessModal from "../../components/CRUDmodals/SuccessModal";

import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Edit = ({ inputs, title, entityType }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [file, setFile] = useState("");
  const [data, setData] = useState("");
  const [perc, setPerc] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const handleBack = () => navigate(-1);

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

  useEffect(() => {
    const email = `${firstName.replace(/\s+/g, '').toLowerCase()}.${lastName.replace(/\s+/g, '').toLowerCase()}@cit.edu`;
    setData((prevData) => ({ ...prevData, email }));
  }, [firstName, lastName]);

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setData({ ...data, [id]: value });

    if (id === "firstName") {
      setFirstName(value);
    } else if (id === "lastName") {
      setLastName(value);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

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
  
      const documentId = id;
  
      if (file) {
        const name = new Date().getTime() + file.name;
        const storageRef = ref(storage, name);
        const uploadTask = uploadBytesResumable(storageRef, file);
  
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            setPerc(progress);
          },
          (error) => {
            console.log(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setData((prev) => ({ ...prev, img: downloadURL }));
            });
          }
        );
      }
  
      await setDoc(doc(db, collectionName, documentId), {
        ...data,
        timeStamp: serverTimestamp(),
      });
  
      setShowSuccessModal(true);
    } catch (err) {
      console.log(err);
    }
  };  

  const handleUpdateClick = (e) => {
    e.preventDefault();
    setShowUpdateModal(true);
  };

  return (
    <div className="edit">
      <Sidebar />
      <div className="editContainer">
        <Navbar />
        <div className="topn">
          <ArrowBackIcon onClick={handleBack} className="backButton" />
          <h2 className="titlen">{title}</h2>
        </div>
        <div className="bottomn">
          {entityType !== "accessPoint" && entityType !== "room" && (
            <div className="leftn">
              <img
                src={
                  file ? URL.createObjectURL(file)
                    : data && data.img ? data.img
                      : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"
                }
                className="editImg"
                alt="Item"
              />
            </div>
          )}
          <div className="rightn">
            <form className="formn" onSubmit={handleUpdate}>
              <div className="formInput">
                {entityType !== "accessPoint" && entityType !== "room" && (
                  <>
                    <label className="labeln" htmlFor="file">
                      Image: <DriveFolderUploadIcon className="iconn" />
                    </label>
                    <input className="inputn" onChange={e => setFile(e.target.files[0])} type="file" id="file" style={{ display: "none" }} />
                  </>
                )}
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label className="labeln" htmlFor={input.id}>{input.label}</label>
                  {input.id === "days" ? (
                    <div>
                      {input.options.map((option) => (
                        <div key={option} className="checkboxWrapper">
                          <input
                            id={option}
                            type="checkbox"
                            value={option}
                            onChange={handleInput}
                            checked={data.days && data.days[option]}
                          />
                          <label htmlFor={option}>{option}</label>
                        </div>
                      ))}
                    </div>
                  ) : input.type === "dropdown" ? (
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
                      disabled={input.id === "firstName" || input.id === "lastName" || input.id === "password" || input.id === "email"}
                    />
                  )}
                </div>
              ))}

              <button
                onClick={handleUpdateClick}
                className="buttonn"
                type="button"  // Change to 'button'
              >
                Update
              </button>
            </form>
          </div>

          {showUpdateModal && (
            <UpdateModal
              entityType={entityType}
              onConfirm={handleUpdate}
              onCancel={() => setShowUpdateModal(false)}
            />
          )}

          {showSuccessModal && (
            <SuccessModal
              actionType={entityType}
              entityName={entityType}
              onClose={() => {
                setShowSuccessModal(false);
                navigate(-1);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Edit;