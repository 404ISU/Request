const express = require('express');
const router = express.Router();
const cors = require('cors');
const  bcrypt  =  require ( 'bcrypt' ) ; 

const { registerUser, loginUser, getProfile, logout} =require('../controllers/authControllers')

// middlleware
router.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173'
  })
)


router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)
router.post('/logout', logout)

module.exports = router