const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createWorker = async (req,res)=>{
  const token=req.cookies.token;
  if(!token) return res.status(401).json({error: 'Необходима авторизация'});

  try {
    const {username, email, password, name, firstName, lastName}=req.body;

    // проверка токен
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
      if(err) return res.status(401).json({error: "неверный токен"});

      const user = await User.findById(decoded.id);

      // проверяем роль пользователя
      if(user.role !== 'organization'){
        return res.status(403).json({error: " у вас нет прав для сощдания сотудника"});
      }

      // проверка на уникальность email и логина
      const existingUser =await User.findOne({ $or: [{email}, {username}]});
      if(existingUser) {return res.status(400).json({error: 'Пользователь с таким email или логином уже существует'})}


      // создаем нового работника
      const hashedPassword = await bcrypt.hash(password, 12);
      const worker = await User.create({
        username, email, password: hashedPassword, name, firstName, lastName, role: 'worker',
        organizationId: user._id // привязываеи организации
      });

      res.json(worker);

    })
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Ошибка сервера"})
  }
};


// получение cписка работников
const getWorker = async(req,res)=>{
  const token = req.cookies.token;
  if(!token) return res.status(401).json({error: "Необходима авторизация"});

  try {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded)=>{
      if(err) return res.json({error: 'неверный токен'});

      const user = await User.findById(decoded.id);


      // проверяем роль ползователя
      if(user.role !== 'organization'){
        return res.status(403).json({error: 'У вас нет првав для просмотра работников'});
      }

      // получаем список работников 
      const workers = await User.find({organizationId: user._id, role: 'worker'});
      console.log('спсисок работников', workers); // логирование работников
      res.json(workers);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Ошибка сервера'});
  }
};





// удаление работника
// controllers/workerControllers.js

const deleteWorker = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'Необходима авторизация' });

  try {
    const { workerId } = req.params;

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Неверный токен' });

      const user = await User.findById(decoded.id);

      // Логируем данные для отладки
      console.log('Текущий пользователь:', user);

      // Проверяем роль пользователя
      if (user.role !== 'organization') {
        return res.status(403).json({ error: 'У вас нет прав для удаления работников' });
      }

      // Находим работника по ID
      const worker = await User.findById(workerId);
      if (!worker) {
        console.error('Работник не найден');
        return res.status(404).json({ error: 'Работник не найден' });
      }

      // Проверяем принадлежность работника к организации
      if (worker.organizationId.toString() !== user._id.toString()) {
        console.error('Работник не принадлежит вашей организации');
        return res.status(403).json({ error: 'Работник не принадлежит вашей организации' });
      }

      // Удаляем работника
      await worker.deleteOne();
      res.json({ message: 'Работник успешно удален' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// редактирование работника
const updateWorker = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'Необходима авторизация' });

  try {
    const { workerId } = req.params;
    const { username, email, password, firstName, lastName, name } = req.body;

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Неверный токен' });

      const user = await User.findById(decoded.id);

      // Логируем данные для отладки
      console.log('Текущий пользователь:', user);

      // Проверяем роль пользователя
      if (user.role !== 'organization') {
        return res.status(403).json({ error: 'У вас нет прав для редактирования работников' });
      }

      // Находим работника по ID
      const worker = await User.findById(workerId);
      if (!worker) {
        console.error('Работник не найден');
        return res.status(404).json({ error: 'Работник не найден' });
      }

      // Проверяем принадлежность работника к организации
      if (worker.organizationId.toString() !== user._id.toString()) {
        console.error('Работник не принадлежит вашей организации');
        return res.status(403).json({ error: 'Работник не принадлежит вашей организации' });
      }

      // Обновляем данные работника
      worker.username = username || worker.username;
      worker.email = email || worker.email;

      // Если новый пароль передан, хешируем его
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        worker.password = hashedPassword;
      }

      // Обновляем имя, фамилию и отчество
      worker.firstName = firstName || worker.firstName;
      worker.lastName = lastName || worker.lastName;
      worker.name = name || worker.name;

      await worker.save();
      res.json({ message: 'Данные работника успешно обновлены', worker });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {createWorker, getWorker, deleteWorker, updateWorker}