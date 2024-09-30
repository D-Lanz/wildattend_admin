import React from "react";
import "./modal.css"; // Add your own styling

const ErrorModal = ({ errorMessage, onClose }) => {
  return (
    <>
    <div className="overlay"></div>
      <div className="container">
        <div className="dialog">
          <h2>Error</h2>
          <p>{errorMessage}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
};

export default ErrorModal;
