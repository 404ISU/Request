const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const axios = require('axios');
const cors = require('cors');


router.post('/makeRequest', async (req, res) => {
    const { url, method, headers, body } = req.body;
    console.log('Received request:', {url, method, headers, body});
    try {
      const response = await axios({
        method,
        url,
        headers,
        data: body, // Передача тела запроса
      });
  
      // Сохранение запроса в базе данных
      const newRequest = new Request({ url, method, headers, body });
      await newRequest.save();
  
      res.status(200).json({
        response: response.data,
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      // Сохранение неудачного запроса в базе данных
      console.error('Error making request:', error)
      const newRequest = new Request({ url, method, headers, body });
      await newRequest.save();
  
      res.status(500).json({
        message: error.message,
        status: error.response?.status,
        headers: error.response?.headers,
        error: error.response?.data,
      });
    }
  });
  
router.get('/history', async (req, res) => {
    try {
        const requests = await Request.find().sort({ timestamp: -1 }).limit(10);
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173'
  })
)

module.exports = router;