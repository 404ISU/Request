const Collection = require('../models/Collection');

module.exports = async (req) =>{
  const collectionId = req.query.collectionId;
  const userId = req.user.id;

  if(!collection) return true;


  const collection = await Collection.findById(collectionId);
  return collection.userId.equals(userId);
}