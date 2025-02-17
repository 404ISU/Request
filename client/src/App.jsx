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
import ProfilePage from './pages/ProfilePage';
import Worker from './pages/Worker';


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
        <Route path="/admin-panel" element={<Dashboard/>}/>
        <Route path="/manage-workers" element={<Worker/>}/>
        <Route path="/user-profile" element={<ProfilePage/>}/>
      </Routes>
    </UserContextProvider>

  )
}
export default App;