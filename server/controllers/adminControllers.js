const User = require('../models/User');
const Request = require('../models/Request')
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// просмотр всех пользователей
const getUsers = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Необходима авторизация' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Проверяем роль пользователя
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'У вас нет прав администратора' });
    }

    // Получаем список всех пользователей
    const users = await User.find().select('-password');

    // Группируем пользователей по ролям
    const organizations = users.filter((user) => user.role === 'organization');
    const workers = users.filter((user) => user.role === 'worker');

    // Возвращаем данные в виде одного объекта
    res.json({ organizations, workers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// редактирование пользователей
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { username, email, firstName, lastName, name,organizationName, organizationAddress, organizationPhone, newPassword } = req.body;

  try {
    // Находим пользователя по ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Обновляем данные пользователя
    user.username = username || user.username;
    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.name = name || user.name;
    user.organizationName = organizationName || user.organizationName;
    user.organizationAddress = organizationAddress || user.organizationAddress;
    user.organizationPhone = organizationPhone || user.organizationPhone;

    // Если указан новый пароль, хешируем его
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
    }

    await user.save();
    res.json({ message: 'Данные пользователя успешно обновлены', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};


// удаляем пользователя
const deleteUser = async (req,res)=>{
  const token = req.cookies.token;

  if(!token) return res.status(401).json({error: 'Необходима авторизация'});

  try {
    const {userId}=req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // проверяем роль
    if(decoded.role !== 'admin'){
      return res.status(403).json({error: 'у вас нет прав'})
    }

    // находим и удаляем пользователя
    const user = await User.findByIdAndDelete(userId);
    if(!user) return res.status(404).json({error: 'Пользователь не найден'});

    res.json({message: 'Пользователь успешно удален'})
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Ошибка сервера'});
  }
}


// получение статистики сайта
const getStats = async (req,res)=>{
  const token = req.cookies.token;

  if(!token) return res.status(401).json({error: 'Необходима авторизация'});

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // проверка роли
    if(decoded.role !== 'admin'){
      return res.status(403).json({error: 'у вас недостаточно прав'})
    }

    const totalUsers = await User.countDocuments();
    const totalOrganizations = await User.countDocuments({role: 'organization'})
    const totalWorkers = await User.countDocuments({role: 'worker'});
    const totalRequests = await Request.countDocuments();

    res.json({
      totalUsers,
      totalOrganizations,
      totalWorkers,
      totalRequests,
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Ошибка сервера'});
  }
}


module.exports={getUsers, updateUser, deleteUser, getStats};