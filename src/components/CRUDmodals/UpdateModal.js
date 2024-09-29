import React from "react";
import "./modal.css";

const UpdateModal = ({ entityType, onConfirm, onCancel }) => {
  return (
    <>
      <div className="overlay"></div>
      <div className="container">
        <div className="dialog">
          <p>{`Are you sure you want edit this ${entityType}'s new information?`}</p>
        </div>
        <div className="button">
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </>
  );
};

export default UpdateModal;