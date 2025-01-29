require('dotenv').config();
module.exports={
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
}