import React, { useEffect, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";

function authHeaders() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

const BASE_URL = "http://localhost:8080/api";

const COLORS = [
  "#7C3AED","#06B6D4","#10B981","#EC4899",
  "#F59E0B","#8B5CF6","#14B8A6","#EF4444","#3B82F6","#F97316",
];
const colorFor = (id) => COLORS[Number(id) % COLORS.length];

function getDisplayName(e) {
  if (e.name && e.name.trim()) return e.name.trim();
  if (e.email) return e.email.split("@")[0];
  return "Unknown";
}

function getInitials(name) {
  return name.split(" ").map((n) => n[0] || "").join("").slice(0, 2).toUpperCase();
}

export default function PageEmployees() {
  const [employees, setEmployees]           = useState([]);
  const [loading,   setLoading]             = useState(true);
  const [search,    setSearch]              = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  async function loadEmployees() {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/employees`, { headers: authHeaders() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.content || data.data || []);
      setEmployees(list);
    } catch (err) {
      console.error("loadEmployees error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEmployees(); }, []);

  const filtered = useMemo(() => {
    let list = employees;
    if (showActiveOnly) list = list.filter((e) => (e.status || "ACTIVE").toUpperCase() === "ACTIVE");
    const q = search.toLowerCase().trim();
    if (q) list = list.filter((e) =>
      (e.name || "").toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q) ||
      (e.departmentName || "").toLowerCase().includes(q)
    );
    return list;
  }, [employees, search, showActiveOnly]);

  async function toggleStatus(emp) {
    const next = (emp.status || "ACTIVE").toUpperCase() === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setEmployees((prev) => prev.map((e) => e.id === emp.id ? { ...e, status: next } : e));
    try {
      const res = await fetch(`${BASE_URL}/employees/${emp.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ ...emp, status: next }),
      });
      if (!res.ok) loadEmployees();
    } catch { loadEmployees(); }
  }

  if (loading) return (
    <div style={S.loadWrap}>
      <div style={S.spinner} />
      <span style={{ color: "#7B7890", fontSize: 14, marginTop: 12 }}>Loading employees…</span>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Employee Management</h1>
        <button
          style={{ ...S.filterBtn, ...(showActiveOnly ? S.filterBtnActive : {}) }}
          onClick={() => setShowActiveOnly((p) => !p)}
        >
          {showActiveOnly ? "All Employees" : "Active Employees"}
        </button>
      </div>

      <div style={S.searchWrap}>
        <input
          style={S.searchInput}
          type="text"
          placeholder="Search by name, email, department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {["Employee", "Department", "Role", "Status", "Actions"].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => {
              const status      = (emp.status || "ACTIVE").toUpperCase();
              const displayName = getDisplayName(emp);
              return (
                <tr key={emp.id} style={S.tr}>
                  <td style={S.td}>
                    <div style={S.userCell}>
                      <div style={{ ...S.avatar, background: colorFor(emp.id) }}>
                        {getInitials(displayName)}
                      </div>
                      <div>
                        <div style={S.empName}>{displayName}</div>
                        <div style={S.empEmail}>{emp.email || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={S.td}>{emp.departmentName || "—"}</td>
                  <td style={S.td}>
                    <span style={S.roleBadge}>{emp.role || "EMPLOYEE"}</span>
                  </td>
                  <td style={S.td}>
                    <span style={{
                      ...S.statusBadge,
                      background: status === "ACTIVE" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
                      color:      status === "ACTIVE" ? "#10B981" : "#F87171",
                    }}>
                      {status}
                    </span>
                  </td>
                  <td style={S.td}>
                    <button style={S.actionBtn} onClick={() => toggleStatus(emp)}>
                      {status === "ACTIVE"
                        ? <><Pause size={13} style={{ marginRight: 4 }} />Inactive</>
                        : <><Play  size={13} style={{ marginRight: 4 }} />Active</>}
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2.5rem", color: "#4E4B63", fontSize: 14 }}>
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const S = {
  page:     { background: "#13111C", minHeight: "100vh", padding: "36px 40px", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#E2E0EA" },
  loadWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#13111C" },
  spinner:  { width: 36, height: 36, border: "3px solid #2A2640", borderTopColor: "#7C3AED", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  header:   { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title:    { fontSize: 26, fontWeight: 700, color: "#F0EEF8", margin: 0 },
  filterBtn:       { background: "transparent", border: "1px solid #2A2640", borderRadius: 8, color: "#7B7890", fontSize: 13, fontWeight: 600, padding: "8px 18px", cursor: "pointer" },
  filterBtnActive: { borderColor: "#7C3AED", color: "#A78BFA" },
  searchWrap:  { marginBottom: 20 },
  searchInput: { width: "100%", maxWidth: 360, background: "#1C1929", border: "1px solid #2A2640", borderRadius: 10, padding: "10px 16px", color: "#E2E0EA", fontSize: 14, outline: "none", boxSizing: "border-box" },
  tableWrap: { background: "#1C1929", border: "1px solid #2A2640", borderRadius: 14, overflow: "hidden" },
  table:     { width: "100%", borderCollapse: "collapse" },
  th:        { padding: "13px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: "#5B5773", textAlign: "left", borderBottom: "1px solid #2A2640", background: "#181525" },
  tr:        { borderBottom: "1px solid #1E1B2E" },
  td:        { padding: "14px 16px", fontSize: 13, color: "#C4C0D8", verticalAlign: "middle" },
  userCell:  { display: "flex", alignItems: "center", gap: 10 },
  avatar:    { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 },
  empName:   { fontSize: 13, fontWeight: 600, color: "#E8E6F4" },
  empEmail:  { fontSize: 11, color: "#5B5773", marginTop: 2 },
  roleBadge:   { fontSize: 11, fontWeight: 600, background: "rgba(124,58,237,0.15)", color: "#A78BFA", borderRadius: 20, padding: "3px 10px" },
  statusBadge: { fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "4px 10px" },
  actionBtn:   { display: "flex", alignItems: "center", background: "#251F38", border: "1px solid #312B4A", borderRadius: 7, color: "#C4C0D8", fontSize: 12, fontWeight: 600, padding: "6px 14px", cursor: "pointer" },
};