import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

const QueryParamsInput = ({ onChange }) => {
  const [params, setParams] = useState([{ key: '', value: '' }]);

  const handleParamChange = (index, field, value) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
    onChange(newParams.filter((param) => param.key && param.value));
  };

  const addParam = () => {
    setParams([...params, { key: '', value: '' }]);
  };

  return (
    <Box >
      {params.map((param, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }} >
          <TextField
            label="Key"
            value={param.key}
            onChange={(e) => handleParamChange(index, 'key', e.target.value)}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Value"
            value={param.value}
            onChange={(e) => handleParamChange(index, 'value', e.target.value)}
            fullWidth
            variant="outlined"
          />
        </Box>
      ))}
      <Button onClick={addParam} variant="outlined">
        Добавить Параметр
      </Button>
    </Box>
  );
};

export default QueryParamsInput;