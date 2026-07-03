import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const ML_API_BASE_URL = import.meta.env.VITE_ML_API_BASE_URL || 'http://127.0.0.1:8000';

// Create axios instance for main API
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Create axios instance for ML API
export const mlApi = axios.create({
  baseURL: ML_API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;