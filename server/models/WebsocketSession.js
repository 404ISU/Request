const mongoose = require('mongoose');
const { Schema } = mongoose;

const WebsocketSessionSchema = new Schema({
  userId:{ type: Schema.Types.ObjectId, ref: 'User', required: true },
  connectionId:{ type: String, required: true, unique: true },
  name:{ type: String },
  url:           { type: String, required: true },
  protocols:     [String],
  headers:       { type: Map, of: String },
  autoConnect:   { type: Boolean, default: false },
  saveMessages:  { type: Boolean, default: true },
  createdAt:     { type: Date, default: Date.now },
  closedAt:      { type: Date }
});

module.exports = mongoose.model('WebsocketSession', WebsocketSessionSchema);
