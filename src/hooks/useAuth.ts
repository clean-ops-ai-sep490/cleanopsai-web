import { useEffect, useState, useCallback, useRef } from "react";
import { api, setTokens, clearTokens } from "@/lib/api";

// ================= TYPES =================
export type User = {
  userId: string;
  email: string;
  fullName: string;
  role: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  role: string;
};

export type UserDto = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: "Active" | "Locked";
};

export type PaginatedResult<T> = {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  content: T[];
};

// ================= HOOK =================
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  // ================= GET ME =================
  const getMe = useCallback(async (): Promise<User> => {
    return api.get<User>("/Auths/me");
  }, []);

  // ================= LOGIN =================
  const login = async (data: LoginRequest) => {
    const res = await api.post<TokenResponse>("/Auths/login", data);

    const { accessToken, refreshToken } = res;

    setTokens(accessToken, refreshToken);

    const me = await getMe();
    setUser(me);

    return me;
  };

  // ================= REGISTER =================
  const register = async (data: RegisterRequest) => {
    return api.post("/Auths/register", data);
  };

  // ================= LOGOUT =================
  const logout = async () => {
    clearTokens();
    setUser(null);
  };

  // ================= REFRESH TOKEN =================
  const refreshToken = async (refreshToken: string) => {
    const res = await api.post<TokenResponse>("/Auths/refresh", {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefresh } = res;

    setTokens(accessToken, newRefresh);

    return res;
  };

  // ================= FORGOT PASSWORD =================
  const forgotPassword = async (email: string) => {
    return api.post("/Auths/forgot-password", { email });
  };

  // ================= VERIFY OTP =================
  const verifyOtp = async (email: string, otpCode: string) => {
    const res = await api.post<{ token: string }>("/Auths/verify-otp", {
      email,
      otpCode,
    });

    return res.token;
  };

  // ================= RESET PASSWORD =================
  const resetPassword = async (
    email: string,
    token: string,
    newPassword: string,
  ) => {
    return api.post("/Auths/reset-password", {
      email,
      token,
      newPassword,
    });
  };

  // ================= USER MANAGEMENT =================

  const getUsers = async (params?: {
    keyword?: string;
    role?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<UserDto>> => {
    return api.get("/Auths/users", { params });
  };

  const getUserById = async (userId: string): Promise<UserDto> => {
    return api.get(`/Auths/users/${userId}`);
  };

  const updateUser = async (
    userId: string,
    data: { fullName: string; role: string },
  ): Promise<UserDto> => {
    return api.put(`/Auths/users/${userId}`, data);
  };

  const deleteUser = async (userId: string): Promise<UserDto> => {
    return api.delete(`/Auths/users/${userId}`);
  };

  const unlockUser = async (userId: string): Promise<UserDto> => {
    return api.post(`/Auths/users/${userId}/unlock`);
  };

  const getSupervisors = async (params?: {
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<UserDto>> => {
    return api.get("/Auths/supervisors", { params });
  };

  // ================= INIT LOAD USER =================
  const fetchCurrentUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setLoading(false);
    }
  }, [getMe]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return {
    // auth state
    user,
    loading,
    isAuthenticated: !!user,

    // auth actions
    login,
    register,
    logout,
    refreshToken,

    // password
    forgotPassword,
    verifyOtp,
    resetPassword,

    // user management
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    unlockUser,
    getSupervisors,

    // utils
    refetchUser: fetchCurrentUser,
  };
}
