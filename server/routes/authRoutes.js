const express = require('express');
const { registerOrganization, login, logout, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

router.post('/register',
    [
        body('email').isEmail().withMessage('Must be a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('organizationName').notEmpty().withMessage('Organization name is required'),
        body('organizationAddress').notEmpty().withMessage('Organization address is required'),
        body('organizationPhone').notEmpty().withMessage('Organization phone is required'),
        body('firstName').notEmpty().withMessage('First name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
        body('middleName').notEmpty().withMessage('Middle name is required'),
    ],
    registerOrganization);
router.post('/login',
    [
        body('email').isEmail().withMessage('Must be a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    login);
router.get('/logout', logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;