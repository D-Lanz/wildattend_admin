import "./edit.css"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; 
import { db, storage } from "../../firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Edit = ({inputs, title, entityType }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [file, setFile] = useState("");
  const [data, setData] = useState("");
  const [perc, setPerc] = useState(null);
  
  console.log(id);

  useEffect(() => {
    // Fetch data based on the ID when the component mounts
    const fetchData = async () => {
      try {
        // Your logic to fetch data based on the ID
        // For example:
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

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setData({ ...data, [id]: value });
    console.log("Editing ID:", id)
    console.log(data)
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
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
              default:
                break;
            }
          }, 
          (error) => {
            console.log(error)
          }, 
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setData((prev) => ({ ...prev, img: downloadURL }))
            });
          }
        );
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
                    // Render input field for other types
                    <input
                      className="inputn"
                      id={input.id}
                      type={input.type}
                      placeholder={input.placeholder}
                      pattern={input.pattern}
                      onChange={handleInput}
                      required
                      value={data[input.id] || ''}
                    />
                  )}
                </div>
              ))}



              <button
                disabled={perc !== null && perc < 100}
                className="buttonn"
                type="submit"
              >
                Update
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;
