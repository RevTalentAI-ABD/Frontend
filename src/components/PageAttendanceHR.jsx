import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import { Avatar } from "./UI";
import api from "./api";

const getAllAttendance   = async () => (await api.get("/api/attendance")).data;
const getAttendanceSummary = async () => (await api.get("/api/attendance/summary")).data;
const getMyAttendance   = async () => (await api.get("/api/attendance/my")).data;

// ── Helpers ───────────────────────────────────────────────────────────────────
function toDateKey(r) {
  const raw = r.workDate || (r.checkIn ? r.checkIn : null);
  return raw ? raw.split("T")[0] : "unknown";
}
function todayKey() { return new Date().toISOString().split("T")[0]; }
function yesterdayKey() {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
function formatDayLabel(key) {
  if (key === "unknown") return "Unknown Date";
  if (key === todayKey()) return "Today";
  if (key === yesterdayKey()) return "Yesterday";
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}
function fmtTime(val) {
  if (!val) return "—";
  return new Date(val).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Spinner() {
  return <div style={{ textAlign: "center", padding: "40px", color: "#9b96b8" }}>Loading...</div>;
}
function ErrorMsg({ msg }) {
  return (
    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
      {msg}
    </div>
  );
}
function StatusBadge({ status }) {
  const map = {
    PRESENT:  { label: "Present",  color: "#10b981", bg: "rgba(16,185,129,0.15)"  },
    WFH:      { label: "WFH",      color: "#06b6d4", bg: "rgba(6,182,212,0.15)"   },
    ON_LEAVE: { label: "On Leave", color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
    ABSENT:   { label: "Absent",   color: "#ef4444", bg: "rgba(239,68,68,0.15)"   },
  };
  const s = map[status] || { label: status || "—", color: "#9b96b8", bg: "rgba(155,150,184,0.1)" };
  return (
    <div style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
      {s.label}
    </div>
  );
}
function getDeptLabel(m) {
  if (m.department && m.department !== "N/A" && m.department.trim()) return m.department;
  if (m.employeeCode && m.employeeCode.trim()) return m.employeeCode;
  return "—";
}
function statusFromRecord(m) {
  const s = (m.status || "").toUpperCase();
  if (s === "WFH") return "WFH";
  if (s === "PRESENT") return "PRESENT";
  if (s === "ON_LEAVE") return "ON_LEAVE";
  return "ABSENT";
}

// ── Day filter pills ──────────────────────────────────────────────────────────
function DayFilterBar({ allDays, selectedDay, setSelectedDay }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginRight: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Day</span>
      {allDays.map((key) => {
        const active = selectedDay === key;
        return (
          <button key={key} onClick={() => setSelectedDay(key)} style={{
            padding: "6px 14px", borderRadius: 20,
            border: active ? "1px solid #7c5af0" : "1px solid rgba(255,255,255,0.1)",
            background: active ? "rgba(124,90,240,0.2)" : "rgba(255,255,255,0.04)",
            color: active ? "#a78bfa" : "#9b96b8",
            cursor: "pointer", fontWeight: 600, fontSize: 12, transition: "all 0.15s",
          }}>
            {formatDayLabel(key)}
          </button>
        );
      })}
    </div>
  );
}

// ── Status filter bar ─────────────────────────────────────────────────────────
function FilterBar({ statuses, filter, setFilter, displayLabel }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
      {statuses.map((s) => (
        <button key={s} onClick={() => setFilter(s)} style={{
          padding: "8px 16px", borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)",
          background: filter === s ? "#7c5af0" : "rgba(255,255,255,0.05)",
          color: filter === s ? "#fff" : "#9b96b8",
          cursor: "pointer", fontWeight: 600, fontSize: 13,
        }}>
          {s === "All" ? "All" : (displayLabel[s] || s)}
        </button>
      ))}
    </div>
  );
}

// ── Summary stat cards ────────────────────────────────────────────────────────
function SummaryCards({ records }) {
  const present = records.filter(r => ["PRESENT", "WFH"].includes((r.status || "").toUpperCase())).length;
  const absent  = records.filter(r => (r.status || "").toUpperCase() === "ABSENT").length;
  const leave   = records.filter(r => (r.status || "").toUpperCase() === "ON_LEAVE").length;
  const cards = [
    { label: "Total",    value: records.length, color: "#7c5af0" },
    { label: "Present",  value: present,         color: "#10b981" },
    { label: "Absent",   value: absent,           color: "#ef4444" },
    { label: "On Leave", value: leave,            color: "#f59e0b" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}33`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
          <div style={{ fontSize: 13, color: "#9b96b8", marginTop: 4 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Card grid ─────────────────────────────────────────────────────────────────
function AttendanceCardGrid({ records }) {
  if (records.length === 0)
    return <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 40, textAlign: "center", color: "#9b96b8", fontSize: 14, marginBottom: 32 }}>No records for this day.</div>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
      {records.map((m, i) => (
        <div key={m.id || i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar name={m.employeeName} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.employeeName}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{getDeptLabel(m)}</div>
            {m.checkIn && (
              <div style={{ fontSize: 11, color: "#9b96b8", marginTop: 2 }}>
                In: {fmtTime(m.checkIn)}{m.checkOut && ` · Out: ${fmtTime(m.checkOut)}`}
              </div>
            )}
          </div>
          <StatusBadge status={statusFromRecord(m)} />
        </div>
      ))}
    </div>
  );
}

// ── Detailed records table ────────────────────────────────────────────────────
function AttendanceTable({ records }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["Employee", "Department", "Date", "Check In", "Check Out", "Hours", "Type", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "#9b96b8" }}>No records found.</td></tr>
            ) : records.map((a, i) => (
              <tr key={a.id || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={a.employeeName} size={32} />
                    <span style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{a.employeeName || "—"}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#9b96b8" }}>{getDeptLabel(a)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#9b96b8", whiteSpace: "nowrap" }}>{fmtDate(a.workDate)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#9b96b8", whiteSpace: "nowrap" }}>{fmtTime(a.checkIn)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#9b96b8", whiteSpace: "nowrap" }}>{fmtTime(a.checkOut)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#9b96b8" }}>{a.durationMin ? `${(a.durationMin / 60).toFixed(1)}h` : "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#9b96b8" }}>{a.attendanceType || "—"}</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={statusFromRecord(a)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Weekly chart ──────────────────────────────────────────────────────────────
function WeeklyChart({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginTop: 32 }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: "#fff" }}>Weekly Attendance Overview</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barSize={20}>
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
  );
}

// ── MY ATTENDANCE TAB ─────────────────────────────────────────────────────────

// Today's check-in card for the HR
function MyTodayCard({ record }) {
  const status = record ? statusFromRecord(record) : null;
  const statusColors = {
    PRESENT:  "#10b981", WFH: "#06b6d4", ON_LEAVE: "#f59e0b", ABSENT: "#ef4444",
  };
  const color = status ? (statusColors[status] || "#9b96b8") : "#9b96b8";

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${color}40`,
      borderRadius: 20, padding: 28, marginBottom: 28,
      display: "flex", alignItems: "center", gap: 28,
    }}>
      {/* Left: big status */}
      <div style={{
        minWidth: 100, textAlign: "center",
        background: `${color}15`, borderRadius: 16,
        padding: "20px 16px",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Today</div>
        {record ? (
          <StatusBadge status={status} />
        ) : (
          <div style={{ fontSize: 12, color: "#9b96b8" }}>No record</div>
        )}
      </div>

      {/* Middle: check-in / check-out / hours */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {[
          { label: "Check In",  value: record ? fmtTime(record.checkIn)  : "—" },
          { label: "Check Out", value: record ? fmtTime(record.checkOut) : "—" },
          { label: "Hours",     value: record && record.durationMin ? `${(record.durationMin / 60).toFixed(1)}h` : "—" },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Right: date */}
      <div style={{ textAlign: "right", minWidth: 90 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Date</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
          {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
        {record && record.attendanceType && (
          <div style={{ fontSize: 11, color: "#9b96b8", marginTop: 4 }}>{record.attendanceType}</div>
        )}
      </div>
    </div>
  );
}

// Mini stat cards for my attendance summary
function MyStatCards({ records }) {
  const present = records.filter(r => ["PRESENT", "WFH"].includes((r.status || "").toUpperCase())).length;
  const wfh     = records.filter(r => (r.status || "").toUpperCase() === "WFH").length;
  const leave   = records.filter(r => (r.status || "").toUpperCase() === "ON_LEAVE").length;
  const absent  = records.filter(r => (r.status || "").toUpperCase() === "ABSENT").length;
  const totalHrs = records.reduce((s, r) => s + (r.durationMin || 0), 0);

  const cards = [
    { label: "Days Present", value: present,               color: "#10b981" },
    { label: "WFH Days",     value: wfh,                   color: "#06b6d4" },
    { label: "Leave Days",   value: leave,                  color: "#f59e0b" },
    { label: "Absent",       value: absent,                 color: "#ef4444" },
    { label: "Total Hours",  value: `${(totalHrs/60).toFixed(1)}h`, color: "#7c5af0" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}30`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
          <div style={{ fontSize: 12, color: "#9b96b8", marginTop: 3 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// Attendance history table for my records
function MyHistoryTable({ records }) {
  const sorted = [...records].sort((a, b) => {
    const ka = toDateKey(a), kb = toDateKey(b);
    return kb.localeCompare(ka);
  });

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>My Attendance History</span>
        <span style={{ fontSize: 12, color: "#9b96b8" }}>{records.length} records</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["Date", "Check In", "Check Out", "Hours", "Type", "Status"].map(h => (
                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#9b96b8" }}>No records found.</td></tr>
            ) : sorted.map((a, i) => {
              const isToday = toDateKey(a) === todayKey();
              return (
                <tr key={a.id || i} style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: isToday ? "rgba(124,90,240,0.06)" : "transparent",
                }}>
                  <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: isToday ? "#a78bfa" : "#fff", fontWeight: isToday ? 700 : 400 }}>
                        {fmtDate(a.workDate || a.checkIn)}
                      </span>
                      {isToday && <span style={{ fontSize: 10, background: "rgba(124,90,240,0.3)", color: "#a78bfa", padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>Today</span>}
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "#9b96b8", whiteSpace: "nowrap" }}>{fmtTime(a.checkIn)}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "#9b96b8", whiteSpace: "nowrap" }}>{fmtTime(a.checkOut)}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "#9b96b8" }}>{a.durationMin ? `${(a.durationMin / 60).toFixed(1)}h` : "—"}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "#9b96b8" }}>{a.attendanceType || "—"}</td>
                  <td style={{ padding: "11px 16px" }}><StatusBadge status={statusFromRecord(a)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Full "My Attendance" tab
function MyAttendanceTab() {
  const [myRecords, setMyRecords] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyAttendance();
        setMyRecords(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <ErrorMsg msg={error} />;

  const todayRecord = myRecords.find(r => toDateKey(r) === todayKey()) || null;

  return (
    <>
      {/* Today's card */}
      <MyTodayCard record={todayRecord} />

      {/* Summary stats across all records */}
      <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
        Overall Summary
      </div>
      <MyStatCards records={myRecords} />

      {/* Full history */}
      <MyHistoryTable records={myRecords} />
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PageAttendanceHR() {
  const [activeTab,     setActiveTab]     = useState("all");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [selectedDay,   setSelectedDay]   = useState(todayKey());
  const [attendance,    setAttendance]    = useState([]);
  const [weeklyData,    setWeeklyData]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [all, summary] = await Promise.all([getAllAttendance(), getAttendanceSummary()]);
        setAttendance(all || []);
        setWeeklyData(Array.isArray(summary) ? summary : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allDays = useMemo(() => {
    const keys = [...new Set(attendance.map(toDateKey))].filter(k => k !== "unknown");
    keys.sort((a, b) => b.localeCompare(a));
    if (!keys.includes(todayKey())) keys.unshift(todayKey());
    return keys;
  }, [attendance]);

  useEffect(() => {
    if (allDays.length > 0 && !allDays.includes(selectedDay)) setSelectedDay(allDays[0]);
  }, [allDays]);

  const statuses     = ["All", "PRESENT", "WFH", "ON_LEAVE", "ABSENT"];
  const displayLabel = { PRESENT: "Present", WFH: "WFH", ON_LEAVE: "On Leave", ABSENT: "Absent" };

  const dayRecords      = useMemo(() => attendance.filter(r => toDateKey(r) === selectedDay), [attendance, selectedDay]);
  const managersDay     = useMemo(() => dayRecords.filter(r => (r.employeeRole || r.role || "").toUpperCase() === "MANAGER"), [dayRecords]);
  const applyStatus     = (recs) => statusFilter === "All" ? recs : recs.filter(r => (r.status || "").toUpperCase() === statusFilter);
  const allFiltered     = applyStatus(dayRecords);
  const managersFiltered = applyStatus(managersDay);

  if (loading) return <Spinner />;

  const TABS = [
    { id: "all",      label: "All Employees"   },
    { id: "managers", label: "Managers Only"   },
    { id: "records",  label: "Detailed Records" },
    { id: "mine",     label: "My Attendance"   },
  ];

  const sharedFilters = (
    <>
      <DayFilterBar allDays={allDays} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
      <FilterBar statuses={statuses} filter={statusFilter} setFilter={setStatusFilter} displayLabel={displayLabel} />
    </>
  );

  return (
    <div className="hr-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#fff" }}>Attendance</h2>
      </div>

      {error && <ErrorMsg msg={error} />}

      {/* Tab switcher */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 24,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: 4, width: "fit-content",
      }}>
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => { setActiveTab(t.id); setStatusFilter("All"); }}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none",
              background: activeTab === t.id ? "#7c5af0" : "transparent",
              color: activeTab === t.id ? "#fff" : "#9b96b8",
              cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── All Employees ── */}
      {activeTab === "all" && (
        <>
          {sharedFilters}
          <SummaryCards records={dayRecords} />
          <AttendanceCardGrid records={allFiltered} />
          <WeeklyChart data={weeklyData} />
        </>
      )}

      {/* ── Managers Only ── */}
      {activeTab === "managers" && (
        <>
          {sharedFilters}
          <div style={{ background: "rgba(124,90,240,0.08)", border: "1px solid rgba(124,90,240,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#a78bfa" }}>
            Showing attendance records for employees with Manager role only.
            {managersDay.length === 0 && " Ensure your attendance API returns an employeeRole field on each record."}
          </div>
          <SummaryCards records={managersDay} />
          {managersDay.length > 0
            ? <AttendanceCardGrid records={managersFiltered} />
            : <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 40, textAlign: "center", color: "#9b96b8", fontSize: 14 }}>
                No manager records for this day. Make sure your API returns <code style={{ color: "#a78bfa" }}>employeeRole</code>.
              </div>
          }
        </>
      )}

      {/* ── Detailed Records ── */}
      {activeTab === "records" && (
        <>
          {sharedFilters}
          <SummaryCards records={dayRecords} />
          <AttendanceTable records={allFiltered} />
          <WeeklyChart data={weeklyData} />
        </>
      )}

      {/* ── My Attendance ── */}
      {activeTab === "mine" && <MyAttendanceTab />}
    </div>
  );
}