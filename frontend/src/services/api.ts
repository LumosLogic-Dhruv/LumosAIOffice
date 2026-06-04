import axios from 'axios';

const CLOUD_RUN_URL = 'https://docflowai-874559728801.asia-south1.run.app';

const base = (import.meta as any).env.PROD
  ? CLOUD_RUN_URL
  : ((import.meta as any).env.VITE_API_URL || 'http://localhost:5000');

const normalizedURL = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: normalizedURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const quotationApi = api;
export default api;
