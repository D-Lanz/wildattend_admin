import "./new2.css";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect, useState } from "react";
import { collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const New2 = ({ inputs, title, entityType }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({});

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    setData({ ...data, [id]: value });
  };

  const handleAdd = async (e) => {
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
        default:
          throw new Error("Invalid entityType");
      }

      if (entityType === "user") {
        const res = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        await setDoc(doc(db, collectionName, res.user.uid), {
          ...data,
          timeStamp: serverTimestamp(),
          // classes: [], // Initialize classes array for the user
          // attendanceRecords: [], // Initialize attendanceRecords array for the user
        });
      } else {
        await addDoc(collection(db, collectionName), {
          ...data,
          instructor: null, // Initialize instructor reference as null
          // studentsEnrolled: [], // Initialize studentsEnrolled array for the class
          // attendanceRecords: [], // Initialize attendanceRecords array for the class
        });
      }

      navigate(-1);
    } catch (err) {
      console.log(err);
    }
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the last page
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
          </div>
          <div className="rightn">
            <form className="formn" onSubmit={handleAdd}>
              <div className="formInput">
                {/* <input
                  className="inputn"
                  onChange={(e) => setFile(e.target.files[0])}
                  type="file"
                  id="file"
                  style={{ display: "none" }}
                /> */}
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label className="labeln" htmlFor={input.id}>
                    {input.label}
                  </label>
                  {input.type === "dropdown" ? (
                    // Check if input type is dropdown
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
                    />
                  )}
                </div>
              ))}

              <button
                className="buttonn"
                type="submit"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New2;
