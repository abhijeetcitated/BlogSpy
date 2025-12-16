'use client';

/**
 * GA4 Connection Card Component
 * @description Full card for GA4 integration in settings page
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  BarChart3, 
  RefreshCw, 
  Unlink, 
  Settings2,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { ConnectGA4Button } from './ConnectGA4Button';
import { GA4ConnectionStatus } from './GA4ConnectionStatus';
import { GA4PropertySelector } from './GA4PropertySelector';
import { useGA4Auth } from '../hooks/use-ga4-auth';

export function GA4ConnectionCard() {
  const { 
    isConnected, 
    isLoading, 
    properties, 
    selectedProperty,
    selectedPropertyName,
    lastSyncAt,
    syncStatus,
    disconnect,
    syncNow,
    selectProperty,
  } = useGA4Auth();
  
  const [showPropertySelector, setShowPropertySelector] = useState(false);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      console.log('Google Analytics 4 has been disconnected.');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect. Please try again.');
    }
  };

  const handleSync = async () => {
    try {
      await syncNow();
      console.log('GA4 data sync has been initiated.');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Failed to sync data. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Google Analytics 4</CardTitle>
              <CardDescription>
                Connect to get traffic and engagement data
              </CardDescription>
            </div>
          </div>
          <GA4ConnectionStatus
            isConnected={isConnected}
            lastSyncAt={lastSyncAt}
            syncStatus={syncStatus}
            propertyName={selectedPropertyName ?? undefined}
          />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isConnected ? (
          <div className="space-y-4">
            {/* Connected State */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Connected and syncing automatically every 6 hours</span>
            </div>

            {/* Property Selector */}
            {showPropertySelector && properties.length > 0 && (
              <GA4PropertySelector
                properties={properties}
                selectedProperty={selectedProperty ?? undefined}
                onSelect={(property) => {
                  selectProperty(property);
                  setShowPropertySelector(false);
                }}
              />
            )}

            {/* Data Summary */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-orange-600">3.2K</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-green-600">8.5K</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-blue-600">2:45</div>
                <div className="text-xs text-muted-foreground">Avg Duration</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="text-muted-foreground">
              <XCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Connect your Google Analytics 4 to enable:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Traffic-based decay detection</li>
                <li>• User engagement tracking</li>
                <li>• Conversion monitoring</li>
              </ul>
            </div>
            <ConnectGA4Button variant="default" size="lg" />
          </div>
        )}
      </CardContent>

      {isConnected && (
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPropertySelector(!showPropertySelector)}
            >
              <Settings2 className="h-4 w-4 mr-1" />
              Change Property
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Unlink className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect Google Analytics 4?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will stop syncing data from GA4. Your historical data will be preserved,
                  but decay detection will no longer have access to real-time traffic data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground">
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
}
