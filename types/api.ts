// API Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

// API Endpoints
export type ApiEndpoint =
  | '/api/auth/login'
  | '/api/auth/register'
  | '/api/auth/logout'
  | '/api/user'
  | '/api/user/profile'
  | '/api/user/credits'
  | '/api/keywords'
  | '/api/keywords/research'
  | '/api/keywords/trends'
  | '/api/projects'
  | '/api/projects/:id'
  | '/api/rankings'
  | '/api/rankings/history'
  | '/api/ai/generate'
  | '/api/billing/subscribe'
  | '/api/billing/portal';

// Request/Response types for specific endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface KeywordResearchRequest {
  seed: string;
  limit?: number;
  filters?: {
    minVolume?: number;
    maxVolume?: number;
    minDifficulty?: number;
    maxDifficulty?: number;
  };
}

export interface AIGenerateRequest {
  type: 'outline' | 'draft' | 'improve' | 'expand';
  content?: string;
  keyword?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
}

export interface AIGenerateResponse {
  content: string;
  tokens: number;
  creditsUsed: number;
}
