import React, { useState } from "react";
import { recruitmentAPI, screeningAPI } from "./api";
import { useFetch, useToast } from "./hooks";
import { Badge, Spinner, ErrorState, Toast, EmptyState, Avatar } from "./UI";

const PIPELINE_STAGES = ["Applied", "Screening", "Interview", "Offer", "Hired"];
const DEPTS = ["Engineering","Design","Product","Data","Infra","HR","Finance","Marketing"];

export default function PageRecruitment() {
  const { data, loading, error, refetch } = useFetch(recruitmentAPI.getJobs);
  const { toast, showToast } = useToast();

  const [showForm, setShowForm]   = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [screenData, setScreenData]   = useState(null);
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", department: "Engineering", numberOfOpenings: 1, description: "" });
  const [posting, setPosting] = useState(false);

  const jobs = Array.isArray(data) ? data : (data?.jobs || data?.content || []);

  const applicants = Array.isArray(screenData)
    ? screenData
    : (screenData?.candidates || screenData?.applicants || []);

  const viewJob = async (job) => {
    setSelectedJob(job);
    setLoadingScreen(true);
    try {
      const res = await screeningAPI.getByJob(job.id || job.jobId);
      setScreenData(res.data);
    } catch { setScreenData([]); }
    finally { setLoadingScreen(false); }
  };

  // ✅ FIX: moved outside
  const updateStatus = async (jobId, status) => {
    try {
      await recruitmentAPI.updateJobStatus(jobId, status);
      showToast("✅ Status updated");
      refetch();
    } catch {
      showToast("❌ Failed to update status");
    }
  };

  const postJob = async () => {
    setPosting(true);

    try {
      const payload = {
        title: newJob.title,
        description: newJob.description,
        requirements: newJob.department,
        vacancies: Number(newJob.numberOfOpenings),
        status: "OPEN"
      };

      await recruitmentAPI.createJob(payload);

      showToast("✅ Job posted successfully!");

      setNewJob({
        title: "",
        department: "Engineering",
        numberOfOpenings: 1,
        description: ""
      });

      setShowForm(false);
      refetch();

    } catch (err) {
      showToast("❌ Failed to post job");
    } finally {
      setPosting(false);
    }
  };
  if (loading) return <Spinner />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  // ── Job detail view ──────────────────────────────────────────────────────
  if (selectedJob) {
    return (
      <div className="hr-page">
        <Toast message={toast} />
        <button className="hr-back-btn" onClick={() => { setSelectedJob(null); setScreenData(null); }}>← Back to Jobs</button>
        <div className="hr-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ color: "#fff", fontSize: 20, marginBottom: 6 }}>{selectedJob.title || selectedJob.jobTitle}</h3>
              <div style={{ color: "#9b96b8", fontSize: 14 }}>{selectedJob.department} · {selectedJob.numberOfOpenings || 1} opening{(selectedJob.numberOfOpenings || 1) > 1 ? "s" : ""}</div>
            </div>
            <Badge status={selectedJob.status || "OPEN"} />
          </div>
          {selectedJob.description && (
            <p style={{ color: "#9b96b8", marginTop: 12, fontSize: 14 }}>{selectedJob.description}</p>
          )}
        </div>

        {/* Applicant Pipeline */}
        <div className="hr-panel">
          <h3 className="hr-panel-title">Applicant Pipeline</h3>
          {loadingScreen ? <Spinner /> : (
            <div className="hr-pipeline">
              {PIPELINE_STAGES.map(stage => {
                const stageApplicants = applicants.filter(a =>
                  (a.stage || a.status || a.screeningStatus || "Applied") === stage
                );
                return (
                  <div key={stage} className="hr-pipeline-col">
                    <div className="hr-pipeline-header">
                      <span>{stage}</span>
                      <span className="hr-pipeline-count">{stageApplicants.length}</span>
                    </div>
                    <div className="hr-pipeline-cards">
                      {stageApplicants.map((a, i) => {
                        const name = a.name || a.candidateName || `${a.firstName || ""} ${a.lastName || ""}`.trim() || "Candidate";
                        return (
                          <div key={a.id || i} className="hr-applicant-card">
                            <Avatar name={name} size={32} />
                            <div className="hr-ac-info">
                              <div className="hr-ac-name">{name}</div>
                              <div className="hr-ac-job">{a.email || ""}</div>
                            </div>
                          </div>
                        );
                      })}
                      {stageApplicants.length === 0 && (
                        <div style={{ color: "#555", fontSize: 12, padding: "8px 4px" }}>Empty</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main jobs view ───────────────────────────────────────────────────────
  return (
    <div className="hr-page">
      <Toast message={toast} />
      <div className="hr-page-header-row">
        <h2 className="hr-page-heading">Recruitment</h2>
        <button className="hr-primary-btn" onClick={() => setShowForm(s => !s)}>
          {showForm ? "✕ Cancel" : "+ Post Job"}
        </button>
      </div>

      {showForm && (
        <div className="hr-panel hr-add-form">
          <h3 className="hr-panel-title">New Job Posting</h3>
          <div className="hr-form-grid">
            <div className="hr-field hr-field-full">
              <label>Job Title</label>
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

      <div className="hr-panel">
        <h3 className="hr-panel-title">Open Positions</h3>
        {jobs.length === 0 ? (
          <EmptyState icon="💼" text="No jobs posted yet" />
        ) : (
          <div className="hr-jobs-grid">
            {jobs.map(j => {
              const id       = j.id || j.jobId;
              const title    = j.title || j.jobTitle;
              const dept     = j.department;
              const openings = j.numberOfOpenings || j.openings || 1;
              const status   = j.status || "OPEN";
              const posted   = j.createdAt ? new Date(j.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";
              return (
                <div key={id} className="hr-job-card" style={{ cursor: "pointer" }} onClick={() => viewJob(j)}>
                  <div className="hr-job-title">{title}</div>
                  <div className="hr-job-meta">
                    <span>{dept}</span>
                    <span>{openings} opening{openings > 1 ? "s" : ""}</span>
                  </div>
                  <div className="hr-job-row">
                    <span className="hr-job-applicants">👤 View applicants</span>
                   <select
                     value={status}
                     onClick={(e) => e.stopPropagation()}
                     onChange={(e) => {
                       e.stopPropagation();
                       updateStatus(id, e.target.value);
                     }}
                     className="hr-status-dropdown"
                   >
                     <option value="OPEN">OPEN</option>
                     <option value="ON_HOLD">ON_HOLD</option>
                     <option value="CLOSED">CLOSED</option>
                   </select>
                  </div>
                  {posted && <div className="hr-job-posted">Posted {posted}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
