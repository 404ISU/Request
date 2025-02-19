import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Modal,
  IconButton,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import ConfirmDialog from './ConfirmDialog'; // Импортируем компонент подтверждения

export default function ManageWorkers() {
  const [workers, setWorkers] = useState([]);
  const [newWorker, setNewWorker] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    name: '',
  });
  const [editingWorker, setEditingWorker] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // Тип действия (create, edit, delete)
  const [pendingAction, setPendingAction] = useState(null); // Ожидающее действие

  // Загрузка списка работников
  const fetchWorkers = async () => {
    try {
      const response = await axios.get('/api/workers/get-workers');
      setWorkers(response.data);
    } catch (error) {
      toast.error('Ошибка при загрузке работников');
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Фильтрация работников по поиску
  const filteredWorkers = workers.filter((worker) =>
    worker.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Открытие модального окна подтверждения
  const openConfirmDialog = (action, callback) => {
    setActionType(action);
    setPendingAction(() => callback); // Сохраняем действие для выполнения после подтверждения
    setConfirmDialogOpen(true);
  };

  // Закрытие модального окна подтверждения
  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  // Подтверждение действия
  const handleConfirmAction = () => {
    if (pendingAction) {
      pendingAction(); // Выполняем сохраненное действие
    }
    closeConfirmDialog();
  };

  // Создание нового работника
  const handleCreateWorker = async () => {
    try {
      await axios.post('/api/workers/create-worker', newWorker);
      setNewWorker({ username: '', email: '', password: '', firstName: '', lastName: '', name: '' });
      toast.success('Работник успешно создан');
      fetchWorkers();
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error('Ошибка при создании работника');
    }
  };

  const handleEditWorker = (worker) => {
    setEditingWorker({ ...worker });
    setIsEditModalOpen(true);
  };  

  // Редактирование работника
 const handleUpdateWorker = async () => {
    try {
      await axios.put(`/api/workers/update-worker/${editingWorker._id}`, {
        username: editingWorker.username,
        email: editingWorker.email,
        password: editingWorker.password, // Новый пароль
        firstName: editingWorker.firstName,
        lastName: editingWorker.lastName,
        name: editingWorker.name, // Имя, фамилия, отчество
      });
      setIsEditModalOpen(false); // Закрываем модальное окно
      toast.success('Данные работника успешно обновлены');
      fetchWorkers();
    } catch (error) {
      toast.error('Ошибка при обновлении данных работника');
    }
  };

  // Удаление работника
  const handleDeleteWorker = async (workerId) => {
    try {
      await axios.delete(`/api/workers/delete-worker/${workerId}`);
      toast.success('Работник успешно удален');
      fetchWorkers();
    } catch (error) {
      toast.error('Ошибка при удалении работника');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Управление работниками
        </Typography>

        {/* Поле поиска */}
        <TextField
          label="Поиск работников"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />

        {/* Кнопка для открытия модального окна создания */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsCreateModalOpen(true)}
            fullWidth
          >
            Создать нового работника
          </Button>
        </Box>

        {/* Список работников */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Список работников
          </Typography>
          <Box display="flex" gap={4} mb={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              Имя
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold">
              Фамилия
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold">
              Отчество
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold">
              Email
            </Typography>
          </Box>
          {filteredWorkers.length === 0 ? (
            <Typography>Нет работников в организации.</Typography>
          ) : (
            <List>
              {filteredWorkers.map((worker) => (
                <React.Fragment key={worker._id}>
                  <ListItem
                    secondaryAction={
                      <>
                        <IconButton onClick={() =>  handleEditWorker(worker)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => openConfirmDialog('delete', () => handleDeleteWorker(worker._id))}>
                          <Delete />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" gap={4}>
                          <Typography variant="body2">{worker.name}</Typography>
                          <Typography variant="body2">{worker.firstName}</Typography>
                          <Typography variant="body2">{worker.lastName || 'Не указано'}</Typography>
                          <Typography variant="body2">{worker.email}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Модальное окно для создания нового работника */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-title" variant="h5" gutterBottom>
            Создание нового работника
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Поля для создания */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Логин"
                value={newWorker.username}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, username: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newWorker.email}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Пароль"
                type="password"
                value={newWorker.password}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, password: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Имя"
                value={newWorker.name}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Фамилия"
                value={newWorker.firstName}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, firstName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Отчество"
                value={newWorker.lastName}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, lastName: e.target.value })
                }
              />
            </Grid>
          </Grid>

          {/* Кнопки управления модальным окном */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => openConfirmDialog('create', handleCreateWorker)}
            >
              Создать
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Модальное окно для редактирования работника */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="edit-modal-title" variant="h5" gutterBottom>
            Редактирование работника
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Поля для редактирования */}
          {editingWorker && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Логин"
                  value={editingWorker.username}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, username: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editingWorker.email}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Новый пароль (оставьте пустым, если не меняете)"
                  type="password"
                  value={editingWorker.password}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, password: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Имя"
                  value={editingWorker.name}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Фамилия"
                  value={editingWorker.firstName}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, firstName: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Отчество"
                  value={editingWorker.lastName}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, lastName: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          )}

          {/* Кнопки управления модальным окном */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => openConfirmDialog('edit', handleUpdateWorker)}
            >
              Сохранить
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Модальное окно подтверждения */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmAction}
        title={actionType === 'delete' ? 'Удаление работника' : actionType === 'edit' ? 'Редактирование работника' : 'Создание работника'}
        message={
          actionType === 'delete'
            ? 'Вы уверены, что хотите удалить этого работника?'
            : actionType === 'edit'
            ? 'Вы уверены, что хотите сохранить изменения?'
            : 'Вы уверены, что хотите создать нового работника?'
        }
      />
    </Box>
  );
}