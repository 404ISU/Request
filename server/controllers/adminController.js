import User from '../models/User.js';

export const getUsers =async(req,res)=>{
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
}

export const deleteUser =async (req, res)=>{
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({message: 'User deleted successfully'});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
}