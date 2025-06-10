// components/Login.js

import React, { useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TextField, Button, Box, Typography,  IconButton,
  InputAdornment, } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import { Visibility, VisibilityOff } from '@mui/icons-material'; 
export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const { login } = useContext(UserContext); // Используем контекст
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
      const response = await axios.post('/login', formData, { withCredentials: true });
      
      // Исправлено: проверка структуры ответа
      if (!response.data?.user) {
        throw new Error('Некорректные данные пользователя');
      }
      
      toast.success('Вход выполнен успешно');
      console.log('Данные пользователя после входа:', response.data.user);
      
      if(response.data?.user) {
        login(response.data.user); // Данные теперь в response.data.user
        navigate('/request'); // Перенаправляем на страницу запросов вместо профиля
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      toast.error(error.response?.data?.message || 'Неверный логин или пароль');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Вход
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Логин"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
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
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Войти
        </Button>
      </form>
    </Box>
  );
}