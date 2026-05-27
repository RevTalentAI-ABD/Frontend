import React, { useState } from "react";
import "../styles/ForgotPassword.css";
import api from "../api/axiosConfig";

export default function ForgotPassword({ onBack }) {
  // step 1 = enter email, 2 = link sent, 3 = success (navigated from reset page)
  const [step, setStep]     = useState(1);
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 — send reset link
  const handleEmailSubmit = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setStep(2);
    } catch {
      // Backend always 200s to prevent enumeration, so errors are network-level
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
              <rect x="2"  y="2"  width="9" height="9" rx="2" fill="white" opacity="0.9" />
              <rect x="13" y="2"  width="9" height="9" rx="2" fill="white" opacity="0.6" />
              <rect x="2"  y="13" width="9" height="9" rx="2" fill="white" opacity="0.6" />
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
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <circle cx="12" cy="16" r="1" fill="#7c5af0"/>
              </svg>
            </div>
            <h1 className="fp-heading">Forgot password?</h1>
            <p className="fp-subheading">
              Enter your work email and we'll send you a reset link.
            </p>

            <div className="fp-field-group">
              <label className="fp-label">Work Email</label>
              <div className="fp-input-wrapper">
                <span className="fp-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                  </svg>
                </span>
                <input type="email" className="fp-input" placeholder="you@company.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleEmailSubmit()} />
              </div>
            </div>

            {error && (
              <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button className="fp-send-btn" onClick={handleEmailSubmit} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link →"}
            </button>
            <button className="fp-back-btn" onClick={onBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Sign In
            </button>
          </>
        )}

        {/* ── STEP 2: Link sent ── */}
        {step === 2 && (
          <>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "rgba(124,90,240,0.12)", border: "2px solid rgba(124,90,240,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7c5af0" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
              </svg>
            </div>

            <h1 className="fp-heading">Check your inbox</h1>
            <p className="fp-subheading">
              If <strong style={{ color: "#c4b8ff" }}>{email}</strong> is registered,
              a password reset link has been sent.
            </p>

            <div className="fp-info-box" style={{ marginBottom: "16px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c5af0" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
              <span>The link expires in 5 minutes. Check your spam folder if you don't see it.</span>
            </div>

            <button className="fp-send-btn"
              onClick={() => { setStep(1); setEmail(""); setError(""); }}>
              Try a different email
            </button>
            <button className="fp-back-btn" onClick={onBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}