const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const Organization = require('../models/Organization.js');
const {
  registerOrganizationSchema,
  registerEmployeeSchema,
  loginSchema,
} = require('../utils/validationSchema.js');

// регистрация организации
const registerOrganization = async (req, res) => {
  const { error } = registerOrganizationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const {
    name,
    address,
    phone,
    username,
    email,
    password,
    firstName,
    lastName,
    middleName,
    personalPhone,
  } = req.body;

  try {
    const organization = new Organization({ name, address, phone });
    await organization.save();

    const user = new User({
      username,
      email,
      password,
      role: 'organization',
      organization: organization._id,
      firstName,
      lastName,
      middleName,
      phone: personalPhone,
    });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// регистрация сотрудника
const registerEmployee = async (req, res) => {
  const { error } = registerEmployeeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, email, password, organizationId, firstName, lastName, middleName, phone } = req.body;

  try {
    const user = new User({
      username,
      email,
      password,
      role: 'employee',
      organization: organizationId,
      firstName,
      lastName,
      middleName,
      phone,
    });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
    res.status(201).json({ message: 'Employee registered successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// авторизация пользователя
const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { emailOrUsername, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// выход из системы
const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
};

// получение данных пользователя
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// обновление данных пользователя
const updateMe = async (req, res) => {
  const { middleName, firstName, lastName, phone } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { personalData: { middleName, firstName, lastName, phone } },
      { new: true }
    ).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  registerOrganization,
  registerEmployee,
  login,
  logout,
  getMe,
  updateMe,
};
