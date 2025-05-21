// models/Request.js

const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  url: String, 
  method: String, 
  headers: Object, 
  body: Object, 
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  response: { type: mongoose.Schema.Types.ObjectId, ref: 'Response' },
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }
});

module.exports = mongoose.model('Request', requestSchema);