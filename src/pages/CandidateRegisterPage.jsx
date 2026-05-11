import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CandidateRegisterPage.css";

const BASE_URL = "http://localhost:8080";

export default function CandidateRegisterPage() {
  const navigate = useNavigate();

  // ── Pages: "register" | "otp" ──────────────────────────────────────────────
  const [page, setPage] = useState("register");

  // ── Register form state ────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  // ── OTP state ──────────────────────────────────────────────────────────────
  const [otp, setOtp]                 = useState("");
  const [otpError, setOtpError]       = useState("");
  const [otpLoading, setOtpLoading]   = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthScore  = getStrength(form.password);
  const strengthColors = ["#e2dff0", "#f87171", "#fbbf24", "#34d399", "#7c3aed"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const passwordsMatch    = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  // ── Resend-OTP countdown ───────────────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  // ── Step 1: Register → trigger OTP ────────────────────────────────────────
  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword } = form;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setRegisterError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }
    if (strengthScore < 2) {
      setRegisterError("Please choose a stronger password.");
      return;
    }

    setRegisterError("");
    setRegisterLoading(true);

    try {
      // 1 — Create candidate account
      await axios.post(`${BASE_URL}/api/auth/register`, {
  name:       `${firstName} ${lastName}`,
  username:   email,
  email:      email,
  password:   password,
  role:       "CANDIDATE",
  department: "NA",
});

     
      await axios.post(`${BASE_URL}/api/auth/resend-otp`, { email });

      // 3 — Move to OTP page
      setPage("otp");
      startResendTimer();

    } catch (err) {
      setRegisterError(
        err.response?.data?.message ||
        err.response?.data ||
        "Registration failed. Please try again."
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }

    setOtpError("");
    setOtpLoading(true);

    try {
      await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        email: form.email,
        otp:   otp,
      });

      // OTP verified — go to candidate login
      navigate("/candidate-login");

    } catch (err) {
      setOtpError(
        err.response?.data?.message ||
        err.response?.data ||
        "Invalid OTP. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Step 2: Resend OTP ─────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/resend-otp`, { email: form.email });
      startResendTimer();
      setOtpError("");
    } catch {
      setOtpError("Failed to resend OTP. Please try again.");
    }
  };

  // ── Shared icons ───────────────────────────────────────────────────────────
  const EyeIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  // ── Shared brand header ────────────────────────────────────────────────────
  const Brand = () => (
    <div className="crp-brand">
      <div className="crp-brand-icon">
        <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      </div>
      <span className="crp-brand-name">
        Rev<span className="crp-brand-accent">Talent</span>
      </span>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // OTP PAGE
  // ══════════════════════════════════════════════════════════════════════════
  if (page === "otp") {
    return (
      <div className="crp-bg">
        <div className="crp-card">
          <Brand />

          {/* Icon + heading */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{
              width: "64px", height: "64px",
              background: "rgba(124,58,237,0.1)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7 10-7" />
              </svg>
            </div>
            <h1 className="crp-title">Verify your email</h1>
            <p className="crp-subtitle">
              We sent a 6-digit OTP to<br />
              <strong style={{ color: "#7c3aed" }}>{form.email}</strong>
            </p>
          </div>

          {/* OTP input */}
          <div className="crp-field">
            <label>Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="• • • • • •"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              style={{
                textAlign: "center",
                fontSize: "22px",
                letterSpacing: "10px",
                fontWeight: "700",
              }}
            />
          </div>

          {/* OTP error */}
          {otpError && (
            <div style={{
              background: "rgba(248,113,113,0.1)",
              border: "1.5px solid rgba(248,113,113,0.35)",
              color: "#ef4444",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              textAlign: "center",
              marginBottom: "12px",
            }}>
              {otpError}
            </div>
          )}

          {/* Verify button */}
          <button
            className="crp-btn"
            onClick={handleVerifyOtp}
            disabled={otpLoading}
            style={{ opacity: otpLoading ? 0.7 : 1, cursor: otpLoading ? "not-allowed" : "pointer" }}
          >
            {otpLoading ? "Verifying…" : "Verify OTP →"}
          </button>

          {/* Resend timer */}
          <div style={{ textAlign: "center", marginTop: "14px" }}>
            {resendTimer > 0 ? (
              <p style={{ color: "#9b96b8", fontSize: "13px" }}>
                Resend OTP in{" "}
                <strong style={{ color: "#7c3aed" }}>{resendTimer}s</strong>
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                style={{
                  background: "none", border: "none",
                  color: "#7c3aed", cursor: "pointer",
                  fontSize: "13px", fontWeight: "600",
                }}
              >
                Resend OTP
              </button>
            )}
          </div>

          {/* Back link */}
          <p className="crp-signin" style={{ marginTop: "10px" }}>
            <button
              onClick={() => { setPage("register"); setOtp(""); setOtpError(""); }}
              style={{
                background: "none", border: "none",
                color: "#7c3aed", cursor: "pointer",
                fontSize: "12.5px", fontWeight: "600",
              }}
            >
              ← Back to registration
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // REGISTER PAGE
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="crp-bg">
      <div className="crp-card">
        <Brand />

        <h1 className="crp-title">Create your account</h1>
        <p className="crp-subtitle">Join RevTalent and find your next opportunity</p>

        {/* Name row */}
        <div className="crp-row">
          <div className="crp-field">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="Aditya"
              value={form.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="crp-field">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Kumar"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Email */}
        <div className="crp-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="crp-field">
          <label>Password</label>
          <div className="crp-input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
            />
            <button className="crp-eye" type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {form.password.length > 0 && (
            <div className="crp-strength">
              <div className="crp-strength-bar">
                <div
                  className="crp-strength-fill"
                  style={{
                    width: `${(strengthScore / 4) * 100}%`,
                    background: strengthColors[strengthScore],
                  }}
                />
              </div>
              <span className="crp-strength-label" style={{ color: strengthColors[strengthScore] }}>
                {strengthLabels[strengthScore]}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="crp-field">
          <label>Confirm Password</label>
          <div className="crp-input-wrap">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={
                passwordsMatch ? "crp-input-valid" :
                passwordsMismatch ? "crp-input-invalid" : ""
              }
            />
            <button className="crp-eye" type="button" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {passwordsMatch    && <p className="crp-hint crp-hint--match">✓ Passwords match</p>}
          {passwordsMismatch && <p className="crp-hint crp-hint--mismatch">✗ Passwords do not match</p>}
        </div>

        {/* Register error */}
        {registerError && (
          <div style={{
            background: "rgba(248,113,113,0.1)",
            border: "1.5px solid rgba(248,113,113,0.35)",
            color: "#ef4444",
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "13px",
            textAlign: "center",
            marginBottom: "8px",
          }}>
            {registerError}
          </div>
        )}

        {/* Register button */}
        <button
          className="crp-btn"
          onClick={handleRegister}
          disabled={registerLoading}
          style={{ opacity: registerLoading ? 0.7 : 1, cursor: registerLoading ? "not-allowed" : "pointer" }}
        >
          {registerLoading ? "Creating account…" : "Register →"}
        </button>

        {/* Sign in link — fixed from href="#" */}
        <p className="crp-signin">
          Already have an account?{" "}
          <a href="/candidate-login">Sign in</a>
        </p>
      </div>
    </div>
  );
}