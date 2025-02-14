const express = require('express');
const router = express.Router();
const {getUsers, updateUser, deleteUser, getStats} = require('../controllers/adminControllers');
const jwt = require('jsonwebtoken');




// просмотр всех пользователей
router.get('/get-users', getUsers);

// редактирование пользователя
router.put('/update-user/:userId', updateUser);

// удаление пользователя
router.delete('/delete-user/:userId', deleteUser);

// статистика
router.get('/get-stats', getStats);

module.exports = router;