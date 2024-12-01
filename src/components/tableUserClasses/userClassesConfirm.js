import React from "react";
import "./tableUserClasses.css"; // Reuse the same modal styles

const UserClassesConfirm = ({ isOpen, onConfirm, onCancel, firstName, lastName, classCode, classSec, classType, semester, schoolYear 
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="overlay"></div>
      <div className="container">
        <div className="dialog">
          <h2>Confirm Enrollment?</h2>
          {/* <p>
            Enroll <strong>{firstName} {lastName}</strong> to 
            <strong> {classCode}-{classSec} ({classType})</strong> 
            <br />
            {semester} {schoolYear}?
          </p> */}
        </div>
        <div className="button">
          <button onClick={onCancel}>
            Cancel
          </button>
          <button onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </>
  );
};

export default UserClassesConfirm;
