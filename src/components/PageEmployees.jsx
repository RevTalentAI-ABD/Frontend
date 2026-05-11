import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pause, Play } from "lucide-react";
import "./PageEmployees.css";

const BASE_URL = "http://localhost:8080/api";

const employeeAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/employees`);
    return res.json();
  },
  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/employees/${id}`);
    return res.json();
  },
  create: async (body) => {
    const res = await fetch(`${BASE_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  updateFull: async (id, body) => {
    return fetch(`${BASE_URL}/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },
};

function getDisplayName(e) {
  if (e.name && e.name.trim()) return e.name.trim();
  if (e.email) return e.email.split("@")[0];
  if (e.username) return e.username;
  return "Unknown";
}

function getAvatarInitials(name) {
  return name.split(" ").map((n) => n[0] || "").join("").slice(0, 2).toUpperCase();
}

export default function PageEmployees() {
  const [employees, setEmployees]       = useState([]);
  const [managerMap, setManagerMap]     = useState({});
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false); // "Active employees" toggle
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm] = useState({
    name: "", username: "", email: "", password: "",
    role: "EMPLOYEE", employeeCode: "", designation: "",
    joiningDate: "", phone: "", address: "", departmentId: "",
  });

  /* =========================================================
     LOAD — fetch all employees + resolve ACTIVE manager names
  ========================================================= */
  async function loadEmployees() {
    try {
      setLoading(true);
      const data = await employeeAPI.getAll();
      const list = Array.isArray(data) ? data : (data.content || data.data || []);

      setEmployees(list); // store everyone, filtering happens in useMemo

      // Collect unique managerIds across all employees
      const ids = [
        ...new Set(list.map((e) => e.managerId).filter((id) => id != null && id !== 0)),
      ];

      if (ids.length > 0) {
        const results = await Promise.allSettled(ids.map((id) => employeeAPI.getById(id)));
        const map = {};
        results.forEach((r, i) => {
          if (r.status === "fulfilled" && r.value) {
            const mgr = r.value;
            // Only add ACTIVE managers — INACTIVE ones stay out → "Not Assigned"
            if ((mgr.status || "ACTIVE").toUpperCase() === "ACTIVE") {
              map[ids[i]] = mgr.name || mgr.email?.split("@")[0] || null;
            }
          }
        });
        setManagerMap(map);
      }
    } catch (err) {
      console.error("loadEmployees error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEmployees(); }, []);

  /* =========================================================
     FILTER — search + active-only toggle applied together
  ========================================================= */
  const filtered = useMemo(() => {
    let list = employees;

    // "Active employees" button filters to ACTIVE only
    if (showActiveOnly) {
      list = list.filter((e) => (e.status || "ACTIVE").toUpperCase() === "ACTIVE");
    }

    // Search
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter((e) => {
        const name  = (e.name  || "").toLowerCase();
        const email = (e.email || "").toLowerCase();
        const dept  = (e.departmentName || "").toLowerCase();
        return name.includes(q) || email.includes(q) || dept.includes(q);
      });
    }

    return list;
  }, [employees, search, showActiveOnly]);

  /* =========================================================
     TOGGLE STATUS
  ========================================================= */
  async function toggleStatus(emp) {
    const currentStatus = (emp.status || "ACTIVE").toUpperCase();
    const nextStatus    = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    // Optimistic: flip badge only, keep employee in list
    setEmployees((prev) =>
      prev.map((e) => e.id === emp.id ? { ...e, status: nextStatus } : e)
    );

    // Update managerMap: INACTIVE → remove so reports show "Not Assigned"
    //                    ACTIVE   → add back so reports show their name
    if (nextStatus === "INACTIVE") {
      setManagerMap((prev) => {
        const updated = { ...prev };
        delete updated[emp.id];
        return updated;
      });
    } else {
      setManagerMap((prev) => ({
        ...prev,
        [emp.id]: emp.name || emp.email?.split("@")[0] || null,
      }));
    }

    try {
      const res = await employeeAPI.updateFull(emp.id, { ...emp, status: nextStatus });
      if (!res.ok) {
        console.error("Status update failed:", res.status, await res.text());
        loadEmployees(); // revert by reloading fresh data
      }
    } catch (err) {
      console.error("toggleStatus error:", err);
      loadEmployees();
    }
  }

  /* =========================================================
     ADD EMPLOYEE
  ========================================================= */
  async function addEmployee() {
    try {
      const created = await employeeAPI.create(form);
      setEmployees((prev) => [...prev, created]);
      setShowModal(false);
      setForm({
        name: "", username: "", email: "", password: "",
        role: "EMPLOYEE", employeeCode: "", designation: "",
        joiningDate: "", phone: "", address: "", departmentId: "",
      });
    } catch (err) {
      console.error("addEmployee error:", err);
    }
  }

  if (loading) return <div className="emp-loading">Loading employees...</div>;

  return (
    <div className="emp-page">

      {/* HEADER */}
      <div className="emp-header">
        <h1>Employee Management</h1>
        <div className="emp-header-actions">
          <div className="emp-tabs">
            {/* Clicking toggles between all employees / active-only */}
            <button
              className={`emp-tab ${showActiveOnly ? "active" : ""}`}
              onClick={() => setShowActiveOnly((prev) => !prev)}
            >
              {showActiveOnly ? "All employees" : "Active employees"}
            </button>
          </div>
          <button className="emp-add-btn" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add employee
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="emp-search-wrap">
        <input
          type="text"
          placeholder="Search employees..."
          className="emp-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="emp-table-panel">
        <table className="emp-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Role</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const status      = (e.status || "ACTIVE").toUpperCase();
              const displayName = getDisplayName(e);

              // If managerId exists but not in map → manager is INACTIVE → "Not Assigned"
              const managerLabel = e.managerId
                ? (managerMap[e.managerId] || "Not Assigned")
                : "Not Assigned";

              return (
                <tr key={e.id}>
                  <td>
                    <div className="emp-user">
                      <div className="emp-avatar">{getAvatarInitials(displayName)}</div>
                      <div>
                        <div className="emp-name">{displayName}</div>
                        <div className="emp-email">{e.email || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td>{e.departmentName || "—"}</td>
                  <td><span className="emp-role">{e.role || "EMPLOYEE"}</span></td>
                  <td>{managerLabel}</td>
                  <td>
                    <span className={`emp-status ${status === "ACTIVE" ? "active" : "inactive"}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <div className="emp-actions">
                      <button className="emp-action-btn" onClick={() => toggleStatus(e)}>
                        {status === "ACTIVE"
                          ? <><Pause size={14} /> Inactive</>
                          : <><Play  size={14} /> Active</>}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal">
            <h2>Add Employee</h2>
            <div className="emp-form-grid">
              <input placeholder="Full Name"     value={form.name}         onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="Username"      value={form.username}     onChange={(e) => setForm({ ...form, username: e.target.value })} />
              <input placeholder="Email"         value={form.email}        onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <input placeholder="Employee Code" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} />
              <input placeholder="Designation"   value={form.designation}  onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              <input placeholder="Department ID" type="number" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: Number(e.target.value) })} />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
                <option value="HR_ADMIN">HR ADMIN</option>
              </select>
            </div>
            <div className="emp-modal-actions">
              <button className="emp-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="emp-save-btn"   onClick={addEmployee}>Save Employee</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}