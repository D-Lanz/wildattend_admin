import "./new.css";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddModal from '../../components/CRUDmodals/AddModal';
import SuccessModal from "../../components/CRUDmodals/SuccessModal";
import ErrorModal from "../../components/CRUDmodals/ErrorModal";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Add this for the eye icon
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
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [perc, setPerc] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false); // State for error modal
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  useEffect(() => {
    // Only upload file if entityType is not "accessPoint" or "room"
    if (file && entityType !== "accessPoint" && entityType !== "room") {
      const uploadFile = () => {
        const name = new Date().getTime() + file.name;
        const storageRef = ref(storage, name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setPerc(progress);
          },
          (error) => console.log(error),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setData((prev) => ({ ...prev, img: downloadURL }));
            });
          }
        );
      };

      uploadFile();
    }
  }, [file, entityType]);

  useEffect(() => {
    if (entityType === "user") {
      const email = `${firstName.replace(/\s+/g, '').toLowerCase()}.${lastName.replace(/\s+/g, '').toLowerCase()}@cit.edu`;
      setData((prevData) => ({ ...prevData, email }));
    }
  }, [firstName, lastName, entityType]);

  const handleInput = (e) => {
    const { id, value } = e.target;
    setData((prevData) => ({ ...prevData, [id]: value }));

    if (id === "firstName") setFirstName(value);
    if (id === "lastName") {
      setLastName(value);
      const generatedPassword = `${value.toLowerCase()}.123456CITU`;
      setPassword(generatedPassword);
      setData((prevData) => ({ ...prevData, password: generatedPassword }));
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
  
    try {
      let collectionName;
      let newData = { ...data };
      let classRef;
  
      switch (entityType) {
        case "user":
          collectionName = "users";
          // Creating the user with email and password
          const res = await createUserWithEmailAndPassword(auth, newData.email, newData.password);
          // Adding user to the Firestore with auto-generated ID
          await setDoc(doc(db, collectionName, res.user.uid), {
            ...newData,
            timeStamp: serverTimestamp(),
          });
          break;
        case "class":
          collectionName = "classes";
          newData = { ...newData, Ongoing: false };
          // Using addDoc to create a new class with an auto-generated ID
          classRef = await addDoc(collection(db, collectionName), {
            ...newData,
            timeStamp: serverTimestamp(),
          });
          
          // Create a userClasses document for the creator
          const userID = auth.currentUser.uid; // Get current user ID (creator)
          await addDoc(collection(db, "userClasses"), {
            userID: userID,
            classID: classRef.id, // Reference to the newly created class
            enrollDate: serverTimestamp(),
          });
          break;
        case "room":
          collectionName = "rooms";
          await addDoc(collection(db, collectionName), {
            ...newData,
            timeStamp: serverTimestamp(),
          });
          break;
        case "accessPoint":
          collectionName = "accessPoints";
          await addDoc(collection(db, collectionName), {
            ...newData,
            timeStamp: serverTimestamp(),
          });
          break;
        default:
          throw new Error("Invalid entityType");
      }
  
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err.message); // Set the error message
      setShowErrorModal(true); // Show the error modal
      console.log(err);
    }
  };
  

  const handleCheckboxChange = (e) => {
    const { value: day, checked: isChecked } = e.target;
    setData((prevData) => ({
      ...prevData,
      days: { ...prevData.days, [day]: isChecked },
    }));
  };

  const togglePasswordVisibility = () => setShowPassword((prevShowPassword) => !prevShowPassword);

  const handleAddClick = (e) => {
    e.preventDefault();
    setShowAddModal(true);
  };

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
          {entityType !== "accessPoint" && entityType !== "room" && (
            <>
              <div className="leftn">
                <img
                  src={file ? URL.createObjectURL(file) : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"}
                  className="newImg"
                />
              </div>
            </>
          )}
          <div className="rightn">
            <form className="formn" onSubmit={handleAdd}>
            <div className="formInput">
              {entityType !== "accessPoint" && entityType !== "room" && (
                <>
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
                </>
              )}
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
                  ) : input.type === "radio" ? (
                    <div>
                      {input.options.map((option) => (
                        <div key={option}>
                          <input
                            type="radio"
                            id={input.id}
                            name={input.id} // All radio buttons need the same name to be grouped
                            value={option}
                            onChange={handleInput}
                            required
                          />
                          <label htmlFor={`${input.id}`}>{option}</label>
                        </div>
                      ))}
                    </div>
                  ) : input.id === "email" && entityType === "user" ? (
                    <input
                      className="inputn"
                      id={input.id}
                      type={input.type}
                      value={data.email || ""}
                      disabled
                    />
                  ) : input.id === "password" && entityType === "user" ? (
                    <div className="passwordInputWrapper">
                      <input
                        className="inputn"
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        disabled
                      />
                      <button type="button" onClick={togglePasswordVisibility} className="passwordToggle">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </button>
                    </div>
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
                onClick={handleAddClick}
                disabled={perc !== null && perc < 100}
                className="buttonn"
                type="submit"
              >
                Submit
              </button>
            </form>
          </div>

          {showAddModal && (
            <AddModal
              entityType={entityType}
              onConfirm={handleAdd}
              onCancel={() => setShowAddModal(false)}
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

          {showErrorModal && (
            <ErrorModal
              errorMessage={errorMessage}
              onClose={() => setShowErrorModal(false)}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default New;