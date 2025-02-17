import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

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
  const [openCreate, setOpenCreate] = useState(false); // State for controlling the visibility of the create form

  // Загрузка списка работников
  const fetchWorkers = async () => {
    try {
      const response = await axios.get('/api/workers/get-workers');
      setWorkers(response.data);
    } catch (error) {
      toast.error('Ошибка при загрузке работников');
      console.error("Error fetching workers:", error); // Log the error
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Создание нового работника
  const handleCreateWorker = async () => {
    try {
      await axios.post('/api/workers/create-worker', newWorker);
      setNewWorker({ username: '', email: '', password: '', firstName: '', lastName: '', name: '' });
      toast.success('Работник успешно создан');
      fetchWorkers();
      setOpenCreate(false); // Close the create form after successful creation
    } catch (error) {
      toast.error('Ошибка при создании работника');
      console.error("Error creating worker:", error); // Log the error
    }
  };

  // Редактирование работника
  const handleEditWorker = (worker) => {
    setEditingWorker({ ...worker });
  };

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
      setEditingWorker(null);
      toast.success('Данные работника успешно обновлены');
      fetchWorkers();
    } catch (error) {
      toast.error('Ошибка при обновлении данных работника');
      console.error("Error updating worker:", error); // Log the error
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
      console.error("Error deleting worker:", error); // Log the error
    }
  };

  const toggleCreateForm = () => {
    setOpenCreate(!openCreate);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Управление работниками
        </Typography>

        {/* Form for creating a new worker */}
        <Box mb={3}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={toggleCreateForm}
          >
            {openCreate ? 'Скрыть форму создания' : 'Создать нового работника'}
          </Button>
          <Collapse in={openCreate} timeout="auto" unmountOnExit>
            <Box mt={2} sx={{ p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
              <Typography variant="h6" gutterBottom>
                Создать нового работника
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Логин"
                    variant="outlined"
                    value={newWorker.username}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, username: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    value={newWorker.email}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, email: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Пароль"
                    variant="outlined"
                    type="password"
                    value={newWorker.password}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, password: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Имя"
                    variant="outlined"
                    value={newWorker.firstName}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, firstName: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Фамилия"
                    variant="outlined"
                    value={newWorker.lastName}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, lastName: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Отчество"
                    variant="outlined"
                    value={newWorker.name}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, name: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="primary" onClick={handleCreateWorker}>
                    Создать
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Box>

        {/* Form for editing a worker */}
        {editingWorker && (
          <Box mb={3} sx={{ p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
            <Typography variant="h6" gutterBottom>
              Редактирование работника
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Логин"
                  variant="outlined"
                  value={editingWorker.username}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, username: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={editingWorker.email}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Новый пароль (оставьте пустым, если не меняете)"
                  variant="outlined"
                  type="password"
                  value={editingWorker.password}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, password: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Имя"
                  variant="outlined"
                  value={editingWorker.firstName}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, firstName: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Фамилия"
                  variant="outlined"
                  value={editingWorker.lastName}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, lastName: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Отчество"
                  variant="outlined"
                  value={editingWorker.name}
                  onChange={(e) =>
                    setEditingWorker({ ...editingWorker, name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between">
                  <Button variant="contained" color="primary" onClick={handleUpdateWorker}>
                    Сохранить
                  </Button>
                  <Button variant="outlined" onClick={() => setEditingWorker(null)}>
                    Отмена
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* List of workers */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Список работников
          </Typography>
          {workers.length === 0 ? (
            <Typography>Нет работников в организации.</Typography>
          ) : (
            <List>
              {workers.map((worker) => (
                <ListItem
                  key={worker._id}
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditWorker(worker)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteWorker(worker._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={`${worker.firstName} ${worker.lastName} ${worker.name}`}
                    secondary={`(${worker.email})`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>
    </Container>
  );
}