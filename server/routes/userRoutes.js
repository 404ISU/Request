const express = require('express');
const {createUser, getAllUsers, updateUser, deleteUser} = require('../controllers/userController');
const {authMiddleware, organizationMiddleware} = require('../middleware/authMiddleware');
const {body} = require('express-validator');

const router = express.Router();


router.post('/', authMiddleware, organizationMiddleware,[
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
],
createUser);


router.get('/', authMiddleware, organizationMiddleware, getAllUsers);
router.put('/:id', authMiddleware, organizationMiddleware, updateUser);
router.delete('/:id', authMiddleware, organizationMiddleware, deleteUser);


module.exports = router;