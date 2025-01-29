import React, {useEffect} from 'react';
import {Box, Typography, Button} from '@mui/material';
import { useAuthState } from '../stores/authState';
import {useNavigate} from 'react-router-dom';


const DashboardPage = ()=>{
  const {user, fetchUser, logout, isAuthenticated}=useAuthState();
  const navigate=useNavigate();

  useEffect(()=>{
    fetchUser();
  }, [isAuthenticated, fetchUser]);

  const handleLogout = async()=>{
    await logout();
    navigate('/login');
  };


  return (
    <Box sx={{p:3, textAlign: 'center'}}>
      {user ? (
        <>
        <Typography variant='h4' gutterBottom>
          Welcome, {user.email}!
        </Typography>
        <Typography variant='body1' gutterBottom>
          You are logged is as a {user.role}.
        </Typography>
        {user.organizationName && <Typography variant="body1" gutterBottom>
          Organization: {user.organizationName}</Typography>}
          <Button variant="contained" color='secondary' onClick={handleLogout}>Logout</Button>
        </>
      ):(
        <Typography variant="h6">Loading user data...</Typography>
      )}
    </Box>
  )
}


export default DashboardPage;