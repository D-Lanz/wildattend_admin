import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./tableUserClasses.css"; 

const UserClassesModal = ({ isOpen, onClose, userId, classCode, classSec, classType, userClassId }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      if (userId) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const { firstName, lastName } = userDoc.data();
            setUserName(`${firstName} ${lastName}`);
          } else {
            setUserName("Unknown User");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          setUserName("Unknown User");
        }
      }
    };

    fetchUserName();
  }, [userId]);

  if (!isOpen) return null; // Don't render the modal if not open

  const handleRedirect = () => {
    navigate(`/userClasses/${userClassId}`);
  };

  return (
    <>
      <div className="overlay"></div>
      <div className="container">
        <div className="dialog">
          <h2>Success!</h2>
          {/* <p>
            <strong>{userName}</strong> has been successfully enrolled to 
            <strong> {classCode}-{classSec} ({classType})</strong>.
          </p> */}
        </div>
        <div className="button">
          <button onClick={onClose}>
            Close
          </button>
          <button onClick={handleRedirect}>
            View Enrollment
          </button>
        </div>
      </div>
    </>
  );
};

export default UserClassesModal;
