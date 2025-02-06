import React from 'react';
import {Select, MenuItem, FormControl, InputLabel} from '@mui/material';
const MethodSelector = ({ value, onChange }) => {
  return (
    <FormControl fullWidth margin='normal' variant='outlined'>
      <InputLabel>Method</InputLabel>
      <Select value={value} onChange={onChange} label="Method">
        <MenuItem value="get">GET</MenuItem>
        <MenuItem value="post">POST</MenuItem>
        <MenuItem value="put">PUT</MenuItem>
        <MenuItem value="delete">DELETE</MenuItem>
        <MenuItem value="patch">PATCH</MenuItem>
        <MenuItem value="options">OPTIONS</MenuItem>
        <MenuItem value="head">HEAD</MenuItem>
      </Select>
    </FormControl>
  );
};

export default MethodSelector;