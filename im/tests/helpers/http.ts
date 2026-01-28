/**
 * E2E 测试 HTTP 客户端辅助工具
 */

export interface HttpResponse<T = unknown> {
  status: number;
  data: T;
  headers: Headers;
}

export interface ApiResponse<T = unknown> {
  code: string;
  message?: string;
  data: T;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  token?: string;
}

/**
 * 创建 HTTP 客户端
 */
export function createHttpClient(baseUrl: string) {
  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // 处理 204 No Content 响应
    let data: T;
    if (response.status === 204) {
      data = null as T;
    } else {
      const text = await response.text();
      data = text ? (JSON.parse(text) as T) : (null as T);
    }

    return {
      status: response.status,
      data,
      headers: response.headers,
    };
  }

  return {
    get<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
      return request<T>("GET", path, undefined, options);
    },

    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<HttpResponse<T>> {
      return request<T>("POST", path, body, options);
    },

    put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<HttpResponse<T>> {
      return request<T>("PUT", path, body, options);
    },

    patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<HttpResponse<T>> {
      return request<T>("PATCH", path, body, options);
    },

    delete<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
      return request<T>("DELETE", path, undefined, options);
    },
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
