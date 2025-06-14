// models/Response.js

const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  status: Number, // Статус ответа сервера
  body: String, // Теперь строка!
  headers: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }, // Время получения ответа
  latency: Number,
  wsSession: {
    duration: Number,
    messageCount: Number,
    connectionCount: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);