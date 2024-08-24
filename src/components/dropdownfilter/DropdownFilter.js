import React, { useState } from 'react';
import { Menu, MenuItem, TextField } from '@mui/material';

const DropdownFilter = ({ column, onFilterChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterValue, setFilterValue] = useState('');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (event) => {
    setFilterValue(event.target.value);
    onFilterChange(event.target.value);
  };

  return (
    <div>
      <TextField
        label={`Filter by ${column.headerName}`}
        value={filterValue}
        onClick={handleClick}
        onChange={handleFilterChange}
        InputProps={{
          endAdornment: (
            <button onClick={handleClick}>
              ▼
            </button>
          ),
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 200,
            width: '20ch',
          },
        }}
      >
        <MenuItem>
          <TextField
            label={`Filter by ${column.headerName}`}
            value={filterValue}
            onChange={handleFilterChange}
          />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default DropdownFilter;
