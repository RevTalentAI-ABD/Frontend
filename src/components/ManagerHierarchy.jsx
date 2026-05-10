import React, { useEffect, useState } from "react";
import {
  employeeAPI,
  hrAPI
} from "./api";

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');

  .mh-root {
    font-family: 'DM Sans', sans-serif;
    padding: 32px;
    min-height: 100vh;
    color: #fff;
  }

  .mh-title {
    font-family: 'Syne', sans-serif;
    font-size: 40px;
    margin-bottom: 8px;
    color: #ffffff;
  }

  .mh-subtitle {
    color: #94a3b8;
    margin-bottom: 30px;
  }

  .mh-manager-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill,minmax(320px,1fr));
    gap: 20px;
  }

  .mh-manager-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(139,92,246,0.25);
    border-radius: 20px;
    overflow: hidden;
    backdrop-filter: blur(14px);

    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease,
      border-color 0.25s ease;
  }

  .mh-manager-card:hover {

    transform: translateY(-4px);

    border-color:
      rgba(139,92,246,0.45);

    box-shadow:
      0 0 28px rgba(124,58,237,0.22);
  }

  .mh-card-accent {
    height: 3px;
    background:
      linear-gradient(
        90deg,
        #7c3aed,
        #38bdf8
      );
  }

  .mh-card-body {
    padding: 18px;
  }

  .mh-manager-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .mh-manager-meta {
    display: flex;
    gap: 12px;
  }

  .mh-avatar {
    width: 48px;
    height: 48px;

    border-radius: 14px;

    background:
      linear-gradient(
        135deg,
        #7c3aed,
        #4f46e5
      );

    display: flex;
    align-items: center;
    justify-content: center;

    font-weight: bold;

    box-shadow:
      0 0 18px rgba(124,58,237,0.35);
  }

  .mh-avatar-sm {
    width: 36px;
    height: 36px;

    border-radius: 12px;

    background:
      linear-gradient(
        135deg,
        #0891b2,
        #06b6d4
      );

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 12px;
    font-weight: bold;

    box-shadow:
      0 0 14px rgba(6,182,212,0.25);
  }

  .mh-manager-name {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  /* =========================
     DEPARTMENT DROPDOWN
  ========================= */

  .mh-dept-badge {

    background:
      linear-gradient(
        135deg,
        rgba(124,58,237,0.28),
        rgba(79,70,229,0.22)
      );

    color: #ffffff;

    border:
      1px solid rgba(139,92,246,0.35);

    border-radius: 999px;

    padding: 8px 16px;

    font-size: 12px;

    font-weight: 600;

    outline: none;

    cursor: pointer;

    transition:
      all 0.25s ease;

    box-shadow:
      0 0 12px rgba(124,58,237,0.18);

    appearance: none;

    min-width: 130px;
  }

  .mh-dept-badge:hover {

    transform: translateY(-1px);

    border-color: #8b5cf6;

    box-shadow:
      0 0 18px rgba(139,92,246,0.35);
  }

  .mh-dept-badge:focus {

    border-color: #a78bfa;

    box-shadow:
      0 0 0 3px rgba(139,92,246,0.18);
  }

  .mh-dept-badge option {

    background: white;
    color: black;
  }

  /* =========================
     BUTTONS
  ========================= */

  .mh-demote-btn,
  .mh-promote-btn,
  .mh-remove-btn,
  .mh-add-btn {

    cursor: pointer;

    border: none;

    font-weight: 700;

    transition:
      all 0.25s ease;
  }

  .mh-demote-btn {

    background:
      rgba(239,68,68,0.15);

    color: #f87171;

    padding: 10px 16px;

    border-radius: 14px;
  }

  .mh-demote-btn:hover {

    background:
      rgba(239,68,68,0.22);

    transform: translateY(-2px);

    box-shadow:
      0 0 18px rgba(239,68,68,0.2);
  }

  .mh-promote-btn {

    background:
      rgba(56,189,248,0.15);

    color: #38bdf8;

    padding: 10px 14px;

    border-radius: 14px;
  }

  .mh-promote-btn:hover {

    background:
      rgba(56,189,248,0.22);

    transform: translateY(-2px);

    box-shadow:
      0 0 18px rgba(56,189,248,0.22);
  }

  .mh-remove-btn {

    background:
      rgba(239,68,68,0.1);

    color: #f87171;

    padding: 8px 12px;

    border-radius: 12px;
  }

  .mh-remove-btn:hover {

    background:
      rgba(239,68,68,0.18);

    transform: scale(1.04);
  }

  /* =========================
     ADD BUTTON
  ========================= */

  .mh-add-btn {

    position: relative;

    overflow: hidden;

    background:
      linear-gradient(
        135deg,
        #8b5cf6,
        #6d28d9
      );

    color: white;

    padding: 12px 18px;

    border-radius: 14px;

    font-size: 14px;

    letter-spacing: 0.3px;

    box-shadow:
      0 0 18px rgba(139,92,246,0.28);
  }

  .mh-add-btn:hover {

    transform:
      translateY(-2px);

    box-shadow:
      0 0 28px rgba(139,92,246,0.45);
  }

  .mh-add-btn:active {

    transform: scale(0.96);
  }

  .mh-add-btn:disabled {

    opacity: 0.5;

    cursor: not-allowed;

    transform: none;
  }

  .mh-add-btn::before {

    content: "";

    position: absolute;

    top: 0;
    left: -120%;

    width: 100%;
    height: 100%;

    background:
      linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.22),
        transparent
      );

    transition: 0.6s;
  }

  .mh-add-btn:hover::before {

    left: 120%;
  }

  /* =========================
     EMPLOYEE LIST
  ========================= */

  .mh-emp-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  .mh-emp-item {

    display: flex;
    justify-content: space-between;
    align-items: center;

    background:
      rgba(255,255,255,0.04);

    border-radius: 14px;

    padding: 12px;

    transition:
      all 0.25s ease;
  }

  .mh-emp-item:hover {

    background:
      rgba(255,255,255,0.07);

    transform: translateX(2px);
  }

  .mh-emp-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mh-empty-msg {

    padding: 18px;

    text-align: center;

    color: #64748b;

    border:
      1px dashed rgba(255,255,255,0.1);

    border-radius: 14px;

    margin-bottom: 14px;
  }

  /* =========================
     ASSIGN BOX
  ========================= */

  .mh-assign-box {
    display: flex;
    gap: 10px;
  }

  .mh-assign-select {

    flex: 1;

    padding: 12px 14px;

    border-radius: 14px;

    background:
      rgba(255,255,255,0.06);

    color: white;

    border:
      1px solid rgba(139,92,246,0.22);

    outline: none;

    font-size: 14px;

    font-weight: 500;

    transition:
      all 0.25s ease;

    backdrop-filter: blur(10px);

    appearance: none;

    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.02);
  }

  .mh-assign-select:hover {

    border-color: #8b5cf6;

    background:
      rgba(255,255,255,0.08);
  }

  .mh-assign-select:focus {

    border-color: #a78bfa;

    box-shadow:
      0 0 0 3px rgba(139,92,246,0.18);
  }

  .mh-assign-select option {

    background: white;

    color: black;

    padding: 10px;
  }

  /* =========================
     LABELS
  ========================= */

  .mh-section-label {

    margin: 34px 0 18px;

    font-size: 13px;

    color: #94a3b8;

    font-weight: bold;

    text-transform: uppercase;

    letter-spacing: 1px;
  }

  /* =========================
     UNASSIGNED EMPLOYEES
  ========================= */

  .mh-emp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
    gap: 16px;
  }

  .mh-emp-card {

    display: flex;
    justify-content: space-between;
    align-items: center;

    background:
      rgba(255,255,255,0.04);

    padding: 16px;

    border-radius: 18px;

    transition:
      all 0.25s ease;
  }

  .mh-emp-card:hover {

    transform: translateY(-3px);

    background:
      rgba(255,255,255,0.07);

    box-shadow:
      0 0 20px rgba(124,58,237,0.14);
  }
`;

let injected = false;

function injectCSS() {

  if (injected) return;

  injected = true;

  const style = document.createElement("style");

  style.textContent = CSS;

  document.head.appendChild(style);
}

function initials(name = "") {

  return name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ManagerHierarchy() {

  injectCSS();

  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [assigning, setAssigning] = useState({});
  const DEPARTMENTS = [
    "Engineering",
    "Product",
    "Design",
    "Data",
    "Finance",
    "Human Resources",
    "Marketing",
    "Operations"
  ];

 useEffect(() => {

   fetchAll();

   const interval =
     setInterval(() => {

       fetchAll();

     }, 1500);

   return () =>
     clearInterval(interval);

 }, []);

  const fetchAll = async () => {

    await Promise.all([
      fetchManagers(),
      fetchEmployees()
    ]);
  };

const fetchManagers = async () => {

  try {

    // GET ALL MANAGERS

    const managersRes =
      await hrAPI.getManagers();

    const managerList =
      managersRes.data;

    // LOAD EMPLOYEES FOR EACH MANAGER

    const managersWithEmployees =
      await Promise.all(

        managerList.map(async (manager) => {

          try {

            const empRes =
              await employeeAPI.getAll();

           const assignedEmployees =
             empRes.data.filter(
               emp =>
                 (
                   emp.managerId === manager.id
                 ) ||
                 (
                   emp.manager &&
                   emp.manager.id === manager.id
                 )
             );

            return {
              ...manager,
              employees: assignedEmployees
            };

          } catch {

            return {
              ...manager,
              employees: []
            };
          }
        })
      );

    setManagers(
      managersWithEmployees
    );

  } catch (err) {

    console.error(err);
  }
};

  const fetchEmployees = async () => {

    try {

      const res =
        await employeeAPI.getAll();

      // ONLY EMPLOYEES WITHOUT MANAGER

      const employeeList =
        res.data.filter(
          emp =>
            emp.role === "EMPLOYEE" &&
            !emp.manager
        );

      setEmployees(employeeList);

    } catch (err) {

      console.error(err);
    }
  };
const updateManagerDepartment = async (
  managerId,
  department
) => {

  try {

    // UPDATE MANAGER DEPARTMENT

    await hrAPI.changeDepartment({

      employeeId: managerId,
      department

    });

    // REFRESH EVERYTHING

    const empRes =
      await employeeAPI.getAll();

    const allEmployees =
      empRes.data;

    // MANAGERS

    const managerList =
      allEmployees.filter(
        emp =>
          emp.role === "MANAGER"
      );

    // MAP EMPLOYEES

    const managersWithEmployees =
      managerList.map(manager => ({

        ...manager,

        employees:
          allEmployees.filter(
            emp =>
              emp.managerId === manager.id
          )

      }));

    setManagers(
      managersWithEmployees
    );

    setEmployees(
      allEmployees
    );

  } catch (err) {

    console.error(err);
  }
};

const assignEmployee = async (
  managerId
) => {

  const employeeId =
    selectedEmployees[managerId];

  if (!employeeId) return;

  setAssigning(prev => ({
    ...prev,
    [managerId]: true
  }));

  try {

    await hrAPI.assignManager({

      employeeId:
        Number(employeeId),

      managerId:
        Number(managerId)

    });

    // REFRESH DATA

    const empRes =
      await employeeAPI.getAll();

    const allEmployees =
      empRes.data;

    // GET MANAGERS

    const managerList =
      allEmployees.filter(
        emp =>
          emp.role === "MANAGER"
      );

    // MAP EMPLOYEES TO MANAGERS

    const managersWithEmployees =
      managerList.map(manager => ({

        ...manager,

        employees:
          allEmployees.filter(
            emp =>
              (
                emp.managerId === manager.id
              ) ||
              (
                emp.manager &&
                emp.manager.id === manager.id
              )
          )

      }));

    setManagers(
      managersWithEmployees
    );

    // ONLY UNASSIGNED EMPLOYEES

    setEmployees(
      allEmployees.filter(
        emp =>
          emp.role === "EMPLOYEE" &&
          !emp.manager &&
          !emp.managerId
      )
    );

    // RESET SELECT

    setSelectedEmployees(prev => ({
      ...prev,
      [managerId]: ""
    }));

  } catch (err) {

    console.error(err);

  } finally {

    setAssigning(prev => ({
      ...prev,
      [managerId]: false
    }));
  }
};

  const removeEmployee = async (
    employeeId
  ) => {

    try {

      await hrAPI.removeManager({
        employeeId
      });

      await fetchAll();

    } catch (err) {

      console.error(err);
    }
  };

  const promoteEmployee = async (
    employeeId
  ) => {

    try {

      await hrAPI.changeRole({
        employeeId,
        role: "MANAGER"
      });

      await fetchAll();

    } catch (err) {

      console.error(err);
    }
  };

  const demoteManager = async (
    managerId
  ) => {

    try {

      await hrAPI.changeRole({
        employeeId: managerId,
        role: "EMPLOYEE"
      });

      await fetchAll();

    } catch (err) {

      console.error(err);
    }
  };

  const assignedIds = new Set(
    managers.flatMap(
      m =>
        (m.employees || [])
          .map(e => String(e.id))
    )
  );

  const availableEmployees =
    employees.filter(
      e =>
        !assignedIds.has(
          String(e.id)
        )
    );

  const totalAssigned =
    managers.reduce(
      (n, m) =>
        n + (m.employees?.length || 0),
      0
    );

  return (
    <div className="mh-root">

      <h1 className="mh-title">
        Organization Hierarchy
      </h1>

      <p className="mh-subtitle">
        {managers.length} managers ·
        {" "}
        {totalAssigned} assigned employees ·
        {" "}
        {availableEmployees.length} unassigned
      </p>

      <div className="mh-section-label">
        Managers
      </div>

      <div className="mh-manager-grid">

        {managers.map(manager => {

          const empList =
            manager.employees || [];

          const selectedEmpId =
            selectedEmployees[manager.id] || "";

          return (

            <div
              key={manager.id}
              className="mh-manager-card"
            >

              <div className="mh-card-accent" />

              <div className="mh-card-body">

                <div className="mh-manager-header">

                  <div className="mh-manager-meta">

                    <div className="mh-avatar">
                      {initials(manager.name)}
                    </div>

                    <div>

                      <div className="mh-manager-name">
                        {manager.name}
                      </div>

                      <select
                        className="mh-dept-badge"
                        value={manager.department || ""}
                        onChange={(e) =>
                          updateManagerDepartment(
                            manager.id,
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          No Dept
                        </option>

                        {DEPARTMENTS.map(dept => (

                          <option
                            key={dept}
                            value={dept}
                          >
                            {dept}
                          </option>

                        ))}

                      </select>

                    </div>

                  </div>

                  <button
                    className="mh-demote-btn"
                    onClick={() =>
                      demoteManager(manager.id)
                    }
                  >
                    ↓ Demote
                  </button>

                </div>

                {empList.length > 0 ? (

                  <div className="mh-emp-list">

                    {empList.map(emp => (

                      <div
                        key={emp.id}
                        className="mh-emp-item"
                      >

                        <div className="mh-emp-info">

                          <div className="mh-avatar-sm">
                            {initials(emp.name)}
                          </div>

                          <div>
                            {emp.name}
                          </div>

                        </div>

                        <button
                          className="mh-remove-btn"
                          onClick={() =>
                            removeEmployee(emp.id)
                          }
                        >
                          Remove
                        </button>

                      </div>

                    ))}

                  </div>

                ) : (

                  <div className="mh-empty-msg">
                    No team members yet
                  </div>

                )}

                <div className="mh-assign-box">

                  <select
                    className="mh-assign-select"
                    value={selectedEmpId}
                    onChange={e =>
                      setSelectedEmployees(prev => ({
                        ...prev,
                        [manager.id]:
                          e.target.value
                      }))
                    }
                  >

                    <option value="">
                      Select employee...
                    </option>

                    {availableEmployees.map(emp => (

                      <option
                        key={emp.id}
                        value={emp.id}
                      >
                        {emp.name}
                      </option>

                    ))}

                  </select>

                  <button
                    className="mh-add-btn"
                    onClick={() =>
                      assignEmployee(manager.id)
                    }
                    disabled={!selectedEmpId}
                  >
                    {assigning[manager.id]
                      ? "Adding..."
                      : "+ Add"}
                  </button>

                </div>

              </div>

            </div>
          );
        })}

      </div>

      <div className="mh-section-label">
        Unassigned Employees
      </div>

      <div className="mh-emp-grid">

        {availableEmployees.map(emp => (

          <div
            key={emp.id}
            className="mh-emp-card"
          >

            <div className="mh-emp-info">

              <div className="mh-avatar-sm">
                {initials(emp.name)}
              </div>

              <div>
                {emp.name}
              </div>

            </div>

            <button
              className="mh-promote-btn"
              onClick={() =>
                promoteEmployee(emp.id)
              }
            >
              ↑ Promote
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}