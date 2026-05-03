import React, { useState } from "react";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await login(form); } catch {}
  };

  return (
    <div className="hr-login-page">
      <div className="hr-login-card">
        <div className="hr-login-logo">
          <div className="hr-logo-icon-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="2"  y="2"  width="9" height="9" rx="2" fill="white" opacity="0.9"/>
              <rect x="13" y="2"  width="9" height="9" rx="2" fill="white" opacity="0.6"/>
              <rect x="2"  y="13" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
              <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span className="hr-login-brand">Rev<span>Talent</span></span>
        </div>
        <h2 className="hr-login-title">Welcome back</h2>
        <p className="hr-login-sub">Sign in to your HR dashboard</p>

        {error && <div className="hr-login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="hr-login-form">
          <div className="hr-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="hr-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="hr-primary-btn w-100" disabled={loading}>
            {loading ? <span className="hr-spinner-sm"/> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
