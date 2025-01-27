import express from 'express'
import {getEmployees} from '../controllers/organizationController.js';
import {createEmployee} from '../controllers/organizationController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/employees', authenticate, authorize(['organization']), getEmployees); // получить всех работников
router.post('/employees', authenticate, authorize(['organization']), createEmployee);

export default router;