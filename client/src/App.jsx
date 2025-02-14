import React from 'react';
import RequestPage from './pages/RequestPage';
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home'
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { UserContextProvider } from './context/userContext';
import ManageWorker from './components/Worker/ManageWorker';
import UserProfile from './components/User/UserProfile';
import AdminPanel from './components/Admin/AdminPanel';

axios.defaults.baseURL='http://localhost:5001';
axios.defaults.withCredentials=true

function App (){
  return (
    <UserContextProvider>
      <Navbar/>
      <Toaster position='bottom-right' toastOptions={{duration: 2000}}/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/request" element={<RequestPage/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/manage-workers" element={<ManageWorker/>}/>
        <Route path="/user-profile" element={<UserProfile/>}/>
        <Route path="/admin-panel" element={<AdminPanel/>}/>
      </Routes>
    </UserContextProvider>

  )
}
export default App;