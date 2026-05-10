import { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// ── Robust error message extractor ─────────────────────────────────────────
const extractErrorMessage = (e) => {
  const status = e.response?.status;
  const data   = e.response?.data;

  // Pull the actual text out of whatever shape the backend returns
  const raw =
    typeof data === "string"
      ? data
      : data?.message || data?.error || data?.detail || JSON.stringify(data) || "";

  const lower = raw.toLowerCase();

  // 409 Conflict → already applied
  if (status === 409) {
    return "You have already applied for this position.";
  }

  // Any response body that mentions "already"
  if (lower.includes("already")) {
    return "You have already applied for this position.";
  }

  // Other known keywords
  if (lower.includes("duplicate"))  return "You have already applied for this position.";
  if (lower.includes("exists"))     return "You have already applied for this position.";
  if (lower.includes("not found"))  return "Job no longer available. Please refresh the page.";
  if (lower.includes("unauthoriz") || lower.includes("forbidden")) {
    return "Session expired. Please log in again.";
  }

  // Fall back to whatever the backend said, or a generic message
  return raw || "Submission failed. Please try again.";
};

export default function CandidateOpenPositions() {
  const [jobs,        setJobs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");

  const [applyingTo,  setApplyingTo]  = useState(null);
  const [resume,      setResume]      = useState(null);
  const [resumeName,  setResumeName]  = useState("");
  const [githubLink,  setGithubLink]  = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted,   setSubmitted]   = useState(false);
  const fileRef = useRef();

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();
  const candidateName  = storedUser?.name  || localStorage.getItem("name")  || "";
  const candidateEmail = storedUser?.email || localStorage.getItem("email") || "";

  useEffect(() => {
    axios.get(`${BASE_URL}/api/recruitment/jobs`)
      .then(r => setJobs(r.data || []))
      .catch(() => setError("Failed to load jobs. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const openJobs = jobs.filter(j => j.status === "OPEN");
  const filtered = openJobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.departmentName?.toLowerCase().includes(search.toLowerCase()) ||
    j.requirements?.toLowerCase().includes(search.toLowerCase())
  );

  const startApply = (job) => {
    setApplyingTo(job);
    setResume(null);
    setResumeName("");
    setGithubLink("");
    setSubmitError("");
    setSubmitted(false);
  };

  const cancelApply = () => {
    setApplyingTo(null);
    setSubmitted(false);
    setSubmitError("");
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setSubmitError("File size must be under 5MB."); return; }
    setResume(file);
    setResumeName(file.name);
    setSubmitError("");
  };

  const handleApply = async () => {
    if (!resume) { setSubmitError("Please upload your resume."); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const candRes = await axios.post(`${BASE_URL}/api/candidates`, {
        jobId:      Number(applyingTo.id),
        name:       candidateName,
        email:      candidateEmail,
        phone:      storedUser?.phone || "",
        githubLink: githubLink.trim() || null,
      }, { headers: authHeaders() });

      const candidateId = candRes.data?.id;
      const formData = new FormData();
      formData.append("file", resume);
      formData.append("candidateId", String(candidateId));
      await axios.post(`${BASE_URL}/api/resume/upload`, formData, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
    } catch (e) {
      // Log full error to console for debugging
      console.error("Apply error:", e.response?.status, e.response?.data);
      setSubmitError(extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  // ── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  if (applyingTo && submitted) return (
    <>
      <div className="cd-topbar">
        <div>
          <h1 className="cd-page-title">Open Positions</h1>
          <p className="cd-page-sub">Application submitted</p>
        </div>
      </div>
      <div className="cd-card" style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center", padding: "48px 32px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
        <h2 style={{ color: "#10b981", fontSize: "22px", fontWeight: "700", marginBottom: "12px" }}>
          Application Submitted!
        </h2>
        <p style={{ color: "#9490a8", fontSize: "14px", lineHeight: "1.6", marginBottom: "6px" }}>
          We've received your application for
        </p>
        <p style={{ color: "#a78bfa", fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
          {applyingTo.title}
        </p>
        <p style={{ color: "#6b6880", fontSize: "13px", marginBottom: "32px" }}>
          Our HR team will review it and reach out to{" "}
          <strong style={{ color: "#e8e5f4" }}>{candidateEmail}</strong>.
        </p>
        <button className="cd-btn-primary" onClick={cancelApply}>
          ← Back to Jobs
        </button>
      </div>
    </>
  );

  // ── APPLY FORM ─────────────────────────────────────────────────────────────
  if (applyingTo) return (
    <>
      <div className="cd-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={cancelApply}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", color: "#9490a8", cursor: "pointer",
              padding: "7px 12px", fontSize: "13px", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            <i className="ti ti-arrow-left" /> Back to Jobs
          </button>
          <div>
            <h1 className="cd-page-title">Apply — {applyingTo.title}</h1>
            <p className="cd-page-sub">{applyingTo.departmentName}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "20px", alignItems: "start" }}>

        {/* Left — Job details */}
        <div className="cd-card">
          <div style={{ fontSize: "11px", color: "#7c3aed", fontWeight: "600",
            textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
            Position Details
          </div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#f0eeff", marginBottom: "10px" }}>
            {applyingTo.title}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
            {applyingTo.departmentName && (
              <span className="cd-badge badge-purple">{applyingTo.departmentName}</span>
            )}
            <span className="cd-badge badge-gray">
              {applyingTo.vacancies || 1} opening{(applyingTo.vacancies || 1) > 1 ? "s" : ""}
            </span>
          </div>
          {applyingTo.requirements && (
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: "#6b6880", fontWeight: "600",
                textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "6px" }}>
                Requirements
              </div>
              <p style={{ fontSize: "13px", color: "#9490a8", lineHeight: "1.6", margin: 0 }}>
                {applyingTo.requirements}
              </p>
            </div>
          )}
          {applyingTo.description && (
            <div>
              <div style={{ fontSize: "12px", color: "#6b6880", fontWeight: "600",
                textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "6px" }}>
                About the Role
              </div>
              <p style={{ fontSize: "13px", color: "#9490a8", lineHeight: "1.6", margin: 0 }}>
                {applyingTo.description}
              </p>
            </div>
          )}
          {applyingTo.postedOn && (
            <div style={{ marginTop: "16px", paddingTop: "14px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              fontSize: "12px", color: "#4d4a62" }}>
              Posted {new Date(applyingTo.postedOn).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </div>
          )}
        </div>

        {/* Right — Application form */}
        <div className="cd-card">
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#f0eeff", marginBottom: "20px" }}>
            Your Application
          </div>

          {/* Applying as notice */}
          <div style={{
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "10px", padding: "12px 14px", marginBottom: "20px",
            fontSize: "13px", color: "#6ee7b7", display: "flex", alignItems: "center", gap: "8px",
          }}>
            <i className="ti ti-user-check" />
            Applying as <strong>{candidateName}</strong> ({candidateEmail})
          </div>

          {/* ── Error banner — now with smarter messaging ── */}
          {submitError && (
            <div style={{
              background: submitError.includes("already applied")
                ? "rgba(245,158,11,0.1)"
                : "rgba(239,68,68,0.1)",
              border: `1px solid ${submitError.includes("already applied")
                ? "rgba(245,158,11,0.3)"
                : "rgba(239,68,68,0.25)"}`,
              color: submitError.includes("already applied") ? "#fcd34d" : "#f87171",
              borderRadius: "10px", padding: "14px 16px",
              fontSize: "13px", marginBottom: "16px",
              display: "flex", alignItems: "flex-start", gap: "10px",
            }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>
                {submitError.includes("already applied") ? "ℹ️" : "⚠️"}
              </span>
              <div>
                <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                  {submitError.includes("already applied")
                    ? "Already Applied"
                    : "Submission Failed"}
                </div>
                <div style={{ opacity: 0.85 }}>{submitError}</div>
              </div>
            </div>
          )}

          {/* GitHub link */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#9490a8",
              fontSize: "13px", fontWeight: "500", marginBottom: "8px" }}>
              GitHub Profile / Repository{" "}
              <span style={{ color: "#4d4a62", fontWeight: "400" }}>(optional)</span>
            </label>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", padding: "11px 14px",
            }}>
              <i className="ti ti-brand-github" style={{ color: "#6b6880", fontSize: "18px", flexShrink: 0 }} />
              <input
                type="url"
                placeholder="https://github.com/yourname"
                value={githubLink}
                onChange={e => setGithubLink(e.target.value)}
                style={{
                  background: "none", border: "none", outline: "none",
                  color: "#e8e5f4", fontSize: "14px", width: "100%", fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Resume upload */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", color: "#9490a8",
              fontSize: "13px", fontWeight: "500", marginBottom: "8px" }}>
              Resume / CV *{" "}
              <span style={{ color: "#4d4a62", fontWeight: "400" }}>(PDF, DOC, DOCX — max 5MB)</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                background: "rgba(255,255,255,0.03)",
                border: `2px dashed ${resume ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: "12px", padding: "22px 20px", cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => { if (!resume) e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)"; }}
              onMouseLeave={e => { if (!resume) e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
                background: resume ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
              }}>
                {resume
                  ? "📄"
                  : <i className="ti ti-upload" style={{ color: "#6b6880", fontSize: "22px" }} />}
              </div>
              <div>
                <div style={{ color: resume ? "#a78bfa" : "#9490a8", fontSize: "14px", fontWeight: "600" }}>
                  {resumeName || "Click to upload your resume"}
                </div>
                <div style={{ color: "#4d4a62", fontSize: "12px", marginTop: "4px" }}>
                  {resume ? "File selected ✓ — click to change" : "PDF, DOC or DOCX up to 5MB"}
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx"
                onChange={handleFile} style={{ display: "none" }} />
            </div>
          </div>

          {/* Buttons */}
          <button
            className="cd-btn-primary"
            onClick={handleApply}
            disabled={submitting || submitError.includes("already applied")}
            style={{
              width: "100%", justifyContent: "center", padding: "14px",
              opacity: (submitting || submitError.includes("already applied")) ? 0.5 : 1,
              cursor: (submitting || submitError.includes("already applied")) ? "not-allowed" : "pointer",
              fontSize: "14px",
            }}
          >
            {submitting
              ? <><span className="cd-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />&nbsp;Submitting…</>
              : "Submit Application →"}
          </button>

          <button onClick={cancelApply} style={{
            width: "100%", marginTop: "10px", background: "none",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
            padding: "12px", color: "#6b6880", cursor: "pointer",
            fontSize: "13px", fontFamily: "inherit",
          }}>
            {submitError.includes("already applied") ? "← Back to Jobs" : "Cancel"}
          </button>
        </div>
      </div>
    </>
  );

  // ── JOB LIST ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="cd-topbar">
        <div>
          <h1 className="cd-page-title">Open Positions</h1>
          <p className="cd-page-sub">
            {loading ? "Loading…"
              : `${openJobs.length} open position${openJobs.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        background: "#1c0d35", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px", padding: "10px 16px", marginBottom: "20px",
      }}>
        <i className="ti ti-search" style={{ color: "#6b6880", fontSize: "16px" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by role, department, skills…"
          style={{
            background: "none", border: "none", outline: "none",
            color: "#e8e5f4", fontSize: "14px", width: "100%", fontFamily: "inherit",
          }}
        />
        {search && (
          <button onClick={() => setSearch("")}
            style={{ background: "none", border: "none", color: "#6b6880", cursor: "pointer", fontSize: "16px" }}>
            ✕
          </button>
        )}
      </div>

      {/* States */}
      {loading && <div className="cd-empty"><div className="cd-spinner" /><p>Loading jobs…</p></div>}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          color: "#f87171", borderRadius: "12px", padding: "14px 18px", fontSize: "14px",
        }}>{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="cd-empty">
          <i className="ti ti-briefcase-off" />
          <p>No open positions found{search ? ` for "${search}"` : ""}.</p>
        </div>
      )}

      {/* Job cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {filtered.map(job => (
          <div key={job.id} className="cd-card"
            style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
              background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className="ti ti-briefcase" style={{ color: "#a78bfa", fontSize: "20px" }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#f0eeff", marginBottom: "6px" }}>
                {job.title}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                {job.departmentName && (
                  <span className="cd-badge badge-purple">{job.departmentName}</span>
                )}
                <span className="cd-badge badge-gray">
                  {job.vacancies || 1} opening{(job.vacancies || 1) > 1 ? "s" : ""}
                </span>
                {job.postedOn && (
                  <span style={{ fontSize: "11.5px", color: "#4d4a62", alignSelf: "center" }}>
                    Posted {new Date(job.postedOn).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                )}
              </div>
              {job.requirements && (
                <p style={{ fontSize: "12.5px", color: "#6b6880", margin: "0 0 4px", lineHeight: "1.5" }}>
                  <strong style={{ color: "#9490a8" }}>Requirements: </strong>{job.requirements}
                </p>
              )}
              {job.description && (
                <p style={{ fontSize: "12.5px", color: "#4d4a62", margin: 0, lineHeight: "1.5" }}>
                  {job.description}
                </p>
              )}
            </div>

            <button
              className="cd-btn-primary"
              style={{ flexShrink: 0 }}
              onClick={() => startApply(job)}
            >
              Apply Now →
            </button>
          </div>
        ))}
      </div>
    </>
  );
}