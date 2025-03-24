import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

// Генератор уникальных ID
let envIdCounter = 0;
const generateEnvId = () => 
  `env-${Date.now()}-${envIdCounter++}-${Math.random().toString(36).slice(2, 7)}`;

const EnvironmentVariables = ({ onChange }) => {
  const [variables, setVariables] = useState([{
    id: generateEnvId(),
    key: '',
    value: ''
  }]);

  const handleVariableChange = (id, field, value) => {
    const newVariables = variables.map(varItem => 
      varItem.id === id ? { ...varItem, [field]: value } : varItem
    );
    setVariables(newVariables);
    onChange(newVariables.filter(v => v.key.trim() && v.value.trim()));
  };

  const addVariable = () => {
    setVariables([...variables, {
      id: generateEnvId(),
      key: '',
      value: ''
    }]);
  };

  return (
    <Box sx={{ 
      border: '1px solid', 
      borderColor: 'divider', 
      borderRadius: 2, 
      p: 2,
      mb: 2
    }}>
      <Typography variant="subtitle1" gutterBottom>
        Переменные окружения
      </Typography>

      {variables.map((variable, index) => (
        <Box 
          key={variable.id}
          sx={{ 
            display: 'flex', 
            gap: 1, 
            mb: 1,
            alignItems: 'center'
          }}
        >
          <TextField
            label="Ключ"
            value={variable.key}
            onChange={(e) => handleVariableChange(variable.id, 'key', e.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            label="Значение"
            value={variable.value}
            onChange={(e) => handleVariableChange(variable.id, 'value', e.target.value)}
            fullWidth
            size="small"
          />

          {index > 0 && (
            <Button 
              onClick={() => setVariables(vars => vars.filter(v => v.id !== variable.id))}
              color="error"
              size="small"
              sx={{ minWidth: 40 }}
            >
              ×
            </Button>
          )}
        </Box>
      ))}

      <Button 
        onClick={addVariable}
        variant="outlined" 
        size="small"
        fullWidth
        sx={{ mt: 1 }}
      >
        Добавить переменную
      </Button>
    </Box>
  );
};

export default EnvironmentVariables;