import "./new.css";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddModal from "../../components/CRUDmodals/AddModal";
import SuccessModal from "../../components/CRUDmodals/SuccessModal";
import ErrorModal from "../../components/CRUDmodals/ErrorModal";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);

  useEffect(() => {
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

  const handleInput = (e) => {
    const { id, value } = e.target;

    if (id === "schoolYear" && !/^\d{0,4}$/.test(value)) {
      return; // Prevent input if it exceeds 4 digits
    }

    setData((prevData) => ({ ...prevData, [id]: value }));

    if (id === "firstName") {
      setFirstName(value);
      const generatedEmail = `${value.replace(/\s+/g, "").toLowerCase()}.${lastName.replace(/\s+/g, "").toLowerCase()}@cit.edu`;
      setData((prevData) => ({ ...prevData, email: generatedEmail }));
    }

    if (id === "lastName") {
      setLastName(value);
      const generatedEmail = `${firstName.replace(/\s+/g, "").toLowerCase()}.${value.replace(/\s+/g, "").toLowerCase()}@cit.edu`;
      const generatedPassword = `${value.toLowerCase()}.123456CITU`;
      setPassword(generatedPassword);
      setData((prevData) => ({
        ...prevData,
        email: generatedEmail,
        password: generatedPassword,
      }));
    }
  };

  const validateInputs = () => {
    for (const input of inputs) {
      if (input.id !== "ip_address" && !data[input.id]) {
        setErrorMessage(`The field "${input.label}" is required.`);
        return false;
      }
      if (input.id === "schoolYear" && data[input.id].length > 4) {
        setErrorMessage("School Year must be exactly 4 digits.");
        return false;
      }
    }
    return true;
  };

  const handleAddClick = (e) => {
    e.preventDefault();

    if (validateInputs()) {
      setShowAddModal(true);
    } else {
      setShowErrorModal(true);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
  
    const currentUser = auth.currentUser; // Save the current admin user
    try {
      let collectionName;
      let newData = { ...data };
  
      if (!newData.img) {
        newData.img = "https://static.vecteezy.com/system/resources/previews/033/176/717/non_2x/online-course-icon-vector.jpg";
      }
  
      let classRef;
      switch (entityType) {
        case "user":
          collectionName = "users";
  
          // Create the new user
          const res = await createUserWithEmailAndPassword(auth, newData.email, newData.password);
  
          // Save the new user data in Firestore
          await setDoc(doc(db, collectionName, res.user.uid), {
            ...newData,
            timeStamp: serverTimestamp(),
          });
  
          // Reauthenticate the current admin user
          if (currentUser) {
            await auth.updateCurrentUser(currentUser);
          }
          break;
        case "class":
          collectionName = "classes";
          newData = { ...newData, Ongoing: false };
          classRef = await addDoc(collection(db, collectionName), {
            ...newData,
            timeStamp: serverTimestamp(),
          });
          const userID = auth.currentUser.uid;
          await addDoc(collection(db, "userClasses"), {
            userID: userID,
            classID: classRef.id,
            enrollDate: serverTimestamp(),
          });
          break;
      }
  
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err.message);
      setShowErrorModal(true);
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
            <div className="leftn">
              <img
                src={file ? URL.createObjectURL(file) : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"}
                className="newImg"
              />
            </div>
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
                            name={input.id}
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
                      required={input.id !== "ip_address"}
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
