
import React, { useState } from "react";

import "../styles/ForgotPassword.css";  


import api from "../api/axiosConfig";

export default function ForgotPassword({ onBack }) {
  const [step, setStep]               = useState(1); // 1=email, 2=new password, 3=success
  const [email, setEmail]             = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  // Step 1 — verify email exists
  const handleEmailSubmit = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    setLoading(true);
    try {
      await api.post("/api/auth/verify-email", { email });
      setStep(2);
    } catch {
      setError("No account found with this email.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — save new password
  const handlePasswordReset = async () => {
    setError("");
    if (!newPassword || !confirmPass)  { setError("Please fill in both fields."); return; }
    if (newPassword.length < 8)        { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPass)   { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { email, newPassword });
      setStep(3);
    } catch {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show, toggle }) => (
    <button type="button" onClick={toggle}
      style={{ position: "absolute", right: 14, background: "none", border: "none",
        cursor: "pointer", color: "#a09cc0", display: "flex", alignItems: "center" }}>
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

// import Navbar from "../components/Navbar";
// import { useNavigate } from "react-router-dom";

// function LandingPage() {
//   const navigate = useNavigate();

//   return (
//     <div className="page">
//       <Navbar />

//       <section className="hero">
//         <h1>Smarter HR <span>Together</span></h1>
//         <p>Manage everything in one platform</p>

//         <div className="hero-buttons">
//           <button
//             className="btn btn-primary"
//             onClick={() => navigate("/login")}
//           >
//             Get Started
//           </button>

//           <button
//             className="btn btn-outline"
//             onClick={() => navigate("/about")}
//           >
//             Explore
//           </button>
//         </div>
//       </section>

//       <section className="quote">
//         <p>“Empowering teams with smart HR solutions.”</p>
//       </section>
//     </div>
//   );
// }

// export default LandingPage;

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
            onClick={() => navigate("/jobs")}
          >
            View Open Positions
          </button>
        </div>
      </section>

      <section className="quote">
        <p>"Empowering teams with smart HR solutions."</p>
      </section>
    </div>
  );
}

export default LandingPage;