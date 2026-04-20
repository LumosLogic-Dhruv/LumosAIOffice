import axios from 'axios';

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

// Ensure the URL ends with /api if it doesn't already
const normalizedURL = API_URL.endsWith('/api') ? API_URL : `${API_URL.replace(/\/$/, '')}/api`;

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
