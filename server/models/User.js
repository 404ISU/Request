const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'organization', 'worker'], required: true, default: 'organization' },
  name: String,
  firstName: String,
  lastName: String,
  organizationName: {
    type: String,
    required: function () {
      return this.role === 'organization';
    },
  },
  organizationAddress: {
    type: String,
    required: function () {
      return this.role === 'organization';
    },
  },
  organizationPhone: {
    type: String,
    required: function () {
      return this.role === 'organization';
    },
  },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Связь с организацией
});


module.exports = mongoose.model('User', userSchema);