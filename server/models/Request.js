// models/Request.js

const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  url: String, // URL запроса
  method: String, // Метод запроса (GET, POST, etc.)
  headers: Object, // Заголовки запроса
  body: Object, // Тело запроса
  timestamp: { type: Date, default: Date.now }, // Время отправки запроса
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Связь с пользователем
  response: { type: mongoose.Schema.Types.ObjectId, ref: 'Response' }, // Ссылка на результат запроса
});

module.exports = mongoose.model('Request', requestSchema);