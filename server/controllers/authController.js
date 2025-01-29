const User = require('../models/User');
const {generateToken}=require('../utils/jwtUtils');
const {validationResult} = require('express-validator');

const registerOrganization = async (req,res)=>{
  const errors =validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
  }

  const {email, password, organizationName, organizationAddress, organizationPhone, firstName, lastName, middleName }=req.body;

  try{
    const userExist = await User.findOne({email});
    if(userExist){
      return res.status(400).json({message: 'User already exist'})
    
      const user = new User({
        email,
        password,
        role: 'organization',
        organizationName,
        organizationAddress,
        organizationPhone,
        firstName,
        lastName,
        middleName,
      });

      await user.save();


      const token = generateToken(user._id, user.role);


      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: 3600000, // 1 hour

      })
    res.status(201).json({message: 'Organization registered', token, user: {_id: user._id, email: user.email, role: user.role}});
    }
  }catch(error){
      res.status(500).json({message: 'Server error'});
    }
};

const login = async (req, res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }

  const {email, password} = req.body;

  try {
    const user = await User.findOne({email});

    if(!user || !(await user.comparePassword(password))){
      return res.status(401).json({message: 'Invalid credentials'});
    }

    const token = generateToken(user._id, user.role);
    res.cookie('token', token, {
      httpOmly: true,
      sameSite: 'Strict',
      maxAge: 3600000,
    });

    res.status(200).json({message: 'Logged in', token, user: {_id: user._id, email: user.email, role: user.role}});
  } catch (error) {
    res.status(500).json({message: 'Server error'});
  }
};

const logout = (req, res)=>{
  res.clearCookie('token');
  res.json({message: 'Logged out'});
}

const getMe = async (req,res)=>{
  try {
    const user = await User.findById(req.user._id).select('-password');
    if(!user){
      return res.status(404).json({message: 'User not found'});
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({message: 'Server error'})
  }
};

module.exports = {
  registerOrganization,
  login,
  logout,
  getMe,
};