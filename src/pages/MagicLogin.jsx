import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../components/AuthContext";

export default function MagicLogin() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { setUser } = useAuth();

  const [status, setStatus]   = useState("verifying"); // "verifying" | "success" | "error" | "register"
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false);

  // For the register flow we need to carry state forward to /register page
  const [verificationToken, setVerificationToken] = useState("");
  const [verifiedEmail, setVerifiedEmail]         = useState("");

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const params = new URLSearchParams(location.search);
    const email  = params.get("email");
    const token  = params.get("token");

    if (!email || !token) {
      setStatus("error");
      setMessage("Invalid or missing magic link parameters.");
      return;
    }

    const verify = async () => {
      try {
        const res = await api.post("/api/auth/email/verify-magic-link", { email, token });
        const data = res.data;

        if (data.verificationToken) {
          // ── Register flow: email verified, user still needs to complete profile ──
          setVerifiedEmail(email);
          setVerificationToken(data.verificationToken);
          setStatus("register");
        } else if (data.token) {
          // ── Login flow: fully authenticated, JWT returned ──
          localStorage.setItem("token", data.token);
          localStorage.setItem("role",  data.role);
          localStorage.setItem("name",  data.name);
          localStorage.setItem("user",  JSON.stringify(data));
          setUser(data);
          setStatus("success");
          setTimeout(() => {
            const r = data.role;
            if      (r === "EMPLOYEE")  navigate("/employee-dashboard");
            else if (r === "MANAGER")   navigate("/managerdashboard");
            else if (r === "HR_ADMIN")  navigate("/hr-dashboard");
            else if (r === "CANDIDATE") navigate("/candidate/dashboard");
            else navigate("/");
          }, 1500);
        } else {
          throw new Error("Unexpected response from server.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message
          || (typeof err.response?.data === "string" ? err.response.data : null)
          || "Verification failed. The link may be expired or already used."
        );
      }
    };

    verify();
  }, [location, navigate, setUser]);

  const handleContinueToRegister = () => {
    // Pass verification state to the register page via location state
    navigate("/register", { state: { emailVerified: true, email: verifiedEmail, verificationToken } });
  };

  // ── shared card shell ─────────────────────────────────────────────────────
  const Card = ({ children }) => (
    <div style={{
      display: "flex", height: "100vh", alignItems: "center", justifyContent: "center",
      flexDirection: "column", background: "linear-gradient(135deg, #0f0c1a 0%, #1a1030 100%)",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)",
        padding: "40px 36px", borderRadius: "20px",
        border: "1px solid rgba(124,90,240,0.2)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)", textAlign: "center",
        maxWidth: "420px", width: "90%",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
          gap: "8px", marginBottom: "24px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg,#7c5af0,#5b3de8)", display: "flex",
            alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2"  y="2"  width="9" height="9" rx="2" fill="white" opacity="0.9" />
              <rect x="13" y="2"  width="9" height="9" rx="2" fill="white" opacity="0.6" />
              <rect x="2"  y="13" width="9" height="9" rx="2" fill="white" opacity="0.6" />
              <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9" />
            </svg>
          </div>
          <span style={{ fontWeight: "700", fontSize: "18px", color: "#e2deff" }}>
            Rev<span style={{ color: "#7c5af0" }}>Talent</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  );

  // ── verifying spinner ─────────────────────────────────────────────────────
  if (status === "verifying") return (
    <Card>
      <div style={{ marginBottom: "16px" }}>
        <svg viewBox="0 0 50 50" style={{
          width: "44px", height: "44px", margin: "0 auto", display: "block",
          animation: "spin 1s linear infinite",
        }}>
          <circle cx="25" cy="25" r="20" fill="none" stroke="#7c5af0"
            strokeWidth="4" strokeLinecap="round" strokeDasharray="90 150" />
        </svg>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
      <h2 style={{ margin: "0 0 8px", color: "#e2deff", fontSize: "20px" }}>Verifying your link</h2>
      <p style={{ margin: 0, color: "#8b85b0", fontSize: "14px" }}>Please wait a moment…</p>
    </Card>
  );

  // ── success ───────────────────────────────────────────────────────────────
  if (status === "success") return (
    <Card>
      <div style={{
        width: "56px", height: "56px", borderRadius: "50%",
        background: "rgba(124,90,240,0.15)", border: "2px solid rgba(124,90,240,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M8 12.5l3 3 5-5.5" stroke="#7c5af0" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{ margin: "0 0 8px", color: "#e2deff", fontSize: "20px" }}>Signed in!</h2>
      <p style={{ margin: 0, color: "#8b85b0", fontSize: "14px" }}>Redirecting you now…</p>
    </Card>
  );

  // ── register — email verified, complete profile ───────────────────────────
  if (status === "register") return (
    <Card>
      <div style={{
        width: "56px", height: "56px", borderRadius: "50%",
        background: "rgba(124,90,240,0.15)", border: "2px solid rgba(124,90,240,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c5af0" strokeWidth="1.8">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <h2 style={{ margin: "0 0 8px", color: "#e2deff", fontSize: "20px" }}>Email verified!</h2>
      <p style={{ margin: "0 0 20px", color: "#8b85b0", fontSize: "14px" }}>
        One last step — complete your profile to finish setting up your account.
      </p>
      <button onClick={handleContinueToRegister} style={{
        width: "100%", padding: "13px", background: "linear-gradient(135deg,#7c5af0,#5b3de8)",
        color: "white", border: "none", borderRadius: "10px", fontWeight: "600",
        fontSize: "15px", cursor: "pointer",
      }}>
        Complete Profile →
      </button>
    </Card>
  );

  // ── error ─────────────────────────────────────────────────────────────────
  return (
    <Card>
      <div style={{
        width: "56px", height: "56px", borderRadius: "50%",
        background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2 style={{ margin: "0 0 8px", color: "#e2deff", fontSize: "20px" }}>Link invalid</h2>
      <p style={{ margin: "0 0 20px", color: "#8b85b0", fontSize: "14px" }}>{message}</p>
      <button onClick={() => navigate("/login")} style={{
        width: "100%", padding: "13px", background: "linear-gradient(135deg,#7c5af0,#5b3de8)",
        color: "white", border: "none", borderRadius: "10px", fontWeight: "600",
        fontSize: "15px", cursor: "pointer",
      }}>
        Return to Login
      </button>
    </Card>
  );
}