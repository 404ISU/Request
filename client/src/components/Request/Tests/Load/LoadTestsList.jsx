// src/components/Tests/LoadTestsList.jsx
import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, List, ListItem, ListItemText, Typography } from '@mui/material';
import axios from 'axios';

export default function LoadTestsList({ collectionId, onSelect }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загрузить список тестов
  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (collectionId) params.collectionId = collectionId;
      const { data } = await axios.get('/api/tests/load', { params });
      setTests(data);
    } catch (e) {
      console.error('Не удалось получить нагрузочные тесты:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [collectionId]);

  const deleteTest = async (id) => {
    try {
      await axios.delete(`/api/tests/load/${id}`);
      setTests(prev => prev.filter(t => t._id !== id));
    } catch (e) {
      console.error('Не удалось удалить тест:', e);
    }
  };

  const runTest = async (id) => {
    try {
      await axios.post(`/api/tests/load/${id}/run`);
      // После запуска воркера статус “не готово” сменится, когда результаты появятся
    } catch (e) {
      console.error('Не удалось запустить тест:', e);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Нагрузочные тесты</Typography>
      <Button variant="contained" onClick={fetchTests} disabled={loading}>
        {loading ? 'Загрузка...' : 'Обновить'}
      </Button>

      <Paper sx={{ mt: 2 }}>
        <List>
          {tests.map(test => (
            <ListItem key={test._id} divider>
              <ListItemText
                primary={test.name}
                secondary={`URL: ${test.request.url} | Статус: ${test.results ? 'готово' : 'не готово'}`}
              />
              <Button
                size="small"
                onClick={() => runTest(test._id)}
                sx={{ mr: 1 }}
              >
                Запустить
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => deleteTest(test._id)}
              >
                Удалить
              </Button>
              <Button
                size="small"
                onClick={() => onSelect && onSelect(test._id)}
                sx={{ ml: 1 }}
              >
                Показать результат
              </Button>
            </ListItem>
          ))}
          {tests.length === 0 && !loading && (
            <ListItem>
              <ListItemText primary="Тесты не найдены" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}
