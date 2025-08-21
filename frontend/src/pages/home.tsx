import './home.css';

function Home() {
  return (
    <div className="home-root">
      <div className="home-content">
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 className="home-title">
            Empowering communities. Creating opportunities. Making a difference.
          </h1>
        </div>
        <div className="home-paper">
          <h2 className="home-section-title">About Us</h2>
          <p>
            REACH is a non-profit organization based in Hong Kong dedicated to supporting underprivileged communities through education, outreach, and empowerment programs.
          </p>
          <hr style={{ margin: "40px 0" }} />
          <h2 className="home-section-title">Our Mission</h2>
          <ul>
            <li>
              <span role="img" aria-label="school">🎓</span> Provide educational resources and support
            </li>
            <li>
              <span role="img" aria-label="community">👥</span> Foster community engagement and inclusion
            </li>
          </ul>
          <hr style={{ margin: "40px 0" }} />
          <div className="home-get-involved">
            <h2 style={{ color: "#00796b", fontWeight: 600, marginBottom: "16px" }}>Get Involved</h2>
            <p>
              Join us in making a positive impact!{' '}
              <a
                href="https://reachhk.squarespace.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline", color: "#0288d1" }}
              >
                Contact us
              </a>{' '}
              to volunteer, donate, or partner with REACH.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;