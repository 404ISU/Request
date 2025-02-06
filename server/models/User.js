const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'organization', 'worker'], required: true, default: 'organization' },
  name: String,
  firstName: String,
  lastName: String,
  organizationName: { type: String, required: true },
  organizationAddress: { type: String, required: true },
  organizationPhone: { type: String, required: true },
  // organization Organization @relative(fields: [organization_id] /refarence: [id])
  // organization_id String
});


module.exports = mongoose.model('User', userSchema);