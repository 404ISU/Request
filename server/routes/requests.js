const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const axios = require('axios');
const cors = require('cors');

router.post('/makeRequest', async (req, res) => {
    const { url, method, headers, body } = req.body;

    if (!url || !method) {
        return res.status(400).json({ message: 'URL and method are required' });
    }

    try {
        const response = await axios({
            method,
            url,
            headers: headers || {},
            data: body || null,
            timeout: 10000, // 10 seconds timeout
        });

        const newRequest = new Request({ url, method, headers, body });
        await newRequest.save();

        res.status(200).json({
            response: response.data,
            status: response.status,
            headers: response.headers,
        });
    } catch (error) {
        console.error('Error making request:', error);

        const newRequest = new Request({ url, method, headers, body });
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
    try {
        const requests = await Request.find().sort({ timestamp: -1 }).limit(10);
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching history:', error);
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