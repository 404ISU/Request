const Joi = require('joi');

// Схема для регистрации организации
const registerOrganizationSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  phone: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  middleName: Joi.string().required(),
  personalPhone: Joi.string().required(),
});

// Схема для регистрации сотрудника
const registerEmployeeSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  organizationId: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  middleName: Joi.string().required(),
  phone: Joi.string().required(),
});

// Схема для авторизации
const loginSchema = Joi.object({
  emailOrUsername: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerOrganizationSchema,
  registerEmployeeSchema,
  loginSchema,
};
