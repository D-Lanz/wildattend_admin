import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { db, auth } from "../../firebase";
import { doc, getDoc, collection, getDocs, setDoc, query, where, writeBatch, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './modal.css';
import PreviewModal from './previewModal';

const ImportModal = ({ onClose, onConfirm, classID }) => {
  const [csvData, setCsvData] = useState([]);
  const [fileError, setFileError] = useState('');
  const [classDetails, setClassDetails] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const preparePreviewData = async () => {
    if (!csvData || csvData.length === 0) {
      setFileError('No CSV data available.');
      return;
    }
  
    const alreadyEnrolled = [];
    const registered = [];
    const notYetRegistered = [];
  
    const usersCollection = collection(db, 'users');
    const userClassesCollection = collection(db, 'userClasses');
  
    // Define default values
    const defaultImg = 'https://cdn-icons-png.flaticon.com/512/201/201818.png';
    const defaultRole = 'Student';
  
    // Map CSV headers to Firestore fields
    const headerMap = {
      'ID Number': 'idNum',
      'Last Name': 'lastName',
      'First Name': 'firstName',
      'Institutional Email': 'email',
      'Department': 'department'
    };
  
    for (const row of csvData) {
      const mappedRow = Object.keys(headerMap).reduce((acc, header) => {
        const field = headerMap[header];
        acc[field] = row[header] || '';
        return acc;
      }, {});
  
      const idNum = mappedRow.idNum || '';
      const lastName = mappedRow.lastName || '';
      const firstName = mappedRow.firstName || '';
      const email = mappedRow.email || '';
      const department = mappedRow.department || '';
  
      if (!idNum || !lastName || !firstName || !email) {
        console.warn('Skipping row with missing essential data:', mappedRow);
        continue;
      }
  
      const userQuery = query(
        usersCollection,
        where('idNum', '==', idNum),
        where('lastName', '==', lastName),
        where('firstName', '==', firstName),
        where('email', '==', email)
      );
  
      const userSnapshot = await getDocs(userQuery);
  
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userId = userDoc.id;
        const userClassesQuery = query(
          userClassesCollection,
          where('classID', '==', classID),
          where('userID', '==', userId)
        );
  
        const userClassesSnapshot = await getDocs(userClassesQuery);
  
        if (!userClassesSnapshot.empty) {
          alreadyEnrolled.push({
            idNum,
            lastName,
            firstName
          });
        } else {
          registered.push({
            idNum,
            lastName,
            firstName,
            email,
            department
          });
        }
      } else {
        notYetRegistered.push({
          idNum,
          lastName,
          firstName,
          email,
          department
        });
      }
    }
  
    setPreviewData({ alreadyEnrolled, registered, notYetRegistered });
    setShowPreview(true);
  };  

  const handleFinalize = async () => {
    if (!csvData || csvData.length === 0) {
      setFileError('No CSV data available.');
      return;
    }

    const batch = writeBatch(db);
    const usersCollection = collection(db, 'users');
    const userClassesCollection = collection(db, 'userClasses');

    // Define default values
    const defaultImg = 'https://cdn-icons-png.flaticon.com/512/201/201818.png';
    const defaultRole = 'Student';

    const headerMap = {
      'ID Number': 'idNum',
      'Last Name': 'lastName',
      'First Name': 'firstName',
      'Institutional Email': 'email',
      'Department': 'department'
    };

    for (const row of csvData) {
      const mappedRow = Object.keys(headerMap).reduce((acc, header) => {
        const field = headerMap[header];
        acc[field] = row[header] || '';
        return acc;
      }, {});

      const idNum = mappedRow.idNum || '';
      const lastName = mappedRow.lastName || '';
      const firstName = mappedRow.firstName || '';
      const email = mappedRow.email || '';
      const department = mappedRow.department || '';

      if (!idNum || !lastName || !firstName || !email) {
        console.warn('Skipping row with missing essential data:', mappedRow);
        continue;
      }

      const password = `${lastName.toLowerCase()}.123456CITU`;

      const userQuery = query(
        usersCollection,
        where('idNum', '==', idNum),
        where('lastName', '==', lastName),
        where('firstName', '==', firstName),
        where('email', '==', email)
      );

      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        userSnapshot.forEach(async (userDoc) => {
          const userId = userDoc.id;

          const userUpdate = {
            img: userDoc.data().img || defaultImg,
            password: userDoc.data().password || password,
            role: userDoc.data().role || defaultRole,
            timestamp: userDoc.data().timestamp || new Date(),
          };

          batch.update(doc(db, 'users', userId), userUpdate);

          const userClassesQuery = query(
            userClassesCollection,
            where('classID', '==', classID),
            where('userID', '==', userId)
          );

          const userClassesSnapshot = await getDocs(userClassesQuery);

          if (userClassesSnapshot.empty) {
            const userClassesDoc = {
              classID: classID,
              enrollDate: new Date(),
              userID: userId,
            };

            const userClassesRef = await addDoc(userClassesCollection, userClassesDoc);
            console.log('Created userClasses document with ID:', userClassesRef.id);
          } else {
            console.log('User is already enrolled in this class.');
          }
        });
      } else {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUserUid = userCredential.user.uid;

          const newUser = {
            idNum: idNum,
            lastName: lastName,
            firstName: firstName,
            email: email,
            department: department,
            img: defaultImg,
            password: password,
            role: defaultRole,
            timestamp: new Date(),
          };

          batch.set(doc(db, 'users', newUserUid), newUser);

          const userClassesDoc = {
            classID: classID,
            enrollDate: new Date(),
            userID: newUserUid,
          };

          const userClassesRef = await addDoc(userClassesCollection, userClassesDoc);
          console.log('Created userClasses document with ID:', userClassesRef.id);
        } catch (authError) {
          console.error('Error creating user in Firebase Authentication:', authError);
        }
      }
    }

    try {
      await batch.commit();
      alert('Data imported successfully!');
      onClose();
    } catch (error) {
      console.error('Error importing data:', error);
      setFileError('Error importing data. Please try again.');
    }
  };

  return (
    <div>
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
            <p>Upload a .csv file containing student data</p>
            <p><b>ID Number | Last Name | First Name | Institutional Email | Department</b></p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="fileInput"
            />
            {fileError && <p className="errorText">{fileError}</p>}

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
            <button className="modalButton" onClick={preparePreviewData}>
              Preview
            </button>
            <button className="modalButton" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
      {showPreview && previewData && (
        <PreviewModal
          onClose={() => setShowPreview(false)}
          onConfirm={handleFinalize}
          previewData={previewData}
        />
      )}
    </div>
  );
};

export default ImportModal;
