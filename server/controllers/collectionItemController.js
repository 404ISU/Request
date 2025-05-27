const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const CollectionItem = require('../models/CollectionItem');

exports.getCollectionItems = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.collectionId);
    if(!collection) return res.status(404).json({message: 'Коллекция не найдена'});

    const items = await CollectionItem.find({ collectionId: req.params.collectionId })
      .sort({ order: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const itemData = req.body;
    const {name, type, parentId}=req.body;

    if(!name || !type){
      return res.status(400).json({message: 'Не заполнены объязательные поля'});
    }

    // Валидация
    if (!itemData.name || !itemData.type) {
      return res.status(400).json({ message: 'Не указаны обязательные поля' });
    }

    const newItem = new CollectionItem({
      name,
      type,
      collectionId,
      parentId: parentId || null,
      order: await CollectionItem.countDocuments({ collectionId, parentId: parentId || null }),
      ...(type === 'request' && { /* параметры запроса */ })
    });

    await newItem.save();

    // Обновляем коллекцию
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      {$push: {items: newItem._id}},
      {new: true}
    ).populate('items')
res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ 
      message: err.message,
      details: err.errors 
    });
  }
};

exports.reorderItems = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { items } = req.body;

    // Валидация входных данных
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }

    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(400).json({ message: 'Invalid collection ID' });
    }

    // Проверка существования коллекции
    const collectionExists = await Collection.exists({ _id: collectionId });
    if (!collectionExists) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Подготовка операций для bulkWrite
    const bulkOps = await Promise.all(items.map(async ({ id, parentId, order }) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid item ID: ${id}`);
      }

      // Проверка существования элемента
      const itemExists = await CollectionItem.exists({ _id: id });
      if (!itemExists) {
        throw new Error(`Item ${id} not found`);
      }

      // Валидация parentId
      let validParentId = null;
      if (parentId) {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
          throw new Error(`Invalid parent ID: ${parentId}`);
        }
        validParentId = new mongoose.Types.ObjectId(parentId);
        
        // Проверка существования родительского элемента
        const parentExists = await CollectionItem.exists({ _id: validParentId });
        if (!parentExists) {
          throw new Error(`Parent item ${parentId} not found`);
        }
      }

      return {
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(id) },
          update: {
            $set: {
              order: parseInt(order),
              parentId: validParentId,
              collectionId: new mongoose.Types.ObjectId(collectionId)
            }
          }
        }
      };
    }));

    // Выполнение операций
    const result = await CollectionItem.bulkWrite(bulkOps);
    
    // Получение обновленных данных
    const updatedItems = await CollectionItem.find({ collectionId })
      .sort({ order: 1 })
      .lean();

    res.json({
      message: 'Order updated successfully',
      updatedCount: result.modifiedCount,
      items: updatedItems
    });

  } catch (err) {
    console.error('Reorder error:', err);
    res.status(500).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.toggleFolder = async (req, res) => {
  try {
    const item = await CollectionItem.findById(req.params.itemId);
    item.isExpanded = !item.isExpanded;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.renameItem = async (req, res) => {
  try {
    const { name } = req.body;
    const item = await CollectionItem.findByIdAndUpdate(
      req.params.itemId,
      { $set: { name } },
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    // Удаляем все дочерние элементы
    const deleteChildren = async (parentId) => {
      const children = await CollectionItem.find({ parentId });
      for (const child of children) {
        await deleteChildren(child._id);
        await CollectionItem.findByIdAndDelete(child._id);
      }
    };
    
    await deleteChildren(req.params.itemId);
    await CollectionItem.findByIdAndDelete(req.params.itemId);
    
    res.json({ message: 'Элемент удален' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};