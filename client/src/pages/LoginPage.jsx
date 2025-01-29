import React from 'react';
import AuthForm from '../components/Auth/AuthForm';
import {useNavigate} from 'react-router-dom';


const LoginPage = ()=>{
  const navigate = useNavigate();
  const handleLogin = ()=>{
    navigate('/dashboard');
  }
  return <AuthForm mode="login" onSubmit={handleLogin}/>;
};

export default LoginPage;