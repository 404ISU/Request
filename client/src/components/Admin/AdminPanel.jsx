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
} from '@mui/material';
import { Search, Edit, Delete } from '@mui/icons-material';

const AdminPanel = () => {
  const [organizations, setOrganizations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Состояние для поиска
  const [editingUser, setEditingUser] = useState(null); // Состояние для редактируемого пользователя

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

  // Обновление данных пользователя
  const handleUpdateUser = async () => {
    try {
      const { _id, username, email, firstName, lastName, newPassword, organizationName, organizationAddress, organizationPhone } = editingUser;

      // Формируем объект с данными для отправки
      const updatedData = {
        username,
        email,
        firstName,
        lastName,
      };

      // Если это организация, добавляем дополнительные поля
      if (editingUser.role === 'organization') {
        updatedData.organizationName = organizationName;
        updatedData.organizationAddress = organizationAddress;
        updatedData.organizationPhone = organizationPhone;
      }

      // Добавляем новый пароль, если он указан
      if (newPassword) {
        updatedData.newPassword = newPassword;
      }

      await axios.put(`/api/admin/update-user/${_id}`, updatedData, { withCredentials: true });
      toast.success('Данные пользователя успешно обновлены');
      setEditingUser(null); // Закрываем форму редактирования
      fetchUsers(); // Обновляем список пользователей
    } catch (error) {
      toast.error('Ошибка при обновлении данных пользователя');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Административная панель
      </Typography>

      {/* Статистика */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Статистика сайта:
          </Typography>
          {stats ? (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>Всего пользователей: {stats.totalUsers}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Организаций: {stats.totalOrganizations}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Работников: {stats.totalWorkers}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Запросов: {stats.totalRequests}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography>Загрузка...</Typography>
          )}
        </CardContent>
      </Card>

      {/* Поле поиска */}
      <TextField
        label="Поиск пользователей"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1 }} />,
        }}
      />

      {/* Список организаций и их работников */}
      <Typography variant="h6" gutterBottom>
        Список пользователей:
      </Typography>
      {filteredOrganizations.map((org) => (
        <Paper key={org._id} elevation={3} sx={{ p: 2, mb: 2 }}>
          {/* Организация */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6">{org.username}</Typography>
              <Typography variant="body2">{org.email}</Typography>
              <Typography variant="body2">Организация:{org.organizationName}</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => setEditingUser(org)}>
                <Edit />
              </IconButton>
              <IconButton color="error" onClick={() => handleDeleteUser(org._id)}>
                <Delete />
              </IconButton>
            </Box>
          </Box>

          {/* Работники организации */}
          <List dense sx={{ mt: 2 }}>
            {filteredWorkers
              .filter((worker) => worker.organizationId?.toString() === org._id.toString())
              .map((worker) => (
                <ListItem key={worker._id}>
                  <ListItemText
                    primary={worker.username}
                    secondary={
                      <>
                        {worker.email}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Организация: {org.username}
                        </Typography>
                      </>
                    }
                  />
                  <Box>
                    <IconButton onClick={() => setEditingUser(worker)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteUser(worker._id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
          </List>
        </Paper>
      ))}

      {/* Форма редактирования пользователя */}
      {editingUser && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Редактирование пользователя: {editingUser.username}</Typography>
          <TextField
            label="Логин"
            value={editingUser.username}
            onChange={(e) =>
              setEditingUser({ ...editingUser, username: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            value={editingUser.email}
            onChange={(e) =>
              setEditingUser({ ...editingUser, email: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Имя"
            value={editingUser.name || ''}
            onChange={(e) =>
              setEditingUser({ ...editingUser, name: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Фамилия"
            value={editingUser.firstName || ''}
            onChange={(e) =>
              setEditingUser({ ...editingUser, firstName: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Отчество"
            value={editingUser.lastName || ''}
            onChange={(e) =>
              setEditingUser({ ...editingUser, lastName: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
          />
          {editingUser.role === 'organization' && (
            <>
              <TextField
                label="Название организации"
                value={editingUser.organizationName || ''}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, organizationName: e.target.value })
                }
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Адрес организации"
                value={editingUser.organizationAddress || ''}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, organizationAddress: e.target.value })
                }
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Телефон организации"
                value={editingUser.organizationPhone || ''}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, organizationPhone: e.target.value })
                }
                fullWidth
                sx={{ mb: 2 }}
              />
            </>
          )}
          <TextField
            label="Новый пароль (оставьте пустым, если не меняете)"
            type="password"
            value={editingUser.newPassword || ''}
            onChange={(e) =>
              setEditingUser({ ...editingUser, newPassword: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleUpdateUser}>
            Сохранить изменения
          </Button>
          <Button onClick={() => setEditingUser(null)} sx={{ ml: 2 }}>
            Отмена
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AdminPanel;