import { getToken, clearAuth } from './auth';

const RAILWAY_BACKEND = 'https://whatsapp-automation-production-9851.up.railway.app';

const getApiBaseUrl = (): string => {
  // On server-side (SSR), always use env var
  if (typeof window === 'undefined') {
    return (process.env.NEXT_PUBLIC_API_URL || RAILWAY_BACKEND).replace(/\/+$/, '');
  }

  // On client-side: if env var is set and not localhost, use it directly
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/+$/, '');
  }

  // Running locally: use localhost:5000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return envUrl?.replace(/\/+$/, '') || 'http://localhost:5000';
  }

  // Live deployment: use Railway backend directly
  return RAILWAY_BACKEND;
};

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const baseUrl = getApiBaseUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: any;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      data = { message: 'Invalid JSON response from server' };
    }
  } else {
    const rawText = await response.text();
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`API endpoint not found (404). Please verify backend server is deployed.`);
      }
      throw new Error(`Server error (${response.status}): ${rawText.slice(0, 120)}`);
    }
    data = { message: rawText };
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined' && !endpoint.includes('/auth/login')) {
      clearAuth();
      window.location.href = '/login';
    }
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}
