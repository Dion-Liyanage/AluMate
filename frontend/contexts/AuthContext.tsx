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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("alumate_token");
        const storedUser = localStorage.getItem("alumate_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

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
          } catch {
            // Backend might not be running yet — keep stored data
            // Token will be validated when backend is available
          }
        }
      } catch {
        // Error reading from localStorage
        localStorage.removeItem("alumate_token");
        localStorage.removeItem("alumate_user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("alumate_token", newToken);
        localStorage.setItem("alumate_user", JSON.stringify(userData));
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

    // Try to call backend logout (fire & forget)
    authApi.logout().catch(() => {});

    window.location.href = "/login";
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
