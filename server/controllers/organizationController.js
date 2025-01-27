import User from '../models/User.js';

export const getEmployees = async (req,res)=>{
  try {
    const employees =await User.find({organization: req.user.organization}).select('-password');
    res.status(200).json(employees);
  } catch (error) {
    res.status(400).json({error : error.message});
  }
}

export const createEmployee = async(req,res)=>{
  const {username, email, password, firstName, lastName, middleName, phone, organizationId}=req.body;

  try {
    const user = new User({
      username,
      email,
      password,
      role: 'employee',
      organization: organizationId,
      firstName,
      lastName,
      middleName,
      phone,
    });
    await user.save();

    res.status(201).json({message: 'Employee created successfully', user});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
}