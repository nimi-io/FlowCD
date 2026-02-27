import { useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "flowcd_token";

export interface AuthUser {
  email: string;
  name: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<AuthUser | null>(null);

  const isAuthenticated = token !== null;

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    setStoredToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  // Restore user from token on mount (no network call needed for display).
  useEffect(() => {
    if (token && !user) {
      // Parse email from JWT payload (base64 middle section).
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ email: payload.sub ?? "", name: payload.name ?? "Admin" });
      } catch {
        clearStoredToken();
        setToken(null);
      }
    }
  }, [token, user]);

  return { token, user, isAuthenticated, login, logout };
}
