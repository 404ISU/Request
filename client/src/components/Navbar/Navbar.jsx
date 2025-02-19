// components/Navbar/Navbar.js
import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Link as MuiLink,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  Box
} from '@mui/material';
import {
  Home,
  Login as LoginIcon,
  Person,
  People,
  AssignmentInd,
  Menu as MenuIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import axios from 'axios';
import {CloudUpload} from 'lucide-react';
// Стилизованный AppBar с градиентом и анимацией
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, #1976d2 90%)`,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
}));

// Стилизованные ссылки с эффектом наведения
const NavLink = styled(MuiLink)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0, 1),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    fontSize: '1.2rem',
  },
}));

// Стилизованный аватар
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 38,
  height: 38,
  border: `2px solid ${theme.palette.common.white}`,
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const Navbar = () => {
  const { user, logout, loading } = useContext(UserContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post('/logout', null, { withCredentials: true });
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const renderDesktopMenu = () => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <NavLink component={Link} to="/documentation" color="inherit">
        <AssignmentInd /> Документация
      </NavLink>

      {user ? (
        <>
          
          <NavLink component={Link} to="/request" color="inherit">
          <CloudUpload/> Запрос
          </NavLink>

          {user.role === 'organization' && (
            <NavLink component={Link} to="/manage-workers" color="inherit">
              <People />Работники
            </NavLink>
          )}

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <ProfileAvatar 
              src={user.avatar} 
              alt={user.name}
            />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                boxShadow: 3,
                '& .MuiMenuItem-root': {
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: alpha('#2196f3', 0.1),
                  }
                }
              }
            }}
          >
            <MenuItem 
              component={Link} 
              to="/user-profile"
              sx={{ color: 'text.primary' }}
            >
              <Person sx={{ mr: 2, color: 'primary.main' }} /> Профиль
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              sx={{ color: 'error.main' }}
            >
              <LoginIcon sx={{ mr: 2 }} /> Выход
            </MenuItem>
          </Menu>
        </>
      ) : (
        <>
          <NavLink component={Link} to="/register" color="inherit">
            Регистрация
          </NavLink>
          <NavLink component={Link} to="/login" color="inherit">
            <LoginIcon /> Вход
          </NavLink>
        </>
      )}
    </Box>
  );

  const renderMobileMenu = () => (
    <>
      <IconButton
        color="inherit"
        onClick={() => setMobileOpen(!mobileOpen)}
        sx={{ ml: 2 }}
      >
        <MenuIcon fontSize="large" />
      </IconButton>

      <Menu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ 
          '& .MuiPaper-root': { 
            width: '100%', 
            maxWidth: 250 
          } 
        }}
      >
        {user ? [
          <MenuItem key="profile" component={Link} to="/user-profile">
            <Person sx={{ mr: 2 }} /> Профиль
          </MenuItem>,
          <MenuItem key="logout" onClick={handleLogout}>
            <LoginIcon sx={{ mr: 2 }} /> Выход
          </MenuItem>
        ] : [
          <MenuItem key="login" component={Link} to="/login">
            <LoginIcon sx={{ mr: 2 }} /> Вход
          </MenuItem>,
          <MenuItem key="register" component={Link} to="/register">
            Регистрация
          </MenuItem>
        ]}
        <MenuItem component={Link} to="/documentation">
          <AssignmentInd sx={{ mr: 2 }} /> Документация
        </MenuItem>
      </Menu>
    </>
  );

  if (loading) return <Box sx={{ height: 64 }} />;

  return (
    <StyledAppBar position="sticky">
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        minHeight: '64px !important',
      }}>
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            fontFamily: 'Montserrat',
            fontWeight: 700,
            letterSpacing: 1.1,
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': {
              opacity: 0.9
            }
          }}
        >
                    <CloudUpload           sx={{
            fontFamily: 'Montserrat',
            fontWeight: 700,
            letterSpacing: 1.1,
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': {
              opacity: 0.9
            },
            
          }}/>
        </Typography>

        {isMobile ? renderMobileMenu() : renderDesktopMenu()}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;