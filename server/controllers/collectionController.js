const Collection = require('../models/Collection');
const CollectionItem = require('../models/CollectionItem');

 exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find()
      .populate({
        path: 'items',
        select: 'name type parentId order request isExpanded',
        options: { sort: { order: 1 } }
      })
      .lean();

    // убираем дубликаты и строим дерево
    const uniqueCollections = collections.filter(
      (v, i, a) => a.findIndex(t => t._id.toString() === v._id.toString()) === i
    );

    const buildTree = (items, parentId = null) =>
      items
        .filter(item => String(item.parentId) === String(parentId))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(item => ({
          ...item,
          children: buildTree(items, item._id)
        }));

    const transformed = uniqueCollections.map(c => ({
      ...c,
      // здесь items уже древовидно вложены
      items: buildTree(c.items || [])
    }));

    return res.status(200).json(transformed);
  } catch (err) {
    return res.status(500).json({ message: 'Ошибка сервера' });
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