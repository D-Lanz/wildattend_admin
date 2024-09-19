import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { db } from "../../firebase";
import { doc, getDoc, collection, getDocs, setDoc, query, where, writeBatch } from 'firebase/firestore';
import './importModal.css'; // Import the CSS file for styling

const ImportModal = ({ onClose, onConfirm, classID }) => {
  const [csvData, setCsvData] = useState([]);
  const [fileError, setFileError] = useState('');
  const [classDetails, setClassDetails] = useState(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        if (!classID) {
          throw new Error('Class ID is missing');
        }

        const classRef = doc(db, 'classes', classID);
        const classDoc = await getDoc(classRef);

        if (classDoc.exists()) {
          setClassDetails(classDoc.data());
        } else {
          console.error('Class not found');
        }
      } catch (error) {
        console.error('Error fetching class details:', error);
      }
    };

    fetchClassDetails();
  }, [classID]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (file && file.type === 'text/csv') {
      setFileError('');
      Papa.parse(file, {
        complete: (result) => {
          setCsvData(result.data);
        },
        header: true,
        skipEmptyLines: true,
      });
    } else {
      setFileError('Please upload a valid .csv file.');
    }
  };

  const importCSVData = async () => {
    if (!csvData || csvData.length === 0) {
      setFileError('No CSV data available.');
      return;
    }
    
    const batch = writeBatch(db); // Create a batch instance
    const usersCollection = collection(db, 'users');
    const userClassesCollection = collection(db, 'userClasses');
    
    // Define default values
    const defaultImg = 'https://cdn-icons-png.flaticon.com/512/201/201818.png';
    const defaultRole = 'Student';
    const defaultPasswordSuffix = '123456CITU';
    
    for (const row of csvData) {
      // Extract fields with default values if missing
      const idNum = row.idNum || '';
      const lastName = row.lastName || '';
      const firstName = row.firstName || '';
      const email = row.email || '';
      const department = row.department || '';
    
      // Skip rows with critical missing fields
      if (!idNum || !lastName || !firstName || !email) {
        console.warn('Skipping row with missing data:', row);
        continue;
      }
    
      // Check for existing user document
      const userQuery = query(
        usersCollection,
        where('idNum', '==', idNum),
        where('lastName', '==', lastName),
        where('firstName', '==', firstName),
        where('email', '==', email)
      );
    
      const userSnapshot = await getDocs(userQuery);
    
      if (!userSnapshot.empty) {
        userSnapshot.forEach((userDoc) => {
          const userId = userDoc.id;
          const userData = userDoc.data();
    
          // Update user document with default values if needed
          const userUpdate = {
            img: userData.img || defaultImg,
            password: userData.password || `${lastName}.${defaultPasswordSuffix}`,
            role: userData.role || defaultRole,
            timestamp: userData.timestamp || new Date(),
          };
    
          // Create or update userClasses document
          const userClassesDoc = {
            classID: classID,
            enrollDate: new Date(),
            userID: userId,
          };
    
          batch.update(userDoc.ref, userUpdate);
          batch.set(doc(userClassesCollection, userId), userClassesDoc);
        });
      } else {
        // Handle cases where the user does not exist
        const newUser = {
          idNum: idNum,
          lastName: lastName,
          firstName: firstName,
          email: email,
          department: department,
          img: defaultImg,
          password: `${lastName}.${defaultPasswordSuffix}`,
          role: defaultRole,
          timestamp: new Date(),
        };
    
        // Add new user to Firestore
        const newUserRef = doc(usersCollection);
        batch.set(newUserRef, newUser);
    
        // Create a userClasses document
        const userClassesDoc = {
          classID: classID,
          enrollDate: new Date(),
          userID: newUserRef.id,
        };
    
        batch.set(doc(userClassesCollection, newUserRef.id), userClassesDoc);
      }
    }
    
    try {
      await batch.commit();
      alert('Data imported successfully!');
      onClose(); // Close the modal after successful import
    } catch (error) {
      console.error('Error importing data:', error);
      setFileError('Error importing data. Please try again.');
    }
  };
  

  return (
    <div className="modalOverlay">
      <div className="modalContainer">
        <div className="modalHeader">
          <h2>
            {classDetails
              ? `Enroll Students to ${classDetails.classCode}-${classDetails.classSec} SY ${classDetails.schoolYear} (${classDetails.classType})`
              : 'Loading class details...'}
          </h2>
          <button className="closeButton" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modalBody">
          <p>Upload a .csv file containing student data (ID Number, Last Name, First Name).</p>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="fileInput"
          />
          {fileError && <p className="errorText">{fileError}</p>}

          {/* Display CSV contents in a table if data is available */}
          {csvData.length > 0 && (
            <div className="tableContainer">
              <table className="csvTable">
                <thead>
                  <tr>
                    {Object.keys(csvData[0]).map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="modalFooter">
          <button className="modalButton" onClick={importCSVData}>
            Confirm
          </button>
          <button className="modalButton" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
