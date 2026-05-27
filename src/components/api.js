import api from "../api/axiosConfig";
import { getApiRoot } from "../utils/apiBase";

const API_ROOT = getApiRoot();

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post("/api/auth/login", data),
  register: (data) => api.post("/api/auth/register", data),
};

// ── EMPLOYEES ─────────────────────────────────────────────────────────────────
export const employeeAPI = {
  getAll:           ()         => api.get("/api/employees"),
  getById:          (id)       => api.get(`/api/employees/${id}`),
  create:           (data)     => api.post("/api/employees", data),
  update:           (id, data) => api.put(`/api/employees/${id}`, data),
  patch:            (id, data) => api.patch(`/api/employees/${id}`, data),
  updatePersonal:   (id, data) => api.patch(`/api/employees/${id}/personal-info`, data),
  delete:           (id)       => api.delete(`/api/employees/${id}`),
  getSchedule:      (id)       => api.get(`/api/employees/${id}/schedule`),
  getDashStats:     (id)       => api.get(`/api/employees/${id}/dashboard-stats`),
  getAnnouncements: ()         => api.get("/api/employees/announcements"),
};

// ── MANAGER ───────────────────────────────────────────────────────────────────
export const managerAPI = {
  getProfile:     ()  => api.get("/api/manager/profile"),
  getDashboard:   ()  => api.get("/api/manager/dashboard"),
  getDashSummary: ()  => api.get("/api/manager/dashboard-summary"),
  getActivity:    ()  => api.get("/api/manager/activity"),
  getTeam:        ()  => api.get("/api/manager/team"),
  searchTeam:     (q) => api.get(`/api/manager/search?query=${encodeURIComponent(q)}`),
  getReports: {
    teamSummary:   () => api.get("/api/manager/reports/team-summary"),
    productivity:  () => api.get("/api/manager/reports/productivity"),
    hrTeamSummary: () => api.get("/api/manager/reports/hr/team-summary"),
    attendance:    () => api.get("/api/manager/reports/attendance"),
  },
};

// ── LEAVES ────────────────────────────────────────────────────────────────────
// FIX 1: getHistory always calls /my — returns only the authenticated user's leaves
// FIX 2: getBalance/my — uses JWT, no empId needed (avoids cross-user data leak)
// FIX 3: approve/reject send comment/reason as @RequestParam, not managerId
export const leaveAPI = {
  getAll:     ()      => api.get("/api/leaves"),
  getById:    (id)    => api.get(`/api/leaves/${id}`),

  // Explicit endpoints for two-stage approval
  getPendingManager: () => api.get("/api/leaves/pending/manager"),
  getPendingHR:      () => api.get("/api/leaves/pending/hr"),

  // Always fetch the current user's own leaves via JWT — ignore empId
  getHistory: ()      => api.get("/api/leaves/my"),
  getMy:      ()      => api.get("/api/leaves/my"),

  // Balance: use /my variant (resolved from JWT) to avoid cross-user data
  getBalance: ()      => api.get("/api/leaves/balance/my"),

  apply:      (data)  => api.post("/api/leaves/apply", data),
  applyHR:    (data)  => api.post("/api/leaves/apply/hr", data),

  // approve: explicit endpoints
  approveManager: (id, comment = "Approved by Manager") =>
    api.put(`/api/leaves/${id}/approve/manager`, null, { params: { comment } }),
  approveHR: (id, comment = "Approved by HR") =>
    api.put(`/api/leaves/${id}/approve/hr`, null, { params: { comment } }),

  reject: (id, reason) =>
    api.put(`/api/leaves/${id}/reject`, null, { params: { reason } }),

  cancel: (leaveId) => api.delete(`/api/leaves/${leaveId}/cancel`),
};

// ── PAYROLL ───────────────────────────────────────────────────────────────────
const PAYROLL_BASE = "/api/payroll";

export const payrollAPI = {
  getAll:        ()               => api.get(PAYROLL_BASE),
  getByEmployee: (empId)          => api.get(`${PAYROLL_BASE}/employee/${empId}`),
  getByMonth:    (month, year)    => api.get(`${PAYROLL_BASE}/month`, { params: { month, year } }),
  generate:      (month, year)    => api.post(`${PAYROLL_BASE}/generate`, null, { params: { month, year } }),
  assignSalary:  (empId, dto)     => api.post(`${PAYROLL_BASE}/employee/${empId}`, dto),
  update:        (payrollId, dto) => api.put(`${PAYROLL_BASE}/${payrollId}`, dto),
  processOne:    (payrollId)      => api.put(`${PAYROLL_BASE}/${payrollId}/process`),
  bulkProcess:   (month, year)    => api.put(`${PAYROLL_BASE}/bulk-process`, null, { params: { month, year } }),
  processAll:    ()               => api.post(`${PAYROLL_BASE}/process-all`),
  markPaid:      (payrollId)      => api.put(`${PAYROLL_BASE}/${payrollId}/pay`),
  downloadSlip:  (id)             => api.get(`${PAYROLL_BASE}/salary-slip/${id}`, { responseType: "blob" }),
};

// ── ATTENDANCE ────────────────────────────────────────────────────────────────
export const attendanceAPI = {
  getAll:          ()              => api.get("/api/attendance"),
  getSummary:      ()              => api.get("/api/attendance/summary"),
  getHRSummary:    ()              => api.get("/api/attendance/hr/summary"),
  getByEmployee:   (empId)         => api.get(`/api/attendance/employee/${empId}`),
  getPresentCount: (empId)         => api.get(`/api/attendance/employee/${empId}/present-count`),
  getRange:        (empId, params) => api.get(`/api/attendance/employee/${empId}/range`, { params }),
  checkin:         (empId, data)   => api.post(`/api/attendance/employee/${empId}/checkin`, data),
  create:          (empId, data)   => api.post(`/api/attendance/employee/${empId}`, data),
  checkout:        (empId)         => api.put(`/api/attendance/employee/${empId}/checkout`),
  regularize:      (attId, data)   => api.put(`/api/attendance/${attId}/regularize`, data),
};

// ── RECRUITMENT ───────────────────────────────────────────────────────────────
export const recruitmentAPI = {
  getJobs:         ()           => api.get("/api/recruitment/jobs"),
  createJob:       (data)       => api.post("/api/recruitment/jobs", data),
  updateJobStatus: (id, status) => api.put(`/api/recruitment/jobs/${id}/status`, { status }),
};

// ── CANDIDATES ────────────────────────────────────────────────────────────────
export const candidateAPI = {
  add:               (data)                             => api.post("/api/candidates", data),
  getByJob:          (jobId)                            => api.get(`/api/candidates/job/${jobId}`),
  getAll:            ()                                 => api.get("/api/candidates"),
  updateStatus:      (id, status)                       => api.put(`/api/candidates/${id}/status`, { status }),
  scheduleInterview: (id, interviewDate, interviewerId) => api.put(`/api/candidates/${id}/schedule`, { interviewDate, interviewerId }),
  delete:            (id)                               => api.delete(`/api/candidates/${id}`),
};

// ── SCREENING ─────────────────────────────────────────────────────────────────
export const screeningAPI = {
  getByCandidate: (candidateId) => api.get(`/api/screening/${candidateId}`),
  getByJob:       (jobId)       => api.get(`/api/screening/job/${jobId}`),
};

// ── RESUME ────────────────────────────────────────────────────────────────────
export const resumeAPI = {
  upload:         (formData)    => api.post("/api/resume/upload", formData),
  getByCandidate: (candidateId) => api.get(`/api/resume/candidate/${candidateId}`),
  getDownloadUrl: (candidateId) => `${API_ROOT}/api/resume/candidate/${candidateId}/download`,
  download:       (candidateId) => api.get(`/api/resume/candidate/${candidateId}/download`, { responseType: "blob" }),
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll:         ()        => api.get("/api/notifications"),
  getUnread:      ()        => api.get("/api/notifications/unread"),
  getByEmployee:  (empId)   => api.get(`/api/notifications/${empId}`),
  getUnreadByEmp: (empId)   => api.get(`/api/notifications/${empId}/unread`),
  getUnreadCount: (empId)   => api.get(`/api/notifications/${empId}/unread-count`),
  create:         (data)    => api.post("/api/notifications", data),
  markRead:       (notifId) => api.put(`/api/notifications/${notifId}/read`),
  markAllReadEmp: (empId)   => api.put(`/api/notifications/${empId}/read-all`),
  markAllRead:    ()        => api.put("/api/notifications/read-all"),
};

// ── PERFORMANCE ───────────────────────────────────────────────────────────────
export const performanceAPI = {
  create:        (data)  => api.post("/api/performance", data),
  getByEmployee: (empId) => api.get(`/api/performance/employee/${empId}`),
};

// ── POLICIES ──────────────────────────────────────────────────────────────────
export const policyAPI = {
  getAll: ()     => api.get("/api/policies"),
  create: (data) => api.post("/api/policies", data),
};

// ── CHAT ──────────────────────────────────────────────────────────────────────
export const chatAPI = {
  send:       (data)   => api.post("/api/chat", data),
  getHistory: (userId) => api.get(`/api/chat/${userId}`),
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiAPI = {
  ask:            (question)    => api.post("/api/ai/ask",             { question }),
  screenResume:   (resume, job) => api.post("/api/ai/screen-resume",   { resume, job }),
  performance:    (history)     => api.post("/api/ai/performance",     { history }),
  generatePolicy: (topic)       => api.post("/api/ai/generate-policy", { topic }),
};

// ── HR ────────────────────────────────────────────────────────────────────────
export const hrAPI = {
  getManagers:      ()     => api.get("/api/hr/managers"),
  assignManager:    (data) => api.put("/api/hr/assign-manager", data),
  changeRole:       (data) => api.put("/api/hr/change-role", data),
  changeDepartment: (data) => api.put("/api/hr/change-department", data),
  removeManager:    (data) => api.put("/api/hr/remove-manager", data),
};

// ── LEAVE CONVENIENCE HELPERS ─────────────────────────────────────────────────
// getLeaveHistory and getLeaveBalance no longer need empId — resolved from JWT
export const getMyLeaves     = ()      => leaveAPI.getMy().then((r) => r.data);
export const getLeaveHistory = ()      => leaveAPI.getMy().then((r) => r.data);
export const getLeaveBalance = ()      => leaveAPI.getBalance().then((r) => r.data);
export const applyLeave      = (data)  => leaveAPI.apply(data).then((r) => r.data);
export const getAllLeaves     = ()      => leaveAPI.getAll().then((r) => r.data);
export const getPendingLeaves = ()     => leaveAPI.getPending().then((r) => r.data);
export const approveLeave    = (id, comment) => leaveAPI.approve(id, comment).then((r) => r.data);
export const rejectLeave     = (id, reason)  => leaveAPI.reject(id, reason).then((r) => r.data);

export default api;