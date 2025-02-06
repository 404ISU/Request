const express = require('express');
const dotenv = require('dotenv').config()
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const  bcrypt  =  require ( 'bcrypt' ) ; 


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));



// Маршруты
app.use('/api/requests', require('./routes/requests'));
app.use('/', require('./routes/authRoutes'))

// подсоединени к mongodb
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Mongodb подключен'))
  .catch(err => console.log(err));



const PORT = process.env.PORT || 5001;
app.listen(PORT, ()=>console.log(`Сервер запущен на порту ${PORT}`))
