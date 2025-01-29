const User = require('../models/User');
const {validationResult}=require('express-validator');

const createUser=async(req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
  }


  const {email, password}=req.body;
  const organizationId =req.user._id;

  try {
    const userExists= await User.findOne({email});
    if(userExists){
      return res.status(400).json({message: 'User already exists'});
    }

    const user = new User({
      email,
      password,
      role: 'employee',
      organizationId,
    });

    await user.save();
    res.status(201).json({message: 'User created', user});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Server error'});
  }
};


const getAllUsers = async (req, res)=>{
  const organizationId = req.user._id;
  try {
    const users = await User.find({organizationId}).select('-password')
    res.json(users);
  } catch (error) {
    res.status(500).json({message: 'Server error'});
  }
};

const updateUser = async(req,res)=>{
  const {id} = req.params;
  const {email, password}= req.body;
  try {
    const user = await User.findById(id);

    if(!user){
      return res.status(404).json({message: 'User not found'});
    }
    if(email) user.email=email;
    if(password) user.password = password;

    await user.save();
    res.json({message: 'User updated', user});
  } catch (error) {
    res.status(500).json({message: 'Server error'});
  }
}


const deleteUser = async (req, res)=>{
  const {id}= req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if(!user){
      return res.status(404).json({message: 'User not found'});
    }
    res.json({message: 'User deleted'});
  } catch (error) {
    res.status(500).json({message: 'Server error'});
  }
}

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
};