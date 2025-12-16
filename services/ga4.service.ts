// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Google Analytics 4 Service
 * @description Service layer for GA4 integration with database operations
 * 
 * NOTE: @ts-nocheck is temporary until real Supabase client is installed
 */

import { createClient } from '@/lib/supabase/server';
import { googleOAuthClient, createGA4Client, GOOGLE_SCOPES } from '@/lib/google';
import type {
  GA4Integration,
  GA4Property,
  GA4ConnectionStatus,
  GA4CachedData,
  GA4SyncJob,
  GA4ComparisonData,
} from '@/types/ga4.types';

// ============================================
// GA4 Service Class
// ============================================

export class GA4Service {
  /**
   * Get or create Supabase client for server-side operations
   */
  private async getSupabase() {
    return await createClient();
  }

  /**
   * Get GA4 integration for a user
   */
  async getIntegration(userId: string): Promise<GA4Integration | null> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google_ga4')
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(data.expires_at),
      selectedPropertyId: data.selected_property,
      properties: data.properties || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Save or update GA4 integration
   */
  async saveIntegration(
    userId: string,
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    },
    properties?: GA4Property[]
  ): Promise<GA4Integration> {
    const supabase = await this.getSupabase();
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

    const { data, error } = await supabase
      .from('user_integrations')
      .upsert(
        {
          user_id: userId,
          provider: 'google_ga4',
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_at: expiresAt.toISOString(),
          properties: properties || [],
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,provider',
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save GA4 integration: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(data.expires_at),
      selectedPropertyId: data.selected_property,
      properties: data.properties || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken(userId: string): Promise<string | null> {
    const integration = await this.getIntegration(userId);
    
    if (!integration) {
      return null;
    }

    // Check if token is expired
    if (googleOAuthClient.isTokenExpired(integration.expiresAt)) {
      // Refresh the token
      try {
        const newTokens = await googleOAuthClient.refreshAccessToken(integration.refreshToken);
        
        // Save new tokens
        await this.saveIntegration(userId, {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresIn: newTokens.expiresIn,
        });

        return newTokens.accessToken;
      } catch (error) {
        console.error('[GA4Service] Failed to refresh token:', error);
        return null;
      }
    }

    return integration.accessToken;
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(userId: string): Promise<GA4ConnectionStatus> {
    const integration = await this.getIntegration(userId);
    const supabase = await this.getSupabase();

    if (!integration) {
      return {
        isConnected: false,
        selectedPropertyId: null,
        selectedPropertyName: null,
        lastSyncAt: null,
        properties: [],
      };
    }

    // Get selected property name
    const selectedProperty = integration.properties.find(
      (p) => p.propertyId === integration.selectedPropertyId
    );

    // Get last sync
    const { data: lastSync } = await supabase
      .from('ga4_sync_jobs')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    return {
      isConnected: true,
      selectedPropertyId: integration.selectedPropertyId,
      selectedPropertyName: selectedProperty?.displayName || null,
      lastSyncAt: lastSync?.completed_at ? new Date(lastSync.completed_at) : null,
      properties: integration.properties,
    };
  }

  /**
   * Update selected property
   */
  async selectProperty(userId: string, propertyId: string): Promise<void> {
    const supabase = await this.getSupabase();

    const { error } = await supabase
      .from('user_integrations')
      .update({
        selected_property: propertyId,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'google_ga4');

    if (error) {
      throw new Error(`Failed to update selected property: ${error.message}`);
    }
  }

  /**
   * Fetch and update properties from GA4
   */
  async refreshProperties(userId: string): Promise<GA4Property[]> {
    const accessToken = await this.getValidAccessToken(userId);
    
    if (!accessToken) {
      throw new Error('No valid access token');
    }

    const ga4Client = createGA4Client(accessToken);
    const properties = await ga4Client.getProperties();

    // Update in database
    const supabase = await this.getSupabase();
    await supabase
      .from('user_integrations')
      .update({
        properties,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'google_ga4');

    return properties;
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(state: string): string {
    return googleOAuthClient.getAuthorizationUrl(GOOGLE_SCOPES.GA4, state);
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(userId: string, code: string): Promise<GA4Integration> {
    // Exchange code for tokens
    const tokens = await googleOAuthClient.exchangeCodeForTokens(code);

    // Create GA4 client and fetch properties
    const ga4Client = createGA4Client(tokens.accessToken);
    const properties = await ga4Client.getProperties();

    // Save integration
    return this.saveIntegration(
      userId,
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
      properties
    );
  }

  /**
   * Disconnect GA4 integration
   */
  async disconnect(userId: string): Promise<void> {
    const integration = await this.getIntegration(userId);
    
    if (integration) {
      // Revoke token
      try {
        await googleOAuthClient.revokeToken(integration.accessToken);
      } catch (error) {
        console.warn('[GA4Service] Failed to revoke token:', error);
      }
    }

    // Delete from database
    const supabase = await this.getSupabase();
    await supabase
      .from('user_integrations')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'google_ga4');

    // Delete cached data
    await supabase.from('ga4_data').delete().eq('user_id', userId);
    await supabase.from('ga4_sync_jobs').delete().eq('user_id', userId);
  }

  /**
   * Get comparison data for decay detection
   */
  async getComparisonData(
    userId: string,
    currentDays: number = 30,
    previousDays: number = 30
  ): Promise<GA4ComparisonData[]> {
    const accessToken = await this.getValidAccessToken(userId);
    const integration = await this.getIntegration(userId);

    if (!accessToken || !integration?.selectedPropertyId) {
      throw new Error('GA4 not connected or no property selected');
    }

    const ga4Client = createGA4Client(accessToken);
    return ga4Client.getComparisonData(integration.selectedPropertyId, currentDays, previousDays);
  }

  /**
   * Get top declining pages
   */
  async getTopDecliningPages(
    userId: string,
    limit: number = 20
  ): Promise<GA4ComparisonData[]> {
    const accessToken = await this.getValidAccessToken(userId);
    const integration = await this.getIntegration(userId);

    if (!accessToken || !integration?.selectedPropertyId) {
      throw new Error('GA4 not connected or no property selected');
    }

    const ga4Client = createGA4Client(accessToken);
    return ga4Client.getTopDecliningPages(integration.selectedPropertyId, limit);
  }
}

// ============================================
// Singleton Instance
// ============================================

export const ga4Service = new GA4Service();
