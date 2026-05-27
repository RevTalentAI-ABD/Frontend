import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8090'),
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const role = localStorage.getItem('role');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      window.location.href = role === 'CANDIDATE' ? '/candidate-login' : '/login';
    }
    return Promise.reject(error);
  }
);

export default api;