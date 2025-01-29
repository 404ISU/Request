import React from 'react';
import AuthForm from '../components/Auth/AuthForm';
import {useNavigate} from 'react-router-dom';


const RegisterPage = ()=>{
  const navigate = useNavigate();
  const handleRegister = ()=>{
    navigate('dashboard');
  };
  return <AuthForm mode='register' onSubmit={handleRegister}/>;
};

export default RegisterPage;