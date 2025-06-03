const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const http = require('http');
const WebSocketServer = require('./websocket-server');
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/adminRoutes');
const websocketHistory = require('./routes/websocketHistory');


const app = express();
const server = http.createServer(app);


// Подключение к WebSocket
new WebSocketServer(server);

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));


// маршруты
app.use('/api/requests', requestRoutes);
app.use('/', require('./routes/authRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'))
app.use('/api/admin', adminRoutes);
app.use('/api/collections', require('./routes/collectionRoutes'));
app.use('/api/websocket/history', websocketHistory);
app.use('/api/tests/load', require('./routes/loadTestRoutes'));



mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log('Mongodb Запущен')
      console.log(`Сервер работает на порту ${process.env.PORT}`);
      console.log(`WebSocket сервер доступен по адресу ws://localhost:${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('Ошибка базы данных:', err);
    process.exit(1);
  });