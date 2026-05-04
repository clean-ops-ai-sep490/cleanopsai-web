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
  const result = await api.post<AuthTokenResponse>("/Auths/login", data);
  setTokens(result.accessToken, result.refreshToken);
  return result;
}

export async function registerUser(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  return api.post<RegisterResponse>("/Auths/register", data);
}

export async function getMe(): Promise<User> {
  return api.get<User>("/Auths/me");
}

export async function logoutUser(): Promise<void> {
  // Clear local tokens immediately. No backend call needed for this architecture.
  clearTokens();
}
