import React, { useContext } from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';


const LogoutButton = () => {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Вызываем метод выхода из контекста
    navigate('/login'); // Перенаправляем на страницу входа
  };

  return (
    <Button variant="contained" color="error" onClick={handleLogout}>
      Выход
    </Button>
  );
};

export default LogoutButton;