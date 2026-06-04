import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import "../styles/LoginPage.css";
import ForgotPassword from "./ForgotPassword";

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole]             = useState("Employee");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState("login"); // login | forgot

  const roles = ["Employee", "Manager", "HR Admin"];

  const roleMap = {
    "Employee": "EMPLOYEE",
    "Manager":  "MANAGER",
    "HR Admin": "HR_ADMIN",
  };

  // ── Login → JWT directly ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("");

    // Validation
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

      const { token, role: userRole, name } = res.data;
      if (roleMap[role] !== userRole) {
        setError(`Access denied. You are not a ${role}.`);
        return;
      }

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role",  userRole);
      localStorage.setItem("name",  name);
      localStorage.setItem("user",  JSON.stringify(res.data));

      // Navigate based on role (using window.location to reset React state)
      if (userRole === "EMPLOYEE")       window.location.href = "/employee-dashboard";
      else if (userRole === "MANAGER")   window.location.href = "/managerdashboard";
      else if (userRole === "HR_ADMIN")  window.location.href = "/hr-dashboard";
      else setError("Unknown role. Contact admin.");

    } catch (err) {
      setError(err.response?.data || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared logo ────────────────────────────────────────────────────────────
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

  // ── Forgot Password page ───────────────────────────────────────────────────
  if (page === "forgot") return <ForgotPassword onBack={() => setPage("login")} />;

  // ── Login page ─────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <div className="card">
        <div 
          onClick={() => navigate("/")} 
          style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text3, #9b96b8)", fontSize: "13px", fontWeight: 500, marginBottom: "20px" }}
        >
          &larr; Back to Home
        </div>
        <Logo />

        <h1 className="heading">Welcome back</h1>
        <p className="subheading">Sign in to your RevTalent account to continue</p>

        <div className="form">

          {/* Email */}
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

          {/* Password */}
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

          {/* Role selector */}
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

          {/* Forgot Password */}
          <div className="forgot-row">
            <button
              type="button"
              className="forgot-link-btn"
              onClick={() => setPage("forgot")}
            >
              Forgot password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background   : "rgba(239,68,68,0.1)",
              border       : "1px solid rgba(239,68,68,0.3)",
              color        : "#ef4444",
              padding      : "10px 14px",
              borderRadius : "8px",
              fontSize     : "13px",
              textAlign    : "center",
              marginBottom : "4px",
            }}>
              {error}
            </div>
          )}

          {/* Sign In button */}
          <button
            type="button"
            className="signin-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In →"}
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
