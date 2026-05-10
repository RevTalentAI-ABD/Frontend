import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axiosConfig";
import "../styles/Security.css";

export default function SecurityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileData = location.state?.profileData || {};

  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  // ── OTP state ──────────────────────────────────────────────────────────────
  const [page, setPage]               = useState("security"); // security | otp
  const [otp, setOtp]                 = useState("");
  const [otpEmail, setOtpEmail]       = useState("");
  const [otpError, setOtpError]       = useState("");
  const [otpLoading, setOtpLoading]   = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const hasMinLength      = password.length >= 8;
  const hasUppercase      = /[A-Z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const allValid          = hasMinLength && hasUppercase && hasNumberOrSymbol;
  const passwordsMatch    = password === confirm && confirm.length > 0;

  // ── Resend timer ───────────────────────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  // ── Register → go to OTP page ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!allValid || !passwordsMatch) return;
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        name:       `${profileData.firstName} ${profileData.lastName}`,
        username:   profileData.email,
        email:      profileData.email,
        password:   password,
        role:       profileData.role.toUpperCase(),
        department: profileData.department,
      });

      // ✅ Registration success — send OTP and go to OTP page
      await api.post("/api/auth/resend-otp", { email: profileData.email });
      setOtpEmail(profileData.email);
      setPage("otp");
      startResendTimer();

    } catch (err) {
      setError(err.response?.data || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    setOtpError("");
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }
    setOtpLoading(true);
    try {
      await api.post("/api/auth/verify-otp", {
        email: otpEmail,
        otp:   otp,
      });
      // ✅ OTP verified — go to login
      navigate("/login");
    } catch (err) {
      setOtpError(err.response?.data || "Invalid OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    await api.post("/api/auth/resend-otp", { email: otpEmail });
    startResendTimer();
  };

  // ── Shared logo ────────────────────────────────────────────────────────────
  const Logo = () => (
    <div className="hrflow-logo">
      <div className="hrflow-logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <circle cx="9" cy="7" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="7" r="2" />
          <path d="M17 13c2.2 0 4 1.8 4 4" />
        </svg>
      </div>
      <span className="hrflow-logo-text">Rev<span>Talent</span></span>
    </div>
  );

  // ── OTP Page ───────────────────────────────────────────────────────────────
  if (page === "otp") return (
    <div className="hrflow-bg">
      <div className="hrflow-card">
        <Logo />

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "64px", height: "64px",
            background: "rgba(124,90,240,0.12)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#7c5af0" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m2 7 10 7 10-7"/>
            </svg>
          </div>
          <h1 className="hrflow-title" style={{ fontSize: "22px" }}>Verify your email</h1>
          <p className="hrflow-subtitle">
            We sent a 6-digit OTP to<br/>
            <strong style={{ color: "#5b3de8" }}>{otpEmail}</strong>
          </p>
        </div>

        {/* OTP Input */}
        <div className="hrflow-field" style={{ width: "100%" }}>
          <label className="hrflow-label">Enter OTP</label>
          <div className="hrflow-input-wrap">
            <input
              type="text"
              className="hrflow-input"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
              style={{
                textAlign: "center",
                fontSize: "24px",
                letterSpacing: "8px",
                fontWeight: "700",
              }}
            />
          </div>
        </div>

        {otpError && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            textAlign: "center",
            marginBottom: "8px",
            width: "100%",
          }}>
            {otpError}
          </div>
        )}

        <button
          className={`btn-create active`}
          onClick={handleVerifyOtp}
          disabled={otpLoading}
          style={{ opacity: otpLoading ? 0.7 : 1, width: "100%" }}
        >
          {otpLoading ? "Verifying..." : "Verify OTP →"}
        </button>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          {resendTimer > 0 ? (
            <p style={{ color: "#9b96b8", fontSize: "13px" }}>
              Resend OTP in <strong style={{ color: "#5b3de8" }}>{resendTimer}s</strong>
            </p>
          ) : (
            <button className="hrflow-signin" style={{ background: "none", border: "none",
              color: "#5b3de8", cursor: "pointer", fontSize: "13px" }}
              onClick={handleResendOtp}>
              Resend OTP
            </button>
          )}
        </div>

        <p className="hrflow-signin" style={{ marginTop: "8px" }}>
          <button style={{ background: "none", border: "none", color: "#5b3de8",
            cursor: "pointer", fontSize: "13px" }}
            onClick={() => { setPage("security"); setOtp(""); setOtpError(""); }}>
            ← Back
          </button>
        </p>
      </div>
    </div>
  );

  // ── Security Page ──────────────────────────────────────────────────────────
  return (
    <div className="hrflow-bg">
      <div className="hrflow-card">
        <Logo />

        <h1 className="hrflow-title">Set your credentials</h1>
        <p className="hrflow-subtitle">Almost done — secure your account</p>

        {/* Stepper */}
        <div className="hrflow-stepper">
          <div className="step step-done">
            <div className="step-circle done">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
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
            <svg className="hrflow-input-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            <button type="button" className="toggle-btn"
              onClick={() => setShowPass(!showPass)} tabIndex={-1}>
              {showPass ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
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
            <svg className="hrflow-input-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            <button type="button" className="toggle-btn"
              onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
              {showConfirm ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Requirements */}
        <div className="hrflow-requirements">
          <p className="req-title">Password requirements</p>
          <ul className="req-list">
            <li className={hasMinLength ? "req-item met" : "req-item"}>
              <span className="req-dot"></span>At least 8 characters
            </li>
            <li className={hasUppercase ? "req-item met" : "req-item"}>
              <span className="req-dot"></span>One uppercase letter
            </li>
            <li className={hasNumberOrSymbol ? "req-item met" : "req-item"}>
              <span className="req-dot"></span>One number or symbol
            </li>
          </ul>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            textAlign: "center",
            marginBottom: "8px",
          }}>
            {error}
          </div>
        )}

        <div className="hrflow-actions">
          <button className="btn-back" onClick={() => navigate("/register")}>← Back</button>
          <button
            className={`btn-create ${allValid && passwordsMatch ? "active" : ""}`}
            disabled={!allValid || !passwordsMatch || loading}
            onClick={handleSubmit}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating..." : "Create Account ✓"}
          </button>
        </div>

        <p className="hrflow-signin">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
}