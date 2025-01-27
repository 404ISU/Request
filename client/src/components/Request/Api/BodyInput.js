import React, { useState } from 'react';
import { TextField, Typography, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const BodyInput = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Typography variant="h6" onClick={() => setIsOpen(!isOpen)} sx={{ cursor: 'pointer' }}>
        Body (JSON) {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Typography>
      <Collapse in={isOpen}>
        <TextField
          value={value}
          onChange={onChange}
          fullWidth
          multiline
          rows={5}
          placeholder='{"key": "value"}'
          variant="outlined"
          margin="normal"
        />
      </Collapse>
    </div>
  );
};

export default BodyInput;