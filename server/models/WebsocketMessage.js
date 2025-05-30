const mongoose = require('mongoose');
const { Schema } = mongoose;

const WebsocketMessageSchema = new Schema({
  session:   { type: Schema.Types.ObjectId, ref: 'WebsocketSession', required: true },
  direction: { type: String, enum: ['INCOMING','OUTGOING','SYSTEM','ERROR'], required: true },
  content:   { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WebsocketMessage', WebsocketMessageSchema);
