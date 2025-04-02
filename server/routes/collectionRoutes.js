const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Коллекции
router.post('/', collectionController.createCollection);
router.get('/', collectionController.getCollections);
router.delete('/:id', collectionController.deleteCollection);

// Папки и запросы
router.post('/:collectionId/folders', collectionController.createFolder);
router.post('/:collectionId/requests', collectionController.createRequest);

// Элементы коллекций
router.patch('/items/:itemId', collectionController.updateItem);
router.delete('/items/:itemId', collectionController.deleteItem);

// Запросы
router.get('/requests/:requestId', collectionController.getRequest);
router.put('/requests/:requestId', collectionController.updateRequest);

module.exports = router;