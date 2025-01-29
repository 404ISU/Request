import React, {useState} from 'react';
import {TextField, Button, Box, Typography, Alert} from '@mui/material';
import { useAuthState } from '../../stores/authState';


const AuthForm = ({mode = 'login', onSubmit})=>{
  const {loading, error, registerOrganization, login, clearError}=useAuthState();
  const [formData, setFormData]=useState({
    email: '',
    password: '',
    organizationName: '',
    organizationAddress: '',
    organizationPhone: '',
    firstName: '',
    lastName: '',
    middleName: '',
  });


  const handleChange = (e)=>{
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async(e)=>{
    e.preventDefault();
    clearError()
    if(mode === 'register'){
      await registerOrganization(formData);
    }else{
      await login(formData);
    }
    onSubmit();
  };


  return (
    <Box
    sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4}}>
      <Typography variant="h5" gutterBottom>
        {mode === 'login' ? 'Login' : 'Register Organization'}
      </Typography>
      {error && (
        <Alert severity="error" sx={{mb:2}}>{error}</Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{width: '100%', maxWidth: 400, mt:2}}>
        <TextField fullWidth label="Email" name="email" type="email" variant="outlined" margin="normal" value={formData.email} onChange={handleChange}/>
        <TextField fullWidth label="Password" name='password' type="password" variant="outlined" margin='normal' value={formData.password} onChange={handleChange}/>
        {mode === 'register' && (
          <>
          <TextField fullWidth label="Organization name"
          name="organizationName" variant='outlined' margin="normal" value={formData.organizationName} onChange={handleChange}/>
          <TextField fullWidth label="Organization Address" name="organizationAddress" variant="outlined" margin='normal' value={formData.organizationAddress} onChange={handleChange}/>
          <TextField fullWidth label="Organization Phone" name="organizationPhone" variant=
          "outlined" margin="normal" value={formData.organizationPhone} onChange={handleChange}/>
          <TextField fullWidth label="First Name" name="firstName" variant="outlined" margin="normal" value={formData.firstName} onChange={handleChange}/>
          <TextField fullWidth label="Last Name" name="lastName" variant="outlined" margin="normal" value={formData.lastName} onChange={handleChange}/>
          <TextField fullWidth label="Middle Name" name="middleName" variant="outlined" margin="normal" value={formData.middleName} onChange={handleChange}/>
          </>
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{mt:2}} disabled={loading}>{loading ? 'Loading...' : mode==='login' ? 'Login' : 'Register'}</Button>
      </Box>
    </Box>
  )
}

export default AuthForm;