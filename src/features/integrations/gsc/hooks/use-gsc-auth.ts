'use client';

/**
 * useGSCAuth Hook
 * @description Manages GSC OAuth connection state
 */

import { useState, useEffect, useCallback } from 'react';

interface GSCProperty {
  siteUrl: string;
  permissionLevel: 'siteOwner' | 'siteFullUser' | 'siteRestrictedUser';
}

interface GSCAuthState {
  isConnected: boolean;
  isLoading: boolean;
  properties: GSCProperty[];
  selectedProperty: string | null;
  lastSyncAt: Date | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  error: string | null;
}

// Mock data for development
const MOCK_PROPERTIES: GSCProperty[] = [
  { siteUrl: 'sc-domain:example.com', permissionLevel: 'siteOwner' },
  { siteUrl: 'https://blog.example.com/', permissionLevel: 'siteFullUser' },
];

export function useGSCAuth() {
  const [state, setState] = useState<GSCAuthState>({
    isConnected: false,
    isLoading: true,
    properties: [],
    selectedProperty: null,
    lastSyncAt: null,
    syncStatus: 'idle',
    error: null,
  });

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/integrations/gsc/status');
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          isConnected: data.isConnected ?? false,
          properties: data.properties ?? [],
          selectedProperty: data.selectedProperty ?? null,
          lastSyncAt: data.lastSyncAt ? new Date(data.lastSyncAt) : null,
          isLoading: false,
        }));
      } else {
        // API not ready - use mock for development
        setState(prev => ({
          ...prev,
          isConnected: false,
          isLoading: false,
        }));
      }
    } catch (error) {
      // Development mode - mock connected state
      console.log('GSC Status API not available, using mock data');
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
      const response = await fetch('/api/integrations/gsc/connect', {
        method: 'POST',
      });
      
      if (response.ok) {
        const { authUrl } = await response.json();
        if (authUrl) {
          window.location.href = authUrl;
        }
      }
    } catch (error) {
      console.error('Failed to initiate GSC connection:', error);
      setState(prev => ({ ...prev, error: 'Failed to connect' }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/integrations/gsc/disconnect', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setState({
          isConnected: false,
          isLoading: false,
          properties: [],
          selectedProperty: null,
          lastSyncAt: null,
          syncStatus: 'idle',
          error: null,
        });
      }
    } catch (error) {
      console.error('Failed to disconnect GSC:', error);
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
      const response = await fetch('/api/integrations/gsc/sync', {
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
      console.error('Failed to sync GSC data:', error);
      setState(prev => ({ 
        ...prev, 
        syncStatus: 'error',
        error: 'Sync failed' 
      }));
    }
  }, []);

  const selectProperty = useCallback(async (propertyUrl: string) => {
    setState(prev => ({ ...prev, selectedProperty: propertyUrl }));
    
    // Save selection to backend
    try {
      await fetch('/api/integrations/gsc/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedProperty: propertyUrl }),
      });
    } catch (error) {
      console.error('Failed to save property selection:', error);
    }
  }, []);

  const fetchProperties = useCallback(async () => {
    try {
      const response = await fetch('/api/integrations/gsc/properties');
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          properties: data.properties ?? [],
        }));
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    syncNow,
    selectProperty,
    fetchProperties,
    refresh: checkConnectionStatus,
  };
}
