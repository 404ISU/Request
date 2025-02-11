const express = require('express');
const router = express.Router();
const cors = require('cors');
const  bcrypt  =  require ( 'bcrypt' ) ; 

const { registerUser, loginUser, getProfile, logout, updateProfile} =require('../controllers/authControllers')

// middlleware
router.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173'
  })
)


// Регистрация
router.post('/register', registerUser);

// Авторизация
router.post('/login', loginUser);

// Профиль пользователя
router.get('/profile', getProfile); // Убедитесь, что этот маршрут существует

// Выход
router.post('/logout', logout);

// Обновление профиля
router.put('/update-profile', updateProfile);

module.exports = router;
