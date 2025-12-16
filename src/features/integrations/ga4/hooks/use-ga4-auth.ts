'use client';

/**
 * useGA4Auth Hook
 * @description Manages GA4 OAuth connection state
 */

import { useState, useEffect, useCallback } from 'react';

interface GA4Property {
  propertyId: string;
  displayName: string;
  websiteUrl?: string;
}

interface GA4AuthState {
  isConnected: boolean;
  isLoading: boolean;
  properties: GA4Property[];
  selectedProperty: string | null;
  selectedPropertyName: string | null;
  lastSyncAt: Date | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  error: string | null;
}

export function useGA4Auth() {
  const [state, setState] = useState<GA4AuthState>({
    isConnected: false,
    isLoading: true,
    properties: [],
    selectedProperty: null,
    selectedPropertyName: null,
    lastSyncAt: null,
    syncStatus: 'idle',
    error: null,
  });

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/integrations/ga4/status');
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          isConnected: data.isConnected ?? false,
          properties: data.properties ?? [],
          selectedProperty: data.selectedProperty ?? null,
          selectedPropertyName: data.selectedPropertyName ?? null,
          lastSyncAt: data.lastSyncAt ? new Date(data.lastSyncAt) : null,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.log('GA4 Status API not available, using mock data');
      setState(prev => ({
        ...prev,
        isConnected: false,
        properties: [],
        isLoading: false,
      }));
    }
  };

  const connect = useCallback(async () => {
    try {
      const response = await fetch('/api/integrations/ga4/connect', {
        method: 'POST',
      });
      
      if (response.ok) {
        const { authUrl } = await response.json();
        if (authUrl) {
          window.location.href = authUrl;
        }
      }
    } catch (error) {
      console.error('Failed to initiate GA4 connection:', error);
      setState(prev => ({ ...prev, error: 'Failed to connect' }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/integrations/ga4/disconnect', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setState({
          isConnected: false,
          isLoading: false,
          properties: [],
          selectedProperty: null,
          selectedPropertyName: null,
          lastSyncAt: null,
          syncStatus: 'idle',
          error: null,
        });
      }
    } catch (error) {
      console.error('Failed to disconnect GA4:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Failed to disconnect' 
      }));
    }
  }, []);

  const syncNow = useCallback(async () => {
    setState(prev => ({ ...prev, syncStatus: 'syncing' }));
    
    try {
      const response = await fetch('/api/integrations/ga4/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      });
      
      if (response.ok) {
        setState(prev => ({
          ...prev,
          syncStatus: 'idle',
          lastSyncAt: new Date(),
        }));
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Failed to sync GA4 data:', error);
      setState(prev => ({ 
        ...prev, 
        syncStatus: 'error',
        error: 'Sync failed' 
      }));
    }
  }, []);

  const selectProperty = useCallback(async (propertyId: string) => {
    const property = state.properties.find(p => p.propertyId === propertyId);
    setState(prev => ({ 
      ...prev, 
      selectedProperty: propertyId,
      selectedPropertyName: property?.displayName ?? null,
    }));
    
    try {
      await fetch('/api/integrations/ga4/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedProperty: propertyId }),
      });
    } catch (error) {
      console.error('Failed to save property selection:', error);
    }
  }, [state.properties]);

  return {
    ...state,
    connect,
    disconnect,
    syncNow,
    selectProperty,
    refresh: checkConnectionStatus,
  };
}
