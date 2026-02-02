// API Client - Fetch Wrapper

import type { ApiResponse, ApiRequestConfig } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Check for demo user first
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      return 'demo_token';
    }
    
    return localStorage.getItem('auth_token');
  }

  private async request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const { method, endpoint, data, params, headers } = config;
    
    // Build URL with params
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    // Build headers
    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...headers,
    };

    const token = this.getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: json.code || 'REQUEST_FAILED',
            message: json.message || 'Request failed',
            details: json.details,
          },
        };
      }

      return {
        success: true,
        data: json.data || json,
        meta: json.meta,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', endpoint, params });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', endpoint, data });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', endpoint, data });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', endpoint, data });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', endpoint });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };

// Convenience functions
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean>) => 
    apiClient.get<T>(endpoint, params),
  post: <T>(endpoint: string, data?: unknown) => 
    apiClient.post<T>(endpoint, data),
  put: <T>(endpoint: string, data?: unknown) => 
    apiClient.put<T>(endpoint, data),
  patch: <T>(endpoint: string, data?: unknown) => 
    apiClient.patch<T>(endpoint, data),
  delete: <T>(endpoint: string) => 
    apiClient.delete<T>(endpoint),
};
