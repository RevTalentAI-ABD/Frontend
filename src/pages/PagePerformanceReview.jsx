import React, { useState, useEffect, useCallback } from "react";
import { getTeam } from "../api/api";
import api from "../api/axiosConfig";
import {
  Star, ChevronDown, ChevronUp, Check, X, Edit3,
  BarChart2, User, RefreshCw, AlertTriangle, Plus
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
const AVATAR_COLORS = ["#7c5af0","#10b981","#06b6d4","#f59e0b","#ef4444","#8b5cf6"];
function pickColor(id) { return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length]; }

const CYCLES = ["2025-Q1","2025-Q2","2025-Q3","2025-Q4","2026-Q1","2026-Q2"];
const RATING_FIELDS = [
  { key: "technicalSkills", label: "Technical Skills" },
  { key: "communication",   label: "Communication"   },
  { key: "teamwork",        label: "Teamwork"         },
  { key: "problemSolving",  label: "Problem Solving"  },
  { key: "leadership",      label: "Leadership"       },
  { key: "punctuality",     label: "Punctuality"      },
];

// ── StarRating ────────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readOnly }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <Star
          key={n}
          size={20}
          fill={(hovered || value) >= n ? "#f59e0b" : "none"}
          stroke={(hovered || value) >= n ? "#f59e0b" : "rgba(255,255,255,0.25)"}
          style={{ cursor: readOnly ? "default" : "pointer", transition: "all 0.15s" }}
          onMouseEnter={() => !readOnly && setHovered(n)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => !readOnly && onChange && onChange(n)}
        />
      ))}
      {value > 0 && (
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginLeft: 4, alignSelf: "center" }}>
          {value}/5
        </span>
      )}
    </div>
  );
}

// ── RatingBar (read-only display) ─────────────────────────────────────────────
function RatingBar({ label, value }) {
  const pct = ((value || 0) / 5) * 100;
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{value || 0}/5</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
        <div style={{
          height: "100%", borderRadius: 3, background: color,
          width: `${pct}%`, transition: "width 0.6s ease"
        }}/>
      </div>
    </div>
  );
}

// ── ReviewCard (collapsed view of an existing review) ─────────────────────────
function ReviewCard({ review, onEdit }) {
  const [open, setOpen] = useState(false);
  const overall = review.overallRating || 0;
  const color = overall >= 4 ? "#10b981" : overall >= 3 ? "#f59e0b" : "#ef4444";
  const statusColor = {
    SUBMITTED: "#06b6d4", ACKNOWLEDGED: "#10b981", DRAFT: "#f59e0b"
  }[review.status] || "#9b96b8";

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 14, marginBottom: 12, overflow: "hidden"
    }}>
      {/* Header row */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
          cursor: "pointer"
        }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: pickColor(review.employeeId),
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0
        }}>
          {getInitials(review.employeeName || "")}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
            {review.employeeName || `Employee #${review.employeeId}`}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {review.cycle} · {review.reviewPeriod || ""}
          </div>
        </div>
        <div style={{
          background: `${color}22`, color, border: `1px solid ${color}44`,
          borderRadius: 20, padding: "2px 10px", fontSize: 13, fontWeight: 700
        }}>
          ★ {overall.toFixed(1)}
        </div>
        <span style={{
          background: `${statusColor}22`, color: statusColor,
          border: `1px solid ${statusColor}44`, borderRadius: 20,
          padding: "2px 10px", fontSize: 11, fontWeight: 600
        }}>
          {review.status}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onEdit(review); }}
          style={{
            background: "rgba(124,90,240,0.2)", border: "1px solid rgba(124,90,240,0.3)",
            color: "#a78bfa", borderRadius: 8, padding: "5px 10px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5, fontSize: 12
          }}
        >
          <Edit3 size={12}/> Edit
        </button>
        {open ? <ChevronUp size={16} color="rgba(255,255,255,0.4)"/> : <ChevronDown size={16} color="rgba(255,255,255,0.4)"/>}
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>RATINGS</div>
              {RATING_FIELDS.map(f => (
                <RatingBar key={f.key} label={f.label} value={review[f.key]}/>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {review.strengths && (
                <div>
                  <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600, marginBottom: 4 }}>STRENGTHS</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{review.strengths}</div>
                </div>
              )}
              {review.improvements && (
                <div>
                  <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600, marginBottom: 4 }}>AREAS TO IMPROVE</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{review.improvements}</div>
                </div>
              )}
              {review.goals && (
                <div>
                  <div style={{ fontSize: 11, color: "#06b6d4", fontWeight: 600, marginBottom: 4 }}>GOALS FOR NEXT PERIOD</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{review.goals}</div>
                </div>
              )}
              {review.managerComments && (
                <div>
                  <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, marginBottom: 4 }}>MANAGER COMMENTS</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{review.managerComments}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ReviewForm ────────────────────────────────────────────────────────────────
function ReviewForm({ team, editTarget, reviewerId, reviewerName, onSaved, onCancel }) {
  const blank = {
    employeeId: "", employeeName: "", cycle: "2025-Q2", reviewPeriod: "",
    technicalSkills: 0, communication: 0, teamwork: 0,
    problemSolving: 0, leadership: 0, punctuality: 0,
    strengths: "", improvements: "", goals: "", managerComments: "", status: "SUBMITTED"
  };

  const [form, setForm] = useState(editTarget ? { ...editTarget } : blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const preview = (() => {
    const vals = RATING_FIELDS.map(f => form[f.key]).filter(v => v > 0);
    if (!vals.length) return 0;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  })();

  const handleEmployeeChange = (id) => {
    const emp = team.find(e => String(e.id) === String(id));
    set("employeeId", id);
    set("employeeName", emp?.name || "");
  };

  const submit = async () => {
    if (!form.employeeId) { setError("Please select an employee."); return; }
    if (!form.cycle)      { setError("Please select a review cycle."); return; }
    const allRated = RATING_FIELDS.every(f => form[f.key] > 0);
    if (!allRated)        { setError("Please rate all 6 categories."); return; }
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, reviewerId, reviewerName };
      if (editTarget?.id) {
        await api.put(`/api/performance/${editTarget.id}`, payload);
      } else {
        await api.post("/api/performance", payload);
      }
      onSaved();
    } catch (e) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 16, padding: 24, marginBottom: 24
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>
          {editTarget ? "Edit Review" : "New Performance Review"}
        </h3>
        <button onClick={onCancel} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.4)", padding: 4
        }}>
          <X size={18}/>
        </button>
      </div>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#f87171", borderRadius: 10, padding: "10px 14px",
          marginBottom: 16, fontSize: 13, display: "flex", alignItems: "center", gap: 8
        }}>
          <AlertTriangle size={14}/> {error}
        </div>
      )}

      {/* Row 1: employee + cycle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Employee</label>
          <select style={selectStyle} value={form.employeeId} onChange={e => handleEmployeeChange(e.target.value)} disabled={!!editTarget}>
            <option value="">Select employee</option>
            {team.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Review Cycle</label>
          <select style={selectStyle} value={form.cycle} onChange={e => set("cycle", e.target.value)}>
            {CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Review Period (optional)</label>
          <input style={inputStyle} placeholder="e.g. Jan–Mar 2025"
            value={form.reviewPeriod} onChange={e => set("reviewPeriod", e.target.value)}/>
        </div>
      </div>

      {/* Ratings */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <label style={{ ...labelStyle, margin: 0 }}>Ratings (1–5 stars)</label>
          {parseFloat(preview) > 0 && (
            <div style={{
              background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
              color: "#f59e0b", borderRadius: 20, padding: "3px 12px",
              fontSize: 13, fontWeight: 700
            }}>
              Overall: {preview} / 5
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {RATING_FIELDS.map(f => (
            <div key={f.key} style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 10,
              padding: "12px 14px",
              border: form[f.key] > 0 ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(255,255,255,0.07)"
            }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 8 }}>{f.label}</div>
              <StarRating value={form[f.key]} onChange={v => set(f.key, v)}/>
            </div>
          ))}
        </div>
      </div>

      {/* Text fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Strengths</label>
          <textarea style={taStyle} rows={3} placeholder="What does this employee do exceptionally well?"
            value={form.strengths} onChange={e => set("strengths", e.target.value)}/>
        </div>
        <div>
          <label style={labelStyle}>Areas to Improve</label>
          <textarea style={taStyle} rows={3} placeholder="Constructive areas for growth..."
            value={form.improvements} onChange={e => set("improvements", e.target.value)}/>
        </div>
        <div>
          <label style={labelStyle}>Goals for Next Period</label>
          <textarea style={taStyle} rows={3} placeholder="Key objectives and targets..."
            value={form.goals} onChange={e => set("goals", e.target.value)}/>
        </div>
        <div>
          <label style={labelStyle}>Manager Comments</label>
          <textarea style={taStyle} rows={3} placeholder="Overall summary and additional notes..."
            value={form.managerComments} onChange={e => set("managerComments", e.target.value)}/>
        </div>
      </div>

      {/* Status + Submit */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <select style={{ ...selectStyle, width: 160 }} value={form.status} onChange={e => set("status", e.target.value)}>
          <option value="DRAFT">Save as Draft</option>
          <option value="SUBMITTED">Submit Review</option>
        </select>
        <button onClick={submit} disabled={saving} style={{
          background: "linear-gradient(135deg, #5b3de8, #7c5af0)",
          color: "#fff", border: "none", borderRadius: 10,
          padding: "10px 24px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
          fontSize: 14, display: "flex", alignItems: "center", gap: 8, opacity: saving ? 0.7 : 1
        }}>
          <Check size={15}/> {saving ? "Saving..." : editTarget ? "Update Review" : "Submit Review"}
        </button>
        <button onClick={onCancel} style={{
          background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
          padding: "10px 20px", fontWeight: 500, cursor: "pointer", fontSize: 14
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// shared input styles matching ManagerDashboard dark theme
const labelStyle = {
  display: "block", fontSize: 12, color: "rgba(255,255,255,0.45)",
  fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px"
};
const baseField = {
  width: "100%", background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
  color: "#fff", fontSize: 13, outline: "none",
  fontFamily: "'DM Sans', sans-serif"
};
const selectStyle = { ...baseField, padding: "9px 12px" };
const inputStyle  = { ...baseField, padding: "9px 12px" };
const taStyle     = { ...baseField, padding: "9px 12px", resize: "vertical" };

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PagePerformanceReview({ managerProfile }) {
  const [team,       setTeam]       = useState([]);
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [filterEmp,  setFilterEmp]  = useState("all");
  const [error,      setError]      = useState("");

  const reviewerId   = managerProfile?.id   || managerProfile?.employeeId;
  const reviewerName = managerProfile?.name || "Manager";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [teamData, revRes] = await Promise.all([
        getTeam(),
        reviewerId
          ? api.get(`/api/performance/reviewer/${reviewerId}`)
          : Promise.resolve({ data: [] }),
      ]);
      setTeam(teamData || []);
      setReviews(revRes.data || []);
    } catch (e) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [reviewerId]);

  useEffect(() => { load(); }, [load]);

  const handleSaved = () => {
    setShowForm(false);
    setEditTarget(null);
    load();
  };

  const handleEdit = (review) => {
    setEditTarget(review);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = filterEmp === "all"
    ? reviews
    : reviews.filter(r => String(r.employeeId) === filterEmp);

  // summary stats
  const submitted    = reviews.filter(r => r.status === "SUBMITTED").length;
  const acknowledged = reviews.filter(r => r.status === "ACKNOWLEDGED").length;
  const avgOverall   = reviews.length
    ? (reviews.reduce((s, r) => s + (r.overallRating || 0), 0) / reviews.length).toFixed(1)
    : "—";

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.4)" }}>
      Loading…
    </div>
  );

  return (
    <div className="md-page">

      {/* Page header */}
      <div className="md-page-header-row" style={{ marginBottom: 20 }}>
        <h2 className="md-page-heading">Performance Reviews</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={load} style={{
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.6)", borderRadius: 10, padding: "8px 14px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13
          }}>
            <RefreshCw size={14}/> Refresh
          </button>
          <button
            onClick={() => { setEditTarget(null); setShowForm(s => !s); }}
            style={{
              background: showForm ? "rgba(255,255,255,0.07)" : "linear-gradient(135deg, #5b3de8, #7c5af0)",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "8px 18px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 600
            }}
          >
            {showForm ? <><X size={14}/> Cancel</> : <><Plus size={14}/> New Review</>}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#f87171", borderRadius: 10, padding: "12px 16px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 8, fontSize: 13
        }}>
          <AlertTriangle size={14}/> {error}
        </div>
      )}

      {/* Summary stats */}
      <div className="md-stats-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: <BarChart2 size={18}/>, label: "Total Reviews",   value: reviews.length,  color: "#7c5af0" },
          { icon: <Check size={18}/>,     label: "Submitted",        value: submitted,        color: "#06b6d4" },
          { icon: <User size={18}/>,      label: "Acknowledged",     value: acknowledged,     color: "#10b981" },
          { icon: <Star size={18}/>,      label: "Avg Overall Score",value: avgOverall,       color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} className="md-stat-card" style={{ "--accent": s.color }}>
            <div className="md-stat-icon">{s.icon}</div>
            <div className="md-stat-body">
              <div className="md-stat-value">{s.value}</div>
              <div className="md-stat-label">{s.label}</div>
            </div>
            <div className="md-stat-glow"/>
          </div>
        ))}
      </div>

      {/* Form (new / edit) */}
      {showForm && (
        <ReviewForm
          team={team}
          editTarget={editTarget}
          reviewerId={reviewerId}
          reviewerName={reviewerName}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}

      {/* Filter + list */}
      <div className="md-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 className="md-panel-title" style={{ margin: 0 }}>Review History</h3>
          <select
            style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", borderRadius: 10, padding: "7px 12px", fontSize: 13,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer"
            }}
            value={filterEmp}
            onChange={e => setFilterEmp(e.target.value)}
          >
            <option value="all">All Employees</option>
            {team.map(e => <option key={e.id} value={String(e.id)}>{e.name}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "40px 20px",
            color: "rgba(255,255,255,0.35)", fontSize: 14
          }}>
            {reviews.length === 0
              ? "No reviews yet. Create your first review above."
              : "No reviews for this employee yet."}
          </div>
        ) : (
          filtered.map(r => (
            <ReviewCard key={r.id} review={r} onEdit={handleEdit}/>
          ))
        )}
      </div>
    </div>
  );
}