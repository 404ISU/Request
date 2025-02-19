// components/UserProfile.js
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
  Divider,
  Modal,
  Avatar,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    organizationAddress: '',
    organizationPhone: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Загрузка профиля пользователя
  const fetchProfile = async () => {
    try {
      const response = await axios.get('/profile', { withCredentials: true });
      setUser(response.data);
      setUpdatedUser({
        username: response.data.username,
        email: response.data.email,
        name: response.data.name || '',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        organizationName: response.data.organizationName || '',
        organizationAddress: response.data.organizationAddress || '',
        organizationPhone: response.data.organizationPhone || '',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Ошибка при загрузке профиля');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Обновление профиля
  const handleUpdateProfile = async () => {
    if (updatedUser.password !== updatedUser.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    try {
      await axios.put('/update-profile', updatedUser, { withCredentials: true });
      toast.success('Профиль успешно обновлен');
      fetchProfile(); // Обновление данных после изменений
      setIsModalOpen(false); // Закрытие модального окна
    } catch (error) {
      toast.error('Ошибка при обновлении профиля');
    }
  };

  if (!user) return <div>Загрузка...</div>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Основная карточка профиля */}
      <Paper elevation={6} sx={{ p: 4, maxWidth: 600, mx: 'auto', borderRadius: 4, position: 'relative' }}>
        {/* Аватар пользователя */}
        <Box textAlign="center" mb={3}>
          <Avatar
            src={user.avatar || '/uploads/avatars/default-avatar.png'}
            sx={{ width: 100, height: 100, margin: '0 auto', bgcolor: 'primary.main' }}
          />
          <Typography variant="h5" gutterBottom mt={2}>
            {user.username}
          </Typography>
          <IconButton
            onClick={() => setIsModalOpen(true)}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'rgba(0, 0, 0, 0.1)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.2)' },
            }}
          >
            <EditIcon />
          </IconButton>
        </Box>

        {/* Текущие данные */}
        <Typography variant="h6" gutterBottom>
          Текущие данные:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <AccountCircleIcon sx={{ mr: 1 }} />
              <Typography>
                <strong>Логин:</strong> {user.username}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <EmailIcon sx={{ mr: 1 }} />
              <Typography>
                <strong>Email:</strong> {user.email}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <AccountCircleIcon sx={{ mr: 1 }} />
              <Typography>
                <strong>Имя:</strong> {user.name}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <AccountCircleIcon sx={{ mr: 1 }} />
              <Typography>
                <strong>Фамилия:</strong> {user.firstName}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <AccountCircleIcon sx={{ mr: 1 }} />
              <Typography>
                <strong>Отчество:</strong> {user.lastName}
              </Typography>
            </Box>
          </Grid>
          {user.role === 'organization' && (
            <>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <BusinessIcon sx={{ mr: 1 }} />
                  <Typography>
                    <strong>Название организации:</strong> {user.organizationName}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <HomeIcon sx={{ mr: 1 }} />
                  <Typography>
                    <strong>Адрес организации:</strong> {user.organizationAddress}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <PhoneIcon sx={{ mr: 1 }} />
                  <Typography>
                    <strong>Телефон организации:</strong> {user.organizationPhone}
                  </Typography>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Модальное окно редактирования */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
            borderRadius: 4,
          }}
        >
          <Typography id="modal-title" variant="h5" gutterBottom>
            Редактирование профиля
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Поля для редактирования */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Логин"
                value={updatedUser.username}
                onChange={(e) =>
                  setUpdatedUser({ ...updatedUser, username: e.target.value })
                }
                InputProps={{
                  startAdornment: <AccountCircleIcon sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={updatedUser.email}
                onChange={(e) =>
                  setUpdatedUser({ ...updatedUser, email: e.target.value })
                }
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Новый пароль (оставьте пустым, если не меняете)"
                type="password"
                value={updatedUser.password}
                onChange={(e) =>
                  setUpdatedUser({ ...updatedUser, password: e.target.value })
                }
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Имя"
                value={updatedUser.name}
                onChange={(e) =>
                  setUpdatedUser({ ...updatedUser, name: e.target.value })
                }
                InputProps={{
                  startAdornment: <AccountCircleIcon sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Фамилия"
                value={updatedUser.firstName}
                onChange={(e) =>
                  setUpdatedUser({ ...updatedUser, firstName: e.target.value })
                }
                InputProps={{
                  startAdornment: <AccountCircleIcon sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Отчество"
                value={updatedUser.lastName}
                onChange={(e) =>
                  setUpdatedUser({ ...updatedUser, lastName: e.target.value })
                }
                InputProps={{
                  startAdornment: <AccountCircleIcon sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            {user.role === 'organization' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Название организации"
                    value={updatedUser.organizationName}
                    onChange={(e) =>
                      setUpdatedUser({
                        ...updatedUser,
                        organizationName: e.target.value,
                      })
                    }
                    InputProps={{
                      startAdornment: <BusinessIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Адрес организации"
                    value={updatedUser.organizationAddress}
                    onChange={(e) =>
                      setUpdatedUser({
                        ...updatedUser,
                        organizationAddress: e.target.value,
                      })
                    }
                    InputProps={{
                      startAdornment: <HomeIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Телефон организации"
                    value={updatedUser.organizationPhone}
                    onChange={(e) =>
                      setUpdatedUser({
                        ...updatedUser,
                        organizationPhone: e.target.value,
                      })
                    }
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>

          {/* Кнопки управления модальным окном */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CancelIcon />}
              onClick={() => setIsModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleUpdateProfile}
            >
              Сохранить изменения
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}