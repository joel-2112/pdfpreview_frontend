import axios from 'axios';

const api = axios.create({
  // Use the backend URL defined in .env (VITE_API_BASE_URL).
  // If it is missing (e.g., during a production preview build), fall back to the known backend host.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://pdfpreview-backend.onrender.com',
  timeout: 30000,
});

// Automatically inject JWT Token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
