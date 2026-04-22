import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

const departments = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Product",
  "Design",
];

const roles = [
  {
    id: "employee",
    label: "Employee",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    id: "manager",
    label: "Manager",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "hradmin",
    label: "HR Admin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    role: "employee",
  });
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleRole = (id) => setForm({ ...form, role: id });

  const handleDept = (dept) => {
    setForm({ ...form, department: dept });
    setErrors({ ...errors, department: "" });
    setShowDeptDropdown(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Work email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email";
    if (!form.department) newErrors.department = "Please select a department";
    return newErrors;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // Pass form data to Security page via router state
    navigate("/security", { state: { profileData: form } });
  };

  return (
    <div className="hrflow-bg">
      <div className="hrflow-card">

        {/* Logo */}
        <div className="hrflow-logo">
          <div className="hrflow-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <circle cx="9" cy="7" r="3" />
              <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
              <circle cx="17" cy="7" r="2" />
              <path d="M17 13c2.2 0 4 1.8 4 4" />
            </svg>
          </div>
          <span className="hrflow-brand">Rev<strong>Talent</strong></span>
        </div>

        <h1 className="hrflow-title">Create your account</h1>
        <p className="hrflow-subtitle">Join RevTalent and streamline your HR operations</p>

        {/* Steps */}
        <div className="hrflow-steps">
          <div className="hrflow-step active">
            <div className="hrflow-step-circle">1</div>
            <span className="hrflow-step-label">Profile</span>
          </div>
          <div className="hrflow-step-line" />
          <div className="hrflow-step">
            <div className="hrflow-step-circle">2</div>
            <span className="hrflow-step-label">Security</span>
          </div>
        </div>

        <form onSubmit={handleContinue} className="hrflow-form" noValidate>

          {/* Name Row */}
          <div className="hrflow-row">
            <div className="hrflow-field">
              <label>First Name</label>
              <div className={`hrflow-input-wrap ${errors.firstName ? "error" : ""}`}>
                <svg className="hrflow-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Aditya" />
              </div>
              {errors.firstName && <span className="hrflow-error">{errors.firstName}</span>}
            </div>
            <div className="hrflow-field">
              <label>Last Name</label>
              <div className={`hrflow-input-wrap ${errors.lastName ? "error" : ""}`}>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Kumar" />
              </div>
              {errors.lastName && <span className="hrflow-error">{errors.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="hrflow-field">
            <label>Work Email</label>
            <div className={`hrflow-input-wrap ${errors.email ? "error" : ""}`}>
              <svg className="hrflow-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 7L2 7" />
              </svg>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" />
            </div>
            {errors.email && <span className="hrflow-error">{errors.email}</span>}
          </div>

          {/* Department */}
          <div className="hrflow-field hrflow-dropdown-field">
            <label>Department</label>
            <div
              className={`hrflow-input-wrap hrflow-select ${showDeptDropdown ? "open" : ""} ${errors.department ? "error" : ""}`}
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
            >
              <span className={form.department ? "" : "placeholder"}>
                {form.department || "Select department"}
              </span>
              <svg className="hrflow-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
            {showDeptDropdown && (
              <div className="hrflow-dropdown">
                {departments.map((d) => (
                  <div key={d} className={`hrflow-dropdown-item ${form.department === d ? "selected" : ""}`} onClick={() => handleDept(d)}>
                    {d}
                  </div>
                ))}
              </div>
            )}
            {errors.department && <span className="hrflow-error">{errors.department}</span>}
          </div>

          {/* Role */}
          <div className="hrflow-field">
            <label>Role</label>
            <div className="hrflow-roles">
              {roles.map((r) => (
                <button key={r.id} type="button" className={`hrflow-role-btn ${form.role === r.id ? "selected" : ""}`} onClick={() => handleRole(r.id)}>
                  <span className="hrflow-role-icon">{r.icon}</span>
                  <span className="hrflow-role-label">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="hrflow-btn">Continue →</button>
        </form>

        <p className="hrflow-signin">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
}
