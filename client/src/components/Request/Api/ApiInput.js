import React from 'react';
import { TextField } from '@mui/material';


const ApiInput = ({ value, onChange }) => {
  return (
    <TextField
    label="API URL"
    value={value}
    onChange={onChange}
    fullWidth
    margin='normal'
    placeholder='https://api.exampel.com/endpoint'
    variant='outlined'
    >
    </TextField>
  );
};

export default ApiInput;