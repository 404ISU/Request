// components/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Иконки для показа/скрытия пароля
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '', // Инициализируем пустой строкой
    password: '', // Инициализируем пустой строкой
  });
  const [showPassword, setShowPassword] = useState(false); // Состояние для управления видимостью пароля
  const navigate = useNavigate(); // Хук для навигации

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Отправляем запрос на сервер
      const response = await axios.post('/login', formData, { withCredentials: true });
      toast.success('Вход выполнен успешно');
      // Перенаправляем пользователя на страницу дашборда
      navigate('/user-profile');
    } catch (error) {
      toast.error('Неверный логин или пароль');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Вход
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Логин */}
        <TextField
          label="Логин"
          name="username"
          value={formData.username} // Управляемое значение
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        {/* Пароль */}
        <TextField
          label="Пароль"
          name="password"
          type={showPassword ? 'text' : 'password'} // Переключение типа поля
          value={formData.password} // Управляемое значение
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Кнопка входа */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Войти
        </Button>
      </form>
    </Box>
  );
};

export default Login;