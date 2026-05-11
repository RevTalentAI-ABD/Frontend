import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import "../styles/CandidateLoginPage.css";

export default function CandidateLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        username: email,
        password: password,
      });

      const { token, role, name } = res.data;

      if (role !== "CANDIDATE") {
        setError("This login is for candidates only. Please use the employee login.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role",  role);
      localStorage.setItem("name",  name);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("user",  JSON.stringify(res.data));

      navigate("/candidate/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cl-bg">
      <div className="cl-blob cl-blob--a" />
      <div className="cl-blob cl-blob--b" />

      <div className="cl-card">
        {/* Logo */}
        <div className="cl-logo">
          <div className="cl-logo-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="white" strokeWidth="2" />
              <path d="M7 11l3 3 5-5" stroke="white" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="cl-logo-text">RevTalent</span>
        </div>

        <h1 className="cl-heading">Welcome back</h1>
        <p className="cl-subheading">Sign in to your candidate account to continue</p>

        <form className="cl-form" onSubmit={handleSignIn}>
          {error && <div className="cl-error">{error}</div>}

          {/* Email */}
          <div className="cl-field">
            <label className="cl-label">Email</label>
            <div className="cl-input-wrap">
              <svg className="cl-input-icon" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                className="cl-input"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="cl-field">
            <label className="cl-label">Password</label>
            <div className="cl-input-wrap">
              <svg className="cl-input-icon" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                className="cl-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="cl-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="cl-row-forgot">
            <span className="cl-forgot" onClick={() => navigate("/forgot-password")} style={{ cursor: "pointer" }}>
  Forgot password?
</span>
          </div>

          <button
            type="submit"
            className={`cl-btn-primary${loading ? " cl-btn--loading" : ""}`}
            disabled={loading}
          >
            {loading ? <span className="cl-spinner" /> : <>Sign In &rarr;</>}
          </button>

          <div className="cl-divider"><span>or continue with</span></div>

          <button type="button" className="cl-btn-google">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.7 29.3 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.4-4z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.5 5.1 29.5 3 24 3 16.3 3 9.6 7.9 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.2 0 10-1.9 13.6-5.1l-6.3-5.2C29.3 36.2 26.8 37 24 37c-5.3 0-9.6-3.3-11.3-8H6.2C9.5 37.8 16.2 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.3 5.2C41.3 35.4 44 30 44 24c0-1.3-.1-2.7-.4-4z" />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="cl-signup-link">
          Don't have an account?{" "}
          <a href="/candidate-register" className="cl-link">Create one</a>
        </p>
      </div>
    </div>
  );
}