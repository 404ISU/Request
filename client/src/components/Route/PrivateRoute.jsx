import React from 'react';
import {Navigate} from 'react-router-dom';
import { useAuthState } from '../../stores/authState';


const PrivateRoute = ({children})=>{
  const {isAuthenticated}=useAuthState();
  return isAuthenticated ? children : <Navigate to="/login"/>
};

export default PrivateRoute;