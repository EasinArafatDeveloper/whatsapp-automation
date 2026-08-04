import { getToken, clearAuth } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined' && !endpoint.includes('/auth/login')) {
      clearAuth();
      window.location.href = '/login';
    }
    throw new Error(data.message || 'An error occurred during request');
  }

  return data as T;
}
