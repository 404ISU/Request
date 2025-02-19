// routes/requests.js
const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Response = require('../models/Response');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// routes/requests.js

router.post('/makeRequest', async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Необходима авторизация' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (jwtError) {
    return res.status(401).json({ message: 'Неверный токен' });
  }

  try {
    const { url, method, headers, body } = req.body;

    if (!url || !method) {
      return res.status(400).json({ message: 'URL и метод обязательны' });
    }

    // Преобразуем headers и body в JSON (если они undefined или уже объекты)
    let parsedHeaders = {};
    let parsedBody = null;

    if (typeof headers === 'string') {
      parsedHeaders = headers ? JSON.parse(headers) : {};
    } else if (typeof headers === 'object') {
      parsedHeaders = headers; // Если уже объект, оставляем как есть
    }

    if (typeof body === 'string') {
      parsedBody = body ? JSON.parse(body) : null;
    } else if (typeof body === 'object') {
      parsedBody = body; // Если уже объект, оставляем как есть
    }

    // Выполняем запрос
    const response = await axios({
      method,
      url,
      headers: parsedHeaders,
      data: parsedBody,
      timeout: 10000, // 10 секунд таймаут
    });

    // Создаем документ для результата запроса
    const newResponse = new Response({
      status: response.status,
      body: response.data,
      headers: response.headers,
    });

    await newResponse.save();

    // Создаем документ для самого запроса
    const newRequest = new Request({
      url,
      method,
      headers: typeof headers === 'string' ? headers : JSON.stringify(headers),
      body: typeof body === 'string' ? body : JSON.stringify(body),
      userId: decoded.id,
      response: newResponse._id, // Связываем запрос с результатом
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
    const { url, method, headers, body } = req.body;

    let parsedHeaders = {};
    let parsedBody = null;

    if (typeof headers === 'string') {
      parsedHeaders = headers ? JSON.parse(headers) : {};
    } else if (typeof headers === 'object') {
      parsedHeaders = headers;
    }

    if (typeof body === 'string') {
      parsedBody = body ? JSON.parse(body) : null;
    } else if (typeof body === 'object') {
      parsedBody = body;
    }

    // Создаем документ для результата запроса (ошибки)
    const newResponse = new Response({
      status: error.response?.status || 500,
      body: error.response?.data || {},
      headers: error.response?.headers || {},
    });

    await newResponse.save();

    // Создаем документ для самого запроса
    const newRequest = new Request({
      url,
      method,
      headers: typeof headers === 'string' ? headers : JSON.stringify(headers),
      body: typeof body === 'string' ? body : JSON.stringify(body),
      userId: decoded.id, // Теперь decoded доступен
      response: newResponse._id, // Связываем запрос с результатом
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


router.get('/history', async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Необходима авторизация' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Извлекаем запросы пользователя с результатами
    const requests = await Request.find({ userId: decoded.id })
      .populate('response') // Подтягиваем связанные результаты
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