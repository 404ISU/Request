import React from 'react'
import {Navigate} from 'react-router-dom';
import { useAuthState } from '../../stores/authState';

const RoleRoute = ({children, allowedRoles}) =>{
  const {isAuthenticated, user}=useAuthState();
  return isAuthenticated && allowedRoles.includes(user?.role)?(children) : <Navigate to="/login"/>;
};

export default RoleRoute;