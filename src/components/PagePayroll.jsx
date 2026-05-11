import React, { useState, useMemo, useEffect, useCallback } from "react";
import { payrollAPI, employeeAPI } from "./api";
import { useToast } from "./hooks";
import { StatCard, Badge, Spinner, ErrorState, Toast } from "./UI";
import {
  IndianRupee, CheckCircle, Clock, Users, Zap, Play,
  CircleCheckBig, XCircle, CheckCircle2, Building2,
  ChevronDown, X, RefreshCw, UserCog, Layers, Briefcase,
  PenLine, Save, AlertCircle, Download,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function useToastHelpers(showToast) {
  return {
    ok:  (msg) => showToast(<span style={{ display:"flex", alignItems:"center", gap:8 }}><CheckCircle2 size={16} color="#22c55e"/> {msg}</span>),
    err: (msg) => showToast(<span style={{ display:"flex", alignItems:"center", gap:8 }}><XCircle     size={16} color="#ef4444"/> {msg}</span>),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TabPill
// ─────────────────────────────────────────────────────────────────────────────
function TabPill({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:"flex", alignItems:"center", gap:6,
        padding:"7px 18px", borderRadius:8, border:"none", cursor:"pointer",
        fontWeight:600, fontSize:13, transition:"all .15s",
        background: active ? "var(--hr-primary,#7c3aed)" : "transparent",
        color: active ? "#000" : "var(--hr-text-muted,#9ca3af)",
      }}
    >
      <Icon size={14}/>{label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown
// ─────────────────────────────────────────────────────────────────────────────
function Dropdown({ options, value, onChange, placeholder = "Select…" }) {
  const [open, setOpen] = useState(false);
  const chosen = options.find(o => (o.value ?? o) === value);

  useEffect(() => {
    if (!open) return;
    const h = () => setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div style={{ position:"relative" }}>
      <button
        onMouseDown={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:8, padding:"8px 12px", borderRadius:8, cursor:"pointer",
          border:"1px solid var(--hr-border,#e5e7eb)",
          background:"var(--hr-panel-bg,#000)", minWidth:180, fontSize:13,
          color: value ? "inherit" : "var(--hr-text-muted,#9ca3af)",
        }}
      >
        <span>{chosen ? (chosen.label ?? chosen) : placeholder}</span>
        <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition:".15s" }}/>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:60,
          minWidth:200, background:"var(--hr-panel-bg,#000)",
          border:"1px solid var(--hr-border,#e5e7eb)", borderRadius:10,
          boxShadow:"0 8px 24px rgba(0,0,0,0.13)", overflow:"hidden",
        }}>
          {options.map(o => {
            const val = o.value ?? o; const lbl = o.label ?? o;
            return (
              <button key={val}
                onMouseDown={e => { e.stopPropagation(); onChange(val); setOpen(false); }}
                style={{
                  display:"block", width:"100%", textAlign:"left",
                  padding:"9px 14px", border:"none", cursor:"pointer", fontSize:13,
                  background: val === value ? "rgba(124,58,237,.1)" : "transparent",
                  color: val === value ? "var(--hr-primary,#7c3aed)" : "inherit",
                  fontWeight: val === value ? 600 : 400,
                }}
              >{lbl}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Salary input
// ─────────────────────────────────────────────────────────────────────────────
function SalaryInput({ label, value, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
      <label style={{ fontSize:11, fontWeight:600, color:"var(--hr-text-muted,#9ca3af)", textTransform:"uppercase", letterSpacing:".05em" }}>{label}</label>
      <div style={{ display:"flex", alignItems:"stretch", border:"1px solid #d1d5db", borderRadius:8, background:"#fff" }}>
        <span style={{
          display:"flex", alignItems:"center", padding:"0 10px", fontSize:13,
          color:"#6b7280", background:"#f9fafb",
          borderRight:"1px solid #d1d5db", borderRadius:"8px 0 0 8px",
          flexShrink:0, userSelect:"none",
        }}>₹</span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="0"
          style={{
            flex:1, border:"none", outline:"none",
            padding:"10px 12px", fontSize:14,
            background:"#fff", color:"#1f2937",
            borderRadius:"0 8px 8px 0", minWidth:0,
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal shell
// ─────────────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}
    >
      <div
        style={{ background:"var(--hr-panel-bg,#fff)", borderRadius:16, padding:"28px 28px 24px", width, maxWidth:"95vw", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:17 }}>{title}</h3>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", color:"var(--hr-text-muted,#9ca3af)" }}><X size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual salary modal
// ─────────────────────────────────────────────────────────────────────────────
function IndividualSalaryModal({ employee, existingPayroll, onClose, onSave, saving, payMonth, payYear }) {
  const [form, setForm] = useState({
    basicSalary: String(existingPayroll?.basicSalary || ""),
    allowances:  String(existingPayroll?.allowances  || ""),
    deductions:  String(existingPayroll?.deductions  || ""),
  });

  const net = useMemo(() =>
    Math.max(0, Number(form.basicSalary||0) + Number(form.allowances||0) - Number(form.deductions||0)),
    [form]
  );

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const name = employee.name || employee.employeeName || employee.fullName || "Employee";

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <Modal title={`${existingPayroll ? "Edit" : "Assign"} Salary — ${name}`} onClose={onClose}>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

        {/* Month/Year info */}
        <div style={{ padding:"8px 12px", background:"rgba(124,58,237,.06)", borderRadius:8, fontSize:12, color:"var(--hr-text-muted,#9ca3af)" }}>
          Assigning for: <strong style={{ color:"inherit" }}>{MONTHS[payMonth - 1]} {payYear}</strong>
        </div>

        <SalaryInput label="Basic Salary" value={form.basicSalary} onChange={set("basicSalary")}/>
        <SalaryInput label="Allowances"   value={form.allowances}  onChange={set("allowances")}/>
        <SalaryInput label="Deductions"   value={form.deductions}  onChange={set("deductions")}/>

        <div style={{ padding:"10px 14px", background:"rgba(124,58,237,.07)", borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, color:"var(--hr-text-muted,#9ca3af)" }}>Net Salary</span>
          <span style={{ fontWeight:700, fontSize:16 }}>{fmt(net)}</span>
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:4 }}>
          <button className="hr-outline-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            className="hr-primary-btn"
            disabled={saving || !form.basicSalary}
            onClick={() => onSave({
              employee,
              existingPayroll,
              dto: {
                basicSalary: Number(form.basicSalary),
                allowances:  Number(form.allowances),
                deductions:  Number(form.deductions),
                netSalary:   net,
                payMonth,        // ← fix: include month
                payYear,         // ← fix: include year
              },
            })}
          >
            <Save size={14}/>
            <span style={{ marginLeft:5 }}>{saving ? "Saving…" : "Save & Generate"}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bulk modal (by dept / role)
// ─────────────────────────────────────────────────────────────────────────────
function BulkSalaryModal({ mode, options, employees, payrollList, preselect, onClose, onSave, saving, payMonth, payYear }) {
  const [selected, setSelected] = useState(preselect || "");
  const [form, setForm]         = useState({ basicSalary:"", allowances:"", deductions:"" });
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const net = useMemo(() =>
    Math.max(0, Number(form.basicSalary||0) + Number(form.allowances||0) - Number(form.deductions||0)),
    [form]
  );

  const affected = useMemo(() => {
    if (!selected) return [];
    return employees.filter(e =>
      mode === "department" ? e.departmentName === selected : e.designation === selected
    );
  }, [selected, employees, mode]);

  const label = mode === "department" ? "Department" : "Role";
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <Modal title={`Assign Salary by ${label}`} onClose={onClose} width={520}>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

        {/* Month/Year info */}
        <div style={{ padding:"8px 12px", background:"rgba(124,58,237,.06)", borderRadius:8, fontSize:12, color:"var(--hr-text-muted,#9ca3af)" }}>
          Assigning for: <strong style={{ color:"inherit" }}>{MONTHS[payMonth - 1]} {payYear}</strong>
        </div>

        <div>
          <label style={{ fontSize:11, fontWeight:600, color:"var(--hr-text-muted,#9ca3af)", textTransform:"uppercase", letterSpacing:".05em", display:"block", marginBottom:6 }}>
            Select {label}
          </label>
          <Dropdown
            options={options.map(o => ({ value: o, label: o }))}
            value={selected}
            onChange={setSelected}
            placeholder={`Choose ${label}…`}
          />
          {selected && (
            <p style={{ margin:"6px 0 0", fontSize:12, color:"var(--hr-text-muted,#9ca3af)" }}>
              {affected.length} employee{affected.length !== 1 ? "s" : ""} will be updated
            </p>
          )}
        </div>

        <SalaryInput label="Basic Salary" value={form.basicSalary} onChange={set("basicSalary")}/>
        <SalaryInput label="Allowances"   value={form.allowances}  onChange={set("allowances")}/>
        <SalaryInput label="Deductions"   value={form.deductions}  onChange={set("deductions")}/>

        <div style={{ padding:"10px 14px", background:"rgba(124,58,237,.07)", borderRadius:8, display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:13, color:"var(--hr-text-muted,#9ca3af)" }}>Net per Employee</span>
          <span style={{ fontWeight:700, fontSize:16 }}>{fmt(net)}</span>
        </div>

        {affected.length > 0 && (
          <div style={{ maxHeight:130, overflowY:"auto", borderRadius:8, border:"1px solid var(--hr-border,#e5e7eb)", padding:"8px 12px" }}>
            {affected.map(e => (
              <div key={e.id} style={{ fontSize:12, padding:"3px 0", display:"flex", justifyContent:"space-between" }}>
                <span>{e.name || e.employeeName}</span>
                <span style={{ color:"var(--hr-text-muted,#9ca3af)" }}>{e.designation || "—"}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:4 }}>
          <button className="hr-outline-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            className="hr-primary-btn"
            disabled={saving || !selected || !form.basicSalary}
            onClick={() => onSave({
              employees: affected,
              payrollList,
              dto: {
                basicSalary: Number(form.basicSalary),
                allowances:  Number(form.allowances),
                deductions:  Number(form.deductions),
                netSalary:   net,
                payMonth,        // ← fix: include month
                payYear,         // ← fix: include year
              },
            })}
          >
            <Save size={14}/>
            <span style={{ marginLeft:5 }}>{saving ? "Saving…" : `Apply to ${affected.length} Employees`}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function PagePayroll() {
  const { toast, showToast } = useToast();
  const { ok, err } = useToastHelpers(showToast);

  const [employees,   setEmployees]   = useState([]);
  const [payrollList, setPayrollList] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadError,   setLoadError]   = useState("");

  const [tab,         setTab]         = useState("payroll");
  const [assignMode,  setAssignMode]  = useState("individual");
  const [deptFilter,  setDeptFilter]  = useState("");
  const [roleFilter,  setRoleFilter]  = useState("");
  const [modal,       setModal]       = useState(null);

  const [processing,  setProcessing]  = useState(false);
  const [generating,  setGenerating]  = useState(false);
  const [rowLoading,  setRowLoading]  = useState({});
  const [savingModal, setSavingModal] = useState(false);

  const now = new Date();
  const [genMonth, setGenMonth] = useState(now.getMonth() + 1);
  const [genYear,  setGenYear]  = useState(now.getFullYear());

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true); setLoadError("");
    try {
      const [empRes, payRes] = await Promise.all([
        employeeAPI.getAll(),
        payrollAPI.getAll(),
      ]);
      const empList = Array.isArray(empRes.data)
        ? empRes.data
        : empRes.data?.employees || empRes.data?.content || [];
      const payList = Array.isArray(payRes.data)
        ? payRes.data
        : payRes.data?.payrolls || payRes.data?.content || [];

      setEmployees(empList.filter(e => !e.deleted && e.status !== "DELETED"));
      setPayrollList(payList);
    } catch (e) {
      setLoadError(e?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const departments = useMemo(() =>
    [...new Set(employees.map(e => e.departmentName).filter(Boolean))].sort(), [employees]);
  const roles = useMemo(() =>
    [...new Set(employees.map(e => e.designation).filter(Boolean))].sort(), [employees]);

  const filteredPayroll = useMemo(() => {
    return payrollList;
  }, [payrollList]);

  const processed = payrollList.filter(p => (p.status||"").toUpperCase() === "PROCESSED").length;
  const pending   = payrollList.filter(p => (p.status||"").toUpperCase() !== "PROCESSED").length;
  const totalNet  = payrollList.reduce((s,p) => s + Number(p.netSalary||0), 0);

  const findPayroll = (emp) =>
    payrollList.find(p =>
      String(p.employeeId || p.empId) === String(emp.id) ||
      (p.employeeName||"").toLowerCase() === (emp.name||emp.employeeName||"").toLowerCase()
    );

  // ── Generate payroll ───────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await payrollAPI.generate(genMonth, genYear);
      await loadAll();
      ok(`Payroll generated for ${genMonth}/${genYear}!`);
    } catch (e) {
      err(e?.response?.data?.message || "Failed to generate payroll");
    } finally { setGenerating(false); }
  };

  // ── Process all ───────────────────────────────────────────────────────────
  const handleProcessAll = async () => {
    setProcessing(true);
    try {
      await payrollAPI.processAll();
      await loadAll();
      ok("All payroll processed!");
    } catch {
      err("Failed to process all payroll");
    } finally { setProcessing(false); }
  };

  // ── Process single row ────────────────────────────────────────────────────
  const handleProcessOne = async (payrollId) => {
    setRowLoading(p => ({ ...p, [payrollId]: true }));
    try {
      await payrollAPI.processOne(payrollId);
      await loadAll();
      ok("Payroll processed!");
    } catch {
      err("Failed to process");
    } finally {
      setRowLoading(p => ({ ...p, [payrollId]: false }));
    }
  };

  // ── Download salary slip ───────────────────────────────────────────────────
  const handleDownloadSlip = async (payrollId) => {
    try {
      const res = await payrollAPI.downloadSlip(payrollId);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a   = document.createElement("a");
      a.href = url; a.download = `salary-slip-${payrollId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      err("Failed to download salary slip");
    }
  };

  // ── Save individual salary ─────────────────────────────────────────────────
  const handleSaveIndividual = async ({ employee, existingPayroll, dto }) => {
    setSavingModal(true);
    try {
      if (existingPayroll?.id) {
        await payrollAPI.update(existingPayroll.id, dto);
      } else {
        await payrollAPI.assignSalary(employee.id, dto);
      }
      await loadAll();
      ok("Salary saved!");
      setModal(null);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data || "Failed to assign salary";
      console.error("Assign salary error:", e?.response);
      err(typeof msg === "string" ? msg : "Failed to assign salary");
    } finally {
      setSavingModal(false);
    }
  };

  // ── Save bulk salary ───────────────────────────────────────────────────────
  const handleSaveBulk = async ({ employees: targets, payrollList: pList, dto }) => {
    setSavingModal(true);
    try {
      await Promise.all(
        targets.map(emp => {
          const existing = pList.find(p =>
            String(p.employeeId || p.empId) === String(emp.id)
          );
          return existing?.id
            ? payrollAPI.update(existing.id, dto)
            : payrollAPI.assignSalary(emp.id, dto);
        })
      );
      await loadAll();
      ok(`Salary assigned to ${targets.length} employees!`);
      setModal(null);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to assign bulk salary";
      console.error("Bulk assign error:", e?.response);
      err(typeof msg === "string" ? msg : "Failed to assign bulk salary");
    } finally {
      setSavingModal(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading)   return <Spinner />;
  if (loadError) return <ErrorState message={loadError} onRetry={loadAll} />;

  return (
    <div className="hr-page">
      <Toast message={toast} />

      {/* ── Modals ── */}
      {modal?.type === "individual" && (
        <IndividualSalaryModal
          employee={modal.employee}
          existingPayroll={modal.existingPayroll}
          onClose={() => setModal(null)}
          onSave={handleSaveIndividual}
          saving={savingModal}
          payMonth={genMonth}
          payYear={genYear}
        />
      )}
      {(modal?.type === "department" || modal?.type === "role") && (
        <BulkSalaryModal
          mode={modal.type}
          options={modal.type === "department" ? departments : roles}
          employees={employees}
          payrollList={payrollList}
          preselect={modal.preselect}
          onClose={() => setModal(null)}
          onSave={handleSaveBulk}
          saving={savingModal}
          payMonth={genMonth}
          payYear={genYear}
        />
      )}

      {/* ── Header ── */}
      <div className="hr-page-header-row">
        <h2 className="hr-page-heading">Payroll Management</h2>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          {employees.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <select
                value={genMonth}
                onChange={e => setGenMonth(Number(e.target.value))}
                style={{ padding:"7px 10px", borderRadius:8, border:"1px solid var(--hr-border,#e5e7eb)", fontSize:13, background:"var(--hr-panel-bg,#1e1b4b)", color:"inherit", cursor:"pointer" }}
              >
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i) => (
                  <option key={i+1} value={i+1}>{m}</option>
                ))}
              </select>
              <select
                value={genYear}
                onChange={e => setGenYear(Number(e.target.value))}
                style={{ padding:"7px 10px", borderRadius:8, border:"1px solid var(--hr-border,#e5e7eb)", fontSize:13, background:"var(--hr-panel-bg,#1e1b4b)", color:"inherit", cursor:"pointer" }}
              >
                {[2023,2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button
                className="hr-outline-btn"
                onClick={handleGenerate}
                disabled={generating}
                style={{ display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}
              >
                <RefreshCw size={15}/>{generating ? "Generating…" : "Generate Payroll"}
              </button>
            </div>
          )}
          <button
            className="hr-primary-btn"
            onClick={handleProcessAll}
            disabled={processing}
            style={{ display:"flex", alignItems:"center", gap:6 }}
          >
            <Zap size={15}/>{processing ? "Processing…" : "Process All"}
          </button>
        </div>
      </div>

      {/* ── Warning banner ── */}
      {payrollList.length === 0 && employees.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", borderRadius:12, background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.3)", marginBottom:20 }}>
          <AlertCircle size={18} style={{ color:"#f59e0b", flexShrink:0 }}/>
          <div style={{ fontSize:13 }}>
            <strong>No payroll records found.</strong> You have {employees.length} employees.
            Pick a month &amp; year above → <strong>Generate Payroll</strong>, or go to <strong>Assign Salary</strong> to set them individually.
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="hr-stats-grid">
        <StatCard icon={<IndianRupee size={18}/>} label="Total Payroll" value={fmt(totalNet)}/>
        <StatCard icon={<CheckCircle size={18}/>}  label="Processed"    value={processed}/>
        <StatCard icon={<Clock size={18}/>}         label="Pending"      value={pending}/>
        <StatCard icon={<Users size={18}/>}         label="Employees"    value={employees.length}/>
      </div>

      {/* ── Main tabs ── */}
      <div style={{ display:"flex", gap:4, padding:4, borderRadius:10, background:"var(--hr-bg,#f3f4f6)", width:"fit-content", marginBottom:20 }}>
        <TabPill active={tab==="payroll"} onClick={() => setTab("payroll")} icon={IndianRupee} label="Payroll Records"/>
        <TabPill active={tab==="assign"}  onClick={() => setTab("assign")}  icon={PenLine}     label="Assign Salary"/>
      </div>

      {/* ═══ TAB: PAYROLL RECORDS ═══ */}
      {tab === "payroll" && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "var(--hr-text-muted,#9ca3af)",
              }}
            >
              Showing <strong>{filteredPayroll.length}</strong> of{" "}
              {payrollList.length}
            </span>
          </div>

          <div className="hr-panel" style={{ padding:0 }}>
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Basic</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayroll.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign:"center", padding:40, color:"var(--hr-text-muted,#9ca3af)" }}>
                      {payrollList.length === 0
                        ? "No payroll records yet — generate or assign salary to get started."
                        : "No records match the selected filter."}
                    </td>
                  </tr>
                ) : filteredPayroll.map((p) => {
                  const status = (p.status || "PENDING").toUpperCase();
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight:500 }}>{p.employeeName || p.name || "—"}</td>
                      <td>{p.departmentName || p.department || "—"}</td>
                      <td>{p.designation || p.role || "—"}</td>
                      <td>{fmt(p.basicSalary)}</td>
                      <td>{fmt(p.allowances)}</td>
                      <td>{fmt(p.deductions)}</td>
                      <td style={{ fontWeight:700 }}>{fmt(p.netSalary)}</td>
                      <td><Badge status={status}/></td>
                      <td>
                        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                          {status === "PROCESSED" ? (
                            <>
                              <span style={{ color:"#22c55e", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
                                <CircleCheckBig size={14}/> Done
                              </span>
                              <button
                                className="hr-outline-btn"
                                onClick={() => handleDownloadSlip(p.id)}
                                style={{ display:"flex", alignItems:"center", gap:4 }}
                                title="Download Salary Slip"
                              >
                              </button>
                            </>
                          ) : (
                            <button
                              className="hr-outline-btn"
                              onClick={() => handleProcessOne(p.id)}
                              disabled={!!rowLoading[p.id]}
                              style={{ display:"flex", alignItems:"center", gap:5 }}
                            >
                              <Play size={13}/>{rowLoading[p.id] ? "…" : "Process"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ═══ TAB: ASSIGN SALARY ═══ */}
      {tab === "assign" && (
        <>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:18 }}>
            <div style={{ display:"flex", gap:4, padding:4, borderRadius:10, background:"var(--hr-bg,#f3f4f6)" }}>
              <TabPill active={assignMode==="individual"} onClick={() => setAssignMode("individual")} icon={UserCog}   label="Individual"/>
              <TabPill active={assignMode==="department"} onClick={() => setAssignMode("department")} icon={Building2} label="By Department"/>

            </div>
            {assignMode !== "individual" && (
              <button
                className="hr-primary-btn"
                onClick={() => setModal({ type: assignMode })}
                style={{ display:"flex", alignItems:"center", gap:6 }}
              >
                <Layers size={14}/>Assign Salary by {assignMode === "department" ? "Department" : "Role"}
              </button>
            )}
          </div>

          {/* Individual table */}
          {assignMode === "individual" && (
            <div className="hr-panel" style={{ padding:0 }}>
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Role / Designation</th>
                    <th>Current Basic</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign:"center", padding:40, color:"var(--hr-text-muted,#9ca3af)" }}>
                        No employees found.
                      </td>
                    </tr>
                  ) : employees.map(emp => {
                    const pr = findPayroll(emp);
                    const status = pr ? (pr.status||"PENDING").toUpperCase() : "NO RECORD";
                    return (
                      <tr key={emp.id}>
                        <td style={{ fontWeight:500 }}>{emp.name || emp.employeeName || "—"}</td>
                        <td>{emp.departmentName || "—"}</td>
                        <td>{emp.designation || "—"}</td>
                        <td>
                          {pr
                            ? fmt(pr.basicSalary)
                            : <span style={{ color:"var(--hr-text-muted,#9ca3af)", fontSize:12 }}>Not set</span>}
                        </td>
                        <td style={{ fontWeight:600 }}>{pr ? fmt(pr.netSalary) : "—"}</td>
                        <td>
                          {status === "NO RECORD"
                            ? <span style={{ fontSize:12, color:"#f59e0b", fontWeight:600 }}>No Record</span>
                            : <Badge status={status}/>}
                        </td>
                        <td>
                          <button
                            className="hr-outline-btn"
                            style={{ display:"flex", alignItems:"center", gap:5 }}
                            onClick={() => setModal({ type:"individual", employee: emp, existingPayroll: pr || null })}
                          >
                            <PenLine size={13}/>{pr ? "Edit Salary" : "Assign Salary"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Department / Role cards */}
          {assignMode !== "individual" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:14 }}>
              {(assignMode === "department" ? departments : roles).map(group => {
                const groupEmps = employees.filter(e =>
                  assignMode === "department" ? e.departmentName === group : e.designation === group
                );
                const groupPays = payrollList.filter(p =>
                  assignMode === "department"
                    ? (p.departmentName || p.department) === group
                    : (p.designation || p.role) === group
                );
                const avgNet = groupPays.length
                  ? groupPays.reduce((s,p) => s + Number(p.netSalary||0), 0) / groupPays.length
                  : 0;

                return (
                  <div key={group} className="hr-panel" style={{ padding:"18px 20px" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15, marginBottom:2 }}>{group}</div>
                        <div style={{ fontSize:12, color:"var(--hr-text-muted,#9ca3af)" }}>
                          {groupEmps.length} employee{groupEmps.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      {assignMode === "department"
                        ? <Building2 size={18} style={{ color:"var(--hr-text-muted,#9ca3af)" }}/>
                        : <Briefcase size={18} style={{ color:"var(--hr-text-muted,#9ca3af)" }}/>}
                    </div>
                    <div style={{ fontSize:12, color:"var(--hr-text-muted,#9ca3af)", marginBottom:14 }}>
                      Avg net: <strong style={{ color:"inherit" }}>{avgNet ? fmt(Math.round(avgNet)) : "Not set"}</strong>
                    </div>
                    <button
                      className="hr-primary-btn"
                      style={{ width:"100%", justifyContent:"center", fontSize:13 }}
                      onClick={() => setModal({ type: assignMode, preselect: group })}
                    >
                      <PenLine size={13}/><span style={{ marginLeft:5 }}>Assign Salary</span>
                    </button>
                  </div>
                );
              })}
              {(assignMode === "department" ? departments : roles).length === 0 && (
                <p style={{ color:"var(--hr-text-muted,#9ca3af)", fontSize:13 }}>
                  No {assignMode === "department" ? "departments" : "roles"} found in employee records.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}