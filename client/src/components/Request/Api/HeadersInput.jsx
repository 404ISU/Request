// components/Api/HeadersInput.js

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const HeadersInput = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Преобразуем входящие заголовки в массив объектов
  const initialHeaders = Object.entries(JSON.parse(value || '{}')).map(([key, value]) => ({
    key,
    value,
  }));

  const [headers, setHeaders] = useState(initialHeaders); // Массив заголовков
  const [selectedHeaderKey, setSelectedHeaderKey] = useState(''); // Выбранный заголовок из списка
  const [customHeaderKey, setCustomHeaderKey] = useState(''); // Ключ для пользовательского заголовка
  const [newHeaderValue, setNewHeaderValue] = useState(''); // Значение нового заголовка

  // Список стандартных заголовков
  const standardHeaders = [
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'User-Agent',
    'Referer',
    'Host',
    'Connection',
    'Content-Length',
    'Accept-Encoding',
    'Accept-Language',
    'X-Requested-With',
    'If-Modified-Since',
    'If-None-Match',
    'Custom', // Опция для пользовательских заголовков
  ];

  // Добавление нового заголовка
  const handleAddHeader = () => {
    let key = selectedHeaderKey;

    // Если выбран "Custom", используем пользовательский ключ
    if (selectedHeaderKey === 'Custom') {
      key = customHeaderKey.trim();
      if (!key) {
        alert('Укажите имя пользовательского заголовка.');
        return;
      }
    }

    const value = newHeaderValue.trim();

    if (!key || !value) {
      alert('Ключ и значение заголовка обязательны.');
      return;
    }

    if (headers.some((header) => header.key === key)) {
      alert(`Заголовок "${key}" уже существует.`);
      return;
    }

    const updatedHeaders = [...headers, { key, value }];
    setHeaders(updatedHeaders);

    // Преобразуем массив обратно в объект и обновляем родительское состояние
    const headersObject = updatedHeaders.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
    onChange(JSON.stringify(headersObject, null, 2));

    // Очищаем поля для нового заголовка
    setSelectedHeaderKey('');
    setCustomHeaderKey('');
    setNewHeaderValue('');
  };

  // Удаление заголовка
  const handleRemoveHeader = (index) => {
    const updatedHeaders = headers.filter((_, i) => i !== index);
    setHeaders(updatedHeaders);

    // Преобразуем массив обратно в объект и обновляем родительское состояние
    const headersObject = updatedHeaders.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
    onChange(JSON.stringify(headersObject, null, 2));
  };

  return (
    <Box>
      <Typography variant="h6" onClick={() => setIsOpen(!isOpen)} sx={{ cursor: 'pointer' }}>
        Заголовки (Headers) {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Typography>
      <Collapse in={isOpen}>
        <Box sx={{ mt: 2 }}>
          {/* Список существующих заголовков */}
          {headers.map((header, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <TextField
                value={header.key}
                onChange={(e) =>
                  setHeaders(
                    headers.map((h, i) =>
                      i === index ? { ...h, key: e.target.value } : h
                    )
                  )
                }
                placeholder="Ключ"
                sx={{ mr: 1, width: '150px' }}
              />
              <TextField
                value={header.value}
                onChange={(e) =>
                  setHeaders(
                    headers.map((h, i) =>
                      i === index ? { ...h, value: e.target.value } : h
                    )
                  )
                }
                placeholder="Значение"
                sx={{ mr: 1, width: '200px' }}
              />
              <Button
                onClick={() => handleRemoveHeader(index)}
                color="error"
                size="small"
              >
                Удалить
              </Button>
            </Box>
          ))}

          {/* Форма добавления нового заголовка */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Select
              value={selectedHeaderKey}
              onChange={(e) => setSelectedHeaderKey(e.target.value)}
              sx={{ mr: 1, width: '150px' }}
            >
              <MenuItem value="">Выберите заголовок</MenuItem>
              {standardHeaders.map((header) => (
                <MenuItem key={header} value={header}>
                  {header}
                </MenuItem>
              ))}
            </Select>

            {/* Пользовательский ключ для "Custom" */}
            {selectedHeaderKey === 'Custom' && (
              <TextField
                value={customHeaderKey}
                onChange={(e) => setCustomHeaderKey(e.target.value)}
                placeholder="Введите имя заголовка"
                sx={{ mr: 1, width: '150px' }}
              />
            )}

            {/* Значение заголовка */}
            <TextField
              value={newHeaderValue}
              onChange={(e) => setNewHeaderValue(e.target.value)}
              placeholder="Значение"
              sx={{ mr: 1, width: '200px' }}
            />

            <Button
              onClick={handleAddHeader}
              variant="contained"
              size="small"
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