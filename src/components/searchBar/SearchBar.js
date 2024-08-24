import { useState, useEffect } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Import your Firestore instance

const collectionsToSearch = [
  { name: 'users', fields: ['email', 'firstName', 'idNum', 'lastName'] },
  { name: 'rooms', fields: ['building', 'roomNum'] },
  { name: 'classes', fields: ['classCode', 'classSec'] },
  { name: 'accessPoints', fields: ['macAddress'] }
];

const SearchBar = () => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchText.trim() === '') {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
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
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [searchText]);

  return (
    <div style={{ width: 300 }}>
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
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
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
            // Handle the selected value, e.g., navigate to the relevant page or show details
          }
        }}
      />
    </div>
  );
};

export default SearchBar;
