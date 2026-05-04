import React, { useState } from "react";
<<<<<<< Updated upstream
import "../styles/ForgotPassword.css";  
=======
import "./ForgotPassword.css";
>>>>>>> Stashed changes
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

        {/* ── STEP 1: Enter Email ── */}
        {step === 1 && (
          <>
            <div className="fp-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c5af0" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7 10-7" />
              </svg>
            </div>
            <h1 className="fp-heading">Forgot password?</h1>
            <p className="fp-subheading">Enter your work email to continue.</p>

            <div className="fp-field-group">
              <label className="fp-label">Work Email</label>
              <div className="fp-input-wrapper">
                <span className="fp-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 7 10-7" />
                  </svg>
                </span>
                <input type="email" className="fp-input" placeholder="you@company.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleEmailSubmit()} />
              </div>
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px", textAlign: "center" }}>{error}</p>}

            <button className="fp-send-btn" onClick={handleEmailSubmit} disabled={loading}>
              {loading ? "Verifying..." : "Continue →"}
            </button>
            <button className="fp-back-btn" onClick={onBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Sign In
            </button>
          </>
        )}

        {/* ── STEP 2: Set New Password ── */}
        {step === 2 && (
          <>
            <div className="fp-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c5af0" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="fp-heading">Create new password</h1>
            <p className="fp-subheading">Set a new password for <strong className="fp-email-highlight">{email}</strong></p>

            {/* New Password */}
            <div className="fp-field-group">
              <label className="fp-label">New Password</label>
              <div className="fp-input-wrapper">
                <span className="fp-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input type={showNew ? "text" : "password"} className="fp-input"
                  placeholder="Min. 8 characters" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} />
                <EyeIcon show={showNew} toggle={() => setShowNew(s => !s)} />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="fp-field-group">
              <label className="fp-label">Confirm Password</label>
              <div className="fp-input-wrapper">
                <span className="fp-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input type={showConfirm ? "text" : "password"} className="fp-input"
                  placeholder="Re-enter password" value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handlePasswordReset()} />
                <EyeIcon show={showConfirm} toggle={() => setShowConfirm(s => !s)} />
              </div>
            </div>

            {/* Requirements */}
            <div className="fp-info-box" style={{ marginBottom: "16px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c5af0" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>At least 8 characters · One uppercase · One number or symbol</span>
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px", textAlign: "center" }}>{error}</p>}

            <button className="fp-send-btn" onClick={handlePasswordReset} disabled={loading}>
              {loading ? "Saving..." : "Reset Password ✓"}
            </button>
            <button className="fp-back-btn" onClick={() => { setStep(1); setError(""); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 3 && (
          <>
            <div className="fp-success-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#7c5af0" opacity="0.12" />
                <circle cx="12" cy="12" r="10" fill="#7c5af0" opacity="0.2" />
                <path d="M8 12.5l3 3 5-5.5" stroke="#5b3de8" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="fp-heading">Password updated!</h1>
            <p className="fp-subheading">Your password has been reset successfully. Sign in with your new password.</p>
            <button className="fp-send-btn" onClick={onBack}>Back to Sign In →</button>
          </>
        )}
      </div>
    </div>
  );
}