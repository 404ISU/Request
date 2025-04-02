const mongoose = require('mongoose');

const collectionItemSchema = new mongoose.Schema({
  name: String,
  type: { 
    type: String, 
    enum: ['folder', 'request'], 
    required: true 
  },
  children: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CollectionItem' 
  }],
  request: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Request' 
  },
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CollectionItem' 
  },
  collection: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Collection' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true 
});

const collectionSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  rootItems: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CollectionItem' 
  }],
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { 
  timestamps: true 
});

const CollectionItem = mongoose.model('CollectionItem', collectionItemSchema);
const Collection = mongoose.model('Collection', collectionSchema);

module.exports = { Collection, CollectionItem };