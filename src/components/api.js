import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Auth token injection ──────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hr_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("hr_token");
      localStorage.removeItem("hr_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post("/api/auth/login", data),
  register: (data) => api.post("/api/auth/register", data),
};

// ── EMPLOYEES ─────────────────────────────────────────────────────────────────
export const employeeAPI = {
  getAll:          ()         => api.get("/api/employees"),
  getById:         (id)       => api.get(`/api/employees/${id}`),
  create:          (data)     => api.post("/api/employees", data),
  update:          (id, data) => api.put(`/api/employees/${id}`, data),
  patch:           (id, data) => api.patch(`/api/employees/${id}`, data),
  updatePersonal:  (id, data) => api.patch(`/api/employees/${id}/personal-info`, data),
  delete:          (id)       => api.delete(`/api/employees/${id}`),
  getSchedule:     (id)       => api.get(`/api/employees/${id}/schedule`),
  getDashStats:    (id)       => api.get(`/api/employees/${id}/dashboard-stats`),
  getAnnouncements:()         => api.get("/api/employees/announcements"),
};

// ── MANAGER ───────────────────────────────────────────────────────────────────
export const managerAPI = {
  getProfile:      ()   => api.get("/api/manager/profile"),
  getDashboard:    ()   => api.get("/api/manager/dashboard"),
  getDashSummary:  ()   => api.get("/api/manager/dashboard-summary"),
  getActivity:     ()   => api.get("/api/manager/activity"),
  getTeam:         ()   => api.get("/api/manager/team"),
  searchTeam:      (q)  => api.get(`/api/manager/search?q=${q}`),
  getReports: {
    teamSummary:   ()   => api.get("/api/manager/reports/team-summary"),
    productivity:  ()   => api.get("/api/manager/reports/productivity"),
    hrTeamSummary: ()   => api.get("/api/manager/reports/hr/team-summary"),
    attendance:    ()   => api.get("/api/manager/reports/attendance"),
  },
};

// ── LEAVES ────────────────────────────────────────────────────────────────────
export const leaveAPI = {
  getAll:       ()         => api.get("/api/leaves"),
  getById:      (id)       => api.get(`/api/leaves/${id}`),
  getPending:   ()         => api.get("/api/leaves/pending"),
  getHistory:   (empId)    => api.get(`/api/leaves/history/${empId}`),
  getBalance:   (empId)    => api.get(`/api/leaves/balance/${empId}`),
  apply:        (data)     => api.post("/api/leaves/apply", data),
  applyHR:      (data)     => api.post("/api/leaves/apply/hr", data),
  approve:      (id)       => api.put(`/api/leaves/${id}/approve`),
  reject:       (id)       => api.put(`/api/leaves/${id}/reject`),
  cancel:       (leaveId)  => api.delete(`/api/leaves/${leaveId}/cancel`),
};

export const payrollAPI = {
  getAll:        ()          => api.get("/api/payroll"),
  getMonth:      ()          => api.get("/api/payroll/month"),
  getByEmployee: (empId)     => api.get(`/api/payroll/employee/${empId}`),

  generate:      ()          => api.post("/api/payroll/generate"),
  processAll:    ()          => api.post("/api/payroll/process-all"),
  process:       (id)        => api.put(`/api/payroll/${id}/process`),


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
  getJobs:   ()       => api.get("/api/recruitment/jobs"),
  createJob: (data)   => api.post("/api/recruitment/jobs", data),
  updateJobStatus: (id, status) =>
    api.put(`/api/recruitment/jobs/${id}/status`, { status })
};

// ── SCREENING ─────────────────────────────────────────────────────────────────
export const screeningAPI = {
  getByCandidate: (candidateId) => api.get(`/api/screening/${candidateId}`),
  getByJob:       (jobId)       => api.get(`/api/screening/job/${jobId}`),
};

// ── RESUME ────────────────────────────────────────────────────────────────────
export const resumeAPI = {
  upload: (candidateId, data) => api.post(`/api/resumes/${candidateId}`, data),
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll:         ()         => api.get("/api/notifications"),
  getUnread:      ()         => api.get("/api/notifications/unread"),
  getByEmployee:  (empId)    => api.get(`/api/notifications/${empId}`),
  getUnreadByEmp: (empId)    => api.get(`/api/notifications/${empId}/unread`),
  getUnreadCount: (empId)    => api.get(`/api/notifications/${empId}/unread-count`),
  create:         (data)     => api.post("/api/notifications", data),
  markRead:       (notifId)  => api.put(`/api/notifications/${notifId}/read`),
  markAllReadEmp: (empId)    => api.put(`/api/notifications/${empId}/read-all`),
  markAllRead:    ()         => api.put("/api/notifications/read-all"),
};

// ── PERFORMANCE ───────────────────────────────────────────────────────────────
export const performanceAPI = {
  create:      (data)    => api.post("/api/performance", data),
  getByEmployee:(empId)  => api.get(`/api/performance/${empId}`),
};

// ── POLICIES ──────────────────────────────────────────────────────────────────
export const policyAPI = {
  getAll:  () => api.get("/api/policies"),
  create:  (data) => api.post("/api/policies", data),
};

// ── CHAT ─────────────────────────────────────────────────────────────────────
export const chatAPI = {
  send:       (data)   => api.post("/api/chat", data),
  getHistory: (userId) => api.get(`/api/chat/${userId}`),
};

export default api;
