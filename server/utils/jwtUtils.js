const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config/configurate');

const generateToken = (userId, role)=>{
  return jwt.sign({id: userId, role}, JWT_SECRET, {
    expiresIn: '1h',
  });
};

module.exports={
  generateToken,
}