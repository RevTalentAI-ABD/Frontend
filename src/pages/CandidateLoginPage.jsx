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

      if ((role || "").toUpperCase() !== "CANDIDATE") {
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

  const handleMagicLinkLogin = async () => {
    const magicEmail = prompt("Enter your Email to receive a Magic Link:");
    if (!magicEmail) return;

    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/magic-link-request", { email: magicEmail });
      alert(res.data || "Magic link sent! Check your console (or email inbox) for the link.");
    } catch (err) {
      setError(err.response?.data?.message || (typeof err.response?.data === "string" ? err.response?.data : "Failed to send magic link."));
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

          <button type="button" className="cl-btn-google" onClick={handleMagicLinkLogin}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: "8px"}}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Continue with Email
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