import { api, setTokens, clearTokens } from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthTokenResponse,
  RegisterResponse,
  User,
} from "@/types/auth";

export async function loginUser(
  data: LoginRequest,
): Promise<AuthTokenResponse> {
  const result = await api.post<AuthTokenResponse>("api/Auths/login", data);
  setTokens(result.accessToken, result.refreshToken);
  return result;
}

export async function registerUser(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  return api.post<RegisterResponse>("api/Auths/register", data);
}

export async function getMe(): Promise<User> {
  return api.get<User>("api/Auths/me");
}

export async function logoutUser(): Promise<void> {
  try {
    // Call backend logout endpoint to invalidate tokens on server
    await api.post("api/Auths/logout", {});
  } catch (error) {
    // Even if backend call fails, we still clear local tokens
    console.warn("Backend logout failed, clearing local tokens anyway:", error);
  } finally {
    // Always clear local tokens
    clearTokens();
  }
}
