'use client';

/**
 * GSC Connection Status Component
 * @description Shows the current GSC connection status with sync info
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, RefreshCw, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GSCConnectionStatusProps {
  isConnected: boolean;
  lastSyncAt?: Date | string | null;
  syncStatus?: 'idle' | 'syncing' | 'error';
  propertyUrl?: string;
}

export function GSCConnectionStatus({
  isConnected,
  lastSyncAt,
  syncStatus = 'idle',
  propertyUrl,
}: GSCConnectionStatusProps) {
  const getStatusIcon = () => {
    if (!isConnected) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (syncStatus === 'syncing') {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (syncStatus === 'error') {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!isConnected) return 'Not Connected';
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'error') return 'Sync Error';
    return 'Connected';
  };

  const getStatusVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!isConnected) return 'destructive';
    if (syncStatus === 'syncing') return 'secondary';
    if (syncStatus === 'error') return 'destructive';
    return 'default';
  };

  const formatLastSync = () => {
    if (!lastSyncAt) return 'Never synced';
    const date = typeof lastSyncAt === 'string' ? new Date(lastSyncAt) : lastSyncAt;
    return `Last synced ${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
      </div>
      
      {isConnected && (
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground ml-6">
          {propertyUrl && (
            <span className="font-medium">{propertyUrl.replace('sc-domain:', '').replace(/^https?:\/\//, '')}</span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatLastSync()}
          </span>
        </div>
      )}
    </div>
  );
}
