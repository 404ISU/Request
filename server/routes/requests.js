const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const axios = require('axios');

router.post('/makeRequest', async (req, res) => {
    const { url, method, headers, body } = req.body;
    try {
        const response = await axios({
            method,
            url,
            headers,
            body
        });

        const newRequest = new Request({ url, method, headers });
        await newRequest.save();

        const responseData = {
             response: response.data,  // Исправлено: response: response.data
             status: response.status,
             headers: response.headers
        };

        res.status(200).json(responseData);
    }  catch (error) {
         const newRequest = new Request({ url, method, headers });
         await newRequest.save();

        const errorResponse = {
            message: error.message,
            status: error.response ? error.response.status : undefined,
            headers: error.response ? error.response.headers : undefined,
            error: error.response ? error.response.data : undefined,
        };
        res.status(500).json(errorResponse);
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

module.exports = router;