import React from 'react';
import './modal.css'; // Ensure this file is imported for styling

const PreviewModal = ({ onClose, onConfirm, onBack, previewData }) => {
  const defaultData = {
    alreadyEnrolled: [],
    registered: [],
    notYetRegistered: []
  };

  const data = previewData || defaultData;

  return (
    <div className="modalOverlay">
      <div className="modalContainer">
        <div className="modalHeader">
          <h2>Enrollment Preview</h2>
          <button className="closeButton" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modalBody">
          <h3>Already Enrolled:</h3>
          <ul>
            {data.alreadyEnrolled.map((user, index) => (
              <li key={index}>
                {user.firstName} {user.lastName} ({user.idNum})
              </li>
            ))}
          </ul>

          <h3>Not Yet Enrolled:</h3>
          <h4>Registered:</h4>
          <ul>
            {data.registered.map((user, index) => (
              <li key={index}>
                {user.firstName} {user.lastName} ({user.idNum})
              </li>
            ))}
          </ul>
          <h4>Not Yet Registered:</h4>
          <ul>
            {data.notYetRegistered.map((user, index) => (
              <li key={index}>
                {user.firstName} {user.lastName} ({user.idNum})
              </li>
            ))}
          </ul>
          <p>Do you want to finalize enrollment?</p>
        </div>
        <div className="modalFooter">
          <button className="modalButton" onClick={onBack}>
            Back
          </button>
          <button className="modalButton" onClick={onConfirm}>
            Finalize Enrollment
          </button>
          <button className="modalButton" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
