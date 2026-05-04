import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

export default function ApplyForm() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();
  const job = location.state?.job;

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB");
      return;
    }
    setResume(file);
    setResumeName(file.name);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim())  { setError("Full name is required"); return; }
    if (!form.email.trim()) { setError("Email is required"); return; }
    if (!resume)            { setError("Please upload your resume"); return; }

    setSubmitting(true);
    try {
      // Step 1 — Create candidate record
      const candRes = await axios.post(`${BASE_URL}/api/candidates`, {
        jobId:  Number(jobId),
        name:   form.name,
        email:  form.email,
        phone:  form.phone,
      });

      // candidateId comes back as a plain Long from CandidateController
      const candidateId = candRes.data?.id;

      // Step 2 — Upload resume, passing candidateId so backend can link them
      const formData = new FormData();
      formData.append("file", resume);
      formData.append("candidateId", String(candidateId));
      await axios.post(`${BASE_URL}/api/resume/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
    } catch (e) {
      const msg = e.response?.data;
      if (typeof msg === "string" && msg.includes("already applied")) {
        setError("You have already applied for this position.");
      } else {
        setError(e.response?.data || "Submission failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #1a1040, #24243e)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 20, padding: "48px 40px", maxWidth: 480, textAlign: "center",
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ color: "#10b981", fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
            Application Submitted!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, marginBottom: 8 }}>
            Thank you <strong style={{ color: "#fff" }}>{form.name}</strong>!
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 32 }}>
            We've received your application for <strong style={{ color: "#a78bfa" }}>{job?.title || "the position"}</strong>.
            Our HR team will review it and get back to you at <strong style={{ color: "#fff" }}>{form.email}</strong>.
          </p>
          <button
            onClick={() => navigate("/jobs")}
            style={{
              background: "linear-gradient(135deg, #7c5af0, #06b6d4)",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "12px 28px", cursor: "pointer", fontWeight: 600, fontSize: 15,
            }}>
            View More Jobs
          </button>
        </div>
      </div>
    );
  }

  // ── Application form ──────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #1a1040, #24243e)",
      fontFamily: "'Inter', sans-serif", color: "#fff",
    }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => navigate("/jobs")}>
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
        <button onClick={() => navigate("/jobs")}
          style={{
            background: "transparent", color: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
            padding: "8px 16px", cursor: "pointer", fontSize: 14,
          }}>
          ← Back to Jobs
        </button>
      </nav>

      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px 60px" }}>

        {/* Job info */}
        {job && (
          <div style={{
            background: "rgba(124,90,240,0.1)", border: "1px solid rgba(124,90,240,0.25)",
            borderRadius: 14, padding: "20px 24px", marginBottom: 28,
          }}>
            <div style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
              Applying for
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{job.title}</div>
            {job.departmentName && (
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 4 }}>
                {job.departmentName} · {job.vacancies || 1} opening{(job.vacancies || 1) > 1 ? "s" : ""}
              </div>
            )}
            {job.requirements && (
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 8 }}>
                {job.requirements}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "32px",
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Your Application</h2>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
              Full Name *
            </label>
            <input
              placeholder="e.g. Priya Sharma"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
                padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
              Email Address *
            </label>
            <input
              type="email"
              placeholder="priya@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
                padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
              Phone Number
            </label>
            <input
              placeholder="+91 9876543210"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
                padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Resume Upload */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
              Resume / CV * <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>(PDF, DOC, DOCX — max 5MB)</span>
            </label>
            <label style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "rgba(255,255,255,0.04)", border: "2px dashed rgba(255,255,255,0.15)",
              borderRadius: 12, padding: "20px 20px", cursor: "pointer",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,90,240,0.5)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "rgba(124,90,240,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                📄
              </div>
              <div>
                <div style={{ color: resumeName ? "#a78bfa" : "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500 }}>
                  {resumeName || "Click to upload your resume"}
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 2 }}>
                  {resumeName ? "File selected ✓" : "Drag and drop or click to browse"}
                </div>
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%",
              background: submitting ? "rgba(124,90,240,0.4)" : "linear-gradient(135deg, #7c5af0, #06b6d4)",
              color: "#fff", border: "none", borderRadius: 12,
              padding: "14px", cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 700, fontSize: 16, transition: "opacity 0.2s",
            }}>
            {submitting ? "Submitting…" : "Submit Application →"}
          </button>
        </div>
      </div>
    </div>
  );
}