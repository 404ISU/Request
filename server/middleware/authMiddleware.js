const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Получаем токен из куки
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Доступ запрещен. Требуется авторизация' 
      });
    }

    // 2. Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Находим пользователя в БД
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Пользователь не найден' 
      });
    }

    // 4. Добавляем пользователя в объект запроса
    req.user = user;
    next();

  } catch (err) {
    console.error('Ошибка аутентификации:', err);
    res.status(401).json({ 
      error: 'Недействительный токен' 
    });
  }
};

module.exports = authMiddleware;