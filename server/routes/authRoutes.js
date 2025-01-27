const express = require('express');
const { registerOrganization, registerEmployee, login, logout, getMe, updateMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerOrganization); // Регистрация организации
router.post('/register-employee', registerEmployee); // Регистрация сотрудника
router.post('/login', login); // Авторизация
router.post('/logout', logout); // Выход
router.get('/me', authenticate, getMe); // Получить данные пользователя
router.put('/update', authenticate, updateMe); // Обновить данные пользователя

module.exports = router;
