const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Response = require('../models/Response');
const axios = require('axios');
const jwt = require('jsonwebtoken');

router.post('/makeRequest', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Необходима авторизация' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { method, url, headers, data } = req.body;

    // Валидация URL
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (error) {
      return res.status(400).json({ message: 'Некорректный URL' });
    }

    // Очистка query-параметров
    urlObj.searchParams.forEach((value, key) => {
      if (!value) urlObj.searchParams.delete(key);
    });

    const cleanUrl = `${urlObj.origin}${urlObj.pathname}`;

    const start = Date.now();
    const parsedHeaders = typeof headers === 'string' 
      ? JSON.parse(headers) 
      : headers || {};

    const parsedData = typeof data === 'string' 
      ? JSON.parse(data) 
      : data;

    const response = await axios({
      method: method.toUpperCase(),
      url: urlObj.toString(),
      headers: parsedHeaders,
      data: parsedData,
      timeout: 10000
    });

    // Нормализуем заголовки ответа
    const normalizedHeaders = {};
    Object.entries(response.headers).forEach(([key, value]) => {
      normalizedHeaders[key.toLowerCase()] = value;
    });

    const newResponse = new Response({
      status: response.status,
      body: JSON.stringify(response.data),
      headers: normalizedHeaders,
      latency: Date.now() - start,
      timestamp: new Date()
    });

    await newResponse.save();

    const newRequest = new Request({
      url: cleanUrl,
      method: method.toUpperCase(),
      headers: parsedHeaders,
      body: parsedData,
      userId: decoded.id,
      response: newResponse._id,
      timestamp: new Date(),
      queryParams: urlObj.searchParams.toString(),
    });

    await newRequest.save();

    res.status(200).json({
      data: response.data,
      status: response.status,
      headers: normalizedHeaders,
      latency: Date.now() - start,
      _id: newRequest._id,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Ошибка:', error);
    
    // Нормализуем заголовки ошибки
    const errorHeaders = {};
    if (error.response?.headers) {
      Object.entries(error.response.headers).forEach(([key, value]) => {
        errorHeaders[key.toLowerCase()] = value;
      });
    }

    res.status(error.response?.status || 500).json({ 
      message: error.message,
      details: error.response?.data,
      error: {
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: errorHeaders
      }
    });
  }
});

router.get('/history', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Необходима авторизация' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // находим пользователя и его запросы
    const requests = await Request.find({ userId: decoded.id })
    .populate('response')
    .sort({ timestamp: -1 })
    .limit(50) // Добавляем лимит
    .lean();
    requests.forEach(req => {
      if (req.response?.body && typeof req.response.body !== 'string') {
        req.response.body = JSON.stringify(req.response.body);
      }
    });

    res.status(200).json(requests.map(r => ({
      ...r,
      response: r.response || null
    })));
  } catch (error) {
    console.error('Ошибка получения истории:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

module.exports = router;