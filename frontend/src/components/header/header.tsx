import { Menu as MenuIcon, Person } from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { AuthModal } from '../authModal/authModal';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    handleMobileMenuClose();
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    handleMobileMenuClose();
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Stories', href: '/stories' },
    ...(user?.roles?.includes('Staff') ? [{ label: 'Admin', href: '/admin' }] : []),
  ];

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#F5F5DC', // Cream color
          color: '#333', // Dark text for better contrast on cream background
        }}
      >
        <Toolbar>
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img
              src="/reach_logo.webp"
              alt="Logo"
              style={{ height: 40, marginRight: 12 }}
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' }
              }}
            >
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  sx={{ 
                    textTransform: 'none',
                    color: '#333',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    }
                  }}
                  href={item.href}
                >
                  {item.label}
                </Button>
              ))}

              {isAuthenticated ? (
                <>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{ ml: 1, color: '#333' }}
                  >
                    <Avatar sx={{ width: 32, height: 32, backgroundColor: '#00796b', color: 'white' }}>
                      {user?.name?.charAt(0) || <Person />}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem disabled>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user?.email}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem onClick={() => window.location.href = '/dashboard'}>
                      Dashboard
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    onClick={() => openAuthModal('login')}
                    sx={{ 
                      textTransform: 'none',
                      color: '#333',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => openAuthModal('register')}
                    sx={{ 
                      textTransform: 'none',
                      color: '#00796b',
                      borderColor: '#00796b',
                      '&:hover': {
                        borderColor: '#00796b',
                        backgroundColor: 'rgba(0, 121, 107, 0.1)',
                      }
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={handleMobileMenuOpen}
              sx={{ ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {[
              // User info for authenticated users
              ...(isAuthenticated ? [
                <MenuItem key="user-info" disabled>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                </MenuItem>
              ] : []),
              
              // Navigation items
              ...navigationItems.map((item) => (
                <MenuItem 
                  key={item.label}
                  onClick={() => {
                    window.location.href = item.href;
                    handleMobileMenuClose();
                  }}
                >
                  {item.label}
                </MenuItem>
              )),

              // Auth-specific menu items
              ...(isAuthenticated ? [
                <MenuItem key="dashboard" onClick={() => {
                  window.location.href = '/dashboard';
                  handleMobileMenuClose();
                }}>
                  Dashboard
                </MenuItem>,
                <MenuItem key="logout" onClick={handleLogout}>
                  Logout
                </MenuItem>
              ] : [
                <MenuItem key="login" onClick={() => openAuthModal('login')}>
                  Login
                </MenuItem>,
                <MenuItem key="signup" onClick={() => openAuthModal('register')}>
                  Sign Up
                </MenuItem>
              ])
            ]}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Toolbar spacing */}
      <Toolbar />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={closeAuthModal}
          initialMode={authMode}
        />
      )}
    </>
  );
}

export default Header;