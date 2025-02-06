const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  organizationName: { type: String, required: true },
  organizationAddress: { type: String, required: true },
  organizationPhone: { type: String, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  // users Users[]
});

module.exports = mongoose.model('Organization', organizationSchema);