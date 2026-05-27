import axios from "axios";

// ─── Base instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8090",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ───────────────────────────────────────────────────────────────────
export const login  = (credentials) => api.post("/api/auth/login", credentials);
export const logout = () => api.post("/api/auth/logout");

// ─── Manager / HR dashboard helpers ─────────────────────────────────────────
export const getManagerDashboard = () => api.get("/api/manager/dashboard").then(r => r.data);
export const getManagerActivity  = () => api.get("/api/manager/activity").then(r => r.data);
export const getManagerProfile   = () => api.get("/api/manager/profile").then(r => r.data);
export const getTeam             = () => api.get("/api/manager/team").then(r => r.data);
export const searchTeam          = (q) => api.get("/api/manager/team/search", { params: { q } }).then(r => r.data);
export const getAllAttendance     = () => api.get("/api/attendance").then(r => r.data);
export const getAttendanceSummary= () => api.get("/api/attendance/summary").then(r => r.data);
export const getAllNotifications  = () => api.get("/api/notifications").then(r => r.data);
export const markAllNotificationsRead = () => api.put("/api/notifications/read-all");
export const markNotificationRead     = (id) => api.put(`/api/notifications/${id}/read`);

// ─── Leave — Employee ───────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's own leave history.
 * Works for EMPLOYEE, MANAGER, and HR_ADMIN roles alike.
 */
export const getMyLeaves = () => api.get("/api/leaves/my");

/**
 * Fetch leave history for a specific employee (used in manager dashboard).
 */
export const getLeaveHistory = (empId) =>
  api.get(`/api/leaves/history/${empId}`).then(r => r.data);

/**
 * Apply for leave.
 * Both EMPLOYEE and MANAGER can call this.
 * Routing is determined server-side:
 *   - EMPLOYEE leave → goes to their MANAGER for approval
 *   - MANAGER leave  → goes to HR_ADMIN for approval
 *
 * @param {{ employeeId: number, leaveType: string, startDate: string, endDate: string, reason: string }} dto
 */
export const applyLeave = (dto) => api.post("/api/leaves/apply", dto);

/**
 * Cancel a leave request the current user owns.
 */
export const cancelLeave = (leaveId) =>
  api.delete(`/api/leaves/${leaveId}/cancel`);

/**
 * Fetch leave balance for a given employee.
 */
export const getLeaveBalance = (empId) =>
  api.get(`/api/leaves/balance/${empId}`).then(r => r.data);

/**
 * Check whether a date range overlaps with the current user's existing leaves.
 *
 * @param {string} startDate  ISO date string: "YYYY-MM-DD"
 * @param {string} endDate    ISO date string: "YYYY-MM-DD"
 * @returns {Promise<{ hasOverlap: boolean, conflictingLeaves: Array }>}
 */
export const checkLeaveOverlap = (startDate, endDate) =>
  api.get("/api/leaves/overlap", { params: { startDate, endDate } });

// ─── Leave — Manager / HR ───────────────────────────────────────────────────

/**
 * Fetch all leaves visible to the current user based on their role:
 *   HR_ADMIN → all MANAGER leaves pending approval
 *   MANAGER  → all EMPLOYEE leaves in their team
 *   EMPLOYEE → their own leaves
 */
export const getAllLeaves = () => api.get("/api/leaves").then(r => r.data);

/**
 * Fetch only PENDING leaves the current user is authorised to act on:
 *   MANAGER  → pending leaves from their direct reports (EMPLOYEE)
 *   HR_ADMIN → pending leaves from all MANAGERs
 */
export const getPendingLeaves = () => api.get("/api/leaves/pending/manager").then(r => r.data);

/**
 * Approve a leave request.
 *
 * POST /api/leaves/{id}/approve — mandatory JSON body { comment }.
 * Backend enforces:
 *   - comment must not be blank
 *   - self-approval blocked
 *   - MANAGER can only approve EMPLOYEE leaves in their team
 *   - HR_ADMIN can only approve MANAGER leaves
 *
 * @param {number} leaveId
 * @param {string} comment  Must not be blank.
 */
export const approveLeave = (leaveId, comment) =>
  api.put(`/api/leaves/${leaveId}/approve/manager`, null, { params: { comment } });

/**
 * Reject a leave request.
 *
 * POST /api/leaves/{id}/reject — mandatory JSON body { reason }.
 * Backend enforces:
 *   - reason must not be blank
 *   - self-rejection blocked
 *   - same role-based access as approveLeave
 *
 * @param {number} leaveId
 * @param {string} reason   Must not be blank.
 */
export const rejectLeave = (leaveId, reason) =>
  api.put(`/api/leaves/${leaveId}/reject`, null, { params: { reason } });

// ─── Attendance ─────────────────────────────────────────────────────────────

/**
 * Clock-in guard.
 * Check whether the employee has an approved leave today before punching.
 * If onLeave === true, block the punch and show
 * "You are on approved leave today."
 *
 * @param {number} empId
 * @returns {Promise<{ onLeave: boolean }>}
 */
export const isOnLeaveToday = (empId) =>
  api.get(`/api/leaves/on-leave-today/${empId}`);

export const clockIn  = (empId) => api.post("/api/attendance/clock-in",  { employeeId: empId });
export const clockOut = (empId) => api.post("/api/attendance/clock-out", { employeeId: empId });
export const getAttendance = (empId) => api.get(`/api/attendance/employee/${empId}`);

// ─── Employees ──────────────────────────────────────────────────────────────
export const getEmployeeProfile = (empId) => api.get(`/api/employees/${empId}`);
export const getMyProfile = () => api.get("/api/employees/me");

export default api;
