import React, { useState } from "react";
import "./ForgotPassword.css";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (email.trim()) setSent(true);
  };

  return (
    <div className="fp-wrapper">
      <div className="fp-blob fp-blob-1" />
      <div className="fp-blob fp-blob-2" />
      <div className="fp-blob fp-blob-3" />

      <div className="fp-card">
        {/* Logo */}
        <div className="fp-logo">
          <div className="fp-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="white" opacity="0.9" />
              <rect x="13" y="2" width="9" height="9" rx="2" fill="white" opacity="0.6" />
              <rect x="2" y="13" width="9" height="9" rx="2" fill="white" opacity="0.6" />
              <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9" />
            </svg>
          </div>
          <span className="fp-logo-text">Rev<span className="fp-logo-accent">Talent</span></span>
        </div>

        {!sent ? (
          <>
            {/* Icon */}
            <div className="fp-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c5af0" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h1 className="fp-heading">Forgot password?</h1>
            <p className="fp-subheading">
              No worries! Enter your work email and we'll send you a reset link.
            </p>

            <div className="fp-field-group">
              <label className="fp-label">Work Email</label>
              <div className="fp-input-wrapper">
                <span className="fp-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 7 10-7" />
                  </svg>
                </span>
                <input
                  type="email"
                  className="fp-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
              </div>
            </div>

            <button className="fp-send-btn" onClick={handleSend}>
              Send Reset Link →
            </button>

            <button className="fp-back-btn" onClick={onBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="fp-success-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#7c5af0" opacity="0.12" />
                <circle cx="12" cy="12" r="10" fill="#7c5af0" opacity="0.2" />
                <path d="M8 12.5l3 3 5-5.5" stroke="#5b3de8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="fp-heading">Check your inbox</h1>
            <p className="fp-subheading">
              We sent a password reset link to<br />
              <strong className="fp-email-highlight">{email}</strong>
            </p>

            <div className="fp-info-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c5af0" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>Didn't receive the email? Check your spam folder or try again.</span>
            </div>

            <button className="fp-send-btn" onClick={() => { setEmail(""); setSent(false); }}>
              Try a different email
            </button>

            <button className="fp-back-btn" onClick={onBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}