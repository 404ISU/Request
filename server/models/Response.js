// models/Response.js

const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  status: Number, // Статус ответа сервера
  body: Object, // Тело ответа сервера
  headers: Object, // Заголовки ответа сервера
  timestamp: { type: Date, default: Date.now }, // Время получения ответа
});

module.exports = mongoose.model('Response', responseSchema);