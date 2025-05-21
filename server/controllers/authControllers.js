const User = require('../models/User');
const {hashPassword, comparePassword}=require('../helpers/auth');
const  bcrypt  =  require ( 'bcrypt' ) ; 
const jwt = require('jsonwebtoken');


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
        jwt.sign(
          {id: user._id, username: user.username, role: user.role}, 
          process.env.JWT_SECRET, 
          {}, 
          (err, token) => {
            if(err) throw err;
            // Отправляем только необходимые данные + роль
            const userData = {
              id: user._id,
              username: user.username,
              name: user.name,
              role: user.role,
            };
            res.cookie('token', token).json({ user: userData }); // Добавлена обёртка user
          }
        )
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
const getProfile= async (req,res)=>{
  const token=req.cookies.token;
  if(!token)return res.status(401).json({error: 'Необходима авторизация'});

  try {
    jwt.verify(token, process.env.JWT_SECRET, async(err,decoded)=>{
      const user = await User.findById(decoded.id).select('-password -__v');
      if(!user) return res.status(404).json({error: 'Пользователь не найден'});
      res.json(user);
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'ошибка сервера'})
  }
}


// обновление пользователя
const updateProfile = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'Необходима авторизация' });

  try {
    const { username, email, password, firstName, lastName, name, organizationName, organizationAddress, organizationPhone } = req.body;

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Неверный токен' });

      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

      // Проверка на уникальность email
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }
      }

      // Проверка на уникальность логина
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
        }
      }

     
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
      }

      // Обновляем данные пользователя
      user.username = username || user.username;
      user.email = email || user.email;
      user.name = name || user.name;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;

      if (user.role === 'organization') {
        user.organizationName = organizationName || user.organizationName;
        user.organizationAddress = organizationAddress || user.organizationAddress;
        user.organizationPhone = organizationPhone || user.organizationPhone;
      }

      await user.save();
      res.json({ message: 'Профиль успешно изменен', user });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
};

//выход
const logout = async (req,res)=>{
  res.clearCookie("token");
  res.json({message: "выход выполнен"})
}




module.exports = {

  registerUser,
  loginUser,
  getProfile,
  logout,
  updateProfile,
}