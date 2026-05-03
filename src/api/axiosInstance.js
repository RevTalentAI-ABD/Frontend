import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/* ✅ ADD THIS */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("hr_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;