import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const [role, setRole] = useState("Employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const roles = ["Employee", "Manager", "HR Admin"];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    console.log({
      email,
      password,
      role,
    });

    alert("Login Successful ✅");
  };

  return (
    <div className="page-wrapper">
      {/* Background Grid */}
      <div className="bg-grid"></div>

      <div className="card">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">👥</div>
          <span className="logo-text">
            Rev<span className="logo-accent">Talent</span>
          </span>
        </div>

        {/* Heading */}
        <h1 className="heading">Welcome back</h1>
        <p className="subheading">
          Sign in to your RevTalent account to continue
        </p>

        {/* FORM */}
        <form className="form" onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="field-group">
            <label className="field-label">Work Email</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                className="input-field"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Toggle Password */}
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* ROLE */}
          <div className="field-group">
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

          {/* FORGOT PASSWORD */}
          <div className="forgot-row">
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          {/* SIGN IN BUTTON */}
          <button type="submit" className="signin-btn">
            Sign In →
          </button>

          {/* DIVIDER */}
          <div className="divider">
            <span className="line"></span>
            <p>or continue with</p>
            <span className="line"></span>
          </div>

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            className="google-btn"
            onClick={() => alert("Google login coming soon")}
          >
            <div className="google-dot"></div>
            Continue with Google
          </button>
        </form>

        {/* FOOTER */}
        <p className="footer-text">
          Don't have an account?{" "}
          <span className="create-link">Create one</span>
        </p>
      </div>
    </div>
  );
}