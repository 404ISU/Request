// src/components/Tests/Load/LoadTestForm.jsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Grid,
  Paper
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

export default function LoadTestForm({ collectionId, onCreated }) {
  const [name, setName] = useState('');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState(30);
  const [rate, setRate] = useState(10);
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Введите название теста');
      return false;
    }
    if (!url.trim()) {
      setError('Введите URL');
      return false;
    }
    try {
      new URL(url);
    } catch {
      setError('Введите корректный URL');
      return false;
    }
    if (duration < 1 || duration > 3600) {
      setError('Длительность должна быть от 1 до 3600 секунд');
      return false;
    }
    if (rate < 1 || rate > 1000) {
      setError('RPS должен быть от 1 до 1000');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    try {
      // Преобразуем массив заголовков в объект
      const headersObj = headers.reduce((acc, { key, value }) => {
        if (key && value) acc[key] = value;
        return acc;
      }, {});

      // Парсим тело запроса если оно есть
      let parsedBody;
      if (body && method !== 'GET') {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          setError('Некорректный JSON в теле запроса');
          setLoading(false);
          return;
        }
      }

      const payload = {
        name,
        request: {
          method,
          url,
          headers: headersObj,
          body: parsedBody
        },
        config: { duration, rate },
        collectionId
      };

      const { data } = await axios.post('/api/tests/load', payload);
      onCreated && onCreated(data._id);
      
      // Очищаем форму
      setName('');
      setUrl('');
      setDuration(30);
      setRate(10);
      setHeaders([{ key: '', value: '' }]);
      setBody('');
      setMethod('GET');
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось создать нагрузочный тест');
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Создать нагрузочный тест</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Имя теста"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Метод</InputLabel>
            <Select
              value={method}
              onChange={e => setMethod(e.target.value)}
              label="Метод"
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
              <MenuItem value="PATCH">PATCH</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Цель (URL)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            fullWidth
            required
            placeholder="https://api.example.com/endpoint"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Длительность (сек)"
            type="number"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            fullWidth
            required
            inputProps={{ min: 1, max: 3600 }}
            helperText="От 1 до 3600 секунд"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="RPS (запросов/сек)"
            type="number"
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            fullWidth
            required
            inputProps={{ min: 1, max: 1000 }}
            helperText="От 1 до 1000 запросов в секунду"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Заголовки
            <Tooltip title="Добавить заголовок">
              <IconButton onClick={addHeader} size="small" sx={{ ml: 1 }}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Typography>
          
          {headers.map((header, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="Ключ"
                value={header.key}
                onChange={e => updateHeader(index, 'key', e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Значение"
                value={header.value}
                onChange={e => updateHeader(index, 'value', e.target.value)}
                sx={{ flex: 1 }}
              />
              <IconButton 
                onClick={() => removeHeader(index)}
                color="error"
                disabled={headers.length === 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Grid>

        {method !== 'GET' && (
          <Grid item xs={12}>
            <TextField
              label="Тело запроса (JSON)"
              value={body}
              onChange={e => setBody(e.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder='{"key": "value"}'
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={loading}
            fullWidth
          >
            {loading ? 'Создаю...' : 'Создать тест'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
