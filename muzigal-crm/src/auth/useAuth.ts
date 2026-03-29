import { useState, useEffect, useCallback } from 'react';

interface User {
  email: string;
  name: string;
  picture?: string;
  role: string;
}

const TOKEN_KEY = 'zoo_crm_token';
const USER_KEY = 'zoo_crm_user';

function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload?.exp) return true;
  return Date.now() > payload.exp * 1000;
}

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t && !isExpired(t)) return t;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((jwt: string, userData: User) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setTokenState(jwt);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setTokenState(null);
    setUser(null);
  }, []);

  // Check expiry periodically
  useEffect(() => {
    if (!token) return;
    const check = setInterval(() => {
      if (isExpired(token)) {
        logout();
      }
    }, 60000); // check every minute
    return () => clearInterval(check);
  }, [token, logout]);

  return {
    token,
    user,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };
}

// Static helpers for use outside React
export function getStoredToken(): string | null {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t && !isExpired(t)) return t;
  return null;
}

export function getStoredUser(): User | null {
  try {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}
