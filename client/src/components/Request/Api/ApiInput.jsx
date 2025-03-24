// ApiInput.jsx
import React from 'react';
import { TextField } from '@mui/material';

const ApiInput = ({ value, onChange, onBlur }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <TextField
      label="API URL"
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      fullWidth
      margin="normal"
      placeholder="https://api.example.com/endpoint"
      variant="outlined"
      required
    />
  );
};

export default ApiInput;