import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import api from '../services/api';
import { getToken, setToken, clearToken, getCsrfToken, setCsrfToken } from '../services/tokenStore';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User, csrfToken?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const IDLE_CHECK_INTERVAL_MS = 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];

// Access token TTL in ms (1 hour - refresh 5 min before expiry)
const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
const REFRESH_BEFORE_MS = 5 * 60 * 1000;

const CLOUD_RUN_URL = 'https://docflowai-874559728801.asia-south1.run.app';
const base = (import.meta as any).env.PROD
  ? CLOUD_RUN_URL
  : ((import.meta as any).env.VITE_API_URL || 'http://localhost:5000');
const API_BASE = base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef<number>(Date.now());
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true, headers: { 'X-CSRF-Token': getCsrfToken() || '' } }
        );
        setToken(res.data.token);
        if (res.data.csrfToken) setCsrfToken(res.data.csrfToken);
        scheduleRefresh();
      } catch {
        clearToken();
        setUser(null);
      }
    }, ACCESS_TOKEN_TTL_MS - REFRESH_BEFORE_MS);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true, headers: { 'X-CSRF-Token': getCsrfToken() || '' } }
        );
        setToken(res.data.token);
        if (res.data.csrfToken) setCsrfToken(res.data.csrfToken);
        setUser(res.data);
        scheduleRefresh();
      } catch {
        // No valid refresh token — user must log in
      } finally {
        setLoading(false);
      }
    };
    initAuth();
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, [scheduleRefresh]);

  const logout = useCallback(async () => {
    clearToken();
    setUser(null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    try { await api.post('/auth/logout'); } catch {}
  }, []);

  const login = useCallback((token: string, userData: User, csrfToken?: string) => {
    setToken(token);
    if (csrfToken) setCsrfToken(csrfToken);
    setUser(userData);
    scheduleRefresh();
  }, [scheduleRefresh]);

  // ── Idle session timeout ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const resetActivity = () => { lastActivityRef.current = Date.now(); };
    ACTIVITY_EVENTS.forEach((e) => document.addEventListener(e, resetActivity, { passive: true }));

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > IDLE_TIMEOUT_MS) {
        logout();
        toast.error('Session expired due to inactivity. Please sign in again.', { duration: 6000 });
      }
    }, IDLE_CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => document.removeEventListener(e, resetActivity));
      clearInterval(interval);
    };
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
