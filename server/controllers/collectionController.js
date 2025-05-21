const Collection = require('../models/Collection');
const CollectionItem = require('../models/CollectionItem');

exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find()
      .populate({
        path: 'items',
        select: 'name type request', 
        options: { sort: { createdAt: 1 } }
      })
      .lean();
      
    res.status(200).json(collections);
  } catch (err) {
    console.error('Ошибка обработки коллекции:', err);
    res.status(500).json({ 
      message: 'Ошибка сервера',
      error: err.message
    });
  }
};

exports.createCollection = async (req, res) => {
  try {
    const { name } = req.body;
    const newCollection = new Collection({ name });
    await newCollection.save();
    res.status(201).json(newCollection);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    await CollectionItem.deleteMany({ collectionId: req.params.id });
    res.json({ message: 'Коллекция удалена' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.collectionId)
      .populate('items');
    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};