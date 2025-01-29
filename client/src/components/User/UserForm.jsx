import React, {useState} from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useAuthState } from "../../stores/authState";


const UserForm = ({onSubmit, user = {email: '', password: ''}})=>{
  const {loading, error, clearError}=useAuthState();
  const [formData, setFormData]=useState({
    email: user.email || '',
    password: user.password || '',
  });

  const handleChange=(e)=>{
    setFormData({...formData, [e.target.name]: e.target.value});
  };


  const handleSubmit = async (e)=>{
    e.preventDefault();
    clearError();
    onSubmit(formData);

  };

  return(
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4,}}>
      <Typography variant="h5" gutterBottom>
        {user.email ? 'Edit User' : 'Create User'}
      </Typography>
      {error && (
        <Alert severity="error" sx={{mb:2}}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{width: '100%', maxWidth: 400, mt:2}}>
        <TextField fullWidth label="email" name="email" type="email" variant="outlined" margin="normal" value={formData.email} onChange={handleChange} required/>
        <TextField fullWidth label="password" name="password" type="password" variant="outlined" margin="normal" value={formData.password} onChange={handleChange} required/>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt:2}} disabled={loading}>{loading ? 'Loading...' : user.email ? 'Save' : 'Create'}</Button>
      </Box>
    </Box>
  )
}

export default UserForm;