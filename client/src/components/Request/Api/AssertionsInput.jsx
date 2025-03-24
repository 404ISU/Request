import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Select, MenuItem, IconButton, Typography } from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import PropTypes from 'prop-types';

const AssertionsInput = ({ onChange }) => {
  const [assertions, setAssertions] = useState([
    { id: 1, type: 'status', expected: '', operator: 'equals' }
  ]);

  // Типы проверок
  const assertionTypes = {
    status: {
      operators: ['equals', 'not equals', 'greater than', 'less than'],
      inputType: 'number'
    },
    body: {
      operators: ['contains', 'not contains', 'equals'],
      inputType: 'text'
    },
    headers: {
      operators: ['exists', 'not exists', 'equals'],
      inputType: 'text'
    }
  };

  // Обновление проверки
  const updateAssertion = (id, field, value) => {
    const newAssertions = assertions.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    );
    setAssertions(newAssertions);
    onChange(newAssertions.filter(a => a.expected));
  };

  // Добавление новой проверки
  const addAssertion = () => {
    setAssertions([...assertions, {
      id: Date.now(),
      type: 'status',
      operator: 'equals',
      expected: ''
    }]);
  };

  // Удаление проверки
  const removeAssertion = (id) => {
    setAssertions(assertions.filter(a => a.id !== id));
  };

  return (
    <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Проверки ответа
      </Typography>

      {assertions.map((assertion) => (
        <Box key={assertion.id} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <Select
            value={assertion.type}
            onChange={(e) => updateAssertion(assertion.id, 'type', e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="status">Статус код</MenuItem>
            <MenuItem value="body">Тело ответа</MenuItem>
            <MenuItem value="headers">Заголовки</MenuItem>
          </Select>

          <Select
            value={assertion.operator}
            onChange={(e) => updateAssertion(assertion.id, 'operator', e.target.value)}
            sx={{ width: 150 }}
          >
            {assertionTypes[assertion.type].operators.map(op => (
              <MenuItem key={op} value={op}>{op}</MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            type={assertionTypes[assertion.type].inputType}
            label="Ожидаемое значение"
            value={assertion.expected}
            onChange={(e) => updateAssertion(assertion.id, 'expected', e.target.value)}
          />

          <IconButton 
            onClick={() => removeAssertion(assertion.id)}
            color="error"
            sx={{ ml: 'auto' }}
          >
            <Delete />
          </IconButton>
        </Box>
      ))}

      <Button 
        variant="outlined" 
        startIcon={<Add />}
        onClick={addAssertion}
        fullWidth
      >
        Добавить проверку
      </Button>
    </Box>
  );
};

AssertionsInput.propTypes = {
  onChange: PropTypes.func.isRequired
};

export default AssertionsInput;