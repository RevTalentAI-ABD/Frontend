import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import "../styles/LoginPage.css";
import ForgotPassword from "./ForgotPassword";
import { useAuth } from "../components/AuthContext";

// ─── tiny OTP box component (6 inputs, paste support) ────────────────────────
function OtpBoxes({ value, onChange }) {
  const inputs = useRef([]);
  const digits = (value + "      ").slice(0, 6).split("");

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = value.slice(0, i) + " " + value.slice(i + 1);
      onChange(next.trimEnd());
      if (i > 0) inputs.current[i - 1]?.focus();
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) { inputs.current[i - 1]?.focus(); return; }
    if (e.key === "ArrowRight" && i < 5) { inputs.current[i + 1]?.focus(); return; }
  };

  const handleChange = (i, e) => {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    if (!ch) return;
    const arr = (value.padEnd(6)).split("");
    arr[i] = ch;
    onChange(arr.join("").slice(0, 6));
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) { onChange(text); inputs.current[5]?.focus(); }
    e.preventDefault();
  };

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "16px 0" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: "44px", height: "52px", textAlign: "center", fontSize: "22px",
            fontWeight: "700", border: "2px solid",
            borderColor: d.trim() ? "#7c5af0" : "rgba(124,90,240,0.25)",
            borderRadius: "10px", background: d.trim() ? "rgba(124,90,240,0.08)" : "rgba(255,255,255,0.05)",
            color: "#e2deff", outline: "none", transition: "border-color .15s, background .15s",
            caretColor: "#7c5af0",
          }}
        />
      ))}
    </div>
  );
}

// ─── resend timer ─────────────────────────────────────────────────────────────
function ResendTimer({ onResend, loading }) {
  const [secs, setSecs] = useState(30);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  const handleResend = () => { setSecs(30); onResend(); };
  return (
    <div style={{ textAlign: "center", fontSize: "13px", color: "#a09cc0", marginTop: "8px" }}>
      {secs > 0
        ? <>Resend code in <strong style={{ color: "#7c5af0" }}>{secs}s</strong></>
        : <button onClick={handleResend} disabled={loading}
            style={{ background: "none", border: "none", color: "#7c5af0", cursor: "pointer",
              fontWeight: "600", fontSize: "13px", padding: 0 }}>
            Resend OTP
          </button>
      }
    </div>
  );
}

export default function LoginPage() {
  const navigate  = useNavigate();
  const { setUser } = useAuth();

  const [role, setRole]         = useState("Employee");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // page: "login" | "forgot" | "email-method" | "otp" | "magic-sent"
  const [page, setPage]         = useState("login");
  const [emailMethod, setEmailMethod] = useState(""); // "otp" | "magic"
  const [emailInput, setEmailInput]   = useState("");
  const [otp, setOtp]                 = useState("");

  const roles   = ["Employee", "Manager", "HR Admin"];
  const roleMap = { "Employee": "EMPLOYEE", "Manager": "MANAGER", "HR Admin": "HR_ADMIN" };

  const normalizeRole = (r) =>
    (r || "").toUpperCase().trim().replace(/\s+/g, "_").replace("HRADMIN", "HR_ADMIN");

  const saveAndNavigate = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role",  data.role);
    localStorage.setItem("name",  data.name);
    localStorage.setItem("user",  JSON.stringify(data));
    setUser(data);
    const r = data.role;
    if (r === "EMPLOYEE")      navigate("/employee-dashboard");
    else if (r === "MANAGER")  navigate("/managerdashboard");
    else if (r === "HR_ADMIN") navigate("/hr-dashboard");
    else if (r === "CANDIDATE") navigate("/candidate/dashboard");
    else setError("Unknown role. Contact admin.");
  };

  // ── Password login ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please enter email and password."); return; }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { username: email, password });
      const { role: userRole } = res.data;
      if (normalizeRole(roleMap[role]) !== normalizeRole(userRole)) {
        setError(`Access denied. You are not a ${role}.`);
        return;
      }
      saveAndNavigate(res.data);
    } catch (err) {
      setError(err.response?.data?.message
        || (typeof err.response?.data === "string" ? err.response?.data : "Invalid credentials."));
    } finally {
      setLoading(false);
    }
  };

  // ── "Continue with Email" clicked → go to method chooser ───────────────────
  const handleContinueWithEmail = () => {
    setEmailInput("");
    setOtp("");
    setError("");
    setPage("email-method");
  };

  // ── Method chosen → send OTP or magic link ──────────────────────────────────
  const handleSendEmailAuth = async (method) => {
    setError("");
    if (!emailInput.trim()) { setError("Please enter your email."); return; }
    setEmailMethod(method);
    setLoading(true);
    try {
      if (method === "otp") {
        await api.post("/api/auth/email/send-otp", { email: emailInput, type: "login" });
        setPage("otp");
      } else {
        await api.post("/api/auth/email/send-magic-link", { email: emailInput, type: "login" });
        setPage("magic-sent");
      }
    } catch (err) {
      setError(err.response?.data?.message
        || (typeof err.response?.data === "string" ? err.response?.data : "Failed to send. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    setError("");
    if (otp.replace(/\s/g, "").length !== 6) { setError("Please enter the complete 6-digit code."); return; }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/email/verify-otp", {
        email: emailInput, otp: otp.replace(/\s/g, ""), type: "login",
      });
      if (normalizeRole(roleMap[role]) !== normalizeRole(res.data.role)) {
        setError(`Access denied. You are not a ${role}.`);
        return;
      }
      saveAndNavigate(res.data);
    } catch (err) {
      setError(err.response?.data?.message
        || (typeof err.response?.data === "string" ? err.response?.data : "Invalid OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    try {
      await api.post("/api/auth/email/send-otp", { email: emailInput, type: "login" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  // ── Shared logo ─────────────────────────────────────────────────────────────
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

  const BackBtn = ({ to, label = "Back" }) => (
    <button className="fp-back-btn" style={{ marginTop: "10px" }}
      onClick={() => { setError(""); setOtp(""); setPage(to); }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );

  // ── Router ──────────────────────────────────────────────────────────────────
  if (page === "forgot") return <ForgotPassword onBack={() => setPage("login")} />;

  // ── "email-method" — enter email + choose OTP or Magic Link ────────────────
  if (page === "email-method") return (
    <div className="page-wrapper">
      <div className="bg-blob blob-1" /><div className="bg-blob blob-2" /><div className="bg-blob blob-3" />
      <div className="card">
        <Logo />
        <h1 className="heading" style={{ fontSize: "22px" }}>Continue with Email</h1>
        <p className="subheading">Enter your email, then choose how to verify.</p>

        <div className="form">
          <div className="field-group">
            <label className="field-label">Work Email</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                </svg>
              </span>
              <input type="email" className="input-field" placeholder="you@company.com"
                value={emailInput} onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendEmailAuth("otp")} />
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
            <button type="button" className="signin-btn" disabled={loading}
              onClick={() => handleSendEmailAuth("otp")}>
              {loading && emailMethod === "otp" ? "Sending..." : "Send OTP Code →"}
            </button>
            <button type="button" className="google-btn" disabled={loading}
              onClick={() => handleSendEmailAuth("magic")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {loading && emailMethod === "magic" ? "Sending..." : "Send Magic Link"}
            </button>
          </div>
        </div>
        <BackBtn to="login" label="Back to Sign In" />
      </div>
    </div>
  );

  // ── "otp" — animated OTP boxes + timer ─────────────────────────────────────
  if (page === "otp") return (
    <div className="page-wrapper">
      <div className="bg-blob blob-1" /><div className="bg-blob blob-2" /><div className="bg-blob blob-3" />
      <div className="card">
        <Logo />
        <div className="fp-icon-wrap" style={{ margin: "0 auto 12px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c5af0" strokeWidth="1.8">
            <rect x="5" y="2" width="14" height="20" rx="2"/>
            <path d="M12 18h.01"/>
          </svg>
        </div>
        <h1 className="heading" style={{ fontSize: "22px" }}>Enter OTP</h1>
        <p className="subheading">
          A 6-digit code was sent to<br />
          <strong style={{ color: "#c4b8ff" }}>{emailInput}</strong>
        </p>

        <OtpBoxes value={otp} onChange={setOtp} />
        <ResendTimer onResend={handleResendOtp} loading={loading} />

        {error && <div className="error-box" style={{ marginTop: "12px" }}>{error}</div>}

        <button className="signin-btn" style={{ marginTop: "16px" }}
          onClick={handleVerifyOtp} disabled={loading || otp.replace(/\s/g,"").length < 6}>
          {loading ? "Verifying..." : "Verify & Sign In →"}
        </button>
        <BackBtn to="email-method" label="Back" />
      </div>
    </div>
  );

  // ── "magic-sent" — check inbox screen ──────────────────────────────────────
  if (page === "magic-sent") return (
    <div className="page-wrapper">
      <div className="bg-blob blob-1" /><div className="bg-blob blob-2" /><div className="bg-blob blob-3" />
      <div className="card" style={{ textAlign: "center" }}>
        <Logo />
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "rgba(124,90,240,0.12)", border: "2px solid rgba(124,90,240,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7c5af0" strokeWidth="1.8">
            <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
          </svg>
        </div>
        <h1 className="heading" style={{ fontSize: "22px" }}>Check your inbox</h1>
        <p className="subheading">
          We sent a magic link to<br />
          <strong style={{ color: "#c4b8ff" }}>{emailInput}</strong>
        </p>
        <div style={{
          background: "rgba(124,90,240,0.08)", border: "1px solid rgba(124,90,240,0.2)",
          borderRadius: "10px", padding: "14px 16px", margin: "16px 0", fontSize: "13px", color: "#a09cc0",
          textAlign: "left", lineHeight: "1.6",
        }}>
          <strong style={{ color: "#c4b8ff" }}>What happens next?</strong><br />
          1. Open the email from RevTalent<br />
          2. Click the magic link button<br />
          3. You'll be signed in automatically
        </div>
        {error && <div className="error-box">{error}</div>}
        <button className="fp-back-btn" style={{ marginTop: "6px", justifyContent: "center" }}
          onClick={() => { setError(""); setPage("email-method"); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Try a different email
        </button>
      </div>
    </div>
  );

  // ── Main login page ─────────────────────────────────────────────────────────
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
          {/* Email */}
          <div className="field-group">
            <label className="field-label">Work Email</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                </svg>
              </span>
              <input type="email" className="input-field" placeholder="you@company.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input type={showPassword ? "text" : "password"} className="input-field"
                placeholder="Enter your password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="role-row">
            <div className="role-group">
              <label className="field-label">Sign in as</label>
              <div className="role-tabs">
                {roles.map(r => (
                  <button key={r} type="button"
                    className={`role-tab ${role === r ? "active" : ""}`}
                    onClick={() => setRole(r)}>{r}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Forgot */}
          <div className="forgot-row">
            <button type="button" className="forgot-link-btn" onClick={() => setPage("forgot")}>
              Forgot password?
            </button>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444", padding: "10px 14px", borderRadius: "8px",
              fontSize: "13px", textAlign: "center", marginBottom: "4px",
            }}>{error}</div>
          )}

          <button type="button" className="signin-btn" onClick={handleSubmit}
            disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">or continue with</span>
            <span className="divider-line" />
          </div>

          <button type="button" className="google-btn" onClick={handleContinueWithEmail}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Continue with Email
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