import React, { useState, useEffect, useCallback } from "react";
import "../styles/ManagerDashboard.css";
import PagePerformanceReview from "./PagePerformanceReview";
import PageCalendar from "../components/PageCalendar";
import PageKudos from "./PageKudos";
import PageInterviews from "./PageInterviews";
import AttendanceClock from "../components/AttendanceClock";
import FloatingAI from "../components/FloatingAI";
import api from "../api/axiosConfig";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  getManagerDashboard,
  getManagerActivity,
  getManagerProfile,
  getTeam,
  searchTeam,
  getAllAttendance,
  getAttendanceSummary,
  getAllLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getAllNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  
} from "../api/api";
import { employeeAPI, performanceAPI, getLeaveHistory,
  getLeaveBalance,
  applyLeave,
  leaveAPI } from "../components/api";
import { useNavigate } from "react-router-dom";
import {
  Users, CheckCircle, Home, Laptop, ClipboardList, BarChart2,
  Bell, AlertTriangle, Pin, Clock, Umbrella, Check, X, Award,
  Calendar as CalIcon, Star
} from "lucide-react";


function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function statusFromEmployee(emp) {
  const s = (emp.status || "").toUpperCase();
  if (s === "WFH") return "WFH";
  if (s === "PRESENT" || s === "ACTIVE") return "Present";
  if (s === "ON_LEAVE" || s === "LEAVE") return "On Leave";
  if (s === "ABSENT") return "Absent";
  if (s === "WFO" || s === "WORK_FROM_OFFICE") return "Present";
  return emp.status || "Unknown";
}

const AVATAR_COLORS = ["#7c5af0", "#10b981", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6"];
function pickColor(id) {
  return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
}

// ─── Small reusable components ────────────────────────────────────────────────
function Logo() {
  return (
    <div className="md-logo">
      <div className="md-logo-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="2"  y="2"  width="9" height="9" rx="2" fill="white" opacity="0.9"/>
          <rect x="13" y="2"  width="9" height="9" rx="2" fill="white" opacity="0.6"/>
          <rect x="2"  y="13" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
          <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
        </svg>
      </div>
      <span className="md-logo-text">Rev<span>Talent</span></span>
    </div>
  );
}

function Avatar({ initials, size = 36, color = "#7c5af0" }) {
  return (
    <div className="md-avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, delta }) {
  const [count, setCount] = useState(0);
  const num = parseFloat(value);
  useEffect(() => {
    if (isNaN(num)) return;
    let start = 0;
    const step = num / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(t); }
      else setCount(Math.floor(start));
    }, 20);
    return () => clearInterval(t);
  }, [num]);

  return (
    <div className="md-stat-card" style={{ "--accent": color }}>
      <div className="md-stat-icon">{icon}</div>
      <div className="md-stat-body">
        <div className="md-stat-value">{isNaN(num) ? value : count}</div>
        <div className="md-stat-label">{label}</div>
        {sub && <div className="md-stat-sub">{sub}</div>}
      </div>
      {delta !== undefined && delta !== 0 && (
        <div className={`md-stat-delta ${delta > 0 ? "up" : "down"}`}>
          {delta > 0 ? "↑" : "↓"} {Math.abs(delta)}%
        </div>
      )}
      <div className="md-stat-glow" />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Present: "badge-green", WFH: "badge-blue", Absent: "badge-red",
    "On Leave": "badge-yellow", Approved: "badge-green",
    APPROVED: "badge-green", Pending: "badge-yellow", PENDING: "badge-yellow",
    Rejected: "badge-red", REJECTED: "badge-red",
  };
  return <span className={`md-badge ${map[status] || ""}`}>{status}</span>;
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.4)" }}>
      Loading…
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div style={{
      background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
      color: "#f87171", borderRadius: 10, padding: "12px 16px", margin: "16px 0",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <AlertTriangle size={15} /> {msg}
      </span>
    </div>
  );
}

// ─── Overview Page ────────────────────────────────────────────────────────────
function PageHome() {
  const [dashboard, setDashboard] = useState(null);
  const [activity, setActivity] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [dash, act, announceRes, teamRes, attRes] = await Promise.all([
          getManagerDashboard(),
          getManagerActivity(),
          api.get("/api/announcements"),
          getTeam(),
          getAllAttendance()
        ]);
        setDashboard(dash || {});
        setActivity(act || []);
        setAnnouncements(announceRes?.data || []);
        setTeamList(teamRes || []);
        setAttendanceList(attRes || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  let presentCount = 0;
  let wfhCount = 0;
  let onLeaveCount = 0;

  attendanceList.forEach(a => {
    const s = (a.status || "").toUpperCase();
    const t = (a.attendanceType || "").toUpperCase();
    if (s === "WFH" || t === "WFH") wfhCount++;
    else if (s === "PRESENT" || t === "WFO") presentCount++;
    else if (s === "ON_LEAVE" || s === "LEAVE") onLeaveCount++;
  });

  const teamSize = teamList.length;
  const absentCount = Math.max(0, teamSize - presentCount - wfhCount - onLeaveCount);
  const pending = dashboard?.pendingLeaves ?? 0;

  const PIE_DATA = [
    { name: "Present",  value: presentCount,  color: "#10b981" },
    { name: "WFH",      value: wfhCount,      color: "#06b6d4" },
    { name: "On Leave", value: onLeaveCount,  color: "#f59e0b" },
    { name: "Absent",   value: absentCount,   color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="md-page">
      <div className="md-welcome-banner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="md-welcome-date">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
          <h2 className="md-welcome-heading">{getGreeting()}</h2>
          <p className="md-welcome-sub">
            You have <strong>{pending} pending leave requests</strong> and{" "}
            <strong>{absentCount} absent today</strong>.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {(() => {
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            return storedUser?.employeeId ? <AttendanceClock employeeId={storedUser.employeeId} /> : null;
          })()}
        </div>
      </div>

      <div className="md-stats-grid">
        <StatCard icon={<Users size={20} />}        label="Team Size"         value={teamSize} sub="total members" color="#7c5af0" />
        <StatCard icon={<CheckCircle size={20} />}  label="Present Today"     value={presentCount}  sub="in office"     color="#10b981" />
        <StatCard icon={<Laptop size={20} />}       label="WFH Today"         value={wfhCount}      sub="remote"        color="#06b6d4" />
        <StatCard icon={<ClipboardList size={20} />} label="Pending Approvals" value={pending}  sub="need action"   color="#f59e0b" />
      </div>

      <div className="md-two-col">
        <div className="md-panel">
          <h3 className="md-panel-title">Today's Team Status</h3>
          {PIE_DATA.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  dataKey="value" paddingAngle={3}>
                  {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e1740", border: "none", borderRadius: 10, color: "#fff" }} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.4)" }}>No data</div>
          )}
        </div>

        <div className="md-panel">
          <h3 className="md-panel-title">Activity Feed</h3>
          <div className="md-activity-list">
            {activity.length === 0 && (
              <div style={{ color: "rgba(255,255,255,0.4)", padding: 16 }}>No recent activity</div>
            )}
            {activity.map((a, i) => (
              <div key={i} className="md-activity-row">
                <span className="md-activity-icon"><Pin size={14} /></span>
                <div className="md-activity-text">{a.text || a.message || a.description}</div>
                <div className="md-activity-time">{a.time || a.timestamp}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="md-panel">
          <h3 className="md-panel-title">Announcements</h3>
          <div className="md-activity-list">
            {announcements.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.4)", padding: 16 }}>No announcements at this time.</div>
            ) : (
              announcements.map((a, i) => (
                <div key={i} className="md-activity-row" style={{ alignItems: "flex-start" }}>
                  <span className="md-activity-icon" style={{
                    color: a.priority === "URGENT" ? "#ef4444" :
                           a.priority === "HIGH"   ? "#f59e0b" :
                           a.priority === "LOW"    ? "#7c5af0" : "#10b981",
                    background: "none", width: "auto", height: "auto"
                  }}>
                    ●
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="md-activity-text" style={{ fontWeight: 600, color: "#fff" }}>{a.title}</div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>{a.message}</div>
                    <div className="md-activity-time" style={{ marginTop: "4px" }}>By {a.postedBy || "HR"} · {a.createdAt || ""}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Team Attendance Page ─────────────────────────────────────────────────────
function PageTeamAttendance() {
  const [filter, setFilter] = useState("All");
  const [attendance, setAttendance] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [allAtt, teamRes] = await Promise.all([
          getAllAttendance(),
          getTeam()
        ]);
        setAttendance(allAtt || []);
        setTeamList(teamRes || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statuses = ["All", "PRESENT", "WFH", "ABSENT", "ON_LEAVE"];
  const displayLabel = { PRESENT: "Present", WFH: "WFH", ABSENT: "Absent", ON_LEAVE: "On Leave" };

  if (loading) return <Spinner />;

  let presentCount = 0;
  let wfhCount = 0;
  let onLeaveCount = 0;

  const attMap = {};
  attendance.forEach(a => {
    attMap[a.employeeId] = a;
    const s = (a.status || "").toUpperCase();
    const t = (a.attendanceType || "").toUpperCase();
    if (s === "WFH" || t === "WFH") wfhCount++;
    else if (s === "PRESENT" || t === "WFO") presentCount++;
    else if (s === "ON_LEAVE" || s === "LEAVE") onLeaveCount++;
  });

  const teamSize = teamList.length;
  const absentCount = Math.max(0, teamSize - presentCount - wfhCount - onLeaveCount);

  // Build full roster combining team members and attendance data
  const fullRoster = teamList.map(member => {
    const a = attMap[member.id] || {};
    const type = (a.attendanceType || "").toUpperCase();
    const stat = (a.status || "").toUpperCase();
    let computedStatus = "ABSENT";
    if (stat === "WFH" || type === "WFH") computedStatus = "WFH";
    else if (stat === "PRESENT" || type === "WFO") computedStatus = "PRESENT";
    else if (stat === "ON_LEAVE" || stat === "LEAVE") computedStatus = "ON_LEAVE";

    return {
      ...member,
      ...a,
      computedStatus
    };
  });

  const filtered = filter === "All"
    ? fullRoster
    : fullRoster.filter(m => m.computedStatus === filter);

  const formatTime = (isoStr) => {
    if (!isoStr) return "--";
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (mins) => {
    if (!mins) return "--";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="md-page">
      <div className="md-page-header-row">
        <h2 className="md-page-heading">Team Attendance</h2>
      </div>

      {error && <ErrorMsg msg={error} />}

      <div className="md-stats-grid" style={{ marginBottom: "24px" }}>
        <StatCard icon={<CheckCircle size={20} />} label="In Office" value={presentCount} sub="Present today" color="#10b981" />
        <StatCard icon={<Laptop size={20} />} label="Remote (WFH)" value={wfhCount} sub="Working from home" color="#06b6d4" />
        <StatCard icon={<Users size={20} />} label="Absent / Leave" value={absentCount + onLeaveCount} sub="Away today" color="#ef4444" />
      </div>

      <div className="md-filter-tabs">
        {statuses.map((s) => (
          <button key={s}
            className={`md-filter-tab ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}>
            {s === "All" ? "All" : (displayLabel[s] || s)}
          </button>
        ))}
      </div>

      <div className="md-panel" style={{ padding: 0, overflow: "hidden" }}>
        <table className="md-roster-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <th style={{ padding: "16px", color: "#9b96b8", fontWeight: 500, fontSize: "13px" }}>Employee</th>
              <th style={{ padding: "16px", color: "#9b96b8", fontWeight: 500, fontSize: "13px" }}>Status</th>
              <th style={{ padding: "16px", color: "#9b96b8", fontWeight: 500, fontSize: "13px" }}>Clock In</th>
              <th style={{ padding: "16px", color: "#9b96b8", fontWeight: 500, fontSize: "13px" }}>Clock Out</th>
              <th style={{ padding: "16px", color: "#9b96b8", fontWeight: 500, fontSize: "13px" }}>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Avatar initials={getInitials(m.name || m.employeeName)} size={36} color={pickColor(m.id || m.employeeId || i)} />
                    <div>
                      <div style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}>{m.name || m.employeeName}</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{m.designation || m.department || m.employeeCode}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px" }}>
                  <StatusBadge status={m.computedStatus === "PRESENT" ? "Present" : m.computedStatus === "ON_LEAVE" ? "On Leave" : m.computedStatus === "ABSENT" ? "Absent" : "WFH"} />
                </td>
                <td style={{ padding: "16px", color: "rgba(255,255,255,0.8)", fontSize: "14px", fontFamily: "monospace" }}>
                  {formatTime(m.checkIn)}
                </td>
                <td style={{ padding: "16px", color: "rgba(255,255,255,0.8)", fontSize: "14px", fontFamily: "monospace" }}>
                  {m.checkIn && !m.checkOut ? <span style={{ color: "#10b981", fontSize: "12px", fontWeight: "bold" }}>Working...</span> : formatTime(m.checkOut)}
                </td>
                <td style={{ padding: "16px", color: "rgba(255,255,255,0.8)", fontSize: "14px", fontFamily: "monospace" }}>
                  {formatDuration(m.durationMin)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Leave Approvals Page ─────────────────────────────────────────────────────
function PageLeaveApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectComment, setRejectComment] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [approveModal, setApproveModal] = useState(null);
  const [approveComment, setApproveComment] = useState("");
  const [approveSubmitting, setApproveSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllLeaves();
        setRequests(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApprove = async () => {
    if (!approveComment.trim()) return;
    setApproveSubmitting(true);
    setActionError("");
    try {
      await approveLeave(approveModal, approveComment);
      setRequests(rs => rs.map(r =>
        r.id === approveModal ? { ...r, status: "APPROVED", comment: approveComment } : r
      ));
      setApproveModal(null);
      setApproveComment("");
    } catch (e) {
      setActionError(e.message);
    } finally {
      setApproveSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) return;
    setRejectSubmitting(true);
    setActionError("");
    try {
      await rejectLeave(rejectModal, rejectComment);
      setRequests(rs => rs.map(r =>
        r.id === rejectModal ? { ...r, status: "REJECTED", rejectionReason: rejectComment } : r
      ));
      setRejectModal(null);
      setRejectComment("");
    } catch (e) {
      setActionError(e.message);
    } finally {
      setRejectSubmitting(false);
    }
  };

  const PENDING_STATUSES = ["PENDING", "Pending", "APPLIED", "Applied"];
  const pending = requests.filter(r => !r.status || PENDING_STATUSES.includes(r.status));
  const approved = requests.filter(r => (r.status || "").toUpperCase() === "APPROVED");
  const rejected = requests.filter(r => (r.status || "").toUpperCase() === "REJECTED");
  
  // Calculate currently active leaves
  const today = new Date();
  today.setHours(0,0,0,0);
  const activeLeaves = approved.filter(r => {
    if (!r.startDate || !r.endDate) return false;
    const s = new Date(r.startDate); s.setHours(0,0,0,0);
    const e = new Date(r.endDate); e.setHours(23,59,59,999);
    return today >= s && today <= e;
  });

  const done = requests.filter(r => r.status && !PENDING_STATUSES.includes(r.status));

  // Chart data
  let sick = 0, casual = 0, annual = 0, other = 0;
  requests.forEach(r => {
    const t = (r.leaveType || "").toUpperCase();
    if (t.includes("SICK")) sick++;
    else if (t.includes("CASUAL")) casual++;
    else if (t.includes("ANNUAL")) annual++;
    else other++;
  });
  const totalLeaves = requests.length;
  const PIE_DATA = [
    { name: "Sick leave", value: sick, color: "#ef4444" },
    { name: "Casual leave", value: casual, color: "#f59e0b" },
    { name: "Annual leave", value: annual, color: "#7c5af0" },
    { name: "Other", value: other, color: "#10b981" },
  ];

  if (loading) return <Spinner />;

  const modalOverlay = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  };
  const modalBox = {
    background: "#1e1740", borderRadius: 14, padding: 28, width: 420,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
  };
  const modalTitle  = { margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#fff" };
  const modalSub    = { margin: "0 0 16px", fontSize: 13, color: "rgba(255,255,255,0.5)" };
  const modalTextarea = {
    width: "100%", minHeight: 90, background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
    color: "#fff", fontSize: 13, padding: "10px 12px", resize: "vertical",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const modalActions = { display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" };

  return (
    <div className="md-page">
      {approveModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={modalTitle}>Approve Leave</h3>
            <p style={modalSub}>Add a comment before approving (required)</p>
            <textarea style={modalTextarea} placeholder="e.g. Approved." value={approveComment} onChange={e => setApproveComment(e.target.value)} autoFocus />
            <div style={modalActions}>
              <button onClick={() => { setApproveModal(null); setApproveComment(""); }} style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              <button onClick={handleApprove} disabled={!approveComment.trim() || approveSubmitting} style={{ background: approveComment.trim() ? "#10b981" : "rgba(16,185,129,0.3)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: approveComment.trim() ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <Check size={14} /> {approveSubmitting ? "Approving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={modalTitle}>Reject Leave</h3>
            <p style={modalSub}>Please provide a reason for rejection (required)</p>
            <textarea style={modalTextarea} placeholder="e.g. Insufficient coverage." value={rejectComment} onChange={e => setRejectComment(e.target.value)} autoFocus />
            <div style={modalActions}>
              <button onClick={() => { setRejectModal(null); setRejectComment(""); }} style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              <button onClick={handleReject} disabled={!rejectComment.trim() || rejectSubmitting} style={{ background: rejectComment.trim() ? "#ef4444" : "rgba(239,68,68,0.3)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: rejectComment.trim() ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <X size={14} /> {rejectSubmitting ? "Rejecting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md-page-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 className="md-page-heading" style={{ margin: 0 }}>Leave Management</h2>
      </div>

      {error && <ErrorMsg msg={error} />}
      {actionError && <ErrorMsg msg={actionError} />}

      <div className="lm-metric-grid">
        <div className="lm-metric-card">
          <div className="lm-mc-header">
            <Clock size={14} /> PENDING
          </div>
          <div className="lm-mc-value">{pending.length}</div>
          <div className="lm-mc-sub">{pending.length === 0 ? "No requests awaiting" : "Action required"}</div>
        </div>
        <div className="lm-metric-card">
          <div className="lm-mc-header">
            <Check size={14} /> APPROVED
          </div>
          <div className="lm-mc-value">{approved.length}</div>
          <div className="lm-pill lm-pill-green">↑ This week</div>
        </div>
        <div className="lm-metric-card">
          <div className="lm-mc-header">
            <Users size={14} /> ON LEAVE
          </div>
          <div className="lm-mc-value">{activeLeaves.length}</div>
          <div className="lm-pill lm-pill-yellow">Active now</div>
        </div>
        <div className="lm-metric-card">
          <div className="lm-mc-header">
            <X size={14} /> REJECTED
          </div>
          <div className="lm-mc-value">{rejected.length}</div>
          <div className="lm-mc-sub">All clear</div>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="lm-panel">
          <div className="lm-panel-header">
            <h3 className="lm-panel-title">Pending Requests</h3>
            <div className="lm-pill lm-pill-yellow">{pending.length} records</div>
          </div>
          <div className="lm-processed-list">
            {pending.map(r => {
              const name = r.employeeName || `Employee #${r.employeeId}`;
              const t = (r.leaveType || "").toUpperCase();
              let badgeClass = "lm-type-other";
              if (t.includes("SICK")) badgeClass = "lm-type-sick";
              if (t.includes("CASUAL")) badgeClass = "lm-type-casual";
              if (t.includes("ANNUAL")) badgeClass = "lm-type-annual";

              return (
                <div key={r.id} className="lm-processed-card">
                  <div className="lm-pc-left">
                    <Avatar initials={getInitials(name)} size={44} color={pickColor(r.employeeId)} />
                    <div>
                      <div className="lm-pc-name">{name}</div>
                      <div className="lm-pc-dates">{new Date(r.startDate).toLocaleDateString('en-GB', {day:'numeric', month:'short'})} → {new Date(r.endDate).toLocaleDateString('en-GB', {day:'numeric', month:'short', year: 'numeric'})}</div>
                    </div>
                  </div>
                  <div className="lm-pc-right">
                    <div className={`lm-type-badge ${badgeClass}`}>{r.leaveType}</div>
                    <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
                      <button onClick={() => setApproveModal(r.id)} style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><Check size={14}/> Approve</button>
                      <button onClick={() => setRejectModal(r.id)} style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><X size={14}/> Reject</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="lm-panel">
          <div className="lm-panel-header">
            <h3 className="lm-panel-title">Processed Leaves</h3>
            <div className="lm-pill lm-pill-purple">{done.length} records</div>
          </div>
          <div className="lm-processed-list">
            {done.map(r => {
              const name = r.employeeName || `Employee #${r.employeeId}`;
              const t = (r.leaveType || "").toUpperCase();
              let badgeClass = "lm-type-other";
              if (t.includes("SICK")) badgeClass = "lm-type-sick";
              if (t.includes("CASUAL")) badgeClass = "lm-type-casual";
              if (t.includes("ANNUAL")) badgeClass = "lm-type-annual";

              return (
                <div key={r.id} className="lm-processed-card">
                  <div className="lm-pc-left">
                    <Avatar initials={getInitials(name)} size={44} color={pickColor(r.employeeId)} />
                    <div>
                      <div className="lm-pc-name">{name}</div>
                      <div className="lm-pc-dates">{new Date(r.startDate).toLocaleDateString('en-GB', {day:'numeric', month:'short'})} → {new Date(r.endDate).toLocaleDateString('en-GB', {day:'numeric', month:'short', year: 'numeric'})}</div>
                    </div>
                  </div>
                  <div className="lm-pc-right">
                    <div className={`lm-type-badge ${badgeClass}`}>{r.leaveType}</div>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="lm-panel">
        <div className="lm-panel-header">
          <h3 className="lm-panel-title">Leave by type</h3>
          <div className="lm-pill lm-pill-purple">{new Date().toLocaleDateString('en-GB', {month: 'long', year: 'numeric'})}</div>
        </div>
        <div className="lm-chart-container">
          <div style={{ position: "relative", width: 220, height: 220 }}>
            {totalLeaves > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" stroke="none">
                      {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e1340", border: "none", borderRadius: 10, color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "#fff", lineHeight: 1 }}>{totalLeaves}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>total</div>
                </div>
              </>
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>No data</div>
            )}
          </div>
          
          <div className="lm-legend-list">
            {PIE_DATA.map(d => {
              const pct = totalLeaves > 0 ? Math.round((d.value / totalLeaves) * 100) : 0;
              return (
                <div key={d.name} className="lm-legend-item">
                  <div className="lm-legend-item-left">
                    <div className="lm-dot" style={{ background: d.color }}></div>
                    {d.name}
                  </div>
                  <div>
                    <span className="lm-legend-count">{d.value}</span>
                    <span className="lm-legend-pct">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Member Detail Component ──────────────────────────────────────────────────
function MemberDetail({ emp, onBack }) {
  return (
    <div className="md-page">
      <button className="md-back-btn" onClick={onBack}>← Back to Team</button>
      <div className="md-member-profile">
        <Avatar initials={getInitials(emp.name)} size={72} color={pickColor(emp.id)} />
        <div>
          <div className="md-mp-name">{emp.name}</div>
          <div className="md-mp-role">{emp.designation} · {emp.departmentName}</div>
          <StatusBadge status={statusFromEmployee(emp)} />
        </div>
      </div>
      <div className="md-panel">
        <h3 className="md-panel-title">Contact Information</h3>
        <div className="md-contact-grid">
          {[
            ["Email",         emp.email],
            ["Department",    emp.departmentName],
            ["Designation",   emp.designation],
            ["Employee Code", emp.employeeCode],
            ["Phone",         emp.phone],
            ["Status",        emp.status],
          ].map(([l, v]) => (
            <div key={l} className="md-contact-item">
              <div className="md-contact-label">{l}</div>
              <div className="md-contact-value">{v || "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Team Members Page ────────────────────────────────────────────────────────
function PageTeamMembers() {
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTeam();
        setTeam(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = useCallback(async (q) => {
    setSearch(q);
    if (!q.trim()) {
      try {
        const data = await getTeam();
        setTeam(data || []);
      } catch {}
      return;
    }
    setSearching(true);
    try {
      const data = await searchTeam(q);
      setTeam(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setSearching(false);
    }
  }, []);

  if (loading) return <Spinner />;

  if (selected) {
    return <MemberDetail emp={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="md-page">
      <div className="md-page-header-row">
        <h2 className="md-page-heading">Team Members</h2>
        <div className="md-search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            placeholder="Search name or role…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="md-search"
          />
        </div>
      </div>

      {error && <ErrorMsg msg={error} />}
      {searching && <div style={{ color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Searching…</div>}

      <div className="md-members-grid">
        {team.map((m) => (
          <div key={m.id} className="md-member-card" onClick={() => setSelected(m)}>
            <Avatar initials={getInitials(m.name)} size={52} color={pickColor(m.id)} />
            <div className="md-mc-info">
              <div className="md-mc-name">{m.name}</div>
              <div className="md-mc-role">{m.designation}</div>
              <div className="md-mc-dept">{m.departmentName}</div>
            </div>
            <StatusBadge status={statusFromEmployee(m)} />
            <div className="md-mc-arrow">→</div>
          </div>
        ))}
        {team.length === 0 && !searching && (
          <div style={{ color: "rgba(255,255,255,0.4)", gridColumn: "1/-1", padding: 20 }}>
            No team members found.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Notifications Page ───────────────────────────────────────────────────────
function PageNotifications() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllNotifications();
        setNotes(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotes((n) => n.map((x) => ({ ...x, unread: false, read: true })));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleMarkOne = async (notif) => {
    try {
      await markNotificationRead(notif.id);
      setNotes((ns) =>
        ns.map((x) => (x.id === notif.id ? { ...x, unread: false, read: true } : x))
      );
    } catch {}
  };

  if (loading) return <Spinner />;

  const isUnread = (n) => n.unread === true || n.read === false;

  return (
    <div className="md-page">
      <div className="md-page-header-row">
        <h2 className="md-page-heading">Notifications</h2>
        <button className="md-text-btn" onClick={handleMarkAll}>Mark all read</button>
      </div>

      {error && <ErrorMsg msg={error} />}

      <div className="md-panel">
        {notes.length === 0 && (
          <div style={{ color: "rgba(255,255,255,0.4)", padding: 20 }}>No notifications</div>
        )}
        {notes.map((n) => (
          <div
            key={n.id}
            className={`md-notif-row ${isUnread(n) ? "unread" : ""}`}
            onClick={() => handleMarkOne(n)}
          >
            <div className="md-notif-icon">
              {n.type === "LEAVE" ? <ClipboardList size={16} /> : n.type === "ATTENDANCE" ? <Clock size={16} /> : <Bell size={16} />}
            </div>
            <div className="md-notif-body">
              <div className="md-notif-text">{n.message}</div>
              <div className="md-notif-time">
                {n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : ""}
              </div>
            </div>
            {isUnread(n) && <div className="md-notif-dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Apply Leave Page ─────────────────────────────────────────────────────────
function PageApplyLeave() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const empId = storedUser?.employeeId || storedUser?.id;

  const [form, setForm] = useState({
    leaveType: "CASUAL",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    (async () => {
      if (!empId) return;
      try {
        const [hist, bal] = await Promise.allSettled([
          getLeaveHistory(empId),
          getLeaveBalance(empId),
        ]);
        if (hist.status === "fulfilled") setHistory(hist.value || []);
        if (bal.status === "fulfilled") setBalance(bal.value);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [empId]);

  const handleSubmit = async () => {
    if (!form.fromDate || !form.toDate || !form.reason.trim()) {
      setError("Please fill all fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await applyLeave({
        employeeId: empId,
        leaveType: form.leaveType,
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason,
      });
      setSuccess("Leave applied successfully!");
      setForm({ leaveType: "CASUAL", fromDate: "", toDate: "", reason: "" });
      // refresh history
      const hist = await getLeaveHistory(empId);
      setHistory(hist || []);
    } catch (e) {
      setError(e.message || "Failed to apply leave.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
    color: "#fff", fontSize: 13, padding: "10px 12px",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const labelStyle = {
    fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block",
  };

  const LEAVE_TYPES = ["CASUAL", "ANNUAL", "SICK", "UNPAID", "MATERNITY", "PATERNITY"];

  const statusColor = {
    APPROVED: "#10b981", PENDING: "#f59e0b", REJECTED: "#ef4444",
    APPLIED: "#f59e0b", CANCELLED: "#9b96b8",
  };

  return (
    <div className="md-page">
      <h2 className="md-page-heading">Apply Leave</h2>

      {/* ── Balance Cards ── */}
      {Array.isArray(balance) && balance.length > 0 && (
        <div className="md-stats-grid" style={{ marginBottom: 24 }}>
          {balance.map((item, idx) => (
            <div key={idx} className="md-stat-card" style={{ "--accent": "#7c5af0" }}>
              <div className="md-stat-body">
                <div className="md-stat-value">{item.total - item.used}</div>
                <div className="md-stat-label">{item.type}</div>
                <div className="md-stat-sub">days remaining</div>
              </div>
              <div className="md-stat-glow" />
            </div>
          ))}
        </div>
      )}

      {/* ── Apply Form ── */}
      <div className="md-panel" style={{ marginBottom: 24 }}>
        <h3 className="md-panel-title">New Leave Request</h3>

        {error   && <ErrorMsg msg={error} />}
        {success && (
          <div style={{
            background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
            color: "#6ee7b7", borderRadius: 10, padding: "12px 16px", marginBottom: 16,
          }}>
             {success}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Leave Type</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={form.leaveType}
              onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
            >
              {LEAVE_TYPES.map(t => (
                <option key={t} value={t} style={{ background: "#1e1740" }}>{t}</option>
              ))}
            </select>
          </div>

          <div />

          <div>
            <label style={labelStyle}>From Date</label>
            <input
              type="date"
              style={inputStyle}
              value={form.fromDate}
              onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))}
            />
          </div>

          <div>
            <label style={labelStyle}>To Date</label>
            <input
              type="date"
              style={inputStyle}
              value={form.toDate}
              onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Reason</label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
            placeholder="Reason for leave..."
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            background: submitting ? "rgba(124,90,240,0.4)" : "#7c5af0",
            color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 24px", cursor: submitting ? "not-allowed" : "pointer",
            fontSize: 14, fontWeight: 600,
          }}
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>

      {/* ── Leave History ── */}
      <div className="md-panel">
        <h3 className="md-panel-title">My Leave History</h3>
        {loadingData ? <Spinner /> : history.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.4)", padding: 16 }}>No leave history found.</div>
        ) : (
          <div className="md-table-wrap">
            <table className="md-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={h.id || i}>
                    <td>{h.leaveType}</td>
                    <td>{h.startDate || h.fromDate}</td>
                    <td>{h.endDate || h.toDate}</td>
                    <td>{h.totalDays ?? "—"}</td>
                    <td>{h.reason}</td>
                    <td>
                      <span style={{
                        color: statusColor[h.status] || "#fff",
                        fontWeight: 600, fontSize: 12,
                      }}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "home",       icon: <Home size={18} />,          label: "Overview"        },
  { id: "attendance", icon: <ClipboardList size={18} />, label: "Team Attendance" },
  { id: "approvals",  icon: <ClipboardList size={18} />, label: "Leave Approvals" },
  { id: "members",    icon: <Users size={18} />,         label: "Team Members"    },
  { id: "calendar",   icon: <CalIcon size={18} />,       label: "Calendar"        },
  { id: "interviews", icon: <CalIcon size={18} />,       label: "Interviews"      },
  { id: "reviews",    icon: <Award size={18} />,         label: "Performance"     },
  { id: "kudos",      icon: <Star size={18} />,          label: "Kudos"           },
  { id: "myleave",    icon: <Umbrella size={18} />,      label: "My Leave"        },
  { id: "notifs",     icon: <Bell size={18} />,          label: "Notifications"   },
];

// ─── Root Dashboard Component ─────────────────────────────────────────────────
export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const p = await getManagerProfile();
        setProfile(p);
      } catch {}
      try {
        const leaves = await getPendingLeaves();
        setPendingCount((leaves || []).length);
      } catch {}
      try {
        const notifs = await getAllNotifications();
        setUnreadCount((notifs || []).filter((n) => n.unread || n.read === false).length);
      } catch {}
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const PAGE = {
    home:       <PageHome />,
    attendance: <PageTeamAttendance />,
    approvals:  <PageLeaveApprovals />,
    members:    <PageTeamMembers />,
    calendar:   <PageCalendar />,
    interviews: <PageInterviews />,
    reviews:    <PagePerformanceReview managerProfile={profile} />,
    kudos:      <PageKudos />,
    myleave:    <PageApplyLeave />,
    notifs:     <PageNotifications />,
  };

  const storedUser      = JSON.parse(localStorage.getItem("user") || "{}");
  const managerName     = profile?.name || storedUser?.name || "Manager";
  const managerRole     = storedUser?.role === "MANAGER" ? "Manager" : profile?.designation || "Manager";
  const managerInitials = getInitials(managerName);

  return (
    <div className="md-shell">
      <aside className={`md-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Logo />
        <nav className="md-nav">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`md-nav-item ${active === n.id ? "active" : ""}`}
              onClick={() => { setActive(n.id); setSidebarOpen(false); }}
            >
              <span className="md-nav-icon" style={{ display: "flex", alignItems: "center" }}>{n.icon}</span>
              <span className="md-nav-label">{n.label}</span>
              {n.id === "approvals" && pendingCount > 0 && (
                <span className="md-nav-badge">{pendingCount}</span>
              )}
              {n.id === "notifs" && unreadCount > 0 && (
                <span className="md-nav-badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="md-sidebar-footer">
          <Avatar initials={managerInitials} size={34} color="#06b6d4" />
          <div className="md-sidebar-user">
            <div className="md-sidebar-name">{managerName}</div>
            <div className="md-sidebar-role">{managerRole}</div>
          </div>
          <button className="md-logout-btn" onClick={handleLogout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="md-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="md-main">
        <header className="md-topbar">
          <button className="md-hamburger" onClick={() => setSidebarOpen((s) => !s)}>
            <span /><span /><span />
          </button>
          <div className="md-topbar-title">
            {NAV.find((n) => n.id === active)?.label}
          </div>
          <button className="md-topbar-notif" onClick={() => setActive("notifs")}>
            <Bell size={18} />{unreadCount > 0 && <span className="md-notif-badge">{unreadCount}</span>}
          </button>
        </header>

        <div className="md-content">{PAGE[active]}</div>
      </main>

      <FloatingAI />
    </div>
  );
}
