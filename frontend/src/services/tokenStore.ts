let _accessToken: string | null = null;
let _csrfToken: string | null = null;

export const getToken = () => _accessToken;
export const setToken = (t: string | null) => { _accessToken = t; };
export const clearToken = () => { _accessToken = null; _csrfToken = null; };

export const getCsrfToken = () => {
  if (_csrfToken) return _csrfToken;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};
export const setCsrfToken = (t: string | null) => { _csrfToken = t; };
