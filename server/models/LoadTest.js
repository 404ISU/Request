// models/LoadTest.js
const mongoose = require('mongoose');

const loadTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Описываем целевой HTTP-запрос
  request: {
    method: { type: String, enum: ['GET','POST','PUT','DELETE','PATCH'], default: 'GET' },
    url: { type: String, required: true },
    headers: { type: mongoose.Schema.Types.Mixed, default: {} },
    body: mongoose.Schema.Types.Mixed
  },
  // Параметры нагрузки
  config: {
    duration: { type: Number, default: 30 },  // в секундах
    rate: { type: Number, default: 10 }        // RPS
  },
  // Результаты (сохраним по окончании воркера)
  results: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  // Добавляем связь с пользователем
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }
});

module.exports = mongoose.model('LoadTest', loadTestSchema);
