// Super Admin token utilities — separate from regular user auth
const SUPER_TOKEN_KEY = 'wp_super_admin_token';

export const getSuperAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SUPER_TOKEN_KEY);
};

export const setSuperAdminToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUPER_TOKEN_KEY, token);
  }
};

export const clearSuperAdminToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SUPER_TOKEN_KEY);
  }
};

export const RAILWAY_BACKEND = 'https://whatsapp-automation-production-9851.up.railway.app';

export const getSuperApiBase = (): string => {
  if (typeof window === 'undefined') return RAILWAY_BACKEND;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return RAILWAY_BACKEND;
};

export const superFetch = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getSuperAdminToken();
  const base = getSuperApiBase();

  const res = await fetch(`${base}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `SuperAdmin ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data as T;
};
