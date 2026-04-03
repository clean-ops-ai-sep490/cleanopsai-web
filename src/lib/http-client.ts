type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface HttpClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
  refreshToken?: () => Promise<string>;
  onAuthFailure?: () => void;
}

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
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

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}/${path.replace(/^\/+/, "")}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.set(key, value),
      );
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
      "Content-Type": "application/json",
      ...options?.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(this.buildUrl(path, options?.params), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });
  }

  private async handleRefresh(): Promise<string> {
    // If a refresh is already in-flight, wait for it (deduplicates concurrent 401s)
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.refreshToken!()
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }
    return response.json() as Promise<T>;
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const response = await this.doFetch(method, path, body, options);

    // On 401 try to refresh the token once, then retry
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.handleRefresh();
      } catch {
        this.onAuthFailure?.();
        throw new HttpClientError(401, response.statusText, await response.text());
      }

      const retry = await this.doFetch(method, path, body, options);

      if (!retry.ok) {
        if (retry.status === 401) {
          this.onAuthFailure?.();
        }
        let errorBody: unknown;
        try { errorBody = await retry.json(); } catch { errorBody = await retry.text(); }
        throw new HttpClientError(retry.status, retry.statusText, errorBody);
      }

      return this.parseResponse<T>(retry);
    }

    if (!response.ok) {
      let errorBody: unknown;
      try { errorBody = await response.json(); } catch { errorBody = await response.text(); }
      throw new HttpClientError(response.status, response.statusText, errorBody);
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
