import { HttpClient } from "./http-client";
import { tokenManager } from "./token-manager";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const api = new HttpClient({
  baseUrl: BASE_URL,
  getToken: () => tokenManager.getAccessToken(),
  refreshToken: () => tokenManager.refreshAccessToken(),
  onAuthFailure: () => tokenManager.clearTokens(),
});

// Re-export token functions for backward compatibility
export {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  setTokens,
  clearTokens,
} from "./token-manager";
