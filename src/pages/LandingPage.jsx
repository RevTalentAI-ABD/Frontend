import "../styles/LandingPage.css";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* ===== NAVBAR ===== */}
      <nav className="navbar">

        {/* LOGO */}
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="white" opacity="0.9" />
              <rect x="13" y="2" width="9" height="9" rx="2" fill="white" opacity="0.6" />
              <rect x="2" y="13" width="9" height="9" rx="2" fill="white" opacity="0.6" />
              <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9" />
            </svg>
          </div>

          <h2 className="logo-text">
  Rev<span>Talent</span>
</h2>
        </div>

        {/* NAV LINKS */}
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/jobs">Jobs</a>
          <a href="/contact">Contact</a>
        </div>

        {/* AUTH BUTTONS */}
        <div className="auth-buttons">
          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="register-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">

        <div className="hero-badge">
          Intelligent HR Management Platform
        </div>

        <h1>
          Revolutionizing <br />
          <span>Modern Workforce</span>
        </h1>

        <p className="hero-description">
          Streamline recruitment, onboarding, attendance,
          performance tracking, and employee management —
          all from one powerful AI-driven HR ecosystem.
        </p>



        <div className="hero-buttons">

          <button
            className="primary-btn"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/jobs")}
          >
            Explore Careers
          </button>

        </div>

      </section>

    </div>
  );
}

export default LandingPage;