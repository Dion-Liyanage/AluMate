"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthStorage = useCallback(() => {
    localStorage.removeItem("alumate_token");
    localStorage.removeItem("alumate_user");
    setUser(null);
    setToken(null);
  }, []);

  const parseJwtPayload = useCallback((jwtToken: string) => {
    try {
      const base64Payload = jwtToken.split(".")[1];
      if (!base64Payload) return null;

      const normalizedBase64 = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalizedBase64.padEnd(
        normalizedBase64.length + ((4 - (normalizedBase64.length % 4)) % 4),
        "="
      );

      const decoded = atob(padded);
      return JSON.parse(decoded) as { sub?: string; role?: string };
    } catch {
      return null;
    }
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("alumate_token");
        const storedUser = localStorage.getItem("alumate_user");

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          const tokenPayload = parseJwtPayload(storedToken);

          const tokenUserId = tokenPayload?.sub;
          const tokenRole = tokenPayload?.role;
          const isSameUser = !tokenUserId || parsedUser.id === tokenUserId;
          const isSameRole = !tokenRole || parsedUser.role === tokenRole;

          if (!isSameUser || !isSameRole) {
            clearAuthStorage();
            return;
          }

          setToken(storedToken);
          setUser(parsedUser);

          // Verify token is still valid with the backend
          try {
            const response = await authApi.me();
            if (response.success && response.data) {
              setUser(response.data.user);
              localStorage.setItem(
                "alumate_user",
                JSON.stringify(response.data.user)
              );
            }
          } catch (error: any) {
            // If backend explicitly rejects auth, clear stale auth state.
            if (error?.response?.status === 401 || error?.response?.status === 403) {
              clearAuthStorage();
            }
            // Backend might not be running yet — keep stored data
            // Token will be validated when backend is available
          }
        }
      } catch {
        // Error reading from localStorage
        clearAuthStorage();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [clearAuthStorage, parseJwtPayload]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("alumate_token", newToken);
        localStorage.setItem("alumate_user", JSON.stringify(userData));
        // Set cookie so Next.js middleware can read it for route protection
        document.cookie = `alumate_token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
      } else {
        throw new Error(response.message || "Login failed");
      }
    },
    []
  );

  const register = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password: string;
    }) => {
      const response = await authApi.register(data);

      if (!response.success) {
        throw new Error(response.message || "Registration failed");
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("alumate_token");
    localStorage.removeItem("alumate_user");
    // Clear the cookie too
    document.cookie = `alumate_token=; path=/; max-age=0`;

    // Try to call backend logout (fire & forget)
    authApi.logout().catch(() => {});

    window.location.href = "/login";
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("alumate_user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
