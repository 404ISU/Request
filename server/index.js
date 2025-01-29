const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes =require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requests');
const {PORT} = require('./config/configurate');


const app = express();

// Middleware
const corsOptions = {
  origin: 'http://localhost:3000', // Заменить на ваш клиентский домен
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: 'Content-Type,Authorization'
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


// Routes
app.use('/api/requests', requestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);



// Connect to MongoDB
connectDB()

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));