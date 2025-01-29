import React, {useEffect} from 'react';
import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';
import RequestPage from './pages/RequestPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import PrivateRoute from './components/Route/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import RoleRoute from './components/Route/RoleRoute';
import OrganizationDashboard from './pages/OrganizationDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { useAuthState } from './stores/authState';
import OrgUsersPage from './pages/OrgUserPage';
import { CssBaseline } from '@mui/material';

const theme = createTheme();

const App = () => {
    return(
        <ThemeProvider theme={theme}>
            <CssBaseline/>
                <BrowserRouter>
                    <AppRoutesWrapper />
                </BrowserRouter>
        </ThemeProvider>
    );
}

const AppRoutesWrapper = () => {
    const {fetchUser}=useAuthState();
    useEffect(()=>{
        fetchUser();
    }, [fetchUser])
    return <AppRoutes/>
}
const AppRoutes = ()=>{
    const navigate = useNavigate();
    const {isAuthenticated}  = useAuthState()

    useEffect(()=>{
            if(isAuthenticated){
                navigate('/dashboard');
            }
    }, [isAuthenticated, navigate])

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage/></PrivateRoute>}>
            </Route>
            <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard/></RoleRoute>} />
            <Route path="/organization" element={<RoleRoute allowedRoles={['organization']}><OrganizationDashboard/></RoleRoute>} />
            <Route path="/employee" element={<RoleRoute allowedRoles={['employee']}
            ><EmployeeDashboard/></RoleRoute>} />
            <Route path="/request" element={<RequestPage/>}/>
            <Route path="/organization/users" element={<RoleRoute allowedRoles={['organization']}><OrgUsersPage/></RoleRoute>} />
        </Routes>
    )
}
  
export default App;