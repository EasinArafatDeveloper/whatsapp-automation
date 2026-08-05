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
  if (typeof window === 'undefined') {
    return (process.env.NEXT_PUBLIC_API_URL || RAILWAY_BACKEND).replace(/\/+$/, '');
  }

  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/+$/, '');
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return envUrl?.replace(/\/+$/, '') || 'http://localhost:5000';
  }

  return RAILWAY_BACKEND;
};

export const superFetch = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getSuperAdminToken();
  const base = getSuperApiBase();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const res = await fetch(`${base}${cleanEndpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `SuperAdmin ${token}`,
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = { message: 'Invalid JSON response from backend server' };
    }
  } else {
    const rawText = await res.text();
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Super Admin API endpoint not found (404). Please verify backend deployment on Railway.');
      }
      throw new Error(`Server error (${res.status}): ${rawText.slice(0, 100)}`);
    }
    data = { message: rawText };
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
};
