const express = require('express');
const router = express.Router();
const collectionsCtrl = require('../controllers/collectionController');
const itemsCtrl = require('../controllers/collectionItemController');

// Collections
router.get('/', collectionsCtrl.getCollections);
router.post('/', collectionsCtrl.createCollection);
router.delete('/:id', collectionsCtrl.deleteCollection);
router.get('/:collectionId', collectionsCtrl.getCollectionById); 

// Collection Items
router.get('/:collectionId/items', itemsCtrl.getCollectionItems);
router.post('/:collectionId/items', itemsCtrl.createItem);
router.patch('/:collectionId/reorder', itemsCtrl.reorderItems);
router.patch('/items/:itemId/toggle', itemsCtrl.toggleFolder);
router.delete('/items/:itemId', itemsCtrl.deleteItem);
router.patch('/items/:itemId/rename', itemsCtrl.renameItem);

module.exports = router;