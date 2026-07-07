let _accessToken: string | null = null;
let _csrfToken: string | null = null;

const CSRF_LS_KEY = '_docuflow_csrf';

export const getToken = () => _accessToken;
export const setToken = (t: string | null) => { _accessToken = t; };

export const getCsrfToken = (): string | null => {
  if (_csrfToken) return _csrfToken;
  // Persisted across page reloads
  try { return localStorage.getItem(CSRF_LS_KEY); } catch { return null; }
};

export const setCsrfToken = (t: string | null) => {
  _csrfToken = t;
  try {
    if (t) localStorage.setItem(CSRF_LS_KEY, t);
    else localStorage.removeItem(CSRF_LS_KEY);
  } catch {}
};

export const clearToken = () => {
  _accessToken = null;
  _csrfToken = null;
  try { localStorage.removeItem(CSRF_LS_KEY); } catch {}
};
