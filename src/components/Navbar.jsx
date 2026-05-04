import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Rev Talent</div>

      <div className="nav-links">
        <Link to="/">Home</Link>
  
        <Link to="/contact">Contact</Link>
      </div>

      <div className="nav-buttons">
        <Link to="/login">
          <button className="btn-outline">Login</button>
        </Link>
        <Link to="/register">
          <button className="btn-primary">Register</button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;