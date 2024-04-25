import React from "react";
import "./logout.css";

const LogoutConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <>
      <div className="overlay"></div>
      <div className="container">
        <div className="dialog">
          <p>Are you sure you want to logout?</p>
        </div>
        <div className="button">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Logout</button>
        </div>
      </div>
    </>
  );
};

export default LogoutConfirmation;
