import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — inject JWT ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ihsan_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle 401 ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ihsan_token');
      localStorage.removeItem('ihsan_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;