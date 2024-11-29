import { useState, useEffect } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from "../../firebase"; // Firebase db import
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Widget from "../../components/widget/widget";
import DateTimeWidget from "../../components/dateTimeWidget/dateTimeWidget";
import "./dashboard.css";

const Dashboard = () => {
  const [lastname, setLastname] = useState(''); // State for user's lastname
  const [firstname, setFirstname] = useState(''); // State for user's firstname
  const [idNum, setIdNum] = useState(''); // State for user's idNum
  const [role, setRole] = useState(''); // State for user's role
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [searchText, setSearchText] = useState(''); // Search text state
  const [suggestions, setSuggestions] = useState([]); // Suggestions state
  const [searchLoading, setSearchLoading] = useState(false); // Search loading state
  const navigate = useNavigate(); // For navigation

  const collectionsToSearch = [
    { name: 'users', fields: ['email', 'firstName', 'idNum', 'lastName'] },
    { name: 'rooms', fields: ['building', 'roomNum'] },
    { name: 'classes', fields: ['classCode', 'classSec'] },
    { name: 'accessPoints', fields: ['macAddress'] }
  ];

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true); // Start loading
        const userDoc = doc(db, 'users', user.uid); // Assumes user info is stored under 'users' collection
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setLastname(userData.lastName); // Set last name
          setFirstname(userData.firstName); // Set first name
          setIdNum(userData.idNum); // Set ID number
          setRole(userData.role); // Set role
        } else {
          console.log('No such document!');
        }
        setLoading(false); // End loading
      } else {
        // If no user is logged in, clear the data
        setLastname('');
        setFirstname('');
        setIdNum('');
        setRole('');
        setLoading(false);
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setSearchLoading(true);
      try {
        const allSuggestions = [];

        for (const { name: collectionName, fields } of collectionsToSearch) {
          const colRef = collection(db, collectionName);

          // Create queries for each field
          for (const field of fields) {
            const q = query(colRef, where(field, '>=', searchText), where(field, '<=', searchText + '\uf8ff'));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
              allSuggestions.push({
                collection: collectionName,
                id: doc.id,
                ...doc.data()
              });
            });
          }
        }

        setSuggestions(allSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchSuggestions();
  }, [searchText]);

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        
        {/* Display user information with loading state */}
        {loading ? (
          <div className="greeting">
            <p>Loading user information...</p>
          </div>
        ) : (
          <div className="greeting">
            <p>Welcome, {firstname} {lastname}!</p>
          </div>
        )}

        
        {/* Integrated SearchBar */}
        <div className="search-bar-container">
          <Autocomplete
            freeSolo
            options={suggestions.map(option => {
              const displayFields = {
                users: `${option.firstName} ${option.lastName} (${option.email})`,
                rooms: `${option.building} ${option.roomNum}`,
                classes: `${option.classCode} ${option.classSec}`,
                accessPoints: `${option.macAddress}`
              };

              return {
                label: `${option.collection}: ${displayFields[option.collection] || ''}`,
                id: option.id
              };
            })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search"
                variant="outlined"
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            onInputChange={(event, value) => {
              setSearchText(value);
            }}
            onChange={(event, value) => {
              if (value) {
                console.log('Selected Value:', value);
                // Navigate based on the collection type
                switch (value.label.split(':')[0]) {
                  case 'users':
                    navigate(`/users/${value.id}`); // Navigate to user page
                    break;
                  case 'rooms':
                    navigate(`/rooms/${value.id}`); // Navigate to room page
                    break;
                  case 'classes':
                    navigate(`/classes/${value.id}`); // Navigate to class page
                    break;
                  case 'accessPoints':
                    navigate(`/accessPoints/${value.id}`); // Navigate to access point page
                    break;
                  default:
                    console.error('Unknown collection type');
                }
              }
            }}
          />
        </div>
        
        <div className="widgets">
          <Widget type="user" />
          <Widget type="faculty" />
        </div>
        
        <div className="widgets">
          <Widget type="class" />
          <Widget type="student" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
