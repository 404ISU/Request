const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  url: String,
  method: String,
  headers: Object,
  body: Object, // Новое поле для хранения тела запроса
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Request', requestSchema);