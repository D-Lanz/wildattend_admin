import React from "react";
import "./AddModal.css";

const AddModal = ({ onConfirm, onCancel }) => {
  return (
    <>
      <div className="overlay"></div>
      <div className="container">
        <div className="dialog">
          <p>Add Success</p>
        </div>
        <div className="button">
          <button>Okay</button>
        </div>
      </div>
    </>
  );
};

export default AddModal;