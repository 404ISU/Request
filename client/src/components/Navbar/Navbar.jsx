import { Home, Login } from "@mui/icons-material";
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <Link to="/"><Home></Home>Главная </Link>
      <Link to="/register">Регистрация</Link>
      <Link to="/login"><Login></Login>Вход</Link>
      <Link to="/request">HTTP Запрос</Link>
    </nav>
  );
};

export default Navbar;
