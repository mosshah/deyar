"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  timezone: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    timezone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/me/`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/me/`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });
        if (isMounted) {
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            setUser(null);
          }
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const csrf = getCsrfToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (csrf) headers["X-CSRFToken"] = csrf;

      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.detail || (data.email ? data.email[0] : "Login failed. Please check credentials."),
        };
      }
    } catch {
      return {
        success: false,
        error: "Unable to connect to backend server. Please verify backend is running.",
      };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    timezone?: string;
  }) => {
    try {
      const csrf = getCsrfToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (csrf) headers["X-CSRFToken"] = csrf;

      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
          ...data,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setUser(resData);
        return { success: true };
      } else {
        const firstError = Object.values(resData)[0];
        const errorMsg = Array.isArray(firstError) ? firstError[0] : resData.detail || "Registration failed.";
        return { success: false, error: String(errorMsg) };
      }
    } catch {
      return {
        success: false,
        error: "Unable to connect to backend server. Please verify backend is running.",
      };
    }
  };

  const logout = async () => {
    try {
      const csrf = getCsrfToken();
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (csrf) headers["X-CSRFToken"] = csrf;

      await fetch(`${API_BASE}/logout/`, {
        method: "POST",
        credentials: "include",
        headers,
      });
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
