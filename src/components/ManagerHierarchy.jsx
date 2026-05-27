import { useState, useEffect, useCallback } from "react";
import { getApiRoot } from "../utils/apiBase";

const API_ROOT = getApiRoot();

function authHeaders() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

const api = {
  get: async (url) => {
    const res = await fetch(`${API_ROOT}${url}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`${res.status}`);
    return { data: await res.json() };
  },
  post: async (url, body) => {
    const res = await fetch(`${API_ROOT}${url}`, {
      method: "POST", headers: authHeaders(), body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return { data: await res.json() };
  },
};

const COLORS = [
  "#7C3AED","#06B6D4","#10B981","#EC4899",
  "#F59E0B","#8B5CF6","#14B8A6","#EF4444","#3B82F6","#F97316",
];
const colorFor = (id) => COLORS[Number(id) % COLORS.length];

function initials(name) {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => p[0] || "").join("").toUpperCase().slice(0, 2);
}

export default function OrgHierarchy() {
  const [managers,   setManagers]   = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // Add-employee modal (for unassigned)
  const [addModal,   setAddModal]   = useState(null); // { managerId, managerName }
  const [selected,   setSelected]   = useState([]);
  const [assigning,  setAssigning]  = useState(false);

  // Reassign modal (move between managers)
  const [reassignModal, setReassignModal] = useState(null); // { employee, fromManagerId }
  const [targetMgr,     setTargetMgr]     = useState(null);
  const [reassigning,   setReassigning]   = useState(false);

  // Unassign modal
  const [unassignModal, setUnassignModal] = useState(null); // { employee }
  const [unassigning,   setUnassigning]   = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchHierarchy = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [mgrRes, unRes] = await Promise.all([
        api.get("/api/hierarchy/managers"),
        api.get("/api/hierarchy/unassigned"),
      ]);
      setManagers(mgrRes.data   || []);
      setUnassigned(unRes.data  || []);
    } catch (err) {
      setError(err.message || "Failed to load hierarchy.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHierarchy(); }, [fetchHierarchy]);

  // ── Add unassigned modal ───────────────────────────────────────────────────
  const openAdd  = (mgr) => { setSelected([]); setAddModal({ managerId: mgr.id, managerName: mgr.name }); };
  const closeAdd = () => { setAddModal(null); setSelected([]); };
  const toggleSelect = (id) =>
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const assignEmployees = async () => {
    if (!addModal || selected.length === 0) return;
    try {
      setAssigning(true);
      await api.post("/api/hierarchy/assign", { managerId: addModal.managerId, employeeIds: selected });
      closeAdd();
      await fetchHierarchy();
    } catch (err) {
      alert(err.message || "Failed to assign.");
    } finally {
      setAssigning(false);
    }
  };

  // ── Reassign modal (between managers) ─────────────────────────────────────
  const openReassign  = (emp, fromManagerId) => {
    setTargetMgr(null);
    setReassignModal({ employee: emp, fromManagerId });
  };
  const closeReassign = () => { setReassignModal(null); setTargetMgr(null); };

  const confirmReassign = async () => {
    if (!reassignModal || !targetMgr) return;
    try {
      setReassigning(true);
      await api.post("/api/hierarchy/assign", {
        managerId:   targetMgr,
        employeeIds: [reassignModal.employee.id],
      });
      closeReassign();
      await fetchHierarchy();
    } catch (err) {
      alert(err.message || "Failed to reassign.");
    } finally {
      setReassigning(false);
    }
  };

  const openUnassign  = (emp) => setUnassignModal({ employee: emp });
  const closeUnassign = () => setUnassignModal(null);

  const confirmUnassign = async () => {
    if (!unassignModal) return;
    try {
      setUnassigning(true);
      await api.post("/api/hierarchy/unassign", {
        employeeIds: [unassignModal.employee.id],
      });
      closeUnassign();
      await fetchHierarchy();
    } catch (err) {
      alert(err.message || "Failed to unassign.");
    } finally {
      setUnassigning(false);
    }
  };

  const totalAssigned = managers.reduce((s, m) => s + (m.employees?.length ?? 0), 0);

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={S.spinner} />
        <span style={{ color:"#7B7890", fontSize:14 }}>Loading hierarchy…</span>
      </div>
    </div>
  );
  if (error) return (
    <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={S.errorBox}>
        <div style={{ fontSize:32, marginBottom:10 }}>⚠️</div>
        <div style={{ color:"#F87171", fontWeight:600, marginBottom:6 }}>Could not load hierarchy</div>
        <div style={{ color:"#7B7890", fontSize:13, marginBottom:18 }}>{error}</div>
        <button style={S.confirmBtn} onClick={fetchHierarchy}>Retry</button>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Organization Hierarchy</h1>
          <p style={S.subtitle}>
            {managers.length} manager{managers.length !== 1 ? "s" : ""} · {totalAssigned} assigned · {unassigned.length} unassigned
          </p>
        </div>
        <button style={S.refreshBtn} onClick={fetchHierarchy}>↻ Refresh</button>
      </div>

      {/* Managers */}
      <section>
        <div style={S.sectionLabel}>MANAGERS</div>
        {managers.length === 0
          ? <div style={S.emptyState}>No managers found.</div>
          : (
            <div style={S.managerGrid}>
              {managers.map((mgr) => (
                <div key={mgr.id} style={S.managerCard}>
                  {/* Manager header */}
                  <div style={S.managerHeader}>
                    <div style={{ ...S.avatar, background: colorFor(mgr.id) }}>{initials(mgr.name)}</div>
                    <div style={S.managerInfo}>
                      <div style={S.managerName}>{mgr.name}</div>
                      <div style={S.managerRole}>{mgr.role}{mgr.department ? ` · ${mgr.department}` : ""}</div>
                    </div>
                    <div style={S.roleBadge}>{mgr.role}</div>
                  </div>

                  <div style={S.divider} />

                  {/* Team */}
                  <div style={S.employeesLabel}>TEAM · {mgr.employees?.length ?? 0}</div>
                  <div style={S.employeeList}>
                    {(mgr.employees || []).map((emp) => (
                      <div key={emp.id} style={S.employeeChip}>
                        <div style={{ ...S.avatarSm, background: colorFor(emp.id) }}>{initials(emp.name)}</div>
                        <span style={S.empName}>{emp.name}</span>
                        {/* Reassign button */}
                        <button
                          style={S.reassignChipBtn}
                          title="Reassign to another manager"
                          onClick={() => openReassign(emp, mgr.id)}
                        >
                          ⇄
                        </button>
                        {/* Unassign button */}
                        <button
                          style={{ ...S.reassignChipBtn, color: "#EF4444", fontSize: 12, marginLeft: 0 }}
                          title="Unassign manager"
                          onClick={() => openUnassign(emp)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {unassigned.length > 0 && (
                      <button style={S.addBtn} onClick={() => openAdd(mgr)}>
                        <span style={{ fontSize:14, lineHeight:1 }}>＋</span> Add Employee
                      </button>
                    )}

                    {unassigned.length === 0 && (mgr.employees?.length ?? 0) === 0 && (
                      <div style={S.emptyTeam}>No employees assigned</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </section>

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <section style={{ marginTop:32 }}>
          <div style={S.sectionLabel}>UNASSIGNED EMPLOYEES</div>
          <div style={S.unassignedGrid}>
            {unassigned.map((emp) => (
              <div key={emp.id} style={S.unassignedCard}>
                <div style={{ ...S.avatar, background: colorFor(emp.id) }}>{initials(emp.name)}</div>
                <div>
                  <div style={S.managerName}>{emp.name}</div>
                  <div style={S.managerRole}>{emp.role}{emp.department ? ` · ${emp.department}` : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Add Unassigned Modal ── */}
      {addModal && (
        <div style={S.overlay} onClick={closeAdd}>
          <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>Add Employees to Manager</div>
            <div style={S.modalSubtitle}>Assigning to <strong>{addModal.managerName}</strong></div>
            <div style={S.empSelectList}>
              {unassigned.map((emp) => {
                const chosen = selected.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    style={{ ...S.empSelectRow, background: chosen ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.04)", border: chosen ? "1.5px solid #7C3AED" : "1.5px solid transparent" }}
                    onClick={() => toggleSelect(emp.id)}
                  >
                    <div style={{ ...S.avatarSm, background: colorFor(emp.id) }}>{initials(emp.name)}</div>
                    <div>
                      <div style={S.empName}>{emp.name}</div>
                      {emp.department && <div style={{ fontSize:11, color:"#5B5773" }}>{emp.department}</div>}
                    </div>
                    <div style={{ marginLeft:"auto" }}>
                      {chosen ? <span style={{ color:"#7C3AED", fontSize:18 }}>✓</span> : <span style={{ color:"#444", fontSize:18 }}>○</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={S.modalActions}>
              <button style={S.cancelBtn} onClick={closeAdd} disabled={assigning}>Cancel</button>
              <button
                style={{ ...S.confirmBtn, opacity: selected.length === 0 || assigning ? 0.5 : 1, cursor: selected.length === 0 || assigning ? "not-allowed" : "pointer" }}
                onClick={assignEmployees}
                disabled={selected.length === 0 || assigning}
              >
                {assigning ? "Assigning…" : `Assign${selected.length > 0 ? ` (${selected.length})` : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reassign Modal ── */}
      {reassignModal && (
        <div style={S.overlay} onClick={closeReassign}>
          <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>Reassign Employee</div>
            <div style={S.modalSubtitle}>
              Moving <strong style={{ color:"#E8E6F4" }}>{reassignModal.employee.name}</strong> to a new manager
            </div>

            <div style={S.empSelectList}>
              {managers
                .filter((m) => m.id !== reassignModal.fromManagerId)
                .map((mgr) => {
                  const chosen = targetMgr === mgr.id;
                  return (
                    <div
                      key={mgr.id}
                      style={{ ...S.empSelectRow, background: chosen ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.04)", border: chosen ? "1.5px solid #7C3AED" : "1.5px solid transparent" }}
                      onClick={() => setTargetMgr(mgr.id)}
                    >
                      <div style={{ ...S.avatarSm, background: colorFor(mgr.id) }}>{initials(mgr.name)}</div>
                      <div>
                        <div style={S.empName}>{mgr.name}</div>
                        {mgr.department && <div style={{ fontSize:11, color:"#5B5773" }}>{mgr.department}</div>}
                      </div>
                      <div style={{ marginLeft:"auto" }}>
                        {chosen ? <span style={{ color:"#7C3AED", fontSize:18 }}>✓</span> : <span style={{ color:"#444", fontSize:18 }}>○</span>}
                      </div>
                    </div>
                  );
                })}
              {managers.filter((m) => m.id !== reassignModal.fromManagerId).length === 0 && (
                <div style={{ color:"#4E4B63", fontSize:13, padding:12 }}>No other managers available.</div>
              )}
            </div>

            <div style={S.modalActions}>
              <button style={S.cancelBtn} onClick={closeReassign} disabled={reassigning}>Cancel</button>
              <button
                style={{ ...S.confirmBtn, opacity: !targetMgr || reassigning ? 0.5 : 1, cursor: !targetMgr || reassigning ? "not-allowed" : "pointer" }}
                onClick={confirmReassign}
                disabled={!targetMgr || reassigning}
              >
                {reassigning ? "Moving…" : "Confirm Reassign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Unassign Modal ── */}
      {unassignModal && (
        <div style={S.overlay} onClick={closeUnassign}>
          <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>Unassign Employee</div>
            <div style={S.modalSubtitle}>
              Are you sure you want to unassign <strong style={{ color:"#E8E6F4" }}>{unassignModal.employee.name}</strong> from this manager?
            </div>

            <div style={{ padding: "16px 20px", background: "rgba(239, 68, 68, 0.1)", borderRadius: 10, border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: 24 }}>
              <div style={{ color: "#FCA5A5", fontSize: 13 }}>
                They will be moved to the <strong>Unassigned Employees</strong> pool. You can reassign them later.
              </div>
            </div>

            <div style={S.modalActions}>
              <button style={S.cancelBtn} onClick={closeUnassign} disabled={unassigning}>Cancel</button>
              <button
                style={{ ...S.confirmBtn, background: "#EF4444", opacity: unassigning ? 0.5 : 1, cursor: unassigning ? "not-allowed" : "pointer" }}
                onClick={confirmUnassign}
                disabled={unassigning}
              >
                {unassigning ? "Unassigning…" : "Confirm Unassign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { background:"#13111C", minHeight:"100vh", padding:"36px 40px", fontFamily:"'Segoe UI', system-ui, sans-serif", color:"#E2E0EA" },
  header: { marginBottom:32, display:"flex", alignItems:"flex-start", justifyContent:"space-between" },
  title:  { fontSize:28, fontWeight:700, color:"#F0EEF8", margin:0, letterSpacing:"-0.3px" },
  subtitle: { fontSize:13, color:"#7B7890", margin:"6px 0 0" },
  refreshBtn: { background:"transparent", border:"1px solid #2A2640", borderRadius:8, color:"#7B7890", fontSize:13, fontWeight:600, padding:"7px 16px", cursor:"pointer" },
  sectionLabel: { fontSize:11, fontWeight:700, letterSpacing:"1.2px", color:"#5B5773", marginBottom:14 },
  managerGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:20 },
  managerCard: { background:"#1C1929", border:"1px solid #2A2640", borderRadius:14, padding:"20px 22px" },
  managerHeader: { display:"flex", alignItems:"center", gap:12 },
  avatar: { width:42, height:42, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 },
  managerInfo: { flex:1 },
  managerName: { fontSize:14, fontWeight:600, color:"#E8E6F4" },
  managerRole: { fontSize:12, color:"#7B7890", marginTop:2 },
  roleBadge: { fontSize:11, fontWeight:600, color:"#A78BFA", background:"rgba(124,58,237,0.15)", borderRadius:20, padding:"3px 10px" },
  divider: { height:1, background:"#2A2640", margin:"16px 0 12px" },
  employeesLabel: { fontSize:10, fontWeight:700, letterSpacing:"1px", color:"#4E4B63", marginBottom:10 },
  employeeList: { display:"flex", flexWrap:"wrap", gap:8 },
  employeeChip: { display:"flex", alignItems:"center", gap:7, background:"#251F38", borderRadius:20, padding:"5px 8px 5px 6px", border:"1px solid #312B4A" },
  avatarSm: { width:26, height:26, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff", flexShrink:0 },
  empName:  { fontSize:12, color:"#C4C0D8", fontWeight:500 },
  reassignChipBtn: {
    background:"transparent", border:"none", color:"#7C6FAA", fontSize:14,
    cursor:"pointer", padding:"0 2px", lineHeight:1, marginLeft:2,
    borderRadius:4, display:"flex", alignItems:"center",
  },
  addBtn: { display:"flex", alignItems:"center", gap:5, background:"transparent", border:"1.5px dashed #3D3660", borderRadius:20, padding:"5px 14px", color:"#7C6FAA", fontSize:12, fontWeight:600, cursor:"pointer" },
  emptyTeam:  { fontSize:12, color:"#3D3660", fontStyle:"italic" },
  emptyState: { fontSize:14, color:"#4E4B63", fontStyle:"italic", padding:"20px 0" },
  unassignedGrid: { display:"flex", flexWrap:"wrap", gap:12 },
  unassignedCard: { display:"flex", alignItems:"center", gap:12, background:"#1C1929", border:"1px solid #2A2640", borderRadius:12, padding:"12px 18px" },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  modalBox: { background:"#1C1929", border:"1px solid #2A2640", borderRadius:16, padding:"28px 28px 24px", width:400, maxWidth:"92vw" },
  modalTitle:    { fontSize:17, fontWeight:700, color:"#F0EEF8", marginBottom:6 },
  modalSubtitle: { fontSize:13, color:"#7B7890", marginBottom:20 },
  empSelectList: { display:"flex", flexDirection:"column", gap:8, marginBottom:22, maxHeight:280, overflowY:"auto" },
  empSelectRow:  { display:"flex", alignItems:"center", gap:10, borderRadius:10, padding:"10px 12px", cursor:"pointer" },
  modalActions:  { display:"flex", gap:10, justifyContent:"flex-end" },
  cancelBtn:  { background:"transparent", border:"1px solid #312B4A", borderRadius:8, color:"#7B7890", fontSize:13, fontWeight:600, padding:"8px 18px", cursor:"pointer" },
  confirmBtn: { background:"#7C3AED", border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:700, padding:"8px 20px" },
  spinner: { width:36, height:36, border:"3px solid #2A2640", borderTopColor:"#7C3AED", borderRadius:"50%", animation:"spin 0.8s linear infinite" },
  errorBox: { textAlign:"center", background:"#1C1929", border:"1px solid #2A2640", borderRadius:14, padding:"36px 40px" },
};