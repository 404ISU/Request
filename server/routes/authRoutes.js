const express = require('express');
const router = express.Router();
const cors = require('cors');
const  bcrypt  =  require ( 'bcrypt' ) ; 

const {test, registerUser, loginUser, getProfile} =require('../controllers/authControllers')

// middlleware
router.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173'
  })
)

router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)

module.exports = router