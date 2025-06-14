// const mongoose = require('mongoose');

// const CollectionItemSchema = new mongoose.Schema({
//   collectionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Collection',
//     required: true
//   },
//   name: {
//     type: String,
//     required: [true, 'Название элемента обязательно'],
//     trim: true
//   },
//   type: {
//     type: String,
//     enum: ['folder', 'request'],
//     required: true
//   },
//   parentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'CollectionItem',
//     default: null
//   },
//   order: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   isExpanded: {
//     type: Boolean,
//     default: true
//   },
//   // Для запросов
//   method: {type: String, required: function () {
//       return this.type === 'request';
//     }},
//   url: {type: String, required: function () {
//       return this.type === 'request';
//     }},
//   headers: mongoose.Schema.Types.Mixed,
//   body: mongoose.Schema.Types.Mixed,
//   queryParams: mongoose.Schema.Types.Mixed,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('CollectionItem', CollectionItemSchema);