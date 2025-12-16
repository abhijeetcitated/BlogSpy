// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Google Search Console Service
 * @description Service layer for GSC integration with database operations
 * 
 * NOTE: @ts-nocheck is temporary until real Supabase client is installed
 */

import { createClient } from '@/lib/supabase/server';
import { googleOAuthClient, createGSCClient, GOOGLE_SCOPES } from '@/lib/google';
import type {
  GSCIntegration,
  GSCProperty,
  GSCConnectionStatus,
  GSCCachedData,
  GSCSyncJob,
  GSCComparisonData,
} from '@/types/gsc.types';

// ============================================
// GSC Service Class
// ============================================

export class GSCService {
  /**
   * Get or create Supabase client for server-side operations
   */
  private async getSupabase() {
    return await createClient();
  }

  /**
   * Get GSC integration for a user
   */
  async getIntegration(userId: string): Promise<GSCIntegration | null> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google_gsc')
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
      selectedProperty: data.selected_property,
      properties: data.properties || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Save or update GSC integration
   */
  async saveIntegration(
    userId: string,
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    },
    properties?: GSCProperty[]
  ): Promise<GSCIntegration> {
    const supabase = await this.getSupabase();
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

    const { data, error } = await supabase
      .from('user_integrations')
      .upsert(
        {
          user_id: userId,
          provider: 'google_gsc',
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
      throw new Error(`Failed to save GSC integration: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(data.expires_at),
      selectedProperty: data.selected_property,
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
        console.error('[GSCService] Failed to refresh token:', error);
        return null;
      }
    }

    return integration.accessToken;
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(userId: string): Promise<GSCConnectionStatus> {
    const integration = await this.getIntegration(userId);
    const supabase = await this.getSupabase();

    if (!integration) {
      return {
        isConnected: false,
        selectedProperty: null,
        lastSyncAt: null,
        properties: [],
      };
    }

    // Get last sync
    const { data: lastSync } = await supabase
      .from('gsc_sync_jobs')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    return {
      isConnected: true,
      selectedProperty: integration.selectedProperty,
      lastSyncAt: lastSync?.completed_at ? new Date(lastSync.completed_at) : null,
      properties: integration.properties,
    };
  }

  /**
   * Update selected property
   */
  async selectProperty(userId: string, siteUrl: string): Promise<void> {
    const supabase = await this.getSupabase();

    const { error } = await supabase
      .from('user_integrations')
      .update({
        selected_property: siteUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'google_gsc');

    if (error) {
      throw new Error(`Failed to update selected property: ${error.message}`);
    }
  }

  /**
   * Fetch and update properties from GSC
   */
  async refreshProperties(userId: string): Promise<GSCProperty[]> {
    const accessToken = await this.getValidAccessToken(userId);
    
    if (!accessToken) {
      throw new Error('No valid access token');
    }

    const gscClient = createGSCClient(accessToken);
    const properties = await gscClient.getProperties();

    // Update in database
    const supabase = await this.getSupabase();
    await supabase
      .from('user_integrations')
      .update({
        properties,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'google_gsc');

    return properties;
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(state: string): string {
    return googleOAuthClient.getAuthorizationUrl(GOOGLE_SCOPES.GSC, state);
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(userId: string, code: string): Promise<GSCIntegration> {
    // Exchange code for tokens
    const tokens = await googleOAuthClient.exchangeCodeForTokens(code);

    // Create GSC client and fetch properties
    const gscClient = createGSCClient(tokens.accessToken);
    const properties = await gscClient.getProperties();

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
   * Disconnect GSC integration
   */
  async disconnect(userId: string): Promise<void> {
    const integration = await this.getIntegration(userId);
    
    if (integration) {
      // Revoke token
      try {
        await googleOAuthClient.revokeToken(integration.accessToken);
      } catch (error) {
        console.warn('[GSCService] Failed to revoke token:', error);
      }
    }

    // Delete from database
    const supabase = await this.getSupabase();
    await supabase
      .from('user_integrations')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'google_gsc');

    // Delete cached data
    await supabase.from('gsc_data').delete().eq('user_id', userId);
    await supabase.from('gsc_sync_jobs').delete().eq('user_id', userId);
  }

  /**
   * Get comparison data for decay detection
   */
  async getComparisonData(
    userId: string,
    currentDays: number = 30,
    previousDays: number = 30
  ): Promise<GSCComparisonData[]> {
    const accessToken = await this.getValidAccessToken(userId);
    const integration = await this.getIntegration(userId);

    if (!accessToken || !integration?.selectedProperty) {
      throw new Error('GSC not connected or no property selected');
    }

    const gscClient = createGSCClient(accessToken);
    return gscClient.getComparisonData(integration.selectedProperty, currentDays, previousDays);
  }

  /**
   * Get top declining pages
   */
  async getTopDecliningPages(
    userId: string,
    limit: number = 20
  ): Promise<GSCComparisonData[]> {
    const accessToken = await this.getValidAccessToken(userId);
    const integration = await this.getIntegration(userId);

    if (!accessToken || !integration?.selectedProperty) {
      throw new Error('GSC not connected or no property selected');
    }

    const gscClient = createGSCClient(accessToken);
    return gscClient.getTopDecliningPages(integration.selectedProperty, limit);
  }

  /**
   * Create sync job
   */
  async createSyncJob(
    userId: string,
    property: string,
    startDate: string,
    endDate: string
  ): Promise<GSCSyncJob> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('gsc_sync_jobs')
      .insert({
        user_id: userId,
        property,
        status: 'pending',
        start_date: startDate,
        end_date: endDate,
        rows_processed: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create sync job: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      property: data.property,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      rowsProcessed: data.rows_processed,
      error: data.error,
      startedAt: data.started_at ? new Date(data.started_at) : null,
      completedAt: data.completed_at ? new Date(data.completed_at) : null,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Update sync job status
   */
  async updateSyncJob(
    jobId: string,
    update: Partial<{
      status: 'running' | 'completed' | 'failed';
      rowsProcessed: number;
      error: string;
      startedAt: Date;
      completedAt: Date;
    }>
  ): Promise<void> {
    const supabase = await this.getSupabase();

    const { error } = await supabase
      .from('gsc_sync_jobs')
      .update({
        ...(update.status && { status: update.status }),
        ...(update.rowsProcessed !== undefined && { rows_processed: update.rowsProcessed }),
        ...(update.error && { error: update.error }),
        ...(update.startedAt && { started_at: update.startedAt.toISOString() }),
        ...(update.completedAt && { completed_at: update.completedAt.toISOString() }),
      })
      .eq('id', jobId);

    if (error) {
      throw new Error(`Failed to update sync job: ${error.message}`);
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

export const gscService = new GSCService();
