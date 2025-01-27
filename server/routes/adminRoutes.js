import express from 'express'
import {getUsers, deleteUser} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/users', authenticate, authorize(['admin']), getUsers); // получить всех пользваотелей
router.delete('/users/:id', authenticate, authorize(['admin']), deleteUser); // Удалить полдьзователя 

export default router;