"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getAccessToken, clearTokens } from "@/lib/api";
import { loginUser, registerUser, logoutUser, getMe } from "@/lib/auth-api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthTokenResponse,
  RegisterResponse,
  User,
} from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<AuthTokenResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await getMe();
      console.log("=== AuthContext: User fetched ===");
      console.log("User data from API:", me);
      console.log("User role:", me.role, `(type: ${typeof me.role})`);
      console.log("================================");
      setUser(me);
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async (data: LoginRequest) => {
      const result = await loginUser(data);
      await fetchUser();
      return result;
    },
    [fetchUser],
  );

  const register = useCallback(async (data: RegisterRequest) => {
    return registerUser(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      // Redirect to login page after logout
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
