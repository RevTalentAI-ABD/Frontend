import React, { useState, useEffect, useCallback } from "react";
import "../styles/ManagerDashboard.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import {
  getManagerDashboard,
  getManagerActivity,
  getManagerProfile,
  getTeam,
  searchTeam,
  getAllAttendance,
  getAttendanceSummary,
  exportAttendance,
  getAllLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getAllNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/api";
import { useNavigate } from "react-router-dom";


function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function statusFromEmployee(emp) {
  const s = (emp.status || "").toUpperCase();
  if (s === "WFH") return "WFH";
  if (s === "PRESENT" || s === "ACTIVE") return "Present";
  if (s === "ON_LEAVE" || s === "LEAVE") return "On Leave";
  if (s === "ABSENT") return "Absent";
  return emp.status || "Unknown";
}

const AVATAR_COLORS = [
  "#7c5af0", "#10b981", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6",
];
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
    <div
      className="md-avatar"
      style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}
    >
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
      ⚠️ {msg}
    </div>
  );
}

// ─── Overview Page ────────────────────────────────────────────────────────────
function PageHome() {
  const [dashboard, setDashboard] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [dash, act] = await Promise.all([
          getManagerDashboard(),
          getManagerActivity(),
        ]);
        setDashboard(dash);
        setActivity(act || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  const present    = dashboard?.presentCount   ?? 0;
  const wfh        = dashboard?.wfhCount        ?? 0;
  const absent     = dashboard?.absentCount     ?? 0;
  const onLeave    = dashboard?.onLeaveCount    ?? 0;
  const teamSize   = dashboard?.teamSize        ?? (present + wfh + absent + onLeave);
  const pending    = dashboard?.pendingLeaves   ?? 0;

  const PIE_DATA = [
    { name: "Present",  value: present,  color: "#10b981" },
    { name: "WFH",      value: wfh,      color: "#06b6d4" },
    { name: "On Leave", value: onLeave,  color: "#f59e0b" },
    { name: "Absent",   value: absent,   color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="md-page">
      <div className="md-welcome-banner">
        <div>
          <p className="md-welcome-date">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
          <h2 className="md-welcome-heading">Good morning</h2>
          <p className="md-welcome-sub">
            You have <strong>{pending} pending leave requests</strong> and{" "}
            <strong>{absent} absent today</strong>.
          </p>
        </div>
        <div className="md-banner-tag" />
      </div>

      <div className="md-stats-grid">
        <StatCard icon="👥" label="Team Size"         value={teamSize} sub="total members"  color="#7c5af0" />
        <StatCard icon="🟢" label="Present Today"     value={present}  sub="in office"      color="#10b981" />
        <StatCard icon="🏠" label="WFH Today"         value={wfh}      sub="remote"         color="#06b6d4" />
        <StatCard icon="📋" label="Pending Approvals" value={pending}  sub="need action"    color="#f59e0b" />
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
                <span className="md-activity-icon">{a.icon || "📌"}</span>
                <div className="md-activity-text">{a.text || a.message || a.description}</div>
                <div className="md-activity-time">{a.time || a.timestamp}</div>
              </div>
            ))}
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
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [all, summary] = await Promise.all([
          getAllAttendance(),
          getAttendanceSummary(),
        ]);
        setAttendance(all || []);
        // summary is array of {week, present, absent, leave} or similar
        setWeeklyData(Array.isArray(summary) ? summary : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statuses = ["All", "PRESENT", "WFH", "ABSENT", "ON_LEAVE"];
  const displayLabel = { PRESENT: "Present", WFH: "WFH", ABSENT: "Absent", ON_LEAVE: "On Leave" };

  const filtered = filter === "All"
    ? attendance
    : attendance.filter((a) => (a.attendanceType || a.status || "").toUpperCase() === filter);

  const handleExport = async () => {
    try { await exportAttendance(); }
    catch (e) { alert("Export failed: " + e.message); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="md-page">
      <div className="md-page-header-row">
        <h2 className="md-page-heading">Team Attendance</h2>
        <button className="md-primary-btn" onClick={handleExport}>📥 Export</button>
      </div>

      {error && <ErrorMsg msg={error} />}

      <div className="md-filter-tabs">
        {statuses.map((s) => (
          <button key={s}
            className={`md-filter-tab ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}>
            {s === "All" ? "All" : (displayLabel[s] || s)}
          </button>
        ))}
      </div>

      <div className="md-team-grid">
        {filtered.map((m, i) => (
          <div key={m.id || i} className="md-team-attendance-card">
            <Avatar initials={getInitials(m.employeeName)} size={44} color={pickColor(m.employeeId || i)} />
            <div className="md-tac-info">
              <div className="md-tac-name">{m.employeeName}</div>
              <div className="md-tac-role">{m.department || m.employeeCode}</div>
            </div>
            <StatusBadge status={m.attendanceType || m.status} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: "rgba(255,255,255,0.4)", gridColumn: "1/-1", padding: 20 }}>
            No records found.
          </div>
        )}
      </div>

      {weeklyData.length > 0 && (
        <div className="md-panel">
          <h3 className="md-panel-title">Weekly Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: "#9b96b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9b96b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1e1740", border: "none", borderRadius: 10, color: "#fff" }} />
              <Bar dataKey="present" fill="#10b981" radius={[4,4,0,0]} name="Present" />
              <Bar dataKey="absent"  fill="#ef4444" radius={[4,4,0,0]} name="Absent" />
              <Bar dataKey="leave"   fill="#f59e0b" radius={[4,4,0,0]} name="Leave" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Leave Approvals Page ─────────────────────────────────────────────────────
function PageLeaveApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getPendingLeaves();
        setRequests(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handle = async (id, action) => {
    setActionError("");
    try {
      if (action === "approve") {
        await approveLeave(id);
      } else {
        await rejectLeave(id, "");
      }
      setRequests((rs) =>
        rs.map((r) =>
          r.id === id
            ? { ...r, status: action === "approve" ? "APPROVED" : "REJECTED" }
            : r
        )
      );
    } catch (e) {
      setActionError(e.message);
    }
  };

  const pending = requests.filter(
    (r) => !r.status || r.status === "PENDING" || r.status === "Pending"
  );
  const done = requests.filter(
    (r) => r.status && r.status !== "PENDING" && r.status !== "Pending"
  );

  if (loading) return <Spinner />;

  return (
    <div className="md-page">
      <div className="md-page-header-row">
        <h2 className="md-page-heading">Leave Approvals</h2>
        <span className="md-count-badge">{pending.length} pending</span>
      </div>

      {error && <ErrorMsg msg={error} />}
      {actionError && <ErrorMsg msg={actionError} />}

      {pending.length === 0 && (
        <div className="md-empty-state">All caught up! No pending requests.</div>
      )}

      {pending.map((r) => {
        const name = r.employeeName || `Employee #${r.employeeId}`;
        const days = r.totalDays ?? "?";
        return (
          <div key={r.id} className="md-leave-request-card">
            <div className="md-lr-top">
              <Avatar initials={getInitials(name)} size={44} color={pickColor(r.employeeId)} />
              <div className="md-lr-info">
                <div className="md-lr-name">{name}</div>
                <div className="md-lr-details">
                  <span className="md-lr-type">{r.leaveType} Leave</span>
                  <span className="md-lr-dates">
                    {r.startDate} – {r.endDate} ({days} day{days !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="md-lr-reason">"{r.reason}"</div>
              </div>
              <div className="md-lr-actions">
                <button className="md-approve-btn" onClick={() => handle(r.id, "approve")}>✓ Approve</button>
                <button className="md-reject-btn"  onClick={() => handle(r.id, "reject")}>✕ Reject</button>
              </div>
            </div>
          </div>
        );
      })}

      {done.length > 0 && (
        <div className="md-panel">
          <h3 className="md-panel-title">Processed Requests</h3>
          {done.map((r) => {
            const name = r.employeeName || `Employee #${r.employeeId}`;
            return (
              <div key={r.id} className="md-lr-done-row">
                <Avatar initials={getInitials(name)} size={36} color={pickColor(r.employeeId)} />
                <div className="md-lr-done-info">
                  <span className="md-lr-done-name">{name}</span>
                  <span className="md-lr-done-detail">
                    {r.leaveType} · {r.startDate}–{r.endDate}
                  </span>
                </div>
                <StatusBadge status={r.status} />
              </div>
            );
          })}
        </div>
      )}
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
      // reset to full team
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
    const emp = selected;
    return (
      <div className="md-page">
        <button className="md-back-btn" onClick={() => setSelected(null)}>← Back to Team</button>
        <div className="md-member-profile">
          <Avatar initials={getInitials(emp.name)} size={72} color={pickColor(emp.id)} />
          <div>
            <div className="md-mp-name">{emp.name}</div>
            <div className="md-mp-role">{emp.designation} · {emp.departmentName}</div>
            <StatusBadge status={statusFromEmployee(emp)} />
          </div>
        </div>
        <div className="md-stats-grid">
          <StatCard icon="📅" label="Attendance"   value={"—"} sub="% this month"  color="#7c5af0" />
          <StatCard icon="🏖️" label="Leaves Used"  value={"—"} sub="this year"     color="#f59e0b" />
          <StatCard icon="⭐" label="Performance"  value={"—"} sub="score"         color="#10b981" />
          <StatCard icon="🕐" label="Avg Hours"    value={"—"} sub="per day"       color="#06b6d4" />
        </div>
        <div className="md-panel">
          <h3 className="md-panel-title">Contact Information</h3>
          <div className="md-contact-grid">
            {[
              ["Email",        emp.email],
              ["Department",   emp.departmentName],
              ["Designation",  emp.designation],
              ["Employee Code",emp.employeeCode],
              ["Phone",        emp.phone],
              ["Status",       emp.status],
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

// ─── Reports Page ─────────────────────────────────────────────────────────────
function PageReports() {
  const [team, setTeam] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [t, summary] = await Promise.all([getTeam(), getAttendanceSummary()]);
        setTeam(t || []);
        setAttendanceData(Array.isArray(summary) ? summary : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="md-page">
      <h2 className="md-page-heading">Reports</h2>
      {error && <ErrorMsg msg={error} />}

      <div className="md-stats-grid">
        <StatCard icon="📅" label="Team Size"         value={team.length} sub="members"       color="#7c5af0" />
        <StatCard icon="🟢" label="Active Members"    value={team.filter(e=>e.status?.toUpperCase()==="ACTIVE"||e.status?.toUpperCase()==="PRESENT").length} sub="in office" color="#10b981" />
        <StatCard icon="📊" label="Leave Records"     value={"—"}         sub="this month"    color="#f59e0b" />
        <StatCard icon="🕐" label="Avg Hours/Week"    value={"—"}         sub="per member"    color="#06b6d4" />
      </div>

      <div className="md-two-col">
        {attendanceData.length > 0 && (
          <div className="md-panel">
            <h3 className="md-panel-title">Monthly Attendance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: "#9b96b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9b96b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1e1740", border: "none", borderRadius: 10, color: "#fff" }} />
                <Bar dataKey="present" fill="#7c5af0" radius={[4,4,0,0]} name="Present" />
                <Bar dataKey="absent"  fill="#ef4444" radius={[4,4,0,0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="md-panel">
          <h3 className="md-panel-title">Department Distribution</h3>
          {(() => {
            const deptMap = {};
            team.forEach((e) => {
              const d = e.departmentName || "Unknown";
              deptMap[d] = (deptMap[d] || 0) + 1;
            });
            const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));
            const COLORS = ["#7c5af0", "#10b981", "#06b6d4", "#f59e0b", "#ef4444"];
            return deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>
                    {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e1740", border: "none", borderRadius: 10, color: "#fff" }} />
                  <Legend iconType="circle" iconSize={8}
                    formatter={(v) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.4)" }}>No data</div>
            );
          })()}
        </div>
      </div>

      <div className="md-panel">
        <h3 className="md-panel-title">Team Summary</h3>
        <div className="md-table-wrap">
          <table className="md-table">
            <thead>
              <tr>
                <th>Member</th><th>Role</th><th>Department</th>
                <th>Employee Code</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {team.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="md-table-member">
                      <Avatar initials={getInitials(m.name)} size={28} color={pickColor(m.id)} />
                      {m.name}
                    </div>
                  </td>
                  <td>{m.designation}</td>
                  <td>{m.departmentName}</td>
                  <td>{m.employeeCode}</td>
                  <td><StatusBadge status={statusFromEmployee(m)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              {n.type === "LEAVE" ? "📋" : n.type === "ATTENDANCE" ? "📅" : "🔔"}
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

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "home",       icon: "🏠", label: "Overview"        },
  { id: "attendance", icon: "📅", label: "Team Attendance" },
  { id: "approvals",  icon: "📋", label: "Leave Approvals" },
  { id: "members",    icon: "👥", label: "Team Members"    },
  { id: "reports",    icon: "📊", label: "Reports"         },
  { id: "notifs",     icon: "🔔", label: "Notifications"   },
];

// ─── Root Dashboard Component ─────────────────────────────────────────────────
export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load profile + badge counts once
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
    reports:    <PageReports />,
    notifs:     <PageNotifications />,
  };

  const managerName    = profile?.name        || "Manager";
  const managerRole    = profile?.designation || "Manager";
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
              <span className="md-nav-icon">{n.icon}</span>
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
            🔔{unreadCount > 0 && <span className="md-notif-badge">{unreadCount}</span>}
          </button>
        </header>

        <div className="md-content">{PAGE[active]}</div>
      </main>
    </div>
  );
}
