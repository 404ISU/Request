// components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Иконки для показа/скрытия пароля
import { IMaskInput } from 'react-imask';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [data, setData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationAddress: '',
    organizationPhone: '',
    isAgreed: false,
  });
  const [showPassword, setShowPassword] = useState(false); // Состояние для поля "Пароль"
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Состояние для поля "Подтверждение пароля"
  const navigate = useNavigate();

  // Валидация формы
  const validateForm = () => {
    const { name, firstName, lastName, organizationPhone, isAgreed, password, confirmPassword } = data;

    // Валидация имени, фамилии и отчества (только русские буквы)
    const cyrillicRegex = /^[А-Яа-яЁё]+$/;
    if (!cyrillicRegex.test(name)) {
      toast.error('Имя должно содержать только русские буквы');
      return false;
    }
    if (!cyrillicRegex.test(firstName)) {
      toast.error('Фамилия должна содержать только русские буквы');
      return false;
    }
    if (!cyrillicRegex.test(lastName)) {
      toast.error('Отчество должно содержать только русские буквы');
      return false;
    }

    // Проверка телефона
    if (!organizationPhone || organizationPhone.length < 16) {
      toast.error('Введите корректный номер телефона');
      return false;
    }

    // Проверка согласия с условиями
    if (!isAgreed) {
      toast.error('Вы должны принять лицензионное соглашение');
      return false;
    }

    // Валидация пароля
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        'Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы'
      );
      return false;
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return false;
    }

    return true;
  };

  // Регистрация пользователя
  const registerUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post('/register', data, { withCredentials: true });
      toast.success('Регистрация прошла успешно');
      navigate('/login'); // Перенаправляем на страницу входа
    } catch (error) {
      toast.error('Ошибка при регистрации');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Регистрация
      </Typography>
      <form onSubmit={registerUser}>
        {/* Имя */}
        <TextField
          fullWidth
          label="Имя"
          placeholder="Введите имя"
          value={data.name}
          onChange={(e) =>
            setData({ ...data, name: e.target.value.replace(/[^А-Яа-яЁё]/g, '') })
          }
          margin="normal"
        />
        {/* Фамилия */}
        <TextField
          fullWidth
          label="Фамилия"
          placeholder="Введите фамилию"
          value={data.firstName}
          onChange={(e) =>
            setData({
              ...data,
              firstName: e.target.value.replace(/[^А-Яа-яЁё]/g, ''),
            })
          }
          margin="normal"
        />
        {/* Отчество */}
        <TextField
          fullWidth
          label="Отчество"
          placeholder="Введите отчество"
          value={data.lastName}
          onChange={(e) =>
            setData({
              ...data,
              lastName: e.target.value.replace(/[^А-Яа-яЁё]/g, ''),
            })
          }
          margin="normal"
        />
        {/* Логин */}
        <TextField
          fullWidth
          label="Логин"
          placeholder="Введите логин"
          value={data.username}
          onChange={(e) => setData({ ...data, username: e.target.value })}
          margin="normal"
        />
        {/* Email */}
        <TextField
          fullWidth
          label="Email"
          type="email"
          placeholder="Введите email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          margin="normal"
        />
        {/* Пароль */}
        <TextField
          fullWidth
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          placeholder="Введите пароль"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          margin="normal"
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            ),
          }}
        />
        {/* Подтверждение пароля */}
        <TextField
          fullWidth
          label="Подтверждение пароля"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Введите повторно пароль"
          value={data.confirmPassword}
          onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
          margin="normal"
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            ),
          }}
        />
        {/* Название организации */}
        <TextField
          fullWidth
          label="Название организации"
          placeholder="Введите название организации"
          value={data.organizationName}
          onChange={(e) => setData({ ...data, organizationName: e.target.value })}
          margin="normal"
        />
        {/* Адрес организации */}
        <TextField
          fullWidth
          label="Адрес организации"
          placeholder="Введите адрес организации"
          value={data.organizationAddress}
          onChange={(e) => setData({ ...data, organizationAddress: e.target.value })}
          margin="normal"
        />
        {/* Телефон организации */}
        <TextField
          fullWidth
          label="Телефон организации"
          placeholder="+7 (___) ___-__-__"
          value={data.organizationPhone}
          onChange={(e) => setData({ ...data, organizationPhone: e.target.value })}
          margin="normal"
          InputProps={{
            inputComponent: IMaskInput,
            inputProps: { mask: '+{7} (000) 000-00-00' },
          }}
        />
        {/* Чекбокс для принятия условий */}
        <FormControlLabel
          control={
            <Checkbox
              checked={data.isAgreed}
              onChange={(e) => setData({ ...data, isAgreed: e.target.checked })}
            />
          }
          label="Я принимаю лицензионное соглашение"
        />
        {/* Кнопка регистрации */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Зарегистрироваться
        </Button>
      </form>
    </Box>
  );
}