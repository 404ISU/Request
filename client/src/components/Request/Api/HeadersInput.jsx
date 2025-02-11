import React, { useState } from 'react';
import {
  TextField,
  Typography,
  Collapse,
  IconButton,
  Button,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const HeadersInput = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [headers, setHeaders] = useState(() => {
    try {
      return JSON.parse(value || '{}');
    } catch (error) {
      console.error('Invalid JSON:', error);
      return {};
    }
  });

  // Обработчик изменения заголовка
  const handleHeaderChange = (key, type, newValue) => {
    const updatedHeaders = { ...headers };
    if (type === 'key') {
      // Если изменяется ключ, проверяем, что новый ключ уникален
      if (updatedHeaders[newValue] !== undefined && newValue !== key) {
        alert(`Ключ "${newValue}" уже существует.`);
        return;
      }
      // Обновляем ключ в объекте
      if (newValue !== '') {
        updatedHeaders[newValue] = updatedHeaders[key];
        delete updatedHeaders[key];
      }
    } else if (type === 'value') {
      // Если изменяется значение, просто обновляем его
      updatedHeaders[key] = newValue;
    }
    setHeaders(updatedHeaders);
    onChange({ target: { value: JSON.stringify(updatedHeaders) } });
  };

  // Обработчик удаления заголовка
  const handleRemoveHeader = (key) => {
    const updatedHeaders = { ...headers };
    delete updatedHeaders[key];
    setHeaders(updatedHeaders);
    onChange({ target: { value: JSON.stringify(updatedHeaders) } });
  };

  // Обработчик добавления нового заголовка
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const handleAddHeader = () => {
    if (headers[newKey]) {
      alert(`Ключ "${newKey}" уже существует.`);
      return;
    }
    const updatedHeaders = { ...headers, [newKey]: newValue };
    setHeaders(updatedHeaders);
    onChange({ target: { value: JSON.stringify(updatedHeaders) } });
    setNewKey('');
    setNewValue('');
  };

  return (
    <div>
      <Typography
        variant="h6"
        onClick={() => setIsOpen(!isOpen)}
        sx={{ cursor: 'pointer' }}
      >
        Headers (JSON) {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Typography>
      <Collapse in={isOpen}>
        <Box sx={{ mt: 2 }}>
          {/* Отображение существующих заголовков */}
          {Object.entries(headers).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              {/* Редактируемое поле для ключа */}
              <TextField
                value={key}
                onChange={(e) => handleHeaderChange(key, 'key', e.target.value)}
                sx={{ mr: 1, width: '150px' }}
              />
              {/* Редактируемое поле для значения */}
              <TextField
                value={value}
                onChange={(e) =>
                  handleHeaderChange(key, 'value', e.target.value)
                }
                sx={{ mr: 1, width: '200px' }}
              />
              {/* Кнопка удаления */}
              <Button
                onClick={() => handleRemoveHeader(key)}
                color="error"
                size="small"
              >
                Удалить
              </Button>
            </Box>
          ))}

          {/* Форма добавления нового заголовка */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <TextField
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Ключ"
              sx={{ mr: 1, width: '150px' }}
            />
            <TextField
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Значение"
              sx={{ mr: 1, width: '200px' }}
            />
            <Button onClick={handleAddHeader} variant="contained" size="small">
              Добавить
            </Button>
          </Box>
        </Box>
      </Collapse>
    </div>
  );
};

export default HeadersInput;