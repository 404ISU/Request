const express = require('express');
const router = express.Router();
const {createWorker, getWorker, deleteWorker, updateWorker}= require('../controllers/workerControllers');

router.post('/create-worker', createWorker) // создание работника
router.get('/get-workers', getWorker) // получение списка работников
router.delete('/delete-worker/:workerId', deleteWorker) // удаление работника
// обновление данных работникаъ
router.put('/update-worker/:workerId', updateWorker)

module.exports = router;