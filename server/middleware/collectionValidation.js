const { Collection, CollectionItem } = require('../models/Collections');
const router = express.Router();
const express = require('express');
// Валидация прав владения коллекцией
exports.validateCollectionOwnership = async (req, res, next) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.collectionId,
      userId: req.user._id
    });
    
    if (!collection) {
      return res.status(404).json({ 
        error: 'Collection Not Found',
        message: 'Коллекция не существует или у вас нет прав доступа'
      });
    }
    
    req.collection = collection;
    next();
  } catch (error) {
    res.status(500).json({ 
      error: 'Validation Error',
      details: error.message
    });
  }
};

// Валидация элементов коллекции
exports.validateItemStructure = (req, res, next) => {
  const validTypes = ['folder', 'request', 'example'];
  const item = req.body;

  if (!validTypes.includes(item.type)) {
    return res.status(400).json({
      error: 'Invalid Item Type',
      validTypes
    });
  }

  if (item.type === 'folder' && !item.name) {
    return res.status(400).json({
      error: 'Folder Name Required'
    });
  }

  if (item.type === 'request' && !item.requestId) {
    return res.status(400).json({
      error: 'Request Reference Required'
    });
  }

  next();
};

