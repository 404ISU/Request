// src/components/Tests/Load/LoadTestResult.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

export default function LoadTestResult({ testId }) {
  const [status, setStatus] = useState('pending');
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!testId) return;
    // Каждые 3 сек опрашиваем статус
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/tests/load/${testId}/status`);
        if (data.results) {
          setResults(data.results);
          setStatus('completed');
          clearInterval(interval);
        } else {
          setStatus('running');
        }
      } catch (e) {
        console.error('Ошибка при получении статуса:', e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [testId]);

  if (!testId) {
    return <Typography>Нажмите “Показать результат” у теста, чтобы увидеть детали.</Typography>;
  }

  if (status === 'running') {
    return (
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} />
        <Typography sx={{ ml: 1 }}>Идет нагрузочное тестирование…</Typography>
      </Box>
    );
  }

  if (status === 'completed' && results) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Результаты теста:</Typography>
        <pre style={{ background: '#f5f5f5', padding: 8, maxHeight: 300, overflow: 'auto' }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      </Box>
    );
  }

  return <Typography>Результаты не готовы.</Typography>;
}
