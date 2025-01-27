const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Импорт маршрутов авторизации

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Подключение маршрутов
app.use('/api/auth', authRoutes); // Убедитесь, что этот путь совпадает с фронтендом

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/Requester', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => console.log('Connected to MongoDB'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));

// Запуск сервера
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
