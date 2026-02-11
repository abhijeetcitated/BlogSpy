/**
 * Services Barrel Export
 * Central export point for global, client-safe services.
 */

// API Client
export { apiClient, configureApiClient } from "./api-client"
export type { ApiClientConfig, RequestOptions, ApiResponse, ApiError } from "./api-client"

// Auth Service
export { authService } from "./auth.service"
export type { User, AuthResponse, LoginCredentials, RegisterCredentials } from "./auth.service"


// NOTE: Server-only services (alerts, integrations, decay detection)
// should be imported directly to avoid client bundle pollution.
