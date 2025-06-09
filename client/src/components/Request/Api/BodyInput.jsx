import React, { useState } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import Editor from '@monaco-editor/react';

const BodyInput = ({ value, onChange, method }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const handleEditorChange = (value) => {
    try {
      if (method !== 'GET') JSON.parse(value);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
    onChange(value);
  };

  return (
    <Box sx={{ 
      border: '1px solid', 
      borderColor: isValid ? 'divider' : 'error.main',
      borderRadius: 2,
      mb: 2
    }}>
      <Box 
        onClick={() => setIsOpen(!isOpen)}
        sx={{ 
          p: 1.5,
          cursor: 'pointer',
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="subtitle1">
          Тело запроса {method === 'GET' && '(Отключено для метода GET)'}
        </Typography>
        <Typography color={isValid ? 'text.secondary' : 'error'}>
          {isOpen ? '▲' : '▼'}
        </Typography>
      </Box>

      <Collapse in={isOpen && method !== 'GET'}>
        <Box sx={{ height: '200px' }}>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={value}
            onChange={handleEditorChange}
            options={{
              readOnly: method === 'GET',
              minimap: { enabled: false },
              lineNumbers: 'off',
              scrollBeyondLastLine: false
            }}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default BodyInput;