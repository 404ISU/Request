const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Название организации
  address: { type: String, required: true }, // Адрес организации
  phone: { type: String, required: true }, // Телефон организации
  createdAt: { type: Date, default: Date.now }, // Дата создания
});

module.exports = mongoose.model('Organization', organizationSchema);
