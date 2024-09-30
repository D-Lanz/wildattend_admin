import React from "react";
import "./modal.css";

const AddModal = ({ entityType, onConfirm, onCancel }) => {
  return (
    <>
      <div className="overlay"></div>
      <div className="container">
        <div className="dialog">
          <p>{`Are you sure you want to create new ${entityType}?`}</p>
        </div>
        <div className="button">
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </>
  );
};

export default AddModal;