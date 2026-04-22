import Navbar from "../components/Navbar";
import "../styles/LandingPage.css";

function About() {
  return (
    <div className="about-page">
      <Navbar />

      <div className="about-container fade-up">
        <p className="about-tag">ABOUT</p>

        <h1 className="about-title">
          Built to modernize HR operations
        </h1>

        <p className="about-desc">
          Rev Talent is an AI-powered HR platform designed to simplify employee
          management, leave and attendance tracking, recruitment, performance
          reviews, payroll visibility, and policy assistance. It helps teams
          reduce manual work and improve employee experience.
        </p>

        <div className="about-stats">
          <div className="stat-card">
            <h2>500+</h2>
            <p>Organizations</p>
          </div>

          <div className="stat-card">
            <h2>10K+</h2>
            <p>Users</p>
          </div>

          <div className="stat-card">
            <h2>98%</h2>
            <p>Satisfaction</p>
          </div>

          <div className="stat-card">
            <h2>24/7</h2>
            <p>Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;