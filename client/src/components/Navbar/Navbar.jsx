// components/Navbar/Navbar.js

import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Link as MuiLink,
  IconButton,
} from "@mui/material";
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { Home, Login, Person, People} from "@mui/icons-material";
import { styled } from "@mui/system";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StyledAppBar = styled(AppBar)({
  backgroundColor: "#2196f3", // Цвет фона
  color: "#fff", // Цвет текста
});

const NavbarLink = styled(MuiLink)({
  textDecoration: "none",
  color: "inherit",
  "&:hover": {
    color: "#ffffff",
    textDecoration: "underline",
  },
});

const Navbar = () => {
  const { user, logout, loading } = useContext(UserContext);
  const navigate = useNavigate();

  // Обработчик выхода
  const handleLogout = async () => {
    try {
      await axios.post("/logout", null, { withCredentials: true });
      logout(); // Метод выхода из контекста
      navigate("/login"); // Перенаправляем на страницу входа
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      alert("Произошла ошибка при выходе");
    }
  };

  if (loading) {
    return (
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6">Загрузка...</Typography>
        </Toolbar>
      </StyledAppBar>
    );
  }

  return (
    <StyledAppBar position="static">
      <Toolbar>
        {/* Общие ссылки */}
        <NavbarLink component={Link} to="/" sx={{ mr: 2 }}>
          <Home sx={{ mr: 1 }} /> Главная
        </NavbarLink>

        {/* Ссылки для неавторизованных пользователей */}
        {!user && (
          <>
            <NavbarLink component={Link} to="/register" sx={{ mr: 2 }}>
              Регистрация
            </NavbarLink>
            <NavbarLink component={Link} to="/login" sx={{ mr: 2 }}>
              <Login sx={{ mr: 1 }} /> Вход
            </NavbarLink>
          </>
        )}

        {/* Ссылки для авторизованных пользователей */}
        {!!user && (
          <>
            {/* HTTP-запросы доступны всем ролям */}
            <NavbarLink component={Link} to="/request" sx={{ mr: 2 }}>
              HTTP Запрос
            </NavbarLink>

            {/* Профиль пользователя */}
            <NavbarLink component={Link} to="/user-profile" sx={{ mr: 2 }}>
              <Person sx={{ mr: 1 }} /> {user.name || user.username}
            </NavbarLink>

            {/* Управление работниками доступно только организациям */}
            {user.role === "organization" && (
              <NavbarLink component={Link} to="/manage-workers" sx={{ mr: 2 }}>
                <People sx={{ mr: 1 }} /> Управление работниками
              </NavbarLink>
            )}

            {/* Панель администратора доступна только админам */}
            {user.role === "admin" && (
              <NavbarLink component={Link} to="/admin-panel" sx={{ mr: 2 }}>
                <AssignmentIndIcon sx={{mr:1}}/>
               Администрирование
              </NavbarLink>
            )}

            {/* Кнопка выхода */}
            <Button color="inherit" onClick={handleLogout}>
              Выход
            </Button>
          </>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;