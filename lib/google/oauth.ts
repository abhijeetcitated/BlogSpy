/**
 * Google OAuth Client
 * @description Handles OAuth flow for Google APIs
 */

import { GOOGLE_OAUTH_CONFIG, GOOGLE_API_ENDPOINTS, buildAuthUrl } from './config';
import type { GSCOAuthTokens } from '@/types/gsc.types';

// ============================================
// Types
// ============================================

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface TokenError {
  error: string;
  error_description?: string;
}

// ============================================
// OAuth Client Class
// ============================================

export class GoogleOAuthClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = GOOGLE_OAUTH_CONFIG.clientId;
    this.clientSecret = GOOGLE_OAUTH_CONFIG.clientSecret;
    this.redirectUri = GOOGLE_OAUTH_CONFIG.redirectUri;

    if (!this.clientId || !this.clientSecret) {
      console.warn('[GoogleOAuth] Missing client credentials. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars.');
    }
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  getAuthorizationUrl(scopes: string[], state: string): string {
    return buildAuthUrl(scopes, state);
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GSCOAuthTokens> {
    const response = await fetch(GOOGLE_API_ENDPOINTS.TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json() as TokenResponse | TokenError;

    if ('error' in data) {
      throw new Error(`OAuth Error: ${data.error} - ${data.error_description || 'Unknown error'}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || '',
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GSCOAuthTokens> {
    const response = await fetch(GOOGLE_API_ENDPOINTS.TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json() as TokenResponse | TokenError;

    if ('error' in data) {
      throw new Error(`Token Refresh Error: ${data.error} - ${data.error_description || 'Unknown error'}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Keep old refresh token if not returned
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  /**
   * Revoke access token
   */
  async revokeToken(token: string): Promise<void> {
    const response = await fetch(`${GOOGLE_API_ENDPOINTS.REVOKE}?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token Revocation Error: ${error}`);
    }
  }

  /**
   * Get user info from Google
   */
  async getUserInfo(accessToken: string): Promise<{ id: string; email: string; name: string }> {
    const response = await fetch(GOOGLE_API_ENDPOINTS.USERINFO, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(expiresAt: Date): boolean {
    // Add 5 minute buffer
    const bufferMs = 5 * 60 * 1000;
    return new Date().getTime() >= expiresAt.getTime() - bufferMs;
  }

  /**
   * Calculate token expiry date
   */
  calculateExpiryDate(expiresIn: number): Date {
    return new Date(Date.now() + expiresIn * 1000);
  }
}

// ============================================
// Singleton Instance
// ============================================

export const googleOAuthClient = new GoogleOAuthClient();
