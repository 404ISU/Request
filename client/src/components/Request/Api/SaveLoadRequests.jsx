import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, Box, Typography } from '@mui/material';

const SaveLoadRequests = ({ onSave, onLoad }) => {
  const [requestName, setRequestName] = useState('');

  const handleSave = () => {
    onSave(requestName);
  };

  const handleLoad = (e) => {
    onLoad(e.target.value);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
        Сохранение и Загрузка Запросов
      </Typography>
      <TextField
        label="Название Запроса"
        value={requestName}
        onChange={(e) => setRequestName(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        sx={{ mb: 2, backgroundColor: 'background.paper', color: 'text.primary' }}
      />
      <Button onClick={handleSave} variant="contained" fullWidth sx={{ mb: 2 }}>
        Сохранить Запрос
      </Button>
      <Select
        onChange={handleLoad}
        fullWidth
        variant="outlined"
        sx={{ mb: 2, backgroundColor: 'background.paper', color: 'text.primary' }}
        defaultValue=""
      >
        <MenuItem value="">Загрузить Запрос</MenuItem>
        {/* Здесь можно загрузить список сохраненных запросов */}
      </Select>
    </Box>
  );
};

export default SaveLoadRequests;