import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

export default function PublicJobBoard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get(`${BASE_URL}/api/recruitment/jobs`)
      .then(r => setJobs(r.data || []))
      .catch(() => setError("Failed to load jobs"))
      .finally(() => setLoading(false));
  }, []);

  const openJobs = jobs.filter(j => j.status === "OPEN");
  const filtered = openJobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.departmentName?.toLowerCase().includes(search.toLowerCase()) ||
    j.requirements?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #1a1040, #24243e)",
      fontFamily: "'Inter', sans-serif",
      color: "#fff",
    }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, #7c5af0, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
              <rect x="13" y="2" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
              <rect x="2" y="13" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
              <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>
            Rev<span style={{ color: "#7c5af0" }}>Talent</span>
          </span>
        </div>
        <button
          onClick={() => navigate("/login")}
          style={{
            background: "linear-gradient(135deg, #7c5af0, #06b6d4)",
            color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 20px", cursor: "pointer", fontWeight: 600, fontSize: 14,
          }}>
          Employee Login
        </button>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "60px 20px 40px" }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12 }}>
          Join Our <span style={{ color: "#7c5af0" }}>Team</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, marginBottom: 32 }}>
          {openJobs.length} open position{openJobs.length !== 1 ? "s" : ""} — find your perfect role
        </p>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12, padding: "12px 18px", maxWidth: 480, margin: "0 auto",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search by role, department, skills…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: "transparent", border: "none", outline: "none",
              color: "#fff", fontSize: 15, flex: 1,
            }}
          />
        </div>
      </div>

      {/* Jobs */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 60px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.4)" }}>
            Loading jobs…
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", padding: 40, color: "#f87171" }}>{error}</div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.4)" }}>
            No open positions found.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map(j => (
            <div key={j.id} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "24px 28px",
              transition: "all 0.2s", cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,90,240,0.5)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: "#fff" }}>
                    {j.title}
                  </h3>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                    {j.departmentName && (
                      <span style={{
                        background: "rgba(124,90,240,0.15)", color: "#a78bfa",
                        padding: "3px 10px", borderRadius: 20, fontSize: 13,
                      }}>
                        {j.departmentName}
                      </span>
                    )}
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                      {j.vacancies || 1} opening{(j.vacancies || 1) > 1 ? "s" : ""}
                    </span>
                    {j.postedOn && (
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                        Posted {new Date(j.postedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                  {j.requirements && (
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 8 }}>
                      <strong style={{ color: "rgba(255,255,255,0.7)" }}>Requirements:</strong> {j.requirements}
                    </p>
                  )}
                  {j.description && (
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{j.description}</p>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/jobs/${j.id}/apply`, { state: { job: j } })}
                  style={{
                    background: "linear-gradient(135deg, #7c5af0, #06b6d4)",
                    color: "#fff", border: "none", borderRadius: 10,
                    padding: "12px 24px", cursor: "pointer",
                    fontWeight: 600, fontSize: 14, whiteSpace: "nowrap",
                  }}>
                  Apply Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}