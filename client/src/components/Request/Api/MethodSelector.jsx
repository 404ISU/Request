import React from 'react';
import { 
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

const MethodSelector = ({ value, onChange }) => {
  return (
    <FormControl fullWidth margin="normal">
      <InputLabel>Метод</InputLabel>
      <Select
        value={value.toUpperCase()}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        label="Метод"
      >
        {methods.map(method => (
          <MenuItem 
            key={method} 
            value={method}
            sx={{ textTransform: 'uppercase' }}
          >
            {method}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MethodSelector;