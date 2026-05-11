import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/PublicJobBoard.css";

const BASE_URL = "http://localhost:8080";

export default function PublicJobBoard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null); // job that triggered modal
  const [showModal, setShowModal] = useState(false);

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

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleLogin = () => {
    setShowModal(false);
    navigate("/candidate-login", { state: { redirectJob: selectedJob } });
  };

  const handleRegister = () => {
  setShowModal(false);
  navigate("/candidate-register", { state: { redirectJob: selectedJob } });
};

  return (
    <div className="jb-root">

      {/* ── NAVBAR ── */}
      <nav className="jb-nav">
        <div className="jb-logo" onClick={() => navigate("/")}>
          <div className="jb-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
              <rect x="13" y="2" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
              <rect x="2" y="13" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
              <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span className="jb-logo-text">Rev<span className="jb-logo-accent">Talent</span></span>
        </div>

        <div className="jb-nav-links">
          <a href="/">Home</a>
          <a href="/jobs" className="active">Jobs</a>
          
        </div>

        <button className="jb-emp-login" onClick={() => navigate("/candidate-login")}>
          Candidate Login
        </button>
      </nav>

      {/* ── HERO ── */}
      <div className="jb-hero">
        <div className="jb-hero-badge">✦ We're hiring</div>
        <h1 className="jb-hero-title">
          Explore <span>Open Roles</span>
        </h1>
        <p className="jb-hero-sub">
          {openJobs.length} open position{openJobs.length !== 1 ? "s" : ""} across our teams — find where you belong
        </p>

        <div className="jb-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search by role, department, skills…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── JOB CARDS ── */}
      <div className="jb-list">
        {loading && <div className="jb-state">Loading jobs…</div>}
        {error && <div className="jb-state jb-error">{error}</div>}
        {!loading && filtered.length === 0 && (
          <div className="jb-state">No open positions found.</div>
        )}

        {filtered.map(j => (
          <div key={j.id} className="jb-card">
            <div className="jb-card-body">
              <h3 className="jb-card-title">{j.title}</h3>

              <div className="jb-card-meta">
                {j.departmentName && (
                  <span className="jb-tag">{j.departmentName}</span>
                )}
                <span className="jb-meta-text">
                  {j.vacancies || 1} opening{(j.vacancies || 1) > 1 ? "s" : ""}
                </span>
                {j.postedOn && (
                  <span className="jb-meta-text">
                    Posted {new Date(j.postedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>

              {j.requirements && (
                <p className="jb-req">
                  <strong>Requirements:</strong> {j.requirements}
                </p>
              )}
              {j.description && (
                <p className="jb-desc">{j.description}</p>
              )}
            </div>

            <button className="jb-apply-btn" onClick={() => handleApplyClick(j)}>
              Apply Now →
            </button>
          </div>
        ))}
      </div>

      {/* ── AUTH MODAL ── */}
      {showModal && (
        <div className="jb-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="jb-modal" onClick={e => e.stopPropagation()}>
            <button className="jb-modal-close" onClick={() => setShowModal(false)}>✕</button>

            <div className="jb-modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
                <rect x="13" y="2" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
                <rect x="2" y="13" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
                <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
              </svg>
            </div>

            <h2 className="jb-modal-title">Ready to Apply?</h2>
            <p className="jb-modal-job">
              {selectedJob?.title}
              {selectedJob?.departmentName && (
                <span className="jb-modal-dept"> · {selectedJob.departmentName}</span>
              )}
            </p>
            <p className="jb-modal-sub">
              Create a free account to submit your application, or log in if you've applied before.
            </p>

            <div className="jb-modal-actions">
              <button className="jb-modal-register" onClick={handleRegister}>
                Create Account
              </button>
              <button className="jb-modal-login" onClick={handleLogin}>
                Log In
              </button>
            </div>

            <p className="jb-modal-note">
              Already an employee? Use <span onClick={handleLogin}>Employee Login</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}