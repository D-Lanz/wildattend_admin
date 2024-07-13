import React from "react";
import "./RemoveModal.css";

const RemoveModal = ({ onConfirm, onCancel }) => {
  return (
    <>
      <div className="overlay"></div>
      <div className="container">
        <div className="dialog">
          <p>Are you sure you want to remove?</p>
        </div>
        <div className="button">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Remove</button>
        </div>
      </div>
    </>
  );
};

export default RemoveModal;
