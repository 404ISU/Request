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
  },
type: {
    type: String,
    enum: ['HTTP', 'WEBSOCKET'],
    default: 'HTTP'
  },
  wsSession: {
    sessionId: String,
    connections: [{
      connectionId: String,
      url: String,
      protocols: [String],
      headers: mongoose.Schema.Types.Mixed
    }],
    messages: [{
      content: String,
      direction: {
        type: String,
        enum: ['INCOMING', 'OUTGOING', 'SYSTEM', 'ERROR']
      },
      timestamp: Date
    }]
  }
}, {timestamps: true});

module.exports = mongoose.model('Request', requestSchema);