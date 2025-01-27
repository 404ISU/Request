import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header/Header';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import OrganizationPage from './pages/OrganizationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RequestPage from './pages/RequestPage';

const App = () => {
    const [user, setUser] = useState (null);

    //проверка авторизации при загрузке приложения
    useEffect(()=>{
        const fetchUser = async ()=>{
            try {
                const response = await axios.get('/api/auth/me');
                setUser(response.data);
            } catch (error) {
                console.error(error.response.data);
            }
        };
        fetchUser();
    }, []);


    return (
        <Router>
            <Header user={user} setUser={setUser}/>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
                <Route path="/admin" element={<AdminPage/>}/>
                <Route path="/organization" element={<OrganizationPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/request" element={<RequestPage/>}/>
            </Routes>
        </Router>
    );
};

export default App;