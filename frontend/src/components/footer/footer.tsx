import './footer.css'

function Footer() {
  return (
    <footer className="footer-bar">
      <div className="footer-content">
        &copy; {new Date().getFullYear()} REACH Hong Kong. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;