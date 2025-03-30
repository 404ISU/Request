import React, { useState, useMemo, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

let idCounter = 0;
const generateId = () => `param-${Date.now()}-${idCounter++}-${Math.random().toString(36).slice(2, 7)}`;

const QueryParamsInput = ({ value, onChange }) => {
  const [params, setParams] = useState([{
    id: generateId(),
    key: '',
    value: ''
  }]);

  const parseValue = (value, envVariables) => {
    return Object.entries(envVariables).reduce(
      (acc, [key, val]) => acc.replace(new RegExp(key, 'g'), val),
      value
    );
  };

  const initialParams = useMemo(() => {
    try {
      const parsedValue = JSON.parse(value || '{}');
      return Object.entries(parsedValue).map(([key, val]) => ({
        id: generateId(),
        key,
        value: String(val)
      }));
    } catch (error) {
      console.error('Ошибка парсинга параметров:', error);
      return [{ id: generateId(), key: '', value: '' }];
    }
  }, [value]);

  const handleParamChange = (id, field, value) => {
    const newParams = params.map(param => 
      param.id === id ? { ...param, [field]: value } : param
    );
    setParams(newParams);
  };

  const addParam = () => {
    setParams(prev => [...prev, {
      id: generateId(),
      key: '',
      value: ''
    }]);
  };

  const removeParam = (id) => {
    setParams(prev => prev.filter(param => param.id !== id));
  };

  useEffect(() => {
    if (typeof onChange === 'function') {
      const filteredParams = params
        .filter(p => p.key.trim() && p.value.trim())
        .reduce((acc, { key, value }) => {
          acc[key] = isNaN(value) ? value : Number(value);
          return acc;
        }, {});

        onChange(JSON.stringify(
          Object.fromEntries(
            params.map(p => [p.key, parseValue(p.value)])
        )));
    }
  }, [params, onChange]);

  return (
    <Box sx={{ 
      border: '1px solid', 
      borderColor: 'divider', 
      borderRadius: 2, 
      p: 2,
      mb: 2
    }}>
      <Typography variant="subtitle1" gutterBottom>
        Параметры запроса
      </Typography>

      {params.map((param, index) => (
        <Box 
          key={param.id}
          sx={{ 
            display: 'flex', 
            gap: 1, 
            mb: 1,
            alignItems: 'center'
          }}
        >
          <TextField
            label="Ключ"
            value={param.key}
            onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            label="Значение"
            value={param.value}
            onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
            fullWidth
            size="small"
          />

          {index > 0 && (
            <Button 
              onClick={() => removeParam(param.id)}
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
        onClick={addParam}
        variant="outlined" 
        size="small"
        fullWidth
        sx={{ mt: 1 }}
      >
        Добавить параметр
      </Button>
    </Box>
  );
};

QueryParamsInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
};

export default QueryParamsInput;