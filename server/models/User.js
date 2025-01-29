const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {Schema}=mongoose;


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin','organization','employee'], 
    required: true,
  },
  organizationName: {type: String, required: function() {return this.role === 'organization'}},
  organizationAddress: {type: String, required: function() {return this.role === 'organization'}},
  organizationPhone: {type: String, required: function(){return this.role === 'organization'}},
  firstName: {type: String, required: function(){return this.role === 'organization'}},
  lastName: {type: String, required: function(){return this.role === 'organization'}},
  middleName: {type: String, required: function(){return this.role === 'organization'}},
  organizationId: {type: Schema.Types.ObjectId, ref: 'User', required: function(){return this.role === 'employee'}},
  createdAt: {type: Date, default: Date.now}
});

userSchema.pre('save', async function(next){
  if(!this.isModified('password')){
    return next();
  }

  try{
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  }catch(error){
    return next(error)
  }
});

userSchema.methods.comparePassword = async function(candidatePassword){
  return bcrypt.compare(candidatePassword, this.password);
}

const User = mongoose.model('User', userSchema);
module.exports= User;