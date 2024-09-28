import React from "react";
import "./modal.css";

const UpdateModal = ({ onConfirm, onCancel }) => {
  return (
    <>
      <div className="overlay"></div>
      <div className="container">
        <div className="dialog">
          <p>Update Success</p>
        </div>
        <div className="button">
          <button>Okay</button>
        </div>
      </div>
    </>
  );
};

export default UpdateModal;