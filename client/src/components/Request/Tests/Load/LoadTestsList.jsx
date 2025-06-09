// src/components/Tests/LoadTestsList.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import axios from 'axios';

const formatDate = (date) => {
  return new Date(date).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}с`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}м ${remainingSeconds}с`;
};

export default function LoadTestsList({ collectionId, onSelect }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [runningTests, setRunningTests] = useState(new Set());

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        collectionId,
        page: page + 1,
        limit: rowsPerPage,
        sort: orderBy,
        order
      };
      const { data } = await axios.get('/api/tests/load', { params });
      setTests(data);
    } catch (e) {
      setError('Не удалось загрузить список тестов');
      console.error('Ошибка загрузки тестов:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [collectionId, page, rowsPerPage, orderBy, order]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDeleteClick = (test) => {
    setTestToDelete(test);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!testToDelete) return;
    
    try {
      await axios.delete(`/api/tests/load/${testToDelete._id}`);
      setTests(prev => prev.filter(t => t._id !== testToDelete._id));
      setDeleteDialogOpen(false);
      setTestToDelete(null);
    } catch (e) {
      setError('Не удалось удалить тест');
      console.error('Ошибка удаления теста:', e);
    }
  };

  const handleRunTest = async (id) => {
    try {
      setRunningTests(prev => new Set([...prev, id]));
      await axios.post(`/api/tests/load/${id}/run`);
      // Обновляем список через 5 секунд
      setTimeout(() => {
        fetchTests();
        setRunningTests(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 5000);
    } catch (e) {
      setError('Не удалось запустить тест');
      console.error('Ошибка запуска теста:', e);
      setRunningTests(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const getStatusChip = (test) => {
    if (runningTests.has(test._id)) {
      return <Chip label="Запущен" color="primary" size="small" />;
    }
    if (test.results) {
      const successRate = ((test.results.success / test.results.totalRequests) * 100).toFixed(1);
      return (
        <Chip
          label={`${successRate}% успешно`}
          color={successRate >= 95 ? 'success' : successRate >= 80 ? 'warning' : 'error'}
          size="small"
        />
      );
    }
    return <Chip label="Не запущен" color="default" size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Нагрузочные тесты</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchTests}
          disabled={loading}
        >
          Обновить
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Название
                </TableSortLabel>
              </TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Метод</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'config.duration'}
                  direction={orderBy === 'config.duration' ? order : 'asc'}
                  onClick={() => handleSort('config.duration')}
                >
                  Длительность
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'config.rate'}
                  direction={orderBy === 'config.rate' ? order : 'asc'}
                  onClick={() => handleSort('config.rate')}
                >
                  RPS
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'createdAt'}
                  direction={orderBy === 'createdAt' ? order : 'asc'}
                  onClick={() => handleSort('createdAt')}
                >
                  Создан
                </TableSortLabel>
              </TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tests.map(test => (
              <TableRow key={test._id}>
                <TableCell>{test.name}</TableCell>
                <TableCell>
                  <Tooltip title={test.request.url}>
                    <Typography noWrap sx={{ maxWidth: 200 }}>
                      {test.request.url}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>{test.request.method}</TableCell>
                <TableCell>{formatDuration(test.config.duration)}</TableCell>
                <TableCell>{test.config.rate}</TableCell>
                <TableCell>{formatDate(test.createdAt)}</TableCell>
                <TableCell>{getStatusChip(test)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Запустить">
                    <IconButton
                      onClick={() => handleRunTest(test._id)}
                      disabled={runningTests.has(test._id)}
                      size="small"
                    >
                      <PlayIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Показать результат">
                    <IconButton
                      onClick={() => onSelect && onSelect(test._id)}
                      size="small"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton
                      onClick={() => handleDeleteClick(test)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {tests.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary">
                    Тесты не найдены
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={-1}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to }) => `${from}-${to}`}
        />
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить тест "{testToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
