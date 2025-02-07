const express = require('express');
const dotenv = require('dotenv').config()
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const  bcrypt  =  require ( 'bcrypt' ) ; 
const requestRoutes = require('./routes/requests');

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173', // Заменить на ваш клиентский домен
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: 'Content-Type,Authorization'
};
app.use(cors(corsOptions));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Middleware

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));





// Маршруты
app.use('/api/requests', requestRoutes);
app.use('/', require('./routes/authRoutes'))

// подсоединени к mongodb
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Mongodb подключен'))
  .catch(err => console.log(err));



const PORT = process.env.PORT || 5001;
app.listen(PORT, ()=>console.log(`Сервер запущен на порту ${PORT}`))
