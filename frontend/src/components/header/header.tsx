import { useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { AuthModal } from '../authModal/authModal';
import './header.css';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <>
      <header className="header-bar">
        <div className="header-toolbar">
          <div className="header-logo-title">
            <img
              src="/reach_logo.webp"
              alt="Logo"
              className="header-logo"
            />
            <span className="header-title">REACH Hong Kong</span>
          </div>
          <nav className="header-nav">
            <a href="/" className="header-btn">Home</a>
            <a href="/leaderboard" className="header-btn">Leaderboard</a>
            <a href="/stories" className="header-btn">Stories</a>
            {user?.roles?.includes('Staff') && (
              <a href="/admin" className="header-btn">Admin</a>
            )}

            {isAuthenticated ? (
              <div className="user-menu">
                <button 
                  className="user-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user?.name || 'User'}
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-name">{user?.name}</div>
                      <div className="user-email">{user?.email}</div>
                    </div>
                    <hr />
                    <button onClick={handleLogout} className="logout-btn">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  className="header-btn" 
                  onClick={() => openAuthModal('login')}
                >
                  Login
                </button>
                <button 
                  className="header-btn header-btn-primary" 
                  onClick={() => openAuthModal('register')}
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Only render modal when showAuthModal is true */}
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