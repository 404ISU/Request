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

export default function LoadTestsList({ tests, loading, collectionId, onSelect, onRefresh }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [runningTests, setRunningTests] = useState(new Set());
  const [error, setError] = useState(null);

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
      await axios.delete(`/api/tests/load/${testToDelete._id}`, {
        withCredentials: true
      });
      onRefresh(); // Обновляем список после удаления
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
      await axios.post(`/api/tests/load/${id}/run`, {}, {
        withCredentials: true
      });
      // Обновляем список через 5 секунд
      setTimeout(() => {
        onRefresh();
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

  // Сортируем и фильтруем тесты
  const sortedTests = React.useMemo(() => {
    return [...tests].sort((a, b) => {
      const aValue = orderBy.split('.').reduce((obj, key) => obj[key], a);
      const bValue = orderBy.split('.').reduce((obj, key) => obj[key], b);
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  }, [tests, orderBy, order]);

  // Пагинация
  const paginatedTests = React.useMemo(() => {
    return sortedTests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedTests, page, rowsPerPage]);

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
        <Typography variant="h6">Мои нагрузочные тесты</Typography>
              <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
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

      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 600, backgroundColor: 'background.default' } }}>
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
            {paginatedTests.map(test => (
              <TableRow 
                key={test._id}
                hover
                sx={{ 
                  '&:hover': { backgroundColor: 'action.hover' },
                  cursor: 'pointer',
                  '& td': { py: 1.5 }
                }}
                onClick={() => onSelect && onSelect(test._id)}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {test.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title={test.request.url}>
                    <Typography 
                      variant="body2" 
                      noWrap 
                      sx={{ 
                        maxWidth: 200,
                        color: 'text.secondary'
                      }}
                    >
                      {test.request.url}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={test.request.method}
                    size="small"
                    color={
                      test.request.method === 'GET' ? 'success' :
                      test.request.method === 'POST' ? 'primary' :
                      test.request.method === 'PUT' ? 'warning' :
                      test.request.method === 'DELETE' ? 'error' : 'default'
                    }
                    sx={{ minWidth: 70 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDuration(test.config.duration)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {test.config.rate} RPS
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(test.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(test)}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Запустить">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRunTest(test._id);
                        }}
                        disabled={runningTests.has(test._id)}
                        size="small"
                        color="primary"
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(test);
                        }}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedTests.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    У вас пока нет нагрузочных тестов
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
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
