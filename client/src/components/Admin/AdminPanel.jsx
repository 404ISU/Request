// components/AdminPanel.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Select,
  MenuItem,
} from '@mui/material';
import { Search, Edit, Delete } from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminPanel = () => {
  const [organizations, setOrganizations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Состояние для поиска
  const [editingUser, setEditingUser] = useState(null); // Состояние для редактируемого пользователя
  const [filterByRequests, setFilterByRequests] = useState('all'); // Фильтр по запросам

  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/get-users', { withCredentials: true });
      setOrganizations(response.data.organizations);
      setWorkers(response.data.workers);
    } catch (error) {
      toast.error('Ошибка при загрузке пользователей');
    }
  };

  // Загрузка статистики
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/get-stats', { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      toast.error('Ошибка при загрузке статистики');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  // Фильтрация пользователей по поиску
  const filteredOrganizations = organizations.filter((org) =>
    org.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWorkers = workers.filter((worker) =>
    worker.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Фильтрация по количеству запросов
  const filteredUsersByRequests = [...filteredOrganizations, ...filteredWorkers].filter((user) => {
    if (filterByRequests === 'all') return true;
    if (filterByRequests === 'none' && user.requestsCount === 0) return true;
    if (filterByRequests === 'some' && user.requestsCount > 0) return true;
    return false;
  });

  // Удаление пользователя
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/delete-user/${userId}`, { withCredentials: true });
      toast.success('Пользователь успешно удален');
      fetchUsers(); // Обновляем список пользователей
    } catch (error) {
      toast.error('Ошибка при удалении пользователя');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Административная панель
      </Typography>

      {/* Статистика */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Статистика сайта:
          </Typography>
          {stats ? (
            <>
              <BarChart width={500} height={300} data={Object.entries(stats).map(([key, value]) => ({ name: key, count: value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </>
          ) : (
            <Typography>Загрузка...</Typography>
          )}
        </CardContent>
      </Card>

      {/* Поле поиска */}
      <TextField
        label="Поиск"
        placeholder="Введите имя или email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <Search />,
        }}
      />

      {/* Фильтр по запросам */}
      <Box sx={{ mb: 3 }}>
        <Select
          value={filterByRequests}
          onChange={(e) => setFilterByRequests(e.target.value)}
          fullWidth
        >
          <MenuItem value="all">Все пользователи</MenuItem>
          <MenuItem value="none">Без запросов</MenuItem>
          <MenuItem value="some">С запросами</MenuItem>
        </Select>
      </Box>

      {/* Список пользователей */}
      <Typography variant="h6" gutterBottom>
        Список пользователей:
      </Typography>
      <List>
        {filteredUsersByRequests.map((user) => (
          <ListItem key={user._id}>
            <ListItemText
              primary={`${user.username} (${user.email})`}
              secondary={`Роль: ${user.role}, Запросы: ${user.requestsCount || 0}`}
            />
            <IconButton onClick={() => setEditingUser(user)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteUser(user._id)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* Форма редактирования пользователя */}
      {editingUser && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Редактирование пользователя: {editingUser.username}
            </Typography>
            <TextField
              label="Логин"
              value={editingUser.username}
              onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" onClick={() => {}}>
              Сохранить изменения
            </Button>
            <Button variant="outlined" onClick={() => setEditingUser(null)} sx={{ ml: 2 }}>
              Отмена
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminPanel;