const { Collection, CollectionItem } = require('../models/Collections');
const Request = require('../models/Request');

// создание коллекции
exports.createCollection = async (req, res) => {
  try {
    const collection = await Collection.create({
      name: req.body.name,
      userId: req.user._id
    });
    res.status(201).json(collection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// вывод всех коллекций
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ userId: req.user._id })
      .populate({
        path: 'rootItems',
        model: 'CollectionItem',
        populate: [{
          path: 'children',
          model: 'CollectionItem',
          populate: {
            path: 'request',
            model: 'Request'
          }
        }, {
          path: 'request',
          model: 'Request'
        }]
      });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFolder = async (req, res) => {
  try {
    const folder = await CollectionItem.create({
      type: 'folder',
      name: req.body.name,
      parent: req.body.parentId,
      collection: req.params.collectionId,
      userId: req.user._id
    });

    if (req.body.parentId) {
      await CollectionItem.findByIdAndUpdate(
        req.body.parentId,
        { $push: { children: folder._id } }
      );
    } else {
      await Collection.findByIdAndUpdate(
        req.params.collectionId,
        { $push: { rootItems: folder._id } }
      );
    }

    res.status(201).json(folder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const request = await Request.create({
      ...req.body,
      collection: req.params.collectionId,
      userId: req.user._id
    });

    const item = await CollectionItem.create({
      type: 'request',
      name: req.body.name,
      request: request._id,
      parent: req.body.parentId,
      collection: req.params.collectionId,
      userId: req.user._id
    });

    if (req.body.parentId) {
      await CollectionItem.findByIdAndUpdate(
        req.body.parentId,
        { $push: { children: item._id } }
      );
    } else {
      await Collection.findByIdAndUpdate(
        req.params.collectionId,
        { $push: { rootItems: item._id } }
      );
    }

    const populatedItem = await CollectionItem.findById(item._id)
      .populate('request');

    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.updateItem = async (req, res) => {
  try {
    const item = await CollectionItem.findByIdAndUpdate(
      req.params.itemId,
      { name: req.body.name },
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await CollectionItem.findByIdAndDelete(req.params.itemId);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId)
      .populate('collection');
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.requestId,
      req.body,
      { new: true }
    );
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    await Request.deleteMany({ collection: req.params.id });
    res.json({ message: 'Collection deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};