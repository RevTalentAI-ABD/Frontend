// const BASE_URL = "/api";

// // ─── Auth helpers ────────────────────────────────────────────────────────────
// function getToken() {
//   return localStorage.getItem("token");
// }

// function authHeaders() {
//   return {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${getToken()}`,
//   };
// }

// async function handleResponse(res) {
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(text || `HTTP ${res.status}`);
//   }
//   // Some endpoints return 204 No Content
//   if (res.status === 204) return null;
//   return res.json();
// }

// // ─── Auth ────────────────────────────────────────────────────────────────────
// export async function login(email, password) {
//   const res = await fetch(`${BASE_URL}/auth/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });
//   return handleResponse(res);
// }

// export async function register(data) {
//   const res = await fetch(`${BASE_URL}/auth/register`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });
//   return handleResponse(res);
// }

// // ─── Manager Dashboard ───────────────────────────────────────────────────────
// export async function getManagerDashboard() {
//   const res = await fetch(`${BASE_URL}/manager/dashboard`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function getManagerActivity() {
//   const res = await fetch(`${BASE_URL}/manager/activity`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function getManagerProfile() {
//   const res = await fetch(`${BASE_URL}/manager/profile`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function getDashboardSummary() {
//   const res = await fetch(`${BASE_URL}/manager/dashboard-summary`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// // ─── Team / Employees ────────────────────────────────────────────────────────
// export async function getTeam() {
//   const res = await fetch(`${BASE_URL}/manager/team`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function searchTeam(query) {
//   const res = await fetch(
//     `${BASE_URL}/manager/search?query=${encodeURIComponent(query)}`,
//     { headers: authHeaders() }
//   );
//   return handleResponse(res);
// }

// export async function getEmployee(id) {
//   const res = await fetch(`${BASE_URL}/employees/${id}`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function getAllEmployees() {
//   const res = await fetch(`${BASE_URL}/employees`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// // ─── Attendance ──────────────────────────────────────────────────────────────
// export async function getAllAttendance() {
//   const res = await fetch(`${BASE_URL}/attendance`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function getAttendanceSummary() {
//   const res = await fetch(`${BASE_URL}/attendance/summary`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function getAttendanceHrSummary(from, to) {
//   const res = await fetch(
//     `${BASE_URL}/attendance/hr/summary?from=${from}&to=${to}`,
//     { headers: authHeaders() }
//   );
//   return handleResponse(res);
// }

// export async function exportAttendance() {
//   const res = await fetch(`${BASE_URL}/attendance/export`, {
//     headers: { Authorization: `Bearer ${getToken()}` },
//   });
//   if (!res.ok) throw new Error("Export failed");
//   const blob = await res.blob();
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "attendance_export.csv";
//   a.click();
//   window.URL.revokeObjectURL(url);
// }

// // ─── Leaves ──────────────────────────────────────────────────────────────────
// export async function getAllLeaves() {
//   const res = await fetch(`${BASE_URL}/leaves`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function getPendingLeaves() {
//   const res = await fetch(`${BASE_URL}/leaves/pending`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function approveLeave(id) {
//   const res = await fetch(`${BASE_URL}/leaves/${id}/approve`, {
//     method: "PUT",
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function rejectLeave(id, reason = "") {
//   const res = await fetch(
//     `${BASE_URL}/leaves/${id}/reject?reason=${encodeURIComponent(reason)}`,
//     {
//       method: "PUT",
//       headers: authHeaders(),
//     }
//   );
//   return handleResponse(res);
// }

// // ─── Notifications ───────────────────────────────────────────────────────────
// export async function getAllNotifications() {
//   const res = await fetch(`${BASE_URL}/notifications`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function getAllUnreadNotifications() {
//   const res = await fetch(`${BASE_URL}/notifications/unread`, {
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function markAllNotificationsRead() {
//   const res = await fetch(`${BASE_URL}/notifications/read-all`, {
//     method: "PUT",
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }

// export async function markNotificationRead(notifId) {
//   const res = await fetch(`${BASE_URL}/notifications/${notifId}/read`, {
//     method: "PUT",
//     headers: authHeaders(),
//   });
//   return handleResponse(res);
// }
import axios from "axios";

const BASE_URL = "/api";

// ─── Auth helpers ────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── Axios instance with token ───────────────────────────────────────────────
const axiosAuth = axios.create({ baseURL: BASE_URL });
axiosAuth.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function register(data) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ─── Manager Dashboard ───────────────────────────────────────────────────────
export async function getManagerDashboard() {
  const res = await fetch(`${BASE_URL}/manager/dashboard`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getManagerActivity() {
  const res = await fetch(`${BASE_URL}/manager/activity`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getManagerProfile() {
  const res = await fetch(`${BASE_URL}/manager/profile`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getDashboardSummary() {
  const res = await fetch(`${BASE_URL}/manager/dashboard-summary`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Team / Employees ────────────────────────────────────────────────────────
export async function getTeam() {
  const res = await fetch(`${BASE_URL}/manager/team`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function searchTeam(query) {
  const res = await fetch(
    `${BASE_URL}/manager/search?query=${encodeURIComponent(query)}`,
    { headers: authHeaders() }
  );
  return handleResponse(res);
}

export async function getEmployee(id) {
  const res = await fetch(`${BASE_URL}/employees/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getAllEmployees() {
  const res = await fetch(`${BASE_URL}/employees`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Attendance ──────────────────────────────────────────────────────────────
export async function getAllAttendance() {
  const res = await fetch(`${BASE_URL}/attendance`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getAttendanceSummary() {
  const res = await fetch(`${BASE_URL}/attendance/summary`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getAttendanceHrSummary(from, to) {
  const res = await fetch(
    `${BASE_URL}/attendance/hr/summary?from=${from}&to=${to}`,
    { headers: authHeaders() }
  );
  return handleResponse(res);
}

export async function exportAttendance() {
  const res = await fetch(`${BASE_URL}/attendance/export`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance_export.csv";
  a.click();
  window.URL.revokeObjectURL(url);
}

// ─── Leaves ──────────────────────────────────────────────────────────────────
export async function getAllLeaves() {
  const res = await fetch(`${BASE_URL}/leaves`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getPendingLeaves() {
  const res = await fetch(`${BASE_URL}/leaves/pending`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function approveLeave(id, comment) {
  const res = await fetch(`${BASE_URL}/leaves/${id}/approve`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ reason: comment })
  });
  return handleResponse(res);
}

export async function rejectLeave(id, reason) {
  const res = await fetch(`${BASE_URL}/leaves/${id}/reject`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ reason })
  });
  return handleResponse(res);
}

export async function getLeaveHistory(empId) {
  const res = await fetch(`${BASE_URL}/leaves/history/${empId}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getLeaveBalance(empId) {
  const res = await fetch(`${BASE_URL}/leaves/balance/${empId}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function applyLeave(data) {
  const res = await fetch(`${BASE_URL}/leaves/apply`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function applyLeaveHR(data) {
  const res = await fetch(`${BASE_URL}/leaves/apply/hr`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ─── Notifications ───────────────────────────────────────────────────────────
export async function getAllNotifications() {
  const res = await fetch(`${BASE_URL}/notifications`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getAllUnreadNotifications() {
  const res = await fetch(`${BASE_URL}/notifications/unread`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function markNotificationRead(notifId) {
  const res = await fetch(`${BASE_URL}/notifications/${notifId}/read`, {
    method: "PUT",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Employee API ────────────────────────────────────────────────────────────
export const employeeAPI = {
  getAll:       () => axiosAuth.get(`/employees`),
  create:       (data) => axiosAuth.post(`/employees`, data),
  getDashStats: (id) => axiosAuth.get(`/employees/${id}/dashboard-stats`),
};

// ─── Performance API ─────────────────────────────────────────────────────────
export const performanceAPI = {
  getByEmployee: (empId) => axiosAuth.get(`/performance/employee/${empId}`),
};

// ─── HR API ──────────────────────────────────────────────────────────────────
export const hrAPI = {
  getManagers:      () => axiosAuth.get(`/hr/managers`),
  assignManager:    (data) => axiosAuth.put(`/hr/assign-manager`, data),
  removeManager:    (data) => axiosAuth.put(`/hr/remove-manager`, data),
  changeRole:       (data) => axiosAuth.put(`/hr/change-role`, data),
  changeDepartment: (data) => axiosAuth.put(`/hr/change-department`, data),
};

export default axiosAuth;
