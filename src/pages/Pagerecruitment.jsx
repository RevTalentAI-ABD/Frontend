import React, { useState } from "react";
import { recruitmentAPI, candidateAPI, resumeAPI, employeeAPI } from "./api";
import { useFetch, useToast } from "./hooks";
import { Badge, Spinner, ErrorState, Toast, EmptyState, Avatar } from "./UI";

const PIPELINE_STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFERED", "HIRED"];
const STAGE_LABELS    = { APPLIED: "Applied", SCREENING: "Screening", INTERVIEW: "Interview", OFFERED: "Offered", HIRED: "Hired" };
const STAGE_COLORS    = { APPLIED: "#7c5af0", SCREENING: "#06b6d4", INTERVIEW: "#f59e0b", OFFERED: "#10b981", HIRED: "#22c55e" };
const REJECTED_STAGES = ["REJECTED", "WITHDRAWN"];

const DEPTS = ["Engineering","Design","Product","Data","Infra","HR","Finance","Marketing"];

export default function PageRecruitment() {
  const { data, loading, error, refetch } = useFetch(recruitmentAPI.getJobs);
  const { toast, showToast } = useToast();

  const [showForm,      setShowForm]      = useState(false);
  const [selectedJob,   setSelectedJob]   = useState(null);
  const [candidates,    setCandidates]    = useState([]);
  const [loadingCands,  setLoadingCands]  = useState(false);
  const [showAddCand,   setShowAddCand]   = useState(false);
  const [posting,       setPosting]       = useState(false);
  const [addingCand,    setAddingCand]    = useState(false);
  const [movingId,      setMovingId]      = useState(null);

  // ── Schedule interview modal state ────────────────────────────────────────
  const [scheduleModal, setScheduleModal] = useState(null); // candidate object or null
  const [scheduleForm,  setScheduleForm]  = useState({ date: "", time: "", interviewerName: "", interviewerId: "" });
  const [scheduling,    setScheduling]    = useState(false);
  const [employees,     setEmployees]     = useState([]);

  const [newJob, setNewJob] = useState({
    title: "", department: "Engineering", numberOfOpenings: 1, description: "", requirements: ""
  });

  const [newCand, setNewCand] = useState({ name: "", email: "", phone: "" });

  const jobs = Array.isArray(data) ? data : (data?.jobs || data?.content || []);

  // ── Open a job and load its candidates ───────────────────────────────────
  const viewJob = async (job) => {
    setSelectedJob(job);
    setShowAddCand(false);
    setNewCand({ name: "", email: "", phone: "" });
    setLoadingCands(true);
    try {
      const res = await candidateAPI.getByJob(job.id);
      setCandidates(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCandidates([]);
      showToast("⚠️ Could not load candidates");
    } finally {
      setLoadingCands(false);
    }
  };

  // ── Post a new job ────────────────────────────────────────────────────────
  const postJob = async () => {
    if (!newJob.title.trim()) { showToast("❌ Job title is required"); return; }
    setPosting(true);
    try {
      await recruitmentAPI.createJob({
        title:        newJob.title,
        description:  newJob.description,
        requirements: newJob.requirements || newJob.department,
        vacancies:    Number(newJob.numberOfOpenings),
        status:       "OPEN",
      });
      showToast("✅ Job posted successfully!");
      setNewJob({ title: "", department: "Engineering", numberOfOpenings: 1, description: "", requirements: "" });
      setShowForm(false);
      refetch();
    } catch {
      showToast("❌ Failed to post job");
    } finally {
      setPosting(false);
    }
  };

  // ── Add candidate to current job ──────────────────────────────────────────
  const addCandidate = async () => {
    if (!newCand.name.trim() || !newCand.email.trim()) {
      showToast("❌ Name and email are required");
      return;
    }
    setAddingCand(true);
    try {
      const res = await candidateAPI.add({
        jobId: selectedJob.id,
        name:  newCand.name,
        email: newCand.email,
        phone: newCand.phone,
      });
      setCandidates((prev) => [...prev, res.data]);
      setNewCand({ name: "", email: "", phone: "" });
      setShowAddCand(false);
      showToast("✅ Candidate added!");
    } catch (e) {
      showToast("❌ " + (e.response?.data || "Failed to add candidate"));
    } finally {
      setAddingCand(false);
    }
  };

  // ── Open schedule interview modal ─────────────────────────────────────────
  const openScheduleModal = async (candidate) => {
    setScheduleModal(candidate);
    setScheduleForm({ date: "", time: "", interviewerName: "", interviewerId: "" });
    // Load employees list for interviewer selection
    if (employees.length === 0) {
      try {
        const res = await employeeAPI.getAll();
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } catch {
        // employees list optional
      }
    }
  };

  // ── Confirm schedule interview ─────────────────────────────────────────────
  const confirmSchedule = async () => {
    if (!scheduleForm.date || !scheduleForm.time) {
      showToast("❌ Please select date and time");
      return;
    }
    setScheduling(true);
    try {
      const interviewDate = `${scheduleForm.date}T${scheduleForm.time}:00`;
      const rawId = scheduleForm.interviewerId;
      const interviewerId = rawId && rawId !== "" ? Number(rawId) : null;
      const res = await candidateAPI.scheduleInterview(scheduleModal.id, interviewDate, interviewerId);
      setCandidates((prev) => prev.map((c) => (c.id === scheduleModal.id ? res.data : c)));
      showToast("✅ Interview scheduled!");
      setScheduleModal(null);
    } catch (e) {
      showToast("❌ " + (e.response?.data || e.message || "Failed to schedule interview"));
    } finally {
      setScheduling(false);
    }
  };

  // ── Move candidate to next/different stage ────────────────────────────────
  const moveCandidate = async (candidateId, newStatus) => {
    setMovingId(candidateId);
    try {
      const res = await candidateAPI.updateStatus(candidateId, newStatus);
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? res.data : c))
      );
      showToast(`✅ Moved to ${STAGE_LABELS[newStatus] || newStatus}`);
    } catch {
      showToast("❌ Failed to update status");
    } finally {
      setMovingId(null);
    }
  };

  // ── Remove candidate ──────────────────────────────────────────────────────
  const removeCandidate = async (candidateId) => {
    if (!window.confirm("Remove this candidate?")) return;
    try {
      await candidateAPI.delete(candidateId);
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
      showToast("✅ Candidate removed");
    } catch {
      showToast("❌ Failed to remove candidate");
    }
  };

  // ── Update job status ─────────────────────────────────────────────────────
  const updateJobStatus = async (jobId, status, e) => {
    e.stopPropagation();
    try {
      await recruitmentAPI.updateJobStatus(jobId, status);
      showToast("✅ Status updated");
      refetch();
    } catch {
      showToast("❌ Failed to update status");
    }
  };

  if (loading) return <Spinner />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  // ── Job detail + pipeline view ────────────────────────────────────────────
  if (selectedJob) {
    const activeCandidates  = candidates.filter(c => !REJECTED_STAGES.includes(c.status));
    const rejectedCandidates = candidates.filter(c => REJECTED_STAGES.includes(c.status));

    return (
      <div className="hr-page">
        <Toast message={toast} />

        {/* Back + header */}
        <button className="hr-back-btn" onClick={() => { setSelectedJob(null); setCandidates([]); }}>
          ← Back to Jobs
        </button>

        <div className="hr-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ color: "#fff", fontSize: 20, marginBottom: 6 }}>{selectedJob.title}</h3>
              <div style={{ color: "#9b96b8", fontSize: 14 }}>
                {selectedJob.departmentName || "—"} · {selectedJob.vacancies || 1} opening{(selectedJob.vacancies || 1) > 1 ? "s" : ""}
              </div>
              {selectedJob.requirements && (
                <div style={{ color: "#9b96b8", fontSize: 13, marginTop: 6 }}>
                  Requirements: {selectedJob.requirements}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Badge status={selectedJob.status || "OPEN"} />
              <button className="hr-primary-btn" onClick={() => setShowAddCand(s => !s)}>
                {showAddCand ? "✕ Cancel" : "+ Add Candidate"}
              </button>
            </div>
          </div>
        </div>

        {/* Add Candidate Form */}
        {showAddCand && (
          <div className="hr-panel hr-add-form">
            <h3 className="hr-panel-title">Add Candidate</h3>
            <div className="hr-form-grid">
              <div className="hr-field">
                <label>Full Name *</label>
                <input placeholder="e.g. Priya Sharma" value={newCand.name}
                  onChange={e => setNewCand(c => ({ ...c, name: e.target.value }))} />
              </div>
              <div className="hr-field">
                <label>Email *</label>
                <input type="email" placeholder="priya@example.com" value={newCand.email}
                  onChange={e => setNewCand(c => ({ ...c, email: e.target.value }))} />
              </div>
              <div className="hr-field">
                <label>Phone</label>
                <input placeholder="+91 9876543210" value={newCand.phone}
                  onChange={e => setNewCand(c => ({ ...c, phone: e.target.value }))} />
              </div>
            </div>
            <button className="hr-primary-btn" onClick={addCandidate} disabled={addingCand}>
              {addingCand ? "Adding…" : "Add Candidate"}
            </button>
          </div>
        )}

        {/* Pipeline board */}
        <div className="hr-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="hr-panel-title" style={{ margin: 0 }}>Candidate Pipeline</h3>
            <span style={{ color: "#9b96b8", fontSize: 13 }}>{activeCandidates.length} active candidate{activeCandidates.length !== 1 ? "s" : ""}</span>
          </div>

          {loadingCands ? <Spinner /> : (
            <div className="hr-pipeline">
              {PIPELINE_STAGES.map(stage => {
                const stageCandidates = activeCandidates.filter(c => c.status === stage);
                const nextStage = PIPELINE_STAGES[PIPELINE_STAGES.indexOf(stage) + 1];
                return (
                  <div key={stage} className="hr-pipeline-col">
                    <div className="hr-pipeline-header" style={{ borderTop: `3px solid ${STAGE_COLORS[stage]}` }}>
                      <span style={{ color: STAGE_COLORS[stage] }}>{STAGE_LABELS[stage]}</span>
                      <span className="hr-pipeline-count">{stageCandidates.length}</span>
                    </div>
                    <div className="hr-pipeline-cards">
                      {stageCandidates.map((c) => (
                        <div key={c.id} className="hr-applicant-card">
                          {/* Row 1: avatar + info */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Avatar name={c.name} size={32} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="hr-ac-name">{c.name}</div>
                              <div className="hr-ac-job" style={{
                                fontSize: 11, whiteSpace: "nowrap",
                                overflow: "hidden", textOverflow: "ellipsis"
                              }}>{c.email}</div>
                              {c.phone && (
                                <div className="hr-ac-job" style={{ fontSize: 11 }}>{c.phone}</div>
                              )}
                              {c.githubUrl && (
                                <a
                                  href={c.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ fontSize: 11, color: "#a78bfa", textDecoration: "none" }}
                                >
                                  🔗 GitHub
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Interview schedule details (shown when in INTERVIEW stage) */}
                          {stage === "INTERVIEW" && c.interviewDate && (
                            <div style={{
                              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                              borderRadius: 6, padding: "7px 10px", fontSize: 11,
                            }}>
                              <div style={{ color: "#f59e0b", fontWeight: 600, marginBottom: 2 }}>📅 Scheduled Interview</div>
                              <div style={{ color: "#d1c9a8" }}>
                                {new Date(c.interviewDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                {" at "}
                                {new Date(c.interviewDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                              {c.interviewerName && (
                                <div style={{ color: "#9b96b8", marginTop: 2 }}>👤 {c.interviewerName}</div>
                              )}
                            </div>
                          )}
                          {/* Row 2: Resume button */}
                          <a
                            href={resumeAPI.getDownloadUrl(c.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "center",
                              gap: 5, textDecoration: "none",
                              background: "rgba(99,102,241,0.1)", color: "#818cf8",
                              border: "1px solid rgba(99,102,241,0.25)", borderRadius: 6,
                              padding: "5px 8px", fontSize: 11, fontWeight: 500,
                              cursor: "pointer",
                            }}>
                            📄 View Resume
                          </a>
                          {/* Row 3: stage action buttons */}
                          <div style={{ display: "flex", gap: 6 }}>
                            {nextStage && (
                              nextStage === "INTERVIEW" ? (
                                <button
                                  onClick={() => openScheduleModal(c)}
                                  disabled={movingId === c.id}
                                  style={{
                                    flex: 1,
                                    background: STAGE_COLORS["INTERVIEW"] + "22",
                                    color: STAGE_COLORS["INTERVIEW"],
                                    border: `1px solid ${STAGE_COLORS["INTERVIEW"]}55`,
                                    borderRadius: 6, padding: "5px 6px",
                                    fontSize: 11, fontWeight: 500, cursor: "pointer",
                                    whiteSpace: "nowrap",
                                  }}>
                                  📅 Schedule Interview
                                </button>
                              ) : (
                                <button
                                  onClick={() => moveCandidate(c.id, nextStage)}
                                  disabled={movingId === c.id}
                                  style={{
                                    flex: 1,
                                    background: STAGE_COLORS[nextStage] + "22",
                                    color: STAGE_COLORS[nextStage],
                                    border: `1px solid ${STAGE_COLORS[nextStage]}55`,
                                    borderRadius: 6, padding: "5px 6px",
                                    fontSize: 11, fontWeight: 500, cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    opacity: movingId === c.id ? 0.5 : 1,
                                  }}>
                                  {movingId === c.id ? "…" : `→ ${STAGE_LABELS[nextStage]}`}
                                </button>
                              )
                            )}
                            <button
                              onClick={() => moveCandidate(c.id, "REJECTED")}
                              disabled={movingId === c.id}
                              style={{
                                background: "rgba(239,68,68,0.08)", color: "#f87171",
                                border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6,
                                padding: "5px 10px", fontSize: 11, fontWeight: 500,
                                cursor: "pointer", whiteSpace: "nowrap",
                                opacity: movingId === c.id ? 0.5 : 1,
                              }}>
                              ✕ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                      {stageCandidates.length === 0 && (
                        <div style={{ color: "#555", fontSize: 12, padding: "8px 4px" }}>Empty</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rejected / Withdrawn */}
        {rejectedCandidates.length > 0 && (
          <div className="hr-panel">
            <h3 className="hr-panel-title">Rejected / Withdrawn ({rejectedCandidates.length})</h3>
            {rejectedCandidates.map((c) => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <Avatar name={c.name} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{c.name}</div>
                  <div style={{ color: "#555", fontSize: 12 }}>{c.email}</div>
                </div>
                <Badge status={c.status} />
                <button
                  onClick={() => moveCandidate(c.id, "APPLIED")}
                  style={{
                    background: "rgba(124,90,240,0.2)", color: "#a78bfa",
                    border: "1px solid rgba(124,90,240,0.3)", borderRadius: 6,
                    padding: "4px 10px", fontSize: 11, cursor: "pointer",
                  }}>
                  ↩ Reconsider
                </button>
                <button
                  onClick={() => removeCandidate(c.id)}
                  style={{
                    background: "rgba(239,68,68,0.1)", color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6,
                    padding: "4px 10px", fontSize: 11, cursor: "pointer",
                  }}>
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Schedule Interview Modal */}
        {scheduleModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}>
            <div style={{
              background: "#1a1730", border: "1px solid rgba(124,90,240,0.3)",
              borderRadius: 14, padding: 28, width: "100%", maxWidth: 460,
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ color: "#fff", fontSize: 18, margin: 0 }}>📅 Schedule Interview</h3>
                <button onClick={() => setScheduleModal(null)}
                  style={{ background: "none", border: "none", color: "#9b96b8", fontSize: 20, cursor: "pointer" }}>✕</button>
              </div>

              {/* Candidate info */}
              <div style={{
                background: "rgba(124,90,240,0.08)", border: "1px solid rgba(124,90,240,0.2)",
                borderRadius: 8, padding: "10px 14px", marginBottom: 20,
              }}>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{scheduleModal.name}</div>
                <div style={{ color: "#9b96b8", fontSize: 12, marginTop: 2 }}>{scheduleModal.email}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="hr-field">
                  <label style={{ color: "#9b96b8", fontSize: 13, marginBottom: 6, display: "block" }}>Interview Date *</label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setScheduleForm(f => ({ ...f, date: e.target.value }))}
                    style={{
                      width: "100%", background: "#12102a", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14,
                    }}
                  />
                </div>
                <div className="hr-field">
                  <label style={{ color: "#9b96b8", fontSize: 13, marginBottom: 6, display: "block" }}>Interview Time *</label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={e => setScheduleForm(f => ({ ...f, time: e.target.value }))}
                    style={{
                      width: "100%", background: "#12102a", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14,
                    }}
                  />
                </div>
                <div className="hr-field">
                  <label style={{ color: "#9b96b8", fontSize: 13, marginBottom: 6, display: "block" }}>Interviewer</label>
                  {employees.length > 0 ? (
                    <select
                      value={scheduleForm.interviewerId}
                      onChange={e => {
                        const emp = employees.find(em => String(em.id) === e.target.value);
                        setScheduleForm(f => ({
                          ...f,
                          interviewerId: e.target.value,
                          interviewerName: emp ? emp.name : "",
                        }));
                      }}
                      style={{
                        width: "100%", background: "#12102a", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14,
                      }}
                    >
                      <option value="">— Select Interviewer —</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} {emp.designation ? `(${emp.designation})` : ""}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      placeholder="Interviewer name (optional)"
                      value={scheduleForm.interviewerName}
                      onChange={e => setScheduleForm(f => ({ ...f, interviewerName: e.target.value }))}
                      style={{
                        width: "100%", background: "#12102a", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14,
                      }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <button
                  onClick={() => setScheduleModal(null)}
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.05)", color: "#9b96b8",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                    padding: "10px", fontSize: 14, cursor: "pointer",
                  }}>
                  Cancel
                </button>
                <button
                  onClick={confirmSchedule}
                  disabled={scheduling}
                  style={{
                    flex: 2, background: "linear-gradient(135deg,#7c5af0,#a78bfa)",
                    color: "#fff", border: "none", borderRadius: 8,
                    padding: "10px", fontSize: 14, fontWeight: 600,
                    cursor: scheduling ? "not-allowed" : "pointer",
                    opacity: scheduling ? 0.7 : 1,
                  }}>
                  {scheduling ? "Scheduling…" : "✓ Confirm Interview"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Main jobs list view ───────────────────────────────────────────────────
  return (
    <div className="hr-page">
      <Toast message={toast} />
      <div className="hr-page-header-row">
        <h2 className="hr-page-heading">Recruitment</h2>
        <button className="hr-primary-btn" onClick={() => setShowForm(s => !s)}>
          {showForm ? "✕ Cancel" : "+ Post Job"}
        </button>
      </div>

      {/* New Job Form */}
      {showForm && (
        <div className="hr-panel hr-add-form">
          <h3 className="hr-panel-title">New Job Posting</h3>
          <div className="hr-form-grid">
            <div className="hr-field hr-field-full">
              <label>Job Title *</label>
              <input placeholder="e.g. Frontend Engineer" value={newJob.title}
                onChange={e => setNewJob(j => ({ ...j, title: e.target.value }))} />
            </div>
            <div className="hr-field">
              <label>Department</label>
              <select value={newJob.department} onChange={e => setNewJob(j => ({ ...j, department: e.target.value }))}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="hr-field">
              <label>Openings</label>
              <input type="number" min="1" value={newJob.numberOfOpenings}
                onChange={e => setNewJob(j => ({ ...j, numberOfOpenings: parseInt(e.target.value) || 1 }))} />
            </div>
            <div className="hr-field hr-field-full">
              <label>Requirements</label>
              <input placeholder="e.g. 3+ years React, Node.js" value={newJob.requirements}
                onChange={e => setNewJob(j => ({ ...j, requirements: e.target.value }))} />
            </div>
            <div className="hr-field hr-field-full">
              <label>Description</label>
              <textarea rows={3} placeholder="Job description…" value={newJob.description}
                onChange={e => setNewJob(j => ({ ...j, description: e.target.value }))} />
            </div>
          </div>
          <button className="hr-primary-btn" onClick={postJob} disabled={posting}>
            {posting ? "Posting…" : "Post Job"}
          </button>
        </div>
      )}

      {/* Jobs grid */}
      <div className="hr-panel">
        <h3 className="hr-panel-title">Job Postings ({jobs.length})</h3>
        {jobs.length === 0 ? (
          <EmptyState icon="💼" text="No jobs posted yet" />
        ) : (
          <div className="hr-jobs-grid">
            {jobs.map(j => (
              <div key={j.id} className="hr-job-card" style={{ cursor: "pointer" }} onClick={() => viewJob(j)}>
                <div className="hr-job-title">{j.title}</div>
                <div className="hr-job-meta">
                  <span>{j.departmentName || "—"}</span>
                  <span>{j.vacancies || 1} opening{(j.vacancies || 1) > 1 ? "s" : ""}</span>
                </div>
                {j.requirements && (
                  <div style={{ color: "#9b96b8", fontSize: 12, marginTop: 4, 
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {j.requirements}
                  </div>
                )}
                <div className="hr-job-row" style={{ marginTop: 10 }}>
                  <span style={{ color: "#7c5af0", fontSize: 13 }}>👥 View pipeline</span>
                  <select
                    value={j.status || "OPEN"}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateJobStatus(j.id, e.target.value, e)}
                    className="hr-status-dropdown"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="ON_HOLD">ON HOLD</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                {j.postedOn && (
                  <div className="hr-job-posted">
                    Posted {new Date(j.postedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}