const CollectionItem = require('../models/CollectionItem');

exports.getCollectionItems = async (req, res) => {
  try {
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

    // Валидация
    if (!itemData.name || !itemData.type) {
      return res.status(400).json({ message: 'Не указаны обязательные поля' });
    }

    const newItem = new CollectionItem({
      ...itemData,
      collectionId
    });

    await newItem.save();

    // Обновляем коллекцию
    await CollectionItem.findByIdAndUpdate(
      collectionId,
      { $push: { items: newItem._id } },
      { new: true }
    );

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
    const { items } = req.body;
    
    const bulkOps = items.map((item, index) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: index, parentId: item.parentId } }
      }
    }));
    
    await CollectionItem.bulkWrite(bulkOps);
    res.json({ message: 'Items reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

exports.deleteItem = async (req, res) => {
  try {
    await CollectionItem.findByIdAndDelete(req.params.itemId);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};