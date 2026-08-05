import { getToken, clearAuth } from './auth';

const getApiBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return url.replace(/\/+$/, ''); // Remove trailing slash if present
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

  const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
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
