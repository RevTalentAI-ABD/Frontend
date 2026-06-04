import React, { useState, useEffect } from "react";
import { candidateAPI, resumeAPI } from "../components/api";
import { Calendar, Clock, FileText, User, Briefcase, Mail, CheckCircle } from "lucide-react";
import { Toast } from "../components/UI";
import { useToast } from "../components/hooks";

export default function PageInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();

  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ score: 10, notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await candidateAPI.getMyInterviews();
      setInterviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      showToast(" Error fetching interviews");
    } finally {
      setLoading(false);
    }
  };

  const handleViewResume = async (candidateId) => {
    window.open(resumeAPI.getDownloadUrl(candidateId), "_blank");
  };

  const submitFeedback = async () => {
    if (!feedbackForm.score) {
      showToast(" Score is required");
      return;
    }
    setSubmitting(true);
    try {
      await candidateAPI.submitFeedback(feedbackModal.roundId, feedbackForm.score, feedbackForm.notes);
      showToast(" Feedback submitted!");
      setFeedbackModal(null);
      fetchInterviews();
    } catch (e) {
      showToast(" Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dash-content animated-fade">
      <Toast message={toast} />
      <div className="section-header">
        <h2 className="section-title">Interviews</h2>
        <p className="section-subtitle">Your scheduled and upcoming interviews</p>
      </div>

      {loading ? (
        <div className="dash-loading">Loading interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="dash-empty">
          <Calendar size={48} className="empty-icon" />
          <p>No upcoming interviews assigned to you.</p>
        </div>
      ) : (
        <div className="interviews-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {interviews.map((interview) => (
            <div key={interview.roundId} className="dash-card interview-card" style={{ padding: '20px', borderRadius: '12px', background: '#1a1f2c', border: '1px solid #2a3142' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: '0 0 5px 0' }}>
                    {interview.jobTitle || 'Open Position'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <Briefcase size={14} style={{ marginRight: '6px' }} />
                    {interview.roundName || 'Interview'}
                  </div>
                </div>
                {interview.status === 'COMPLETED' ? (
                  <span className="status-badge status-interview" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: '#10b98120', color: '#34d399' }}>
                    Evaluated
                  </span>
                ) : (
                  <span className="status-badge status-interview" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: '#3b82f620', color: '#60a5fa' }}>
                    Scheduled
                  </span>
                )}
              </div>
              
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1' }}>
                  <User size={16} style={{ marginRight: '10px', color: '#94a3b8' }} />
                  <span>{interview.candidateName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1' }}>
                  <Mail size={16} style={{ marginRight: '10px', color: '#94a3b8' }} />
                  <a href={`mailto:${interview.candidateEmail}`} style={{ color: '#cbd5e1', textDecoration: 'none' }}>{interview.candidateEmail}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1' }}>
                  <Calendar size={16} style={{ marginRight: '10px', color: '#94a3b8' }} />
                  <span>
                    {interview.scheduledAt 
                      ? new Date(interview.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Date TBD'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1' }}>
                  <Clock size={16} style={{ marginRight: '10px', color: '#94a3b8' }} />
                  <span>
                    {interview.scheduledAt 
                      ? new Date(interview.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                      : 'Time TBD'}
                  </span>
                </div>
              </div>
              
              {interview.status === 'COMPLETED' && (
                <div className="card-feedback" style={{ margin: '0 20px 20px 20px', padding: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                  <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Score: {interview.score}/10</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{interview.feedbackNotes || 'No notes provided.'}</div>
                </div>
              )}
              
              <div className="card-footer" style={{ borderTop: '1px solid #2a3142', paddingTop: '15px', display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, padding: '8px', fontSize: 13, cursor: 'pointer' }}
                  onClick={() => handleViewResume(interview.candidateId)}
                >
                  <FileText size={16} /> Resume
                </button>
                {interview.status !== 'COMPLETED' && (
                  <button 
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 6, padding: '8px', fontSize: 13, cursor: 'pointer' }}
                    onClick={() => {
                      setFeedbackModal(interview);
                      setFeedbackForm({ score: 10, notes: "" });
                    }}
                  >
                    <CheckCircle size={16} /> Evaluate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
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
              <h3 style={{ color: "#fff", fontSize: 18, margin: 0 }}>Evaluate Candidate</h3>
              <button onClick={() => setFeedbackModal(null)}
                style={{ background: "none", border: "none", color: "#9b96b8", fontSize: 20, cursor: "pointer" }}></button>
            </div>

            <div style={{
              background: "rgba(124,90,240,0.08)", border: "1px solid rgba(124,90,240,0.2)",
              borderRadius: 8, padding: "10px 14px", marginBottom: 20,
            }}>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{feedbackModal.candidateName}</div>
              <div style={{ color: "#9b96b8", fontSize: 12, marginTop: 2 }}>{feedbackModal.roundName || 'Interview'}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="hr-field">
                <label style={{ color: "#9b96b8", fontSize: 13, marginBottom: 6, display: "block" }}>Score (1-10) *</label>
                <input
                  type="number"
                  min="1" max="10"
                  value={feedbackForm.score}
                  onChange={e => setFeedbackForm(f => ({ ...f, score: parseInt(e.target.value) || 0 }))}
                  style={{
                    width: "100%", background: "#12102a", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14,
                  }}
                />
              </div>
              <div className="hr-field">
                <label style={{ color: "#9b96b8", fontSize: 13, marginBottom: 6, display: "block" }}>Feedback Notes</label>
                <textarea
                  rows={4}
                  placeholder="Notes from the interview..."
                  value={feedbackForm.notes}
                  onChange={e => setFeedbackForm(f => ({ ...f, notes: e.target.value }))}
                  style={{
                    width: "100%", background: "#12102a", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button
                onClick={() => setFeedbackModal(null)}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.05)", color: "#9b96b8",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                  padding: "10px", fontSize: 14, cursor: "pointer",
                }}>
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={submitting}
                style={{
                  flex: 2, background: "linear-gradient(135deg,#10b981,#34d399)",
                  color: "#fff", border: "none", borderRadius: 8,
                  padding: "10px", fontSize: 14, fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}>
                {submitting ? "Submitting…" : " Submit Evaluation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
