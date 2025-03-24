import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Select, MenuItem, IconButton, Typography, Collapse } from '@mui/material';
import { Delete, ExpandMore, ExpandLess } from '@mui/icons-material';

const HeadersInput = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [headers, setHeaders] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');

  // Инициализация из props
  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '{}');
      setHeaders(Object.entries(parsed).map(([key, val]) => ({ key, value: val })));
    } catch {
      setHeaders([]);
    }
  }, [value]);

  // Обработка изменений
  const updateHeaders = (newHeaders) => {
    const headersObj = Object.fromEntries(newHeaders.map(({ key, value }) => [key, value]));
    onChange(JSON.stringify(headersObj, null, 2));
    setHeaders(newHeaders);
  };

  // Добавление заголовка
  const addHeader = () => {
    const key = selectedType === 'Custom' ? customKey.trim() : selectedType;
    
    if (!key || !headerValue.trim()) {
      alert('Заполните ключ и значение');
      return;
    }

    if (headers.some(h => h.key === key)) {
      alert('Ключ уже существует');
      return;
    }

    updateHeaders([...headers, { key, value: headerValue }]);
    setSelectedType('');
    setCustomKey('');
    setHeaderValue('');
  };

  // Удаление заголовка
  const removeHeader = (index) => {
    updateHeaders(headers.filter((_, i) => i !== index));
  };

  // Список стандартных заголовков
  const presetHeaders = [
    'Content-Type', 'Authorization', 'Accept', 
    'User-Agent', 'Cache-Control', 'Custom'
  ];

  return (
    <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, mb: 2 }}>
      <Box 
        onClick={() => setIsOpen(!isOpen)} 
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 1 }}
      >
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          Заголовки ({headers.length})
        </Typography>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </Box>

      <Collapse in={isOpen}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {headers.map((header, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                label="Ключ"
                value={header.key}
                onChange={(e) => {
                  const newHeaders = [...headers];
                  newHeaders[index].key = e.target.value;
                  updateHeaders(newHeaders);
                }}
              />
              <TextField
                fullWidth
                label="Значение"
                value={header.value}
                onChange={(e) => {
                  const newHeaders = [...headers];
                  newHeaders[index].value = e.target.value;
                  updateHeaders(newHeaders);
                }}
              />
              <IconButton onClick={() => removeHeader(index)} color="error">
                <Delete />
              </IconButton>
            </Box>
          ))}

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              sx={{ flex: 1 }}
            >
              <MenuItem value=""><em>Выберите тип</em></MenuItem>
              {presetHeaders.map(header => (
                <MenuItem key={header} value={header}>{header}</MenuItem>
              ))}
            </Select>

            {selectedType === 'Custom' && (
              <TextField
                label="Имя заголовка"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                sx={{ flex: 1 }}
              />
            )}

            <TextField
              label="Значение"
              value={headerValue}
              onChange={(e) => setHeaderValue(e.target.value)}
              sx={{ flex: 1 }}
            />

            <Button 
              variant="contained" 
              onClick={addHeader}
              disabled={!selectedType || (!customKey && selectedType === 'Custom')}
            >
              Добавить
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default HeadersInput;