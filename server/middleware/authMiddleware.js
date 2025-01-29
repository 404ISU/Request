const jwt = require ('jsonwebtoken');
const {JWT_SECRET}=require('../config/configurate');
const User = require('../models/User');


const authMiddleware = async(req,res, next)=>{
  let token;

  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password')

      if(!req.user){
        return res.status(401).json({message: 'Not authorized, user not found'});
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({message: 'Not authorized, token failed'});
    }
  }

  if(!token){
    return res.status(401).json({message: 'Not authorize, no token'});
  }
};


const roleMiddleware=(roles)=>{
  return (req,res, next)=>{
    if(req.user && roles.includes(req.user.role)){
      next();
    }else{
      return res.status(403).json({message: 'Access denied'});
    }
  };
};

const organizationMiddleware = (req,res,next)=>{
  if(req.user && req.user.role === 'organization'){
    next();
  }else{
    return res.status(403).json({message: 'Access denied'})
  }
};


module.exports={
  authMiddleware,
  roleMiddleware,
  organizationMiddleware,
}