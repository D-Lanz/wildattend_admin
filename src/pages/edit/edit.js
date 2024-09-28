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

const Edit = ({inputs, title, entityType }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [file, setFile] = useState("");
  const [data, setData] = useState("");
  const [perc, setPerc] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [actionType, setActionType] = useState(""); // To determine add, update, delete actions

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, entityType === "user" ? "users" : "classes", id);
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
    // Generate the email address based on the first and last name
    const email = `${firstName.replace(/\s+/g, '').toLowerCase()}.${lastName.replace(/\s+/g, '').toLowerCase()}@cit.edu`;
    setData((prevData) => ({ ...prevData, email }));
  }, [firstName, lastName]);

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setData({ ...data, [id]: value });
    console.log("Editing ID:", id)
    console.log(data)

    // Update the firstName and lastName states
    if (id === "firstName") {
      setFirstName(value);
    } else if (id === "lastName") {
      setLastName(value);
    }
  };

  //UPDATE FUNCTION
  const handleUpdate = async (e) => {
    if (e) e.preventDefault(); // Prevent default only if 'e' exists
  
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
        default:
          throw new Error("Invalid entityType");
      }
  
      // Upload file if available
      if (file) {
        const name = new Date().getTime() + file.name;
        const storageRef = ref(storage, name);
        const uploadTask = uploadBytesResumable(storageRef, file);
  
        uploadTask.on('state_changed', 
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
  
      // Update document in Firestore using the existing document ID
      await setDoc(doc(db, collectionName, documentId), {
        ...data,
        timeStamp: serverTimestamp(),
      });
  
      setShowSuccessModal(true); // Show success modal
    } catch (err) {
      console.log(err);
    }
  };  

  //FRONTEND
  const handleCheckboxChange = (e) => {
    const day = e.target.value;
    const isChecked = e.target.checked;
    
    // Update the data object based on checkbox changes
    setData(prevData => ({
      ...prevData,
      days: {
        ...prevData.days,
        [day]: isChecked
      }
    }));
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the last page
  };

  ////////Opens update modal
  const handleUpdateClick = (e) => {
    e.preventDefault(); // Prevent form submission
    setShowUpdateModal(true);
  };

  const handleUpdateModalCancel = () => {
    setShowUpdateModal(false); // Close modal
  };

  const handleUpdateModalConfirm = () => {
    handleUpdate();  // Call handleUpdate without event
    setShowUpdateModal(false);  // Close the update confirmation modal
  };  

  // Success Modal
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleSuccessModalContinue = () => {
    setShowSuccessModal(false);
    navigate(-1); // Example: Navigate to the previous page or to a different page
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
          <div className="rightn">
          <form className="formn" onSubmit={handleUpdate}>
            <div className="formInput">
              <label className="labeln" htmlFor="file">
                Image: <DriveFolderUploadIcon className="iconn"/>
              </label>
              <input className="inputn" onChange={e=>setFile(e.target.files[0])} type="file" id="file" style={{display:"none"}}/>
            </div>

            {inputs.map((input) => (
              <div className="formInput" key={input.id}>
                <label className="labeln" htmlFor={input.id}>
                  {input.label}
                </label>
                {input.id === "days" ? (
                  // If input id is "days", render checkboxes
                  <div>
                    {input.options.map((option) => (
                      <div key={option} className="checkboxWrapper">
                        <input
                          id={option}
                          type="checkbox"
                          value={option}
                          onChange={handleCheckboxChange}
                          checked={data.days && data.days[option]}
                        />
                        <label htmlFor={option}>{option}</label>
                      </div>
                    ))}
                  </div>
                ) : input.type === "dropdown" ? (
                  // Check if input type is dropdown
                  <select
                    className="inputn"
                    id={input.id}
                    onChange={handleInput}
                    required
                    value={data[input.id] || ''}
                  >
                    {input.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  // Render input fields with conditions for firstName, lastName, and password
                  <input
                    className="inputn"
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    pattern={input.pattern}
                    onChange={handleInput}
                    required
                    value={data[input.id] || ''}
                    disabled={input.id === "firstName" || input.id === "lastName" || input.id === "password" || input.id === "email"}  // Disable the specific fields
                  />
                )}
              </div>
            ))}

            <button 
              onClick={handleUpdateClick}
              disabled={perc !== null && perc < 100}
              className="buttonn"
              type="submit"
            >
              Update
            </button>
          </form>

          </div>
          
          {showUpdateModal && (
            <UpdateModal
              entityType={entityType}
              onConfirm={handleUpdateModalConfirm}  // No need to pass event
              onCancel={() => setShowUpdateModal(false)}
            />
          )}

          {showSuccessModal && (
            <SuccessModal 
              actionType={actionType} 
              entityName={entityType} // You can dynamically pass entity names too
              onClose={handleSuccessModalClose}
              onContinue={handleSuccessModalContinue}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Edit;
