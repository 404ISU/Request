// src/components/Tests/Load/LoadTestForm.jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

export default function LoadTestForm({ collectionId, onCreated }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState(30);
  const [rate, setRate] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        name,
        request: { method: 'GET', url, headers: {}, body: {} },
        config: { duration, rate },
        collectionId
      };
      const { data } = await axios.post('/api/tests/load', payload);
      onCreated && onCreated(data._id);
      // можно очистить поля
      setName('');
      setUrl('');
      setDuration(30);
      setRate(10);
    } catch (e) {
      console.error('Не удалось создать нагрузочный тест:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>Создать нагрузочный тест</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Имя теста"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Цель (URL)"
          value={url}
          onChange={e => setUrl(e.target.value)}
          fullWidth
        />
        <TextField
          label="Длительность (сек)"
          type="number"
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          fullWidth
        />
        <TextField
          label="RPS (запросов/сек)"
          type="number"
          value={rate}
          onChange={e => setRate(Number(e.target.value))}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading || !name.trim() || !url.trim()}
        >
          {loading ? 'Создаю...' : 'Создать тест'}
        </Button>
      </Box>
    </Box>
  );
}
