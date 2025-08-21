import './header.css';

function Header() {
  return (
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
        </nav>
      </div>
    </header>
  );
}

export default Header;