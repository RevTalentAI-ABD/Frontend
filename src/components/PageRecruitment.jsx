import React, { useState } from "react";
import {
  Briefcase,
  Users,
  FileText,
  X,
  RotateCcw,
  TriangleAlert,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { recruitmentAPI, candidateAPI, resumeAPI } from "./api";
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
      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <TriangleAlert size={18} />

          Could not load candidates

        </span>

      );
    } finally {
      setLoadingCands(false);
    }
  };

  // ── Post a new job ────────────────────────────────────────────────────────
  const postJob = async () => {
    if (!newJob.title.trim()) {

      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <XCircle size={18} />

          Job title is required

        </span>

      );

      return;
    }

    setPosting(true);
    try {
      await recruitmentAPI.createJob({
        title:        newJob.title,
        description:  newJob.description,
        requirements: newJob.requirements || newJob.department,
        vacancies:    Number(newJob.numberOfOpenings),
        status:       "OPEN",
      });
      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <CheckCircle2 size={18} />

          Job posted successfully!

        </span>

      );
      setNewJob({ title: "", department: "Engineering", numberOfOpenings: 1, description: "", requirements: "" });
      setShowForm(false);
      refetch();
    } catch {
      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <XCircle size={18} />

          Failed to post job

        </span>

      );
    } finally {
      setPosting(false);
    }
  };

  // ── Add candidate to current job ──────────────────────────────────────────
  const addCandidate = async () => {
    if (!newCand.name.trim() || !newCand.email.trim()) {
      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <XCircle size={18} />

          Name and email are required

        </span>

      );
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
      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <CheckCircle2 size={18} />

          Candidate added!

        </span>

      );
    } catch (e) {
     showToast(

       <span
         style={{
           display: "flex",
           alignItems: "center",
           gap: "8px"
         }}
       >

         <XCircle size={18} />

         {
           e.response?.data ||
           "Failed to add candidate"
         }

       </span>

     );
    } finally {
      setAddingCand(false);
    }
  };

  // ── Move candidate to next/different stage ────────────────────────────────
  const moveCandidate = async (candidateId, newStatus) => {

    setMovingId(candidateId);

    try {

      const res =
        await candidateAPI.updateStatus(
          candidateId,
          newStatus
        );

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? res.data
            : c
        )
      );

      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <CheckCircle2 size={18} />

          {
            `Moved to ${
              STAGE_LABELS[newStatus] ||
              newStatus
            }`
          }

        </span>

      );

    } catch {

      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <XCircle size={18} />

          Failed to update status

        </span>

      );

    } finally {

      setMovingId(null);
    }
  };

  // ── Remove candidate ──────────────────────────────────────────────────────
const removeCandidate = async (candidateId) => {

  if (!window.confirm("Remove this candidate?"))
    return;

  try {

    await candidateAPI.delete(candidateId);

    setCandidates((prev) =>
      prev.filter(
        (c) => c.id !== candidateId
      )
    );

    showToast(

      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >

        <CheckCircle2 size={18} />

        Candidate removed

      </span>

    );

  } catch {

    showToast(

      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >

        <XCircle size={18} />

        Failed to remove candidate

      </span>

    );
  }
};

  // ── Update job status ─────────────────────────────────────────────────────
const updateJobStatus = async (
  jobId,
  status,
  e
) => {

  e.stopPropagation();

  try {

    await recruitmentAPI.updateJobStatus(
      jobId,
      status
    );

    showToast(

      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >

        <CheckCircle2 size={18} />

        Status updated

      </span>

    );

    refetch();

  } catch {

    showToast(

      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >

        <XCircle size={18} />

        Failed to update status

      </span>

    );
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
                <>
                  {showAddCand ? <X size={16} /> : <Users size={16} />}
                  <span style={{ marginLeft: "6px" }}>
                    {showAddCand ? "Cancel" : "Add Candidate"}
                  </span>
                </>
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
                            </div>
                          </div>
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
                            <>
                              <FileText size={14} />
                              View Resume
                            </>
                          </a>
                          {/* Row 3: stage action buttons */}
                          <div style={{ display: "flex", gap: 6 }}>
                            {nextStage && (
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
                              <>
                                <X size={12} />
                                <span style={{ marginLeft: 4 }}>Reject</span>
                              </>
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
                  <>
                    <RotateCcw size={12} />
                    <span style={{ marginLeft: 4 }}>Reconsider</span>
                  </>
                </button>
                <button
                  onClick={() => removeCandidate(c.id)}
                  style={{
                    background: "rgba(239,68,68,0.1)", color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6,
                    padding: "4px 10px", fontSize: 11, cursor: "pointer",
                  }}>
                  <X size={14} />
                </button>
              </div>
            ))}
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
          <>
            {showForm ? <X size={16} /> : <Briefcase size={16} />}
            <span style={{ marginLeft: "6px" }}>
              {showForm ? "Cancel" : "Post Job"}
            </span>
          </>
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
                  <span style={{ color: "#7c5af0", fontSize: 13 }}><>
                                                                     <Users size={14} />
                                                                     <span style={{ marginLeft: 6 }}>View pipeline</span>
                                                                   </></span>
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