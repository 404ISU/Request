// routes/collectionRoutes.js
const express = require('express');
const router = express.Router();
const collCtrl = require('../controllers/collectionController');
const {authMiddleware} = require('../middleware/authMiddleware');

// Все маршруты «Коллекций» теперь защищены через authMiddleware (куки → JWT)
router.get('/',            authMiddleware, collCtrl.list);           // получить все коллекции
router.post('/',           authMiddleware, collCtrl.create);         // создать коллекцию
router.patch('/:id/rename',authMiddleware, collCtrl.rename);        // переименовать коллекцию
router.delete('/:id',      authMiddleware, collCtrl.remove);        // удалить коллекцию

// Работа с элементами:
router.post('/:collectionId/items',         authMiddleware, collCtrl.addItem);     // добавить элемент
router.patch('/items/:itemId/rename',       authMiddleware, collCtrl.renameItem);  // переименовать элемент
router.delete('/items/:itemId',             authMiddleware, collCtrl.deleteItem);  // удалить элемент

// Drag & Drop (переупорядочивание):
router.patch('/:collectionId/reorder',      authMiddleware, collCtrl.reorderItems);

module.exports = router;
