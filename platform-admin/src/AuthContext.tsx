import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthCtx {
  user: AdminUser | null;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const u = res.data;
          if (u.role !== 'root' && u.role !== 'admin') {
            localStorage.removeItem('admin_token');
          } else {
            setUser(u);
          }
        } catch {
          localStorage.removeItem('admin_token');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = (token: string, userData: AdminUser) => {
    localStorage.setItem('admin_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
