import React, { useState, useEffect, useRef } from "react";
import { XCircle,CheckCircle2  } from "lucide-react";
import { hrAPI, employeeAPI } from "./api";
import { useFetch, useToast } from "./hooks";
import { Avatar, Spinner, ErrorState, Toast, EmptyState } from "./UI";
import { Pencil } from "lucide-react";

const DEPTS = [
  "Engineering","Design","Product","Data","Infra","HR","Finance","Marketing"
];

const ROLES = ["EMPLOYEE", "MANAGER", "HR_ADMIN"];

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "",
  role: "", department: "Engineering", salary: "", phone: ""
};

const GLOBAL_STYLES = `
  @keyframes csSlideIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  .cs-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    padding: 7px 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    white-space: nowrap;
    transition: background 0.18s, border-color 0.18s, box-shadow 0.18s, color 0.18s;
    box-sizing: border-box;
  }
  .cs-trigger:hover {
    background: rgba(255,255,255,0.09);
    border-color: rgba(139,92,246,0.55);
    box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
  }
  .cs-trigger.open {
    background: rgba(139,92,246,0.15);
    border-color: rgba(139,92,246,0.7);
    box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
    color: #c4b5fd;
  }
  .cs-trigger.placeholder-active { color: #64748b; }

  .cs-chevron {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    color: #8b9ab0;
    transition: transform 0.2s ease, color 0.2s ease;
  }
  .cs-chevron.open {
    transform: rotate(180deg);
    color: #a78bfa;
  }

  .cs-menu {
    position: absolute;
    z-index: 9999;
    min-width: 100%;
    background: #1e1b2e;
    border: 1px solid rgba(139,92,246,0.3);
    border-radius: 12px;
    padding: 6px;
    list-style: none;
    margin: 0;
    box-shadow:
      0 20px 40px rgba(0,0,0,0.55),
      0 0 0 1px rgba(139,92,246,0.08),
      inset 0 1px 0 rgba(255,255,255,0.06);
    animation: csSlideIn 0.15s cubic-bezier(0.16,1,0.3,1) both;
    max-height: 220px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(139,92,246,0.4) transparent;
  }
  .cs-menu::-webkit-scrollbar        { width: 4px; }
  .cs-menu::-webkit-scrollbar-track  { background: transparent; }
  .cs-menu::-webkit-scrollbar-thumb  {
    background: rgba(139,92,246,0.4);
    border-radius: 99px;
  }

  .cs-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    color: #cbd5e1;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.12s ease, color 0.12s ease;
  }
  .cs-item:hover                      { background: rgba(139,92,246,0.2); color: #e2e8f0; }
  .cs-item.active                     { background: rgba(139,92,246,0.25); color: #c4b5fd; font-weight: 600; }
  .cs-item.cs-placeholder-item        { color: #64748b; font-style: italic; }
  .cs-item.cs-placeholder-item:hover  { background: rgba(255,255,255,0.04); color: #94a3b8; }

  .employee-table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .employee-table         { min-width: 860px; }
  .cs-wrap { position: relative; }

  .inline-edit-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .inline-edit-value {
    font-size: 13px;
    font-weight: 500;
    color: #e2e8f0;
    white-space: nowrap;
  }
  .inline-edit-value.unassigned {
    color: #475569;
    font-style: italic;
  }
  .inline-edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 7px;
    border: 1px solid rgba(139,92,246,0.25);
    background: rgba(139,92,246,0.1);
    color: #a78bfa;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  }
  .inline-edit-btn:hover {
    background: rgba(139,92,246,0.22);
    border-color: rgba(139,92,246,0.55);
    box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
  }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const el = document.createElement("style");
  el.textContent = GLOBAL_STYLES;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────
   CUSTOM SELECT
───────────────────────────────────────── */
function CustomSelect({ value, onChange, options, placeholder = "Select" }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const menuRef         = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [menuStyle, setMenuStyle] = useState({ top: "calc(100% + 6px)", bottom: "auto" });
  useEffect(() => {
    if (!open || !ref.current) return;
    const rect       = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuH      = 230;
    if (spaceBelow < menuH && rect.top > menuH) {
      setMenuStyle({ bottom: "calc(100% + 6px)", top: "auto" });
    } else {
      setMenuStyle({ top: "calc(100% + 6px)", bottom: "auto" });
    }
  }, [open]);

  const selected           = options.find((o) => (o.value ?? o) === value);
  const label              = selected ? (selected.label ?? selected) : placeholder;
  const isPlaceholderShown = !selected;

  return (
    <div className="cs-wrap" ref={ref}>
      <button
        type="button"
        className={[
          "cs-trigger",
          open               ? "open"              : "",
          isPlaceholderShown ? "placeholder-active" : "",
        ].join(" ")}
        onClick={() => setOpen((s) => !s)}
      >
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </span>
        <span className={`cs-chevron${open ? " open" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <ul className="cs-menu" ref={menuRef} style={menuStyle}>
          {placeholder && (
            <li
              className={`cs-item cs-placeholder-item${!value ? " active" : ""}`}
              onClick={() => { onChange(""); setOpen(false); }}
            >
              {placeholder}
            </li>
          )}
          {options.map((opt) => {
            const val      = opt.value ?? opt;
            const lbl      = opt.label ?? opt;
            const isActive = val === value;
            return (
              <li
                key={val}
                className={`cs-item${isActive ? " active" : ""}`}
                onClick={() => { onChange(val); setOpen(false); }}
              >
                {isActive && (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
                    style={{ color: "#a78bfa", flexShrink: 0 }}>
                    <path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {lbl}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   INLINE EDIT CELL
───────────────────────────────────────── */
function InlineEditCell({ value, options, placeholder = "Not Assigned", onChange }) {
  const [editing, setEditing] = useState(false);

  const handleChange = (val) => {
    setEditing(false);
    onChange(val);
  };

  const displayLabel = (() => {
    if (!value) return null;
    const match = options.find(o => (o.value ?? o) === value);
    return match ? (match.label ?? match) : value;
  })();

  if (editing) {
    return (
      <div style={{ minWidth: 160 }}>
        <CustomSelect
          value={value}
          onChange={handleChange}
          options={options}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div className="inline-edit-cell">
      <span className={`inline-edit-value${!displayLabel ? " unassigned" : ""}`}>
        {displayLabel || placeholder}
      </span>
      <button
        className="inline-edit-btn"
        onClick={() => setEditing(true)}
        title="Edit"
      >
        <Pencil size={12} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function PageEmployees() {
  injectStyles();

  const { data, loading, error, refetch } = useFetch(employeeAPI.getAll);
  const { toast, showToast }              = useToast();

  const [search, setSearch]                   = useState("");
  const [showAdd, setShowAdd]                 = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [managers, setManagers]               = useState([]);
  const [form, setForm]                       = useState(EMPTY_FORM);
  const [localEmployees, setLocalEmployees]   = useState([]);

  // Sync localEmployees whenever fresh data arrives
  useEffect(() => {
    const list = Array.isArray(data)
      ? data
      : (data?.employees || data?.content || []);
    if (list.length > 0) setLocalEmployees(list);
  }, [data]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await hrAPI.getManagers();
        setManagers(res.data);
      } catch (err) { console.error(err); }
    };
    fetchManagers();
  }, []);

  const filtered = localEmployees.filter(e => {
    const name = `${e.firstName || ""} ${e.lastName || ""} ${e.name || ""}`.toLowerCase();
    const role = (e.role || e.designation || "").toLowerCase();
    const q    = search.toLowerCase();
    return name.includes(q) || role.includes(q);
  });

  const addEmployee = async () => {
    if (!form.firstName || !form.email || !form.role) {
      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <XCircle size={18} />

          Please fill all required fields

        </span>

      );
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`,
        username: form.email, email: form.email,
        password: "Strong@123", role: "EMPLOYEE",
        designation: form.role, department: form.department, phone: form.phone,
      };
      await employeeAPI.create(payload);
      await refetch();
      setShowAdd(false);
      setForm(EMPTY_FORM);
      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <CheckCircle2 size={18} />

          Employee added successfully!

        </span>

      );
    } catch (err) {
      console.error(err);
      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <XCircle size={18} />

          Failed to add employee

        </span>

      );

    } finally { setSaving(false); }
  };


  const assignManager = async (employeeId, managerId) => {
    const manager = managers.find(m => m.id === managerId);
    // Reflect in table instantly
    setLocalEmployees(prev => prev.map(e =>
      e.id === employeeId
        ? { ...e, manager: { id: managerId, name: manager?.name || "" } }
        : e
    ));
    try {
      await hrAPI.assignManager({ employeeId, managerId });
      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <CheckCircle2 size={18} />

          Manager Assigned

        </span>

      );
    } catch {

     showToast(

       <span
         style={{
           display: "flex",
           alignItems: "center",
           gap: "8px"
         }}
       >

         <XCircle size={18} />

         Failed to assign manager

       </span>

     );
      // Revert by fetching real data
      const fresh = await employeeAPI.getAll();
      const list  = Array.isArray(fresh.data) ? fresh.data : [];
      setLocalEmployees(list);
    }
  };

  const changeRole = async (employeeId, role) => {
    // Reflect in table instantly
    setLocalEmployees(prev => prev.map(e =>
      e.id === employeeId ? { ...e, role } : e
    ));
    try {
      await hrAPI.changeRole({ employeeId, role });
     showToast(

       <span
         style={{
           display: "flex",
           alignItems: "center",
           gap: "8px"
         }}
       >

         <CheckCircle2 size={18} />

         Role Updated

       </span>

     );
    } catch {
   showToast(

     <span
       style={{
         display: "flex",
         alignItems: "center",
         gap: "8px"
       }}
     >

       <XCircle size={18} />

       Failed to update role

     </span>

   );
      // Revert by fetching real data
      const fresh = await employeeAPI.getAll();
      const list  = Array.isArray(fresh.data) ? fresh.data : [];
      setLocalEmployees(list);
    }
  };

  const changeDepartment = async (employeeId, department) => {
    // Reflect in table instantly
    setLocalEmployees(prev => prev.map(e =>
      e.id === employeeId ? { ...e, department } : e
    ));
    try {
      await hrAPI.changeDepartment({ employeeId, department });
      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <CheckCircle2 size={18} />

          Department Updated

        </span>

      );
    } catch {
      showToast(

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >

          <XCircle size={18} />

          Failed to update department

        </span>

      );
      // Revert by fetching real data
      const fresh = await employeeAPI.getAll();
      const list  = Array.isArray(fresh.data) ? fresh.data : [];
      setLocalEmployees(list);
    }
  };

  if (loading) return <Spinner />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  const managerOptions = managers.map(m => ({ value: m.id, label: m.name }));

  return (
    <div className="hr-page">
      <Toast message={toast} />

      {/* HEADER */}
      <div className="hr-page-header-row">
        <h2 className="hr-page-heading">Employee Management</h2>
        <button
          className="hr-primary-btn add-employee-btn"
          onClick={() => setShowAdd(s => !s)}
        >
          {showAdd ? "✕ Cancel" : "+ Add Employee"}
        </button>
      </div>

      {/* ADD EMPLOYEE FORM */}
      {showAdd && (
        <div className="hr-panel">
          <div className="hr-form-grid">
            <input placeholder="First Name" value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            <input placeholder="Last Name"  value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            <input placeholder="Email"      value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input placeholder="Role"       value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
            <CustomSelect
              value={form.department}
              onChange={val => setForm(f => ({ ...f, department: val }))}
              options={DEPTS}
              placeholder="Select Department"
            />
            <input placeholder="Phone" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <button className="hr-primary-btn" onClick={addEmployee} disabled={saving}>
            {saving ? "Adding..." : "Add Employee"}
          </button>
        </div>
      )}

      {/* SEARCH */}
      <div className="hr-filter-row">
        <input
          className="hr-search employee-search"
          placeholder="Search employees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

     {/* TABLE */}
           <div className="hr-panel employee-table-wrapper">

             <div className="hr-table-wrap">

               <table className="hr-table employee-table">

                 <thead>

                   <tr>

                     <th>Employee</th>
                     <th>Department</th>
                     <th>Role</th>
                     <th>Manager</th>
                     <th>Status</th>

                   </tr>

                 </thead>

                 <tbody>

                   {filtered.length === 0 ? (

                     <tr>

                       <td colSpan={5}>

                         <EmptyState
                           text="No employees found"
                         />

                       </td>

                     </tr>

                   ) : (

                     filtered.map(e => {

                       const name =
                         `${e.firstName || ""}
                          ${e.lastName || ""}
                          ${e.name || ""}`.trim();

                       const status =
                         e.status ||
                         e.employmentStatus ||
                         "ACTIVE";

                       return (

                         <tr
                           key={e.id || e.employeeId}
                           style={{
                             cursor: "pointer"
                           }}
                         >

                           {/* EMPLOYEE */}

                           <td>

                             <div className="hr-table-emp">

                               <Avatar
                                 name={name}
                                 size={38}
                               />

                               <div>

                                 <div className="employee-name">
                                   {name}
                                 </div>

                                 <div className="employee-email">
                                   {e.email}
                                 </div>

                               </div>

                             </div>

                           </td>

                           {/* DEPARTMENT */}

                           <td>

                             {
                               e.departmentName ||
                               e.department ||
                               "Not Assigned"
                             }

                           </td>

                           {/* ROLE */}

                           <td>

                             {(e.role || "")
                               .replace("_", " ")}

                           </td>

                           {/* MANAGER */}

                           <td>

                            {
                              e.managerName
                                ? e.managerName
                                : (
                                    managers.find(
                                      m => m.id === e.managerId
                                    )?.name || "Not Assigned"
                                  )
                            }

                           </td>

                           {/* STATUS */}

                           <td>

                             <span className="employee-status">
                               {status}
                             </span>

                           </td>

                         </tr>

                       );
                     })

                   )}

                 </tbody>

               </table>

             </div>

           </div>
    </div>
  );
}