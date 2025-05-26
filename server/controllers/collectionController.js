const Collection = require('../models/Collection');
const CollectionItem = require('../models/CollectionItem');

      // преобразование для древовоидной структуры
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find()
      .populate({
        path: 'items',
        select: 'name type parentId order request',
        options: { sort: { order: 1 } }
      })
      .lean();

    // Убираем дубликаты коллекций
    const uniqueCollections = collections.filter(
      (v, i, a) => a.findIndex(t => t._id.toString() === v._id.toString()) === i
    );

    // Строим древовидную структуру
    const buildTree = (items, parentId = null) => 
      items
        .filter(item => String(item.parentId) === String(parentId))
        .map(item => ({
          ...item,
          children: buildTree(items, item._id)
        }));

    const transformed = uniqueCollections.map(c => ({
      ...c,
      items: buildTree(c.items || [])
    }));

    res.status(200).json(transformed);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.getCollectionById = async (req,res)=>{
  try {
    const collection = await Collection.findById(req.params.collectionId).populate('items').lean();

    if(!collection){
      return res.status(404).json({message: 'Коллекций не найдено'});
    }

    // Нормализация данных
    collection.items = collection.items || [];
    res.json(collection)
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}

exports.createCollection = async (req, res) => {
  try {
    const { name } = req.body;
    const exist = await Collection.findOne({name});
    if(exist){
      return res.status(400).json({message: 'Коллекция с таким именнем уже существ'})
    }
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