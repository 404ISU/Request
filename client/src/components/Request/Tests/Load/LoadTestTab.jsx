import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import LoadTestForm from './LoadTestForm';
import LoadTestsList from './LoadTestsList';
import LoadTestResult from './LoadTestResult';

export default function LoadTestTab({ collectionId }) {
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Получаем тесты текущего пользователя
  const { data: tests, isLoading, error, refetch } = useQuery({
    queryKey: ['loadTests', collectionId],
    queryFn: async () => {
      const { data } = await axios.get('/api/tests/load', {
        params: { collectionId },
        withCredentials: true
      });
      return data;
    }
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Нагрузочное тестирование</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Создать тест
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Не удалось загрузить тесты: {error.message}
          </Alert>
        )}
        
        <LoadTestsList
          tests={tests || []}
          loading={isLoading}
          collectionId={collectionId}
          onSelect={id => setSelectedTestId(id)}
          onRefresh={refetch}
        />
        
        {selectedTestId && (
          <Paper sx={{ mt: 2, p: 2 }}>
            <LoadTestResult testId={selectedTestId} />
          </Paper>
        )}
      </Box>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Создать нагрузочный тест</DialogTitle>
        <DialogContent>
          <LoadTestForm
            collectionId={collectionId}
            onCreated={id => {
              setSelectedTestId(id);
              setIsCreateDialogOpen(false);
              refetch(); // Обновляем список после создания
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Отмена</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 