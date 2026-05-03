import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EmployeeDashboard.css";
import api from "../api/axiosConfig";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

// ── HELPERS ───────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="ed-logo">
      <div className="ed-logo-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
          <rect x="13" y="2" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
          <rect x="2" y="13" width="9" height="9" rx="2" fill="white" opacity="0.6"/>
          <rect x="13" y="13" width="9" height="9" rx="2" fill="white" opacity="0.9"/>
        </svg>
      </div>
      <span className="ed-logo-text">Rev<span>Talent</span></span>
    </div>
  );
}

function Avatar({ initials, size = 36, color = "#7c5af0" }) {
  return (
    <div className="ed-avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  const [count, setCount] = useState(0);
  const num = parseFloat(value);
  useEffect(() => {
    if (isNaN(num)) return;
    let start = 0;
    const step = num / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(t); }
      else setCount(Math.floor(start * 10) / 10);
    }, 20);
    return () => clearInterval(t);
  }, [num]);
  return (
    <div className="ed-stat-card" style={{ "--accent": color }}>
      <div className="ed-stat-icon">{icon}</div>
      <div className="ed-stat-body">
        <div className="ed-stat-value">{isNaN(num) ? value : (Number.isInteger(num) ? count : count.toFixed(1))}</div>
        <div className="ed-stat-label">{label}</div>
        {sub && <div className="ed-stat-sub">{sub}</div>}
      </div>
      <div className="ed-stat-glow" />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Approved: "badge-green", Pending: "badge-yellow",
    Rejected: "badge-red", Ready: "badge-purple", Downloaded: "badge-gray"
  };
  return <span className={`ed-badge ${map[status] || ""}`}>{status}</span>;
}

// ── PAGES ─────────────────────────────────────────────────────────────────────

function PageHome({ employee, attendance }) {
  const [clocked, setClocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const toggle = () => {
    if (!clocked) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    setClocked(c => !c);
  };
  useEffect(() => () => clearInterval(timerRef.current), []);

  const fmt = s =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const presentDays = attendance.filter(a => a.status === "PRESENT").length;

  return (
    <div className="ed-page">
      {/* Welcome Banner */}
      <div className="ed-welcome-banner">
        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#1e1740" }}>
            Welcome back, {employee?.name?.split(" ")[0] || "there"} 👋
          </h2>
          <p style={{ margin: "4px 0 0", color: "#9b96b8", fontSize: "14px" }}>
            {employee?.designation || "Employee"} · {employee?.departmentName || "—"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
          {clocked && (
            <span style={{ fontFamily: "monospace", fontSize: "18px", color: "#7c5af0", fontWeight: 700 }}>
              {fmt(elapsed)}
            </span>
          )}
          <button onClick={toggle} style={{
            background: clocked ? "#ef4444" : "#7c5af0",
            color: "white", border: "none", borderRadius: "10px",
            padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: "14px"
          }}>
            {clocked ? "⏹ Clock Out" : "▶ Clock In"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="ed-stats-grid">
        <StatCard icon="🏖️" label="Leave Balance"  value={employee?.leaveBalance ?? "—"} sub="days remaining" color="#7c5af0"/>
        <StatCard icon="📅" label="Present Days"    value={presentDays}                    sub="this month"     color="#06b6d4"/>
        <StatCard icon="💰" label="Employee ID"     value={employee?.employeeCode ?? "—"} sub="your ID"        color="#f59e0b"/>
        <StatCard icon="🏢" label="Department"      value={employee?.departmentName ?? "—"} sub="your team"    color="#10b981"/>
      </div>

      {/* Announcements */}
      <div className="ed-panel">
        <h3 className="ed-panel-title">Announcements</h3>
        <div className="ed-announcements">
          <div className="ed-announce-item">
            <span className="ed-announce-dot" style={{ background: "#f59e0b" }}/>
            <span>Q2 performance reviews begin next week.</span>
          </div>
          <div className="ed-announce-item">
            <span className="ed-announce-dot" style={{ background: "#10b981" }}/>
            <span>New leave policy effective from June 1st.</span>
          </div>
          <div className="ed-announce-item">
            <span className="ed-announce-dot" style={{ background: "#7c5af0" }}/>
            <span>Team outing scheduled for end of month.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageAttendance({ attendance }) {
  const chartData = attendance.slice(-7).map(a => ({
    day: new Date(a.date).toLocaleDateString("en-US", { weekday: "short" }),
    hours: a.hoursWorked || 0
  }));

  const present  = attendance.filter(a => a.status === "PRESENT").length;
  const absent   = attendance.filter(a => a.status === "ABSENT").length;
  const leave    = attendance.filter(a => a.status === "ON_LEAVE").length;
  const avgHours = attendance.length
    ? (attendance.reduce((s, a) => s + (a.hoursWorked || 0), 0) / attendance.length).toFixed(1)
    : 0;

  return (
    <div className="ed-page">
      <h2 className="ed-page-heading">Attendance</h2>

      <div className="ed-panel">
        <h3 className="ed-panel-title">Weekly Hours</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c5af0" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#7c5af0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,90,240,0.1)"/>
              <XAxis dataKey="day" tick={{ fill: "#9b96b8", fontSize: 12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: "#9b96b8", fontSize: 12 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: "#1e1740", border: "none", borderRadius: 10, color: "#fff" }}/>
              <Area type="monotone" dataKey="hours" stroke="#7c5af0" strokeWidth={2.5} fill="url(#hoursGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: "#9b96b8", textAlign: "center", padding: "40px 0" }}>No attendance data yet.</p>
        )}
      </div>

      <div className="ed-stats-grid">
        <StatCard icon="✅" label="Present Days"  value={present}   sub="this month" color="#10b981"/>
        <StatCard icon="❌" label="Absent Days"   value={absent}    sub="this month" color="#ef4444"/>
        <StatCard icon="🏖️" label="Leave Days"   value={leave}     sub="this month" color="#f59e0b"/>
        <StatCard icon="⏱️" label="Avg Hrs/Day"  value={avgHours}  sub="this month" color="#7c5af0"/>
      </div>

      <div className="ed-panel">
        <h3 className="ed-panel-title">Recent Records</h3>
        <div className="ed-table-wrap">
          <table className="ed-table">
            <thead>
              <tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#9b96b8", padding: "20px" }}>No records found</td></tr>
              ) : (
                attendance.slice(-10).reverse().map((a, i) => (
                  <tr key={i}>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>{a.checkIn || "—"}</td>
                    <td>{a.checkOut || "—"}</td>
                    <td>{a.hoursWorked ? `${a.hoursWorked}h` : "—"}</td>
                    <td><StatusBadge status={a.status === "PRESENT" ? "Approved" : a.status === "ABSENT" ? "Rejected" : "Pending"}/></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PageLeave({ leaves, leaveHistory, employeeId, onLeaveApplied }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ type: "CASUAL", from: "", to: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]       = useState("");

  const handleSubmit = async () => {
    if (!form.from || !form.to || !form.reason) return;
    setSubmitting(true);
    try {
      await api.post("/api/leaves/apply", {
        employeeId: employeeId,
        leaveType:  form.type,
        fromDate:  form.from,
        toDate:    form.to,
        reason:     form.reason,
      });
      setToast("✅ Leave request submitted!");
      setShowForm(false);
      setForm({ type: "CASUAL", from: "", to: "", reason: "" });
      onLeaveApplied();
      setTimeout(() => setToast(""), 3000);
    } catch {
      setToast("❌ Failed to submit. Try again.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ed-page">
      <div className="ed-page-header-row">
        <h2 className="ed-page-heading">Leave Management</h2>
        <button className="ed-primary-btn" onClick={() => setShowForm(s => !s)}>
          {showForm ? "✕ Cancel" : "+ Apply Leave"}
        </button>
      </div>

      {toast && <div className="ed-success-toast">{toast}</div>}

      {showForm && (
        <div className="ed-panel ed-form-panel">
          <h3 className="ed-panel-title">New Leave Request</h3>
          <div className="ed-form-grid">
            <div className="ed-form-field">
              <label>Leave Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="CASUAL">Casual</option>
                <option value="SICK">Sick</option>
                <option value="EARNED">Earned</option>
              </select>
            </div>
            <div className="ed-form-field">
              <label>From Date</label>
              <input type="date" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}/>
            </div>
            <div className="ed-form-field">
              <label>To Date</label>
              <input type="date" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}/>
            </div>
            <div className="ed-form-field ed-form-full">
              <label>Reason</label>
              <textarea rows={3} value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Brief reason..."/>
            </div>
          </div>
          <button className="ed-primary-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      )}

      <div className="ed-leave-balance-grid">
        {leaves.length === 0 ? (
          <p style={{ color: "#9b96b8" }}>No leave balance data available.</p>
        ) : (
          leaves.map((l, i) => (
            <div key={i} className="ed-leave-card" style={{ "--lc": "#7c5af0" }}>
              <div className="ed-leave-type">{l.type} Leave</div>
              <div className="ed-leave-numbers">
                <span className="ed-leave-used">{l.used}</span>
                <span className="ed-leave-sep">/</span>
                <span className="ed-leave-total">{l.total}</span>
              </div>
              <div className="ed-leave-bar-bg">
                <div className="ed-leave-bar-fill" style={{ width: `${(l.used / l.total) * 100 }%` }}/>
              </div>
              <div className="ed-leave-remaining">{l.total - l.used} days remaining</div>
            </div>
          ))
        )}
      </div>

      <div className="ed-panel">
        <h3 className="ed-panel-title">Leave History</h3>
        <div className="ed-table-wrap">
          <table className="ed-table">
            <thead>
              <tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr>
            </thead>
            <tbody>
              {leaveHistory.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#9b96b8", padding: "20px" }}>No history found</td></tr>
              ) : (
                leaveHistory.map((r, i) => (
                  <tr key={i}>
                    <td>{r.leaveType}</td>
                    <td>{r.startDate}</td>
                    <td>{r.endDate}</td>
                    <td>{r.days || "—"}</td>
                    <td>{r.reason}</td>
                    <td><StatusBadge status={r.status}/></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PagePayroll({ payslips }) {
  const [expanded, setExpanded] = useState(false);
  const latest = payslips[0] || null;

  return (
    <div className="ed-page">
      <h2 className="ed-page-heading">Payroll</h2>

      <div className="ed-payslip-hero">
        <div className="ed-payslip-month">
          {latest
            ? new Date(latest.payPeriodStart || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })
            : "No payslip yet"}
        </div>
        <div className="ed-payslip-amounts">
          <div>
            <div className="ed-ps-label">Gross Salary</div>
            <div className="ed-ps-amount">₹{latest?.grossSalary?.toLocaleString() ?? "—"}</div>
          </div>
          <div className="ed-ps-divider"/>
          <div>
            <div className="ed-ps-label">Net Take Home</div>
            <div className="ed-ps-amount ed-ps-net">₹{latest?.netSalary?.toLocaleString() ?? "—"}</div>
          </div>
        </div>
        <button className="ed-download-btn" onClick={() => alert("Downloading payslip...")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Payslip
        </button>
      </div>

      {latest && (
        <div className="ed-panel">
          <div className="ed-panel-header">
            <h3 className="ed-panel-title">Salary Breakdown</h3>
            <button className="ed-text-btn" onClick={() => setExpanded(e => !e)}>
              {expanded ? "Hide" : "Show"} details
            </button>
          </div>
          <div className={`ed-breakdown-list ${expanded ? "expanded" : ""}`}>
            {[
              { label: "Basic Salary",  amount: latest.basicSalary,  type: "credit" },
              { label: "HRA",           amount: latest.hra,           type: "credit" },
              { label: "Allowances",    amount: latest.allowances,    type: "credit" },
              { label: "Tax (TDS)",     amount: latest.taxDeduction,  type: "debit"  },
              { label: "PF Deduction",  amount: latest.pfDeduction,   type: "debit"  },
            ].filter(item => item.amount).map((item, i) => (
              <div key={i} className="ed-breakdown-row">
                <span className="ed-breakdown-label">{item.label}</span>
                <span className={`ed-breakdown-amount ${item.type === "debit" ? "debit" : ""}`}>
                  {item.type === "debit" ? "-" : "+"} ₹{item.amount?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ed-panel">
        <h3 className="ed-panel-title">Payslip History</h3>
        {payslips.length === 0 ? (
          <p style={{ color: "#9b96b8", padding: "20px", textAlign: "center" }}>No payslips yet.</p>
        ) : (
          payslips.map((p, i) => (
            <div key={i} className="ed-payslip-row">
              <div>
                <div className="ed-ps-row-month">
                  {new Date(p.payPeriodStart || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
                <div className="ed-ps-row-net">₹{p.netSalary?.toLocaleString()}</div>
              </div>
              <div className="ed-ps-row-right">
                <StatusBadge status={p.status === "PAID" ? "Approved" : "Pending"}/>
                <button className="ed-icon-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PageProfile({ employee, onProfileUpdated }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");
  const [info, setInfo]       = useState({
    name:  employee?.name  || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    dept:  employee?.departmentName || "",
  });

  const save = async () => {
    setSaving(true);
    try {
      // ✅ Correct endpoint from your controller: PATCH /api/employees/{id}
      await api.patch(`/api/employees/${employee.id}`, {
        name:  info.name,
        email: info.email,
        phone: info.phone,
      });
      setEditing(false);
      setToast("✅ Profile updated!");
      onProfileUpdated();
      setTimeout(() => setToast(""), 3000);
    } catch {
      setToast("❌ Update failed.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ed-page">
      <h2 className="ed-page-heading">My Profile</h2>
      {toast && <div className="ed-success-toast">{toast}</div>}

      <div className="ed-profile-hero">
        <Avatar initials={employee?.name?.charAt(0) || "?"} size={72} color="#7c5af0"/>
        <div>
          <div className="ed-profile-name">{employee?.name}</div>
          <div className="ed-profile-role">{employee?.designation || "Employee"} · {employee?.departmentName || "—"}</div>
          <div className="ed-profile-meta">ID: {employee?.employeeCode || "—"} · Joined {employee?.joiningDate || "—"}</div>
        </div>
        <button className="ed-primary-btn" style={{ marginLeft: "auto" }}
          onClick={() => editing ? save() : setEditing(true)} disabled={saving}>
          {saving ? "Saving..." : editing ? "💾 Save Changes" : "✏️ Edit Profile"}
        </button>
      </div>

      <div className="ed-panel">
        <h3 className="ed-panel-title">Personal Information</h3>
        <div className="ed-form-grid">
          {[["Full Name","name"],["Email","email"],["Phone","phone"],["Department","dept"]].map(([label, key]) => (
            <div key={key} className="ed-form-field">
              <label>{label}</label>
              {editing && key !== "dept"
                ? <input value={info[key]} onChange={e => setInfo(i => ({ ...i, [key]: e.target.value }))}/>
                : <div className="ed-profile-value">{info[key] || "—"}</div>
              }
            </div>
          ))}
        </div>
      </div>

      <div className="ed-panel">
        <h3 className="ed-panel-title">Change Password</h3>
        <div className="ed-form-grid">
          <div className="ed-form-field"><label>Current Password</label><input type="password" placeholder="••••••••"/></div>
          <div className="ed-form-field"><label>New Password</label><input type="password" placeholder="••••••••"/></div>
          <div className="ed-form-field"><label>Confirm Password</label><input type="password" placeholder="••••••••"/></div>
        </div>
        <button className="ed-primary-btn" style={{ marginTop: 8 }}>Update Password</button>
      </div>
    </div>
  );
}

function PageNotifications({ notifications, setNotifications }) {
  const markAll = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  return (
    <div className="ed-page">
      <div className="ed-page-header-row">
        <h2 className="ed-page-heading">Notifications</h2>
        <button className="ed-text-btn" onClick={markAll}>Mark all as read</button>
      </div>
      <div className="ed-panel">
        {notifications.length === 0 ? (
          <p style={{ color: "#9b96b8", textAlign: "center", padding: "40px 0" }}>No notifications yet.</p>
        ) : (
          notifications.map((n, i) => (
            <div key={i}
              className={`ed-notif-row ${!n.read ? "unread" : ""}`}
              onClick={() => setNotifications(ns => ns.map((x, j) => j === i ? { ...x, read: true } : x))}
            >
              <div className="ed-notif-icon">🔔</div>
              <div className="ed-notif-body">
                <div className="ed-notif-text">{n.message}</div>
                <div className="ed-notif-time">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</div>
              </div>
              {!n.read && <div className="ed-notif-dot"/>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "home",          icon: "🏠", label: "Home"          },
  { id: "attendance",    icon: "📅", label: "Attendance"    },
  { id: "leave",         icon: "🏖️", label: "Leave"        },
  { id: "payroll",       icon: "💰", label: "Payroll"       },
  { id: "profile",       icon: "👤", label: "Profile"       },
  { id: "notifications", icon: "🔔", label: "Notifications" },
];

// ── MAIN SHELL ────────────────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [active,         setActive]         = useState("home");
  const [sidebarOpen,    setSidebarOpen]     = useState(false);
  const [loading,        setLoading]         = useState(true);
  const [error,          setError]           = useState("");
  const [employee,       setEmployee]        = useState(null);
  const [attendance,     setAttendance]      = useState([]);
  const [leaves,         setLeaves]          = useState([]);
  const [leaveHistory,   setLeaveHistory]    = useState([]);
  const [payslips,       setPayslips]        = useState([]);
  const [notifications,  setNotifications]   = useState([]);

  const fetchDashboard = async () => {
    try {
      // ✅ Correct URL from your controller: GET /api/me
      const empRes = await api.get("/api/me");
      setEmployee(empRes.data);
      const empId = empRes.data.id;

      // ✅ Other endpoints — update these when you share other controllers
      const [attRes, leaveBalRes, leaveHistRes, payRes, notifRes] = await Promise.allSettled([
        api.get(`/api/attendance/employee/${empId}`),
        api.get(`/api/leaves/balance/${empId}`),
        api.get(`/api/leaves/history/${empId}`),
        api.get(`/api/payroll/employee/${empId}`),
        api.get(`/api/notifications/${empId}`),
      ]);

      if (attRes.status      === "fulfilled") setAttendance(attRes.value.data);
      if (leaveBalRes.status === "fulfilled") setLeaves(leaveBalRes.value.data);
      if (leaveHistRes.status === "fulfilled") setLeaveHistory(leaveHistRes.value.data);
      if (payRes.status      === "fulfilled") setPayslips(payRes.value.data);
      if (notifRes.status    === "fulfilled") setNotifications(notifRes.value.data);

    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate("/login");
      } else {
        setError("Failed to load dashboard. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const unread = notifications.filter(n => !n.read).length;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "48px", height: "48px", border: "4px solid rgba(124,90,240,0.2)",
        borderTop: "4px solid #7c5af0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <p style={{ color: "#9b96b8" }}>Loading your dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", flexDirection: "column", gap: "16px" }}>
      <p style={{ color: "#ef4444", fontSize: "16px" }}>{error}</p>
      <button onClick={fetchDashboard} style={{ background: "#7c5af0", color: "white",
        border: "none", borderRadius: "8px", padding: "10px 24px", cursor: "pointer" }}>
        Retry
      </button>
    </div>
  );

  const PAGE = {
    home:          <PageHome employee={employee} attendance={attendance}/>,
    attendance:    <PageAttendance attendance={attendance}/>,
    leave:         <PageLeave leaves={leaves} leaveHistory={leaveHistory}
                     employeeId={employee?.id} onLeaveApplied={fetchDashboard}/>,
    payroll:       <PagePayroll payslips={payslips}/>,
    profile:       <PageProfile employee={employee} onProfileUpdated={fetchDashboard}/>,
    notifications: <PageNotifications notifications={notifications} setNotifications={setNotifications}/>,
  };

  return (
    <div className="ed-shell">
      <aside className={`ed-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Logo/>
        <nav className="ed-nav">
          {NAV.map(n => (
            <button key={n.id}
              className={`ed-nav-item ${active === n.id ? "active" : ""}`}
              onClick={() => { setActive(n.id); setSidebarOpen(false); }}>
              <span className="ed-nav-icon">{n.icon}</span>
              <span className="ed-nav-label">{n.label}</span>
              {n.id === "notifications" && unread > 0 && (
                <span className="ed-nav-badge">{unread}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="ed-sidebar-footer">
          <Avatar initials={employee?.name?.charAt(0) || "?"} size={34} color="#7c5af0"/>
          <div className="ed-sidebar-user">
            <div className="ed-sidebar-name">{employee?.name}</div>
            <div className="ed-sidebar-role">{employee?.designation || employee?.role}</div>
          </div>
          <button className="ed-logout-btn" onClick={handleLogout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="ed-overlay" onClick={() => setSidebarOpen(false)}/>}

      <main className="ed-main">
        <header className="ed-topbar">
          <button className="ed-hamburger" onClick={() => setSidebarOpen(s => !s)}>
            <span/><span/><span/>
          </button>
          <div className="ed-topbar-title">{NAV.find(n => n.id === active)?.label}</div>
          <button className="ed-topbar-notif" onClick={() => setActive("notifications")}>
            🔔 {unread > 0 && <span className="ed-notif-badge">{unread}</span>}
          </button>
        </header>
        <div className="ed-content">{PAGE[active]}</div>
      </main>
    </div>
  );
}