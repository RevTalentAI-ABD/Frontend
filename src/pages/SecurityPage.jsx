import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Security.css";

export default function SecurityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileData = location.state?.profileData || {};

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const allValid = hasMinLength && hasUppercase && hasNumberOrSymbol;
  const passwordsMatch = password === confirm && confirm.length > 0;

  const handleSubmit = () => {
    if (allValid && passwordsMatch) {
      alert("Account created successfully!");
      // navigate("/dashboard"); // uncomment when dashboard is ready
    }
  };

  return (
    <div className="hrflow-bg">
      <div className="hrflow-card">

        {/* Logo */}
        <div className="hrflow-logo">
          <div className="hrflow-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <circle cx="9" cy="7" r="3" />
              <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
              <circle cx="17" cy="7" r="2" />
              <path d="M17 13c2.2 0 4 1.8 4 4" />
            </svg>
          </div>
          <span className="hrflow-logo-text">Rev<span>Talent</span></span>
        </div>

        {/* Title */}
        <h1 className="hrflow-title">Set your credentials</h1>
        <p className="hrflow-subtitle">Almost done — secure your account</p>

        {/* Stepper */}
        <div className="hrflow-stepper">
          <div className="step step-done">
            <div className="step-circle done">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="step-label active-label">Profile</span>
          </div>
          <div className="step-line" />
          <div className="step step-current">
            <div className="step-circle current">2</div>
            <span className="step-label">Security</span>
          </div>
        </div>

        {/* Password Field */}
        <div className="hrflow-field">
          <label className="hrflow-label">Password</label>
          <div className="hrflow-input-wrap">
            <svg className="hrflow-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showPass ? "text" : "password"}
              className="hrflow-input"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="toggle-btn" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
              {showPass ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="hrflow-field">
          <label className="hrflow-label">Confirm Password</label>
          <div className="hrflow-input-wrap">
            <svg className="hrflow-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showConfirm ? "text" : "password"}
              className="hrflow-input"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button type="button" className="toggle-btn" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
              {showConfirm ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Requirements Box */}
        <div className="hrflow-requirements">
          <p className="req-title">Password requirements</p>
          <ul className="req-list">
            <li className={hasMinLength ? "req-item met" : "req-item"}>
              <span className="req-dot"></span>
              At least 8 characters
            </li>
            <li className={hasUppercase ? "req-item met" : "req-item"}>
              <span className="req-dot"></span>
              One uppercase letter
            </li>
            <li className={hasNumberOrSymbol ? "req-item met" : "req-item"}>
              <span className="req-dot"></span>
              One number or symbol
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="hrflow-actions">
          <button className="btn-back" onClick={() => navigate("/register")}>← Back</button>
          <button
            className={`btn-create ${allValid && passwordsMatch ? "active" : ""}`}
            disabled={!allValid || !passwordsMatch}
            onClick={handleSubmit}
          >
            Create Account ✓
          </button>
        </div>

        {/* Sign In */}
        <p className="hrflow-signin">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
}
