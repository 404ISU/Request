import React, { useState, useMemo, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const QueryParamsInput = ({ value, onChange }) => {
  const [params, setParams] = useState([{ key: '', value: '' }]);

  const initialParams = useMemo(() => {
    try {
      return Object.entries(JSON.parse(value)).map(([key, val]) => ({ key, value: val }));
    } catch {
      return [{ key: '', value: '' }];
    }
  }, [value]);

  const handleParamChange = (index, field, value) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
    onChange(newParams.filter((param) => param.key && param.value));
  };

  const addParam = () => {
    setParams([...params, { key: '', value: '' }]);
  };

  useEffect(() => {
    // Отправляем пустой объект вместо undefined
    onChange(params.filter(p => p.key && p.value));
  }, [params]);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6">Query Parameters</Typography>
      {params.map((param, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Key"
            value={param.key}
            onChange={(e) => handleParamChange(index, 'key', e.target.value)}
            fullWidth
          />
          <TextField
            label="Value"
            value={param.value}
            onChange={(e) => handleParamChange(index, 'value', e.target.value)}
            fullWidth
          />
        </Box>
      ))}
      <Button onClick={addParam} variant="outlined">
        Добавить параметр
      </Button>
    </Box>
  );
};
export default QueryParamsInput;