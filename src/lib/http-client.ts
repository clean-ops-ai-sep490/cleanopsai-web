type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface HttpClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
  refreshToken?: () => Promise<string>;
  onAuthFailure?: () => void;
}

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
}

class HttpClientError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown,
  ) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = "HttpClientError";
  }
}

class HttpClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private refreshToken?: () => Promise<string>;
  private onAuthFailure?: () => void;
  private refreshPromise: Promise<string> | null = null;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.getToken = config.getToken ?? (() => null);
    this.refreshToken = config.refreshToken;
    this.onAuthFailure = config.onAuthFailure;
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | null | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}/${path.replace(/^\/+/, "")}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async doFetch(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<Response> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      ...options?.headers,
    };

    // Don't set Content-Type for FormData - let the browser set it with boundary
    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(this.buildUrl(path, options?.params), {
      method,
      headers,
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
      signal: options?.signal,
    });
  }

  private async handleRefresh(): Promise<string> {
    // If a refresh is already in-flight, wait for it (deduplicates concurrent 401s)
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.refreshToken!().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      // If response is empty, return null instead of undefined for GET requests
      return null as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      // If JSON parsing fails, throw an error
      throw new Error(`Invalid JSON response: ${text}`);
    }
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    let response = await this.doFetch(method, path, body, options);

    // On 401 try to refresh the token once, then retry
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.handleRefresh();
        // Retry the request with new token
        response = await this.doFetch(method, path, body, options);
      } catch (refreshError) {
        // Refresh failed - clear tokens and throw
        this.onAuthFailure?.();
        throw new HttpClientError(
          401,
          "Không có quyền truy cập",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        );
      }
    }

    // Handle non-OK responses (including retry failures)
    if (!response.ok) {
      if (response.status === 401) {
        this.onAuthFailure?.();
      }

      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        try {
          errorBody = await response.text();
        } catch {
          errorBody = response.statusText;
        }
      }
      throw new HttpClientError(
        response.status,
        response.statusText,
        errorBody,
      );
    }

    return this.parseResponse<T>(response);
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>("GET", path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("POST", path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PUT", path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PATCH", path, body, options);
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, undefined, options);
  }
}

export { HttpClient, HttpClientError };
export type { HttpClientConfig, RequestOptions };
