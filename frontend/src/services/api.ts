import axios from 'axios';
import { getToken, setToken, setCsrfToken, getCsrfToken } from './tokenStore';

const CLOUD_RUN_URL = 'https://docflowai-874559728801.asia-south1.run.app';

const base = (import.meta as any).env.PROD
  ? CLOUD_RUN_URL
  : ((import.meta as any).env.VITE_API_URL || 'http://localhost:5000');

const normalizedURL = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: normalizedURL,
  withCredentials: true, // send cookies (refresh token) on every request
});

// ── Request interceptor: inject access token from memory ──────────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ─────────────────────────────────
let _refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      original._retry = true;
      try {
        if (!_refreshPromise) {
          _refreshPromise = axios
            .post(
              `${normalizedURL}/auth/refresh`,
              {},
              {
                withCredentials: true,
                headers: { 'X-CSRF-Token': getCsrfToken() || '' },
              }
            )
            .then((res) => {
              setToken(res.data.token);
              setCsrfToken(res.data.csrfToken);
              return res.data.token;
            })
            .finally(() => { _refreshPromise = null; });
        }
        const newToken = await _refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        setToken(null);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const quotationApi = api;
export default api;
