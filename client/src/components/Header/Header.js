import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#3B82F6', boxShadow: 'none' }}>
      <Toolbar>
        {/* Логотип */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2ZM16 28C9.373 28 4 22.627 4 16C4 9.373 9.373 4 16 4C22.627 4 28 9.373 28 16C28 22.627 22.627 28 16 28Z" fill="#FFFFFF"/>
            <path d="M16 10C12.686 10 10 12.686 10 16C10 19.314 12.686 22 16 22C19.314 22 22 19.314 22 16C22 12.686 19.314 10 16 10ZM16 20C13.791 20 12 18.209 12 16C12 13.791 13.791 12 16 12C18.209 12 20 13.791 20 16C20 18.209 18.209 20 16 20Z" fill="#FFFFFF"/>
          </svg>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#FFFFFF' }}>

          </Typography>
        </div>

        {user && (
          <>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => navigate('/profile')}>Личный кабинет</MenuItem>
              {user.role === 'admin' && <MenuItem onClick={() => navigate('/admin')}>Панель администратора</MenuItem>}
              {user.role === 'organization' && <MenuItem onClick={() => navigate('/organization')}>Панель организации</MenuItem>}
              {user.role === 'employee' && <MenuItem onClick={() => navigate('/request')}>HTTP Запросы</MenuItem>}
              <MenuItem onClick={handleLogout}>Выйти</MenuItem>
            </Menu>
          </>
        )}
        {!user && (
          <>
            <Button color="inherit" component={Link} to="/login" sx={{ fontFamily: 'Inter', fontWeight: 500 }}>
              Войти
            </Button>
            <Button color="inherit" component={Link} to="/register" sx={{ fontFamily: 'Inter', fontWeight: 500 }}>
              Регистрация
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;