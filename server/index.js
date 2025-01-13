const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const requestRoutes = require('./routes/requests');

const app = express();
const PORT = process.env.PORT || 5001;

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

// Routes
app.use('/api/requests', requestRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Requester', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => console.log('Connected to MongoDB'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));