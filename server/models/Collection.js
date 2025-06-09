// models/Collection.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
  // Поле "id" описано вручную, чтобы не путаться с _id коллекции
  id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  name: { type: String, required: true },
  type: { type: String, enum: ['folder', 'request'], required: true },
  parentId: { type: Schema.Types.ObjectId, default: null },
  order: { type: Number, default: 0 },
  request: {
    method: { type: String, enum: ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'], default: 'GET' },
    url: { type: String, default: '' },
    headers: { type: Schema.Types.Mixed, default: {} },
    queryParams: { type: Schema.Types.Mixed, default: {} },
    body: { type: Schema.Types.Mixed, default: {} }
  }
}, { _id: false });

const collectionSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [itemSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Collection', collectionSchema);
