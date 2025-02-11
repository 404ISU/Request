import React, { useState } from 'react';
import { TextField, Typography, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const BodyInput = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isValidJson, setIsValidJson] = useState(true);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    try {
      JSON.parse(newValue);
      setIsValidJson(true);
    } catch (error) {
      setIsValidJson(false);
    }
  };

  return (
    <div>
      <Typography variant="h6" onClick={() => setIsOpen(!isOpen)} sx={{ cursor: 'pointer' }}>
        Body (JSON) {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Typography>
      <Collapse in={isOpen}>
        <TextField
          value={value}
          onChange={handleChange}
          fullWidth
          multiline
          rows={5}
          placeholder='{"key": "value"}'
          variant="outlined"
          margin="normal"
          error={!isValidJson}
          helperText={!isValidJson ? 'Invalid JSON' : ''}
        />
      </Collapse>
    </div>
  );
};

export default BodyInput;