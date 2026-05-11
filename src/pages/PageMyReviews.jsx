import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { Star, ChevronDown, ChevronUp, BadgeCheck, Clock, AlertTriangle } from "lucide-react";

const RATING_FIELDS = [
  { key: "technicalSkills", label: "Technical Skills", color: "#7c5af0" },
  { key: "communication",   label: "Communication",   color: "#06b6d4" },
  { key: "teamwork",        label: "Teamwork",         color: "#10b981" },
  { key: "problemSolving",  label: "Problem Solving",  color: "#f59e0b" },
  { key: "leadership",      label: "Leadership",       color: "#a78bfa" },
  { key: "punctuality",     label: "Punctuality",      color: "#34d399" },
];

// ── Star display (read-only) ──────────────────────────────────────────────────
function Stars({ value = 0 }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1,2,3,4,5].map(n => (
        <Star
          key={n} size={16}
          fill={value >= n ? "#f59e0b" : "none"}
          stroke={value >= n ? "#f59e0b" : "rgba(255,255,255,0.2)"}
        />
      ))}
    </div>
  );
}

// ── Animated rating bar ───────────────────────────────────────────────────────
function RatingBar({ label, value, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth((value / 5) * 100), 150); }, [value]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Stars value={value}/>
          <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 28, textAlign: "right" }}>
            {value}/5
          </span>
        </div>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 4, background: color,
          width: `${width}%`, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)"
        }}/>
      </div>
    </div>
  );
}

// ── Overall score ring ────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const pct     = (score / 5) * 100;
  const r       = 36;
  const circ    = 2 * Math.PI * r;
  const dash    = (pct / 100) * circ;
  const color   = score >= 4 ? "#10b981" : score >= 3 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
      <svg width="90" height="90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 45 45)" style={{ transition: "stroke-dasharray 1s ease" }}/>
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color }}>{score.toFixed(1)}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>/ 5.0</div>
      </div>
    </div>
  );
}

// ── Single review card ────────────────────────────────────────────────────────
function ReviewCard({ review, employeeId, onAcknowledged }) {
  const [open, setOpen] = useState(false);
  const [acking, setAcking] = useState(false);
  const isNew = review.status === "SUBMITTED";
  const statusColor = review.status === "ACKNOWLEDGED" ? "#10b981" : "#f59e0b";

  const handleAcknowledge = async (e) => {
    e.stopPropagation();
    setAcking(true);
    try {
      await api.put(`/api/performance/${review.id}/acknowledge`);
      onAcknowledged(review.id);
    } catch { /* silent */ }
    setAcking(false);
  };

  return (
    <div style={{
      background: isNew ? "rgba(124,90,240,0.08)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${isNew ? "rgba(124,90,240,0.3)" : "rgba(255,255,255,0.09)"}`,
      borderRadius: 16, marginBottom: 14, overflow: "hidden",
      transition: "border 0.3s ease"
    }}>

      {/* Header */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer" }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Score ring */}
        <ScoreRing score={review.overallRating || 0}/>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{review.cycle}</span>
            {isNew && (
              <span style={{
                background: "rgba(124,90,240,0.25)", color: "#a78bfa",
                fontSize: 10, fontWeight: 700, borderRadius: 20,
                padding: "2px 8px", border: "1px solid rgba(124,90,240,0.4)"
              }}>
                NEW
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            Reviewed by {review.reviewerName || "Your Manager"} · {review.reviewPeriod || ""}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric"
            }) : ""}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span style={{
            background: `${statusColor}22`, color: statusColor,
            border: `1px solid ${statusColor}44`, borderRadius: 20,
            padding: "3px 10px", fontSize: 11, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 5
          }}>
            {review.status === "ACKNOWLEDGED" ? <BadgeCheck size={11}/> : <Clock size={11}/>}
            {review.status}
          </span>

          {isNew && (
            <button
              onClick={handleAcknowledge}
              disabled={acking}
              style={{
                background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.35)",
                color: "#34d399", borderRadius: 8, padding: "5px 12px",
                cursor: acking ? "not-allowed" : "pointer",
                fontSize: 12, fontWeight: 600, opacity: acking ? 0.6 : 1,
                display: "flex", alignItems: "center", gap: 5
              }}
            >
              <BadgeCheck size={13}/> {acking ? "..." : "Acknowledge"}
            </button>
          )}
        </div>

        {open ? <ChevronUp size={16} color="rgba(255,255,255,0.35)"/>
               : <ChevronDown size={16} color="rgba(255,255,255,0.35)"/>}
      </div>

      {/* Detail */}
      {open && (
        <div style={{ padding: "0 18px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>

          {/* Ratings */}
          <div style={{ marginTop: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 1, marginBottom: 14 }}>
              SKILL RATINGS
            </div>
            {RATING_FIELDS.map(f => (
              <RatingBar key={f.key} label={f.label} value={review[f.key] || 0} color={f.color}/>
            ))}
          </div>

          {/* Feedback sections */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { key: "strengths",       title: "Strengths",              color: "#10b981", bg: "rgba(16,185,129,0.08)"  },
              { key: "improvements",    title: "Areas to Improve",       color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
              { key: "goals",           title: "Goals for Next Period",   color: "#06b6d4", bg: "rgba(6,182,212,0.08)"   },
              { key: "managerComments", title: "Manager's Comments",      color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
            ].filter(s => review[s.key]).map(s => (
              <div key={s.key} style={{
                background: s.bg, border: `1px solid ${s.color}33`,
                borderRadius: 12, padding: 14
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: 1, marginBottom: 8 }}>
                  {s.title.toUpperCase()}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.65 }}>
                  {review[s.key]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PageMyReviews({ employee }) {
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!employee?.id) return;
    (async () => {
      try {
        const res = await api.get(`/api/performance/employee/${employee.id}`);
        setReviews(res.data || []);
      } catch {
        setError("Could not load reviews.");
      } finally {
        setLoading(false);
      }
    })();
  }, [employee?.id]);

  const handleAcknowledged = (id) => {
    setReviews(rs => rs.map(r => r.id === id ? { ...r, status: "ACKNOWLEDGED" } : r));
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.35)" }}>
      Loading your reviews…
    </div>
  );

  // summary numbers
  const avgScore = reviews.length
    ? (reviews.reduce((s, r) => s + (r.overallRating || 0), 0) / reviews.length).toFixed(1)
    : null;
  const latest   = reviews[0] || null;
  const unread   = reviews.filter(r => r.status === "SUBMITTED").length;

  return (
    <div className="ed-page">
      <h2 className="ed-page-heading">My Performance Reviews</h2>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#f87171", borderRadius: 10, padding: "12px 14px",
          marginBottom: 16, fontSize: 13, display: "flex", alignItems: "center", gap: 8
        }}>
          <AlertTriangle size={14}/> {error}
        </div>
      )}

      {/* Summary strip */}
      {reviews.length > 0 && (
        <div className="ed-stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: "Total Reviews",      value: reviews.length,      sub: "all cycles",    color: "#7c5af0" },
            { label: "Avg Overall Score",  value: avgScore ? `${avgScore}/5` : "—", sub: "across all reviews", color: "#f59e0b" },
            { label: "Latest Cycle",       value: latest?.cycle || "—", sub: latest?.reviewPeriod || "", color: "#06b6d4" },
            { label: "Pending Acknowledgement", value: unread,         sub: "need your action", color: unread > 0 ? "#ef4444" : "#10b981" },
          ].map((s, i) => (
            <div key={i} className="ed-stat-card" style={{ "--accent": s.color }}>
              <div className="ed-stat-body">
                <div className="ed-stat-value" style={{ fontSize: 22 }}>{s.value}</div>
                <div className="ed-stat-label">{s.label}</div>
                {s.sub && <div className="ed-stat-sub">{s.sub}</div>}
              </div>
              <div className="ed-stat-glow"/>
            </div>
          ))}
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="ed-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
            No reviews yet
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            Your manager hasn't submitted any performance reviews yet.
          </div>
        </div>
      ) : (
        <div>
          {reviews.map(r => (
            <ReviewCard
              key={r.id}
              review={r}
              employeeId={employee?.id}
              onAcknowledged={handleAcknowledged}
            />
          ))}
        </div>
      )}
    </div>
  );
}