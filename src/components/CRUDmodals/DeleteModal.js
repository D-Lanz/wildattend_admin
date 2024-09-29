import React from "react";
import "./modal.css";

const DeleteModal = ({ onConfirm, onCancel }) => {
  return (
    <>
      <div className="overlay"></div>
      <div className="container">
        <div className="dialog">
          <p>Are you sure you want to delete?</p>
        </div>
        <div className="button">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </>
  );
};

export default DeleteModal;
