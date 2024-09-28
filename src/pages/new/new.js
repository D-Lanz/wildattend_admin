import "./new.css";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddModal from '../../components/CRUDmodals/AddModal';
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
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [perc, setPerc] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;
      console.log(name);

      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

      // Automatically generate password when lastName is populated
      const generatedPassword = `${value.toLowerCase()}.123456CITU`;
      setPassword(generatedPassword); // Update password state
      setData((prevData) => ({ ...prevData, password: generatedPassword })); // Update data state with password
    }
  };

  useEffect(() => {
    if (entityType === "user") {
      const email = `${firstName.replace(/\s+/g, '').toLowerCase()}.${lastName.replace(/\s+/g, '').toLowerCase()}@cit.edu`;
      setData((prevData) => ({ ...prevData, email }));
    }
  }, [firstName, lastName, entityType]);

  const handleCheckboxChange = (e) => {
    const day = e.target.value;
    const isChecked = e.target.checked;

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

  const handleAdd = (e) => {
    e.preventDefault();
    setShowModal(true); // Show confirmation modal
  };

  const handleConfirm = async () => {
    try {
      let collectionName;
      let docId; // Document ID variable
      let newData = { ...data }; // Create a new object to avoid reassignment

      switch (entityType) {
        case "user":
          collectionName = "users";
          docId = newData.idNum; // Use idNum as document ID for users
          const res = await createUserWithEmailAndPassword(
            auth,
            newData.email,
            newData.password
          );
          await setDoc(doc(db, collectionName, res.user.uid), {
            ...newData,
            timeStamp: serverTimestamp(),
          });
          break;
        case "class":
          collectionName = "classes";
          docId = `${newData.classCode}_${newData.classSec}_${newData.semester}_${newData.schoolYear}`;
          newData = { ...newData, Ongoing: false };
          await setDoc(doc(db, collectionName, docId), {
            ...newData,
            timeStamp: serverTimestamp(),
          });
          break;
        case "room":
          collectionName = "rooms";
          await addDoc(collection(db, collectionName), {
            ...newData,
            timeStamp: serverTimestamp(),
          });
          break;
        default:
          throw new Error("Invalid entityType");
      }

      setShowModal(false); // Close the modal after successful addition
      navigate(-1); // Navigate back or to another page as needed
    } catch (err) {
      console.log(err);
      setShowModal(false); // Close the modal if there's an error
    }
  };

  const handleCancel = () => {
    setShowModal(false); // Close modal without confirming
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
                      value={data[input.id] || input.options[0]} // Set default to the first option "Student"
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
                  ) : input.id === "password" && entityType === "user" ? (
                    <div className="passwordInputWrapper">
                      <input
                        className="inputn"
                        id="password"
                        type={showPassword ? "text" : "password"} // Toggle visibility
                        placeholder={input.placeholder}
                        value={password}
                        disabled
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="passwordToggle"
                      >
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
                onClick={handleAdd}
                disabled={perc !== null && perc < 100}
                className="buttonn"
                type="submit"
              >
                Submit
              </button>
            </form>
          </div>
          {showModal && (
            <AddModal
              entityType={entityType}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default New;