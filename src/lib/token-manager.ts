const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export class TokenManager {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const BASE_URL =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

    const response = await fetch(`${BASE_URL}/Auths/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("Refresh failed");

    const data = await response.json();
    this.setAccessToken(data.accessToken);
    if (data.refreshToken) {
      this.setRefreshToken(data.refreshToken);
    }
    return data.accessToken;
  }
}

// Create singleton instance
export const tokenManager = new TokenManager();

// Export individual functions for backward compatibility
export const getAccessToken = () => tokenManager.getAccessToken();
export const setAccessToken = (token: string) =>
  tokenManager.setAccessToken(token);
export const getRefreshToken = () => tokenManager.getRefreshToken();
export const setRefreshToken = (token: string) =>
  tokenManager.setRefreshToken(token);
export const setTokens = (accessToken: string, refreshToken: string) =>
  tokenManager.setTokens(accessToken, refreshToken);
export const clearTokens = () => tokenManager.clearTokens();
