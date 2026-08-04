export const TOKEN_KEY = 'wp_ai_saas_token';
export const USER_KEY = 'wp_ai_saas_user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  whatsappConnected: boolean;
  whatsappNumber: string | null;
}

export const setAuthData = (token: string, user: UserProfile) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const getUser = (): UserProfile | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
};

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
