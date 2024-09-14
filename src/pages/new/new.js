import "./new.css";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddModal from '../../components/addModal/AddModal';
import { useEffect, useState } from "react";
import { collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const New = ({ inputs, title, entityType }) => {
  const [file, setFile] = useState("");
  const [data, setData] = useState({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [perc, setPerc] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;
      console.log(name);

      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setPerc(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
            default:
              break;
          }
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
    };
    file && uploadFile();
  }, [file]);

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    setData({ ...data, [id]: value });

    // Update the firstName and lastName states
    if (id === "firstName") {
      setFirstName(value);
    } else if (id === "lastName") {
      setLastName(value);
    }
  };

    useEffect(() => {
    if (entityType === "user") {
      const email = `${firstName.replace(/\s+/g, '').toLowerCase()}.${lastName.replace(/\s+/g, '').toLowerCase()}@cit.edu`;
      setData((prevData) => ({ ...prevData, email }));
    }
  }, [firstName, lastName, entityType]);

  //AUTO-ID
  // const handleAdd = async (e) => {
  //   e.preventDefault();
  //   try {
  //     let collectionName;

  //     switch (entityType) {
  //       case "user":
  //         collectionName = "users";
  //         break;
  //       case "class":
  //         collectionName = "classes";
  //         break;
  //       default:
  //         throw new Error("Invalid entityType");
  //     }

  //     if (entityType === "user") {
  //       const res = await createUserWithEmailAndPassword(
  //         auth,
  //         data.email,
  //         data.password
  //       );

  //       // await setDoc(doc(db, collectionName, res.user.uid)
  //       await setDoc(doc(db, collectionName, res.user.uid), {
  //         ...data,
  //         timeStamp: serverTimestamp(),
  //         // classes: [], // Initialize classes array for the user
  //         // attendanceRecords: [], // Initialize attendanceRecords array for the user
  //       });
  //     } else {
  //       await addDoc(collection(db, collectionName), {
  //         ...data,
  //         // instructor: null, // Initialize instructor reference as null
  //         // studentsEnrolled: [], // Initialize studentsEnrolled array for the class
  //         // attendanceRecords: [], // Initialize attendanceRecords array for the class
  //       });
  //     }

  //     navigate(-1);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  //CUSTOM ID
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      let collectionName;
      let docId; // Document ID variable
      let newData = { ...data }; // Create a new object to avoid reassignment
  
      switch (entityType) {
        case "user":
          collectionName = "users";
          // Use idNum as document ID for users
          docId = newData.idNum;
          break;
        case "class":
          collectionName = "classes";
          // Create a custom document ID based on class attributes
          docId = `${newData.classCode}_${newData.classSec}_${newData.semester}_${newData.schoolYear}`;
          // Add the "Ongoing" attribute set to false
          newData = { ...newData, Ongoing: false };
          break;
        case "room":
          collectionName = "rooms";
          break;
        default:
          throw new Error("Invalid entityType");
      }
  
      if (entityType === "user") {
        const res = await createUserWithEmailAndPassword(
          auth,
          newData.email,
          newData.password
        );
        
        await setDoc(doc(db, collectionName, res.user.uid), {
        // await setDoc(doc(db, collectionName, docId), {
          ...newData,
          timeStamp: serverTimestamp(),
          // classes: [], // Initialize classes array for the user
          // attendanceRecords: [], // Initialize attendanceRecords array for the user
        });
      } else {
        await addDoc(collection(db, collectionName), {
          ...newData,
          // instructor: null, // Initialize instructor reference as null
          // studentsEnrolled: [], // Initialize studentsEnrolled array for the class
          // attendanceRecords: [], // Initialize attendanceRecords array for the class
        });
      }
  
      navigate(-1);
    } catch (err) {
      console.log(err);
    }
    setShowModal(true);
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

  // const handleAddClick = () => {
    
  // };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="topn">
          <ArrowBackIcon onClick={handleBack} className="backButton" />
          <h2 className="titlen">{title}</h2>
        </div>
        <div className="bottomn">
          <div className="leftn">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"
              }
              className="newImg"
            />
          </div>
          <div className="rightn">
            <form className="formn" onSubmit={handleAdd}>
              <div className="formInput">
                <label className="labeln" htmlFor="file">
                  Image: <DriveFolderUploadIcon className="iconn" />
                </label>
                <input
                  className="inputn"
                  onChange={(e) => setFile(e.target.files[0])}
                  type="file"
                  id="file"
                  style={{ display: "none" }}
                />
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label className="labeln" htmlFor={input.id}>
                    {input.label}
                  </label>
                  {input.id === "days" ? (
                    <div>
                      {input.options.map((option) => (
                        <div key={option} className="checkboxWrapper">
                          <input
                            id={option}
                            type="checkbox"
                            value={option}
                            onChange={handleCheckboxChange}
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
                    >
                      {input.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : input.id === "email" && entityType === "user" ? (
                    <input
                      className="inputn"
                      id={input.id}
                      type={input.type}
                      placeholder={input.placeholder}
                      value={data.email || ""}
                      disabled
                    />
                  ) : (
                    <input
                      className="inputn"
                      id={input.id}
                      type={input.type}
                      placeholder={input.placeholder}
                      pattern={input.pattern}
                      onChange={handleInput}
                      required
                    />
                  )}
                </div>
              ))}

              <button
                onClick={handleAdd}
                disabled={perc !== null && perc < 100}
                className="buttonn"
                type="submit"
              >
                Submit
              </button>
            </form>
          </div>
          {showModal && <AddModal />}
        </div>
      </div>
    </div>
  );
};

export default New;