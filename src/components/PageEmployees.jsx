import React, { useState, useEffect } from "react";
import { employeeAPI } from "./api";
import { useFetch, useToast } from "./hooks";
import { Avatar, Badge, StatCard, Spinner, ErrorState, Toast, EmptyState } from "./UI";
import {
  IndianRupee,
  Calendar,
  Building2,
  Mail
} from "lucide-react";
const DEPTS = ["Engineering","Design","Product","Data","Infra","HR","Finance","Marketing"];
const EMPTY_FORM = { firstName:"", lastName:"", email:"", role:"", department:"Engineering", salary:"", phone:"" };

export default function PageEmployees() {
  const { data, loading, error, refetch } = useFetch(employeeAPI.getAll);
  const { toast, showToast } = useToast();

  const [search,   setSearch]   = useState("");
  const [deptF,    setDeptF]    = useState("All");
  const [statusF,  setStatusF]  = useState("All");
  const [selected, setSelected] = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  const employees = Array.isArray(data) ? data : (data?.employees || data?.content || []);

  const depts    = ["All", ...new Set(employees.map(e => e.department || e.dept).filter(Boolean))];
  const statuses = ["All", "Active", "On Leave", "Inactive"];

  const filtered = employees.filter(e => {
    const name = `${e.firstName || ""} ${e.lastName || e.name || ""}`.toLowerCase();
    const role = (e.role || e.designation || "").toLowerCase();
    const dept = e.department || e.dept || "";
    const status = e.status || e.employmentStatus || "";
    const q = search.toLowerCase();
    return (deptF === "All" || dept === deptF) &&
           (statusF === "All" || status === statusF) &&
           (name.includes(q) || role.includes(q));
  });
const getDepartmentId = (deptName) => {
  const map = {
    Engineering: 1,
    Design: 2,
    Product: 3,
    Data: 4,
    Infra: 5,
    HR: 6,
    Finance: 7,
    Marketing: 8
  };
  return map[deptName] || 1;
};

const addEmployee = async () => {
  if (!form.firstName || !form.email) return;
  setSaving(true);

  try {
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: "Strong@123",
      departmentId: getDepartmentId(form.department),
      designation: form.role,
      phone: form.phone
    };

    await employeeAPI.create(payload);

    await refetch();
    setShowAdd(false);
    setForm(EMPTY_FORM);
    showToast("✅ Employee added successfully!");
  } catch (err) {
    showToast("❌ " + (err.response?.data?.message || "Failed to add employee"));
  } finally {
    setSaving(false);
  }
};
  // ── Employee profile view ───────────────────────────────────────────────────
  if (selected) {
    const name   = `${selected.firstName || ""} ${selected.lastName || selected.name || ""}`.trim();
    const status = selected.status || selected.employmentStatus || "Active";
    return (
      <div className="hr-page">
        <Toast message={toast} />
        <button className="hr-back-btn" onClick={() => setSelected(null)}>← Back to Directory</button>
        <div className="hr-emp-profile-card">
          <Avatar name={name} size={72} />
          <div className="hr-ep-info">
            <div className="hr-ep-name">{name}</div>
            <div className="hr-ep-role">{selected.role || selected.designation} · {selected.department || selected.dept}</div>
            <Badge status={status} />
          </div>
          <div className="hr-ep-actions">
            <button className="hr-outline-btn" onClick={() => toggleStatus(selected)}>
              {status === "Inactive" ? "Reactivate" : "Deactivate"}
            </button>
          </div>
        </div>
       <div className="hr-stats-grid">
         <StatCard
           icon={<IndianRupee size={18} />}
           label="Monthly Salary"
           value={
             selected.salary
               ? `₹${Number(selected.salary).toLocaleString("en-IN")}`
               : "N/A"
           }
           color="#f59e0b"
         />

         <StatCard
           icon={<Calendar size={18} />}
           label="Joined"
           value={
             selected.joiningDate
               ? new Date(selected.joiningDate).toLocaleDateString("en-IN", {
                   month: "short",
                   year: "numeric",
                 })
               : "N/A"
           }
           color="#7c5af0"
         />

         <StatCard
           icon={<Building2 size={18} />}
           label="Department"
           value={selected.department || selected.dept || "N/A"}
           color="#06b6d4"
         />

         <StatCard
           icon={<Mail size={18} />}
           label="Email"
           value={selected.email || "N/A"}
           color="#10b981"
         />
       </div>
        <div className="hr-panel">
          <h3 className="hr-panel-title">Employee Details</h3>
          <div className="hr-detail-grid">
            {[
              ["Full Name",   name],
              ["Department",  selected.department || selected.dept],
              ["Role",        selected.role || selected.designation],
              ["Status",      status],
              ["Employee ID", selected.id || selected.employeeId],
              ["Email",       selected.email],
              ["Phone",       selected.phone || selected.phoneNumber || "—"],
              ["Joined",      selected.joiningDate ? new Date(selected.joiningDate).toLocaleDateString("en-IN") : "—"],
            ].map(([l, v]) => (
              <div key={l} className="hr-detail-item">
                <div className="hr-detail-label">{l}</div>
                <div className="hr-detail-value">{v || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main list view ──────────────────────────────────────────────────────────
  if (loading) return <Spinner />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="hr-page">
      <Toast message={toast} />
      <div className="hr-page-header-row">
        <h2 className="hr-page-heading">Employee Management</h2>
        <button className="hr-primary-btn" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? "✕ Cancel" : "+ Add Employee"}
        </button>
      </div>

      {showAdd && (
        <div className="hr-panel hr-add-form">
          <h3 className="hr-panel-title">New Employee</h3>
          <div className="hr-form-grid">
            <div className="hr-field">
              <label>First Name</label>
              <input placeholder="Rohan" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div className="hr-field">
              <label>Last Name</label>
              <input placeholder="Sharma" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div className="hr-field">
              <label>Role / Designation</label>
              <input placeholder="e.g. Backend Engineer" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
            </div>
            <div className="hr-field">
              <label>Department</label>
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="hr-field">
              <label>Monthly Salary (₹)</label>
              <input type="number" placeholder="e.g. 80000" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
            </div>
            <div className="hr-field">
              <label>Phone</label>
              <input placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="hr-field hr-field-full">
              <label>Work Email</label>
              <input type="email" placeholder="name@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <button className="hr-primary-btn" onClick={addEmployee} disabled={saving}>
            {saving ? "Adding…" : "Add Employee"}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="hr-filter-row">
        <div className="hr-search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Search name or role…" value={search} onChange={e => setSearch(e.target.value)} className="hr-search" />
        </div>
        <div className="hr-filter-tabs">
          {depts.map(d => <button key={d} className={`hr-ftab ${deptF === d ? "active" : ""}`} onClick={() => setDeptF(d)}>{d}</button>)}
        </div>
        <div className="hr-filter-tabs">
          {statuses.map(s => <button key={s} className={`hr-ftab ${statusF === s ? "active" : ""}`} onClick={() => setStatusF(s)}>{s}</button>)}
        </div>
      </div>

      <div className="hr-emp-count">{filtered.length} employee{filtered.length !== 1 ? "s" : ""} found</div>

      <div className="hr-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="hr-table-wrap">
          <table className="hr-table">
            <thead>
              <tr><th>Employee</th><th>Department</th><th>Role</th><th>Salary</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyState text="No employees found" /></td></tr>
              ) : filtered.map(e => {
                const name   = `${e.firstName || ""} ${e.lastName || e.name || ""}`.trim();
                const status = e.status || e.employmentStatus || "Active";
                return (
                  <tr key={e.id || e.employeeId} onClick={() => setSelected(e)} style={{ cursor: "pointer" }}>
                    <td><div className="hr-table-emp"><Avatar name={name} size={32} />{name}</div></td>
                    <td>{e.department || e.dept}</td>
                    <td>{e.role || e.designation}</td>
                    <td>{e.salary ? `₹${Number(e.salary).toLocaleString("en-IN")}` : "—"}</td>
                    <td><Badge status={status} /></td>
                    <td><span className="hr-row-arrow">→</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
