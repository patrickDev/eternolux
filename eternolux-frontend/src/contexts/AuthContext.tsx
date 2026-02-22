// src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext, useContext, useState,
  useEffect, useCallback,
} from "react";
import type { User } from "@/app/types/product.types";

interface AuthContextValue {
  user:         User | null;
  isLoading:    boolean;
  isLoggedIn:   boolean;
  login:        (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register:     (data: RegisterData) => Promise<{ success: boolean; error?: string; errors?: string[] }>;
  logout:       () => Promise<void>;
  refreshUser:  () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  password:  string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.eternolux.com";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Check session on mount ───────────────────────────────
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.message || "Login failed" };
      }
    } catch (err) {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  // ── Register ─────────────────────────────────────────────
  const register = useCallback(async (data: RegisterData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        // Handle backend validation errors
        if (result.code === "WEAK_PASSWORD" && result.errors) {
          return { 
            success: false, 
            error: result.message,
            errors: result.errors 
          };
        }
        return { success: false, error: result.message || "Registration failed" };
      }
    } catch (err) {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/signout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    setUser(null);
  }, []);

  // ── Refresh user data ────────────────────────────────────
  const refreshUser = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isLoggedIn: !!user,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
