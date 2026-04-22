import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <Navbar />

      <section className="hero">
        <h1>Smarter HR <span>Together</span></h1>
        <p>Manage everything in one platform</p>

        <div className="hero-buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>

          <button
            className="btn btn-outline"
            onClick={() => navigate("/about")}
          >
            Explore
          </button>
        </div>
      </section>

      <section className="quote">
        <p>“Empowering teams with smart HR solutions.”</p>
      </section>
    </div>
  );
}

export default LandingPage;