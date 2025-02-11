import { Home, Login } from "@mui/icons-material";
import React, {useContext} from "react";
import { Link } from "react-router-dom";
import { UserContext} from "../../context/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";




const Navbar = () => {
  const {user, setUser, logout, loading}=useContext(UserContext);
  const navigate = useNavigate();


  //обработчик выхода
  const handleLogout = async ()=>{
    try {
      await axios.post('/logout', null, {withCredentials: true});
      logout(); // метод выхода из контекста
      navigate('/login') // перенаправляем на страницу входа
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      toast.error('Произошла ошибка при входе')
    }
  };
  if(loading){
    return <h1>Загрузка...</h1>; // показываем загрузку при загрузке контекста
  }

  return (
    <nav>
      {!user && (
        <>
          <Link to="/"><Home /> Главная</Link>
          <Link to="/register">Регистрация</Link>
          <Link to="/login"><Login /> Вход</Link>
        </>
      )}

      {!!user && (
        <>
          <Link to="/"><Home /> Главная</Link>
          <Link to="/request">HTTP Запрос</Link>
          <Link to="/dashboard">{user.name}</Link>
          <Link to='/user-profile'>профиль</Link>
            <Link to="/manage-workers">Организация</Link>
          
          <button onClick={handleLogout}>Выход</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
