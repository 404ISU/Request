import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'organization',
    organizationName: '',
    organizationAddress: '',
    organizationPhone: '',
    personalData: {
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
    },
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) newErrors.username = 'Логин обязателен';
    if (!formData.email) newErrors.email = 'Email обязателен';
    if (!formData.password) newErrors.password = 'Пароль обязателен';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'Необходимо согласиться с условиями';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     if(!validateForm()){
        return;
      }
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        organizationName: formData.organizationName,
        organizationAddress: formData.organizationAddress,
        organizationPhone: formData.organizationPhone,
        personalData: formData.personalData,
      });
      console.log('Registration successful:', response.data);
      alert('Регистрация прошла успешно!');
    } catch (error) {
      if (error.response) {
          console.error('Ошибка от сервера:', error.response.data);
          alert(`Ошибка: ${error.response.data.message || 'Не удалось выполнить запрос'}`);
        } else {
          console.error('Неизвестная ошибка:', error);
          alert('Произошла ошибка. Проверьте консоль для подробностей.');
        }
    }
  };
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name.startsWith('personalData')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        personalData: { ...formData.personalData, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Регистрация
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Логин"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Подтвердите пароль"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Название организации"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Адрес организации"
            name="organizationAddress"
            value={formData.organizationAddress}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Телефон организации"
            name="organizationPhone"
            value={formData.organizationPhone}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Имя"
            name="personalData.firstName"
            value={formData.personalData.firstName}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Фамилия"
            name="personalData.lastName"
            value={formData.personalData.lastName}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Отчество"
            name="personalData.middleName"
            value={formData.personalData.middleName}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Телефон"
            name="personalData.phone"
            value={formData.personalData.phone}
            onChange={handleChange}
            required
          />
          <FormControlLabel
            control={
              <Checkbox
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
            }
            label="Я согласен на обработку персональных данных"
          />
           {errors.agreeToTerms && (
                <Typography color="error" variant="body2">
                    {errors.agreeToTerms}
                </Typography>
            )}
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 3 }}>
            Зарегистрироваться
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;