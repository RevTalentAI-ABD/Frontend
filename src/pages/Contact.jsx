import Navbar from "../components/Navbar";
import "../styles/LandingPage.css";

function Contact() {
  return (
    <div className="contact-page">
      <Navbar />

      <div className="contact-container fade-up">
        <p className="contact-tag">CONTACT</p>

        <h1 className="contact-title">
          We’d love to hear from you
        </h1>

        <p className="contact-desc">
          Reach out for demos, support, onboarding, or product questions.
        </p>

        <div className="contact-card">
          <div className="form-group">
            <label>Name</label>
            <input type="text" placeholder="Enter your name" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea rows="5" placeholder="Write your message" />
          </div>

          <button className="contact-btn">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

export default Contact;