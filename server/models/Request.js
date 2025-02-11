const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  url: String,
  method: String,
  headers: Object,
  body: Object,
  timestamp: { type: Date, default: Date.now },
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}// связь с пользователем
});

module.exports = mongoose.model('Request', requestSchema);