// routes/loadTestRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/loadTestController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, ctrl.create);
router.post('/:id/run', authMiddleware, ctrl.run);
router.get('/:id/status', authMiddleware, ctrl.getStatus);
router.get('/', authMiddleware, ctrl.getAllLoadTests);
router.delete('/:id', authMiddleware, ctrl.delete); 

module.exports = router;
