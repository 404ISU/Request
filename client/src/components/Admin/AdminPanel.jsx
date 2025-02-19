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
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from '@mui/material';
import { Search, Edit, Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrgs, setExpandedOrgs] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // Состояние для редактируемого пользователя
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
  const [filterByRequests, setFilterByRequests] = useState('all'); // Фильтр по запросам
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // Подтверждение удаления
  const [userToDelete, setUserToDelete] = useState(null); // Пользователь для удаления

  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/get-users', { withCredentials: true });
      setOrganizations(response.data.organizations || []);
      setWorkers(response.data.workers || []);
    } catch (error) {
      toast.error('Ошибка при загрузке пользователей');
    }
  };

  // Загрузка статистики
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/get-stats', { withCredentials: true });
      setStats(response.data || {});
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
  const filteredUsersByRequests = [...filteredOrganizations].filter((user) => {
    if (filterByRequests === 'all') return true;
    if (filterByRequests === 'none' && user.requestsCount === 0) return true;
    if (filterByRequests === 'some' && user.requestsCount > 0) return true;
    if (filterByRequests === 'more' && user.requestsCount > 10) return true; // Больше 10 запросов
    if (filterByRequests === 'less' && user.requestsCount <= 10) return true; // Меньше или равно 10 запросов
    return false;
  });

  // Удаление пользователя
  const handleDeleteUser = async () => {
    try {
      await axios.delete(`/api/admin/delete-user/${userToDelete}`, { withCredentials: true });
      toast.success('Пользователь успешно удален');
      fetchUsers(); // Обновляем список пользователей
    } catch (error) {
      toast.error('Ошибка при удалении пользователя');
    } finally {
      setConfirmDialogOpen(false); // Закрываем диалог подтверждения
    }
  };

  // Переключение раскрытия организации
  const toggleOrganization = (orgId) => {
    if (expandedOrgs.includes(orgId)) {
      setExpandedOrgs(expandedOrgs.filter((id) => id !== orgId));
    } else {
      setExpandedOrgs([...expandedOrgs, orgId]);
    }
  };

  // Открытие модального окна для редактирования
  const openEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Закрытие модального окна
  const closeEditModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  // Обновление данных пользователя
  const handleUpdateUser = async () => {
    try {
      const { _id, username, email, firstName, lastName, newPassword, organizationName, organizationAddress, organizationPhone } = editingUser;

      const updatedData = {
        username,
        email,
        firstName,
        lastName,
      };

      if (editingUser.role === 'organization') {
        updatedData.organizationName = organizationName;
        updatedData.organizationAddress = organizationAddress;
        updatedData.organizationPhone = organizationPhone;
      }

      if (newPassword) {
        updatedData.newPassword = newPassword;
      }

      await axios.put(`/api/admin/update-user/${_id}`, updatedData, { withCredentials: true });
      toast.success('Данные пользователя успешно обновлены');
      closeEditModal();
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
<Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Статистика сайта:
          </Typography>
          {stats ? (
            <>
              {/* Столбчатая диаграмма */}
              <BarChart width={600} height={300} data={[
                { name: 'Всего пользователей', количество: stats.totalUsers },
                { name: 'Организаций', количество: stats.totalOrganizations },
                { name: 'Работников', количество: stats.totalWorkers },
                { name: 'Запросов', количество: stats.totalRequests },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} (Количество)`} />
                <Legend />
                <Bar dataKey="количество" fill="#8884d8" />
              </BarChart>

              {/* Круговая диаграмма */}
              <PieChart width={400} height={300}>
                <Pie
                  data={[
                    { name: 'Организации', value: stats.totalOrganizations },
                    { name: 'Работники', value: stats.totalWorkers },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {[
                    <Cell key="organizations" fill="#82ca9d" />,
                    <Cell key="workers" fill="#ff8042" />,
                  ]}
                </Pie>
                <Tooltip formatter={(value) => `${value} (Количество)`} />
                <Legend />
              </PieChart>
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
          <MenuItem value="more">Больше 10 запросов</MenuItem>
          <MenuItem value="less">Меньше или равно 10 запросов</MenuItem>
        </Select>
      </Box>

      {/* Список организаций и их работников */}
      <Typography variant="h6" gutterBottom>
        Список пользователей:
      </Typography>
      <List>
        {filteredUsersByRequests.map((org) => (
          <React.Fragment key={org._id}>
            {/* Организация */}
            <ListItem
              onClick={() => toggleOrganization(org._id)}
              secondaryAction={
                <>
                  <IconButton onClick={() => openEditModal(org)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => {
                    setUserToDelete(org._id);
                    setConfirmDialogOpen(true);
                  }}>
                    <Delete />
                  </IconButton>
                </>
              }
              sx={{ cursor: 'pointer' }}
            >
              {/* Иконка выпадающего списка в начале строки */}
              {expandedOrgs.includes(org._id) ? <ExpandLess sx={{ mr: 1 }} /> : <ExpandMore sx={{ mr: 1 }} />}
              <ListItemText
                primary={`${org.username} (${org.email})`}
                secondary={`Организация: ${org.organizationName}, Запросы: ${org.requestsCount || 0}`}
              />
            </ListItem>

            {/* Работники организации */}
            <Collapse in={expandedOrgs.includes(org._id)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {filteredWorkers
                  .filter((worker) => worker.organizationId?.toString() === org._id.toString())
                  .map((worker) => (
                    <ListItem key={worker._id} sx={{ pl: 4 }}>
                      <ListItemText
                        primary={`${worker.username} (${worker.email})`}
                        secondary={`Роль: работник, Запросы: ${worker.requestsCount || 0}`}
                      />
                      <IconButton onClick={() => openEditModal(worker)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => {
                        setUserToDelete(worker._id);
                        setConfirmDialogOpen(true);
                      }}>
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>

{/* Модальное окно редактирования пользователя */}
<Dialog open={isModalOpen} onClose={closeEditModal}>
        <DialogTitle>Редактирование пользователя</DialogTitle>
        <DialogContent>
          <TextField
            label="Логин"
            value={editingUser?.username || ''}
            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            value={editingUser?.email || ''}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          {editingUser?.role === 'organization' && (
            <>
              <TextField
                label="Название организации"
                value={editingUser?.organizationName || ''}
                onChange={(e) => setEditingUser({ ...editingUser, organizationName: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Адрес организации"
                value={editingUser?.organizationAddress || ''}
                onChange={(e) => setEditingUser({ ...editingUser, organizationAddress: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Телефон организации"
                value={editingUser?.organizationPhone || ''}
                onChange={(e) => setEditingUser({ ...editingUser, organizationPhone: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              />
            </>
          )}
          <TextField
            label="Новый пароль"
            type="password"
            value={editingUser?.newPassword || ''}
            onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal}>Отмена</Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary">
            Сохранить изменения
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить этого пользователя?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteUser} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;