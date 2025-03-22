import React from 'react';
import { TextField } from '@mui/material';

const ApiInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    // Убедимся, что передается только строка
    onChange(e.target.value);
  };

  return (
    <TextField
      label="API URL"
      value={value}
      onChange={handleChange}
      fullWidth
      margin="normal"
      placeholder="https://api.example.com/endpoint"
      variant="outlined"
      error={!!value.match(/\[object Object\]/i)}
      helperText={value.match(/\[object Object\]/i) ? "Некорректный URL" : ""}
    />
  );
};

export default ApiInput;