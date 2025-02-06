const User = require('../models/User');
const {hashPassword, comparePassword}=require('../helpers/auth');
const  bcrypt  =  require ( 'bcrypt' ) ; 
const jwt = require('jsonwebtoken');

// тест
const test = (req,res)=>{
  res.json('test is working');
}


// регистрация
const registerUser = async(req,res)=>{
  try {
    const {username, email, password, name, firstName, lastName, organizationName, organizationAddress, organizationPhone, confirmPassword}= req.body;
    // проверка если имя было введено
    if(!username || !email || !name || !firstName || !lastName || !organizationName || !organizationAddress || !organizationPhone){
      return res.json({error: "Все поля объязательны для заполнения"})
    }
    // проверка если пароль хорший
    if(!password || password.length < 6){
      return res.json({error: "пароль объязателен и должен быть больше 6 символов"})
    };
    if(confirmPassword !== password){
      return res.json({error: "пароли не совпадают"});
    }
    // проверка на существование
    const exist = await User.findOne({email, username});

    if(exist){
      return res.json({error: "Пользователь с таким email или логином уже существует"})
    }
    const hashedPassword = await hashPassword(password)
    const user = await User.create({
      username, email, password: hashedPassword, name, firstName, lastName,organizationName, organizationAddress, organizationPhone})

      return res.json(user)
  } catch (error) {
    console.error(error);
  }
}

// авторизация
const loginUser = async(req,res)=>{
    try {
      const {username, password}= req.body;


      // проверка если пользователь существует
      const user = await User.findOne({username});
      if(!user){
        return res.json({error: 'пользователь не найден'})
      }

      // проверка пароля
      const match=await comparePassword(password, user.password)
      if(match){
        jwt.sign({username: user.username, id:user._id, name: user.name}, process.env.JWT_SECRET, {}, (err, token)=>{
          if(err) throw err;
          res.cookie('token', token).json(user)
        })
      }
      if(!match){
        res.json({
          error: 'не правильный пароль'
        })
      }
    } catch (error) {
      console.log(error);
    }
}


// профиль полЬователя
const getProfile=(req,res)=>{
  const {token}=req.cookies
  if(token){
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user)=>{
      if(err) throw err;
      res.json(user)
    })
  }else{
    res.json(null)
  }
}

module.exports = {
  test,
  registerUser,
  loginUser,
  getProfile
}