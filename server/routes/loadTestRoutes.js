// routes/loadTestRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/loadTestController');
const { verifyJwt } = require('../middleware/authMiddleware');

router.post('/', verifyJwt, ctrl.create);
router.post('/:id/run', verifyJwt, ctrl.run);
router.get('/:id/status', verifyJwt, ctrl.getStatus);
router.get('/', verifyJwt, ctrl.getAllLoadTests);
router.delete('/:id', verifyJwt, ctrl.delete); 

module.exports = router;
