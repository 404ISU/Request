const mongoose = require('mongoose');
const {MONGODB_URI}= require('./configurate');


const connectDB = async ()=>{
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected!');
  } catch (error) {
    console.error('MongoDB connection error', error);
    process.exit(1);
  }
};

module.exports = connectDB;