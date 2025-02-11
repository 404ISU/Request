// routes/requests.js
const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');

router.post('/makeRequest', async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Необходима авторизация' });

  try {
    const { url, method, headers, body } = req.body;

    if (!url || !method) {
      return res.status(400).json({ message: 'URL и метод обязательны' });
    }

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Создаем новый запрос
    const response = await axios({
      method,
      url,
      headers: headers || {},
      data: body || null,
      timeout: 10000, // 10 секунд таймаут
    });

    // Сохраняем запрос в базу данных с userId
    const newRequest = new Request({
      url,
      method,
      headers,
      body,
      userId: decoded.id, // Привязываем к пользователю
    });
    await newRequest.save();

    res.status(200).json({
      response: response.data,
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);

    // Сохраняем запрос даже при ошибке
    const newRequest = new Request({
      url: req.body.url,
      method: req.body.method,
      headers: req.body.headers,
      body: req.body.body,
      userId: decoded.id, // Привязываем к пользователю
    });
    await newRequest.save();

    res.status(error.response?.status || 500).json({
      message: error.message,
      status: error.response?.status,
      headers: error.response?.headers,
      error: error.response?.data,
    });
  }
});
// routes/requests.js

router.get('/history', async (req, res) => {
    const token = req.cookies.token;
  
    if (!token) return res.status(401).json({ message: 'Необходима авторизация' });
  
    try {
      // Проверяем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Получаем историю запросов для текущего пользователя
      const requests = await Request.find({ userId: decoded.id })
        .sort({ timestamp: -1 }) // Сортируем по времени (от новых к старым)
        .limit(10); // Ограничиваем количество записей
  
      res.status(200).json(requests);
    } catch (error) {
      console.error('Ошибка при получении истории запросов:', error);
      res.status(500).json({ error: error.message });
    }
  });

router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
);

module.exports = router;