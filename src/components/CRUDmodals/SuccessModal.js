import React from "react";
import "./modal.css";  // Ensure this file has basic styling for modals

const SuccessModal = ({ actionType, entityName, onClose }) => {
  let message = "";
  let actionText = "";

  // Determine message and action text based on the actionType (add, update, delete)
  switch (actionType) {
    case "add":
      message = `${entityName} has been added successfully!`;
      actionText = "Add Another";
      break;
    case "update":
      message = `${entityName} has been updated successfully!`;
      actionText = "Edit Again";
      break;
    case "delete":
      message = `${entityName} has been deleted successfully!`;
      actionText = "Go Back";
      break;
    default:
      message = "Operation was successful!";
      actionText = "Continue";
  }

  return (
    <>
      <div className="overlay"></div>
      <div className="container">
        <div className="dialog">
          <h2>Success!</h2>
          <p>{message}</p>
        </div>
        <div className="button">
          <button onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default SuccessModal;
