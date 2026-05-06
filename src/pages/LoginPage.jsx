import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import "../styles/LoginPage.css";
import ForgotPassword from "./ForgotPassword";

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("login"); // login, otp, forgot

  const [otpEmail, setOtpEmail]     = useState("");
  const [otpRole, setOtpRole]       = useState("");
  const [otpName, setOtpName]       = useState("");
  const [otp, setOtp]               = useState("");
  const [otpError, setOtpError]     = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const roles = ["Employee", "Manager", "HR Admin"];

  // ─── Resend timer ────────────────────────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        username: email,
        password: password,
      });

      const roleMap = {
        "Employee": "EMPLOYEE",
        "Manager":  "MANAGER",
        "HR Admin": "HR_ADMIN",
      };

      // ✅ Check role matches what user selected
      if (roleMap[role] !== res.data.role) {
        setError(`Access denied. You are not a ${role}.`);
        return;
      }

      // ✅ Store for OTP verification
      setOtpEmail(res.data.email);   // ← from backend response
      setOtpRole(res.data.role);
      setOtpName(res.data.name);
      setPage("otp");
      startResendTimer();

    } catch (err) {
      console.log("Login error:", err.response?.data); // debug
      setError(err.response?.data || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    setOtpError("");
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await api.post("/api/auth/verify-otp", {
        email: otpEmail,
        otp: otp,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role);
      localStorage.setItem("name",  res.data.name);

      if (res.data.role === "EMPLOYEE")      navigate("/employee-dashboard");
      else if (res.data.role === "MANAGER")  navigate("/manager-dashboard");
      else if (res.data.role === "HR_ADMIN") navigate("/hr-dashboard");
    } catch (err) {
      setOtpError(err.response?.data || "Invalid OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── Resend OTP ───────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    await api.post("/api/auth/resend-otp", { email: otpEmail });
    startResendTimer();
  };

  // ─── Shared logo block ────────────────────────────────────────────────────────
  const Logo = () => (
    <div className="logo">
      <div className="logo-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="2"  y="2"  width="9" height="9" rx="2" fill="white" opacity="0.9" />
          <rect x="13" y="2"  width="9" height="9" rx="2" fill="white" opacity="0.6" />
          <rect x="2"  y="13" width="9" height="9" rx="2" fill="white" opacity="0.6" />
          <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9" />
        </svg>
      </div>
      <span className="logo-text">Rev<span className="logo-accent">Talent</span></span>
    </div>
  );

  // ─── Forgot Password page ────────────────────────────────────────────────────
  if (page === "forgot") return <ForgotPassword onBack={() => setPage("login")} />;

  // ─── OTP page ─────────────────────────────────────────────────────────────────
  if (page === "otp") return (
    <div className="page-wrapper">
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <div className="card">
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
          <h1 className="heading" style={{ fontSize: "22px" }}>Check your email</h1>
          <p className="subheading">
            We sent a 6-digit OTP to<br/>
            <strong style={{ color: "#5b3de8" }}>{otpEmail}</strong>
          </p>
        </div>

        <div className="field-group" style={{ width: "100%" }}>
          <label className="field-label">Enter OTP</label>
          <input
            type="text"
            className="input-field"
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
          className="signin-btn"
          onClick={handleVerifyOtp}
          disabled={otpLoading}
          style={{ opacity: otpLoading ? 0.7 : 1 }}
        >
          {otpLoading ? "Verifying..." : "Verify OTP →"}
        </button>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          {resendTimer > 0 ? (
            <p style={{ color: "#9b96b8", fontSize: "13px" }}>
              Resend OTP in <strong style={{ color: "#5b3de8" }}>{resendTimer}s</strong>
            </p>
          ) : (
            <button className="forgot-link-btn" onClick={handleResendOtp}>
              Resend OTP
            </button>
          )}
        </div>

        <button
          className="forgot-link-btn"
          style={{ marginTop: "8px" }}
          onClick={() => { setPage("login"); setOtp(""); setOtpError(""); }}
        >
          ← Back to Sign In
        </button>
      </div>
    </div>
  );

  // ─── Login page ───────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <div className="card">
        <Logo />

        <h1 className="heading">Welcome back</h1>
        <p className="subheading">Sign in to your RevTalent account to continue</p>

        <div className="form">
          <div className="field-group">
            <label className="field-label">Work Email</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 7 10-7" />
                </svg>
              </span>
              <input
                type="email"
                className="input-field"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="role-row">
            <div className="role-group">
              <label className="field-label">Sign in as</label>
              <div className="role-tabs">
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`role-tab ${role === r ? "active" : ""}`}
                    onClick={() => setRole(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="forgot-row">
            <button
              type="button"
              className="forgot-link-btn"
              onClick={() => setPage("forgot")}
            >
              Forgot password?
            </button>
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
              marginBottom: "4px",
            }}>
              {error}
            </div>
          )}

          <button
            type="button"
            className="signin-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">or continue with</span>
            <span className="divider-line" />
          </div>

          <button type="button" className="google-btn">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="footer-text">
          Don't have an account?{" "}
          <a href="/register" className="create-link">Create one</a>
        </p>
      </div>
    </div>
  );
}